import { NavLink } from 'react-router-dom'
import { ArrowRight, Code2, Terminal, Layers, ExternalLink } from 'lucide-react'

const MODULES = [
  { to: '/market', emoji: '💳', name: 'SealPay', tagline: 'AI Service Marketplace', desc: 'AI agents provide services and auto-collect USDT via x402 protocol. Pay per use, no subscriptions.', tag: 'x402 Protocol', tagClass: 'badge-orange' },
  { to: '/defi', emoji: '📈', name: 'TronSage', tagline: 'AI DeFi Advisor', desc: 'Analyze yields across SunSwap & JustLend. AI recommends and executes optimal DeFi strategies.', tag: 'Skills Modules', tagClass: 'badge-blue' },
  { to: '/data', emoji: '🔍', name: 'ChainEye', tagline: 'On-chain Intelligence', desc: 'Track whale movements, profile any address, decode transactions with natural language queries.', tag: 'MCP Server', tagClass: 'badge-purple' },
  { to: '/auto', emoji: '⚡', name: 'AutoHarvest', tagline: 'AI Automation', desc: 'Price-triggered trades, scheduled transfers, whale-follow. Agents that work 24/7.', tag: 'MCP Server', tagClass: 'badge-green' },
]

const INFRA = [
  { name: 'x402 Payment Protocol', color: '#f97316', desc: 'AI-native micro-payments. Agents send & receive USDT/USDD autonomously.' },
  { name: '8004 On-chain Identity', color: '#4ade80', desc: 'Verifiable agent identity with trust score & reputation on TRON.' },
  { name: 'MCP Server', color: '#3b82f6', desc: 'Standard protocol connecting any AI agent to the blockchain.' },
  { name: 'Skills Modules', color: '#8b5cf6', desc: 'Plug-and-play DeFi operations: Swap, Lending, Asset Management.' },
]

