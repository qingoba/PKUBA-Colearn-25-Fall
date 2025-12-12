package main

import (
	"context"
	"fmt"
	"log"
	"math/big"
	"time"
	// 新增了处理网络连接和代理的包
	"net/http"
	"net/url"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/ethereum/go-ethereum/rpc" // 用于配置自定义的 http.Client
)

const (
	// Uniswap V2 Pair 地址 (USDC/ETH Pair)
	UniswapV2Pair_USDC_ETH = "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc"
	
	// Swap 事件签名: Swap(address indexed sender, uint amount0In, uint amount1In, uint amount0Out, uint amount1Out, address indexed to)
	SwapEventSignature = "Swap(address,uint256,uint256,uint256,uint256,address)"
	
	// ------------------------------------------------
	// ⚠️ 关键配置：代理和 RPC URL
	// ------------------------------------------------
	// ⚠️ 请替换为你的 Infura RPC URL
	// 格式: https://mainnet.infura.io/v3/YOUR_API_KEY
	// 获取方式: 访问 https://infura.io/ 注册并获取 API Key
	InfuraURL = "https://mainnet.infura.io/v3/YOUR_API_KEY"
	
	// ⚠️ 请根据你的代理软件修改端口号
	// 常见代理端口：
	//   - Clash: 7890 (HTTP), 7891 (SOCKS5)
	//   - V2Ray: 10808 (HTTP), 10809 (SOCKS5)
	//   - Shadowsocks: 1080 (SOCKS5)
	// 如果不需要代理，可以设为空字符串 ""
	PROXY_PORT = "YOUR_PROXY_PORT"
	
	// 连接超时时间：设置较大的超时时间，应对代理连接延迟和网络不稳定
	CONNECTION_TIMEOUT = 45 * time.Second
	
	// 查询配置参数
	MaxBlockRange    = 1000  // 单次查询的最大区块范围
	MaxRetries       = 3     // 最大重试次数
	RetryDelay       = 2 * time.Second  // 重试延迟
	RPSLimit         = 10    // 每秒最大请求数
	RequestInterval  = time.Second / time.Duration(RPSLimit)  // 请求间隔
)

// 分页查询日志
// 功能：将大范围区块分割成多个小范围，逐页查询并合并结果
func paginatedQueryLogs(
	client *ethclient.Client,
	fromBlock, toBlock *big.Int,
	addresses []common.Address,
	topics [][]common.Hash,
) ([]types.Log, error) {
	var allLogs []types.Log
	currentFrom := new(big.Int).Set(fromBlock)
	
	for currentFrom.Cmp(toBlock) <= 0 {
		// TODO: your code here (1/3)
		// 计算当前页的结束区块号（currentFrom + MaxBlockRange，但不能超过 toBlock）
		currentTo := new(big.Int).Set(currentFrom)
		// 提示：使用 big.NewInt().Add() 和 big.NewInt().SetUint64()
		// 如果 currentTo > toBlock，则 currentTo = toBlock
		
		query := ethereum.FilterQuery{
			FromBlock: currentFrom,
			ToBlock:   currentTo,
			Addresses: addresses,
			Topics:    topics,
		}

		// TODO: your code here (2/3)
		// 调用 client.FilterLogs() 查询当前页的日志
		// 处理错误（如果失败，可以记录日志但继续下一页，或直接返回错误）
		logs := []types.Log{} // 替换为实际查询
		
		// TODO: your code here (3/3)
		// 将当前页的日志合并到 allLogs
		// 更新 currentFrom 为下一页的起始区块（currentTo + 1）
		
		fmt.Printf("已查询区块 %d-%d，获得 %d 条日志\n", currentFrom.Int64(), currentTo.Int64(), len(logs))
	}
	
	return allLogs, nil
}

// 带重试的日志查询
// 功能：查询失败时自动重试，最多重试 MaxRetries 次
func queryLogsWithRetry(
	client *ethclient.Client,
	ctx context.Context,
	query ethereum.FilterQuery,
) ([]types.Log, error) {
	var logs []types.Log
	var err error
	
	// TODO: your code here
	// 实现重试循环（最多 MaxRetries 次）
	// 1. 调用 client.FilterLogs(ctx, query)
	// 2. 如果成功，立即返回结果
	// 3. 如果失败且未达到最大重试次数，记录错误并等待 RetryDelay
	// 4. 如果达到最大重试次数仍失败，返回最后一个错误
	// 提示：使用 time.Sleep(RetryDelay) 实现延迟
	
	return logs, err
}

// 带 RPS 限制的查询
// 功能：控制请求频率，避免触发 API 的 RPS 限制
type RateLimiter struct {
	lastRequestTime time.Time
	interval       time.Duration
}

