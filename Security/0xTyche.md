---
timezone: UTC+8
---

> 请在上边的 timezone 添加你的当地时区(UTC)，这会有助于你的打卡状态的自动化更新，如果没有添加，默认为北京时间 UTC+8 时区


# 你的名字

1. 自我介绍
0xTyche 对合约安全、defi十分感兴趣
2. 你认为你会完成这次共学小组吗？
希望会
3. 你感兴趣的小组
合约安全
4. 你的联系方式（Wechat or Telegram）
0xTyche

## Notes

<!-- Content_START -->

### 2025.11.18
Part I - 动手部署一个智能合约 writeup
1. 完成对报名  
2. 测试网络领水：https://www.alchemy.com/faucets/ethereum-sepolia
address：0x00000000bb09009cdcd358d6c5ce6f56611577f1  
![image](https://github.com/0xTyche/PKUBA-Colearn-25-Fall/blob/main/pictures/get-sepolia-eth.png)  
3. 登录remix 网站：https://remix.ethereum.org/

```Solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HelloWeb3 {
    event Greeting(address indexed sender, uint256 timestamp);
    
    constructor() {}

    function hello() external {
        emit Greeting(msg.sender, block.timestamp);
    }
}
```
4. 合约部署成功 tx：https://web3.okx.com/zh-hans/explorer/sepolia/tx/0xb8dd671fa5bc78ba53150ac40fc3591c17d86e053de763572230521d7b25d026
  
合约地址：0xa7120cc8d48f4053c2eb0babb449d20f2ab9af49

```shell
[block:9655856 txIndex:46]from: 0x000...577f1to: HelloWeb3.(constructor)value: 0 weidata: 0x608...00033logs: 0hash: 0x074...9af58
view on Etherscan view on Blockscout
Verification process started...
Verifying with Sourcify...
Verifying with Routescan...
Etherscan verification skipped: API key not found in global Settings.
Sourcify verification successful.
https://repo.sourcify.dev/11155111/0xA7120Cc8D48F4053c2eb0BaBb449d20f2Ab9Af49/
Routescan verification successful.
https://testnet.routescan.io/address/0xA7120Cc8D48F4053c2eb0BaBb449d20f2Ab9Af49/contract/11155111/code
```

Part II - 智能合约编写

题目：通过编写智能合约与靶子合约交互，获取 Flag 并触发 ChallengeCompleted 事件。

https://sepolia.etherscan.io/address/0x4a6C0c0dc8bD8276b65956c9978ef941C3550A1B#code

根据查看合约代码，可以知道hint函数所给的暗示是"keccak PKUBlockchain"，后续还是尽量按照题目要求逐步完成。

1. 首先调用目标合约中hint函数，看题目给了什么暗示
```shell
root@racknerd-9da1d08:~/home/PKUBA-1/PKUBA-Colearn-25-Fall/writeup/part2# cast call $TARGET_CONTRACT "hint()(string)" --rpc-url $SEPOLIA_RPC_URL
"keccak PKUBlockchain"
```
2. 因此我们需要使用keccak单向加密函数对PKUBlockchain字符串进行加密，加密的结果可能就是答案。
3. 解答项目结构
/src/Solver.sol  
```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

interface ITargetContract {
    function hint() external pure returns (string memory);
    function query(bytes32 _hash) external returns (string memory);
}

contract Solver {
    ITargetContract public target;
    
    constructor(address _targetAddress) {
        target = ITargetContract(_targetAddress);
    }
    
    // 获取提示
    function getHint() external view returns (string memory) {
        // 调用目标合约中的hint函数
        return target.hint();
    }
    
    // 解答
    function getCorrectHash() public pure returns (bytes32) {
        return keccak256(abi.encodePacked("PKUBlockchain"));
    }
    
    // 提交答案
    function solve() external returns (string memory) {
        bytes32 answer = getCorrectHash();
        return target.query(answer);
    }
}
```

script/Deploy.s.sol  
```Solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/Solver.sol";

contract DeployScript is Script {
    function run() external {
        address targetContract = vm.envAddress("TARGET_CONTRACT");
        
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 部署 Solver 合约
        Solver solver = new Solver(targetContract);
        
        console.log("Solver deployed at:", address(solver));
        console.log("Target contract:", targetContract);
        
        // 自动调用 solve 方法
        string memory flag = solver.solve();
        console.log("flag result", flag);
        
        vm.stopBroadcast();
    }
}
```
run
```shell
forge script script/Deploy.s.sol:DeployAndSolve \
    --rpc-url $SEPOLIA_RPC_URL \
    --broadcast \
    -vvvv

Script ran successfully.

== Logs ==
  Solver deployed at: 0x6F00A229cf51DB7Eec4B6996F2eBcFE365C0Ae98
  Target contract: 0x4a6C0c0dc8bD8276b65956c9978ef941C3550A1B
  flag result FLAG{PKU_Blockchain_Colearn_Week1_Success}
```
3. 看到上方合约执行的结果可以知道，我们成功的完成了题目的要求。
0x6F00A229cf51DB7Eec4B6996F2eBcFE365C0Ae98 这个是我部署合约的地址，
按要求通过合约调用  
https://sepolia.etherscan.io/tx/0x91e72d0a469e800d7f44f2a02b40518128a5a59eea8124e85496997113082604

### 2025.07.11



### 2025.12.07

#### 转账哈希
转账哈希：0x6ea04b5764b8db4cc59f7f3f872a45df6fcc0b9d1b8345c4725786de052d0051

#### 本周目标：

学会用 Geth 的 Go 客户端从 RPC 节点读取链上信息
理解区块链底层数据结构（block、transaction、receipt）
这些是做 DApp、链上分析、合约调试等的基础。

2. 节点：运行客户端的软件实例
从功能和数据完整性角度分析，节点可以分为
- 全节点：保存当前完整状态和必要的历史数据，可以独立验证新区块和交易；
- 轻节点：只保存少量数据和区块头，需要向其他节点请求详细信息；
- 归档节点：不仅保存当前状态，还保存所有历史状态，方便做历史查询和分析，但资源消耗很大。

有矿工/验证者节点把交易打包进入区块，交易才算真正的上链。

3. rpc 给外部程序调用的接口
RPC（Remote Procedure Call，远程过程调用）是节点向外暴露的一组标准接口，用来让其他程序查询或提交数据，常见是 HTTP RPC 或 WebSocket RPC。

Geth（Go Ethereum）是用 Go 语言实现的以太坊客户端，也是目前使用最广泛的实现之一。
【看来Go学习也要提上日程了】

公共的Sepolia rpc：https://ethereum-sepolia-rpc.publicnode.com

Go 客户端库
Geth 提供了一套Go客户端库，方便Go代码和以太坊交互，常用的是ethclient包。
```Go
    import (
        "context"
        "github.com/ethereum/go-ethereum/ethclient"
    )
    func main(){
        // 连接公共 rpc
        client, err := ethclient.Dial("https://ethereum-sepolia-rpc.publicnode.com")

        // 也可以使用个人节点
        // client, err := ethclient.Dial("https://your-server-ip:8545") 和 anvil fork 出一个节点类似

        if err != nil {
            panic(err)
        }
        defer client.Close()
    }
```

#### Part II - Go 语言环境准备

在 racknerd ubuntu 22.04 服务器下进行安装
```bash
root@racknerd-9da1d08:~/home/PKUBA-1/PKUBA-Colearn-25-Fall# cd ~
root@racknerd-9da1d08:~# ls
home  send-ping-transaction.ts  snap  tsconfig.json  virt-sysprep-firstboot.log
root@racknerd-9da1d08:~# cd ../
root@racknerd-9da1d08:/# ls
bin  boot  core  dev  etc  home  lib  lib32  lib64  libx32  lost+found  media  mnt  opt  proc  root  run  sbin  snap  srv  sys  tmp  usr  var
root@racknerd-9da1d08:/# cd /tmp
root@racknerd-9da1d08:/tmp# wget https://go.dev/dl/go1.23.4.linux-amd64.tar.gz
--2025-12-07 08:01:30--  https://go.dev/dl/go1.23.4.linux-amd64.tar.gz
Resolving go.dev (go.dev)... 216.239.36.21, 216.239.32.21, 216.239.38.21, ...
Connecting to go.dev (go.dev)|216.239.36.21|:443... connected.
HTTP request sent, awaiting response... 302 Found
Location: https://dl.google.com/go/go1.23.4.linux-amd64.tar.gz [following]
--2025-12-07 08:01:30--  https://dl.google.com/go/go1.23.4.linux-amd64.tar.gz
Resolving dl.google.com (dl.google.com)... 172.217.12.142, 2607:f8b0:4007:801::200e
Connecting to dl.google.com (dl.google.com)|172.217.12.142|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 73645095 (70M) [application/x-gzip]
Saving to: ‘go1.23.4.linux-amd64.tar.gz’

go1.23.4.linux-amd64.tar.gz             100%[=============================================================================>]  70.23M  76.2MB/s    in 0.9s    

2025-12-07 08:01:31 (76.2 MB/s) - ‘go1.23.4.linux-amd64.tar.gz’ saved [73645095/73645095]

root@racknerd-9da1d08:/tmp# sudo tar -C /usr/local -xzf go1.23.4.linux-amd64.tar.gz
root@racknerd-9da1d08:/tmp# nano ~/.bashrc
root@racknerd-9da1d08:/tmp# source ~/.bashrc
root@racknerd-9da1d08:/tmp# go version
go version go1.23.4 linux/amd64

# 配置gopath
root@racknerd-9da1d08:/tmp# echo 'export GOPATH=$HOME/go' >> ~/.bashrc
echo 'export PATH=$PATH:$GOPATH/bin' >> ~/.bashrc
source ~/.bashrc
root@racknerd-9da1d08:/tmp# go env GOPATH
/root/go
```

 工作流
```bash
cd /home/workplace/my-project
go mod init my-project
go run main.go

```

go version
```bash
root@racknerd-9da1d08:/tmp# go version
go version go1.23.4 linux/amd64
```

按要求创建go项目
```bash
root@racknerd-9da1d08:~/home/PKUBA-1/PKUBA-Colearn-25-Fall# cd writeup/
root@racknerd-9da1d08:~/home/PKUBA-1/PKUBA-Colearn-25-Fall/writeup# cd week3/
root@racknerd-9da1d08:~/home/PKUBA-1/PKUBA-Colearn-25-Fall/writeup/week3# mkdir week3-geth
root@racknerd-9da1d08:~/home/PKUBA-1/PKUBA-Colearn-25-Fall/writeup/week3# cd week3-geth
root@racknerd-9da1d08:~/home/PKUBA-1/PKUBA-Colearn-25-Fall/writeup/week3/week3-geth# go mod init week3-geth
go: creating new go.mod: module week3-geth
```

`go mod init 会创建一个 go.mod 文件，记录当前项目的模块名和依赖信息，后面 go get 的第三方库都会写进这里。`

```Go
package main

// fmt 是go 自带的打印工具包
import (
	"fmt"
)

func main() {
	fmt.Println("Hello, World!")
}
```

安装 go-ethereum 库
```bash
go get github.com/ethereum/go-ethereum
```

#### Part III - 使用 go-ethereum 读取链上数据

```bash 
# 第一次运行出现了如下的报错，原因是存在包未被安装
# 解决办法是 go mod tidy
root@racknerd-9da1d08:~/home/PKUBA-1/PKUBA-Colearn-25-Fall/writeup/week3/week3-geth# go run main.go
/root/go/pkg/mod/github.com/ethereum/go-ethereum@v1.16.7/rpc/websocket.go:30:2: missing go.sum entry for module providing package github.com/deckarep/golang-set/v2 (imported by github.com/ethereum/go-ethereum/rpc); to add:
        go get github.com/ethereum/go-ethereum/rpc@v1.16.7
/root/go/pkg/mod/github.com/ethereum/go-ethereum@v1.16.7/metrics/cpu_enabled.go:24:2: missing go.sum entry for module providing package github.com/shirou/gopsutil/cpu (imported by github.com/ethereum/go-ethereum/metrics); to add:
        go get github.com/ethereum/go-ethereum/metrics@v1.16.7
/root/go/pkg/mod/github.com/ethereum/go-ethereum@v1.16.7/rpc/client_opt.go:22:2: missing go.sum entry for module providing package github.com/gorilla/websocket (imported by github.com/ethereum/go-ethereum/rpc); to add:
        go get github.com/ethereum/go-ethereum/rpc@v1.16.7
```

```go
package main

// fmt 是go 自带的打印工具包
import (
	"fmt"
	"context"
	"log"
	"math/big"

	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/ethereum/go-ethereum/common"
)

func main() {
	/*
	创建一个“最干净、最基础、永远不会被取消的上下文对象”
	用来作为后续 请求控制、超时控制、取消控制、链路传递 的“起点”。
	*/
	ctx := context.Background()

	// 连接公共rpc
	client, err := ethclient.Dial("https://eth-sepolia.g.alchemy.com/v2/your-keys")

	if err != nil {
		log.Fatal(err)
	}
	defer client.Close()
	
	// 获取当前的区块高度
	head, err := client.HeaderByNumber(ctx, nil)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("current block:", head.Number.String())

	// 查询指定区块的信息
	targetBlock := big.NewInt(123456)
	block, err := client.BlockByNumber(ctx, targetBlock)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("block #%s hash:",block.Number().String(), block.Hash().Hex())
	fmt.Println("block parent hash:", block.ParentHash().Hex())
	fmt.Println("tx count:", len(block.Transactions()))
	
	fmt.Println("block timestamp:", block.Time())
	fmt.Println("block gas used:", block.GasUsed())
	fmt.Println("block gas limit:", block.GasLimit())
 
	// 查询交易和回执-测试交易用哈希0xe50abcfd869dcce23446b82e666f563f99b7f7563c4208cb656cb52cba376ba5
	fmt.Println("week1 - transer hash:", "0xe50abcfd869dcce23446b82e666f563f99b7f7563c4208cb656cb52cba376ba5")
	txHash := common.HexToHash("0xe50abcfd869dcce23446b82e666f563f99b7f7563c4208cb656cb52cba376ba5")
	tx, isPending, err := client.TransactionByHash(ctx, txHash)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("tx pending:", isPending)
	if to := tx.To(); to != nil {
		fmt.Println("to:", to.Hex())
	} else {
		fmt.Println("to: contract creation")
	}
	fmt.Println("value:", tx.Value().String())

	//  接收交易地址
	receipt, err := client.TransactionReceipt(ctx, txHash)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("receipt status:", receipt.Status)
	fmt.Println("logs:", len(receipt.Logs))
}
```
- 运行结果
```bash
# 我查询的是第一周的转账交易
root@racknerd-9da1d08:~/home/PKUBA-1/PKUBA-Colearn-25-Fall/writeup/week3/week3-geth# go run main.go
current block: 9787870
block #%s hash: 123456 0x2056507046b07a5d7ed4f124a7febce2aec7295b464746523787b8c2acc627dc
block parent hash: 0x93bff867b68a2822ee7b6e0a4166cfdf5fc4782d60458fae1185de9b2ecdba16
tx count: 0
block timestamp: 1636715788
block gas used: 0
block gas limit: 8000000

week1 - transer hash: 0xe50abcfd869dcce23446b82e666f563f99b7f7563c4208cb656cb52cba376ba5
tx pending: false
to: 0x00000000bb09009cDCD358d6c5CE6F56611577f1
value: 99978999999706000
receipt status: 1
logs: 0
```


#### Follow Up - 理解 block, transaction, receipt 的结构

关于 Block 建议理解的字段包括：

number 区块高度，区块链区块是由0向上递增
hash 当前区块唯一的id，整个区块内容（头 + 交易 + 状态根）做 Keccak256 哈希后的结果。
parentHash 父区块哈希
```
Block N:
  hash = H(N)
Block N+1:
  parentHash = H(N)
# 为什么不是 parentHash = H(N) 这是由于 block N + 1 块的时候还算不出 H(N+1)
```
timestamp 时间戳
gasUsed / gasLimit 使用的gas和gas限制
transactions 该区块包含的交易列表
Follow-Up：

为何 parentHash 能形成区块链？


gasLimit 如何影响合约执行
- 每个交易都会声明：
gasLimit = 我最多愿意烧多少计算费


- 区块本身也有：
block.gasLimit = 这个区块最多容纳多少计算量


- 执行时规则是：
交易消耗 gas ≤ 交易 gasLimit ≤ 区块 gasLimit


关于 Transcation 建议理解的字段包括：

nonce 某个地址发出的第 N 笔交易
from / to 发送方/接收方
input (call data) 合约调用的“原始指令数据”
gas / gasPrice 你愿意为这笔交易最多烧多少算力 & 单价
value 转账的 ETH 数量
type (legacy, EIP-1559) 交易类型（以太坊升级后的分类）
| type | 含义                |
| ---- | ----------------- |
| 0    | legacy 交易         |
| 1    | EIP-2930          |
| 2    | ✅ EIP-1559（现在最主流） |

#### Follow-Up：

什么是 ABI ？
- ABI = 合约函数的“身份证说明书”  

一笔交易最终执行逻辑是如何解析 input 的
1. input[0:4]  → 函数选择器
2. 用 ABI 找到函数签名
3. 剩余 input → 按 ABI 解码参数
4. EVM 执行目标合约函数
  
关于 Receipt 建议理解的字段包括:


status 交易状态：判断交易是否成功
logs 合约事件日志
contractAddress 合约创建地址

### 2025.12.08

### 2025.12.21
#### part-Geth



<!-- Content_END -->
