import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Store, TrendingUp, Search, Zap, MessageSquare, ExternalLink } from 'lucide-react'
import WalletButton, { LangToggle } from './WalletButton.tsx'
import AgentConnect from './AgentConnect.tsx'
import { useLang } from '../stores/lang.ts'

export default function Layout() {
  const location = useLocation()
  const { t } = useLang()

  const NAV = [
    { to: '/overview', icon: LayoutDashboard, label: t('overview'), emoji: '🏠' },
    { to: '/market', icon: Store, label: t('market'), emoji: '💳' },
    { to: '/defi', icon: TrendingUp, label: t('defi'), emoji: '📈' },
    { to: '/data', icon: Search, label: t('data'), emoji: '🔍' },
    { to: '/auto', icon: Zap, label: t('auto'), emoji: '⚡' },
    { to: '/chat', icon: MessageSquare, label: t('chat'), emoji: '💬' },
  ]

  return (
    <div className="flex h-screen bg-bg-0">
      {/* Sidebar */}
      <aside className="w-[68px] lg:w-[210px] flex flex-col border-r border-white/[0.06] bg-bg-1">
        <NavLink to="/" className="flex items-center gap-3 px-4 h-14 border-b border-white/[0.06]">
          <img src="/logo.svg" alt="TronClaw" className="w-7 h-7" />
          <span className="hidden lg:block font-bold text-sm gradient-text">TronClaw</span>
        </NavLink>

        <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label, emoji }) => {
            const active = location.pathname === to
            return (
              <NavLink key={to} to={to}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200
                  ${active
                    ? 'bg-brand/10 text-brand border border-brand/20'
                    : 'text-text-2 hover:text-text-0 hover:bg-white/[0.03] border border-transparent'
                  }`}>
                <span className="text-sm lg:hidden">{emoji}</span>
                <Icon size={16} strokeWidth={active ? 2.2 : 1.8} className="hidden lg:block" />
                <span className="hidden lg:block">{label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="p-3 border-t border-white/[0.06]">
          <div className="hidden lg:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-[11px] text-text-3">{t('nileTestnet')}</span>
          </div>
          <a href="https://nile.tronscan.org" target="_blank" rel="noopener"
            className="hidden lg:flex items-center gap-1 mt-1.5 text-[10px] text-text-3 hover:text-brand transition-colors">
            {t('tronScan')} <ExternalLink size={9} />
          </a>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 flex items-center justify-end gap-3 px-5 border-b border-white/[0.06] bg-bg-1/50 backdrop-blur-sm flex-shrink-0">
          <AgentConnect />
          <LangToggle />
          <WalletButton />
        </header>
        <main className="flex-1 overflow-hidden bg-bg-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
