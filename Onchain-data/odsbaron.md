---
timezone: UTC+8
---

> 请在上边的 timezone 添加你的当地时区(UTC)，这会有助于你的打卡状态的自动化更新，如果没有添加，默认为北京时间 UTC+8 时区


# 你的名字

1. 自我介绍
大家好，我是25级汇丰金融科技欧岱松，希望能通过这次贡献快速入门链上数据分析，部署相应的监控机器人
2. 你认为你会完成本次残酷学习吗？
会的。
3. 你的联系方式（推荐 Telegram）

tele: https://t.me/odsbaron

wx: ods871031393
## Notes

<!-- Content_START -->

### 2025.11.17-

目前完成了PartI部分，成功完成了能够在区块链浏览器上查询到合约部署，第二部分还在探索中

![合约部署成功截图](https://private-user-images.githubusercontent.com/108411119/517843569-a34a64c0-1dc4-46d6-ac9e-63ced80ddb7a.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NjM5MDI3MTQsIm5iZiI6MTc2MzkwMjQxNCwicGF0aCI6Ii8xMDg0MTExMTkvNTE3ODQzNTY5LWEzNGE2NGMwLTFkYzQtNDZkNi1hYzllLTYzY2VkODBkZGI3YS5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjUxMTIzJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MTEyM1QxMjUzMzRaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT05ZjQ2MTJjNjU1NjAzYmUxNWQ5Njc5NTA4N2VkODIwYmJjMGU5YmIzMzFhYjA3OTY3MDYzOWQ0ZTY0NTJlZWJhJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.TKu61nO9A1A3F_23bkRzw_R7KSQpG0DvMb6GA1HiPKA)

![区块链浏览器查询截图](https://private-user-images.githubusercontent.com/108411119/517843590-4f6a4010-f1e7-4fb4-9369-c3a7fa774f17.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NjM5MDI3NDMsIm5iZiI6MTc2MzkwMjQ0MywicGF0aCI6Ii8xMDg0MTExMTkvNTE3ODQzNTkwLTRmNmE0MDEwLWYxZTctNGZiNC05MzY5LWMzYTdmYTc3NGYxNy5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjUxMTIzJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MTEyM1QxMjU0MDNaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT1hY2QwZjI5OTQzMmEwNDI2NTgxMWVlNDBlMjFmYjUxNmEzM2M0MGJiODg2OWEwYmIyYTVjYTllZDgxNzYzNmY2JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.PgTj_wv5AHmD_n2tYGUozclgw9OOBpBDWVdawlFUqss)



### 2025共学任务第二周

#### Part II 智能合约挑战记录
- **任务目标**：通过与靶子合约 `0x5DAB5b8600EaBB7450fCD084D9A377F280031297`（Sepolia）交互提交正确答案，触发 `FlagReceived` 事件并拿到 `FLAG{PKU_Blockchain_Colearn_Week1_Success}`。
- **执行环境**：Remix + MetaMask (Sepolia 网络，测试币来自 faucet)，合约代码基于仓库 `Part2-Challenge/Solver.sol` 并在 Remix 中将 `TARGET` 修改为上述靶子地址。
- **关键思路**：必须由合约调用 `query()`，所以先部署 ChallengeSolver，再用它请求提示、计算答案并代表我提交交易。
- **产出记录**：Answer 为 `keccak256("PKUBlockhain") = 0xe2a73c8e3af6379fa58e477b0e2129f21e0230100f0462b9832b00cd22414215`，最终链上凭证 tx `0x74971ef58e1439ff1b8659af7dbc8a81ffd25d09ee8a94d29372878bdef1a575`。

#### Solver 合约关键逻辑
- `Part2-Challenge/Solver.sol` 里先定义 `ITargetContract` 接口，把靶子合约的 `hint/query/getSolvers` 规范化，随后在 `ChallengeSolver` 中通过 `address public constant TARGET = 0x4a6C0c0dc8bD8276b65956c9978ef941C3550A1B;` 固定交互对象，这样每次部署后无需手动填地址。
- `getHint()` 直接调用 `ITargetContract(TARGET).hint()`，将返回字符串保存进 `lastHint`，并通过 `event HintReceived(string hint)` 记录日志，方便在链上回放提示内容。
- `submitAnswer(bytes32 _answer)` 通过 `target.query(_answer)` 把哈希提交给靶子合约，并将 flag 写入状态变量 `flag`；为了后续复查，函数还依次触发 `AnswerSubmitted` 与 `FlagReceived` 事件。
- `calculateHash(string memory input)` 只是 `keccak256(abi.encodePacked(input))` 的轻量封装，用来在链上计算 `PKUBlockhain` 的哈希，避免本地拼写差错。
- 额外的 `tryCommonAnswers()`、`autoSolve()`、`toString()` 等工具函数，也为之后遇到不同提示的同学预留了脚本化解题路线。

#### 操作步骤
1. **部署 Solver**：在 Remix 里导入 `ChallengeSolver`，确认构造函数只设置 `owner`，`TARGET` 常量指向 0x5DAB5b...；使用 `Injected Provider - MetaMask` 在 Sepolia 上完成部署。
2. **获取提示**：调用 `getHint()`，链上返回需要提交 `keccak256("PKUBlockhain")`（注意单词少了一个 “c”）。函数同时把提示写入 `lastHint`，方便在 Remix 的 storage 面板复查。
3. **计算答案**：为了避免手算出错，直接调用合约里的 `calculateHash("PKUBlockhain")` 得到 `0xe2a73c8e3af6379fa58e477b0e2129f21e0230100f0462b9832b00cd22414215`，并用 Remix 的返回值填入下一步。这个结果也可以通过 `cast keccak` 或 `ethers.utils.keccak256` 交叉验证。
4. **提交 query**：执行 `submitAnswer(bytes32)`，参数填入上一步的哈希；交易执行后在 Remix 事件日志里能看到 `AnswerSubmitted` 与 `FlagReceived`，而 `flag` 状态变量里也保存了完整 Flag。
5. **验证结果**：在靶子合约 `getSolvers()` 中出现了我的 Solver 地址，同时在 Etherscan / Blockscout 上能查到相同 tx log，证明 ChallengeCompleted 事件已链上留痕。

#### 坑点与排查
- 直接用 EOA 在区块链浏览器调用 `query()` 会因为 `msg.sender` 不是合约而被 revert，必须通过自建 Solver 代理调用；我先在 Remix 控制台模拟了一次失败调用确认报错原因。
- Remix 有时无法显示 view 函数返回的中文提示，我通过事件 `HintReceived` 把提示字符串写进日志，再在交易详情里查看，规避 IDE 编码渲染问题。
- `hint()` 中的目标字符串拼写为 `PKUBlockhain`（缺 “c”），最初按常规拼写计算出了错误哈希；借助 `calculateHash` 对比两次输出后定位到了拼写差异。

#### PKU Blockchain CoLearn Week1 通关证明

**选手地址**  
`0x83263612eCc2cf4e862E38A3E3c9edd1342600c7`

**挑战合约地址（Sepolia）**  
`0x5DAB5b8600EaBB7450fCD084D9A377F280031297`

##### 最终成功交易（通关凭证）

**交易哈希**  
`0x74971ef58e1439ff1b8659af7dbc8a81ffd25d09ee8a94d29372878bdef1a575`

**区块高度**  
9701188

**查看链接**  
- Etherscan: https://sepolia.etherscan.io/tx/0x74971ef58e1439ff1b8659af7dbc8a81ffd25d09ee8a94d29372878bdef1a575  
- Blockscout: https://eth-sepolia.blockscout.com/tx/0x74971ef58e1439ff1b8659af7dbc8a81ffd25d09ee8a94d29372878bdef1a575

##### 关键日志（铁证）

```json
[
  {
    "from": "0x5DAB5b8600EaBB7450fCD084D9A377F280031297",
    "topic": "0xa4af99c2337f236a02d81d66ee523743d5888fa0d14e1cbe3319c976383c47db",
    "event": "AnswerSubmitted",
    "args": {
      "0": "0xe2a73c8e3af6379fa58e477b0e2129f21e0230100f0462b9832b00cd22414215"
    }
  },
  {
    "from": "0x5DAB5b8600EaBB7450fCD084D9A377F280031297",
    "topic": "0x43d29ddb0ec6130b6b00bfb0fb6fdc288946a2d80923af3c893206d4a11497a0",
    "event": "FlagReceived",
    "args": {
      "0": "FLAG{PKU_Blockchain_Colearn_Week1_Success}"
    }
  }
]
Flag（已成功获取）
FLAG{PKU_Blockchain_Colearn_Week1_Success}
我已成功通过 PKU Blockchain CoLearn Week1 挑战
提交 keccak256("PKUBlockhain")被判为正确
链上永久凭证：
https://sepolia.etherscan.io/tx/0x74971ef58e1439ff1b8659af7dbc8a81ffd25d09ee8a94d29372878bdef1a575
<!-- Content_END -->
