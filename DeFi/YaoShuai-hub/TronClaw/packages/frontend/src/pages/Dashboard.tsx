import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, DollarSign, TrendingUp, Bot, ExternalLink, Wallet, Zap } from 'lucide-react'
import axios from 'axios'
import { useWallet } from '../stores/wallet.ts'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface AgentToolCall {
  tool: string
  method: string
  path: string
  input: unknown
  result: unknown
  success: boolean
  duration: number
  timestamp: number
}

interface BalanceData { token: string; balance: string; usdValue: string }
interface DeFiPool { protocol: string; name: string; apy: string; tvl: string; riskLevel: string }

const TRONSCAN = 'https://nile.tronscan.org/#'

function formatNum(n: string) {
  const num = parseFloat(n)
  if (isNaN(num)) return '0'
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toFixed(2)
}

function toolIcon(tool: string) {
  if (tool.includes('payment') || tool.includes('balance')) return '💳'
  if (tool.includes('whale') || tool.includes('data') || tool.includes('address')) return '🔍'
  if (tool.includes('defi') || tool.includes('yield') || tool.includes('swap')) return '📈'
  if (tool.includes('auto') || tool.includes('batch')) return '⚡'
  if (tool.includes('identity') || tool.includes('agent')) return '🪪'
  return '🔧'
}

function toolColor(tool: string) {
  if (tool.includes('payment') || tool.includes('balance')) return 'text-orange-400'
  if (tool.includes('data') || tool.includes('address') || tool.includes('whale')) return 'text-purple-400'
  if (tool.includes('defi') || tool.includes('yield') || tool.includes('swap')) return 'text-blue-400'
  if (tool.includes('auto') || tool.includes('batch')) return 'text-green-400'
  if (tool.includes('identity')) return 'text-pink-400'
  return 'text-text-2'
}

// Animated number counter
function CountUp({ value, decimals = 2 }: { value: number; decimals?: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const start = display
    const diff = value - start
    const duration = 800
    const startTime = performance.now()
    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
      setDisplay(start + diff * eased)
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [value])
  return <>{display.toFixed(decimals)}</>
}

