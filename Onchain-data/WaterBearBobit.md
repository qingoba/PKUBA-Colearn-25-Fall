---
timezone: UTC+8
---

> 请在上边的 timezone 添加你的当地时区(UTC)，这会有助于你的打卡状态的自动化更新，如果没有添加，默认为北京时间 UTC+8 时区


# 你的名字

1. 自我介绍
Hi, 我是Vito，处于链上数据的获取和处理很感兴趣
2. 你认为你会完成这次共学小组吗？会的！
3. 你感兴趣的小组：Onchain-data
4. 你的微信号：lbz2830861914
5. 质押的交易哈希：0x8e3727281bc0262fd84b8b026fd55e9be879b4456844a8cd79d38208497e01c4

## Notes

<!-- Content_START -->

### 2025.11.23

笔记内容
Week1 智能合约挑战学习笔记

1. 理解了 EOA 与合约账户区别：
   - EOA（钱包）有私钥，tx.origin = msg.sender；
   - 合约账户没有私钥，msg.sender = 合约地址。
   - 靶子合约用 require(msg.sender != tx.origin) 强制只能由合约调用。

2. 学会了使用合约进行“代理调用”：
   - 必须写一个 Attack 合约，让 Attack 合约去调用靶子合约的 query()。
   - 调用链变成：钱包 → Attack → Target，使得 msg.sender = Attack 地址。

3. 熟悉了 Remix + MetaMask + Sepolia 操作流程：
   - 在 Remix 编译 Attack.sol；
   - 切换 MetaMask 到 Sepolia；
   - 部署 Attack 合约并执行 attack()。

4. 能够读懂基本 Solidity 逻辑：
   - keccak256 哈希计算；
   - interface 用于调用外部合约；
   - event、mapping、bytes32 等基础类型和用法。

5. 了解了交易返回值与事件的区别：
   - 返回值不会显示在 Etherscan；
   - 挑战成功通过事件 ChallengeCompleted 记录在 logs。

总结：
本次任务主要学习的是“智能合约之间的调用机制”，特别是 msg.sender / tx.origin 区别，以及如何通过自定义合约绕过合约限制并与靶子合约交互。


### 2025.12.07
Week3_使用 Geth 读取链上数据
1. Block 的 number、hash、parentHash、timestamp 等字段反映了一条链如何通过哈希指针保持不可篡改，gasUsed 与 gasLimit 则体现出链对单笔交易与整个区块计算量的资源调控。

2. Transaction 则包含执行动作的所有“意图”，如 nonce、from/to、value、gas 与 EIP-1559 费用模型，input 和 ABI 则决定合约调用的具体方式。

3. Receipt 代表真实执行结果，status、logs 与 contractAddress 说明一笔交易是否成功、触发了哪些事件、是否生成了新合约。

4. 整体理解了以太坊执行模型：交易输入 → EVM 执行 → gas 计费 → 事件日志 → receipt 落链。

<!-- Content_END -->
