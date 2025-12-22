---
timezone: UTC+8
---

> 请在上边的 timezone 添加你的当地时区(UTC)，这会有助于你的打卡状态的自动化更新，如果没有添加，默认为北京时间 UTC+8 时区


# 你的名字

1. 自我介绍
   Annie Huang, 软微研二金科选手
2. 你认为你会完成这次共学小组吗？
   会吧🥹
3.你感兴趣的小组    
   Onchain-Data
4. 你的联系方式（Wechat or Telegram）   
   wechat：17771452990
5.质押的交易哈希    
   0x799ac5673fdd7f39b46206b2c8ea08d3c1a60c90ea7f6d5f2b311fa4fa46450e

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

### 2025.12.05
<img width="635" height="213" alt="image" src="https://github.com/user-attachments/assets/61d2c084-d17a-4547-9351-0ff522b30269" />

 
number：区块高度（这是第几块）      
hash：对区块头（header）做哈希得到的结果，是这个区块的“身份证”      
parentHash：上一块的 hash（父区块）      
timestamp：出块时间（你显示的是转成本地时间后的）      
gasUsed / gasLimit：本块所有交易一共消耗了多少 gas、最多可以消耗多少 gas      
transactions：真正打包进这个区块的那一串交易列表       
为什么parentHash可以形成区块链：     
因为每个区块头里都存了前一个区块的哈希 parentHash，而区块自己的 hash 又是对“整个区块头”的哈希，所以一旦你把某个区块的内容（交易、状态等）改动一丁点，它自身的 hash 会变，后一个区块里的 parentHash 就不再匹配，进而导致后面所有区块的 hash 全部连锁出错。     
     
gasLimit 如何影响合约执行：      
交易的 gasLimit 决定“这笔合约能跑多远”，     
区块的 gasLimit 决定“这一块里能装下多少笔合约”。   

none：决定这是这个地址发出的第几笔交易       
from/to：交易发起人地址 -> 收款人地址/调用的合约地址/部署合约则to == nil      
input：合约调用的参数。     
   普通转账几乎不用 input。     
   调用合约时：前 4 个字节：函数选择器（哪个函数），后面一长串：按 ABI 编码的参数，做链上分析 / DApp 前端时，需要用 ABI 解码 input 才知道「调用了哪个函数、传了什么参数」。       
   
gas/gasPrice：交易的预算和单价     
value：这笔交易转了多少 ETH，单位是wei，1ETH = 1e18wei        
type：交易的“收费模式版本” legacy（只有gasPrice，排队纯平单价），EIP-1559（baseFee + prioritytip，基础费用+小费）。    

什么是 ABI（Application Binary Interface） ？一笔交易最终执行逻辑是如何解析 input 的       
ABI规定函数名 + 参数类型 → 如何生成 4 字节函数选择器（selector）。      
参数、返回值（address、uint256、数组、字符串…）→ 在交易 input / 事件 logs 里怎么排列、对齐、编码。       
合约函数返回值怎么打包成 bytes 给调用方       
是一系列规则和范式，一方面可以把函数+参数按照ABI编码交易input发给合约，合约也可以从input中读取selector和参数并且执行对应的函数，链接的工具也可以用ABI把链上的input解码成能被看懂的函数和参数。    
       
一笔交易最终执行逻辑是如何解析 input 的？     
合约执行时先用前 4 字节 selector 决定“进哪个函数”，再按 ABI 规定的位置从 calldata 里读出每个参数，然后跑对应的函数逻辑。     

status：1（执行成功），0（交易执行失败）。      
logs：合约在执行过程中“对外广播的事件” （Address：合约地址、Topics：事件签名+indexed参数、Data非indexed参数），依赖logs的信息来知道发生了什么，一般是记账+通知的作用。    
contractAddress：这笔交易是否创建了新的合约。  
发起时：to == nil（没有目标地址）     
执行成功后：EVM 会把新合约的地址写进 receipt.ContractAddress     
普通转账或者调用已经存在的合约则为零地址。  

### 2025.12.12
1-geth     
<img width="1097" height="230" alt="image" src="https://github.com/user-attachments/assets/95452d06-690a-4c70-af25-d6b3dfe9e4d7" />        
<img width="1102" height="454" alt="image" src="https://github.com/user-attachments/assets/2fa15058-73df-4418-bbfa-320112fa1bec" />       
<img width="1005" height="570" alt="image" src="https://github.com/user-attachments/assets/864b618c-5ad1-4496-a9c4-56f156441e50" />    

2-monitor
<img width="551" height="550" alt="image" src="https://github.com/user-attachments/assets/9582cb63-754c-4331-b925-cd062f2a536d" />     

<img width="530" height="681" alt="image" src="https://github.com/user-attachments/assets/fd8ad213-71e4-4388-8fd2-5d7c3541365a" />     

3-graph
 <img width="1393" height="738" alt="image" src="https://github.com/user-attachments/assets/4913ead1-ca05-44c9-81cf-4a845df7a957" />      

<img width="1314" height="562" alt="image" src="https://github.com/user-attachments/assets/1979cfc1-82b0-4472-8745-f649a9b6ae32" />   

4-实战     
<img width="815" height="745" alt="image" src="https://github.com/user-attachments/assets/4bb518e9-37fb-481f-9fa2-31cbc77b8cc0" />     
<img width="658" height="595" alt="image" src="https://github.com/user-attachments/assets/b0f27378-9624-493d-86f1-02b24a957c7a" />      
<img width="674" height="741" alt="image" src="https://github.com/user-attachments/assets/053c5955-dbe3-4187-9a80-eb5809d3478d" />   
<img width="800" height="429" alt="image" src="https://github.com/user-attachments/assets/24cb4900-5b0d-46c4-8d7a-7d09b76823a7" />

### 2025.12.20
etherscan     
<img width="779" height="540" alt="image" src="https://github.com/user-attachments/assets/a51372ed-bb02-43bb-8e96-04e96e220d34" />


<!-- Content_END -->
