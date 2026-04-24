import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, LogOut, ExternalLink, Copy, Check, Globe, Loader2, ChevronDown } from 'lucide-react'
import { useWallet } from '../stores/wallet.ts'
import { useLang } from '../stores/lang.ts'

const TRONSCAN = 'https://nile.tronscan.org/#'

// Official wallet logos from CDN / official sources
const WALLETS = [
  {
    id: 'tronlink',
    name: 'TronLink',
    installUrl: 'https://www.tronlink.org/',
    logo: 'https://static.tronscan.org/production/logo/trx.png',
    logoBg: '#1E2130',
  },
  {
    id: 'tokenpocket',
    name: 'TokenPocket',
    installUrl: 'https://www.tokenpocket.pro/',
    logo: 'https://static.tokenpocket.pro/images/logo.png',
    logoBg: '#2980FE',
  },
  {
    id: 'okx',
    name: 'OKX Wallet',
    installUrl: 'https://www.okx.com/web3',
    logo: 'https://static.okx.com/cdn/assets/imgs/247/58E63FEA47A2B7D7.png',
    logoBg: '#000000',
  },
  {
    id: 'bitget',
    name: 'Bitget Wallet',
    installUrl: 'https://web3.bitget.com/',
    logo: 'https://img.bitgetimg.com/image/static/1714997498229.png',
    logoBg: '#1F2A3E',
  },
  {
    id: 'imtoken',
    name: 'imToken',
    installUrl: 'https://token.im/',
    logo: 'https://token.im/img/imtoken-logo.png',
    logoBg: '#11C4D1',
  },
  {
    id: 'trustwallet',
    name: 'Trust Wallet',
    installUrl: 'https://trustwallet.com/',
    logo: 'https://trustwallet.com/assets/images/media/assets/trust_platform.svg',
    logoBg: '#3375BB',
  },
]

// Fallback SVG logos (in case CDN fails)
const FALLBACK_LOGOS: Record<string, string> = {
  tronlink: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#1E2130"/><path d="M20 8 L32 14 L32 28 Q32 36 20 40 Q8 36 8 28 L8 14 Z" fill="#FF0013" opacity="0.9"/><path d="M15 18 L20 13 L25 18 L20 23 Z" fill="white"/><path d="M20 23 L25 18 L25 30 L20 35 Z" fill="white" opacity="0.7"/><path d="M20 23 L15 18 L15 30 L20 35 Z" fill="white" opacity="0.5"/></svg>`)}`,
  tokenpocket: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#2980FE"/><rect x="8" y="10" width="10" height="20" rx="3" fill="white" opacity="0.9"/><rect x="22" y="10" width="10" height="12" rx="3" fill="white" opacity="0.9"/><rect x="22" y="25" width="10" height="5" rx="2.5" fill="white" opacity="0.6"/></svg>`)}`,
  okx: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#000"/><rect x="6" y="6" width="11" height="11" rx="2" fill="white"/><rect x="23" y="6" width="11" height="11" rx="2" fill="white"/><rect x="14.5" y="14.5" width="11" height="11" rx="2" fill="white"/><rect x="6" y="23" width="11" height="11" rx="2" fill="white"/><rect x="23" y="23" width="11" height="11" rx="2" fill="white"/></svg>`)}`,
  bitget: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#1F2A3E"/><path d="M10 8h14q5 0 5 6 0 3-3 5 4 2 4 7 0 6-6 6H10V8zm5 4v7h7q3 0 3-3.5T22 12H15zm0 11v8h8q3 0 3-4t-3-4H15z" fill="#00C4FF"/></svg>`)}`,
  imtoken: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#11C4D1"/><circle cx="20" cy="14" r="5" fill="white"/><path d="M8 36c0-6.6 5.4-12 12-12s12 5.4 12 12" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`)}`,
  trustwallet: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#3375BB"/><path d="M20 6L32 11V22Q32 32 20 36Q8 32 8 22V11Z" fill="white" opacity="0.9"/><path d="M14 22l5 5 8-9" stroke="#3375BB" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`)}`,
}

function WalletLogo({ wallet }: { wallet: typeof WALLETS[0] }) {
  const [failed, setFailed] = useState(false)
  return (
    <img
      src={failed ? FALLBACK_LOGOS[wallet.id] : wallet.logo}
      alt={wallet.name}
      className="w-6 h-6 rounded-lg flex-shrink-0 object-contain"
      style={{ background: wallet.logoBg }}
      onError={() => setFailed(true)}
    />
  )
}

