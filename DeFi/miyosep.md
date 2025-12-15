---
timezone: UTC+8
---

> 请在上边的 timezone 添加你的当地时区(UTC)，这会有助于你的打卡状态的自动化更新，如果没有添加，默认为北京时间 UTC+8 时区


# 你的名字

1. 自我介绍:我是元培学院数学方向的金柱衡，这次新加入了技术部，平时对密码学感兴趣。我报名Defi合约组
2. 你认为你会完成这次共学小组吗？:会，可以完成。
3. 你的联系方式（Wechat or Telegram）:  wechat:Juhyeongkim5627; telegram:miyomiyo789
4. 交易哈希：0x7757209b220ad863ade4688cc3bdbe08dc24c78799ee7991bf8d7a085ca81ddf

## Notes

<!-- Content_START -->

### 2025.11.29

#### Part 1
- 部署合约 <img width="2549" height="1235" alt="Pasted image 20251130183210" src="https://github.com/user-attachments/assets/c38b3778-ac80-4021-bdb5-8b4811a78c54" />
- 查看结果
<img width="2151" height="1130" alt="Pasted image 20251130183323" src="https://github.com/user-attachments/assets/104548de-5c75-425f-88bf-44625df57f20" />
<img width="2084" height="1034" alt="Pasted image 20251130183450" src="https://github.com/user-attachments/assets/d8fc1455-8379-4612-875b-2b5a895050f1" />

### 2025.11.30
#### Part 2
<img width="2486" height="1222" alt="Pasted image 20251130185024" src="https://github.com/user-attachments/assets/6eb3cc3d-b6f9-4579-bb09-9f9b075ced06" />

### 2025.12.07
1. 区块链结构
parentHash → 哈希链
任意区块被改动 → 所有后续区块 hash 变化 → 历史不可篡改性成立。

2. 以太坊状态改变的最小单位。关键字段：nonce, to, value, input, gas.

3. nonce（顺序 + 防重放）
每个账户独有的交易计数器。保证交易按序执行。阻止同一交易在未来或其他链被重放。

4. ABI 调用（input 字段）
交易调用合约的本质：
input = 函数选择器(4B) + 参数编码
EVM 依据 input 定位函数并执行。
EVM 不认识函数名，只认识 selector。

5. Receipt（执行结果）
核心字段：status、logs、contractAddress、gasUsed.
status 是唯一可信的成功/失败判断依据。
logs = 合约事件，用于链下监听与索引。

6. RPC（访问链上数据的入口）
不需自己实现 P2P，只需调用 RPC：
eth_blockByNumber
eth_getTransactionByHash
eth_getTransactionReceipt

### 2025.12.15
1. RPC 资源限制与分页
公共 RPC（如 Infura）对返回大小和计算量有限制。直接查询大区块范围容易超时或返回过大。
将区块范围拆分为多个小段，分页顺序查询，以提高稳定性。

2. 请求频率控制（Rate Limiting）
RPC 服务商限制请求速率（RPS），请求过快会触发 HTTP 429。
控制请求间隔，必要时退避重试，确保符合服务协议。

3. 事件过滤与 Bloom Filter
通过 FilterQuery 指定合约地址和事件签名（Topic0），节点可利用Bloom Filter快速筛选相关区块。
减少无关日志扫描，高效获取特定事件（如 Swap、Transfer）。




<!-- Content_END -->
