# Part I - 动手部署一个智能合约

🌟 手把手带你部署第一个智能合约！🚀

无论你是刚刚入门，还是已经对链上交易有所了解，这次教程都将带你完整走一遍在 Ethereum Sepolia 测试网部署智能合约的全过程。别担心，参考我们 5 分钟的视频教程, 全过程记录 https://drive.google.com/file/d/1KR5z9tDojekU1tELceUtHj3HwMlQxFRb/view?usp=drive_link

🎯 目标：在 Ethereum Sepolia 测试网上部署一个属于你自己的智能合约，并与该合约交互。

📌 准备工作：
1️⃣ 安装并配置好 MetaMask 钱包

2️⃣ 领取 Sepolia 测试网 ETH 测试币

3️⃣ 准备好你要部署的合约代码, 可以直接使用下面的例子:

参考文件：[HelloWeb3.sol](./HelloWeb3.sol)

🔄 操作流程详解：

1. 打开 Remix IDE：[https://remix.ethereum.org](https://remix.ethereum.org/)
2. 新建 HelloWeb3.sol 文件，可以使用本文件夹中的 [HelloWeb3.sol](./HelloWeb3.sol) 文件
3. 进入 Solidity Compiler 标签页，点击“Compile”
4. 进入 Deploy & Run Transactions 标签页
5. 环境选择 “Injected Provider - MetaMask”
6. 确认 MetaMask 已切换至 Sepolia 网络
7. 点击 Deploy，在 MetaMask 中确认交易
8. 等待部署成功，在 Remix 控制台复制合约地址和交易哈希
9. 在已经部署的合约中调用 hello 方法
10. 打开[区块链浏览器](https://sepolia.etherscan.io/)，搜索部署的合约地址，查看 Transactions 和 Events 结果

🎉 恭喜你！
你刚刚完成了第一个智能合约的部署！这意味着你已经掌握了区块链开发中最基础也最关键的一步。接下来，你可以尝试编写更复杂的合约逻辑，甚至开发一个完整的 DApp！

这是一个全新的起点，欢迎正式进入智能合约开发的世界！

# Part II - 智能合约编写

## 目标

通过编写智能合约与靶子合约交互，获取 Flag 并触发 `ChallengeCompleted` 事件。

## 靶子合约信息

合约地址：`0x4a6C0c0dc8bD8276b65956c9978ef941C3550A1B`

所在网络: Ethereum Sepolia, https://chainlist.org/chain/11155111, 浏览器 https://sepolia.etherscan.io/

可用方法

- `hint()` - 获取解题提示
- `query(bytes32 _hash)` - 提交答案获取 Flag, 该方法只能通过合约调用
- `getSolvers()` - 查看所有完成者地址

## 参考步骤

1. 编写并部署一个智能合约来调用靶子合约的 `hint()` 方法获取解题提示
2. 根据解题提示计算答案
3. 调用靶子合约的 `query()` 方法提交答案, 若答案正确, 则能够看到返回的 Flag 或者 ChallengeCompleted 事件

## 注意事项

- 靶子合约要求调用者必须是合约地址，不能直接用钱包调用
- 可以多次尝试，每次成功都会触发事件
- 与合约交互需要消耗 Gas Fee, 可以参考笔试文档来获取测试网代币 https://github.com/aliceyzhsu/crypto-techguy/blob/main/quests/get-ready.md

## 参考资料

- [Solidity 官方文档](https://docs.soliditylang.org/), [WTF 中文 Solidity 教程](https://www.wtf.academy/zh/course/solidity101)
- [Foundry 教程](https://book.getfoundry.sh/), Foundry 是一个工具集, 包含智能合约的构建/部署/调试等功能
- [Remix IDE](https://remix.ethereum.org/), Remix 是一个在线 IDE, 能够直接在网页上编写/部署/测试智能合约, 并且可以使用浏览器插件的钱包来签名
- (欢迎任何同学补充自己学习时用到的资料)
