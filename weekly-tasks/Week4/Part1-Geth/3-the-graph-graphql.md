# Part III: The Graph & GraphQL

**回顾:**
在 Part II 中，我们直接与 **Geth 节点** 对话，学会了监听实时的区块和交易。

  * **痛点：** Geth 很强，但也很“笨”。如果你问 Geth：“请告诉我 Uniswap 上过去一年 ETH/USDC 的所有交易量总和”，Geth 会崩溃。因为它只是一个链表，没有根据业务逻辑建立索引。
  
  * **解决：** 我们需要一个 **中间件**，它能像“爬虫”一样通过 RPC 抓取链上数据，清洗、整理并存入数据库，供我们快速查询。这就是 **The Graph**。

-----

## 数据的谷歌

🎯 **目标:**

1.  **理解架构：** 什么是 Subgraph，它是如何作为“Per Protocol”的数据聚合器的。
2.  **掌握语法：** 学习 GraphQL 查询语言，摆脱 REST API 的束缚。
3.  **实战演练：** 在 Graph Explorer 中调试查询，并编写 Go 语言脚本进行**高通量分页抓取**。

### 为什么需要 The Graph？

**一句话总结：** Geth 是为了"验证"而设计的（写优化），The Graph 是为了"搜索"而设计的（读优化）。

#### 核心数据结构对比

| 特性 | Geth (Layer 1 节点) | The Graph (索引层) |
| :--- | :--- | :--- |
| **物理存储** | LevelDB (Key-Value 数据库) | PostgreSQL (关系型数据库) |
| **逻辑结构** | 链表 (Linked List) + Merkle Patricia Trie (MPT) | 实体表 (Tables) (如 User 表, Swap 表) |
| **索引方式** | 仅哈希索引 | B-Tree 索引 |
| **查询能力** | 只能通过 Block Hash 或 Tx Hash 查找 | 可以为任意字段（User Address, Amount, Token Symbol）建立索引 |
| **查询复杂度** | O(N) - 全表扫描 | O(log N) 或 O(1) - 索引查找 |

**低效原因：** Geth 的数据是一条单向的时间轴。查找特定业务数据（如"Bob 的所有交易"）等同于在数据库中做全表扫描 (Full Table Scan)。

**高效原因：** The Graph 将链上的线性数据重组成了结构化表格。查找特定业务数据等同于 SQL 查询中的索引查找。

**比喻：**
- **Geth** 是一卷录像带：你想找"男主角第一次出现"的画面，必须从头快进播放去找。
- **The Graph** 是一本书的目录：你可以直接查"男主角"在哪一页，然后直接翻过去。

### I. The Graph 是什么？

The Graph 是区块链数据的 **去中心化索引协议**。

  * **Subgraph (子图):** 可以理解为每一个 DApp（如 Uniswap, Aave, Compound）都有一个专属的“数据库Schema”和“索引逻辑”，这被称为 Subgraph。
  * **Per Protocol:** 它是以**协议为中心**的。你想查 Uniswap 的数据，就去 Uniswap 的 Subgraph；想查 ENS 的域名，就去 ENS 的 Subgraph。

### II. 交互式体验：Graph Explorer

在写代码之前，我们需要先在网页上"玩"一下数据。

**实操步骤 (请同学们跟随操作):**

