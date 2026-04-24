import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, Zap, Bot, User, ExternalLink, Shield } from 'lucide-react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import { useWallet } from '../stores/wallet.ts'
import { useLang } from '../stores/lang.ts'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  toolCalls?: Array<{ tool: string; input: unknown; result: unknown }>
  timestamp: number
}

const TRONSCAN = 'https://nile.tronscan.org/#'
const FALLBACK_ADDRESS = 'TFp3Ls4mHdzysbX1qxbwXdMzS8mkvhCMx6'

const EXAMPLES = [
  { cat: '💳', text: '查询我的USDT余额' },
  { cat: '💳', text: '创建一个收款请求，收0.5 USDT，AI写作服务费' },
  { cat: '📈', text: '当前TRON DeFi最高收益池是哪个？' },
  { cat: '📈', text: '帮我把1000 USDT做低风险收益优化' },
  { cat: '🔍', text: '最近24小时有哪些大额USDT转账？' },
  { cat: '⚡', text: '当TRX跌到0.08时自动买入500个' },
]

interface DeFiReport {
  protocol: string; pool: string; amount: string; token: string
  apy: string; txHash: string; steps: string[]
  estimatedMonthly: string; estimatedYearly: string
}

function DeFiReportCard({ report }: { report: DeFiReport }) {
  const TRONSCAN_NILE = 'https://nile.tronscan.org/#'
  return (
    <div className="mt-3 rounded-2xl border border-accent/20 bg-accent/5 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-accent/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">🏦</span>
          <span className="text-sm font-semibold text-text-0">DeFi 质押已执行</span>
          <span className="badge badge-green !text-[9px]">✓ 成功</span>
        </div>
        <span className="text-xs text-accent font-bold">{report.apy}% APY</span>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 px-4 py-3 border-b border-white/[0.04]">
        <div className="text-center">
          <div className="text-lg font-bold text-text-0">{report.amount}</div>
          <div className="text-[10px] text-text-3">{report.token} 已质押</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-accent">+{report.estimatedMonthly}</div>
          <div className="text-[10px] text-text-3">预计月收益</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-brand">+{report.estimatedYearly}</div>
          <div className="text-[10px] text-text-3">预计年收益</div>
        </div>
      </div>
      {/* Steps */}
      <div className="px-4 py-3 space-y-1.5">
        {report.steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-text-2">
            <span className="w-4 h-4 rounded-full bg-accent/20 text-accent text-[9px] flex items-center justify-center flex-shrink-0">{i+1}</span>
            {step}
          </div>
        ))}
      </div>
      {/* TxHash */}
      {report.txHash && (
        <div className="px-4 pb-3">
          <a href={`${TRONSCAN_NILE}/transaction/${report.txHash}`} target="_blank"
            className="flex items-center gap-1.5 text-[11px] text-brand/70 hover:text-brand transition-colors">
            <span className="font-mono">{report.txHash.slice(0, 24)}...</span>
            <ExternalLink size={10} />
          </a>
        </div>
      )}
      {/* Protocol */}
      <div className="px-4 pb-3 flex items-center gap-2">
        <span className="text-[10px] text-text-3">协议：</span>
        <span className="badge badge-blue !text-[9px]">{report.protocol}</span>
        <span className="text-[10px] text-text-3">池子：</span>
        <span className="badge !text-[9px]">{report.pool}</span>
      </div>
    </div>
  )
}

function parseMessageContent(content: string): { text: string; defiReport: DeFiReport | null } {
  const match = content.match(/\[DEFI_REPORT\]([\s\S]*?)\[\/DEFI_REPORT\]/)
  if (!match) return { text: content, defiReport: null }
  try {
    const report = JSON.parse(match[1].trim()) as DeFiReport
    const text = content.replace(/\[DEFI_REPORT\][\s\S]*?\[\/DEFI_REPORT\]/, '').trim()
    return { text, defiReport: report }
  } catch {
    return { text: content, defiReport: null }
  }
}

