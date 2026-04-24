import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ExternalLink, ArrowUpRight, ArrowDownLeft, Eye, Waves } from 'lucide-react'
import axios from 'axios'
import { useLang } from '../stores/lang.ts'
import { SkeletonCard, SkeletonList } from '../components/Skeleton.tsx'

// All on Nile testnet — whale data, address analysis, tx history
const TRONSCAN_MAIN = 'https://nile.tronscan.org/#'
const TRONSCAN_NILE = 'https://nile.tronscan.org/#'
function shorten(s: string, n = 6) { return s?.length > n * 2 ? `${s.slice(0, n)}...${s.slice(-4)}` : (s ?? '') }

interface AddressInfo {
  address: string; trxBalance: string
  tokenHoldings: Array<{ symbol: string; balance: string }>
  txCount: number; firstTxDate: string | null; tags: string[]
}
interface Transaction { hash: string; from: string; to: string; value: string; tokenSymbol: string; timestamp: number }
interface WhaleTransfer { hash: string; from: string; to: string; amount: string; tokenSymbol: string; timestamp: number; usdValue: string }

export default function Data() {
  const { t } = useLang()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState<AddressInfo | null>(null)
  const [txs, setTxs] = useState<Transaction[]>([])
  const [whales, setWhales] = useState<WhaleTransfer[]>([])
  const [whaleLoading, setWhaleLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    axios.get('/api/v1/data/whales?token=USDT&hours=24&limit=20')
      .then(r => { setWhales(r.data.data ?? []); setWhaleLoading(false) })
      .catch(() => setWhaleLoading(false))
  }, [])

  // Silent 30s polling — merges new items into the top of the list
  useEffect(() => {
    const timer = setInterval(() => {
      axios.get('/api/v1/data/whales?token=USDT&hours=24&limit=20')
        .then(r => {
          const newData: WhaleTransfer[] = r.data.data ?? []
          if (newData.length === 0) return
          setWhales(prev => {
            const existingHashes = new Set(prev.map(w => w.hash))
            const freshItems = newData.filter(w => !existingHashes.has(w.hash))
            if (freshItems.length === 0) return prev
            return [...freshItems, ...prev].slice(0, 30)
          })
        })
        .catch(() => {})
    }, 30_000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const wsUrl = import.meta.env.PROD
      ? 'wss://tronclaw.onrender.com/ws'
      : `ws://${window.location.host}/ws`
    const ws = new WebSocket(wsUrl)
    ws.onmessage = (evt) => {
      try {
        const e = JSON.parse(evt.data)
        if (e.type === 'whale_alert') setWhales(prev => [e.data, ...prev].slice(0, 20))
      } catch {}
    }
    return () => ws.close()
  }, [])

  const search = async () => {
    if (!query.trim()) return
    setLoading(true); setError('')
    try {
      const [addrRes, txRes] = await Promise.all([
        axios.get(`/api/v1/data/address/${query.trim()}`),
        axios.get(`/api/v1/data/transactions/${query.trim()}?limit=100`),
      ])
      setInfo(addrRes.data.data); setTxs(txRes.data.data)
    } catch { setError('Address not found or invalid'); setInfo(null); setTxs([]) }
    finally { setLoading(false) }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-5 max-w-6xl mx-auto">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1"><span className="text-2xl">🔍</span><h1 className="text-2xl font-bold text-text-0">{t('chainEyeTitle')}</h1></div>
          <p className="text-sm text-text-3">{t('chainEyeDesc')}</p>
        </div>

        {/* Search */}
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-2 glass-card px-4 !rounded-xl focus-within:border-brand/30 transition-colors">
            <Search size={15} className="text-text-3" />
            <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()}
              placeholder={t('addressOrHash')}
              className="flex-1 bg-transparent text-sm text-text-0 placeholder-text-3 outline-none py-3 font-mono" />
          </div>
          <button onClick={search} disabled={loading || !query.trim()} className="btn-primary !py-2.5 disabled:opacity-40">
            {loading ? t('searching') : t('analyze')}
          </button>
        </div>

        {error && <div className="glass-card p-3 border-red-400/20 text-red-400 text-sm">{error}</div>}

        <div className="grid lg:grid-cols-5 gap-5">
          {/* Left: results (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            {loading && <SkeletonList rows={4} />}
            {!loading && info && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="glass-card p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye size={14} className="text-purple-400" />
                    <span className="text-sm font-semibold text-text-0">{t('addressProfile')}</span>
                    {info.tags.map(tg => <span key={tg} className="badge badge-purple !text-[9px]">{tg}</span>)}
                  </div>
                  <a href={`${TRONSCAN_NILE}/address/${info.address}`} target="_blank"
                    className="text-xs font-mono text-text-2 hover:text-brand flex items-center gap-1 mb-4 break-all">
                    {info.address} <ExternalLink size={10} />
                  </a>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div><div className="text-[10px] text-text-3 mb-0.5">{t('trxBalance')}</div><div className="text-lg font-bold text-text-0">{parseFloat(info.trxBalance).toLocaleString()}</div></div>
                    <div><div className="text-[10px] text-text-3 mb-0.5">{t('txCount')}</div><div className="text-lg font-bold text-text-0">{info.txCount.toLocaleString()}</div></div>
                    <div><div className="text-[10px] text-text-3 mb-0.5">{t('firstActive')}</div><div className="text-lg font-bold text-text-0">{info.firstTxDate ?? 'N/A'}</div></div>
                  </div>
                  {info.tokenHoldings.length > 0 && (
                    <div>
                      <div className="text-[10px] text-text-3 mb-2">Token Holdings (Top {info.tokenHoldings.length})</div>
                      <div className="space-y-1.5">
                        {info.tokenHoldings.map((tk, i) => (
                          <div key={tk.symbol} className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-bg-3/50 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] text-text-3 w-4">#{i+1}</span>
                              <span className="font-medium text-text-0">{tk.symbol}</span>
                              <span className="text-[9px] text-text-3">{(tk as any).name}</span>
                            </div>
                            <span className="font-mono text-accent font-medium">{parseFloat(tk.balance).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {txs.length > 0 && (
                  <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-text-0">{t('recentTransactions')}</span>
                      <span className="text-[10px] text-text-3">{txs.length} txs</span>
                    </div>
                    <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                      {txs.map((tx, i) => {
                        const isSend = tx.from?.toLowerCase() === query.trim().toLowerCase()
                        return (
                          <motion.div key={`${tx.hash}-${i}`} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                            className="flex items-center gap-3 py-2 px-3 rounded-xl bg-bg-3/50 border border-white/[0.04] text-xs">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isSend ? 'bg-red-400/10 text-red-400' : 'bg-accent/10 text-accent'}`}>
                              {isSend ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                            </div>
                            <a href={`${TRONSCAN_NILE}/transaction/${tx.hash}`} target="_blank" className="font-mono text-text-2 hover:text-brand">{shorten(tx.hash)}</a>
                            <span className={`ml-auto font-medium ${isSend ? 'text-red-400' : 'text-accent'}`}>
                              {isSend ? '-' : '+'}{parseFloat(tx.value || '0').toLocaleString()} {tx.tokenSymbol}
                            </span>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
            {!loading && !info && !error && (
              <div className="glass-card p-12 text-center">
                <Search size={40} className="mx-auto mb-3 text-text-3 opacity-15" />
                <p className="text-sm text-text-3">{t('addressOrHash').slice(0, 30)}...</p>
              </div>
            )}
          </div>

          {/* Right: Whale Monitor (2 cols) */}
          <div className="lg:col-span-2">
            <div className="glass-card p-5 sticky top-6">
              <div className="flex items-center gap-2 mb-4">
                <Waves size={14} className="text-brand" />
                <span className="text-sm font-semibold text-text-0">{t('whaleMonitor')}</span>
                <span className="badge badge-orange !text-[9px]">USDT+USDD 24h</span>
                <span className="flex items-center gap-1 text-[9px] text-accent ml-auto">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  LIVE
                </span>
              </div>
              {whaleLoading ? (
                <SkeletonList rows={5} />
              ) : (
                <div className="space-y-2 max-h-[420px] overflow-y-auto">
                  <AnimatePresence mode="popLayout">
                    {whales.length === 0 ? (
                      <div className="text-center py-8 text-text-3 text-xs">{t('noWhales')}</div>
                    ) : whales.map((w, i) => (
                      <motion.div key={`${w.hash}-${i}`} layout initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                        className="p-2.5 rounded-xl bg-bg-3/50 border border-white/[0.04] text-[11px]">
                        <div className="flex items-center justify-between mb-1">
                          <a href={`${TRONSCAN_MAIN}/transaction/${w.hash}`} target="_blank" className="font-mono text-text-2 hover:text-brand">
                            {shorten(w.hash, 5)}
                          </a>
                          <div className="text-right">
                            <div className="font-bold text-brand">{parseFloat(w.amount).toLocaleString()} {w.tokenSymbol}</div>
                            {w.usdValue && w.usdValue !== w.amount && (
                              <div className="text-[9px] text-text-3">${parseFloat(w.usdValue).toLocaleString()}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-text-3">
                          <a href={`${TRONSCAN_MAIN}/address/${w.from}`} target="_blank" className="font-mono hover:text-brand">{shorten(w.from, 5)}</a>
                          <span>→</span>
                          <a href={`${TRONSCAN_MAIN}/address/${w.to}`} target="_blank" className="font-mono hover:text-brand">{shorten(w.to, 5)}</a>
                        </div>
                        <div className="text-text-3 mt-0.5">{new Date(w.timestamp).toLocaleTimeString()}</div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
