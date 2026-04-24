import { create } from 'zustand'

interface WalletState {
  address: string | null
  connected: boolean
  walletName: string | null
  connecting: boolean
  connect: (walletType: string) => Promise<void>
  disconnect: () => void
  setAddress: (addr: string | null, name?: string) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getWin = () => window as any

/**
 * Each wallet injects its own unique namespace into window.
 * We MUST detect the wallet-specific object — never fall back to window.tronLink
 * (which belongs to TronLink), or we'd silently connect via TronLink instead.
 *
 * Detection references:
 *   TronLink    → window.tronLink  (isTronLink === true, or window.tronWeb injected by extension)
 *   TokenPocket → window.tpTronLink  (TP injects its own object, separate from tronLink)
 *   OKX Wallet  → window.okxwallet   (then .tronLink sub-object for TRON)
 *   Bitget      → window.bitkeep     (then .tronWeb or .tronLink sub-object)
 *   imToken     → window.imToken     (then .tronLink sub-object)
 *   Trust Wallet→ window.trustwallet (EVM-first; TRON support via tronWeb injection)
 */
async function requestAccounts(provider: any): Promise<void> {
  if (provider?.request) {
    await provider.request({ method: 'tron_requestAccounts' })
  } else if (provider?.send) {
    await provider.send('tron_requestAccounts')
  }
  await new Promise(r => setTimeout(r, 800))
}

export const useWallet = create<WalletState>((set) => ({
  address: null,
  connected: false,
  walletName: null,
  connecting: false,

  connect: async (walletType: string) => {
    set({ connecting: true })
    try {
      const win = getWin()

      switch (walletType) {

        case 'tronlink': {
          // TronLink injects window.tronLink (extension) or window.tronWeb (legacy)
          if (!win.tronLink && !win.tronWeb) {
            window.open('https://www.tronlink.org/', '_blank')
            throw new Error('TronLink not installed. Please install and try again.')
          }
          await requestAccounts(win.tronLink)
          const addr = win.tronWeb?.defaultAddress?.base58
          if (!addr) throw new Error('Could not get address from TronLink')
          set({ address: addr, connected: true, walletName: 'TronLink', connecting: false })
          localStorage.setItem('tronclaw_wallet', addr)
          localStorage.setItem('tronclaw_wallet_type', 'TronLink')
          return
        }

        case 'tokenpocket': {
          // TokenPocket injects window.tpTronLink (its own namespace, not tronLink)
          // When TP is active it also overwrites window.tronLink but sets isTokenPocket=true
          const tp = win.tpTronLink ?? (win.tronLink?.isTokenPocket ? win.tronLink : null)
          if (!tp) {
            window.open('https://www.tokenpocket.pro/', '_blank')
            throw new Error('TokenPocket not installed.')
          }
          await requestAccounts(tp)
          const addr = tp.tronWeb?.defaultAddress?.base58 ?? win.tronWeb?.defaultAddress?.base58
          if (!addr) throw new Error('Could not get address from TokenPocket')
          set({ address: addr, connected: true, walletName: 'TokenPocket', connecting: false })
          localStorage.setItem('tronclaw_wallet', addr)
          localStorage.setItem('tronclaw_wallet_type', 'TokenPocket')
          return
        }

        case 'okx': {
          // OKX injects window.okxwallet; its TRON interface is window.okxwallet.tronLink
          const okxwallet = win.okxwallet
          if (!okxwallet) {
            window.open('https://www.okx.com/web3', '_blank')
            throw new Error('OKX Wallet not installed.')
          }
          const okxTron = okxwallet.tronLink ?? okxwallet
          await requestAccounts(okxTron)
          const addr = okxTron.tronWeb?.defaultAddress?.base58
            ?? okxwallet.tronWeb?.defaultAddress?.base58
          if (!addr) throw new Error('Could not get address from OKX Wallet')
          set({ address: addr, connected: true, walletName: 'OKX Wallet', connecting: false })
          localStorage.setItem('tronclaw_wallet', addr)
          localStorage.setItem('tronclaw_wallet_type', 'OKX Wallet')
          return
        }

        case 'bitget': {
          // Bitget injects window.bitkeep; TRON via window.bitkeep.tronWeb or .tronLink
          const bitkeep = win.bitkeep
          if (!bitkeep) {
            window.open('https://web3.bitget.com/', '_blank')
            throw new Error('Bitget Wallet not installed.')
          }
          const bgTron = bitkeep.tronLink ?? bitkeep.tronWeb ?? bitkeep
          await requestAccounts(bgTron)
          const addr = bitkeep.tronWeb?.defaultAddress?.base58
            ?? bgTron.defaultAddress?.base58
          if (!addr) throw new Error('Could not get address from Bitget Wallet')
          set({ address: addr, connected: true, walletName: 'Bitget Wallet', connecting: false })
          localStorage.setItem('tronclaw_wallet', addr)
          localStorage.setItem('tronclaw_wallet_type', 'Bitget Wallet')
          return
        }

        case 'imtoken': {
          // imToken injects window.imToken; TRON via window.imToken.tronLink
          const imtoken = win.imToken
          if (!imtoken) {
            window.open('https://token.im/', '_blank')
            throw new Error('imToken not installed.')
          }
          const imTron = imtoken.tronLink ?? imtoken
          await requestAccounts(imTron)
          const addr = imTron.tronWeb?.defaultAddress?.base58
            ?? imtoken.tronWeb?.defaultAddress?.base58
          if (!addr) throw new Error('Could not get address from imToken')
          set({ address: addr, connected: true, walletName: 'imToken', connecting: false })
          localStorage.setItem('tronclaw_wallet', addr)
          localStorage.setItem('tronclaw_wallet_type', 'imToken')
          return
        }

        case 'trustwallet': {
          // Trust Wallet injects window.trustwallet (EVM-first)
          // TRON support: it overwrites window.tronWeb when on TRON network
          const tw = win.trustwallet
          if (!tw) {
            window.open('https://trustwallet.com/', '_blank')
            throw new Error('Trust Wallet not installed.')
          }
          // Trust Wallet uses ethereum-style request for account access
          if (tw.request) {
            try {
              await tw.request({ method: 'eth_requestAccounts' })
            } catch {
              // ignore, try tron fallback below
            }
          }
          await new Promise(r => setTimeout(r, 800))
          const addr = win.tronWeb?.defaultAddress?.base58 ?? tw.tronWeb?.defaultAddress?.base58
          if (!addr) throw new Error('Could not get address from Trust Wallet')
          set({ address: addr, connected: true, walletName: 'Trust Wallet', connecting: false })
          localStorage.setItem('tronclaw_wallet', addr)
          localStorage.setItem('tronclaw_wallet_type', 'Trust Wallet')
          return
        }

        default:
          throw new Error(`Wallet ${walletType} not supported yet`)
      }
    } catch (e) {
      set({ connecting: false })
      throw e
    }
  },

  disconnect: () => {
    set({ address: null, connected: false, walletName: null })
    localStorage.removeItem('tronclaw_wallet')
    localStorage.removeItem('tronclaw_wallet_type')
    localStorage.removeItem('tronclaw_chat_messages')
  },

  setAddress: (addr, name) => {
    set({ address: addr, connected: !!addr, walletName: name ?? null })
  },
}))

export function initWallet() {
  const savedAddr = localStorage.getItem('tronclaw_wallet')
  const savedName = localStorage.getItem('tronclaw_wallet_type')
  if (savedAddr && savedName) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const addr = (window as any).tronWeb?.defaultAddress?.base58
    if (addr) {
      useWallet.getState().setAddress(addr, savedName)
    }
  }
}
