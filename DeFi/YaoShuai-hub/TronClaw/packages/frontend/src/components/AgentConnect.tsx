import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plug, Copy, Check, ExternalLink, Terminal, Layers, Code2, X, Zap } from 'lucide-react'
import axios from 'axios'

interface ConnectConfig {
  mcp: { config: object; configPath: string }
  openclaw: { configSnippet: string; installCmd: string; gatewayUrl: string }
  rest: { baseUrl: string; healthCheck: string }
  status: { gateway: string; network: string; mock: boolean; tools: number }
}

export default function AgentConnect() {
  const [open, setOpen] = useState(false)
  const [config, setConfig] = useState<ConnectConfig | null>(null)
  const [tab, setTab] = useState<'openclaw' | 'mcp' | 'rest'>('openclaw')
  const [copied, setCopied] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [dropPos, setDropPos] = useState({ top: 0, right: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  // Calculate fixed position from button
  const calcPos = useCallback(() => {
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    setDropPos({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    })
  }, [])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        dropRef.current?.contains(target) ||
        btnRef.current?.contains(target)
      ) return
      setOpen(false)
    }
    // Use capture phase to get it before anything else
    document.addEventListener('mousedown', handler, true)
    return () => document.removeEventListener('mousedown', handler, true)
  }, [open])

  const toggle = async () => {
    calcPos()
    if (!open && !config) {
      setLoading(true)
      try {
        const { data } = await axios.get('/api/v1/agent/connect-config')
        setConfig(data.data)
      } catch {}
      finally { setLoading(false) }
    }
    setOpen(v => !v)
  }

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const TABS = [
    { id: 'openclaw' as const, icon: Terminal, label: 'OpenClaw' },
    { id: 'mcp' as const, icon: Layers, label: 'MCP' },
    { id: 'rest' as const, icon: Code2, label: 'REST' },
  ]

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggle}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-brand/30 bg-brand/5 hover:bg-brand/10 hover:border-brand/50 transition-all text-sm font-medium text-brand"
      >
        <Plug size={14} />
        <span className="hidden sm:inline">{loading ? '...' : 'Connect Agent'}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </motion.span>
      </button>

      {/* Fixed portal dropdown — escapes all stacking contexts */}
      {/* Portal: renders directly into document.body, escapes ALL stacking contexts */}
      {createPortal(
        <AnimatePresence>
          {open && (
          <motion.div
            ref={dropRef}
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{ position: 'fixed', top: dropPos.top, right: dropPos.right, zIndex: 99999 }}
            className="w-96 glass-card p-4 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-text-0 flex items-center gap-1.5">
                  <Plug size={13} className="text-brand" /> Connect External Agent
                </h3>
                {config && (
                  <p className="text-[10px] text-text-3 mt-0.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    {config.status.network} · {config.status.tools} tools available
                  </p>
                )}
              </div>
              <button
                onMouseDown={e => e.stopPropagation()}
                onClick={() => setOpen(false)}
                className="text-text-3 hover:text-text-0 transition-colors p-1"
              >
                <X size={14} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-3 bg-bg-4 rounded-lg p-0.5">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onMouseDown={e => e.stopPropagation()}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-medium transition-all
                    ${tab === t.id ? 'bg-bg-2 text-text-0' : 'text-text-3 hover:text-text-1'}`}
                >
                  <t.icon size={11} /> {t.label}
                </button>
              ))}
            </div>

            {/* OpenClaw */}
            {tab === 'openclaw' && (
              <div className="space-y-2.5">
                <div>
                  <p className="text-[10px] text-text-3 mb-1.5 flex items-center gap-1.5">
                    <span className="badge badge-orange !text-[9px] !py-0">Step 1</span> Install TronClaw skill
                  </p>
                  <div className="bg-bg-4 rounded-lg px-3 py-2 flex items-center gap-2">
                    <code className="text-[11px] text-accent font-mono flex-1 overflow-x-auto">
                      {config?.openclaw.installCmd ?? 'clawhub install tronclaw'}
                    </code>
                    <button
                      onMouseDown={e => e.stopPropagation()}
                      onClick={() => copy(config?.openclaw.installCmd ?? 'clawhub install tronclaw', 'install')}
                      className="text-text-3 hover:text-brand flex-shrink-0 p-0.5"
                    >
                      {copied === 'install' ? <Check size={12} className="text-accent" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-text-3 mb-1.5 flex items-center gap-1.5">
                    <span className="badge badge-orange !text-[9px] !py-0">Step 2</span> Add to ~/.openclaw/config.yaml
                  </p>
                  <div className="bg-bg-4 rounded-lg px-3 py-2 flex items-start gap-2">
                    <pre className="text-[11px] text-accent font-mono flex-1 overflow-x-auto whitespace-pre">
                      {config?.openclaw.configSnippet ?? 'skills:\n  tronclaw:\n    gateway_url: http://localhost:3000'}
                    </pre>
                    <button
                      onMouseDown={e => e.stopPropagation()}
                      onClick={() => copy(config?.openclaw.configSnippet ?? '', 'snippet')}
                      className="text-text-3 hover:text-brand flex-shrink-0 mt-0.5 p-0.5"
                    >
                      {copied === 'snippet' ? <Check size={12} className="text-accent" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-[10px] text-text-3 bg-accent/5 border border-accent/10 rounded-lg px-2.5 py-2">
                  <Zap size={10} className="text-accent mt-0.5 flex-shrink-0" />
                  <span>After setup: <span className="text-accent font-mono">"查余额" → tron_check_balance</span></span>
                </div>
              </div>
            )}

            {/* MCP */}
            {tab === 'mcp' && (
              <div className="space-y-2.5">
                <p className="text-[10px] text-text-2">Add to Claude Desktop / Cursor MCP config.</p>
                <div>
                  <p className="text-[10px] text-text-3 mb-1">{config?.mcp.configPath ?? '~/.config/claude/claude_desktop_config.json'}</p>
                  <div className="bg-bg-4 rounded-lg px-3 py-2 flex items-start gap-2 max-h-40 overflow-y-auto">
                    <pre className="text-[11px] text-accent font-mono flex-1 whitespace-pre">
                      {JSON.stringify(config?.mcp.config ?? {}, null, 2)}
                    </pre>
                    <button
                      onMouseDown={e => e.stopPropagation()}
                      onClick={() => copy(JSON.stringify(config?.mcp.config ?? {}, null, 2), 'mcp')}
                      className="text-text-3 hover:text-brand flex-shrink-0 p-0.5"
                    >
                      {copied === 'mcp' ? <Check size={12} className="text-accent" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-text-3">Restart the app after saving config.</p>
              </div>
            )}

            {/* REST */}
            {tab === 'rest' && (
              <div className="space-y-2">
                <p className="text-[10px] text-text-2">Direct HTTP integration for any agent or app.</p>
                {[
                  { label: 'Base URL', value: config?.rest.baseUrl ?? 'http://localhost:3000/api/v1', key: 'base' },
                  { label: 'Health Check', value: config?.rest.healthCheck ?? 'http://localhost:3000/health', key: 'health' },
                ].map(item => (
                  <div key={item.key}>
                    <p className="text-[10px] text-text-3 mb-1">{item.label}</p>
                    <div className="bg-bg-4 rounded-lg px-3 py-2 flex items-center gap-2">
                      <code className="text-[11px] text-accent font-mono flex-1 overflow-x-auto">{item.value}</code>
                      <button
                        onMouseDown={e => e.stopPropagation()}
                        onClick={() => copy(item.value, item.key)}
                        className="text-text-3 hover:text-brand flex-shrink-0 p-0.5"
                      >
                        {copied === item.key ? <Check size={12} className="text-accent" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                ))}
                <a
                  href="https://github.com/YaoShuai-hub/TronClaw#api-reference"
                  target="_blank" rel="noopener"
                  onMouseDown={e => e.stopPropagation()}
                  className="flex items-center gap-1 text-[11px] text-brand/70 hover:text-brand transition-colors"
                >
                  <ExternalLink size={10} /> Full API docs on GitHub
                </a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
      )}
    </>
  )
}