const INTEGRATIONS = [
  { icon: Layers, name: 'Skills', code: 'Load tronclaw-payment SKILL.md' },
  { icon: Terminal, name: 'MCP Protocol', code: 'npx tronclaw-mcp --stdio' },
  { icon: Code2, name: 'REST API', code: 'GET /api/v1/payment/balance' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg-0 text-text-1 overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06] bg-bg-0/80 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="" className="w-7 h-7" />
            <span className="font-bold text-base gradient-text">TronClaw</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/YaoShuai-hub/TronClaw" target="_blank" rel="noopener" className="text-sm text-text-2 hover:text-text-0 transition-colors">GitHub</a>
            <NavLink to="/overview" className="text-sm text-text-2 hover:text-text-0 transition-colors">Overview</NavLink>
            <NavLink to="/chat" className="btn-primary !text-xs !py-2 !px-4">Try Demo <ArrowRight size={12} /></NavLink>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 text-center bg-grid-animated overflow-hidden glow-spot-orange glow-spot-green">
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="animate-fade-in-up">
            <span className="badge badge-orange mb-6 inline-flex"><span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />TRON × Bank of AI Hackathon 2026</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-[72px] font-extrabold leading-[1.06] tracking-tight mb-5 animate-fade-in-up delay-1">
            Any AI Agent,<br /><span className="gradient-text">Instant TRON</span><br />Superpowers.
          </h1>
          <p className="text-lg text-text-2 max-w-xl mx-auto mb-8 animate-fade-in-up delay-2 leading-relaxed">
            TronClaw is the universal TRON AI Agent platform — four integrated products covering every competition track.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-in-up delay-3">
            <NavLink to="/overview" className="btn-primary text-base !py-3 !px-8">Open Platform <ArrowRight size={16} /></NavLink>
            <NavLink to="/chat" className="btn-secondary text-base !py-3 !px-8">AI Chat Demo</NavLink>
          </div>
          <div className="mt-14 flex items-center justify-center gap-10 animate-fade-in-up delay-4">
            {[{ v: '4', l: 'Sub-Products' }, { v: '4/4', l: 'Bank of AI Infra' }, { v: '17', l: 'AI Tools' }, { v: '3', l: 'Integration Modes' }].map(s => (
              <div key={s.l} className="text-center"><div className="text-2xl font-bold text-text-0">{s.v}</div><div className="text-[10px] text-text-3 mt-0.5">{s.l}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* Four Products */}
      <section className="py-20 px-6 bg-bg-1/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Four Products. One Platform.</h2>
            <p className="text-text-2">Every official competition track, fully implemented.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {MODULES.map((m, i) => (
              <NavLink key={m.to} to={m.to}
                className={`glass-card glow-border p-6 flex items-start gap-4 group animate-fade-in-up delay-${i}`}>
                <div className="text-3xl flex-shrink-0">{m.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-text-0">{m.name}</span>
                    <span className={`badge ${m.tagClass} !text-[9px]`}>{m.tag}</span>
                    <ArrowRight size={12} className="text-text-3 group-hover:text-brand group-hover:translate-x-1 transition-all ml-auto" />
                  </div>
                  <div className="text-xs text-brand mb-1.5">{m.tagline}</div>
                  <p className="text-xs text-text-2 leading-relaxed">{m.desc}</p>
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      {/* Bank of AI */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="badge badge-green mb-4 inline-flex">All 4 Integrated</span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Powered by Bank of AI</h2>
            <p className="text-text-2">TronClaw integrates every Bank of AI infrastructure component.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {INFRA.map((inf, i) => (
              <div key={inf.name} className={`glass-card p-5 flex items-start gap-3 animate-fade-in-up delay-${i}`}>
                <div className="w-1 h-10 rounded-full flex-shrink-0 mt-0.5" style={{ background: inf.color }} />
                <div><h3 className="font-semibold text-sm text-text-0 mb-1">{inf.name}</h3><p className="text-xs text-text-2 leading-relaxed">{inf.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="py-20 px-6 bg-bg-1/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3">Universal Agent Gateway</h2>
          <p className="text-text-2 mb-10">Three integration modes — any agent, any protocol.</p>
          <div className="glass-card p-8 font-mono text-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-3 flex-wrap justify-center">
                {['Claude Desktop', 'OpenClaw', 'Custom Agent'].map(a => (
                  <span key={a} className="badge">{a}</span>
                ))}
              </div>
              <div className="text-text-3 text-xs">Skills │ MCP │ REST API</div>
              <div className="text-lg">↓</div>
              <div className="btn-primary !cursor-default !text-xs !py-2">
                <img src="/logo.svg" alt="" className="w-4 h-4" /> TronClaw Gateway
              </div>
              <div className="text-lg">↓</div>
              <div className="flex gap-2 flex-wrap justify-center">
                {['💳 SealPay', '📈 TronSage', '🔍 ChainEye', '⚡ AutoHarvest'].map(p => (
                  <span key={p} className="badge badge-orange !text-[10px]">{p}</span>
                ))}
              </div>
              <div className="text-lg">↓</div>
              <span className="badge text-text-3">TRON Network (Nile / Mainnet)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick integration */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Quick Integration</h2>
            <p className="text-text-2">Get started in under 60 seconds.</p>
          </div>
          <div className="space-y-3">
            {INTEGRATIONS.map((intg, i) => (
              <div key={intg.name} className={`glass-card p-4 flex items-center gap-4 animate-fade-in-up delay-${i}`}>
                <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
                  <intg.icon size={15} className="text-brand" />
                </div>
                <span className="font-medium text-sm text-text-0 w-28 flex-shrink-0">{intg.name}</span>
                <code className="flex-1 bg-bg-4 rounded-lg px-3 py-1.5 text-accent text-xs font-mono overflow-x-auto">{intg.code}</code>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center glow-spot-orange overflow-hidden relative">
        <div className="relative z-10 max-w-2xl mx-auto">
          <img src="/logo.svg" alt="" className="w-14 h-14 mx-auto mb-5 animate-float" />
          <h2 className="text-4xl font-bold mb-3">Ready to build?</h2>
          <p className="text-text-2 mb-7">Explore the live demo on TRON Nile testnet.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <NavLink to="/overview" className="btn-primary text-base !py-3 !px-8">Open Platform <ArrowRight size={16} /></NavLink>
            <a href="https://github.com/YaoShuai-hub/TronClaw" target="_blank" className="btn-secondary text-base !py-3 !px-8">GitHub <ExternalLink size={14} /></a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.04] py-7 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-text-3">
          <div className="flex items-center gap-2"><img src="/logo.svg" alt="" className="w-4 h-4 opacity-40" /><span>TronClaw — TRON × Bank of AI Hackathon 2026</span></div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/YaoShuai-hub/TronClaw" target="_blank" className="hover:text-text-1 transition-colors">GitHub</a>
            <a href="https://bankofai.io" target="_blank" className="hover:text-text-1 transition-colors">Bank of AI</a>
            <a href="https://nile.tronscan.org" target="_blank" className="hover:text-text-1 transition-colors">TronScan</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
