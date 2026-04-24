import { create } from 'zustand'

type Lang = 'en' | 'zh'

const TRANSLATIONS = {
  en: {
    // Nav
    connect: 'Connect', disconnect: 'Disconnect', copyAddress: 'Copy Address',
    copied: 'Copied!', viewOnTronScan: 'View on TronScan', connectWallet: 'Connect Wallet',
    selectWallet: 'Select a wallet to connect to TronClaw', recommended: 'Recommended',
    comingSoon: 'Coming soon', noFundsNeeded: 'Interacting with TRON Nile testnet. No real funds required.',
    getFreeTokens: 'Get free testnet tokens', installWallet: 'Install', walletNotFound: 'Not installed.',
    connectionFailed: 'Connection failed', tronScan: 'TronScan',
    // Sidebar
    chat: 'Chat', dashboard: 'Dashboard', agents: 'Agents', explorer: 'Explorer',
    overview: 'Overview', market: 'Market', defi: 'DeFi', data: 'Data', auto: 'Automation',
    nileTestnet: 'Nile Testnet',
    // Overview
    platformOverview: 'TronClaw Overview',
    platformDesc: 'AI Agent platform for TRON — 4 integrated modules, all Bank of AI infra',
    tronNetwork: 'TRON Network', trxPrice: 'TRX Price', marketCap: 'Market Cap',
    transactions24h: '24h Transactions', tpsAverage: 'Avg TPS',
    defiTvl: 'DeFi TVL', marketCalls: 'Market Calls', autoTasks: 'Auto Tasks',
    agentCalls: 'Agent Calls', thisSession: 'this session',
    platformModules: 'Platform Modules', bankOfAIIntegration: 'Bank of AI Integration',
    // Market
    sealPayTitle: 'SealPay', sealPayDesc: 'AI Agent marketplace — services, bounty tasks, and agent NFTs on TRON',
    aiServices: 'AI Services', volumeUsdt: 'Volume (USDT)', openTasks: 'Open Tasks', agentNFTs: 'Agent NFTs',
    services: 'AI Services', tasks: 'Bounty Tasks', nfts: 'Agent NFTs',
    invoke: 'Invoke', invoking: 'Invoking...', confirmPay: 'Confirm & Pay',
    claimTask: 'Claim Task', buyAgentNFT: 'Buy Agent NFT',
    recentCalls: 'Recent Calls', noCallsYet: 'No calls yet',
    openLabel: 'open', completedLabel: 'completed', claimedLabel: 'claimed',
    tasksDone: 'Tasks Done', totalEarned: 'Total Earned', rating: 'Rating',
    skillsCapabilities: 'Skills & Capabilities', paymentViaX402: 'Payment via x402 protocol',
    totalBounty: 'USDT total bounty',
    // DeFi
    tronSageTitle: 'TronSage', tronSageDesc: 'AI DeFi advisor — yield optimization & strategy execution on TRON',
    quickSwap: 'Quick Swap', yieldRates: 'Yield Rates (%)',
    aiYieldOptimizer: 'AI Yield Optimizer', allPools: 'All Pools',
    optimize: 'Optimize 1000 USDT (Low Risk)', optimizing: 'Analyzing...',
    swap: 'Swap (SunSwap)', swapping: 'Swapping...',
    protocols: 'Protocols', avgApy: 'Avg APY',
    lpComparison: 'LP Route Comparison', bestRoute: 'Best Route',
    priceImpact: 'Price Impact', fee: 'Fee', routeVia: 'Route via',
    // Data
    chainEyeTitle: 'ChainEye', chainEyeDesc: 'AI on-chain analytics — address profiling, whale tracking, data intelligence',
    addressOrHash: 'Address / Tx Hash / Token name...',
    analyze: 'Analyze', searching: 'Searching...',
    addressProfile: 'Address Profile', recentTransactions: 'Recent Transactions',
    whaleMonitor: '🐋 Whale Monitor',
    trxBalance: 'TRX Balance', txCount: 'Transactions', firstActive: 'First Active',
    noWhales: 'No whale transfers in last 24h',
    // Auto
    autoHarvestTitle: 'AutoHarvest', autoHarvestDesc: 'AI automation — auto-trade, scheduled transfers, whale-follow',
    createTask: 'Create Task', activateTask: 'Activate Task',
    autoTrade: '💱 Auto Trade', schedule: '📅 Schedule', whaleAlert: '🐋 Whale Alert',
    tokenPair: 'Token Pair', action: 'Action', triggerPrice: 'Trigger Price',
    amount: 'Amount', recipient: 'Recipient Address', frequency: 'Frequency',
    minAmount: 'Min Amount', token: 'Token',
    taskQueue: 'Task Queue', active: 'Active', paused: 'Paused',
    triggers: 'Triggers', allTime: 'all time',
    // Chat
    chatTitle: 'TronClaw AI', tryThese: 'Try these:',
    askAnything: 'Ask anything about TRON...',
  },
  zh: {
    // Nav
    connect: '连接钱包', disconnect: '断开连接', copyAddress: '复制地址',
    copied: '已复制！', viewOnTronScan: '在 TronScan 查看', connectWallet: '连接钱包',
    selectWallet: '选择钱包连接到 TronClaw', recommended: '推荐',
    comingSoon: '即将支持', noFundsNeeded: '连接到 TRON Nile 测试网，无需真实资金。',
    getFreeTokens: '获取测试网代币', installWallet: '安装', walletNotFound: '未检测到。',
    connectionFailed: '连接失败', tronScan: 'TronScan 浏览器',
    // Sidebar
    chat: '对话', dashboard: '仪表盘', agents: 'Agent 市场', explorer: '链上浏览器',
    overview: '总览', market: '服务市场', defi: 'DeFi 顾问', data: '链上数据', auto: '自动化',
    nileTestnet: 'Nile 测试网',
    // Overview
    platformOverview: 'TronClaw 总览',
    platformDesc: 'TRON AI Agent 一站式平台 — 四大模块，全量 Bank of AI 基础设施',
    tronNetwork: 'TRON 网络', trxPrice: 'TRX 价格', marketCap: '市值',
    transactions24h: '24h 交易量', tpsAverage: '平均 TPS',
    defiTvl: 'DeFi 总锁仓', marketCalls: '市场调用', autoTasks: '自动化任务',
    agentCalls: 'Agent 调用', thisSession: '本次会话',
    platformModules: '平台模块', bankOfAIIntegration: 'Bank of AI 集成状态',
    // Market
    sealPayTitle: 'SealPay 服务市场', sealPayDesc: 'AI Agent 服务市场 — 服务、悬赏任务、Agent NFT，x402 自动付费',
    aiServices: 'AI 服务数', volumeUsdt: '交易额 (USDT)', openTasks: '开放任务', agentNFTs: 'Agent NFTs',
    services: 'AI 服务', tasks: '悬赏任务', nfts: 'Agent NFT',
    invoke: '调用', invoking: '调用中...', confirmPay: '确认并支付',
    claimTask: '接受任务', buyAgentNFT: '购买 Agent NFT',
    recentCalls: '最近调用', noCallsYet: '暂无调用记录',
    openLabel: '开放', completedLabel: '已完成', claimedLabel: '已认领',
    tasksDone: '完成任务', totalEarned: '总收益', rating: '评分',
    skillsCapabilities: '技能与能力', paymentViaX402: 'x402 协议支付',
    totalBounty: 'USDT 总赏金',
    // DeFi
    tronSageTitle: 'TronSage DeFi 顾问', tronSageDesc: 'AI DeFi 智能顾问 — 收益优化与自动策略执行',
    quickSwap: '快速兑换', yieldRates: '收益率排行 (%)',
    aiYieldOptimizer: 'AI 收益优化器', allPools: '所有池子',
    optimize: '优化 1000 USDT（低风险）', optimizing: '分析中...',
    swap: '兑换 (SunSwap)', swapping: '兑换中...',
    protocols: '协议数', avgApy: '平均年化',
    lpComparison: 'LP 路由对比', bestRoute: '最优路由',
    priceImpact: '价格影响', fee: '手续费', routeVia: '经由',
    // Data
    chainEyeTitle: 'ChainEye 链上分析', chainEyeDesc: 'AI 链上数据分析 — 地址画像、巨鲸追踪、链上情报',
    addressOrHash: '地址 / 交易哈希 / 代币名称...',
    analyze: '分析', searching: '查询中...',
    addressProfile: '地址画像', recentTransactions: '最近交易',
    whaleMonitor: '🐋 巨鲸监控',
    trxBalance: 'TRX 余额', txCount: '交易数', firstActive: '首次活跃',
    noWhales: '过去 24 小时无大额转账',
    // Auto
    autoHarvestTitle: 'AutoHarvest 自动化', autoHarvestDesc: 'AI 自动化猎手 — 自动交易、定时转账、跟踪巨鲸',
    createTask: '创建任务', activateTask: '激活任务',
    autoTrade: '💱 自动交易', schedule: '📅 定时转账', whaleAlert: '🐋 巨鲸跟踪',
    tokenPair: '交易对', action: '操作方向', triggerPrice: '触发价格',
    amount: '数量', recipient: '接收地址', frequency: '频率',
    minAmount: '最小金额', token: '代币',
    taskQueue: '任务队列', active: '运行中', paused: '已暂停',
    triggers: '触发次数', allTime: '历史',
    // Chat
    chatTitle: 'TronClaw AI', tryThese: '试试这些：',
    askAnything: '问我任何关于 TRON 的问题...',
  },
} as const

type TranslationKey = keyof typeof TRANSLATIONS['en']

interface LangState {
  lang: Lang
  t: (key: TranslationKey) => string
  toggle: () => void
  setLang: (lang: Lang) => void
}

export const useLang = create<LangState>((set, get) => ({
  lang: (localStorage.getItem('tronclaw_lang') as Lang) ?? 'en',
  t: (key) => TRANSLATIONS[get().lang][key],
  toggle: () => {
    const next = get().lang === 'en' ? 'zh' : 'en'
    localStorage.setItem('tronclaw_lang', next)
    set({ lang: next })
  },
  setLang: (lang) => {
    localStorage.setItem('tronclaw_lang', lang)
    set({ lang })
  },
}))
