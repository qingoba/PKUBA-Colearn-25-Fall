import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, ExternalLink, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import axios from 'axios'

interface AddressInfo {
  address: string; trxBalance: string
  tokenHoldings: Array<{ symbol: string; balance: string; decimals: number }>
  txCount: number; firstTxDate: string | null; tags: string[]
}

interface Transaction {
  hash: string; from: string; to: string; value: string
  tokenSymbol: string; timestamp: number; confirmed: boolean
}

const TRONSCAN = 'https://nile.tronscan.org/#'
const DEMO_ADDRESSES = ['TFp3Ls4mHdzysbX1qxbwXdMzS8mkvhCMx6', 'TPL66VK2gCXNCD7EJg9pgJRfqcRazjhUZY']

function shorten(s: string, n = 6) { return s.length > n * 2 ? `${s.slice(0, n)}...${s.slice(-4)}` : s }

export default function Explorer() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState<AddressInfo | null>(null)
  const [txs, setTxs] = useState<Transaction[]>([])
  const [error, setError] = useState('')

  const search = async () => {
    if (!query.trim()) return
    setLoading(true); setError('')
    try {
      const [addrRes, txRes] = await Promise.all([
        axios.get(`/api/v1/data/address/${query.trim()}`),
        axios.get(`/api/v1/data/transactions/${query.trim()}?limit=10`),
      ])
      setInfo(addrRes.data.data); setTxs(txRes.data.data)
    } catch { setError('Address not found or invalid'); setInfo(null); setTxs([]) }
    finally { setLoading(false) }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-5 max-w-4xl mx-auto">
        <div className="animate-fade-in-up">
          <h1 className="text-xl font-bold text-text-0">TRON Explorer</h1>
          <p className="text-sm text-text-3">Analyze any address on Nile testnet</p>
        </div>

        {/* Search */}
        <div className="flex gap-3 animate-fade-in-up delay-1">
          <div className="flex-1 flex items-center gap-2 bg-bg-2 border border-white/[0.06] rounded-xl px-4 focus-within:border-brand/30 transition-colors">
            <Search size={15} className="text-text-3" />
            <input value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
              placeholder="Enter TRON address (T...)"
              className="flex-1 bg-transparent text-sm text-text-0 placeholder-text-3 outline-none py-3 font-mono" />
          </div>
          <button onClick={search} disabled={loading || !query.trim()} className="btn-primary !py-2.5 disabled:opacity-40">
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Quick links */}
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs text-text-3">Quick:</span>
          {DEMO_ADDRESSES.map(addr => (
            <button key={addr} onClick={() => { setQuery(addr); }}
              className="text-xs text-brand/70 hover:text-brand font-mono transition-colors">
              {shorten(addr)}
            </button>
          ))}
        </div>

        {error && <div className="glass-card p-4 border-red-400/20 text-red-400 text-sm">{error}</div>}

        {info && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Address info */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-text-0">Address</span>
                {info.tags.map(tag => (
                  <span key={tag} className="badge badge-purple !text-[9px]">{tag}</span>
                ))}
              </div>
              <a href={`${TRONSCAN}/address/${info.address}`} target="_blank"
                className="text-xs font-mono text-text-2 hover:text-brand transition-colors flex items-center gap-1 mb-4 break-all">
                {info.address} <ExternalLink size={10} />
              </a>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-[10px] text-text-3 uppercase mb-1">TRX Balance</div>
                  <div className="text-lg font-bold text-text-0">{parseFloat(info.trxBalance).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-text-3 uppercase mb-1">Transactions</div>
                  <div className="text-lg font-bold text-text-0">{info.txCount.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-text-3 uppercase mb-1">First Active</div>
                  <div className="text-lg font-bold text-text-0">{info.firstTxDate ?? 'N/A'}</div>
                </div>
              </div>
              {info.tokenHoldings.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {info.tokenHoldings.map(t => (
                    <div key={t.symbol} className="badge">
                      <span className="text-text-0 font-medium">{t.symbol}</span>
                      <span className="text-text-3">{parseFloat(t.balance).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Transactions */}
            {txs.length > 0 && (
              <div className="glass-card p-5">
                <div className="text-sm font-semibold text-text-0 mb-4">Recent Transactions</div>
                <div className="space-y-2">
                  {txs.map((tx, i) => {
                    const isSend = tx.from.toLowerCase() === query.trim().toLowerCase()
                    return (
                      <motion.div key={`${tx.hash}-${i}`}
                        initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-bg-3/50 border border-white/[0.04] text-xs">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0
                          ${isSend ? 'bg-red-400/10 text-red-400' : 'bg-accent/10 text-accent'}`}>
                          {isSend ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                        </div>
                        <a href={`${TRONSCAN}/transaction/${tx.hash}`} target="_blank"
                          className="font-mono text-text-2 hover:text-brand transition-colors">
                          {shorten(tx.hash)}
                        </a>
                        <span className="text-text-3 font-mono">{shorten(isSend ? tx.to : tx.from)}</span>
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

        {!info && !error && !loading && (
          <div className="text-center py-20">
            <Search size={48} className="mx-auto mb-3 text-text-3 opacity-15" />
            <p className="text-sm text-text-3">Enter a TRON address to explore</p>
          </div>
        )}
      </div>
    </div>
  )
}