1. 打开 [The Graph Explorer (Arbitrum)](https://thegraph.com/explorer?chain=arbitrum-one)
2. 在搜索框输入 `Uniswap V3` (或者 V2，视具体教程需求)
3. 点击进入详情页，点击右侧的 **"Query"** 按钮
4. 你会看到一个类似 IDE 的界面。这就是我们就地测试 GraphQL 的地方

**快速链接：** 你也可以直接使用 [Uniswap V3 Subgraph (Substreams)](https://thegraph.com/explorer/subgraphs/HUZDsRpEVP2AvzDCyzDHtdc64dyDxx8FQjzsmqSg4H3B?view=Query&chain=arbitrum-one)，这个可以直接查询，不需要自己搜索。

### III. GraphQL 语法速成

GraphQL 是一种"按需索取"的查询语言。你需要什么字段，就写什么字段，不会多给，也不会少给。

#### 1. 基础查询结构

以 Uniswap V3 为例，我们查询一下最近的 `Swaps` (交易事件)。

**在 Graph Explorer 中测试：** [Uniswap V3 Subgraph (Substreams)](https://thegraph.com/explorer/subgraphs/HUZDsRpEVP2AvzDCyzDHtdc64dyDxx8FQjzsmqSg4H3B?view=Query&chain=arbitrum-one)

```graphql
{
  swaps(first: 5, orderBy: timestamp, orderDirection: desc) {
    id
    timestamp
    token0 {
      symbol
    }
    token1 {
      symbol
    }
    amount0
    amount1
  }
}
```

**语法说明：**

- **`swaps`**: 实体名称 (Entity)
- **`first: 5`**: 限制返回条数 (Limit)
- **`orderBy: timestamp`**: 排序字段
- **`orderDirection: desc`**: 排序方向（降序）
- **`{ ... }`**: 这里面是你需要的字段。注意 `token0` 是一个嵌套对象，我们可以直接展开获取它的 `symbol`

#### 2. 条件过滤 (Where)

查询 **USDC (假设地址为 0xff97...)** 相关的 Swap：

```graphql
{
  swaps(
    first: 5, 
    where: { 
      token0: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8" 
    }
  ) {
    id
    amount0
  }
}
```

**语法说明：**

- **`where`**: 条件过滤，支持多种比较操作符（如 `id_gt`, `amount_gte` 等）
- **`token0: "0xff97..."`**: 精确匹配 token0 地址

### IV. 实战：用 Go 语言"搬运"数据

**挑战背景：**

你需要获取 Uniswap V3 上 **所有的** Pool 地址（成千上万个）。Graph 单次查询通常限制 `100` 或 `1000` 条数据。普通的 `skip` (跳过) 分页在数据量大时会极慢甚至报错。

**Challenge ⚔️: 高通量 Pagination (分页) 策略**

- **错误做法:** 使用 `skip: 1000`, `skip: 2000`... (性能极差，且 Graph 有最大 skip 限制)
- **正确做法:** **Cursor-based Pagination (基于游标的分页)**
  1. 按 `id` 排序
  2. 记录最后一条数据的 `id`
  3. 下一次查询使用 `where: { id_gt: "Last_ID" }` (id greater than)

**为什么 Cursor-based 更快？**

- **Skip 方式:** 数据库需要扫描前 N 条记录再跳过，复杂度为 O(N)
- **Cursor 方式:** 利用主键索引直接定位，复杂度为 O(log N) 或 O(1)

#### 代码实现

我们提供了三个版本的代码，帮助你深入理解分页策略：

**1. 完整实现版本：** [graph_query.go](./graph_query.go)
- 完整的 Cursor-based Pagination 实现
- 包含详细的注释和性能统计
- 适合直接运行和参考

**2. 性能对比版本：** [graph_query_comparison.go](./graph_query_comparison.go)
- 同时实现 Skip-based 和 Cursor-based 两种方式
- 自动对比性能差异（耗时、请求次数）
- **强烈推荐运行**，直观感受性能差异

**3. 挑战版本：** [graph_query_challenge.go](./graph_query_challenge.go)
- 代码填空练习，需要你完成关键部分
- 包含 TODO 提示，引导你思考
- 完成后可以对比完整实现，验证理解

**核心知识点：**

1. **定义数据结构：** 根据 GraphQL Schema 定义 Go 结构体
2. **构造 GraphQL 查询：** 使用 Cursor-based 分页策略
3. **发送 HTTP 请求：** 封装 GraphQL 查询为 JSON 请求
4. **解析响应：** 将 JSON 响应解析为 Go 结构体
5. **更新游标：** 记录最后一条数据的 ID，用于下一次查询
6. **速率控制：** 添加延迟避免触发 API Rate Limit

**前置条件：**

1. **获取 API Key：**
   - 访问 [The Graph Studio](https://thegraph.com/studio/) 获取一个 API Key
   - 或者使用公开的测试网 URL（代码中已配置）

2. **配置代理（中国大陆用户）：**
   - 参考 part1  

**实战任务：**

**步骤 1：验证 Subgraph 连接**
```bash
go run graph_query.go
```
代码会自动进行测试查询，验证 Subgraph 是否可用。

**如果遇到返回 0 条数据的问题：**

1. **检查实体名称：** 在 [Graph Explorer](https://thegraph.com/explorer/subgraphs/HUZDsRpEVP2AvzDCyzDHtdc64dyDxx8FQjzsmqSg4H3B?view=Query&chain=arbitrum-one) 中查看 Schema，确认正确的实体名称
   - 可能是 `pool` 而不是 `pools`
   - 可能是 `pair` 或其他名称

2. **检查查询语法：** 在 Graph Explorer 中手动测试查询，确保语法正确

3. **启用调试模式：** 在代码中将 `DEBUG_MODE = true`，查看实际查询和响应

**步骤 2：运行性能对比（推荐）**
```bash
go run graph_query_comparison.go
```
观察两种方式的性能差异，理解为什么 Cursor-based 更快。

**步骤 3：完成挑战版本**
1. 打开 [graph_query_challenge.go](./graph_query_challenge.go)
2. 根据 TODO 提示完成代码填空
3. 运行验证是否正确

**常见问题排查：**

**Q: 为什么返回 0 条数据？**

可能的原因：
1. **Subgraph 数据问题：** Subgraph 可能没有数据，或者数据被过滤掉了
2. **实体名称错误：** 可能不是 `pools`，而是 `pool`、`pair` 或其他名称
3. **查询语法问题：** 某些 Subgraph 可能需要特定的查询格式

**解决方法：**
1. 在 [Graph Explorer](https://thegraph.com/explorer/subgraphs/HUZDsRpEVP2AvzDCyzDHtdc64dyDxx8FQjzsmqSg4H3B?view=Query&chain=arbitrum-one) 中手动测试查询
2. 查看 Schema 文档，确认正确的实体名称和字段
3. 启用调试模式（`DEBUG_MODE = true`）查看实际查询和响应
4. 检查 GraphQL 错误信息（代码已自动打印）

**Q: 为什么会出现不稳定的 GraphQL 错误？**

**核心原因：The Graph 的去中心化架构**

The Graph 使用**去中心化索引网络**，你的查询会被路由到多个**索引器（Indexers）**：

```
你的查询 → The Graph Gateway → 多个索引器（Indexer 1, 2, 3...）
                                    ↓
                            每个索引器独立运行数据库
```

**为什么会出现错误？**

1. **索引器性能差异：** 不同的索引器可能有不同的硬件配置和负载
2. **查询复杂度：** 当查询大量数据时，某些索引器可能超时
3. **数据库负载：** 索引器的数据库可能正在处理其他查询，导致响应慢
4. **网络问题：** 索引器之间的网络连接可能不稳定

**错误示例：**
```
bad indexers: {
  0x2f09...: Timeout,
  0x32bb...: BadResponse(400),
  0xedca...: statement timeout
}
```

这表示：3 个索引器都失败了（超时或错误），但这是**正常现象**！

**解决方案：**

代码已自动实现**重试机制**：
- 检测到超时或索引器错误时，自动重试（最多 3 次）
- 每次重试间隔 2 秒，给索引器恢复时间
- 如果所有重试都失败，才会报错退出

**最佳实践：**
- ✅ 使用重试机制（代码已实现）
- ✅ 降低单次查询的数据量（如 `first: 500` 而非 `first: 1000`）
- ✅ 增加请求间隔（代码中已设置 100ms）
- ❌ 不要因为偶尔的错误就认为代码有问题

**Q: 为什么性能对比不明显？**

可能的原因：
1. **数据量太小：** 如果只查询少量数据，性能差异不明显
2. **网络延迟占主导：** 代理延迟可能掩盖了数据库查询的差异
3. **Subgraph 优化：** 某些 Subgraph 可能对 Skip 做了优化

**解决方法：**
- 尝试查询更多数据（修改 `MAX_POOLS_TO_FETCH`）
- 使用本地节点或更快的网络环境
- 关注请求次数和平均耗时，而非总耗时


**收获:**
1. **为什么 Cursor-based 比 Skip-based 更快？**
   - Skip 方式：数据库需要扫描前 N 条记录再跳过，复杂度为 O(N)
   - Cursor 方式：利用主键索引直接定位，复杂度为 O(log N) 或 O(1)
   - **实际场景：** 当 skip=10000 时，数据库需要扫描前 10000 条记录；而 cursor 方式直接定位到游标位置

2. **什么时候应该使用 Cursor-based？**
   - 需要获取大量数据时（> 1000 条）
   - 数据会实时更新，需要稳定的分页策略
   - 对性能有要求的场景

3. **Cursor-based 的限制是什么？**
   - 必须有一个可排序的唯一字段（通常是 id）
   - 数据必须按该字段排序
   - 不能随机跳转到任意位置

