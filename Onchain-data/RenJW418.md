---
timezone: UTC+8
---

> 请在上边的 timezone 添加你的当地时区(UTC)，这会有助于你的打卡状态的自动化更新，如果没有添加，默认为北京时间 UTC+8 时区


# 你的名字

1. 自我介绍 我是任纪武 2023级前沿交叉学科研究院直博生
2. 你认为你会完成这次共学小组吗？可以
3. 你感兴趣的小组 Onchain-data
4. 你的联系方式（Wechat or Telegram）Wechat: 15265978697
5. 质押的交易哈希：0x1760e86d7c46111ac14792631f891f1376b1794f86d857c955b8168291a75d09

## Notes

<!-- Content_START -->

### 2025.11.23

#### Part I - 动手部署一个智能合约

1.在Remix中创建合约并编译部署

```jsx
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

<img width="1917" height="1269" alt="image" src="https://github.com/user-attachments/assets/c01b0f7c-e85c-49ed-af4a-fb19e694f172" />


2.运行hello方法 并在区块链浏览器查看结果

<img width="1923" height="1268" alt="image" src="https://github.com/user-attachments/assets/7c7f9e74-bab1-4156-a24d-299f9ba9429a" />


Transactions结果

<img width="1391" height="737" alt="image" src="https://github.com/user-attachments/assets/207e4c9f-6480-4500-959b-7e3b6069413b" />


Events结果

<img width="1392" height="843" alt="image" src="https://github.com/user-attachments/assets/2962beff-4de0-440f-a766-d200fc60a4ae" />

### 2025.11.27
#### Part II - 智能合约编写

成功获取FLAG: PKU_Blockchain_Colearn_Week1_Success

交易哈希: 0x7661fbb60c03948fb20c9bc7f13de6e45dc3933ca0b2963b01ec73d5446b99fb

<img width="1921" height="1268" alt="image" src="https://github.com/user-attachments/assets/4439525e-4d45-4798-a97f-5edf3dc2d9b9" />

### 2025.12.5
#### Part I - Geth 简介
以太坊客户端、节点、RPC是维持以太坊正常运行的三个概念。  
以太坊客户端：协议的具体实现  
节点：全节点、轻节点、归档节点  
RPC：外部接口  
#### Part II - Go 语言环境准备
1.安装Go  
<img width="265" height="36" alt="image" src="https://github.com/user-attachments/assets/c8b9896f-6d54-471c-83e7-e69ae57b2f89" />  
2.新建项目  
<img width="367" height="142" alt="image" src="https://github.com/user-attachments/assets/06b19187-7fc3-4ec1-b106-a2f5a5adf8b3" />  
3.安装 go-ethereum 库  
<img width="778" height="412" alt="image" src="https://github.com/user-attachments/assets/1cde788e-c410-4e18-a064-8befff8ac990" />  
<img width="1048" height="715" alt="image" src="https://github.com/user-attachments/assets/52f50f6a-78b5-4de8-8191-07d8b2a86b7b" />  
#### Part III - 使用 go-ethereum 读取链上数据
<img width="1440" height="853" alt="image" src="https://github.com/user-attachments/assets/10d4da65-76e2-4e1c-9ae6-d0b48269d7db" />  
<img width="797" height="660" alt="image" src="https://github.com/user-attachments/assets/2415e5c9-90f1-4328-8bca-868e9f68a4d0" />  
<img width="799" height="870" alt="image" src="https://github.com/user-attachments/assets/6560dd78-618c-46d1-8fd4-9b196d6b243d" />  
<img width="658" height="470" alt="image" src="https://github.com/user-attachments/assets/27a17f1f-3d23-48e3-840c-01d139fcdaed" />  

#### Follow Up - 理解 block, transaction, receipt 的结构
##### 关于 Block 建议理解的字段包括：
number:区块高度（第几块）  
hash:该区块的唯一哈希值  
parentHash:上一个区块的 hash  
timestamp:出块时间  
gasUsed / gasLimit:此区块内所有交易消耗的总gas/一个区块能容纳的最大gas  
transactions:交易  
为何 parentHash 能形成区块链？每个区块都通过哈希指针包含前一区块的 hash。由于密码学哈希函数具备 puzzle-friendliness、collision resistance 和 hiding 等性质，这种哈希指针可以安全且唯一地将区块串接起来，从而形成不可篡改的区块链结构。  
gasLimit 如何影响合约执行？交易gasLimit决定单次合约执行能否成功；区块gasLimit决定区块一次能加入多少复杂交易。如果执行需要的gas超过gasLimit，交易会失败或无法被链接受。

##### 关于 Transcation 建议理解的字段包括：
nonce:某个地址从 0 开始递增的交易计数  
from / to:交易的发送者地址，接收方地址  
input (call data):输入数据，是调用合约的“函数选择器 + 参数”的编码结果  
gas / gasPrice:gasLimit/单价gas的价格  
value:交易中转账的 ETH 数额  
type (legacy, EIP-1559):交易类型.type = 0 → Legacy 交易（老式，只有 gasPrice）type = 2 → EIP-1559 交易（主流，包含 maxFeePerGas、maxPriorityFeePerGas）type = 1 → EIP-2930（带 access list）  
Follow-Up：  
什么是 ABI ？一笔交易最终执行逻辑是如何解析 input 的? Application Binary Interface（应用二进制接口）;把人类可读的函数调用编码成交易 input 中的字节序列,并且能在 EVM 中被正确反解码.  
Step 1：取出 input 前 4 字节 → 函数选择器（Function Selector）  
Step 2：EVM 用 ABI 将选择器映射到合约内函数  
Step 3：继续根据 ABI 规则解析参数  
Step 4：执行对应函数逻辑  
Step 5：如果未匹配任何函数 → fallback() / receive()  

##### 关于 Receipt 建议理解的字段包括:
status:交易执行结果的状态  
logs:合约执行过程中emit的事件列表  
contractAddress:部署合约生成的新地址  

### 2025.12.14
学习本周内容
在b站学习肖老师公开课 受益匪浅

### 2025.12.21
继续消化上次内容 + 学习肖老师以太坊部分
<!-- Content_END -->
