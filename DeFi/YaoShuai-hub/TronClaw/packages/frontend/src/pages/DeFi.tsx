import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, ArrowRightLeft, Droplets, Shield, Loader2, CheckCircle, Zap } from 'lucide-react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useLang } from '../stores/lang.ts'

// Extend window type for TronLink
declare global {
  interface Window {
    tronWeb?: {
      defaultAddress?: { base58: string; hex: string }
      trx: {
        sign: (tx: unknown) => Promise<unknown>
        sendRawTransaction: (signedTx: unknown) => Promise<{ txid?: string }>
        sendTransaction: (to: string, amount: number) => Promise<{ txid?: string; result?: boolean }>
      }
      transactionBuilder: {
        sendTrx: (to: string, amount: number, from: string) => Promise<unknown>
        triggerSmartContract: (
          contractAddress: string, functionSelector: string,
          options: Record<string, unknown>, parameters: unknown[], issuerAddress: string
        ) => Promise<{ transaction: unknown }>
      }
    }
  }
}

interface Pool { protocol: string; name: string; token0: string; token1?: string; apy: string; tvl: string; riskLevel: string }
interface SwapRoute { protocol: string; path: string[]; expectedOut: string; priceImpact: string; fee: string; gasCost: string; isOptimal: boolean }

const RISK_STYLE: Record<string, string> = { low: 'badge-green', medium: 'badge-orange', high: 'badge-red' }
const TOKENS = ['TRX', 'USDT', 'USDD', 'BTT', 'WIN']

