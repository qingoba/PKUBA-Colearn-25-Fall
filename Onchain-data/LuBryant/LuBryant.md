---
timezone: UTC+8
---

> 请在上边的 timezone 添加你的当地时区(UTC)，这会有助于你的打卡状态的自动化更新，如果没有添加，默认为北京时间 UTC+8 时区

[toc]

# LuBryant

1. 自我介绍：大家好，我叫卢博文，是北大物院25级的博士，现在刚刚开始接触区块链，希望可以多多学习到相关的知识。
2. 你认为你会完成这次共学小组吗？我认为会的。
3. 你感兴趣的小组：Onchain-data
4. 你的微信号：18970447065
5. 质押的交易哈希：0xd9945efa0e52226f47de8b8937f34521fae5319271fdf004ab78a385f43847d9

## Notes

<!-- Content_START -->

### 2025.12.07

刚刚学可以看一些入门视频：
- [WEB3新人公开课——PKU BLOCKCHAIN DAO - PKU学生区块链中心](https://space.bilibili.com/586660955/lists/894352?type=season)
- [WEB3进阶公开课——PKU BLOCKCHAIN DAO - PKU学生区块链中心](https://space.bilibili.com/586660955/lists/4309697?type=season)
- [从0到1到∞：14讲学懂区块链 - BTCU高校区块链社区](https://space.bilibili.com/477534964/lists/864223?type=series)
- [区块链/web3/加密货币](https://space.bilibili.com/1122798707/lists/5206919?type=season)

#### Github 上复制文件
方法一：使用 GitHub Web Editor（最推荐，快捷键 .）
这是最接近本地操作体验的方法。GitHub 内置了一个基于 VS Code 的网页编辑器。

1. 打开你的 GitHub 仓库主页。
2. 在键盘上直接按下 英文句号键 .（或者将浏览器地址栏中的 github.com 改为 github.dev）。
3. 这会打开一个网页版的 VS Code 编辑器。
4. 在左侧文件树中，右键点击你要复制的文件 -> Copy。
5. 右键点击目标文件夹 -> Paste。
6. 点击左侧的“源代码管理”图标（Git 图标），输入 Commit 信息并提交更改。

方法二：手动“复制内容 + 新建文件”（适合单个小文件）
如果你不想进入编辑器模式，可以使用传统的笨办法：

1. 打开你想复制的文件。
2. 点击右上角的 Copy raw contents 图标（两个重叠的小方块）或者点击 Raw 按钮然后全选复制。
3. 回到仓库首页或目标文件夹。
4. 点击 Add file -> Create new file。
5. 在文件名处输入路径（例如 new_folder/filename.py）并粘贴内容。
6. 提交更改（Commit changes）。

#### Github 使用小知识
如何知道自己有使用权限？
方法一：最直观的 UI 验证（看“Settings”标签）
这是最简单的方法，不需要写代码。

1. 在浏览器中打开 你朋友的那个仓库页面（注意：不是你 Fork 出来的那个，是原本的那个 URL）。
2. 看页面顶部的导航栏（Code, Issues, Pull requests 那一行）。
3. 关键点： 如果你能看到 Settings（设置） 这一项，说明你已经是协作者了，拥有写权限。普通路人是看不到别人仓库的 Settings 选项的。

方法三：硬核命令行验证（Dry Run）
如果你已经把代码 clone 到本地了，可以用 Git 命令来测试。

注意： 因为你之前是 Fork 的，所以你本地默认的 origin 应该是指向 你自己的仓库。你需要先确认你有没有把你朋友的仓库添加为远程仓库（通常命名为 upstream，也可以取别的名字）。

请在终端执行以下步骤：

添加朋友的仓库作为远程地址（如果你还没加的话）：

```Bash
# 假设你朋友的仓库地址是 https://github.com/friend/project.git
git remote add upstream https://github.com/friend/project.git
```
测试推送权限（伪推送）： 使用 --dry-run 参数，这会模拟推送过程但不会真的把代码传上去，专门用来测试连接和权限。
```Bash
git push upstream main --dry-run
```
如果成功： 会显示 Everything up-to-date 或者模拟写入的信息。说明你有权限！

如果失败： 会显示 403 Forbidden 或者 Permission denied。

---
Fork 了项目只是自己有了一份，并不会修改原有仓库。

既然你已经在自己的 Fork 里提交了代码，现在要把这个改动“发送”给你的朋友。因为你是在网页端操作，最简单的方法就是 提 Pull Request (PR)。

虽然你有写权限，但 **跨仓库（从你的 Fork 到他的 Upstream）** 传输代码，在网页上只能通过 PR。

操作步骤：

1. 打开 你自己 的那个仓库页面（你能看到 Commit 的那个页面）。
2. 点击页面上方的 Pull requests 标签。
3. 点击绿色的 New pull request 按钮。
4. 关键检查：
    - 左边（Base repository）：应该是 你朋友的仓库 (main 分支)。
    - 右边（Head repository）：应该是 你的仓库 (main 分支)。
5. 你会看到两个仓库的差异（也就是你刚才修改的内容）。
6. 点击 Create pull request。

重点来了： 因为你有 写权限，当你创建完 PR 后，你会发现 Merge 按钮是绿色的（或者你可以直接去他的仓库里点 Merge）。你自己就可以批准并合并这个 PR，不需要等他操作。合并后，他的仓库就有了你的更新。

**下次如何直接利用“权限”修改？（不走弯路）**
如果你想利用他对你开放的权限，跳过 Fork 和 PR 的步骤，直接修改他的项目，你需要改变操作习惯：

场景 A：如果你坚持在网页上改
不要去你自己的仓库！

1. 直接在浏览器打开 你朋友的仓库 URL。
2. 找到那个文件。
3. 点击右上角的笔形图标（Edit）。
4. 修改完直接 Commit。
    - 注意：如果你的权限没问题，它会允许你直接 Commit to main branch。如果只能 Create a new branch，说明主分支被保护了，还是得走 PR。

场景 B：如果你在本地电脑（推荐，更有高手风范）
你需要告诉你的本地 Git，要把代码推送到哪里。

1. 在本地终端，把 你朋友的仓库 添加为一个新的远程地址（通常叫 upstream）
```Bash
git remote add upstream https://github.com/朋友ID/项目名.git
```
下次修改完代码，直接推送到他的仓库：

```Bash
git push upstream main
```

#### Week1 Part I - 动手部署一个智能合约
PKUBlockchain 25 Fall Get Ready Quest: https://github.com/aliceyzhsu/crypto-techguy/blob/main/quests/get-ready.md

🌟 手把手带你部署第一个智能合约！🚀

无论你是刚刚入门，还是已经对链上交易有所了解，这次教程都将带你完整走一遍在 Ethereum Sepolia 测试网部署智能合约的全过程。别担心，参考我们 5 分钟的视频教程, 全过程记录 https://drive.google.com/file/d/1KR5z9tDojekU1tELceUtHj3HwMlQxFRb/view?usp=drive_link

🎯 目标：在 Ethereum Sepolia 测试网上部署一个属于你自己的智能合约，并与该合约交互。


📌 准备工作：
1️⃣ 安装并配置好 MetaMask 钱包

2️⃣ 领取 Sepolia 测试网 ETH 测试币：https://cloud.google.com/application/web3/faucet/ethereum/sepolia 可以输入 ETH 的 address

3️⃣ 准备好你要部署的合约代码, 可以直接使用下面的例子:

```solidity
// SPDX-License-Identifier: MIT
// 指定编译器版本要求，0.8.0 及以上版本，但低于 0.9.0
pragma solidity ^0.8.0;

// 定义一个名为 HelloWeb3 的合约
contract HelloWeb3 {

    // 定义一个事件 Greeting，当调用 hello 函数时触发，用来在链上日志中记录“问候”发生时的发送者地址和时间戳。indexed 让 sender 变成可检索字段，前端/后端可以按地址过滤日志。这个 event 可以在区块链浏览器中看到
    event Greeting(address indexed sender, uint256 timestamp);
    
    // 合约的构造函数，在合约部署时执行一次，这里不做任何操作
    constructor() {}

    // 定义一个外部可调用的函数 hello
    function hello() external {
        /* 
        当有人调用 hello() 时，发出 Greeting 事件，内容包括：
        msg.sender：调用者地址。
        block.timestamp：当前区块时间戳（由出块者提供，通常接近当前时间，但可能有小偏差）。
        */
        emit Greeting(msg.sender, block.timestamp);
    }
}
```


🔄 操作流程详解：

1. 打开 Remix IDE：[https://remix.ethereum.org](https://remix.ethereum.org/)
2. 新建 HelloWeb3.sol 文件，粘贴上述代码
3. 进入 Solidity Compiler 标签页，点击“Compile”
4. 进入 Deploy & Run Transactions 标签页
5. 确认 MetaMask 已切换至 Sepolia 网络（在代币下方可以切换网络
6. 环境选择 “Injected Provider - MetaMask” （Injected Provider 表示 Metamask 是哪条链，就是哪个，也可以直接选用 Sepolia Testnet - MetaMask）
7. 右上角的网络，确保连接到了 remix
8. Estimated Gas 可以自己选（估算的是这笔“部署交易”大概会用掉多少 gas，然后把这个数（通常会再加一点余量）作为 gasLimit 填进交易里。它不是价格，后面在 Metamask 上会显示 预估手续费
9. Verify Contract on Explorers 可以勾上
10. 点击 Deploy，在 MetaMask 中确认交易
11. 等待部署成功，在 Remix 控制台复制合约地址和交易哈希
12. Remix 中，部署的合约会出现在左下角 Deployed Contracts 区域，记录的交易会在 Transactions recorded 区域显示
13. 展开 Deployed Contracts，会看到部署的合约，后面跟着 contract address 合约地址。
14. 在已经部署的合约中调用 hello 函数，点击 hello 按钮即可，因为 hello 函数是没有参数的。
15. 签名后，交易成功，复制交易的 contract address
16. 打开[sepolia 的区块链浏览器](https://sepolia.etherscan.io/)，搜索部署的合约地址，查看 Transactions 和 Events 结果。（Etherscan 就是以太坊的"公开账本查询网站"，所有链上交易、合约、地址信息都能在上面查到。为什么叫"浏览器"？因为区块链上所有数据都是公开的，Etherscan 就像一个"搜索引擎 + 展示界面"，让你能方便地浏览这些链上数据，而不用自己跑节点、写代码去查。）

下面进行实际操作：
编译完成：

<p align="center">
    <img alt="image" src="https://github.com/user-attachments/assets/39b984f7-8165-41cb-9da9-beec42c12f2a" />
</p>

编译完成后部署。合约需要一个 Owner，要进行签名

<img width="389" height="615" alt="image" src="https://github.com/user-attachments/assets/f0876244-e0b9-4b93-bc8f-a5d062b58664" />

部署成功
<img width="971" height="647" alt="image" src="https://github.com/user-attachments/assets/d788eacb-de73-494b-9e57-af5cfe6c22f0" />
```Bash
[block:9857972 txIndex:12]from: 0x5b9...dbA5Ato: HelloWeb3.(constructor)value: 0 weidata: 0x608...f0033logs: 0hash: 0x49d...51645
status	1 Transaction mined and execution succeed
transaction hash	0xb8cf5bb873c9e245c87c14b170084e6f3ec4879fbb99ab79481f6dd7230083de
block hash	0x49d764af04b14e744c024d8bec7a47adf4af5198733652bf65b0fe9a9ca51645
block number	9857972
contract address	0xF431B5677C341B7CE90C1ae9AD41E90de491125E
from	0x5b9e8d003C1D96D258E22B47cD00b8ac673dbA5A
to	HelloWeb3.(constructor)
transaction cost	102529 gas 
decoded input	{}
decoded output	 - 
logs	[]
raw logs	[]
```

成功部署之后，就可以调用 hello 函数，调用后需要签名

<p align="center">
    <img alt="image" src="md_assets/LuBryant/image.png" />
</p>

交易成功
```Bash
[block:9858274 txIndex:16]from: 0x5b9...dbA5Ato: HelloWeb3.hello() 0xF43...1125Evalue: 0 weidata: 0x19f...f1d21logs: 1hash: 0x696...b4c86
status	1 Transaction mined and execution succeed
transaction hash	0xe068c7ffd29a6d0dc2f104c53c6f581229bb0863f19463024af41efd2bb90575
block hash	0x696ef3145e54589f1b927a875fc7f0b083de06ec4e965784bc7d536f3f6b4c86
block number	9858274
from	0x5b9e8d003C1D96D258E22B47cD00b8ac673dbA5A
to	HelloWeb3.hello() 0xF431B5677C341B7CE90C1ae9AD41E90de491125E
transaction cost	22755 gas 
decoded input	{}
decoded output	 - 
logs	[
	{
		"from": "0xF431B5677C341B7CE90C1ae9AD41E90de491125E",
		"topic": "0xd3c5e74ab50b58334f02e7b17dde164cce30984a5d60289c73a1c72e44898518",
		"event": "Greeting",
		"args": {
			"0": "0x5b9e8d003C1D96D258E22B47cD00b8ac673dbA5A",
			"1": "1765955232"
		}
	}
]
raw logs	[
  {
    "_type": "log",
    "address": "0xF431B5677C341B7CE90C1ae9AD41E90de491125E",
    "blockHash": "0x696ef3145e54589f1b927a875fc7f0b083de06ec4e965784bc7d536f3f6b4c86",
    "blockNumber": 9858274,
    "data": "0x00000000000000000000000000000000000000000000000000000000694256a0",
    "index": 35,
    "topics": [
      "0xd3c5e74ab50b58334f02e7b17dde164cce30984a5d60289c73a1c72e44898518",
      "0x0000000000000000000000005b9e8d003c1d96d258e22b47cd00b8ac673dba5a"
    ],
    "transactionHash": "0xe068c7ffd29a6d0dc2f104c53c6f581229bb0863f19463024af41efd2bb90575",
    "transactionIndex": 16
  }
]
```

找到合约地址（Contract address），打开区块链浏览器：https://sepolia.etherscan.io/，输入 Contract address

部署成功，Events 中显示 Greeting
<p align="center">
    <img alt="image" src="https://github.com/user-attachments/assets/d9d361ec-11f1-46e7-b5e6-f8937a5cc975" />
</p>

现在任何人都可以和这个 Contract address 交互。

---

### 2025.12.12

#### Week 1 Part II - 智能合约编写
**目标**

通过编写智能合约与靶子合约交互，获取 Flag 并触发 `ChallengeCompleted` 事件。

**靶子合约信息**

合约地址：`0x4a6C0c0dc8bD8276b65956c9978ef941C3550A1B`

所在网络: Ethereum Sepolia, https://chainlist.org/chain/11155111, 浏览器 https://sepolia.etherscan.io/

可用方法

- `hint()` - 获取解题提示
- `query(bytes32 _hash)` - 提交答案获取 Flag, 该方法只能通过合约调用
- `getSolvers()` - 查看所有完成者地址

**参考步骤**

1. 编写并部署一个智能合约来调用靶子合约的 `hint()` 方法获取解题提示
2. 根据解题提示计算答案
3. 调用靶子合约的 `query()` 方法提交答案, 若答案正确, 则能够看到返回的 Flag 或者 ChallengeCompleted 事件

**注意事项**

- 靶子合约要求调用者必须是合约地址，不能直接用钱包调用
- 可以多次尝试，每次成功都会触发事件
- 与合约交互需要消耗 Gas Fee, 可以参考笔试文档来获取测试网代币 https://github.com/aliceyzhsu/crypto-techguy/blob/main/quests/get-ready.md

**参考资料**

- [Solidity 官方文档](https://docs.soliditylang.org/), [WTF 中文 Solidity 教程](https://www.wtf.academy/zh/course/solidity101)
- [Foundry 教程](https://book.getfoundry.sh/), Foundry 是一个工具集, 包含智能合约的构建/部署/调试等功能
- [Remix IDE](https://remix.ethereum.org/), Remix 是一个在线 IDE, 能够直接在网页上编写/部署/测试智能合约, 并且可以使用浏览器插件的钱包来签名
- (欢迎任何同学补充自己学习时用到的资料)

**使用代码**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// 1. 定义靶子合约的接口 (Interface)
// 我们不需要知道靶子的全部代码，只需要知道我们要调用的函数签名
interface ITarget {
    function hint() external view returns (string memory);
    function query(bytes32 _hash) external;
}

contract Solver {
    // 靶子合约地址
    address public targetAddress = 0x4a6C0c0dc8bD8276b65956c9978ef941C3550A1B;

    // 步骤 A: 获取提示
    // 这只是为了方便我们在 Remix 里直接看到提示内容
    function getHint() public view returns (string memory) {
        return ITarget(targetAddress).hint();
    }

    // 步骤 B: 提交答案
    // 假设逻辑是：将答案字符串进行 keccak256 哈希后提交
    // 如果题目逻辑不同，你可以修改这里的计算方式
    function solve(string memory solution) public {
        // 计算哈希 (通常 CTF 的 query(bytes32) 都是要求提交某个字符串的哈希)
        bytes32 answerHash = keccak256(abi.encodePacked(solution));
        
        // 调用靶子合约
        ITarget(targetAddress).query(answerHash);
    }

    // 备用：如果你在链下算好了 bytes32，直接用这个函数提交
    function solveRaw(bytes32 _hash) public {
        ITarget(targetAddress).query(_hash);
    }
}
```
在部署的时候，CONTRACT 要选择 Solver - Solver.sol

第二步：部署攻击合约
在 Remix 左侧点击 Solidity Compiler (以及图标)，点击 Compile Solver.sol。

点击左侧 Deploy & Run Transactions (以太坊图标)。

Environment 选择 Injected Provider - MetaMask (这会连接你的钱包)。

确保 Contract 选中的是 Solver。

点击 Deploy 按钮，在 MetaMask 中确认交易。

等待交易成功，左下角 "Deployed Contracts" 会出现你的合约。

第三步：获取提示 (Get Hint)
展开你刚部署的合约。

点击 getHint 按钮。

查看返回的字符串内容（Result）。

假设提示是 "Hello"，或者是某个具体的单词/短语。

注意：有时候提示本身就是一个谜题，你需要根据提示算出真正的答案字符串。

这是一个非常经典的 CTF（Capture The Flag）智能合约挑战任务。你需要充当一名“攻击者”，编写一个中间合约去调用靶子合约。

由于题目明确指出 query() 方法只能通过合约调用（通常是通过 msg.sender != tx.origin 来限制的），所以你不能直接在 Etherscan 上操作，必须写代码。

结果：
```
0: string: keccak PKUBlockchain
```

这句话的意思是：“请对字符串 PKUBlockchain 进行 keccak256 哈希运算，并将结果提交上来。”

keccak: 指的是哈希算法 keccak256 (以太坊的标准哈希算法)。

PKUBlockchain: 指的是你需要进行哈希的原始内容（原文）。

进入在线网站：https://emn178.github.io/online-tools/keccak_256.html

得到 `PKUBlockchain` 的哈希值为 `e2a73c8e3af6379fa58e477b0e2129f21e0230100f0462b9832b00cd22414215`

成功完成任务。

**新的代码**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Sepolia CTF Solver (Generic)
 * @notice
 *  目标：通过“合约调用”的方式与靶子合约交互：
 *    1) 调 hint() 读取提示
 *    2) 根据提示计算答案（通常是 keccak256 哈希）
 *    3) 调 query(bytes32) 提交答案哈希，触发靶子合约的 ChallengeCompleted 事件/返回 Flag
 *
 *  关键点：
 *    - 靶子合约 query() 限制“只能被合约调用”，所以我们必须从合约里去 call 它。
 *    - 由于你没有提供靶子合约 ABI/源码，本合约用 low-level call：
 *        - hint() 用 staticcall（只读）
 *        - query(bytes32) 用 call（可能改变靶子合约状态）
 *    - 返回值类型不确定时，先拿到 raw bytes，再选择 decode 成 string / bytes32 / address[]
 */
contract SepoliaFlagSolver {
    // ======== 0. 靶子合约地址（你题目里给的） ========
    address public constant TARGET =
        0x4a6C0c0dc8bD8276b65956c9978ef941C3550A1B;

    // ======== 1. 访问控制：只允许部署者操作（避免别人盗用你的 solver） ========
    address public immutable owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // ======== 2. 事件：把关键数据打到日志里，方便你在区块浏览器里直接看 ========

    /// @notice 把 hint() 返回的 raw 数据记录下来；如果能猜测出 string/bytes32 也一并记
    event HintFetched(bytes raw, string decodedString, bytes32 decodedBytes32);

    /// @notice 把 query() 返回的 raw 数据记录下来；如果能 decode 成 string/bytes32 也记
    event QuerySubmitted(bytes32 submittedHash, bytes rawReturn, string decodedString, bytes32 decodedBytes32);

    /// @notice 可选：把 getSolvers() 的解码结果打出来
    event SolversFetched(address[] solvers);

    // ======== 3. 读取 hint()：先拿 raw bytes，再“智能猜测”解码 ========

    /**
     * @notice 调用靶子合约 hint()，返回 ABI 编码后的 raw bytes
     * @dev
     *  staticcall：EVM 层面强制“不可写状态”，适合 view/pure 类函数。
     *  这里不假设 hint() 的返回类型，先直接拿回 data。
     */
    function hintRaw() public view returns (bytes memory data) {
        // 目标函数签名：hint()
        bytes memory callData = abi.encodeWithSignature("hint()");

        (bool ok, bytes memory ret) = TARGET.staticcall(callData);
        require(ok, _revertMsg(ret));

        return ret;
    }

    /**
     * @notice 尝试把 hint() 的返回值“猜测性解码”为 string 或 bytes32，并发事件方便查看
     * @dev
     *  ABI 规则：
     *   - 如果返回 bytes32，ret.length 通常是 32
     *   - 如果返回 string（动态类型），ret.length 通常 >= 64（包含 offset/length/data）
     *  这只是经验规则：我们用它做“尽力猜测”，不保证 100%。
     */
    function fetchHint() external returns (bytes memory raw) {
        raw = hintRaw();

        string memory asString = "";
        bytes32 asB32 = bytes32(0);

        if (raw.length == 32) {
            // 很像 bytes32
            asB32 = abi.decode(raw, (bytes32));
        } else {
            // 先尝试当作 string 解码；如果不是 string，会 revert
            // 为了不让整个函数 revert，我们用 try/catch 包一层外部调用技巧：
            // 这里用内部函数 _decodeString 来隔离 revert。
            try this._decodeString(raw) returns (string memory s) {
                asString = s;
            } catch {
                // 忽略：说明不是 string 或数据不符合 string ABI 编码
            }
        }

        emit HintFetched(raw, asString, asB32);
    }

    /**
     * @notice 仅用于 try/catch 的 string 解码“隔离器”
     * @dev
     *  注意：try/catch 只能包“外部调用”，所以这里用 this._decodeString(...) 触发一次外部调用。
     */
    function _decodeString(bytes memory raw) external pure returns (string memory) {
        return abi.decode(raw, (string));
    }

    // ======== 4. 计算答案 hash 的工具函数（你根据 hint 选择用哪个） ========

    /**
     * @notice 最常见：对“明文答案字符串”做 keccak256
     * @dev
     *  keccak256 是 Solidity 内置哈希；bytes(s) 是 UTF-8 字节序列。
     *  等价写法：keccak256(abi.encodePacked(s))（对单个 string 时等价）
     */
    function hashString(string calldata answerPlain) public pure returns (bytes32) {
        return keccak256(bytes(answerPlain));
    }

    /**
     * @notice 对“任意 bytes”做 keccak256
     * @dev
     *  当 hint 要你拼接/编码某些字段后再 hash，就可以先在本合约里拼出 bytes，再走这个函数。
     */
    function hashBytes(bytes calldata blob) public pure returns (bytes32) {
        return keccak256(blob);
    }

    /**
     * @notice 典型 CTF 拼接法：keccak256(abi.encodePacked(a, b, c...))
     * @dev
     *  encodePacked 是“紧密编码”，更省字节，但如果混用动态类型可能产生“拼接歧义/碰撞风险”；
     *  如果 hint 没要求，一般更推荐 abi.encode(...)（带类型边界）。:contentReference[oaicite:2]{index=2}
     */
    function hashPacked(string calldata a, string calldata b, uint256 n) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(a, b, n));
    }

    /**
     * @notice 更“安全”的结构化编码：keccak256(abi.encode(...))
     * @dev
     *  encode 会把每个参数按 ABI 规则 padding，类型边界明确，避免 packed 的拼接歧义。
     */
    function hashEncoded(string calldata a, string calldata b, uint256 n) public pure returns (bytes32) {
        return keccak256(abi.encode(a, b, n));
    }

    // ======== 5. 提交答案：必须从合约里调用 query(bytes32) ========

    /**
     * @notice 直接提交“答案 hash”（bytes32）给靶子合约的 query(bytes32)
     * @return rawReturn query() 的原始返回数据（可能是空，也可能是 ABI 编码的 string/bytes32）
     */
    function submitHash(bytes32 answerHash) public onlyOwner returns (bytes memory rawReturn) {
        // 目标函数签名：query(bytes32)
        bytes memory callData = abi.encodeWithSignature("query(bytes32)", answerHash);

        (bool ok, bytes memory ret) = TARGET.call(callData);
        require(ok, _revertMsg(ret));

        // 尝试猜测性解码返回值（有的题会直接 return flag string）
        string memory asString = "";
        bytes32 asB32 = bytes32(0);

        if (ret.length == 32) {
            asB32 = abi.decode(ret, (bytes32));
        } else if (ret.length >= 64) {
            try this._decodeString(ret) returns (string memory s) {
                asString = s;
            } catch {
                // ignore
            }
        }

        emit QuerySubmitted(answerHash, ret, asString, asB32);
        return ret;
    }

    /**
     * @notice 你也可以把“明文答案”直接传进来，让合约帮你 hash 再提交
     * @dev
     *  适合：hint 直接告诉你答案明文是什么（比如某个单词/短句/数字字符串）
     */
    function solveWithPlaintext(string calldata answerPlain) external onlyOwner returns (bytes memory rawReturn) {
        bytes32 h = hashString(answerPlain);
        return submitHash(h);
    }

    // ======== 6. 读取完成者列表：getSolvers() ========

    /**
     * @notice 调靶子合约 getSolvers()，并 decode 成 address[]
     * @dev
     *  如果靶子合约确实有 getSolvers() 且返回 address[]，这里就能直接拿到。
     */
    function getSolvers() external returns (address[] memory solvers) {
        bytes memory callData = abi.encodeWithSignature("getSolvers()");
        (bool ok, bytes memory ret) = TARGET.staticcall(callData);
        require(ok, _revertMsg(ret));

        solvers = abi.decode(ret, (address[]));
        emit SolversFetched(solvers);
    }

    // ======== 7. 低级调用失败时，尽量把 revert reason 还原出来 ========

    /**
     * @dev
     *  当 call/staticcall 失败时，EVM 会把 revert data 返回给你：
     *   - 如果是 Error(string)，格式是 4 字节 selector + ABI 编码 string
     *   - 如果是自定义 error 或空 revert，可能解析不出原因
     *  这里做“尽力解析”，解析不出就给一个兜底信息。
     */
    function _revertMsg(bytes memory revertData) internal pure returns (string memory) {
        if (revertData.length < 4) return "Call failed (no revert data)";

        // Error(string) 的 selector 是 0x08c379a0
        bytes4 selector;
        assembly {
            selector := mload(add(revertData, 32))
        }

        if (selector == 0x08c379a0 && revertData.length >= 68) {
            // 跳过 4 字节 selector，再按 string 解码
            bytes memory sliced = new bytes(revertData.length - 4);
            for (uint256 i = 0; i < sliced.length; i++) {
                sliced[i] = revertData[i + 4];
            }
            return abi.decode(sliced, (string));
        }

        return "Call failed (non-Error(string) revert)";
    }
}
```

1. 打开 Remix（浏览器版），新建 Solver.sol，粘贴上面代码
2. Solidity Compiler 选择 0.8.20+（或更高 0.8.x），点击 Compile
3. Deploy & Run：
   - Environment 选 Injected Provider - MetaMask
   - MetaMask 切到 Sepolia
   - 部署 SepoliaFlagSolver（你需要一点点 Sepolia 测试 ETH付 gas；这是测试网）。CONTRACT 选 SepoliaFlagSolver - Solver.sol，然后点击 `Deploy & Verify` 按钮
4. 部署后，先点调用：
   - fetchHint()：会触发 HintFetched(...) 事件（在 Remix 的 logs 里看）
     - 如果能解码成 string，你会直接看到提示文本
     - 如果是 bytes32，你会看到 decodedBytes32

5. 按 hint 的要求算答案：
   - 如果 hint 直接给“答案明文”，用 solveWithPlaintext("答案")
   - 如果 hint 要你 hash 某种拼接：
     - 你可以先用 hashPacked(...) / hashEncoded(...) 在链上算出 bytes32
     - 再把算出来的 bytes32 填进 submitHash(0x...)

6. 成功后：
   - 靶子合约应触发 ChallengeCompleted（在浏览器/Remix 交易日志里能看到）
   - 如果 query() 有 return flag，本合约会在 QuerySubmitted(...) 里尽力 decode 成 string 给你看

实际情况
1. 点击 `Deploy & Verify` 部署成功，在 `Deployed Contracts` 中可以看到按钮。
2. 点击 `fetchHint()`，显示
```Bash

[block:9830638 txIndex:4]from: 0x5b9...dbA5Ato: SepoliaFlagSolver.fetchHint() 0xb4f...35313value: 0 weidata: 0xacc...09c67logs: 1hash: 0xbdd...a5c4f
status	1 Transaction mined and execution succeed
transaction hash	0xc0c922946e69d95f0e2859f7633b211c7b5c70028ce255a317c3e2a2ac37ad34
block hash	0xbdd3e6ad55a3a0fc6ceedce9bbc1b4317d296e414343afbc3b714168af1a5c4f
block number	9830638
from	0x5b9e8d003C1D96D258E22B47cD00b8ac673dbA5A
to	SepoliaFlagSolver.fetchHint() 0xb4f91Dd760BebC50EAc129bE369114fc2CD35313
transaction cost	33702 gas 
decoded input	{}
decoded output	 - 
logs	[
	{
		"from": "0xb4f91Dd760BebC50EAc129bE369114fc2CD35313",
		"topic": "0x9ad59c52bdf90579028db124d8acf23a6fe0fca9ad05b1f452b37181b2391e5d",
		"event": "HintFetched",
		"args": {
			"0": "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000146b656363616b20504b55426c6f636b636861696e000000000000000000000000",
			"1": "keccak PKUBlockchain",
			"2": "0x0000000000000000000000000000000000000000000000000000000000000000"
		}
	}
]
raw logs	[
  {
    "_type": "log",
    "address": "0xb4f91Dd760BebC50EAc129bE369114fc2CD35313",
    "blockHash": "0xbdd3e6ad55a3a0fc6ceedce9bbc1b4317d296e414343afbc3b714168af1a5c4f",
    "blockNumber": 9830638,
    "data": "0x000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000146b656363616b20504b55426c6f636b636861696e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000146b656363616b20504b55426c6f636b636861696e000000000000000000000000",
    "index": 8,
    "topics": [
      "0x9ad59c52bdf90579028db124d8acf23a6fe0fca9ad05b1f452b37181b2391e5d"
    ],
    "transactionHash": "0xc0c922946e69d95f0e2859f7633b211c7b5c70028ce255a317c3e2a2ac37ad34",
    "transactionIndex": 4
  }
]
```
查看 logs，告诉我们 hint 是 `keccak PKUBlockchain`，其它的含义为
- 0 是“原始数据”（给你兜底用）
- 1 是“把原始数据当 string 解出来的可读提示”（你真正要看的）
- 2 是“如果它其实是 bytes32 时的解码结果”（这题没用到，所以是 0）


3. keccak 是哈希函数，进入网页：https://emn178.github.io/online-tools/keccak_256.html 。就可以得到 `PKUBlockchain` 的哈希值为 `e2a73c8e3af6379fa58e477b0e2129f21e0230100f0462b9832b00cd22414215`，这是一个 bytes32 值，32字节，也就是 256 位的哈希值，但是这有个问题，在 Solidity / Remix / Ethers.js 里，把它当 bytes32 传参时，通常必须加上 `0x` 前缀，变成 `0xe2a73c8e3af6379fa58e477b0e2129f21e0230100f0462b9832b00cd22414215`。
4. 提交答案
    - 直接调用`solveWithPlaintext()`，在 Deployed Contracts 里可以找个这个按钮，输入 `PKUBlockchain`，然后执行
    - 直接提交 hash：调用 `submitHash()`，输入哈希值 `0xe2a73c8e3af6379fa58e477b0e2129f21e0230100f0462b9832b00cd22414215`

    方案一得到
    ```Bash
    [block:9830677 txIndex:8]from: 0x5b9...dbA5Ato: SepoliaFlagSolver.submitHash(bytes32) 0xb4f...35313value: 0 weidata: 0x088...14215logs: 2hash: 0x50e...5cba0
    status	1 Transaction mined and execution succeed
    transaction hash	0x0acd7700f8954987b4bfbb29b3a746b8e5852f843ae57cdb90370121f3a2c53a
    block hash	0x50e6469264ec7e7043570e4f6f8952e20c4311a24208b44a934fe418a4e5cba0
    block number	9830677
    from	0x5b9e8d003C1D96D258E22B47cD00b8ac673dbA5A
    to	SepoliaFlagSolver.submitHash(bytes32) 0xb4f91Dd760BebC50EAc129bE369114fc2CD35313
    transaction cost	87756 gas 
    decoded input	{
        "bytes32 answerHash": "0xe2a73c8e3af6379fa58e477b0e2129f21e0230100f0462b9832b00cd22414215"
    }
    decoded output	 - 
    logs	[
        {
            "from": "0xb4f91Dd760BebC50EAc129bE369114fc2CD35313",
            "topic": "0x8266f14bb4709222ba71d57776157a134a777a642d80bd52029333fdfdc17b76",
            "event": "QuerySubmitted",
            "args": {
                "0": "0xe2a73c8e3af6379fa58e477b0e2129f21e0230100f0462b9832b00cd22414215",
                "1": "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002a464c41477b504b555f426c6f636b636861696e5f436f6c6561726e5f5765656b315f537563636573737d00000000000000000000000000000000000000000000",
                "2": "FLAG{PKU_Blockchain_Colearn_Week1_Success}",
                "3": "0x0000000000000000000000000000000000000000000000000000000000000000"
            }
        }
    ]
    raw logs	[
    {
        "_type": "log",
        "address": "0x4a6C0c0dc8bD8276b65956c9978ef941C3550A1B",
        "blockHash": "0x50e6469264ec7e7043570e4f6f8952e20c4311a24208b44a934fe418a4e5cba0",
        "blockNumber": 9830677,
        "data": "0x00000000000000000000000000000000000000000000000000000000693d35fc",
        "index": 17,
        "topics": [
        "0x57213678a1941131f1846559e4f0509e68d1a52c4d05bf0c3e8514c7a00b5d0b",
        "0x000000000000000000000000b4f91dd760bebc50eac129be369114fc2cd35313"
        ],
        "transactionHash": "0x0acd7700f8954987b4bfbb29b3a746b8e5852f843ae57cdb90370121f3a2c53a",
        "transactionIndex": 8
    },
    {
        "_type": "log",
        "address": "0xb4f91Dd760BebC50EAc129bE369114fc2CD35313",
        "blockHash": "0x50e6469264ec7e7043570e4f6f8952e20c4311a24208b44a934fe418a4e5cba0",
        "blockNumber": 9830677,
        "data": "0xe2a73c8e3af6379fa58e477b0e2129f21e0230100f0462b9832b00cd2241421500000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002a464c41477b504b555f426c6f636b636861696e5f436f6c6561726e5f5765656b315f537563636573737d00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a464c41477b504b555f426c6f636b636861696e5f436f6c6561726e5f5765656b315f537563636573737d00000000000000000000000000000000000000000000",
        "index": 18,
        "topics": [
        "0x8266f14bb4709222ba71d57776157a134a777a642d80bd52029333fdfdc17b76"
        ],
        "transactionHash": "0x0acd7700f8954987b4bfbb29b3a746b8e5852f843ae57cdb90370121f3a2c53a",
        "transactionIndex": 8
    }
    ]
    ```
    上面的 logs 里显示 `FLAG{PKU_Blockchain_Colearn_Week1_Success}` ，代表成功。
    方案二得到
    ```Bash
    [block:9831219 txIndex:18]from: 0x5b9...dbA5Ato: SepoliaFlagSolver.solveWithPlaintext(string) 0xb4f...35313value: 0 weidata: 0x9e4...00000logs: 2hash: 0x7b4...8e564
    status	1 Transaction mined and execution succeed
    transaction hash	0x78c07caf0dfba8a4f210d0db4279324a08a9fcf7cd8004f51808d2a9606318be
    block hash	0x7b47eac4d24823fe204791b02713ec340487a17487ee5e34f23692537848e564
    block number	9831219
    from	0x5b9e8d003C1D96D258E22B47cD00b8ac673dbA5A
    to	SepoliaFlagSolver.solveWithPlaintext(string) 0xb4f91Dd760BebC50EAc129bE369114fc2CD35313
    transaction cost	40845 gas 
    decoded input	{
        "string answerPlain": "PKUBlockchain"
    }
    decoded output	 - 
    logs	[
        {
            "from": "0xb4f91Dd760BebC50EAc129bE369114fc2CD35313",
            "topic": "0x8266f14bb4709222ba71d57776157a134a777a642d80bd52029333fdfdc17b76",
            "event": "QuerySubmitted",
            "args": {
                "0": "0xe2a73c8e3af6379fa58e477b0e2129f21e0230100f0462b9832b00cd22414215",
                "1": "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002a464c41477b504b555f426c6f636b636861696e5f436f6c6561726e5f5765656b315f537563636573737d00000000000000000000000000000000000000000000",
                "2": "FLAG{PKU_Blockchain_Colearn_Week1_Success}",
                "3": "0x0000000000000000000000000000000000000000000000000000000000000000"
            }
        }
    ]
    raw logs	[
    {
        "_type": "log",
        "address": "0x4a6C0c0dc8bD8276b65956c9978ef941C3550A1B",
        "blockHash": "0x7b47eac4d24823fe204791b02713ec340487a17487ee5e34f23692537848e564",
        "blockNumber": 9831219,
        "data": "0x00000000000000000000000000000000000000000000000000000000693d4f64",
        "index": 123,
        "topics": [
        "0x57213678a1941131f1846559e4f0509e68d1a52c4d05bf0c3e8514c7a00b5d0b",
        "0x000000000000000000000000b4f91dd760bebc50eac129be369114fc2cd35313"
        ],
        "transactionHash": "0x78c07caf0dfba8a4f210d0db4279324a08a9fcf7cd8004f51808d2a9606318be",
        "transactionIndex": 18
    },
    {
        "_type": "log",
        "address": "0xb4f91Dd760BebC50EAc129bE369114fc2CD35313",
        "blockHash": "0x7b47eac4d24823fe204791b02713ec340487a17487ee5e34f23692537848e564",
        "blockNumber": 9831219,
        "data": "0xe2a73c8e3af6379fa58e477b0e2129f21e0230100f0462b9832b00cd2241421500000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002a464c41477b504b555f426c6f636b636861696e5f436f6c6561726e5f5765656b315f537563636573737d00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a464c41477b504b555f426c6f636b636861696e5f436f6c6561726e5f5765656b315f537563636573737d00000000000000000000000000000000000000000000",
        "index": 124,
        "topics": [
        "0x8266f14bb4709222ba71d57776157a134a777a642d80bd52029333fdfdc17b76"
        ],
        "transactionHash": "0x78c07caf0dfba8a4f210d0db4279324a08a9fcf7cd8004f51808d2a9606318be",
        "transactionIndex": 18
    }
    ]
    ```
    点击 `getSolvers`，可以看到完成者列表。
    ```Bash

    [block:9830706 txIndex:4]from: 0x5b9...dbA5Ato: SepoliaFlagSolver.getSolvers() 0xb4f...35313value: 0 weidata: 0x8bc...1e8eblogs: 1hash: 0xc1c...eba70
    status	1 Transaction mined and execution succeed
    transaction hash	0x4179351b392ad934c20f905c2ce171a811fe511a5054f16dc978d32f31606fd1
    block hash	0xc1c16dd1d6ebd3a8855adf7b0b0808e369c8c095e6e99b6524b6a9a11f8eba70
    block number	9830706
    from	0x5b9e8d003C1D96D258E22B47cD00b8ac673dbA5A
    to	SepoliaFlagSolver.getSolvers() 0xb4f91Dd760BebC50EAc129bE369114fc2CD35313
    transaction cost	235300 gas 
    decoded input	{}
    decoded output	 - 
    logs	[
        {
            "from": "0xb4f91Dd760BebC50EAc129bE369114fc2CD35313",
            "topic": "0x7b577cdd78df5a5866441b646f0193baede556ac9221461cd2e8060ff7279731",
            "event": "SolversFetched",
            "args": {
                "0": [
                    "0x218c49ac3F5ff91E7B4224dAAd7DdB1035D8c0F5",
                    "0xE80F519C246A2ed3B8d6B169C260389259d3E984",
                    "0x9e23a871543b160c13C8934bACe43B1D254C71bD",
                    "0x6F00A229cf51DB7Eec4B6996F2eBcFE365C0Ae98",
                    "0xCAc7f9d65914D7E03570Eb483E42D4Edf57c3A24",
                    "0xD72FE434FbC195b9f9977A946b9f947b3393D9Bd",
                    "0x42f7146F2fc178D0fe9C6877132e3f198b2CA261",
                    "0xa930B5059aE91C073684f0D2AFB0bBf5d84167C9",
                    "0x259fe967B55D20d04dB16858b4b0f648DdA21Eb1",
                    "0x27dc1B8C2A7686eB9e1867eAb5Cc72ECd0B244e8",
                    "0x123A03ec3979a1dbE9e91A0a1A809D0b2C7782bf",
                    "0xe81C686e6cEb2534f9703f5FF28640FA0fDFeEC1",
                    "0x8590C303374A00b58805318188a959059bD3332E",
                    "0x6faCCA1ff14bdfA04ccc3e19175432Dd2711b4c2",
                    "0x5DAB5b8600EaBB7450fCD084D9A377F280031297",
                    "0x0c3f07ee333489b2C5a257318C90273d1192B4b6",
                    "0xAACF85a258722f7C4A95635955c579469f1E7661",
                    "0xA98043AfD36bC184285951765C2833aaCDCF014C",
                    "0x4Ec3b4499223661c6932cB76952eB3c046a1Fd3A",
                    "0x27D3b992227976DF65e7a404ca7421f94ACBea7a",
                    "0xCc6FFE507ae55807E3b2CE5dffE36Fe14b9D2a8C",
                    "0xeC8aC4624E0CAfC8384BE140dD6a5b53f4CD5cE5",
                    "0xa0d8E9A7b81a78D0031acB47defd214A7b8eBFa8",
                    "0xb3c0aBfd2f6f47952e1Cf2B9cF8A8fDBF6651F3C",
                    "0x9Bd28675069f200961B50F13C476aDa5e7067C31",
                    "0xB5312cb94F72fC0b1e42CF8393Aa55F5C3658F2d",
                    "0xb4f91Dd760BebC50EAc129bE369114fc2CD35313"
                ]
            }
        }
    ]
    raw logs	[
    {
        "_type": "log",
        "address": "0xb4f91Dd760BebC50EAc129bE369114fc2CD35313",
        "blockHash": "0xc1c16dd1d6ebd3a8855adf7b0b0808e369c8c095e6e99b6524b6a9a11f8eba70",
        "blockNumber": 9830706,
        "data": "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001b000000000000000000000000218c49ac3f5ff91e7b4224daad7ddb1035d8c0f5000000000000000000000000e80f519c246a2ed3b8d6b169c260389259d3e9840000000000000000000000009e23a871543b160c13c8934bace43b1d254c71bd0000000000000000000000006f00a229cf51db7eec4b6996f2ebcfe365c0ae98000000000000000000000000cac7f9d65914d7e03570eb483e42d4edf57c3a24000000000000000000000000d72fe434fbc195b9f9977a946b9f947b3393d9bd00000000000000000000000042f7146f2fc178d0fe9c6877132e3f198b2ca261000000000000000000000000a930b5059ae91c073684f0d2afb0bbf5d84167c9000000000000000000000000259fe967b55d20d04db16858b4b0f648dda21eb100000000000000000000000027dc1b8c2a7686eb9e1867eab5cc72ecd0b244e8000000000000000000000000123a03ec3979a1dbe9e91a0a1a809d0b2c7782bf000000000000000000000000e81c686e6ceb2534f9703f5ff28640fa0fdfeec10000000000000000000000008590c303374a00b58805318188a959059bd3332e0000000000000000000000006facca1ff14bdfa04ccc3e19175432dd2711b4c20000000000000000000000005dab5b8600eabb7450fcd084d9a377f2800312970000000000000000000000000c3f07ee333489b2c5a257318c90273d1192b4b6000000000000000000000000aacf85a258722f7c4a95635955c579469f1e7661000000000000000000000000a98043afd36bc184285951765c2833aacdcf014c0000000000000000000000004ec3b4499223661c6932cb76952eb3c046a1fd3a00000000000000000000000027d3b992227976df65e7a404ca7421f94acbea7a000000000000000000000000cc6ffe507ae55807e3b2ce5dffe36fe14b9d2a8c000000000000000000000000ec8ac4624e0cafc8384be140dd6a5b53f4cd5ce5000000000000000000000000a0d8e9a7b81a78d0031acb47defd214a7b8ebfa8000000000000000000000000b3c0abfd2f6f47952e1cf2b9cf8a8fdbf6651f3c0000000000000000000000009bd28675069f200961b50f13c476ada5e7067c31000000000000000000000000b5312cb94f72fc0b1e42cf8393aa55f5c3658f2d000000000000000000000000b4f91dd760bebc50eac129be369114fc2cd35313",
        "index": 4,
        "topics": [
        "0x7b577cdd78df5a5866441b646f0193baede556ac9221461cd2e8060ff7279731"
        ],
        "transactionHash": "0x4179351b392ad934c20f905c2ce171a811fe511a5054f16dc978d32f31606fd1",
        "transactionIndex": 4
    }
    ]
    ```

**如何看到 `ChallengeCompleted` 事件？**

ChallengeCompleted 是靶子合约发出来的事件，所以你要在“那笔交易的日志（logs）”里看。最稳的查看方式有 3 种：

方法 1：在 Etherscan 看（最推荐）

1. 你在 Remix 点 submitHash(...) 之后，底下 Terminal 会出现一行类似：
   - transaction hash: 0x...
2. 把这个 **交易哈希（0x 开头那串）** 复制出来
3. 打开 Sepolia Etherscan，把交易哈希粘进去搜索
4. 在交易页面往下找：
   - Logs / Transaction Receipt / Events（不同界面叫法略有差别）
5. 你会看到事件列表：
   - 你自己的合约事件（比如 QuerySubmitted）
   - 以及靶子合约的事件（如果 ABI 可识别，会直接显示 ChallengeCompleted；如果不识别，也会显示一条 log，只是名字不显示）

<p align="center">
    <image src="md_assets/LuBryant/image-1.png" alt="alt text"/>
</p>


方法 2：在 Remix 里看“交易日志”

1. Remix 里点完 transact 后，Terminal 会打印 “decoded output / logs”
2. 你一定能看到你解题合约自己的事件（QuerySubmitted、HintFetched）
3. 但靶子合约的 ChallengeCompleted 有时 Remix 不一定能自动解码成名字（因为 Remix 不知道靶子合约 ABI），可能只显示成一条原始 log（topic + data）
4. 所以：Remix 能看，但不一定直接显示 ChallengeCompleted 这个名字，Etherscan 更直观。

方法 3：用 getSolvers() 验证是否完成（旁证）

- 完成后，你的地址通常会出现在靶子合约的完成者列表里。
- 你可以在我给你的 Solver 合约里点：getSolvers()
- 看输出/事件 SolversFetched
- 或者直接在 Etherscan 靶子合约页面的 “Read Contract” 里调用 getSolvers()（如果有可读界面）


**合约地址是什么？**
为什么 getSolvers() 里没有你的钱包地址？

因为你是这样调用的：
- 你的钱包地址（EOA）：0x5b9e8d003C1D96D258E22B47cD00b8ac673dbA5A
- 你调用的是你自己部署的解题合约：SepoliaFlagSolver（地址 0xb4f91Dd760BebC50EAc129bE369114fc2CD35313）
- 然后解题合约再去调用靶子合约的 query(...)

对靶子合约来说，msg.sender 看到的不是你的钱包，而是你的解题合约地址。
所以靶子合约的 getSolvers() 很可能记录的是：✅ `0xb4f91Dd760BebC50EAc129bE369114fc2CD35313`（你的 Solver 合约地址），而不是你的钱包地址。

你在 raw logs 里也能直接验证这一点：靶子合约那条 log 的 topics[1] 就是 ...b4f91dd...35313（你的 Solver 合约）。这通常就是 ChallengeCompleted(address solver, ...) 这种“indexed solver”的参数。

> “解题合约地址”就是：你把那份 Solver.sol 部署到 Sepolia 之后，在链上生成的那个合约实例的地址（0x…）。它跟“靶子合约地址”是同一类东西——都是链上一个合约账户的地址。

在 Remix 里我怎么找到“解题合约地址”？
- 在 Remix 左侧 Deploy & Run Transactions 里：
- 你部署完合约后，会出现在 Deployed Contracts
- 合约名字旁边通常会显示/可展开看到一个 0x...，那就是你的解题合约地址


想看交易效果，也可以把靶子合约地址直接在 Etherscan 里打开 `0x4a6C0c0dc8bD8276b65956c9978ef941C3550A1B`
- 找 Contract → Read Contract
- 找到 getSolvers，点 Query
- 然后就可以看到所有的提交成功的 address

<p align="center">
    <image src="md_assets/LuBryant/image-2.png" alt="alt text"/>
</p>

---

### 2025.12.13

#### Week 3 使用 Geth 读取链上数据

本周目标：

- 学会用 Geth 的 Go 客户端从 RPC 节点读取链上信息
- 理解区块链底层数据结构（block、transaction、receipt）

这些是做 DApp、链上分析、合约调试等的基础。

#### Week 3 Part I - Geth 简介

首先了解了 Geth。The pronounce of Ethereum is "E-thur-ee-um", or like "uh·'theh·ree·uhm".

##### 背景：以太坊网络的运作方式

可以先把以太坊理解成一个由全球许多计算机共同维护的公共账本，没有中心服务器。要让这个系统正常运作，主要涉及三个概念：**以太坊客户端、节点、RPC**。

**1. 以太坊客户端：协议的具体实现**

以太坊客户端是一类遵循以太坊协议的软件实现，比如 Geth、Nethermind、Erigon 等。它们负责：

- 按协议格式解析区块和交易
- 验证新区块是否合法
- 维护本地区块链状态（账户余额、合约存储等）
- 和其他节点进行 P2P 通信、同步数据

只有安装并运行这些客户端软件，电脑才能真正“加入”以太坊网络。

> 使用情景：  
> 你在电脑上安装并运行 Geth，实际上就是在运行一个以太坊客户端实例，它会开始从网络上同步区块，把本地变成一个以太坊节点。

**2. 节点：运行客户端的软件实例**

“节点”指的是**运行了以太坊客户端程序的机器**。从功能和数据完整性角度，一般分为：

- **全节点（full node）**：保存当前完整状态和必要的历史数据，可以独立验证新区块和交易；
- **轻节点（light node）**：只保存少量数据和区块头，需要向其他节点请求详细信息；
- **归档节点（archive node）**：不仅保存当前状态，还保存所有历史状态，方便做历史查询和分析，但资源消耗很大。

节点之间通过 P2P 网络互连，互相转发新区块、交易，并进行验证，以保证网络整体的一致性和安全性。

> 使用情景： 你在钱包里发起一笔转账交易.
> 交易从钱包发出之后，会先发送给一个或多个节点，这些节点再向网络扩散。最终，有矿工/验证人节点把它打包进区块，你的交易才真正“上链”。

**3. RPC：给外部程序用的访问接口**

RPC（Remote Procedure Call，远程过程调用）是节点向外暴露的一组标准接口，用来**让其他程序查询或提交数据**，常见是 HTTP RPC 或 WebSocket RPC。

通过 RPC，你可以：

- 查询账户余额、交易、区块等信息
- 调用合约的只读方法（`eth_call`）
- 广播一笔签名好的交易（`eth_sendRawTransaction`）

RPC 的好处是：你不需要在自己的程序里实现底层网络协议，只要按 JSON-RPC 的格式发 HTTP 请求即可。

> 使用情景：  
> 你写了一个区块浏览器网站，前端/后端服务不会直接跑一个全节点，而是通过 RPC 问某个节点：“给我某个区块的详细信息”、“给我这个账户的最近交易”。

---

##### Geth：最主流的以太坊客户端之一

Geth（Go Ethereum）是用 Go 语言实现的以太坊客户端，也是目前使用最广泛的实现之一。它主要包含两部分：

**1. 命令行程序 `geth`**

安装 Geth 后，你会得到一个名为 `geth` 的命令行工具。运行它可以：

- 启动一个以太坊节点（全节点 / 轻节点等）
- 同步主网、测试网（如 Sepolia）的数据
- 管理本地账户（创建、导出、签名）
- 对外提供 HTTP / WebSocket RPC 接口

例如：

```bash
geth --sepolia --http --http.api eth,net,web3
```

这条命令会启动一个连到 Sepolia 测试网的节点，并在本地开一个 HTTP RPC 接口，供你或其他程序来查询链上数据。

> 使用情景：  
> 如果你要自己搭一个“私有的 RPC 节点”做数据分析，可以在一台云服务器上跑 `geth`，开 HTTP RPC，然后你的分析脚本就可以连这台服务器，而不是用公共 RPC。

**公共 RPC 节点 vs 私有 RPC 节点**

从 Geth / 客户端库的视角看，区别就是你 `Dial` 的 URL 不同，但在权限和成本上差异很大：

- **公共 RPC**
  - 例子：Infura、Alchemy、公共的 Sepolia RPC 等；
  - 优点：不用自己同步链、配置简单，适合课程作业、demo、小工具；
  - 限制：有调用频率/配额限制，有些高成本接口可能被关掉，节点配置不可控。

- **私有 RPC**
  - 自己或团队运行的 Geth / 其他客户端节点，对外开 RPC；
  - 优点：可完全控制节点类型和配置、无第三方限流、访问模式不暴露给服务商；
  - 成本：要自己承担同步、存储和运维，适合长期运行的服务端、交易所、大规模数据分析等。

> 使用情景：  
> - 本课程 / 一般练习：直接连公共的 Sepolia RPC 即可，比如：`https://ethereum-sepolia-rpc.publicnode.com`。  
> - 需要扫主网大量历史数据、或做交易所钱包服务时，更倾向于自己起一个 Geth 节点，跑私有 RPC。

**2. Go 客户端库（`go-ethereum`）**

除了命令行工具，Geth 还提供了一套 Go 客户端库，方便在 Go 代码里和以太坊交互。常用的是 `ethclient` 包：

```go
import (
    "context"

    "github.com/ethereum/go-ethereum/ethclient"
)

func main() {
    // 连接公共 RPC（默认用法）
    client, err := ethclient.Dial("https://ethereum-sepolia-rpc.publicnode.com")
    // 也可以换成你自己的私有 RPC 节点
    // client, err := ethclient.Dial("http://your-server-ip:8545")

    if err != nil {
        panic(err)
    }
    defer client.Close()

    // 后面可以用 client 查询区块、交易、余额等
}
```

在本周任务中，我们不自己运行 Geth 节点，而是侧重使用 **Go 客户端库 + 公共 Sepolia RPC** 来读取链上数据，并理解 block / transaction / receipt 的结构。
<br>

这个项目不需要安装 geth，只需要在项目里引入 go-ethereum 这个 Go 库（也就是 Geth 的 Go SDK）。

但是为了学习，我还是可以安装一下。

Official website: https://geth.ethereum.org 

Just download it and install it.

显示 `PATH not updated, original length 1842 > 1024`

这个报错常见原因是：一些 Windows 安装器用 NSIS 写的，更新 PATH 时有 字符串长度上限（1024），你的 PATH 已经 1842，所以它直接放弃更新。 

你要做的就是 手动把 geth.exe 所在文件夹加到 PATH（推荐加到“用户 Path”，不会影响全局）：

1. 找到 geth.exe 的安装目录（例如 C:\Program Files\Geth\ 或你自己选的目录）
2. Windows：开始菜单搜索 “环境变量” → 打开 “编辑系统环境变量”
3. 点 “环境变量…” → 在 用户变量 里选 Path → 编辑 → 新建 → 粘贴 geth 所在目录 → 一路确定
4. 关闭并重新打开 PowerShell/cmd，然后运行：
```shell
where geth
geth version
```
成功安装。

---

### 2025.12.17

#### Week 3 Part II - Go 语言环境准备

*本周需要用 Go 编写与节点交互的简单程序。本节只介绍完成本课所需的**最小知识**。*

Go（Golang）是 Google 开发的一门静态强类型语言，语法相对简洁，内置并发支持。Geth 本身就是用 Go 写的，因此官方提供的以太坊客户端库也是用 Go 实现的。你只需要会：

- 安装 Go 并能在命令行运行 `go`；
- 新建一个最简单的 Go 项目；
- 知道如何 `import` 其他库，并调用它们提供的函数。

关于 Go 的语法，可以参考：

+ A Tour of Go https://go.dev/tour/list
+ 中文版 https://tour.go-zh.org/list

##### 1. 安装 Go

官方下载：https://go.dev/dl/

按系统提示安装完成后，在命令行（PowerShell / cmd）检查：

```bash
go version
```

如果能看到版本号（例如 `go version go1.22.3 windows/amd64`），说明安装成功。

得到 `go version go1.25.5 windows/amd64`

> 小提示：  
> 后续所有 `go xxx` 命令都是在命令行里执行，而不是在 Go 源码文件里写。

##### 2. 新建项目

在你准备存放本周代码的目录下，新建一个文件夹并初始化 Go 模块：

```bash
mkdir week3-geth
cd week3-geth
go mod init week3-geth
```

`go mod init` 会创建一个 `go.mod` 文件，记录当前项目的模块名和依赖信息，后面 `go get` 的第三方库都会写进这里。

创建 `main.go`：

```go
package main

import "fmt"

func main() {
    fmt.Println("hello go")
}
```

运行：

```bash
go run main.go
```

如果能在命令行看到输出 `hello go`，说明你的 Go 环境和项目结构是正常的。

（运行的时候一直卡住，后面突然又好了）

> 你可以把后面所有示例代码都放在这个 `main.go` 里，逐步替换和扩展。

##### 3. 安装 go-ethereum 库

本课所有与以太坊交互的能力，都来自官方的 `go-ethereum` 库。我们用 `go get` 把它加入当前项目依赖：

```bash
go get github.com/ethereum/go-ethereum
```

执行完成后，你会在 `go.mod` / `go.sum` 里看到相应记录；在代码里就可以这样引用：

```go
import "github.com/ethereum/go-ethereum/ethclient"
```

> 中国大陆访问 go-ethereum 依赖失败，可设置 Go 代理：
> - **Windows (PowerShell)：**
>   ```powershell
>   $env:GOPROXY="https://goproxy.cn,direct" # 临时代理, 在同一终端会话生效
>   ```
> - **Linux/macOS (bash/zsh)：**
>   ```bash
>   export GOPROXY=https://goproxy.cn,direct # 临时代理, 在同一终端会话生效
>   ```
>   设置后重新执行 `go get` 命令即可。

本课用到的 Go 知识基本只有：

- `package main` / `func main()` 入口函数；
- `import` 引入标准库和第三方库；
- 基本的函数调用、错误处理（`if err != nil { ... }`）；
- 使用 `go-ethereum` 提供的类型和方法（例如 `ethclient.Dial`、`HeaderByNumber` 等）。

其余语法如果暂时不熟悉，可以边查边用，不影响完成本周任务。

#### Week 3 Part III - 使用 go-ethereum 读取链上数据

引入客户端：

```go
import "github.com/ethereum/go-ethereum/ethclient"
```

连接到 Sepolia RPC

```go
client, err := ethclient.Dial("https://ethereum-sepolia-rpc.publicnode.com")
if err != nil {
    panic(err)
}
```

获取当前区块高度

```go
header, err := client.HeaderByNumber(context.Background(), nil)
fmt.Println("current block:", header.Number.String())
```

查询区块

```go
blockNumber := big.NewInt(123456)
block, _ := client.BlockByNumber(context.Background(), blockNumber)

fmt.Println("hash:", block.Hash().Hex())
fmt.Println("parent:", block.ParentHash().Hex())
fmt.Println("tx count:", len(block.Transactions()))
```

查询交易与回执

```go
txHash := common.HexToHash("0x你的交易哈希")
tx, _, _ := client.TransactionByHash(context.Background(), txHash)

fmt.Println("to:", tx.To())
fmt.Println("value:", tx.Value().String())
```

Receipt：

```go
receipt, _ := client.TransactionReceipt(context.Background(), txHash)

fmt.Println("status:", receipt.Status)
fmt.Println("logs:", receipt.Logs)
```

合并到一起的一个样例，该样例仅打印了部分字段，建议同学们修改代码，打印出完整的结构: 

参考完整代码文件：[main.go](./week3-geth/main.go)

```go
package main

import (
	"context"
	"fmt"
	"log"
	"math/big" 
	// go 标准库

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient" // 如果提示缺少依赖, 按照给出的报错信息安装即可，使用 go get
)

func main() {
	ctx := context.Background()

	client, err := ethclient.Dial("https://ethereum-sepolia-rpc.publicnode.com")
	if err != nil {
		log.Fatal(err)
	}
	defer client.Close()

	header, err := client.HeaderByNumber(ctx, nil)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Current block: %s\n", header.Number.String())

	targetBlock := big.NewInt(123456)
	block, err := client.BlockByNumber(ctx, targetBlock)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Block #%s hash: %s\n", block.Number().String(), block.Hash().Hex())
	fmt.Printf("Parent hash: %s\n", block.ParentHash().Hex())
	fmt.Printf("Tx count: %d\n", len(block.Transactions()))
//==========================
	txHash := common.HexToHash("0x903bd6b44ce5cfa9269d456d2e7a10e3d8a485281c1c46631ec8f79e48f7accb") //测试用交易hash, 你可以替换成任何你想查询的交易hash
//=========================
	tx, isPending, err := client.TransactionByHash(ctx, txHash)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Tx pending: %t\n", isPending)
	if to := tx.To(); to != nil {
		fmt.Printf("To: %s\n", to.Hex())
	} else {
		fmt.Println("To: contract creation")
	}
	fmt.Printf("Value (wei): %s\n", tx.Value().String())

	receipt, err := client.TransactionReceipt(ctx, txHash)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Receipt status: %d\n", receipt.Status)
	fmt.Printf("Logs: %d entries\n", len(receipt.Logs))
}
```

示例结果
```bash
Current block: 9750075
Block #123456 hash: 0x2056507046b07a5d7ed4f124a7febce2aec7295b464746523787b8c2acc627dc
Parent hash: 0x93bff867b68a2822ee7b6e0a4166cfdf5fc4782d60458fae1185de9b2ecdba16
Tx count: 0
Tx pending: false
To: 0x9Bd28675069f200961B50F13C476aDa5e7067C31
Value (wei): 0
Receipt status: 1
Logs: 2 entries
# 如果一切正常, 你将会得到类似于上面的输出结果
# 你可以修改代码打印任何你想查询的数据和数据结构
```

我的结果
```bash
Current block: 9854809
Block #123456 hash: 0x2056507046b07a5d7ed4f124a7febce2aec7295b464746523787b8c2acc627dc
Parent hash: 0x93bff867b68a2822ee7b6e0a4166cfdf5fc4782d60458fae1185de9b2ecdba16
Tx count: 0
Tx pending: false
To: 0x9Bd28675069f200961B50F13C476aDa5e7067C31
Value (wei): 0
Receipt status: 1
Logs: 2 entries
```

#### Week 3 Follow Up - 理解 block, transaction, receipt 的结构

上一节中查询到的数据会包含大量字段。本部分任务要求理解其中关键字段的含义。

关于 Block 建议理解的字段包括：

- number
- hash
- parentHash
- timestamp
- gasUsed / gasLimit
- transactions

Follow-Up：

- 为何 parentHash 能形成区块链？
- gasLimit 如何影响合约执行

***

关于 Transcation 建议理解的字段包括：

- nonce
- from / to
- input (call data)
- gas / gasPrice
- value
- type (legacy, EIP-1559)

Follow-Up：

- 什么是 ABI ？一笔交易最终执行逻辑是如何解析 input 的

***

关于 Receipt 建议理解的字段包括:

- status
- logs
- contractAddress

***

可供参考的资料包括但不限于，也可以自行检索：

+ https://www.bilibili.com/video/BV1Vt411X7JF
+ 以太坊文档里关于 Blocks 的介绍：https://ethereum.org/developers/docs/blocks/
+ https://ethereum.org/developers/docs/transactions/
+ https://www.geeksforgeeks.org/computer-networks/ethereum-block-structure/

#### Week 4 Part1-Geth






<!-- Content_END -->
