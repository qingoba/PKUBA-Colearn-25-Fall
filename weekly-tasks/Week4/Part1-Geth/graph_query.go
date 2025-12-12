package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"time"
)

// ------------------------------------------------
// ⚠️ 关键配置：Graph API URL 和代理
// ------------------------------------------------

const (
	// ⚠️ 请替换为你的 The Graph API URL
	// 格式: https://gateway-arbitrum.network.thegraph.com/api/[YOUR_API_KEY]/subgraphs/id/[SUBGRAPH_ID]
	// 获取方式: 访问 https://thegraph.com/studio/ 获取 API Key
	GraphURL = "https://gateway-arbitrum.network.thegraph.com/api/YOUR_API_KEY/subgraphs/id/HUZDsRpEVP2AvzDCyzDHtdc64dyDxx8FQjzsmqSg4H3B"

	// ⚠️ 请根据你的代理软件修改端口号
	// 常见代理端口：
	//   - Clash: 7890 (HTTP), 7891 (SOCKS5)
	//   - V2Ray: 10808 (HTTP), 10809 (SOCKS5)
	//   - Shadowsocks: 1080 (SOCKS5)
	// 如果不需要代理，可以设为空字符串 ""
	PROXY_PORT = "YOUR_PROXY_PORT"

	// 设置较大的超时时间，应对代理连接延迟
	CONNECTION_TIMEOUT = 45 * time.Second

	// 调试模式：打印查询和响应（用于排查问题）
	DEBUG_MODE = false

	// 重试配置
	MAX_RETRIES = 3              // 最大重试次数
	RETRY_DELAY = 2 * time.Second // 重试延迟
)

// 1. 定义数据结构 (根据 GraphQL Schema)
// 这里的结构必须与你的 Query 返回结果严格一致
type Response struct {
	Data struct {
		Pools []Pool `json:"pools"`
	} `json:"data"`
	Errors []struct {
		Message string `json:"message"`
	} `json:"errors,omitempty"` // GraphQL 错误信息
}

type Pool struct {
	ID      string `json:"id"`
	Token0  struct {
		Symbol string `json:"symbol"`
	} `json:"token0"`
	Token1  struct {
		Symbol string `json:"symbol"`
	} `json:"token1"`
	FeeTier string `json:"feeTier"`
}

// 查询结果结构（用于重试函数返回）
type QueryResult struct {
	Pools  []Pool
	Errors []struct {
		Message string `json:"message"`
	}
}

