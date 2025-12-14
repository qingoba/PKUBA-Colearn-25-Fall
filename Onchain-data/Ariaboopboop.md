---
timezone: UTC+8
---

> 请在上边的 timezone 添加你的当地时区(UTC)，这会有助于你的打卡状态的自动化更新，如果没有添加，默认为北京时间 UTC+8 时区


# 你的名字

1. 自我介绍: Aria 谦虚好学的医学跨界选手
2. 你认为你会完成这次共学小组吗？会的∠(°ゝ°)
3. 你感兴趣的小组 链上数据monitor bot开发&应用
4. 你的联系方式（Wechat or Telegram） Wechat：expectopatronum_o_f 

## Notes

<!-- Content_START -->

### 2025.11.23
#### 任务1：
1.合约部署结果记录：  
合约地址 (Contract Address)： `0x813015d3311B662621a94d03169cF870D197f83a`  
部署交易哈希： `0x52f60b66ed5754baa687669623b54ecbd3d5d4b296b5bd73982d20ba0d9eb0fc` 

2.合约交互与效果验证：  
交易哈希： `0x46be857264fa31c82968c9a7c5ff23d76ecd7f410b43124e66e754fd9472b7e4` 
事件验证： 在Sepolia Etherscan上查看交易收据的 “Logs” 标签页，日志内容显示 Greeting 事件被触发  
记录数据：sender：`我的钱包地址` timestamp：`1763923836`  
截图如下
<img width="2372" height="1552" alt="0a949ca5-531d-4462-8e09-675d94ec93b2" src="https://github.com/user-attachments/assets/9af504de-8a0d-406f-8c84-413b95a75883" />


### 2025.12.07  
#### 任务2：  
步骤1：编写并部署一个智能合约来调用靶子合约的 hint() 方法获取解题提示
<img width="418" height="95" alt="8020bd4c6d717577ac38a0dbf405b947" src="https://github.com/user-attachments/assets/fdb116c9-bfdd-49c3-813b-5c055cea57ae" />  
步骤2：根据解题提示计算答案  
<img width="505" height="143" alt="487e3fce21577e058e3b7e475d0e1a13" src="https://github.com/user-attachments/assets/0f4e3061-a1ac-4c14-9f3b-8126e93978be" />  
步骤3：调用靶子合约的 query() 方法提交答案, 若答案正确, 则能够看到返回的 Flag 或者 ChallengeCompleted 事件  
用 submit() 提交答案，然后在Sepolia Etherscan上查看交易收据的 “Logs” 标签页  
<img width="1244" height="956" alt="6b9be0781faa8241fc0f999d663c5bef" src="https://github.com/user-attachments/assets/9451d063-abfe-4c60-9e98-51453a64b262" />  
完成啦





<!-- Content_END -->