export default function DeFi() {
  const { t } = useLang()
  const [pools, setPools] = useState<Pool[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [swapFrom, setSwapFrom] = useState('TRX')
  const [swapTo, setSwapTo] = useState('USDT')
  const [swapAmount, setSwapAmount] = useState('100')
  const [swapping, setSwapping] = useState(false)
  const [swapResult, setSwapResult] = useState<string | null>(null)
  const [routes, setRoutes] = useState<SwapRoute[]>([])
  const [loadingRoutes, setLoadingRoutes] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<SwapRoute | null>(null)
  const [optimizing, setOptimizing] = useState(false)
  const [strategy, setStrategy] = useState<{ strategy: string; expectedApy: string; steps: Array<{ action: string; description: string }> } | null>(null)

  useEffect(() => {
    axios.get('/api/v1/defi/yields').then(r => { setPools(r.data.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  // 30s polling — silent update (no loading flash)
  useEffect(() => {
    const timer = setInterval(() => {
      axios.get('/api/v1/defi/yields')
        .then(r => { if (r.data.data?.length) setPools(r.data.data) })
        .catch(() => {})
    }, 30_000)
    return () => clearInterval(timer)
  }, [])

  // Load routes when swap tokens change
  useEffect(() => {
    if (!swapFrom || !swapTo || swapFrom === swapTo) return
    setLoadingRoutes(true)
    axios.get(`/api/v1/defi/routes?fromToken=${swapFrom}&toToken=${swapTo}&amount=${swapAmount}`)
      .then(r => { setRoutes(r.data.data); setSelectedRoute(r.data.data[0] ?? null) })
      .catch(() => setRoutes([]))
      .finally(() => setLoadingRoutes(false))
  }, [swapFrom, swapTo, swapAmount])

  const filtered = filter === 'all' ? pools : pools.filter(p => p.protocol === filter)
  const totalTVL = pools.reduce((s, p) => s + parseFloat(p.tvl), 0)
  const avgAPY = pools.length ? (pools.reduce((s, p) => s + parseFloat(p.apy), 0) / pools.length).toFixed(1) : '0'
  const chartData = pools.slice(0, 6).map(p => ({ name: p.name.replace(' LP', '').replace(' Supply', ''), apy: parseFloat(p.apy) }))

  const isTronLinkAvailable = () => {
    return typeof window !== 'undefined' && !!window.tronWeb?.defaultAddress?.base58
  }

  const handleSwap = async () => {
    if (!selectedRoute) return
    setSwapping(true); setSwapResult(null)

    try {
      // Path A: TronLink available — client-side signing
      if (isTronLinkAvailable() && window.tronWeb) {
        const tronWeb = window.tronWeb
        const userAddress = tronWeb.defaultAddress!.base58

        // Get swap transaction from server (unsigned)
        const { data } = await axios.post('/api/v1/defi/swap', {
          fromToken: swapFrom, toToken: swapTo,
          amount: swapAmount, slippage: 0.5,
          callerAddress: userAddress,
          sign: false  // ask server to return unsigned tx
        })

        if (data.data?.unsignedTx) {
          const unsignedTx = data.data.unsignedTx as Record<string, unknown>
          if (unsignedTx._demo) {
            // Demo Swap: call Nile USDT contract transfer(self, toAmount)
            // Shows TronLink popup with real swap output amount (~31.8 USDT for 100 TRX)
            try {
              const NILE_USDT = 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf'
              const toAmountFloat = parseFloat(data.data.toAmount ?? swapAmount)
              const toAmountUnits = Math.floor(toAmountFloat * 1_000_000) // 6 decimals
              const { transaction } = await tronWeb.transactionBuilder.triggerSmartContract(
                NILE_USDT,
                'transfer(address,uint256)',
                { feeLimit: 100_000_000, callValue: 0 },
                [
                  { type: 'address', value: userAddress },
                  { type: 'uint256', value: toAmountUnits },
                ],
                userAddress
              )
              const signedTx = await tronWeb.trx.sign(transaction) as { txID?: string }
              await tronWeb.trx.sendRawTransaction(signedTx)
              const txId = signedTx.txID ?? ''
              const scanUrl = `https://nile.tronscan.org/#/transaction/${txId}`
              setSwapResult(`✅ ${t('swap')}: ${swapAmount} ${swapFrom} → ${data.data.toAmount} ${swapTo} via ${unsignedTx.protocol as string}\n🔗 TronLink signed · <a href="${scanUrl}" target="_blank">${txId.slice(0, 20)}...</a>`)
            } catch (signErr) {
              const errMsg = (signErr as Error).message ?? String(signErr) ?? 'Unknown'
              console.error('[Swap] TronLink error:', errMsg, signErr)
              if (['cancel','denied','declined','reject','user'].some(k => errMsg.toLowerCase().includes(k))) {
                setSwapResult(`❌ 用户取消了签名`)
              } else {
                setSwapResult(`❌ TronLink error: ${errMsg.slice(0, 100)}`)
              }
            }
          } else {
            // Real TronLink signing
            const signedTx = await tronWeb.trx.sign(unsignedTx)
            const receipt = await tronWeb.trx.sendRawTransaction(signedTx) as { txid?: string }
            const txId = receipt.txid ?? ''
            setSwapResult(`✅ ${t('swap')}: ${swapAmount} ${swapFrom} → ${data.data.toAmount ?? '?'} ${swapTo} via TronLink\nTx: ${txId.slice(0, 20)}...`)
          }
        } else {
          // Server fallback (signed server-side)
          setSwapResult(`✅ ${t('swap')}: ${swapAmount} ${swapFrom} → ${data.data.toAmount} ${swapTo} via ${selectedRoute.protocol}`)
        }
      } else {
        // Path B: No TronLink — server-side signing (existing behavior)
        const { data } = await axios.post('/api/v1/defi/swap', {
          fromToken: swapFrom, toToken: swapTo,
          amount: swapAmount, slippage: 0.5
        })
        setSwapResult(`✅ ${t('swap')}: ${swapAmount} ${swapFrom} → ${data.data.toAmount} ${swapTo} via ${selectedRoute.protocol}`)
      }
    } catch (e) {
      const msg = (e as Error).message
      setSwapResult(`❌ ${msg.includes('declined') ? '用户取消了交易' : msg}`)
    }
    finally { setSwapping(false) }
  }

  const handleOptimize = async () => {
    setOptimizing(true); setStrategy(null)
    try {
      const { data } = await axios.post('/api/v1/defi/optimize', { portfolio: [{ token: 'USDT', amount: '1000' }], riskPreference: 'low' })
      setStrategy(data.data)
    } catch {}
    finally { setOptimizing(false) }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-5 max-w-6xl mx-auto">
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-2 mb-1"><span className="text-2xl">📈</span><h1 className="text-2xl font-bold text-text-0">{t('tronSageTitle')}</h1></div>
          <p className="text-sm text-text-3">{t('tronSageDesc')}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 animate-fade-in-up delay-1">
          <div className="glass-card p-4"><div className="text-[10px] text-text-3 mb-1">Total TVL</div><div className="text-xl font-bold text-text-0">${(totalTVL / 1e6).toFixed(0)}M</div></div>
          <div className="glass-card p-4"><div className="text-[10px] text-text-3 mb-1">{t('avgApy')}</div><div className="text-xl font-bold text-accent">{avgAPY}%</div></div>
          <div className="glass-card p-4"><div className="text-[10px] text-text-3 mb-1">{t('protocols')}</div><div className="text-xl font-bold text-text-0">{new Set(pools.map(p => p.protocol)).size}</div></div>
        </div>

        {/* Chart + Swap */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* APY Chart */}
          <div className="glass-card p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-4"><TrendingUp size={14} className="text-blue-400" /><span className="text-sm font-semibold text-text-0">{t('yieldRates')}</span></div>
            <div className="flex-1 min-h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={20}>
                  <XAxis dataKey="name" tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#141419', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="apy" fill="url(#apyG)" radius={[6, 6, 0, 0]} />
                  <defs><linearGradient id="apyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f97316" /><stop offset="100%" stopColor="#f97316" stopOpacity={0.3} /></linearGradient></defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Swap Panel */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4"><ArrowRightLeft size={14} className="text-brand" /><span className="text-sm font-semibold text-text-0">{t('quickSwap')}</span></div>
            <div className="space-y-3">
              <div className="flex gap-2 items-center">
                <select value={swapFrom} onChange={e => setSwapFrom(e.target.value)} className="flex-1 bg-bg-4 border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-text-0 outline-none">
                  {TOKENS.map(tk => <option key={tk} value={tk}>{tk}</option>)}
                </select>
                <span className="text-text-3 text-lg">→</span>
                <select value={swapTo} onChange={e => setSwapTo(e.target.value)} className="flex-1 bg-bg-4 border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-text-0 outline-none">
                  {TOKENS.filter(tk => tk !== swapFrom).map(tk => <option key={tk} value={tk}>{tk}</option>)}
                </select>
              </div>
              <input value={swapAmount} onChange={e => setSwapAmount(e.target.value)} placeholder="Amount"
                className="w-full bg-bg-4 border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-text-0 outline-none focus:border-brand/40" />

              {/* LP Route Comparison */}
              {loadingRoutes ? (
                <div className="text-xs text-text-3 flex items-center gap-2"><Loader2 size={12} className="animate-spin" /> Loading routes...</div>
              ) : routes.length > 0 && (
                <div>
                  <div className="text-[10px] text-text-3 mb-1.5 flex items-center gap-1.5"><Zap size={10} className="text-accent" />{t('lpComparison')}</div>
                  <div className="space-y-1.5">
                    {routes.map((route, i) => (
                      <button key={i} onClick={() => setSelectedRoute(route)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs border transition-all
                          ${selectedRoute?.protocol === route.protocol ? 'border-brand/40 bg-brand/5' : 'border-white/[0.06] bg-bg-4 hover:border-white/[0.12]'}`}>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-text-0">{route.protocol}</span>
                            {route.isOptimal && <span className="badge badge-green !text-[8px] !py-0">{t('bestRoute')}</span>}
                          </div>
                          <div className="text-text-3 text-[10px]">{route.path.join(' → ')}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-bold text-accent">{route.expectedOut} {swapTo}</div>
                          <div className="text-text-3 text-[10px]">{t('fee')} {route.fee} · {t('priceImpact')} {route.priceImpact}%</div>
                        </div>
                        {selectedRoute?.protocol === route.protocol && <CheckCircle size={14} className="text-brand flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TronLink Status */}
              <div className="text-[10px] text-text-3 flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isTronLinkAvailable() ? 'bg-accent' : 'bg-text-3'}`} />
                {isTronLinkAvailable() ? 'TronLink connected — on-chain signing' : 'No wallet — server-side mode'}
              </div>

              <button onClick={handleSwap} disabled={swapping || !selectedRoute} className="btn-primary w-full !text-sm disabled:opacity-50">
                {swapping ? <><Loader2 size={14} className="animate-spin" /> {t('swapping')}</> : t('swap')}
              </button>
              {swapResult && (
                <div className={`text-xs whitespace-pre-line ${swapResult.startsWith('✅') ? 'text-accent' : 'text-red-400'}`}
                  dangerouslySetInnerHTML={{ __html: swapResult.replace(/<a /g, '<a class="underline hover:opacity-80" ') }}
                />
              )}
            </div>
          </div>
        </div>

        {/* AI Optimizer */}
        <div className="glass-card glow-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><Shield size={14} className="text-purple-400" /><span className="text-sm font-semibold text-text-0">{t('aiYieldOptimizer')}</span></div>
            <button onClick={handleOptimize} disabled={optimizing} className="btn-primary !text-[11px] !py-1.5 !px-4 disabled:opacity-50">
              {optimizing ? t('optimizing') : t('optimize')}
            </button>
          </div>
          {strategy && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="text-sm text-text-0 font-medium mb-2">{strategy.strategy}</div>
              <span className="badge badge-green mb-3 inline-flex">APY {strategy.expectedApy}%</span>
              <div className="space-y-2">
                {strategy.steps.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs"><span className="badge !text-[9px]">Step {i + 1}</span><span className="text-text-2">{s.description}</span></div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Pool list */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Droplets size={14} className="text-blue-400" />
            <span className="text-sm font-semibold text-text-0">{t('allPools')}</span>
            <div className="flex gap-2 ml-auto">
              {['all', 'justlend', 'sunswap'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`text-[11px] px-3 py-1 rounded-full border transition-all capitalize
                    ${filter === f ? 'border-brand/30 bg-brand/10 text-brand' : 'border-white/[0.06] text-text-3 hover:text-text-0'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {filtered.map((pool, i) => (
              <motion.div key={pool.name} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="glass-card p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-text-0">{pool.name}</div>
                  <div className="text-[10px] text-text-3 capitalize">{pool.protocol}</div>
                </div>
                <div className="text-right">
                  <div className="text-brand font-bold text-sm">{pool.apy}%</div>
                  <div className="text-[10px] text-text-3">${(parseFloat(pool.tvl) / 1e6).toFixed(1)}M TVL</div>
                </div>
                <span className={`badge !text-[9px] ${RISK_STYLE[pool.riskLevel] ?? ''}`}>{pool.riskLevel}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
