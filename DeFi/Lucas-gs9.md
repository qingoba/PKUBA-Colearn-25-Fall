---
timezone: UTC+8
---

> 请在上边的 timezone 添加你的当地时区(UTC)，这会有助于你的打卡状态的自动化更新，如果没有添加，默认为北京时间 UTC+8 时区


# 你的名字

1. 自我介绍: Lucas
2. 你认为你会完成这次共学小组吗？ 会
3. 你感兴趣的小组 DeFi
4. 你的联系方式（Wechat or Telegram） @The Division Bell
5. 质押的交易哈希 0xd087e3882e2bbc3b05aa6835a543ea2412e5de8fc7f4f424e36075f06943d0cb

## Notes

<!-- Content_START -->

### 2025.11.23

1.Remix作为线上IDE可以创建合约、编译、并部署到链上，并与已经部署的合约进行交互。  
2.创建合约时通过interface访问其他外界合约，在该合约内就可以通过创建的interface对象调用function进行交互。  
3.函数签名需要用returns声明返回类型。  
4.变量需要声明存储位置，memory是临时存储，storage是写到链上，用memory可以节省gas。  
5.external参数使得成员函数可以被外部调用。  
6.在remix调用函数交互时需要metamask确认，交易进行后可以通过sepolia.etherscan.io查看事件日志logs。  

### 2025.11.30

对于Week1 Part II的合约，Etherscan中Transaction Receipt Event Logs中Name显示，ChallengeCompleted (index_topic_1 address solver, uint256 timestamp)，代表合约交互成功。

### 2025.12.3
main.go运行结果为  
Current block: 9758709  
Block #123456 hash: 0x2056507046b07a5d7ed4f124a7febce2aec7295b464746523787b8c2acc627dc  
Parent hash: 0x93bff867b68a2822ee7b6e0a4166cfdf5fc4782d60458fae1185de9b2ecdba16  
Tx count: 0  
Tx pending: false  
To: 0x9Bd28675069f200961B50F13C476aDa5e7067C31  
Value (wei): 0  
Receipt status: 1  
Logs: 2 entries  
Block中字段：  
number 区块编号，从0开始顺序向后  
hash 区块通过哈希函数生成的唯一标识字符串  
parentHash 上一个区块的hash，逐个相连形成区块链  
timestamp 出区块的时间戳  
gasUsed 区块内交易和操作消耗的gas总量  
gasLimit 区块内消耗gas总量上限，可以用来决定改区块可以打包多少交易  
transactions 区块打包的所有交易  
(1) 每个区块都把parent的hash写进区块头，由于parent的任意数据变动都会导致其hash变动，因而导致子区块及后续所有区块hash都会变动，想要篡改就必须修改后续的所有hash，这样的机制保证了区块链的不可篡改。  
(2) 所有交易的gas费综合不得超过gasLimit，如果超过了，交易不能完整执行，资产会被退回，但是gas费还是会被收取给该区块的矿工  
Transaction中字段：  
nonce 账户提交的交易序号，交易按照顺序被区块确认，防止重复交易  
from 交易签名者地址  
to 交易接收方地址  
input 交易的调用数据，包括调用的函数及其参数  
gas/gasPrice 为了单位gas出多少ether，越多矿工越先把交易打包进区块  
value 交易转走的ETH  
type 交易类型，分为0(Legacy), 1(EIP-2930), 2(EIP-1559)，目前常见0和2  
(1) ABI, Application Binary Interface，用来描述函数的名称、参数、事件；input前4B是函数标识符，后面每32B是一个参数，依次向后解析  
Receipt中字段：  
status 交易是否成功执行  
logs 交易事件日志，合约执行emit的事件列表  
contractAddress 新合约的地址，仅当部署合约，即to==nil时出现，合约调用时为零地址  

### 2025.12.14
I.查询历史数据  
geth运行后输出中，查询区块范围: 24009607 到 24009617 (共 10 个区块)  
找到了 548 条 Transfer 事件日志  
--- 第一条 Log 详情 ---  
TxHash: 0x4d012a819c67fc22f866806679e19057b9021850a0d239fd3378b1b8aeca0635  
BlockNumber: 24009607  
Topics: [0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef 0x000000000000000000000000000000000004444c5dc75cb358380d2e3de08a90 0x00000000000000000000000066a9893cc07d91d95644aedd05d03f95e1dba8af]  
II.实时监听
📦 [New Block] Height: 24009799 | Hash: 0xea27c325e597035eeda07bb8c8eda907b4866a4813136c4565d16b882815ee6d | Time: 1765702739  
🌊 [Pending Tx] 0x00e0e884191a04ed1c5df986f28f7976a157291bfdfacb0a3965df5667cc8243  
🌊 [Pending Tx] 0x8d5e5c672fb6b730ac1f2868876b863c7b57e025f373234a1c49e838ac67ffe2  
🌊 [Pending Tx] 0x2a0001ba572bf4c1f76f43a61ec21882b9ab4035a3a8fefe2d756e9c1c788c70  
......  
III.子图
🚀 开始使用 Cursor-based Pagination 全量拉取 Uniswap Pools...  
💡 核心原理：使用 id_gt 条件，利用数据库索引实现高效分页  
  
  [请求 #1] 获取 1000 条 | 范围: 0x000024feb2... ... 0x050dbc2588...  
  [请求 #2] 获取 1000 条 | 范围: 0x050f8d83d7... ... 0x09f6b2f56f...  
  [请求 #3] 获取 1000 条 | 范围: 0x09f83e6cd4... ... 0x0f407054e6...  
  ......

### 2025.12.21
补全了log_filter_big.go，运行后得到结果：  
已查询区块 24061467-24061466
✅ 成功: 在区块 24051466 到 24061466 之间找到了 620 条 Swap 事件日志
--- 第一条 Log 详情 ---  
TxHash: 0xc2c9ad46e9dc1619561b57ba08ea59437c8fdf8df943e3ec1df6059f37fdc3e7  
BlockNumber: 24051520  
Topics: [0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822 0x00000000000000000000000066a9893cc07d91d95644aedd05d03f95e1dba8af 0x000000000000000000000000aacd8a4525616f6639f23faa16a8e25271d4c9cb]  
用curl txlist得到（第一个block为例）：
{"blockNumber":"23974499","blockHash":"0xbaabc8efcc9fded2cffbf86adedde0bed6afe12ece63c9610e7c1a257b298427","timeStamp":"1765274591","hash":"0x7303729a35c16b76fdca36ca3fca9808f13e48dd84fcf74bc1fb2fd1610d9587","nonce":"183","transactionIndex":"172","from":"0xa415e5ddf7f3411cd80d1199f2eb01d1f4978f6f","to":"0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc","value":"0","gas":"26829","gasPrice":"243484710","input":"0x095ea7b30000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488dffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff","methodId":"0x095ea7b3","functionName":"approve(address _spender, uint256 _value)","contractAddress":"","cumulativeGasUsed":"17501803","txreceipt_status":"1","gasUsed":"26486","confirmations":"87096","isError":"0"}  
......

### 2025.12.28  
swap函数首先检查希望给出的代币数量是否至少有一个大于0，并且现有储备大于这个数量，那么向to转账amountOut。如何data字节长度不为0，执行回调合约，然后读取当前余额balance，并计算放入的代币量amountIn，如果没有放入代币，则交易错误。扣除放入的手续费amountIn*0.003，由于手续费的原因需要保证x'*y'>=xy。  
使用xy=k保证极简，任何量级都可以直接成交，价格沿着双曲线滑动。  
update更新了链上reserve为当前真实余额。  


### 2025.07.12

<!-- Content_END -->
