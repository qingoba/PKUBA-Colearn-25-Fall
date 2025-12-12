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
	
	CONNECTION_TIMEOUT = 45 * time.Second
	
	// 简化参数：只查询一次，获取 500 条数据即可完成任务
	TARGET_COUNT = 500  // 目标数量：获取 500 条就算成功
	RETRY_DELAY = 2 * time.Second // 重试延迟
	MAX_RETRIES = 3  // 最大重试次数
)

type Response struct {
	Data struct {
		Pools []struct {
			ID      string `json:"id"`
			Token0  struct {
				Symbol string `json:"symbol"`
			} `json:"token0"`
			Token1  struct {
				Symbol string `json:"symbol"`
			} `json:"token1"`
			FeeTier string `json:"feeTier"`
		} `json:"pools"`
	} `json:"data"`
	Errors []struct {
		Message string `json:"message"`
	} `json:"errors,omitempty"` // GraphQL 错误信息
}

func createClient() *http.Client {
	// 配置代理（如果需要）
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

	return &http.Client{
		Transport: transport,
		Timeout:   CONNECTION_TIMEOUT,
	}
}

// Challenge: 实现 GraphQL 查询
// 
// 📚 学习目标：
//   1. 理解 GraphQL 查询的基本语法
//   2. 掌握如何构造查询获取链上数据
//   3. 学会处理 API 响应和错误
//
// 🎯 你的任务：完成一次 GraphQL 查询，获取 500 条 Pool 数据
//   只要能成功获取到数据，就算完成任务！
func fetchPoolsOnce(client *http.Client) (int, error) {
	fmt.Println("🚀 开始查询 Uniswap Pools...")
	fmt.Println("💡 目标：获取 500 条 Pool 数据\n")

	// TODO 1: 构造 GraphQL 查询
	// 提示：
	//   - 使用 first: 500 限制获取数量
	//   - 使用 orderBy: id 和 orderDirection: asc 排序
	//   - 查询 pools 实体，获取 id、feeTier、token0.symbol、token1.symbol 字段
	var query string
	// TODO: 在这里构造 GraphQL 查询
	// 提示：使用 fmt.Sprintf 构造查询字符串，参考格式：
	// query := fmt.Sprintf(`
	// {
	//     pools(
	//         first: %d,
	//         orderBy: id,
	//         orderDirection: asc
	//     ) {
	//         id
	//         feeTier
	//         token0 { symbol }
	//         token1 { symbol }
	//     }
	// }`, TARGET_COUNT)

	// 发送请求（带重试机制）
	reqBody, _ := json.Marshal(map[string]string{"query": query})
	var result Response
	var success bool
	
	// 重试机制：处理索引器超时等临时错误
	for attempt := 1; attempt <= MAX_RETRIES; attempt++ {
		resp, err := client.Post(GraphURL, "application/json", bytes.NewBuffer(reqBody))
		
		if err != nil {
			if attempt < MAX_RETRIES {
				log.Printf("⚠️  请求失败 (尝试 %d/%d): %v，%v 后重试...", 
					attempt, MAX_RETRIES, err, RETRY_DELAY)
				time.Sleep(RETRY_DELAY)
				continue
			}
			return 0, fmt.Errorf("请求失败: %v", err)
		}
		defer resp.Body.Close()

		// 检查 HTTP 状态码
		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			if attempt < MAX_RETRIES {
				log.Printf("⚠️  HTTP 错误 (尝试 %d/%d): 状态码 %d，%v 后重试...", 
					attempt, MAX_RETRIES, resp.StatusCode, RETRY_DELAY)
				time.Sleep(RETRY_DELAY)
				continue
			}
			return 0, fmt.Errorf("HTTP 错误: 状态码 %d, 响应: %s", resp.StatusCode, string(body))
		}

		// 解析响应
		body, _ := io.ReadAll(resp.Body)

		if err := json.Unmarshal(body, &result); err != nil {
			if attempt < MAX_RETRIES {
				log.Printf("⚠️  JSON 解析失败 (尝试 %d/%d): %v，%v 后重试...", 
					attempt, MAX_RETRIES, err, RETRY_DELAY)
				time.Sleep(RETRY_DELAY)
				continue
			}
			return 0, fmt.Errorf("JSON 解析失败: %v\n响应: %s", err, string(body))
		}

		// 检查 GraphQL 错误
		if len(result.Errors) > 0 {
			// 判断是否为可重试的错误（超时、索引器错误）
			isRetryable := false
			for _, e := range result.Errors {
				if containsAny(e.Message, []string{"timeout", "Timeout", "indexer", "bad indexers", "statement timeout"}) {
					isRetryable = true
					break
				}
			}
			
			if isRetryable && attempt < MAX_RETRIES {
				log.Printf("⚠️  检测到可重试错误 (尝试 %d/%d)，%v 后重试...", 
					attempt, MAX_RETRIES, RETRY_DELAY)
				log.Printf("    💡 这是 The Graph 去中心化架构的正常现象，正在自动重试...")
				time.Sleep(RETRY_DELAY)
				continue
			}
			
			// 不可重试的错误或已重试多次
			log.Printf("⚠️  GraphQL 错误:")
			for _, e := range result.Errors {
				log.Printf("  - %s", e.Message)
			}
			
			// 如果有部分数据，仍然返回成功
			if len(result.Data.Pools) > 0 {
				success = true
				break
			}
			
			// 无数据且不可重试，返回失败
			if attempt >= MAX_RETRIES {
				return 0, fmt.Errorf("查询失败且无数据返回（已重试 %d 次）", MAX_RETRIES)
			}
		} else {
			success = true
			break
		}
	}
	
	if !success {
		return 0, fmt.Errorf("查询失败，已重试 %d 次", MAX_RETRIES)
	}

	// TODO 2: 处理返回的数据
	// 提示：从 result.Data.Pools 中获取数据
	// 思考：如何获取返回的 Pool 数量？（提示：len(result.Data.Pools)）
	var count int
	// TODO: 在这里处理返回的数据
	// 提示：
	//   1. 从 result.Data.Pools 获取 pools 切片
	//   2. 使用 len() 获取数量
	//   3. 可选：打印第一条和最后一条数据的信息

	return count, nil
}

