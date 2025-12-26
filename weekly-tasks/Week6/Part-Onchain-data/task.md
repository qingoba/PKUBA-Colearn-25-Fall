## 借助 Telegram Bot 实现 Live Monitor 实时通知

本周链上数据小组的任务是: 使用 Week 4 中学习的 Live Monitoring, 监控自己感兴趣的链上事件, 借助 Telegram 机器人实现实时通知.

参考步骤:

1. 阅读 [telegram setup doc](./telegram-bot-setup.md) 配置机器人

2. 配置完毕后, 运行 [`telegram.go`](./telegram.go) 文件尝试发送消息

3. 借助 `telegram.go` 中的代码, 将 Live Monitor 监测到的链上事件, 通过消息发送, 提交收到消息的截图.

   (也就是将消息通知的代码集成到原有的 Live Monitor 中, 实现一旦信号出现就自动通知的功能, 这个功能是非常实用的)

注: Telegram 是 Web3 行业必备工具