import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { Store, TrendingUp, Search, Zap, DollarSign, Activity, Bot, ArrowRight, Globe } from 'lucide-react'
import axios from 'axios'
import { useWallet } from '../stores/wallet.ts'
import { useLang } from '../stores/lang.ts'

const FALLBACK = 'TFp3Ls4mHdzysbX1qxbwXdMzS8mkvhCMx6'

const MODULES = [
  { to: '/market', emoji: '💳', name: 'SealPay', desc: 'AI Agent service marketplace with x402 auto-payment', color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { to: '/defi', emoji: '📈', name: 'TronSage', desc: 'AI DeFi advisor — yield optimization & auto-execution', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { to: '/data', emoji: '🔍', name: 'ChainEye', desc: 'On-chain analytics — whale tracking & address profiling', color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { to: '/auto', emoji: '⚡', name: 'AutoHarvest', desc: 'Automation hunter — auto-trade, scheduled tasks, whale-follow', color: 'text-green-400', bg: 'bg-green-400/10' },
]

function CountUp({ value, decimals = 2 }: { value: number; decimals?: number }) {
  const [d, setD] = useState(0)
  useEffect(() => {
    const s = d, diff = value - s, dur = 900, t0 = performance.now()
    const anim = (now: number) => {
      const p = Math.min((now - t0) / dur, 1)
      setD(s + diff * (1 - Math.pow(1 - p, 3)))
      if (p < 1) requestAnimationFrame(anim)
    }
    requestAnimationFrame(anim)
  }, [value])
  return <>{d.toFixed(decimals)}</>
}

export default function Overview() {
  const { address } = useWallet()
  const { t } = useLang()
  const addr = address ?? FALLBACK
  const [balances, setBalances] = useState<Array<{ token: string; balance: string; usdValue: string }>>([])
  const [networkData, setNetworkData] = useState<Record<string, string> | null>(null)
  const [defiOverview, setDefiOverview] = useState<{ totalTVLFormatted: string; avgAPY: string; poolCount: number } | null>(null)
  const [autoStats, setAutoStats] = useState<{ active: number; totalTriggers: number } | null>(null)
  const [marketStats, setMarketStats] = useState<{ totalInvocations: number; totalVolume: string } | null>(null)
  const [agentCalls, setAgentCalls] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        const [b1, b2, b3, netRes, defiRes, autoRes, mktRes] = await Promise.all([
          axios.get(`/api/v1/payment/balance?address=${addr}&token=TRX`),
          axios.get(`/api/v1/payment/balance?address=${addr}&token=USDT`),
          axios.get(`/api/v1/payment/balance?address=${addr}&token=USDD`),
          axios.get('/api/v1/data/overview'),
          axios.get('/api/v1/defi/overview'),
          axios.get('/api/v1/automation/stats'),
          axios.get('/api/v1/market/stats'),
        ])
        setBalances([b1.data.data, b2.data.data, b3.data.data])
        setNetworkData(netRes.data.data)
        setDefiOverview(defiRes.data.data)
        setAutoStats(autoRes.data.data)
        setMarketStats(mktRes.data.data)
      } catch {}
    }
    load()
  }, [addr])

  useEffect(() => {
    const wsUrl = import.meta.env.PROD
      ? 'wss://tronclaw.onrender.com/ws'
      : `ws://${window.location.host}/ws`
    const ws = new WebSocket(wsUrl)
    ws.onmessage = (evt) => {
      try { const e = JSON.parse(evt.data); if (e.type === 'agent_tool_call') setAgentCalls(c => c + 1) } catch {}
    }
    return () => ws.close()
  }, [])

  const tokenGrad: Record<string, string> = { TRX: 'from-red-500/20 to-orange-500/5', USDT: 'from-green-500/20 to-emerald-500/5', USDD: 'from-blue-500/20 to-cyan-500/5' }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-5 max-w-6xl mx-auto">

        <div className="animate-fade-in-up">
          <h1 className="text-2xl font-bold text-text-0">{t('platformOverview')}</h1>
          <p className="text-sm text-text-3 mt-0.5">{t('platformDesc')}</p>
        </div>

        {/* Wallet Balances */}
        <div className="grid grid-cols-3 gap-4">
          {balances.map((b, i) => (
            <motion.div key={b.token} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className={`glass-card p-4 bg-gradient-to-br ${tokenGrad[b.token] ?? ''}`}>
              <div className="flex items-center gap-2 mb-2"><DollarSign size={13} className="text-brand" /><span className="text-xs font-medium text-text-2">{b.token}</span></div>
              <div className="text-2xl font-bold text-text-0"><CountUp value={parseFloat(b.balance)} /></div>
              <div className="text-xs text-text-3 mt-1">≈ ${parseFloat(b.usdValue).toFixed(2)}</div>
            </motion.div>
          ))}
        </div>

        {/* TRON Network Stats */}
        {networkData && (
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3"><Globe size={13} className="text-accent" /><span className="text-sm font-semibold text-text-0">{t('tronNetwork')}</span><span className="badge badge-green !text-[9px] ml-auto">Live</span></div>
            <div className="grid grid-cols-4 gap-4">
              <div><div className="text-[10px] text-text-3 mb-1">{t('trxPrice')}</div><div className="font-bold text-text-0">{networkData.tronPrice}</div></div>
              <div><div className="text-[10px] text-text-3 mb-1">{t('marketCap')}</div><div className="font-bold text-text-0">{networkData.marketCap}</div></div>
              <div><div className="text-[10px] text-text-3 mb-1">{t('transactions24h')}</div><div className="font-bold text-text-0">{networkData.transactions24h}</div></div>
              <div><div className="text-[10px] text-text-3 mb-1">{t('tpsAverage')}</div><div className="font-bold text-text-0">{networkData.tpsAverage}</div></div>
            </div>
          </div>
        )}

        {/* Platform Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: t('defiTvl'), value: defiOverview?.totalTVLFormatted ?? '...', sub: `${defiOverview?.avgAPY ?? '0'}% ${t('avgApy')}`, color: 'text-blue-400' },
            { label: t('marketCalls'), value: marketStats?.totalInvocations?.toString() ?? '0', sub: `$${marketStats?.totalVolume ?? '0'} volume`, color: 'text-brand' },
            { label: t('autoTasks'), value: autoStats?.active?.toString() ?? '0', sub: `${autoStats?.totalTriggers ?? 0} ${t('triggers')}`, color: 'text-accent' },
            { label: t('agentCalls'), value: String(agentCalls), sub: t('thisSession'), color: 'text-purple-400' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.06 }}
              className="glass-card p-4">
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-text-3">{s.label}</div>
              <div className="text-[9px] text-text-3/60 mt-0.5">{s.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Four modules */}
        <div>
          <h2 className="text-base font-semibold text-text-0 mb-3">{t('platformModules')}</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {MODULES.map((m, i) => (
              <motion.div key={m.to} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.08 }}>
                <NavLink to={m.to} className="glass-card glow-border p-4 flex items-center gap-3 group block">
                  <div className={`w-10 h-10 rounded-xl ${m.bg} flex items-center justify-center flex-shrink-0 text-lg`}>{m.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2"><span className="font-semibold text-sm text-text-0">{m.name}</span><ArrowRight size={12} className="text-text-3 group-hover:text-brand group-hover:translate-x-0.5 transition-all" /></div>
                    <p className="text-[11px] text-text-2 truncate">{m.desc}</p>
                  </div>
                </NavLink>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bank of AI bar */}
        <div className="glass-card p-3 flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-semibold text-text-0 flex items-center gap-2"><Activity size={12} className="text-brand" /> {t('bankOfAIIntegration')}</span>
          <div className="flex gap-1.5 flex-wrap">
            {['x402 Payment', '8004 Identity', 'MCP Server', 'Skills Modules'].map(name => (
              <span key={name} className="badge badge-green !text-[9px]">✅ {name}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