func main() {
	log.Println("开始配置代理并连接到 The Graph API")

	// 1. 配置代理（如果需要）
	var transport *http.Transport
	if PROXY_PORT != "" && PROXY_PORT != "YOUR_PROXY_PORT" {
		proxyUrlString := fmt.Sprintf("http://127.0.0.1:%s", PROXY_PORT)
		proxyUrl, err := url.Parse(proxyUrlString)
		if err != nil {
			log.Fatalf("解析代理 URL 失败: %v", err)
		}
		transport = &http.Transport{
			Proxy: http.ProxyURL(proxyUrl),
		}
	} else {
		transport = &http.Transport{}
	}

	// 3. 创建自定义 HTTP 客户端，设置超时，并使用代理传输器
	client := &http.Client{
		Transport: transport,
		Timeout:   CONNECTION_TIMEOUT,
	}

	log.Println("✅ 代理配置成功，开始连接 The Graph API")

	// 先做一个测试查询，验证 Subgraph 是否可用
	fmt.Println("🔍 测试连接...")
	testQuery := `
	{
		pools(first: 1) {
			id
		}
	}`
	
	reqBody, _ := json.Marshal(map[string]string{"query": testQuery})
	testResp, err := client.Post(GraphURL, "application/json", bytes.NewBuffer(reqBody))
	if err != nil {
		log.Fatalf("测试连接失败: %v", err)
	}
	defer testResp.Body.Close()
	
	testBody, _ := io.ReadAll(testResp.Body)
	var testResult Response
	if err := json.Unmarshal(testBody, &testResult); err != nil {
		log.Fatalf("测试响应解析失败: %v\n响应: %s", err, string(testBody))
	}
	
	if len(testResult.Errors) > 0 {
		log.Printf("⚠️  测试查询发现错误:")
		for _, e := range testResult.Errors {
			log.Printf("  - %s", e.Message)
		}
		log.Fatalf("请检查 Subgraph URL 和查询语法是否正确")
	}
	
	if len(testResult.Data.Pools) == 0 {
		log.Printf("⚠️  警告: 测试查询返回 0 条数据")
		log.Printf("可能的原因:")
		log.Printf("  1. Subgraph 中没有 pools 数据")
		log.Printf("  2. 实体名称不正确（可能应该是 pool 而不是 pools）")
		log.Printf("  3. 需要添加过滤条件")
		log.Printf("继续尝试完整查询...\n")
	} else {
		fmt.Printf("✅ 连接成功，找到 %d 个 Pool\n\n", len(testResult.Data.Pools))
	}

	// Cursor-based Pagination 实现
	lastID := "" // 游标初始化为空，表示从第一条开始
	totalCount := 0
	requestCount := 0
	startTime := time.Now()

	fmt.Println("🚀 开始使用 Cursor-based Pagination 全量拉取 Uniswap Pools...")
	fmt.Println("💡 核心原理：使用 id_gt 条件，利用数据库索引实现高效分页\n")

	for {
		// 构造 GraphQL Query
		// 核心技巧: 
		//   - 第一页：不设置 where 条件（lastID 为空）
		//   - 后续页：使用 where: { id_gt: lastID } 过滤
		//   - 必须配合 orderBy: id 和 orderDirection: asc 使用
		var query string
		if lastID == "" {
			// 第一页：不需要 where 条件
			query = `
			{
				pools(
					first: 1000,
					orderBy: id,
					orderDirection: asc
				) {
					id
					feeTier
					token0 { symbol }
					token1 { symbol }
				}
			}`
		} else {
			// 后续页：使用游标过滤
			query = fmt.Sprintf(`
			{
				pools(
					first: 1000,
					orderBy: id,
					orderDirection: asc,
					where: { id_gt: "%s" }
				) {
					id
					feeTier
					token0 { symbol }
					token1 { symbol }
				}
			}`, lastID)
		}

		// 使用带重试的查询函数
		result, success := fetchWithRetry(client, query, requestCount+1)
		if !success {
			log.Fatalf("❌ 查询失败，已重试 %d 次", MAX_RETRIES)
		}
		requestCount++

		// 处理数据与退出条件
		pools := result.Pools
		if len(pools) == 0 {
			fmt.Println("\n✅ 拉取完成！")
			break
		}

		// 打印本页第一条和最后一条作为进度展示
		fmt.Printf("  [请求 #%d] 获取 %d 条 | 范围: %s ... %s\n",
			requestCount, len(pools), 
			pools[0].ID[:min(12, len(pools[0].ID))]+"...",
			pools[len(pools)-1].ID[:min(12, len(pools[len(pools)-1].ID))]+"...")

		totalCount += len(pools)

		// 更新游标 (关键步骤)
		// 将最后一条记录的 ID 作为下一次查询的起点
		lastID = pools[len(pools)-1].ID

		// 稍微 sleep 一下，避免触发 API Rate Limit
		time.Sleep(100 * time.Millisecond)
	}

	elapsed := time.Since(startTime)
	fmt.Printf("\n📊 统计信息:\n")
	fmt.Printf("  - 总计获取: %d 个 Pool\n", totalCount)
	fmt.Printf("  - 请求次数: %d 次\n", requestCount)
	fmt.Printf("  - 总耗时: %v\n", elapsed)
	if requestCount > 0 {
		fmt.Printf("  - 平均耗时: %v/请求\n", elapsed/time.Duration(requestCount))
	}
	
	fmt.Println("\n💡 为什么 Cursor-based 高效？")
	fmt.Println("  - 利用数据库主键索引，直接定位到游标位置")
	fmt.Println("  - 复杂度: O(log N) 或 O(1)，而非 O(N)")
	fmt.Println("  - 不受数据总量影响，性能稳定")
}