func NewRateLimiter() *RateLimiter {
	return &RateLimiter{
		interval: RequestInterval,
	}
}

func (rl *RateLimiter) Wait() {
	// TODO: your code here
	// 1. 计算距离上次请求的时间间隔：elapsed := time.Since(rl.lastRequestTime)
	// 2. 如果间隔小于 rl.interval，则等待剩余时间：time.Sleep(rl.interval - elapsed)
	// 3. 更新 lastRequestTime：rl.lastRequestTime = time.Now()
}

// 完整的高通量查询函数
func queryHighVolumeLogs(
	client *ethclient.Client,
	fromBlock, toBlock *big.Int,
	addresses []common.Address,
	eventSignature string,
) ([]types.Log, error) {
	// 计算事件签名哈希
	eventSigHash := crypto.Keccak256Hash([]byte(eventSignature))
	
	// 创建速率限制器
	rateLimiter := NewRateLimiter()
	
	// 分页查询
	allLogs, err := paginatedQueryLogsWithRateLimit(
		client,
		fromBlock,
		toBlock,
		addresses,
		[][]common.Hash{{eventSigHash}},
		rateLimiter,
	)
	
	return allLogs, err
}

// 结合分页、重试和速率限制的查询函数
func paginatedQueryLogsWithRateLimit(
	client *ethclient.Client,
	fromBlock, toBlock *big.Int,
	addresses []common.Address,
	topics [][]common.Hash,
	rateLimiter *RateLimiter,
) ([]types.Log, error) {
	var allLogs []types.Log
	currentFrom := new(big.Int).Set(fromBlock)
	ctx := context.Background()
	
	for currentFrom.Cmp(toBlock) <= 0 {
		// 计算当前页的结束区块
		currentTo := new(big.Int).Set(currentFrom)
		currentTo.Add(currentTo, big.NewInt(int64(MaxBlockRange)))
		if currentTo.Cmp(toBlock) > 0 {
			currentTo.Set(toBlock)
		}
		
		query := ethereum.FilterQuery{
			FromBlock: currentFrom,
			ToBlock:   currentTo,
			Addresses: addresses,
			Topics:    topics,
		}
		
		// TODO: your code here
		// 1. 在查询前调用 rateLimiter.Wait() 控制请求频率
		// 2. 使用 queryLogsWithRetry() 进行查询（自动重试）
		// 3. 将查询结果合并到 allLogs
		// 4. 更新 currentFrom 为下一页起始区块
		
		fmt.Printf("已查询区块 %d-%d\n", currentFrom.Int64(), currentTo.Int64())
		
	}
	
	return allLogs, nil
}

