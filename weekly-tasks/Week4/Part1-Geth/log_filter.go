package main

import (
	"context"
	"fmt"
	"log"
	"math/big"
	"time"
	// 新增了处理网络连接的包
	"net/http"
	"net/url"
	
	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/ethereum/go-ethereum/rpc" // 用于配置自定义的 http.Client
)

// ------------------------------------------------
// ⚠️ 关键修改：配置代理和 RPC URL
// ------------------------------------------------

const (
	USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
	
	// ⚠️ 请替换为你的 Infura RPC URL
	// 格式: https://mainnet.infura.io/v3/YOUR_API_KEY
	// 获取方式: 访问 https://infura.io/ 注册并获取 API Key
	InfuraURL = "https://mainnet.infura.io/v3/617b6207bb1c413391b6a0992a54b1d8"
	
	// ⚠️ 请根据你的代理软件修改端口号
	// 常见代理端口：
	//   - Clash: 7890 (HTTP), 7891 (SOCKS5)
	//   - V2Ray: 10808 (HTTP), 10809 (SOCKS5)
	//   - Shadowsocks: 1080 (SOCKS5)
	// 如果不需要代理，可以设为空字符串 ""
	PROXY_PORT = "7890" 
	
	// 设置较大的超时时间，应对代理连接延迟
	CONNECTION_TIMEOUT = 45 * time.Second 
)

func main() {
	log.Println("开始配置代理并连接到以太坊客户端")

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
	httpClient := &http.Client{
		Transport: transport,
		Timeout:   CONNECTION_TIMEOUT, 
	}

	// 4. 使用 rpc.DialOptions 将自定义客户端注入到 ethclient
	rpcClient, err := rpc.DialOptions(context.Background(), InfuraURL, rpc.WithHTTPClient(httpClient))
	if err != nil {
		log.Fatalf("无法创建 RPC 客户端: %v", err)
	}
	
	client := ethclient.NewClient(rpcClient)
	log.Println("连接到以太坊客户端成功 (已配置代理)")

	// ------------------------------------------------
	// 优化：获取最新区块号并设置查询范围
	// ------------------------------------------------

	ctx1, cancel1 := context.WithTimeout(context.Background(), CONNECTION_TIMEOUT)
	defer cancel1()
	
	log.Println("正在获取最新区块号...")
	
	// client.HeaderByNumber(ctx, nil) 会使用配置了代理的 client
	header, err := client.HeaderByNumber(ctx1, nil)
	var latestBlock int64
	
	if err != nil {
		// 如果获取最新区块失败，则输出错误并直接退出，因为无法确定合理的查询范围
		log.Fatalf("致命错误: 获取最新区块号失败: %v。请检查代理设置和网络连接。", err)
	} 
	
	latestBlock = header.Number.Int64()
	log.Printf("最新区块号: %d", latestBlock)

	// 1. 计算 Event Signature 哈希 (Topic 0)
	transferEventSignature := crypto.Keccak256Hash([]byte("Transfer(address,address,uint256)"))

	// 2. 构造查询参数 (查询最新 10 个区块)
	const BLOCK_RANGE = 10
	fromBlock := big.NewInt(latestBlock - BLOCK_RANGE)
	toBlock := big.NewInt(latestBlock)
	
	usdcAddr := common.HexToAddress(USDCAddress)
	log.Printf("查询 USDC 地址: %s", usdcAddr.Hex())
	log.Printf("查询区块范围: %d 到 %d (共 %d 个区块)", fromBlock.Int64(), toBlock.Int64(), BLOCK_RANGE)
	
	query := ethereum.FilterQuery{
		FromBlock: fromBlock,
		ToBlock:  toBlock,
		Addresses: []common.Address{usdcAddr},
		Topics:  [][]common.Hash{{transferEventSignature}},
	}
	// 3. 调用 FilterLogs
	ctx, cancel := context.WithTimeout(context.Background(), CONNECTION_TIMEOUT)
	defer cancel()
	
	log.Println("开始查询日志...")
	logs, err := client.FilterLogs(ctx, query)
	if err != nil {
		// 如果查询失败，可能是代理断开或 Infura 限制
		log.Fatalf("FilterLogs 查询失败: %v。请确保代理稳定。", err)
	}

	fmt.Printf("✅ 成功: 在区块 %d 到 %d 之间找到了 %d 条 Transfer 事件日志\n",
		query.FromBlock.Int64(), query.ToBlock.Int64(), len(logs))

	if len(logs) > 0 {
		log0 := logs[0]
		fmt.Println("--- 第一条 Log 详情 ---")
		fmt.Printf("TxHash: %s\n", log0.TxHash.Hex())
		fmt.Printf("BlockNumber: %d\n", log0.BlockNumber)
		fmt.Printf("Topics: %v\n", log0.Topics)
		// 提醒用户需要 ABI 解码
		fmt.Println("注意: 要获取可读的转账金额，需要使用 ABI 解码 log.Data 字段。")
	}
}