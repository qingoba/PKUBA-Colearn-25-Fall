# PKUBA 共学小组 2025 Fall

## 介绍

欢迎参加 PKUBA 共学小组活动！本次共学活动将围绕区块链技术展开，分为三个专业小组，帮助大家深入学习 DeFi 合约开发、合约安全以及链上数据分析等核心技能。

通过本次共学，你将：
- 深入理解主流 DeFi 项目的机制和设计
- 掌握智能合约的安全审计技能
- 学会链上数据的获取、索引和统计分析
- 建立持续学习的习惯和知识体系

## 学习小组

本次共学活动分为三个专业小组，每个小组专注于不同的技术方向：

### 1. DeFi 合约组
- 研究主流 DeFi 项目的机制和设计
- 合约源码学习
- 实际与合约交互
- inter-contract 交互

### 2. 合约安全组
- 经典合约漏洞学习
- CTF game
- 合约逆向

### 3. 链上数据组
- 链上数据的获取、索引和统计分析
- monitor bot 的实现和部署

**注意**：前几周的学习内容不区分小组，为基础知识学习阶段，后续会针对每个小组提供具体的 Topic。



## 报名时间

- 报名开始时间：2025-11-16
- 报名结束时间：待定

## 共学时间

- 共学开始时间：2025-11-17
- 共学结束时间：不早于 2026-01-12

## 发起组织

- PKUBA（北京大学区块链协会）

## 打卡规则

- **打卡频率**：每周至少打卡一次
- **请假规则**：一学期允许请假一次
- **打卡方式**：将自己的学习笔记更新到自己的 .md 文件中
- **打卡时间**：从下周一开始，结束时期待定

## 激励机制

本次共学采用**质押与奖池**的激励机制：

1. **初始奖池**：协会会启动一个初始奖池
2. **个人质押**：每个参加的同学都需要往奖池中质押一定金额
3. **奖励分配**：
   - 顺利完成共学小组的同学将**瓜分奖池**
   - 未完成的同学**无法赎回**质押金额

我们相信，通过这种激励机制，能够更好地激励大家坚持学习，同时也让完成学习的同学获得额外的奖励。

## 报名和打卡规则

因为共学的报名和打卡是基于 GitHub 进行开展的，如果你是非开发者或者对 git 操作不熟悉，可以利用 AI, 搜索引擎, 或在群里询问大家

### 报名流程

- **Step01**：Fork 本仓库
- **Step02**：复制 Template.md 创建你的个人笔记文件，并根据文档指引填写你的信息，并将文件重命名为你的 GitHub ID：`YourGitHubID.md`, **注意要把你的文件放在对应的小组文件夹内哦, 不要直接放在根目录**
- **Step03**：创建一个 PR 到当前仓库，本共学助教会对你的 PR 进行 review，review 通过后，你的 PR 会被 merge 到 main 分支，这个时候你会收到邀请加入这个仓库 contribution 的邮件，接受邀请后，你会自动获得 main 分支的 push 权限
- **Step04**：完成以上三个步骤，恭喜你报名成功，后续就可以将你的学习记录直接 push 到 main 分支进行更新

### 打卡方式

- 报名成功后，你将拥有 main 分支的 push 权限，你需要将每周的学习笔记更新到你的 `YourName.md` 文档中，提交更新后，我们会自动更新你的打卡状态到下面的打卡记录表
- 如果你不在 UTC+8 时区，需要添加时区 code 到你的 `YourName.md` 文件的开始，错误的时区设置可能会使自动化打卡脚本错误计算打卡时间，具体请参考：[Template.md](Template.md)
- 当你提交笔记时，请确保以下几点，否则打卡可能会失败：
  - 在 `YourName.md` 文档，请将笔记内容放到以下代码块中，且 `<!-- Content_START -->` 和 `<!-- Content_END -->` 不能删除:
    ```
    <!-- Content_START -->
    ### 日期
    笔记内容
    <!-- Content_END -->
    ```
  - 日期格式为 `### 2024.07.11`，请不要随意更改
- **注意**：你的笔记文件可以放在仓库根目录，也可以放在子文件夹中，脚本会自动识别并更新打卡状态

## 共学打卡记录表

✅ = Done ⭕️ = Missed ❌ = Failed