func main() {
	// ------------------------------------------------
	// 步骤 1：配置代理并创建以太坊客户端
	// ------------------------------------------------
	log.Println("开始配置代理并连接到以太坊客户端")
	
	// 步骤 1.1：定义代理 URL（如果需要）
	// 代理 URL 格式：http://127.0.0.1:端口号
	// 注意：如果您的代理是 SOCKS5，需要先转换为 HTTP 代理，或使用支持 SOCKS5 的库
	var transport *http.Transport
	if PROXY_PORT != "" && PROXY_PORT != "YOUR_PROXY_PORT" {
		proxyUrlString := fmt.Sprintf("http://127.0.0.1:%s", PROXY_PORT)
		proxyUrl, err := url.Parse(proxyUrlString)
		if err != nil {
			log.Fatalf("❌ 解析代理 URL 失败: %v。请检查 PROXY_PORT 配置是否正确。", err)
		}
		log.Printf("✅ 代理 URL 解析成功: %s", proxyUrlString)
		
		// 步骤 1.2：创建自定义 HTTP 传输器（Transport）
		// Transport 负责管理 HTTP 连接的底层细节
		// Proxy 字段指定所有请求都通过该代理转发
		transport = &http.Transport{
			Proxy: http.ProxyURL(proxyUrl), // 强制所有请求通过代理
		}
		log.Println("✅ HTTP 传输器创建成功（已配置代理）")
	} else {
		transport = &http.Transport{}
		log.Println("✅ HTTP 传输器创建成功（未配置代理）")
	}
		// 注意：还可以配置其他选项，如：
		// - TLSClientConfig: 自定义 TLS 配置
		// - MaxIdleConns: 最大空闲连接数
		// - IdleConnTimeout: 空闲连接超时时间
	
	// 步骤 1.3：创建自定义 HTTP 客户端
	// 将自定义的 Transport 注入到 HTTP 客户端中
	// Timeout 设置请求的超时时间，防止长时间等待
	httpClient := &http.Client{
		Transport: transport,           // 使用配置了代理的传输器
		Timeout:   CONNECTION_TIMEOUT, // 设置超时时间
	}
	log.Printf("✅ HTTP 客户端创建成功（超时时间: %v）", CONNECTION_TIMEOUT)
	
	// 步骤 1.4：使用 rpc.DialOptions 将自定义 HTTP 客户端注入到 RPC 客户端
	// 这是关键步骤：通过 rpc.DialOptions 和 rpc.WithHTTPClient 选项，
	// 我们可以让以太坊 RPC 客户端使用我们自定义的 HTTP 客户端（包含代理配置）
	// 
	// 工作流程：
	//   1. ethclient 发送 RPC 请求
	//   2. RPC 客户端使用我们提供的 httpClient
	//   3. httpClient 使用配置了代理的 transport
	//   4. transport 将所有请求转发到代理服务器
	//   5. 代理服务器转发请求到 Infura
	ctx := context.Background()
	rpcClient, err := rpc.DialOptions(ctx, InfuraURL, rpc.WithHTTPClient(httpClient))
	if err != nil {
		log.Fatalf("❌ 无法创建 RPC 客户端: %v\n"+
			"   可能的原因：\n"+
			"   1. 代理服务器未启动或端口配置错误\n"+
			"   2. 网络连接问题\n"+
			"   3. Infura URL 无效", err)
	}
	log.Println("✅ RPC 客户端创建成功（已注入自定义 HTTP 客户端）")
	
	// 步骤 1.5：从 RPC 客户端创建 ethclient
	// ethclient 是高级封装，提供便捷的以太坊操作接口
	client := ethclient.NewClient(rpcClient)
	log.Println("✅ 以太坊客户端创建成功（已配置代理）")
	
	// ------------------------------------------------
	// 步骤 2：获取最新区块号
	// ------------------------------------------------
	log.Println("正在获取最新区块号...")
	
	// 创建带超时的上下文，防止获取区块号时无限等待
	ctx1, cancel1 := context.WithTimeout(context.Background(), CONNECTION_TIMEOUT)
	defer cancel1()
	
	// 调用 HeaderByNumber 获取最新区块头
	// nil 表示获取最新区块，也可以传入具体的区块号
	header, err := client.HeaderByNumber(ctx1, nil)
	if err != nil {
		log.Fatalf("❌ 获取最新区块号失败: %v\n"+
			"   可能的原因：\n"+
			"   1. 代理连接不稳定\n"+
			"   2. Infura API 限制或不可用\n"+
			"   3. 网络超时\n"+
			"   请检查代理设置和网络连接。", err)
	}
	
	latestBlock := header.Number
	log.Printf("✅ 最新区块号: %d", latestBlock.Int64())
	
	// ------------------------------------------------
	// 步骤 3：查询 Uniswap V2 Swap 事件日志
	// ------------------------------------------------
	const BLOCK_RANGE = 10000
	fromBlock := new(big.Int).Sub(latestBlock, big.NewInt(BLOCK_RANGE))
	toBlock := latestBlock
	
	uniswapAddr := common.HexToAddress(UniswapV2Pair_USDC_ETH)
	log.Printf("查询地址: %s", uniswapAddr.Hex())
	log.Printf("查询区块范围: %d 到 %d (共 %d 个区块)", 
		fromBlock.Int64(), toBlock.Int64(), BLOCK_RANGE)
	
	log.Println("\n🚀 开始查询日志（通过代理）...")
	logs, err := queryHighVolumeLogs(
		client,
		fromBlock,
		toBlock,
		[]common.Address{uniswapAddr},
		SwapEventSignature,
	)
	
	if err != nil {
		log.Fatalf("❌ 查询失败: %v\n"+
			"   可能的原因：\n"+
			"   1. 代理连接中断\n"+
			"   2. Infura API 限制（请求频率过高或配额用尽）\n"+
			"   3. 网络不稳定导致多次重试后仍失败\n"+
			"   4. 查询范围过大，建议减小 BLOCK_RANGE", err)
	}
	
	// ------------------------------------------------
	// 步骤 4：输出查询结果
	// ------------------------------------------------
	if err != nil {
		log.Fatalf("查询失败: %v", err)
	}
	
	fmt.Printf("✅ 成功: 在区块 %d 到 %d 之间找到了 %d 条 Swap 事件日志\n",
		fromBlock.Int64(), toBlock.Int64(), len(logs))
	
	if len(logs) > 0 {
		log0 := logs[0]
		fmt.Println("--- 第一条 Log 详情 ---")
		fmt.Printf("TxHash: %s\n", log0.TxHash.Hex())
		fmt.Printf("BlockNumber: %d\n", log0.BlockNumber)
		fmt.Printf("Topics: %v\n", log0.Topics)
	}
}