package main

import (
	"context"
	"fmt"
	"log"
	"net/url"
	"os"
	"os/signal"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/ethereum/go-ethereum/ethclient/gethclient"
	"github.com/ethereum/go-ethereum/rpc"
)

// ------------------------------------------------
// ⚠️ 关键配置：WebSocket 节点地址和代理
// ------------------------------------------------

const (
	// ⚠️ 请替换为你的 WebSocket 节点地址
	// Infura: wss://mainnet.infura.io/ws/v3/YOUR_API_KEY
	// Alchemy: wss://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
	// 获取方式: 访问 https://infura.io/ 或 https://www.alchemy.com/ 注册并获取 API Key
	InfuraWSS = "wss://mainnet.infura.io/ws/v3/YOUR_API_KEY"

	// ⚠️ 请根据你的代理软件修改端口号
	// 常见代理端口：
	//   - Clash: 7890 (HTTP), 7891 (SOCKS5)
	//   - V2Ray: 10808 (HTTP), 10809 (SOCKS5)
	//   - Shadowsocks: 1080 (SOCKS5)
	// 如果不需要代理，可以设为空字符串 ""
	PROXY_PORT = "YOUR_PROXY_PORT"

	// 设置较大的超时时间，应对代理连接延迟
	CONNECTION_TIMEOUT = 45 * time.Second
)

func main() {
	log.Println("开始配置代理并连接到 WebSocket 节点")

	// 1. 配置代理（WebSocket 连接需要通过代理，如果需要）
	// 注意：WebSocket 连接通过设置环境变量来让 rpc.DialContext 使用代理
	// 确保你的代理工具支持 WebSocket 连接（如 Clash、V2Ray）
	if PROXY_PORT != "" && PROXY_PORT != "YOUR_PROXY_PORT" {
		proxyUrlString := fmt.Sprintf("http://127.0.0.1:%s", PROXY_PORT)
		_, err := url.Parse(proxyUrlString)
		if err != nil {
			log.Fatalf("解析代理 URL 失败: %v", err)
		}

		// 设置环境变量，让 rpc.DialContext 自动使用代理
		os.Setenv("HTTP_PROXY", proxyUrlString)
		os.Setenv("HTTPS_PROXY", proxyUrlString)
		log.Printf("✅ 代理配置: %s", proxyUrlString)
	} else {
		log.Println("✅ 未配置代理（直接连接）")
	}

	// 2. 建立底层的 RPC 连接 (WebSocket)
	// 注意：rpc.DialContext 会自动使用环境变量中的代理设置
	ctx, cancel := context.WithTimeout(context.Background(), CONNECTION_TIMEOUT)
	defer cancel()

	rpcClient, err := rpc.DialContext(ctx, InfuraWSS)
	if err != nil {
		log.Fatalf("❌ 无法连接到 WebSocket 节点: %v\n"+
			"   可能的原因：\n"+
			"   1. 代理未启动或端口配置错误（当前代理端口: %s）\n"+
			"   2. WebSocket URL 无效或 API Key 错误\n"+
			"   3. 网络连接问题\n"+
			"   提示：确保代理工具已启动并支持 WebSocket 连接", err, PROXY_PORT)
	}
	defer rpcClient.Close()
	fmt.Println("✅ 成功建立 RPC WebSocket 连接 (已配置代理)")

	// 3. 初始化两种不同的 Client
	// EthClient: 用于通用查询和区块头订阅
	ethClient := ethclient.NewClient(rpcClient)
	// GethClient: 用于 Geth 特有的订阅 (如 Pending Transactions)
	gethClient := gethclient.New(rpcClient)

	// 4. 创建数据通道
	newHeadChan := make(chan *types.Header) // 接收新区块头
	pendingTxChan := make(chan common.Hash)  // 接收 Pending 交易 Hash

	// 5. 开启订阅
	// A. 订阅新区块 (SubscribeNewHead)
	headSub, err := ethClient.SubscribeNewHead(context.Background(), newHeadChan)
	if err != nil {
		log.Fatalf("❌ 订阅新区块失败: %v", err)
	}
	fmt.Println("🎧 开始监听新区块 (NewHeads)...")

	// B. 订阅待处理交易 (SubscribePendingTransactions)
	// 注意：这需要节点支持，Infura 免费版可能有限制，Alchemy 或本地节点通常支持更好
	txSub, err := gethClient.SubscribePendingTransactions(context.Background(), pendingTxChan)
	if err != nil {
		log.Printf("⚠️  警告: 订阅 Pending 交易失败: %v\n"+
			"   可能的原因：\n"+
			"   1. 节点不支持 Pending Transactions 订阅\n"+
			"   2. Infura 免费版可能限制此功能\n"+
			"   建议：使用 Alchemy 或本地节点", err)
		// 继续运行，只监听区块
		txSub = nil
	} else {
		fmt.Println("🎧 开始监听交易池 (Pending Transactions)...")
	}

	// 6. 优雅退出信号捕获
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt)

	// 7. 主循环：处理接收到的数据
	fmt.Println("\n📡 监控已启动，按 Ctrl+C 退出...\n")
	for {
		select {
		// 处理新区块
		case header := <-newHeadChan:
			fmt.Printf("\n📦 [New Block] Height: %d | Hash: %s | Time: %d\n",
				header.Number, header.Hash().Hex(), header.Time)

			// 实际应用场景：在这里触发你的业务逻辑，例如检查 Uniswap 价格

		// 处理 Pending 交易
		case txHash := <-pendingTxChan:
			// 为了演示不刷屏，我们只打印 Hash，实际中你会在这里并发去 fetch 交易详情
			fmt.Printf("🌊 [Pending Tx] %s\n", txHash.Hex())

			// 模拟 MEV 逻辑：
			// go analyzeTransaction(ethClient, txHash)

		// 处理订阅错误 (如网络断开)
		case err := <-headSub.Err():
			log.Fatalf("❌ 区块订阅异常中断: %v", err)
		case err := <-txSub.Err():
			if txSub != nil {
				log.Fatalf("❌ 交易订阅异常中断: %v", err)
			}

		// 用户退出
		case <-sigChan:
			fmt.Println("\n🛑 停止监控，正在断开连接...")
			headSub.Unsubscribe()
			if txSub != nil {
				txSub.Unsubscribe()
			}
			return
		}
	}
}

// 模拟分析函数 (伪代码)
func analyzeTransaction(client *ethclient.Client, hash common.Hash) {
	// tx, isPending, err := client.TransactionByHash(context.Background(), hash)
	// 1. 解码 Input Data 看是不是在调用 Uniswap Router
	// 2. 模拟执行看利润
	// 3. 发送 Bundle
}

