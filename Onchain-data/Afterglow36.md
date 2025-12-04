---
timezone: UTC+8
---

> 请在上边的 timezone 添加你的当地时区(UTC)，这会有助于你的打卡状态的自动化更新，如果没有添加，默认为北京时间 UTC+8 时区


# 你的名字

1. 自我介绍
   Annie Huang, 软微研二金科选手
2. 你认为你会完成这次共学小组吗？
   会吧🥹
3. 你的联系方式（Wechat or Telegram）
   wechat：17771452990

## Notes

<!-- Content_START -->

### 2025.11.17
Part I 动手部署一个智能合约   
一、合约概览与目的    
合约名称：HelloWeb3     
代码目的：学习Event的使用，以及合约的编译、部署与交互流程。  
核心功能：记录调用者的地址和时间戳到区块链日志中。    
关键函数：hello() external：触发 Greeting 事件。    

二、开发环境准备   
Solidity 版本：pragma solidity ^0.8.0    
开发工具：Remix IDE     
区块链网络：Sepolia Testnet    	 
钱包：MetaMask    

三、合约编译
代码准备： 将 HelloWeb3.sol 文件粘贴到 Remix 中。    
编译器配置： 确保 Remix 编译器的版本（例如 0.8.20）与合约中的 pragma 声明兼容。    
编译结果： 成功编译后，会生成两个核心文件：    
字节码 (Bytecode)：合约在 EVM（以太坊虚拟机）上运行的机器码。     
ABI (Application Binary Interface)：用于前端应用与合约交互的接口文档（它定义了 hello() 函数和 Greeting 事件的格式）。   

四、合约部署    
部署环境选择： 在 Remix 的“Deploy & Run Transactions”标签页中，选择 “Browser Wallet”和对应account。      
网络确认： 确保 MetaMask 已连接到 Sepolia 测试网。   
执行部署：    
点击 Deploy 按钮。   
MetaMask 弹出交易确认窗口，显示预估的 Gas 费用。    
确认并等待交易被打包到区块。  
结果记录：    
合约地址 (Contract Address)： 0x99f818baeee9828779d488da8a3744ef7ea1e544    
部署交易哈希：  0x5c34c8c20405d42162f721b300ff1f19323e5537d8fc7a272d472ecf3a531143    

五、合约交互与效果验证（Interact & Verify）   
1、函数调用：   
在 Remix 的“Deployed Contracts”下找到合约。   
点击橙色的 hello 按钮。    
MetaMask 再次弹出窗口，显示调用该函数所需的 Gas 费用。   
确认交易。   
2、链上效果：   
交易哈希： 0x04e632160bacf131079e10948bd5dd303166a9b3a420fe49e0ddf3db32a294ae   
状态变量： 没有状态变量被修改，因为合约中没有定义任何状态变量。  
事件验证（核心效果）： 在区块链浏览器（如 Sepolia Etherscan）上，查看交易收据的 “Logs” 或 “Events” 标签页。  
日志内容： 会显示 Greeting 事件被触发。   
记录数据：   
sender：0xe126B446E726085B99DEa4226b9A2F162ad50ea8 
timestamp：1763525136   

六、心得体会与知识点总结   
External 函数： hello() 使用 external 关键字，意味着它只能被外部账户或其它合约调用，不能被合约内部函数调用
Events 的作用： Events是智能合约与链下应用通信的主要方式。它们不存储在合约状态中，但永久地存储在交易日志中，可以被高效地索引和查询。    
部署与调用的区别： 部署是创建合约实例，只执行一次 constructor；调用是执行合约中的 function，可以执行多次。两者都需要付费 Gas。     
零 ETH 交易： 虽然 Value 为 0 ETH，但由于 hello() 函数触发 Event 改变了状态，它仍然需要支付 Gas Fee。   


### 2025.11.24
transaction hash：0x1f5f22a742984ed13d08219242dc34e1eae894c3d0fc2baf8eeb1260f0438d5c
<img width="935" height="550" alt="image" src="https://github.com/user-attachments/assets/a53f3f95-3538-402a-b7da-2d02f5595bb8" />

<img width="1130" height="319" alt="image" src="https://github.com/user-attachments/assets/9a73b7f7-b07d-4e29-b1d2-58482d944911" />


<img width="496" height="556" alt="image" src="https://github.com/user-attachments/assets/074e9a64-8324-480a-906a-8d0d82b95b91" />

<img width="1037" height="310" alt="image" src="https://github.com/user-attachments/assets/d998bbbf-7a4e-49a8-bdf5-863c6bc132e9" />




<!-- Content_END -->
