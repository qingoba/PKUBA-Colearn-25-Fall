# The Ethernaut

本周合约安全小组的任务是: 完成 **The Ethernaut** 中的一部分关卡，通过亲手做题，感受智能合约中常见、真实存在的安全漏洞。

The Ethernaut 是由 OpenZeppelin 推出的一个智能合约安全练习平台。它本质上是一组部署在以太坊测试网络上的“有漏洞的合约”，每一关都是一个独立的安全挑战。你需要做的事情通常包括：

- 阅读给定合约代码
- 理解合约的设计意图
- 找出其中的安全问题
- 构造交易或调用，使合约进入“被攻破”的状态

每一关对应的漏洞类型都来自真实世界，比如溢出、权限控制错误、delegatecall 滥用、随机数不安全等。很多关卡的原型，都能在历史真实攻击事件中找到对应案例。

The Ethernaut 官网：https://ethernaut.openzeppelin.com/

注意事项:

- 开始进行挑战前, 先阅读 https://ethernaut.openzeppelin.com/help 了解大致流程
- 我们之前的任务都是在 Sepolia 测试网进行的, 该任务同样可以在该网络进行; 如果发现部署或交互合约时消耗的测试代币过多, 可以手动调慢交易被打包的速度, 降低 Gas 消耗, 或者在群里问大家要测试代币
- 进行挑战的大部分时间要在开发者工具的 Console 里完成, 打开方式是按键盘的 F12 打开 ”开发者工具“, 找到其中的 Console (控制台) 选项卡. (如果 F12 没反应, 尝试用 Fn + F12). Console 中使用的语言是 JavaScript.
- 可以通过第一个任务 **Hello Ethernaut** 来上手, 参考教程 https://www.cnblogs.com/handsomesnowsword/p/18799770

其他参考资料:

- SWC Weakness Classification Registry: https://swcregistry.io/ (注: 该项目已不再更新)
- List of Security Vulnerabilities: https://github.com/runtimeverification/verified-smart-contracts/wiki/List-of-Security-Vulnerabilities

建议至少完成前 3 关, 感兴趣的同学不设上限, 该任务是一个长期任务.

