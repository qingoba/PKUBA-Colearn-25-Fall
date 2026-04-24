import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, Shield, CheckCircle, ExternalLink } from 'lucide-react'
import axios from 'axios'

interface AgentIdentity {
  agentId: string; agentName: string; ownerAddress: string
  capabilities: string[]; trustScore: number
  totalTransactions: number; successRate: number; registeredAt: number
}

const TRONSCAN = 'https://nile.tronscan.org/#'

const DEMO_AGENTS: AgentIdentity[] = [
  { agentId: 'agent_tronclaw_demo', agentName: 'TronClaw Demo Agent', ownerAddress: 'TFp3Ls4mHdzysbX1qxbwXdMzS8mkvhCMx6', capabilities: ['payment', 'defi', 'data', 'automation'], trustScore: 100, totalTransactions: 42, successRate: 1.0, registeredAt: Date.now() - 86400000 },
  { agentId: 'agent_openclaw_writer', agentName: 'OpenClaw Writing Assistant', ownerAddress: 'TPL66VK2gCXNCD7EJg9pgJRfqcRazjhUZY', capabilities: ['payment', 'content'], trustScore: 95, totalTransactions: 128, successRate: 0.98, registeredAt: Date.now() - 172800000 },
  { agentId: 'agent_defi_optimizer', agentName: 'DeFi Yield Optimizer', ownerAddress: 'TGjgkFPfBhMkXdB2E8bBHRQLQ11Z4BBgKu', capabilities: ['defi', 'automation', 'data'], trustScore: 88, totalTransactions: 305, successRate: 0.96, registeredAt: Date.now() - 259200000 },
]

const CAP_STYLE: Record<string, string> = {
  payment: 'badge-orange', defi: 'badge-blue', data: 'badge-purple',
  automation: 'badge-green', content: 'badge-red',
}

function TrustBar({ score }: { score: number }) {
  const color = score >= 90 ? 'bg-accent' : score >= 70 ? 'bg-brand' : 'bg-red-400'
  return (
    <div className="w-full h-1.5 rounded-full bg-bg-4 overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className={`h-full rounded-full ${color}`} />
    </div>
  )
}

export default function Agents() {
  const [agents, setAgents] = useState<AgentIdentity[]>(DEMO_AGENTS)
  const [form, setForm] = useState({ name: '', address: '' })
  const [registering, setRegistering] = useState(false)

  const register = async () => {
    if (!form.name || !form.address) return
    setRegistering(true)
    try {
      const { data } = await axios.post('/api/v1/identity/register', {
        agentName: form.name, capabilities: ['payment', 'data'], ownerAddress: form.address,
      })
      setAgents(prev => [data.data, ...prev])
      setForm({ name: '', address: '' })
    } catch {} finally { setRegistering(false) }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-5 max-w-4xl mx-auto">
        <div className="animate-fade-in-up">
          <h1 className="text-xl font-bold text-text-0">Agent Marketplace</h1>
          <p className="text-sm text-text-3">AI Agents registered on TRON via 8004 Identity Protocol</p>
        </div>

        {/* Register */}
        <div className="glass-card p-5 animate-fade-in-up delay-1">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={14} className="text-accent" />
            <span className="text-sm font-semibold text-text-0">Register Agent Identity</span>
            <span className="badge badge-green !text-[9px]">8004</span>
          </div>
          <div className="flex gap-3">
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Agent name"
              className="flex-1 bg-bg-4 border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-text-0 placeholder-text-3 outline-none focus:border-brand/40 transition-colors" />
            <input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
              placeholder="Owner TRON address"
              className="flex-1 bg-bg-4 border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-text-0 placeholder-text-3 outline-none focus:border-brand/40 transition-colors font-mono text-xs" />
            <button onClick={register} disabled={registering || !form.name || !form.address}
              className="btn-primary !text-xs !py-2.5 !px-5 disabled:opacity-40">
              {registering ? 'Registering...' : 'Register'}
            </button>
          </div>
        </div>

        {/* Agent list */}
        <div className="space-y-3">
          {agents.map((agent, i) => (
            <motion.div key={agent.agentId}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card glow-border p-5">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                  <Bot size={20} className="text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-text-0">{agent.agentName}</span>
                    <CheckCircle size={13} className="text-accent" />
                  </div>
                  <a href={`${TRONSCAN}/address/${agent.ownerAddress}`} target="_blank"
                    className="text-[10px] text-text-3 font-mono hover:text-brand transition-colors flex items-center gap-0.5 mb-2">
                    {agent.agentId} <ExternalLink size={8} />
                  </a>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {agent.capabilities.map(cap => (
                      <span key={cap} className={`badge !text-[9px] !py-0 !px-2 ${CAP_STYLE[cap] ?? ''}`}>{cap}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1"><TrustBar score={agent.trustScore} /></div>
                    <span className="text-xs text-text-2 font-medium">{agent.trustScore}</span>
                  </div>
                </div>
                <div className="text-right text-xs text-text-3 flex-shrink-0 space-y-0.5">
                  <div>{agent.totalTransactions} txns</div>
                  <div>{(agent.successRate * 100).toFixed(0)}%</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