// fetchWithRetry: 带重试机制的查询函数
// 为什么需要重试？The Graph 使用去中心化架构，多个索引器提供服务
// 当查询复杂或数据量大时，某些索引器可能超时或失败，这是正常现象
func fetchWithRetry(client *http.Client, query string, requestNum int) (*QueryResult, bool) {
	reqBody, _ := json.Marshal(map[string]string{"query": query})
	
	// 调试模式：打印查询
	if DEBUG_MODE {
		fmt.Printf("\n[DEBUG] 查询内容:\n%s\n", query)
	}
	
	for attempt := 1; attempt <= MAX_RETRIES; attempt++ {
		resp, err := client.Post(GraphURL, "application/json", bytes.NewBuffer(reqBody))
		if err != nil {
			if attempt < MAX_RETRIES {
				log.Printf("⚠️  请求失败 (尝试 %d/%d): %v，%v 后重试...", 
					attempt, MAX_RETRIES, err, RETRY_DELAY)
				time.Sleep(RETRY_DELAY)
				continue
			}
			return nil, false
		}

		// 检查 HTTP 状态码
		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			resp.Body.Close()
			if attempt < MAX_RETRIES {
				log.Printf("⚠️  HTTP 错误 (尝试 %d/%d): 状态码 %d，%v 后重试...", 
					attempt, MAX_RETRIES, resp.StatusCode, RETRY_DELAY)
				time.Sleep(RETRY_DELAY)
				continue
			}
			log.Printf("❌ HTTP 错误: 状态码 %d, 响应: %s", resp.StatusCode, string(body))
			return nil, false
		}

		// 解析响应
		body, _ := io.ReadAll(resp.Body)
		resp.Body.Close()
		
		// 调试模式：打印响应
		if DEBUG_MODE {
			fmt.Printf("[DEBUG] 响应内容 (前500字符):\n%s...\n", string(body)[:min(500, len(string(body)))])
		}
		
		var result Response
		if err := json.Unmarshal(body, &result); err != nil {
			if attempt < MAX_RETRIES {
				log.Printf("⚠️  JSON 解析失败 (尝试 %d/%d): %v，%v 后重试...", 
					attempt, MAX_RETRIES, err, RETRY_DELAY)
				time.Sleep(RETRY_DELAY)
				continue
			}
			log.Printf("❌ JSON 解析错误: %v\n响应内容: %s", err, string(body))
			return nil, false
		}

		// 检查 GraphQL 错误
		if len(result.Errors) > 0 {
			// 判断是否为可重试的错误（如超时、索引器错误）
			isRetryable := false
			errorMsg := ""
			for _, e := range result.Errors {
				errorMsg += e.Message + "; "
				// 检查是否包含超时或索引器错误的关键词
				if containsAny(e.Message, []string{"timeout", "Timeout", "indexer", "bad indexers", "statement timeout"}) {
					isRetryable = true
				}
			}
			
			if isRetryable && attempt < MAX_RETRIES {
				log.Printf("⚠️  GraphQL 错误 (请求 #%d, 尝试 %d/%d): %s", 
					requestNum, attempt, MAX_RETRIES, errorMsg)
				log.Printf("    💡 这是 The Graph 去中心化架构的正常现象，正在重试...")
				time.Sleep(RETRY_DELAY)
				continue
			}
			
			// 不可重试的错误或已重试多次
			log.Printf("⚠️  GraphQL 错误 (请求 #%d):", requestNum)
			for _, e := range result.Errors {
				log.Printf("  - %s", e.Message)
			}
			
			// 如果有部分数据，仍然返回
			if len(result.Data.Pools) > 0 {
				return &QueryResult{
					Pools:  result.Data.Pools,
					Errors: result.Errors,
				}, true
			}
			
			// 无数据且不可重试，返回失败
			if attempt >= MAX_RETRIES {
				return nil, false
			}
		}

		// 成功返回
		return &QueryResult{
			Pools:  result.Data.Pools,
			Errors: result.Errors,
		}, true
	}
	
	return nil, false
}

// containsAny: 检查字符串是否包含任意一个关键词
func containsAny(s string, keywords []string) bool {
	for _, keyword := range keywords {
		if len(s) >= len(keyword) {
			for i := 0; i <= len(s)-len(keyword); i++ {
				if s[i:i+len(keyword)] == keyword {
					return true
				}
			}
		}
	}
	return false
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