// containsAny: 检查字符串是否包含任意一个关键词（用于判断是否为可重试错误）
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

func main() {
	log.Println("开始配置代理并连接到 The Graph API")
	client := createClient()
	log.Println("✅ 代理配置成功")

	// 调用挑战函数
	count, err := fetchPoolsOnce(client)
	if err != nil {
		log.Fatalf("❌ 执行失败: %v", err)
	}

	fmt.Printf("\n🎉 挑战完成！\n")
	fmt.Printf("\n📊 结果统计:\n")
	fmt.Printf("  - 成功获取: %d 个 Pool\n", count)
	if count >= TARGET_COUNT {
		fmt.Printf("  - ✅ 达到目标数量 (%d 条)！\n", TARGET_COUNT)
	} else if count > 0 {
		fmt.Printf("  - ⚠️  获取到 %d 条（目标: %d 条）\n", count, TARGET_COUNT)
	}
	fmt.Printf("\n💡 关键知识点：\n")
	fmt.Println("  1. GraphQL 查询语法：使用 first 限制数量，orderBy 排序")
	fmt.Println("  2. The Graph 是去中心化索引网络，可能出现临时错误")
	fmt.Println("  3. 重试机制可以处理网络波动和索引器超时")
	fmt.Println("\n🔍 进一步学习：")
	fmt.Println("  - 查看 graph_query.go 了解 Cursor-based Pagination（分页查询）")
	fmt.Println("  - 运行 graph_query_comparison.go 对比 Skip vs Cursor 的性能差异")
}