export default function WalletButton() {
  const { address, connected, walletName, disconnect, connect, connecting } = useWallet()
  const { t } = useLang()
  const [showDropdown, setShowDropdown] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [connectingId, setConnectingId] = useState('')
  const dropRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const [dropPos, setDropPos] = useState({ top: 0, right: 0 })

  // Recalculate dropdown position whenever it opens
  const updateDropPos = useCallback(() => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setDropPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      })
    }
  }, [])

  const toggleDropdown = () => {
    updateDropPos()
    setShowDropdown(v => !v)
    setError('')
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropRef.current && !dropRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false)
        setError('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleConnect = async (walletId: string, installUrl: string) => {
    setError('')
    setConnectingId(walletId)
    try {
      await connect(walletId)
      setShowDropdown(false)
    } catch (e) {
      const msg = e instanceof Error ? e.message : t('connectionFailed')
      if (msg.toLowerCase().includes('not installed')) {
        window.open(installUrl, '_blank')
        setError(`${t('installWallet')} ${WALLETS.find(w => w.id === walletId)?.name}`)
      } else {
        setError(msg)
      }
    } finally {
      setConnectingId('')
    }
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const dropdown = (
    <AnimatePresence>
      {showDropdown && (
        <motion.div
          ref={dropRef}
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'fixed',
            top: dropPos.top,
            right: dropPos.right,
            width: '208px',
            zIndex: 99999,
          }}
          className="glass-card p-2 shadow-2xl"
        >
          {connected ? (
            <>
              <div className="px-3 py-2 mb-1 border-b border-white/[0.04]">
                <div className="text-[10px] text-text-3">{walletName}</div>
                <div className="font-mono text-[11px] text-text-1 truncate mt-0.5">{address}</div>
              </div>
              <button onClick={copyAddress}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-text-2 hover:bg-bg-4 hover:text-text-0 transition-colors">
                {copied ? <Check size={12} className="text-accent" /> : <Copy size={12} />}
                {copied ? t('copied') : t('copyAddress')}
              </button>
              <a href={`${TRONSCAN}/address/${address}`} target="_blank" rel="noopener"
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-text-2 hover:bg-bg-4 hover:text-text-0 transition-colors">
                <ExternalLink size={12} /> {t('viewOnTronScan')}
              </a>
              <div className="h-px bg-white/[0.04] mx-1 my-1" />
              <button onClick={() => { disconnect(); setShowDropdown(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-400/10 transition-colors">
                <LogOut size={12} /> {t('disconnect')}
              </button>
            </>
          ) : (
            <>
              <div className="px-3 py-2 border-b border-white/[0.04] mb-1">
                <p className="text-[11px] font-semibold text-text-0">{t('connectWallet')}</p>
              </div>
              {WALLETS.map(w => (
                <button
                  key={w.id}
                  onClick={() => handleConnect(w.id, w.installUrl)}
                  disabled={connectingId !== '' && connectingId !== w.id}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-bg-4 transition-colors text-xs text-text-1 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <WalletLogo wallet={w} />
                  <span className="font-medium flex-1 text-left">{w.name}</span>
                  {connectingId === w.id && <Loader2 size={12} className="text-brand animate-spin" />}
                </button>
              ))}
              {error && (
                <div className="mt-1.5 mx-1 text-[10px] text-red-400 bg-red-400/10 rounded-lg px-2 py-1.5">
                  {error}
                </div>
              )}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <div className="relative">
      {connected ? (
        <button ref={btnRef} onClick={toggleDropdown}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-3 border border-accent/20 hover:border-accent/40 transition-all text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="font-mono text-text-1">{address!.slice(0, 4)}...{address!.slice(-4)}</span>
          <motion.span animate={{ rotate: showDropdown ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={11} className="text-text-3" />
          </motion.span>
        </button>
      ) : (
        <button ref={btnRef} onClick={toggleDropdown}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.08] bg-bg-3 hover:border-brand/40 hover:bg-bg-4 transition-all text-sm text-text-1 font-medium">
          <Wallet size={15} className="text-text-2" />
          <span>{t('connect')}</span>
          <motion.span animate={{ rotate: showDropdown ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={11} className="text-text-3" />
          </motion.span>
        </button>
      )}

      {/* Portal: render dropdown at document.body level to escape any stacking context */}
      {createPortal(dropdown, document.body)}
    </div>
  )
}

export function LangToggle() {
  const { lang, toggle } = useLang()
  return (
    <button onClick={toggle}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/[0.06] bg-bg-3 hover:border-white/[0.15] transition-all text-xs text-text-2 hover:text-text-0 font-medium">
      <Globe size={13} />
      <span>{lang === 'en' ? 'EN' : '中文'}</span>
    </button>
  )
}
