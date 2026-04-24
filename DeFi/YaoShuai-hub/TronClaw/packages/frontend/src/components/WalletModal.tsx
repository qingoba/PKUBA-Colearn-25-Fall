import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Loader2 } from 'lucide-react'
import { useWallet } from '../stores/wallet.ts'
import { useLang } from '../stores/lang.ts'

interface WalletOption {
  id: string
  name: string
  logo: string
  installUrl: string
  description: string
}

const WALLETS: WalletOption[] = [
  {
    id: 'tronlink',
    name: 'TronLink',
    installUrl: 'https://www.tronlink.org/',
    description: 'Official TRON wallet',
    logo: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2196F3"/><stop offset="100%" stop-color="#0D47A1"/></linearGradient></defs><circle cx="20" cy="20" r="20" fill="url(#a)"/><path d="M12 9h17l-4 9h4L14 33l3-11h-5z" fill="#fff"/></svg>`)}`,
  },
  {
    id: 'tokenpocket',
    name: 'TokenPocket',
    installUrl: 'https://www.tokenpocket.pro/',
    description: 'Multi-chain wallet',
    logo: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#2980FE"/><rect x="8" y="10" width="10" height="20" rx="3" fill="#fff" opacity="0.9"/><rect x="22" y="10" width="10" height="12" rx="3" fill="#fff" opacity="0.9"/><rect x="22" y="26" width="10" height="4" rx="2" fill="#fff" opacity="0.6"/></svg>`)}`,
  },
  {
    id: 'okx',
    name: 'OKX Wallet',
    installUrl: 'https://www.okx.com/web3',
    description: 'Web3 wallet by OKX',
    logo: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="#000"/><rect x="8" y="8" width="10" height="10" rx="2" fill="#fff"/><rect x="22" y="8" width="10" height="10" rx="2" fill="#fff"/><rect x="15" y="15" width="10" height="10" rx="2" fill="#fff"/><rect x="8" y="22" width="10" height="10" rx="2" fill="#fff"/><rect x="22" y="22" width="10" height="10" rx="2" fill="#fff"/></svg>`)}`,
  },
  {
    id: 'bitget',
    name: 'Bitget Wallet',
    installUrl: 'https://web3.bitget.com/',
    description: 'DeFi & Web3 wallet',
    logo: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#00C4FF"/><stop offset="100%" stop-color="#0047FF"/></linearGradient></defs><circle cx="20" cy="20" r="20" fill="url(#bg)"/><path d="M13 11h9q4 0 4 4.5 0 2-2 3.5 3 1 3 5 0 5-5 5H13V11zm4 3v5h4q2 0 2-2.5T21 14h-4zm0 8v5h5q2 0 2-2.5T22 22h-5z" fill="#fff"/></svg>`)}`,
  },
  {
    id: 'imtoken',
    name: 'imToken',
    installUrl: 'https://token.im/',
    description: 'Secure crypto wallet',
    logo: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><linearGradient id="im" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#11C4D1"/><stop offset="100%" stop-color="#0062AD"/></linearGradient></defs><circle cx="20" cy="20" r="20" fill="url(#im)"/><circle cx="20" cy="14" r="4" fill="#fff"/><path d="M10 30c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`)}`,
  },
  {
    id: 'trustwallet',
    name: 'Trust Wallet',
    installUrl: 'https://trustwallet.com/',
    description: 'Official Binance wallet',
    logo: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><linearGradient id="tw" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#3375BB"/><stop offset="100%" stop-color="#1A4E8C"/></linearGradient></defs><circle cx="20" cy="20" r="20" fill="url(#tw)"/><path d="M20 8 L30 12 L30 22 Q30 30 20 34 Q10 30 10 22 L10 12 Z" fill="#fff" opacity="0.9"/><path d="M15 20 L18 23 L25 16" stroke="#3375BB" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`)}`,
  },
]

interface Props {
  open: boolean
  onClose: () => void
}

export default function WalletModal({ open, onClose }: Props) {
  const { connect, connecting } = useWallet()
  const { t } = useLang()
  const [error, setError] = useState('')
  const [connectingId, setConnectingId] = useState('')

  const handleConnect = async (wallet: WalletOption) => {
    setError('')
    setConnectingId(wallet.id)
    try {
      await connect(wallet.id)
      onClose()
    } catch (e) {
      const msg = e instanceof Error ? e.message : t('connectionFailed')
      // If wallet not installed, offer install link
      if (msg.toLowerCase().includes('not installed')) {
        setError(msg)
      } else {
        setError(msg)
      }
    } finally {
      setConnectingId('')
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.18 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm mx-4 glass-card p-5"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-1.5">
              <h2 className="text-base font-bold text-text-0">{t('connectWallet')}</h2>
              <button onClick={onClose}
                className="w-7 h-7 rounded-lg bg-bg-4 flex items-center justify-center text-text-3 hover:text-text-0 transition-colors">
                <X size={14} />
              </button>
            </div>
            <p className="text-[11px] text-text-3 mb-4">{t('selectWallet')}</p>

            {/* Wallet grid — 2 columns */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {WALLETS.map((wallet, i) => (
                <motion.button
                  key={wallet.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => handleConnect(wallet)}
                  disabled={connecting}
                  className="flex flex-col items-center gap-2 p-3.5 rounded-xl border border-white/[0.06] bg-bg-3
                    hover:border-brand/30 hover:bg-bg-4 cursor-pointer transition-all duration-200 group relative"
                >
                  <img src={wallet.logo} alt={wallet.name} className="w-10 h-10 rounded-xl" />
                  <div className="text-center">
                    <div className="text-xs font-medium text-text-0">{wallet.name}</div>
                    <div className="text-[9px] text-text-3">{wallet.description}</div>
                  </div>
                  {connectingId === wallet.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-bg-3/80 rounded-xl">
                      <Loader2 size={18} className="text-brand animate-spin" />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2.5 mb-3 flex items-start justify-between gap-2">
                <span>{error}</span>
                {error.includes('not installed') && (
                  <a
                    href={WALLETS.find(w => w.id === connectingId)?.installUrl ?? '#'}
                    target="_blank" rel="noopener"
                    className="text-brand underline whitespace-nowrap flex-shrink-0"
                  >
                    {t('installWallet')} <ExternalLink size={10} className="inline" />
                  </a>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="pt-3 border-t border-white/[0.04] text-center space-y-1">
              <p className="text-[10px] text-text-3">{t('noFundsNeeded')}</p>
              <a href="https://nileex.io/join/getJoinPage" target="_blank" rel="noopener"
                className="text-[10px] text-brand/70 hover:text-brand transition-colors inline-flex items-center gap-1">
                {t('getFreeTokens')} <ExternalLink size={8} />
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