<!-- START_COMMIT_TABLE -->
| Name | W1 (11.17) | W2 (11.24) | W3 (12.01) | W4 (12.08) | W5 (12.15) | W6 (12.22) | W7 (12.29) | W8 (01.05) |
| ------------- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| [DeFi/CauchyK9](https://github.com/qingoba/PKUBA-Colearn-25-Fall/blob/main/DeFi/CauchyK9.md) | ✅ | ⭕️ |   | | | | | |
| [Afterglow36](https://github.com/qingoba/PKUBA-Colearn-25-Fall/blob/main/Afterglow36.md) |  ⭕️ | ⭕️ | ⭕️ | ⭕️ | ⭕️ | ⭕️ | ⭕️ | ⭕️ |
| [miyosep](https://github.com/qingoba/PKUBA-Colearn-25-Fall/blob/main/miyosep.md) |  ⭕️ | ⭕️ | ⭕️ | ⭕️ | ⭕️ | ⭕️ | ⭕️ | ⭕️ |
| [Week1](https://github.com/qingoba/PKUBA-Colearn-25-Fall/blob/main/Week1.md) | ⭕️ | ❌ | | | | | | |
| [DeFi/miyosep](https://github.com/qingoba/PKUBA-Colearn-25-Fall/blob/main/DeFi/miyosep.md) | ⭕️ | ✅ |   | | | | | |
| [Onchain-data/Afterglow36](https://github.com/qingoba/PKUBA-Colearn-25-Fall/blob/main/Onchain-data/Afterglow36.md) | ✅ | ✅ |   | | | | | |
| [Onchain-data/ai0415](https://github.com/qingoba/PKUBA-Colearn-25-Fall/blob/main/Onchain-data/ai0415.md) | ⭕️ | ❌ | | | | | | |
| [Security/henrymartin262](https://github.com/qingoba/PKUBA-Colearn-25-Fall/blob/main/Security/henrymartin262.md) | ✅ | ⭕️ |   | | | | | |
| [Onchain-data/donnyqiu](https://github.com/qingoba/PKUBA-Colearn-25-Fall/blob/main/Onchain-data/donnyqiu.md) | ✅ | ⭕️ |   | | | | | |
| [DeFi/Lucas-gs9](https://github.com/qingoba/PKUBA-Colearn-25-Fall/blob/main/DeFi/Lucas-gs9.md) | ✅ | ✅ |   | | | | | |
| [Security/0xTyche](https://github.com/qingoba/PKUBA-Colearn-25-Fall/blob/main/Security/0xTyche.md) | ✅ | ⭕️ |   | | | | | |
| [DeFi/YaoShuai-hub](https://github.com/qingoba/PKUBA-Colearn-25-Fall/blob/main/DeFi/YaoShuai-hub.md) | ✅ | ✅ |   | | | | | |
| [Onchain-data/odsbaron](https://github.com/qingoba/PKUBA-Colearn-25-Fall/blob/main/Onchain-data/odsbaron.md) | ✅ | ⭕️ |   | | | | | |
| [Onchain-data/RenJW418](https://github.com/qingoba/PKUBA-Colearn-25-Fall/blob/main/Onchain-data/RenJW418.md) | ✅ | ✅ |   | | | | | |
| [Onchain-data/Ariaboopboop](https://github.com/qingoba/PKUBA-Colearn-25-Fall/blob/main/Onchain-data/Ariaboopboop.md) | ✅ | ⭕️ |   | | | | | |
| [Onchain-data/munger999](https://github.com/qingoba/PKUBA-Colearn-25-Fall/blob/main/Onchain-data/munger999.md) | ⭕️ | ❌ | | | | | | |
| [Onchain-data/ZhaZhaFon](https://github.com/qingoba/PKUBA-Colearn-25-Fall/blob/main/Onchain-data/ZhaZhaFon.md) | ✅ | ✅ | ✅ | | | | | |
| [Onchain-data/Jiaosifang](https://github.com/qingoba/PKUBA-Colearn-25-Fall/blob/main/Onchain-data/Jiaosifang.md) | ⭕️ | ❌ | | | | | | |
| [DeFi/billyoftea](https://github.com/qingoba/PKUBA-Colearn-25-Fall/blob/main/DeFi/billyoftea.md) | ✅ | ✅ |   | | | | | |
| [Onchain-data/Turing7777](https://github.com/qingoba/PKUBA-Colearn-25-Fall/blob/main/Onchain-data/Turing7777.md) | ✅ | ⭕️ |   | | | | | |
| [Onchain-data/AliceF0M0](https://github.com/qingoba/PKUBA-Colearn-25-Fall/blob/main/Onchain-data/AliceF0M0.md) | ⭕️ | ❌ | | | | | | |
| [Onchain-data/WaterBearBobit](https://github.com/qingoba/PKUBA-Colearn-25-Fall/blob/main/Onchain-data/WaterBearBobit.md) | ⭕️ | ❌ | | | | | | |
| [DeFi/lionelll](https://github.com/qingoba/PKUBA-Colearn-25-Fall/blob/main/DeFi/lionelll.md) | ⭕️ | ❌ | | | | | | |
| [Onchain-data/aliced-crypto](https://github.com/qingoba/PKUBA-Colearn-25-Fall/blob/main/Onchain-data/aliced-crypto.md) | ✅ | ✅ |   | | | | | |
| [Week3](https://github.com/qingoba/PKUBA-Colearn-25-Fall/blob/main/Week3.md) | ⭕️ | ❌ | | | | | | |
<!-- END_COMMIT_TABLE -->



























































































<!-- STATISTICALDATA_START -->
## 统计数据

- 总参与人数: 0
- 完成人数: 0
- 完成用户: 
- 全勤用户: 
- 淘汰人数: 0
- 淘汰率: 0.00%
<!-- STATISTICALDATA_END -->
