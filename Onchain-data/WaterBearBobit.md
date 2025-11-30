---
timezone: UTC+8
---

> 请在上边的 timezone 添加你的当地时区(UTC)，这会有助于你的打卡状态的自动化更新，如果没有添加，默认为北京时间 UTC+8 时区


# 你的名字

1. 自我介绍
Hi, 我是Vito，处于链上数据的获取和处理很感兴趣
2. 你认为你会完成这次共学小组吗？会的！
3. 你的联系方式（Wechat）：lbz2830861914

## Notes

<!-- Content_START -->

### 2025.11.23

笔记内容
Week1 智能合约挑战学习笔记（简短版）

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


### 2025.11.30

<!-- Content_END -->