export default function Dashboard() {
  const { address: walletAddress } = useWallet()
  const DEMO_ADDRESS = walletAddress ?? 'TFp3Ls4mHdzysbX1qxbwXdMzS8mkvhCMx6'
  const [agentCalls, setAgentCalls] = useState<AgentToolCall[]>([])
  const [balances, setBalances] = useState<BalanceData[]>([])
  const [pools, setPools] = useState<DeFiPool[]>([])
  const [connected, setConnected] = useState(false)

  // Load initial data
  useEffect(() => {
    const load = async () => {
      try {
        const [b1, b2, b3, defi] = await Promise.all([
          axios.get(`/api/v1/payment/balance?address=${DEMO_ADDRESS}&token=TRX`),
          axios.get(`/api/v1/payment/balance?address=${DEMO_ADDRESS}&token=USDT`),
          axios.get(`/api/v1/payment/balance?address=${DEMO_ADDRESS}&token=USDD`),
          axios.get('/api/v1/defi/yields'),
        ])
        setBalances([b1.data.data, b2.data.data, b3.data.data])
        setPools(defi.data.data.slice(0, 5))
      } catch (e) {
        console.error('Dashboard load error', e)
      }
    }
    load()
  }, [])

  // WebSocket
  useEffect(() => {
    const wsUrl = import.meta.env.PROD
      ? 'wss://tronclaw.onrender.com/ws'
      : `ws://${window.location.host}/ws`
    const ws = new WebSocket(wsUrl)
    ws.onopen = () => setConnected(true)
    ws.onclose = () => setConnected(false)
    ws.onmessage = (evt) => {
      try {
        const event = JSON.parse(evt.data)
        if (event.type === 'agent_tool_call') {
          setAgentCalls(prev => [event.data as AgentToolCall, ...prev].slice(0, 50))
        }
      } catch {}
    }
    return () => ws.close()
  }, [])

  const apyData = pools.map(p => ({
    name: p.name.replace(' LP', '').replace(' Supply', ''),
    apy: parseFloat(p.apy),
  }))

  const tokenGradient: Record<string, string> = {
    TRX: 'from-red-500/20 to-orange-500/10',
    USDT: 'from-green-500/20 to-emerald-500/10',
    USDD: 'from-blue-500/20 to-cyan-500/10',
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-5 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in-up">
          <div>
            <h1 className="text-xl font-bold text-text-0">Dashboard</h1>
            <a href={`${TRONSCAN}/address/${DEMO_ADDRESS}`} target="_blank" rel="noopener"
              className="text-xs text-text-3 font-mono hover:text-brand transition-colors flex items-center gap-1">
              {DEMO_ADDRESS.slice(0, 8)}...{DEMO_ADDRESS.slice(-6)} <ExternalLink size={9} />
            </a>
          </div>
          <div className="flex items-center gap-3">
            <div className={`badge ${connected ? 'badge-green' : ''}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-accent animate-pulse' : 'bg-text-3'}`} />
              {connected ? 'Live' : 'Connecting'}
            </div>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-3 gap-4">
          {balances.length > 0 ? balances.map((b, i) => (
            <motion.div
              key={b.token}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass-card p-5 bg-gradient-to-br ${tokenGradient[b.token] ?? ''}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <DollarSign size={14} className="text-brand" />
                <span className="text-xs font-medium text-text-2">{b.token}</span>
              </div>
              <div className="text-2xl font-bold text-text-0">
                <CountUp value={parseFloat(b.balance)} />
              </div>
              <div className="text-xs text-text-3 mt-1">≈ ${formatNum(b.usdValue)}</div>
            </motion.div>
          )) : [0, 1, 2].map(i => (
            <div key={i} className="glass-card p-5 animate-pulse">
              <div className="h-3 w-12 bg-white/5 rounded mb-4" />
              <div className="h-6 w-24 bg-white/5 rounded" />
            </div>
          ))}
        </div>

        {/* Agent Activity Feed */}
        <div className="glass-card p-5 glow-border">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={14} className="text-brand" />
            <span className="text-sm font-semibold text-text-0">Agent Activity Feed</span>
            <span className="ml-auto badge badge-orange !text-[10px]">{agentCalls.length} calls</span>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {agentCalls.length === 0 ? (
                <motion.div layout className="text-center py-10">
                  <Bot size={36} className="mx-auto mb-3 text-text-3 opacity-30" />
                  <p className="text-sm text-text-3">Waiting for agent connections...</p>
                  <p className="text-xs text-text-3 mt-1">Run demo-agent or connect via MCP / Skills</p>
                </motion.div>
              ) : agentCalls.map((call, i) => (
                <motion.div
                  key={`${call.timestamp}-${i}`}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-bg-3/50 border border-white/[0.04] text-xs"
                >
                  <span className="text-base flex-shrink-0">{toolIcon(call.tool)}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`font-mono font-medium ${toolColor(call.tool)}`}>{call.tool}</div>
                    <div className="text-text-3 truncate text-[10px]">{call.method} {call.path}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-text-3">{call.duration}ms</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${call.success ? 'bg-accent' : 'bg-red-400'}`} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* DeFi APY Chart */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={14} className="text-blue-400" />
              <span className="text-sm font-semibold text-text-0">DeFi APY (%)</span>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={apyData} barSize={20}>
                <XAxis dataKey="name" tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#141419', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, fontSize: 12 }}
                  labelStyle={{ color: '#a1a1aa' }}
                  itemStyle={{ color: '#f97316' }}
                />
                <Bar dataKey="apy" fill="url(#apyGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="apyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Pools */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={14} className="text-purple-400" />
              <span className="text-sm font-semibold text-text-0">Top Pools</span>
            </div>
            <div className="space-y-2">
              {pools.map(pool => (
                <div key={pool.name} className="flex items-center gap-3 py-1.5 text-xs">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-text-1 truncate">{pool.name}</div>
                    <div className="text-text-3 capitalize">{pool.protocol}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-brand font-bold">{pool.apy}%</div>
                    <div className="text-text-3">${formatNum(pool.tvl)}</div>
                  </div>
                  <span className={`badge !text-[9px] !py-0 !px-1.5
                    ${pool.riskLevel === 'low' ? 'badge-green' : pool.riskLevel === 'medium' ? 'badge-orange' : 'badge-red'}`}>
                    {pool.riskLevel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
