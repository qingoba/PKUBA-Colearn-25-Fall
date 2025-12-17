package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"strings"
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
	MAX_POOLS_TO_FETCH = 5000 // 限制拉取数量，用于演示
	MAX_RETRIES = 3              // 最大重试次数
	RETRY_DELAY = 2 * time.Second // 重试延迟
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

// 方式 1: Skip-based Pagination (错误做法)
func fetchWithSkip(client *http.Client) (int, time.Duration, int) {
	startTime := time.Now()
	totalCount := 0
	requestCount := 0
	pageSize := 1000
	skip := 0

	fmt.Println("\n📊 方式 1: Skip-based Pagination (错误做法)")
	fmt.Println(strings.Repeat("=", 62))

	for totalCount < MAX_POOLS_TO_FETCH {
		// 使用 skip 分页
		query := fmt.Sprintf(`
		{
			pools(
				first: %d,
				skip: %d,
				orderBy: id,
				orderDirection: asc
			) {
				id
				feeTier
				token0 { symbol }
				token1 { symbol }
			}
		}`, pageSize, skip)

		reqBody, _ := json.Marshal(map[string]string{"query": query})
		resp, err := client.Post(GraphURL, "application/json", bytes.NewBuffer(reqBody))
		requestCount++
		
		if err != nil {
			log.Printf("请求失败 (skip=%d): %v", skip, err)
			break
		}

		// 检查 HTTP 状态码
		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			resp.Body.Close()
			log.Printf("HTTP 错误 (skip=%d): 状态码 %d, 响应: %s", skip, resp.StatusCode, string(body))
			break
		}

		body, _ := io.ReadAll(resp.Body)
		resp.Body.Close()

		var result Response
		if err := json.Unmarshal(body, &result); err != nil {
			log.Printf("解析失败 (skip=%d): %v\n响应: %s", skip, err, string(body))
			break
		}

		// 检查 GraphQL 错误
		if len(result.Errors) > 0 {
			log.Printf("⚠️  GraphQL 错误 (skip=%d):", skip)
			for _, e := range result.Errors {
				log.Printf("  - %s", e.Message)
			}
			if len(result.Data.Pools) == 0 {
				break
			}
		}

		pools := result.Data.Pools
		if len(pools) == 0 {
			break
		}

		totalCount += len(pools)
		fmt.Printf("  [Skip %d] 获取 %d 条，累计: %d 条\n", skip, len(pools), totalCount)

		skip += pageSize
		
		// Skip 方式在数据量大时可能会失败或变慢
		if skip > 5000 {
			fmt.Printf("  ⚠️  Skip 超过 5000，可能触发限制或性能下降\n")
			break
		}

		time.Sleep(100 * time.Millisecond)
	}

	elapsed := time.Since(startTime)
	return totalCount, elapsed, requestCount
}

