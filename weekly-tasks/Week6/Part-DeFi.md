# Uniswap V2 源码研究

本周 DeFi 小组的任务是：深入研究 **Uniswap V2** 的源代码和文档，理解其核心机制，为下周的套利策略打下基础。

## 任务目标

 **核心目标：** 理解 Uniswap V2 的核心合约逻辑，特别是：
- `Pair` 合约的 `swap` 函数工作原理
- `Router` 合约与 `Pair` 合约的配合机制
- 流动性池的定价公式（恒定乘积公式）

-  理解这些机制是进行套利、MEV 等策略的基础。只有深入理解 DEX 的工作原理，才能发现套利机会并设计有效的策略。

## 学习资源

### 1. 官方文档

- **Uniswap V2 文档：** https://docs.uniswap.org/contracts/v2/overview
- **Uniswap V2 白皮书：** https://uniswap.org/whitepaper.pdf

### 2. 源代码

- **Uniswap V2 Core（核心合约）：** https://github.com/Uniswap/v2-core
  - 重点关注：`UniswapV2Pair.sol`（Pair 合约）
- **Uniswap V2 Periphery（外围合约）：** https://github.com/Uniswap/v2-periphery
  - 重点关注：`UniswapV2Router02.sol`（Router 合约）

### 3. 推荐阅读顺序

1. 先阅读官方文档，了解整体架构
2. 阅读 `UniswapV2Pair.sol`，理解流动性池的核心逻辑
3. 阅读 `UniswapV2Router02.sol`，理解用户如何与 Pair 交互
4. 结合代码和文档，理解完整的交易流程

## 核心问题与思考方向

在阅读源代码时，请思考以下问题：

### Pair 合约相关

1. **`swap` 函数：**
   - `swap` 函数如何计算输出金额？
   - 为什么使用 `x * y = k` 的恒定乘积公式？
   - `swap` 函数中的 `_update` 函数做了什么？
   - 滑点保护是如何实现的？

2. **流动性管理：**
   - `mint` 函数如何计算 LP Token 数量？
   - `burn` 函数如何计算返还的代币数量？
   - 为什么首次添加流动性时 LP Token 数量等于 sqrt(x * y)？

3. **价格预言机：**
   - `_update` 函数中的 `price0CumulativeLast` 和 `price1CumulativeLast` 是什么？
   - 如何利用这些累积价格计算 TWAP（时间加权平均价格）？

### Router 合约相关

1. **交易流程：**
   - 用户调用 `swapExactTokensForTokens` 时，Router 做了什么？
   - Router 如何确定使用哪个 Pair？
   - Router 如何保证交易原子性（要么全部成功，要么全部失败）？

2. **路径选择：**
   - 什么是"路径"（path）？
   - 为什么需要多跳交易（multi-hop）？
   - Router 如何处理直接交易对和间接交易对？

3. **滑点保护：**
   - `amountOutMin` 参数的作用是什么？
   - 如何计算合理的滑点容忍度？




**注意：** 本周不需要部署池子或进行实际交易，重点是理解源代码和机制。下周我们将基于这些理解进行套利实践。