function ToolCallCard({ toolCalls }: { toolCalls: Message['toolCalls'] }) {
  const [open, setOpen] = useState(false)
  if (!toolCalls?.length) return null
  return (
    <div className="mt-2 rounded-xl border border-brand/20 bg-brand/5 text-xs overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full px-3 py-2 flex items-center gap-2 text-brand hover:bg-brand/5 transition-colors">
        <Zap size={11} />
        <span className="font-medium">{toolCalls.length} tool call{toolCalls.length > 1 ? 's' : ''}</span>
        <span className="ml-auto text-text-3">{open ? '▲' : '▼'}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="overflow-hidden">
            <div className="px-3 pb-3 space-y-2">
              {toolCalls.map((tc, i) => (
                <div key={i} className="rounded-lg bg-bg-4/80 p-2.5">
                  <div className="text-brand font-mono font-medium mb-1">⚡ {tc.tool}</div>
                  <pre className="text-text-3 font-mono text-[10px] overflow-auto max-h-20 whitespace-pre-wrap">
                    {JSON.stringify(tc.result, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Simple typewriter effect
function TypeWriter({ text, speed = 15 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => {
    setDisplayed('')
    setDone(false)
    let i = 0
    const iv = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1))
        i++
      } else {
        setDone(true)
        clearInterval(iv)
      }
    }, speed)
    return () => clearInterval(iv)
  }, [text, speed])
  if (done) return <ReactMarkdown>{text}</ReactMarkdown>
  return <>{displayed}{!done && <span className="inline-block w-0.5 h-4 bg-brand animate-pulse ml-0.5" />}</>
}

export default function Chat() {
  // Load messages from localStorage, or use default greeting
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('tronclaw_chat_messages')
      if (saved) {
        const parsed = JSON.parse(saved) as Message[]
        return parsed.length > 0 ? parsed : [
          {
            id: '0', role: 'assistant',
            content: '你好！我是 TronClaw AI Agent 🦀\n\n我可以帮你完成 TRON 链上操作：查余额、发送支付、DeFi 收益优化、鲸鱼追踪、自动交易...\n\n连接你的钱包或直接输入指令开始吧！',
            timestamp: Date.now(),
          },
        ]
      }
    } catch {
      // If localStorage parse fails, use default
    }
    return [
      {
        id: '0', role: 'assistant',
        content: '你好！我是 TronClaw AI Agent 🦀\n\n我可以帮你完成 TRON 链上操作：查余额、发送支付、DeFi 收益优化、鲸鱼追踪、自动交易...\n\n连接你的钱包或直接输入指令开始吧！',
        timestamp: Date.now(),
      },
    ]
  })
  
  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tronclaw_chat_messages', JSON.stringify(messages))
  }, [messages])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [latestId, setLatestId] = useState('')
  const { address: walletAddress } = useWallet()
  const { t } = useLang()
  const activeAddress = walletAddress ?? FALLBACK_ADDRESS
  const [agentIdentity, setAgentIdentity] = useState<{
    agentId: string; agentName: string; trustScore: number; identityTxHash: string; capabilities: string[]
  } | null>(null)
  const [registeringIdentity, setRegisteringIdentity] = useState(false)
  const [connectAgentId, setConnectAgentId] = useState('')
  const [showConnectInput, setShowConnectInput] = useState(false)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (walletAddress) fetchIdentity(walletAddress)
    else setAgentIdentity(null)
  }, [walletAddress])

  const fetchIdentity = async (addr: string) => {
    try {
      const { data } = await axios.get(`/api/v1/identity/reputation/agent_${addr.slice(0,16).toLowerCase()}`)
      if (data.data) setAgentIdentity(data.data)
    } catch {}
  }

  const registerIdentity = async () => {
    if (!activeAddress || registeringIdentity) return
    setRegisteringIdentity(true)
    try {
      const { data } = await axios.post('/api/v1/identity/register', {
        agentName: `TronClaw Agent (${activeAddress.slice(0,8)}...)`,
        capabilities: ['payment', 'defi', 'data', 'automation'],
        ownerAddress: activeAddress,
      })
      setAgentIdentity(data.data)
    } catch (e) {
      console.error('Identity registration failed:', e)
    } finally {
      setRegisteringIdentity(false)
    }
  }

  const connectIdentity = async () => {
    if (!connectAgentId.trim()) return
    try {
      const { data } = await axios.get(`/api/v1/identity/reputation/${connectAgentId.trim()}`)
      if (data.data) {
        setAgentIdentity(data.data)
        setShowConnectInput(false)
        setConnectAgentId('')
      }
    } catch {
      alert('Agent not found. Please check the Agent ID.')
    }
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const { data } = await axios.post('/api/v1/chat/message', {
        message: text,
        walletAddress: activeAddress,
        history,
      })
      const id = (Date.now() + 1).toString()
      setLatestId(id)
      const assistantMsg: Message = {
        id, role: 'assistant',
        content: data.data.response,
        toolCalls: data.data.toolCalls?.length ? data.data.toolCalls : undefined,
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'assistant' as const,
        content: `请求失败: ${msg}`, timestamp: Date.now(),
      }])
    } finally {
      setLoading(false)
    }
  }

  // Gate: no wallet connected
  if (!walletAddress) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 px-6">
        <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center">
          <Bot size={32} className="text-brand" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-lg font-bold text-text-0">TronClaw AI Agent</h2>
          <p className="text-sm text-text-3 max-w-xs">请先连接钱包，然后注册或连接你的 8004 Agent Identity，才能开始对话。</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-3">
          <span className="w-5 h-5 rounded-full bg-bg-3 flex items-center justify-center text-[10px] font-bold">1</span>
          连接钱包
          <span className="text-text-3/30">→</span>
          <span className="w-5 h-5 rounded-full bg-bg-3 flex items-center justify-center text-[10px] font-bold">2</span>
          注册 / 连接 Agent
          <span className="text-text-3/30">→</span>
          <span className="w-5 h-5 rounded-full bg-bg-3 flex items-center justify-center text-[10px] font-bold">3</span>
          开始对话
        </div>
      </div>
    )
  }

  // Gate: wallet connected but no agent identity
  if (!agentIdentity) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 px-6">
        <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center">
          <Shield size={32} className="text-brand" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-lg font-bold text-text-0">8004 Agent Identity Required</h2>
          <p className="text-sm text-text-3 max-w-sm">
            在开始对话前，请注册新 Agent 或连接已有的 Agent Identity（8004 Protocol）。
          </p>
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
            <span className="text-[10px] text-orange-400 font-medium">Bank of AI · 8004 Protocol</span>
          </div>
        </div>

        {!showConnectInput ? (
          <div className="flex gap-3 w-full max-w-sm">
            <button onClick={registerIdentity} disabled={registeringIdentity}
              className="btn-primary !text-sm !py-2.5 !px-5 disabled:opacity-50 flex-1 flex items-center justify-center gap-2">
              {registeringIdentity
                ? <><Loader2 size={14} className="animate-spin" />Registering...</>
                : <><span>📋</span>Register New Agent</>
              }
            </button>
            <button onClick={() => setShowConnectInput(true)}
              className="flex-1 text-sm py-2.5 px-5 rounded-xl border border-white/[0.08] text-text-2 hover:border-brand/30 hover:text-brand transition-all">
              🔗 Connect Existing
            </button>
          </div>
        ) : (
          <div className="space-y-3 w-full max-w-sm">
            <input value={connectAgentId} onChange={e => setConnectAgentId(e.target.value)}
              placeholder="Enter Agent ID (e.g. agent_xxxxxxxxxxxxxxxx)"
              className="w-full bg-bg-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-text-0 placeholder-text-3 outline-none focus:border-brand/40 font-mono"
            />
            <div className="flex gap-2">
              <button onClick={connectIdentity} className="btn-primary !text-sm !py-2.5 flex-1">
                Connect Agent
              </button>
              <button onClick={() => { setShowConnectInput(false); setConnectAgentId('') }}
                className="text-sm py-2.5 px-4 rounded-xl border border-white/[0.06] text-text-3 hover:text-text-0 transition-all">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-3.5 border-b border-white/[0.06] flex items-center gap-3 bg-bg-1/50 backdrop-blur-sm">
        <div className="w-8 h-8 rounded-xl bg-brand/10 flex items-center justify-center">
          <Bot size={16} className="text-brand" />
        </div>
        <div>
          <div className="font-semibold text-sm text-text-0">TronClaw AI</div>
          <div className="text-[10px] text-text-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Nile Testnet
            <span className="mx-1 text-text-3/30">|</span>
            <a href={`${TRONSCAN}/address/${activeAddress}`} target="_blank" className="hover:text-brand transition-colors flex items-center gap-0.5">
              {activeAddress.slice(0, 6)}...{activeAddress.slice(-4)} <ExternalLink size={8} />
            </a>
          </div>
        </div>
      </div>

      {/* 8004 Identity Connected Banner */}
      {walletAddress && agentIdentity && (
        <div className="mx-4 mt-3 rounded-xl border border-accent/20 bg-accent/5 p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
            <Shield size={14} className="text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-text-0">{agentIdentity.agentName}</span>
              <span className="badge badge-green !text-[9px]">8004 ✓</span>
              <span className="text-[10px] text-accent font-medium">Trust {agentIdentity.trustScore}</span>
            </div>
            <div className="text-[10px] text-text-3 font-mono truncate">{agentIdentity.agentId}</div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {agentIdentity.identityTxHash && !agentIdentity.identityTxHash.startsWith('8004_') && (
              <a href={`https://nile.tronscan.org/#/transaction/${agentIdentity.identityTxHash}`}
                target="_blank" title="View on TronScan"
                className="text-[9px] text-brand/70 hover:text-brand flex items-center gap-0.5 transition-colors">
                on-chain <ExternalLink size={9} />
              </a>
            )}
            <button onClick={() => setAgentIdentity(null)}
              className="text-[10px] text-text-3 hover:text-red-400 transition-colors px-1">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs
                ${msg.role === 'assistant' ? 'bg-brand/15 text-brand' : 'bg-blue-500/15 text-blue-400'}`}>
                {msg.role === 'assistant' ? <Bot size={13} /> : <User size={13} />}
              </div>
              <div className={`max-w-[75%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed
                  ${msg.role === 'assistant'
                    ? 'bg-bg-2 text-text-1 border border-white/[0.06]'
                    : 'bg-brand/15 text-text-0 border border-brand/20'
                  }`}>
                  {(() => {
                    if (msg.role !== 'assistant') return <span className="whitespace-pre-wrap">{msg.content}</span>
                    const { text, defiReport } = parseMessageContent(msg.content)
                    const displayText = text || msg.content
                    return (
                      <>
                        <div className="prose prose-invert prose-sm max-w-none
                          prose-p:my-1 prose-p:leading-relaxed
                          prose-headings:text-text-0 prose-headings:font-semibold prose-headings:my-2
                          prose-h2:text-sm prose-h3:text-xs
                          prose-strong:text-text-0 prose-strong:font-semibold
                          prose-ul:my-1 prose-ul:pl-4 prose-li:my-0.5
                          prose-code:text-brand prose-code:bg-bg-4 prose-code:px-1 prose-code:rounded prose-code:text-xs
                          prose-pre:bg-bg-4 prose-pre:border prose-pre:border-white/[0.06] prose-pre:rounded-xl prose-pre:text-xs
                          prose-a:text-brand prose-a:no-underline hover:prose-a:underline
                          prose-blockquote:border-brand/40 prose-blockquote:text-text-2">
                          {msg.id === latestId && !loading
                            ? <TypeWriter text={displayText} />
                            : <ReactMarkdown>{displayText}</ReactMarkdown>
                          }
                        </div>
                        {defiReport && <DeFiReportCard report={defiReport} />}
                      </>
                    )
                  })()}
                </div>
                <ToolCallCard toolCalls={msg.toolCalls} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-brand/15 flex items-center justify-center">
              <Bot size={13} className="text-brand" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-bg-2 border border-white/[0.06]">
              <div className="flex items-center gap-2 text-xs text-text-3">
                <Loader2 size={14} className="text-brand animate-spin" />
                {t("agentCalls")}...
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Examples */}
      {messages.length <= 1 && (
        <div className="px-4 pb-3">
          <div className="text-xs text-text-3 mb-2">Try these:</div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map(e => (
              <button key={e.text} onClick={() => sendMessage(e.text)}
                className="text-xs px-3 py-1.5 rounded-full bg-bg-2 border border-white/[0.06] text-text-2
                  hover:border-brand/30 hover:text-brand hover:bg-brand/5 transition-all duration-200">
                {e.cat} {e.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Clear Chat History Button */}
      {messages.length > 1 && (
        <div className="px-4 pb-2 flex justify-center">
          <button
            onClick={() => {
              if (confirm('确定要清除聊天历史吗？')) {
                setMessages([
                  {
                    id: '0', role: 'assistant',
                    content: '你好！我是 TronClaw AI Agent 🦀\n\n我可以帮你完成 TRON 链上操作：查余额、发送支付、DeFi 收益优化、鲸鱼追踪、自动交易...\n\n连接你的钱包或直接输入指令开始吧！',
                    timestamp: Date.now(),
                  },
                ])
                localStorage.removeItem('tronclaw_chat_messages')
              }
            }}
            className="text-xs px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 
              hover:border-red-500/40 hover:bg-red-500/15 transition-all duration-200">
            🗑️ Clear Chat History
          </button>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-1">
        <div className="flex gap-2 bg-bg-2 rounded-2xl border border-white/[0.06] p-2 focus-within:border-brand/30 transition-colors">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
            placeholder={t("askAnything")}
            rows={1}
            disabled={false}
            className="flex-1 bg-transparent text-sm text-text-0 placeholder-text-3 resize-none outline-none px-2 py-1.5 max-h-28"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 self-end transition-all duration-200
              disabled:bg-bg-4 disabled:text-text-3 bg-brand hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] text-white"
          >
            <Send size={15} />
          </button>
        </div>
        <p className="text-center text-[10px] text-text-3 mt-2">TronClaw · Nile Testnet · Gemini 3.1 Flash Lite</p>
      </div>
    </div>
  )
}