// 方式 2: Cursor-based Pagination (正确做法)
func fetchWithCursor(client *http.Client) (int, time.Duration, int) {
	startTime := time.Now()
	totalCount := 0
	requestCount := 0
	pageSize := 1000
	lastID := ""

	fmt.Println("\n📊 方式 2: Cursor-based Pagination (正确做法)")
	fmt.Println(strings.Repeat("=", 62))

	for totalCount < MAX_POOLS_TO_FETCH {
		// 使用 cursor 分页
		query := fmt.Sprintf(`
		{
			pools(
				first: %d,
				orderBy: id,
				orderDirection: asc,
				where: { id_gt: "%s" }
			) {
				id
				feeTier
				token0 { symbol }
				token1 { symbol }
			}
		}`, pageSize, lastID)

		reqBody, _ := json.Marshal(map[string]string{"query": query})
		
		// 使用重试机制
		var result Response
		var success bool
		for attempt := 1; attempt <= MAX_RETRIES; attempt++ {
			resp, err := client.Post(GraphURL, "application/json", bytes.NewBuffer(reqBody))
			requestCount++
			
			if err != nil {
				if attempt < MAX_RETRIES {
					time.Sleep(RETRY_DELAY)
					requestCount-- // 重试不算新请求
					continue
				}
				log.Printf("请求失败 (cursor=%s): %v", lastID[:min(8, len(lastID))]+"...", err)
				break
			}

			// 检查 HTTP 状态码
			if resp.StatusCode != http.StatusOK {
				body, _ := io.ReadAll(resp.Body)
				resp.Body.Close()
				if attempt < MAX_RETRIES {
					time.Sleep(RETRY_DELAY)
					requestCount-- // 重试不算新请求
					continue
				}
				log.Printf("HTTP 错误: 状态码 %d, 响应: %s", resp.StatusCode, string(body))
				break
			}

			body, _ := io.ReadAll(resp.Body)
			resp.Body.Close()

			if err := json.Unmarshal(body, &result); err != nil {
				if attempt < MAX_RETRIES {
					time.Sleep(RETRY_DELAY)
					requestCount-- // 重试不算新请求
					continue
				}
				log.Printf("解析失败: %v\n响应: %s", err, string(body))
				break
			}

			// 检查 GraphQL 错误
			if len(result.Errors) > 0 {
				// 判断是否为可重试的错误
				isRetryable := false
				for _, e := range result.Errors {
					if strings.Contains(e.Message, "timeout") || 
					   strings.Contains(e.Message, "Timeout") || 
					   strings.Contains(e.Message, "indexer") ||
					   strings.Contains(e.Message, "bad indexers") {
						isRetryable = true
						break
					}
				}
				
				if isRetryable && attempt < MAX_RETRIES {
					log.Printf("⚠️  检测到可重试错误，%v 后重试 (尝试 %d/%d)...", RETRY_DELAY, attempt, MAX_RETRIES)
					time.Sleep(RETRY_DELAY)
					requestCount-- // 重试不算新请求
					continue
				}
				
				log.Printf("⚠️  GraphQL 错误:")
				for _, e := range result.Errors {
					log.Printf("  - %s", e.Message)
				}
				if len(result.Data.Pools) == 0 {
					success = false
					break
				}
			}
			
			success = true
			break
		}
		
		if !success {
			break
		}

		pools := result.Data.Pools
		if len(pools) == 0 {
			break
		}

		totalCount += len(pools)
		fmt.Printf("  [Cursor %s] 获取 %d 条，累计: %d 条\n", 
			lastID[:min(8, len(lastID))]+"...", len(pools), totalCount)

		// 更新游标
		lastID = pools[len(pools)-1].ID

		time.Sleep(100 * time.Millisecond)
	}

	elapsed := time.Since(startTime)
	return totalCount, elapsed, requestCount
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

	fmt.Println("\n" + strings.Repeat("=", 62) + "\n")
	fmt.Println("🔬 性能对比实验：Skip vs Cursor-based Pagination")
	fmt.Println(strings.Repeat("=", 62) + "\n")

	// 测试 Skip 方式
	skipCount, skipTime, skipRequests := fetchWithSkip(client)
	
	// 等待一下，避免 API 限制
	time.Sleep(2 * time.Second)

	// 测试 Cursor 方式
	cursorCount, cursorTime, cursorRequests := fetchWithCursor(client)

	// 输出对比结果
	fmt.Println("\n" + strings.Repeat("=", 62) + "\n")
	fmt.Println("📈 性能对比结果")
	fmt.Println(strings.Repeat("=", 62) + "\n")

	fmt.Printf("方式 1 (Skip-based):\n")
	fmt.Printf("  - 获取数量: %d 条\n", skipCount)
	fmt.Printf("  - 耗时: %v\n", skipTime)
	fmt.Printf("  - 请求次数: %d 次\n", skipRequests)
	if skipRequests > 0 {
		fmt.Printf("  - 平均耗时: %v/请求\n", skipTime/time.Duration(skipRequests))
	}

	fmt.Printf("\n方式 2 (Cursor-based):\n")
	fmt.Printf("  - 获取数量: %d 条\n", cursorCount)
	fmt.Printf("  - 耗时: %v\n", cursorTime)
	fmt.Printf("  - 请求次数: %d 次\n", cursorRequests)
	if cursorRequests > 0 {
		fmt.Printf("  - 平均耗时: %v/请求\n", cursorTime/time.Duration(cursorRequests))
	}

	fmt.Println("\n" + strings.Repeat("=", 62) + "\n")
	fmt.Println("💡 关键洞察：")
	fmt.Println("  - Skip 方式：数据库需要扫描前 N 条记录，复杂度 O(N)")
	fmt.Println("  - Cursor 方式：利用索引直接定位，复杂度 O(log N) 或 O(1)")
	fmt.Println("  - 数据量越大，性能差异越明显")
	fmt.Println(strings.Repeat("=", 62) + "\n")
}

