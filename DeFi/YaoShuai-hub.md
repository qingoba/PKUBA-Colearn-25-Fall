---
timezone: UTC+8
---

> 请在上边的 timezone 添加你的当地时区(UTC)，这会有助于你的打卡状态的自动化更新，如果没有添加，默认为北京时间 UTC+8 时区


# 你的名字

1. 自我介绍
  姚帅，前沿交叉学科研究院23级博士生，对DeFi感兴趣
2. 你认为你会完成这次共学小组吗？
  当然
3. 你感兴趣的小组
  DeFi
4. 你的联系方式（Wechat or Telegram）
  Wechat：13095680918
5. 质押的交易哈希
  0x0e29fcc4d7dccf18284f711c24421f11a18d87b30dacaa67406cba1c4b6ff169
## Notes

<!-- Content_START -->

### 2025.11.21
#### Part 1
- [x] 1.创建MetaMask钱包
- [x] 2.创建并部署合约，<img width="2880" height="1584" alt="image" src="https://github.com/user-attachments/assets/0e9419e0-cf74-4002-beed-f130d796a4c4" />
- [x] 3.运行hello，查看结果
  - [x] Transaction: <img width="2424" height="1144" alt="image" src="https://github.com/user-attachments/assets/31624060-f516-4e37-b3ec-365c35089490" />
  - [x] Events: <img width="2352" height="1236" alt="image" src="https://github.com/user-attachments/assets/b44a3c9f-19fb-423c-a077-4de55b0d1199" />
### 2025.11.30
#### Part 2
- [x] 成功记录: <img width="2880" height="1584" alt="image" src="https://github.com/user-attachments/assets/78014bb4-c853-4dc7-bf98-0b253d32bfe6" />

### 2025.12.07
学习B站肖臻老师的区块链课程ETH部分

### 2025.12.14
- [x] 安装go:<img width="842" height="178" alt="image" src="https://github.com/user-attachments/assets/49c82262-9165-4f9a-aa20-a8391b180d46" />

### 2025.12.15
- [x] week3 Part III <img width="1232" height="956" alt="image" src="https://github.com/user-attachments/assets/2ca74fc7-a590-4f80-b50b-69f40c21cf1e" />
### 2025.12.28
- [X] week4 Part I
  - [x] <img width="1660" height="454" alt="image" src="https://github.com/user-attachments/assets/4ed4f177-6b13-4a2e-83b9-f881bfb3d673" />
  - [x] try log_filter_big.go <img width="1884" height="1056" alt="image" src="https://github.com/user-attachments/assets/f409d760-09aa-41df-86ae-41a186bb178d" />
### 2026.1.4
- [x] week4 Part II <img width="962" height="662" alt="image" src="https://github.com/user-attachments/assets/0fb10374-8789-4010-93a1-d0d17501864b" /> 
<img width="884" height="996" alt="image" src="https://github.com/user-attachments/assets/a295aa95-6b41-4df2-bc83-2c70de560124" />

### 2026.1.10
- [x] week6 阅读Uniswap V2源码

### 2026.2.1
- [x] 完成思考题

---

# Uniswap V2 核心机制深度解析

## 一、 Pair 合约（底层逻辑）

### 1. `swap` 函数工作原理

* **输出金额计算：** Uniswap V2 的 `swap` 函数本身**并不计算**输出金额，它只负责执行交易和验证结果。计算逻辑通常在 Router 层的 `getAmountOut` 中完成。
* **恒定乘积公式 ：** 该公式确保了池子在任何价格下都能提供流动性。当资产  减少时，资产  必须成比例增加以维持  值（扣除手续费后  会略微增加），这种机制自动调节价格，无需外部报价单。
* **`_update` 函数的作用：** 1.  更新 `reserve0` 和 `reserve1`（记录池内余额）。
2.  计算并累加**价格累积值**，为链上预言机（TWAP）提供原始数据。
* **滑点保护：** 在 `Pair` 合约层级，滑点保护是通过最后的 `K` 值校验（乐观转账后的余额检查）来被动实现的。真正的用户侧滑点限制是在 `Router` 合约中通过预计算完成的。

### 2. 流动性管理

* **`mint` 函数（LP Token 计算）：** * **首次提供流动性：** 铸造 （即扣除最小流动性以防止由于精度导致的攻击）。
* **后续提供：** 按比例取最小值 。


* **`burn` 函数（返还代币）：** 根据用户销毁的 LP Token 占总供应量的比例，按当前池子余额等比例返还两种代币。
* **首次添加使用  的原因：** 这种几何平均数的算法确保了 LP Token 的价值增长与池子总价值的增长成线性关系，且不受两种代币初始比例（价格）的影响。

### 3. 价格预言机

* **价格累积值：** `price0CumulativeLast` 记录了 `price0 * time_elapsed` 的累加和。
* **计算 TWAP：** 通过在两个时间点读取累积值，计算差值并除以时间差：


这种方式极大提高了操纵价格的成本（需要操纵多个区块）。

---

## 二、 Router 合约（外围交互）

### 1. 交易流程与原子性

* **Router 的职责：** 1.  **安全计算：** 计算最优路径和输出金额。
2.  **转账协调：** 将用户的代币拉取（`transferFrom`）到 Pair 合约，并触发 Pair 的 `swap`。
* **Pair 选择：** 通过 `factory.getPair(tokenA, tokenB)` 定位具体的池子地址。
* **原子性保证：** 整个交易封装在一个以太坊交易中。如果其中任何一个步骤（如 `amountOut < amountOutMin`）触发 `revert`，所有状态变更（包括扣除的代币）都会回滚。

### 2. 路径选择（Pathing）

* **路径定义：** `path` 是一个代币地址数组，例如 `[ETH, USDT, USDC]`。
* **多跳交易（Multi-hop）：** 当 A 和 C 之间没有直接交易对，或者直接交易对深度不足时，Router 会通过中间代币 B（如 ETH/USDC）进行连续交易。
* **处理机制：** Router 会遍历路径，在每一对 Pair 之间执行 `swap`，前一个 Pair 的输出作为下一个 Pair 的输入。

### 3. 滑点保护实务

* **`amountOutMin`：** 这是用户愿意接受的最小代币产出量。如果最终计算出的产出低于此值，交易将失败。
* **滑点容忍度计算：** * **公式：** `expectedAmount * (1 - tolerance)`。
* **合理范围：** 通常为 0.1% 到 1%。在极端市场波动或低流动性池中，可能需要更高（如 5%-10%）才能保证成交，但这会面临更大的被夹（Sandwich Attack）风险。


---

## 三、 套利与 MEV 思考方向

1. **原子套利：** 利用 Router 的原子性，可以在同一个交易中从 A 池买入并在 B 池卖出，若最终余额未增加，交易直接 `revert`，从而实现零风险套利（仅损失 Gas）。
2. **滑点与三明治攻击：** 关注 `amountOutMin` 的设置。如果该值设置过低，MEV 机器人可以通过抢跑和垫后交易，挤压用户的成交价格从而获利。
3. **同步性：** 研究 `sync` 函数和池子余额的实时变动，是高频套利策略的基础。

<!-- Content_END -->
