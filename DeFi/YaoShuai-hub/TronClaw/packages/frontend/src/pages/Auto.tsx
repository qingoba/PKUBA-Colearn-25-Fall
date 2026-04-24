import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Plus, Trash2, Clock, Activity, Pause, Play, ChevronDown, ChevronUp } from 'lucide-react'
import axios from 'axios'
import { useLang } from '../stores/lang.ts'
import { SkeletonCard, SkeletonList } from '../components/Skeleton.tsx'

interface Task {
  taskId: string; type: string; status: string
  conditions: Record<string, unknown>; triggerCount: number; createdAt: number
}
interface Stats { active: number; paused: number; completed: number; cancelled: number; totalTriggers: number }

const STATUS_STYLE: Record<string, string> = {
  active: 'badge-green', paused: 'badge-orange', triggered: 'badge-blue',
  completed: 'badge-purple', cancelled: 'badge-red',
}
const TYPE_EMOJI: Record<string, string> = {
  auto_swap: '💱', price_alert: '🔔', scheduled_transfer: '📅', whale_alert: '🐋',
}

type TaskType = 'auto_swap' | 'scheduled_transfer' | 'whale_alert'

export default function Auto() {
  const { t } = useLang()
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [taskType, setTaskType] = useState<TaskType>('auto_swap')
  const [result, setResult] = useState<string | null>(null)
  const [form, setForm] = useState({
    tokenPair: 'TRX/USDT', triggerPrice: '0.08', action: 'buy', amount: '500',
    to: '', transferAmount: '10', transferToken: 'USDT', schedule: 'daily',
    whaleMin: '100000', whaleToken: 'USDT',
  })

  const loadAll = async () => {
    try {
      const [tasksRes, statsRes] = await Promise.all([
        axios.get('/api/v1/automation/tasks'),
        axios.get('/api/v1/automation/stats'),
      ])
      setTasks(tasksRes.data.data); setStats(statsRes.data.data)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { loadAll() }, [])

  const createTask = async () => {
    setCreating(true); setResult(null)
    try {
      if (taskType === 'auto_swap') {
        await axios.post('/api/v1/automation/trade', { tokenPair: form.tokenPair, triggerPrice: form.triggerPrice, action: form.action, amount: form.amount })
      } else if (taskType === 'scheduled_transfer') {
        await axios.post('/api/v1/automation/schedule', { to: form.to, amount: form.transferAmount, token: form.transferToken, schedule: form.schedule })
      } else if (taskType === 'whale_alert') {
        await axios.post('/api/v1/automation/whale-follow', { minAmount: form.whaleMin, token: form.whaleToken, followAction: 'alert' })
      }
      setResult('✅ Task created and active!')
      setShowCreate(false)
      await loadAll()
    } catch (e) { setResult(`❌ ${(e as Error).message}`) }
    finally { setCreating(false) }
  }

  const toggleTask = async (task: Task) => {
    try {
      if (task.status === 'active') { await axios.patch(`/api/v1/automation/tasks/${task.taskId}/pause`) }
      else if (task.status === 'paused') { await axios.patch(`/api/v1/automation/tasks/${task.taskId}/resume`) }
      await loadAll()
    } catch {}
  }

  const cancelTask = async (taskId: string) => {
    try { await axios.delete(`/api/v1/automation/tasks/${taskId}`); await loadAll() } catch {}
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-5 max-w-5xl mx-auto">
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-2 mb-1"><span className="text-2xl">⚡</span><h1 className="text-2xl font-bold text-text-0">{t('autoHarvestTitle')}</h1></div>
          <p className="text-sm text-text-3">{t('autoHarvestDesc')}</p>
        </div>

        {/* Stats */}
        {!stats ? <div className="grid grid-cols-4 gap-4"><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></div> : (
          <div className="grid grid-cols-4 gap-4 animate-fade-in-up delay-1">
            {[
              { label: t('active'), value: String(stats.active), color: 'text-accent' },
              { label: t('paused'), value: String(stats.paused), color: 'text-brand' },
              { label: t('completedLabel'), value: String(stats.completed), color: 'text-purple-400' },
              { label: t('triggers'), value: String(stats.totalTriggers), color: 'text-blue-400' },
            ].map(s => (
              <div key={s.label} className="glass-card p-4">
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-[10px] text-text-3">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Create Task */}
        <div>
          <button onClick={() => setShowCreate(v => !v)} className="btn-primary !text-sm gap-2 mb-3">
            <Plus size={15} />Create Task {showCreate ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <AnimatePresence>
            {showCreate && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="glass-card p-5 mb-3 overflow-hidden">
                {/* Type selector */}
                <div className="flex gap-2 mb-4">
                  {([['auto_swap', '💱 Auto Trade'], ['scheduled_transfer', '📅 Schedule'], ['whale_alert', '🐋 Whale Alert']] as const).map(([t, label]) => (
                    <button key={t} onClick={() => setTaskType(t as TaskType)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${taskType === t ? 'border-brand/40 bg-brand/10 text-brand' : 'border-white/[0.06] text-text-3 hover:text-text-0'}`}>
                      {label}
                    </button>
                  ))}
                </div>

                {/* Auto Swap form */}
                {taskType === 'auto_swap' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-[10px] text-text-3 block mb-1">Token Pair</label>
                      <select value={form.tokenPair} onChange={e => setForm(f => ({ ...f, tokenPair: e.target.value }))}
                        className="w-full bg-bg-4 border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-text-0 outline-none">
                        <option>TRX/USDT</option><option>USDD/USDT</option>
                      </select></div>
                    <div><label className="text-[10px] text-text-3 block mb-1">Action</label>
                      <select value={form.action} onChange={e => setForm(f => ({ ...f, action: e.target.value }))}
                        className="w-full bg-bg-4 border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-text-0 outline-none">
                        <option value="buy">Buy when price ≤ trigger</option><option value="sell">Sell when price ≥ trigger</option>
                      </select></div>
                    <div><label className="text-[10px] text-text-3 block mb-1">Trigger Price</label>
                      <input value={form.triggerPrice} onChange={e => setForm(f => ({ ...f, triggerPrice: e.target.value }))}
                        className="w-full bg-bg-4 border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-text-0 outline-none focus:border-brand/40" /></div>
                    <div><label className="text-[10px] text-text-3 block mb-1">Amount</label>
                      <input value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                        className="w-full bg-bg-4 border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-text-0 outline-none focus:border-brand/40" /></div>
                  </div>
                )}

                {/* Scheduled Transfer form */}
                {taskType === 'scheduled_transfer' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2"><label className="text-[10px] text-text-3 block mb-1">Recipient Address</label>
                      <input value={form.to} onChange={e => setForm(f => ({ ...f, to: e.target.value }))} placeholder="T..."
                        className="w-full bg-bg-4 border border-white/[0.06] rounded-xl px-3 py-2 text-sm font-mono text-text-0 outline-none focus:border-brand/40" /></div>
                    <div><label className="text-[10px] text-text-3 block mb-1">Amount</label>
                      <input value={form.transferAmount} onChange={e => setForm(f => ({ ...f, transferAmount: e.target.value }))}
                        className="w-full bg-bg-4 border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-text-0 outline-none focus:border-brand/40" /></div>
                    <div><label className="text-[10px] text-text-3 block mb-1">Schedule</label>
                      <select value={form.schedule} onChange={e => setForm(f => ({ ...f, schedule: e.target.value }))}
                        className="w-full bg-bg-4 border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-text-0 outline-none">
                        <option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option>
                      </select></div>
                  </div>
                )}

                {/* Whale Alert form */}
                {taskType === 'whale_alert' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-[10px] text-text-3 block mb-1">Min Amount</label>
                      <input value={form.whaleMin} onChange={e => setForm(f => ({ ...f, whaleMin: e.target.value }))}
                        className="w-full bg-bg-4 border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-text-0 outline-none focus:border-brand/40" /></div>
                    <div><label className="text-[10px] text-text-3 block mb-1">Token</label>
                      <select value={form.whaleToken} onChange={e => setForm(f => ({ ...f, whaleToken: e.target.value }))}
                        className="w-full bg-bg-4 border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-text-0 outline-none">
                        <option>USDT</option><option>USDD</option><option>TRX</option>
                      </select></div>
                  </div>
                )}

                <button onClick={createTask} disabled={creating} className="btn-primary !text-xs mt-3 disabled:opacity-50">
                  {creating ? 'Creating...' : 'Activate Task'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          {result && <div className={`text-xs mb-3 ${result.startsWith('✅') ? 'text-accent' : 'text-red-400'}`}>{result}</div>}
        </div>

        {/* Task list */}
        <div>
          <h3 className="text-sm font-semibold text-text-0 mb-3">{t('taskQueue')} ({tasks.length})</h3>
          <div className="space-y-2">
            {loading ? (
              <SkeletonList rows={4} />
            ) : tasks.length === 0 ? (
              <div className="glass-card p-8 text-center"><Zap size={32} className="mx-auto mb-2 text-text-3 opacity-20" /><p className="text-sm text-text-3">{t('noCallsYet')}</p></div>
            ) : tasks.map((task, i) => (
              <motion.div key={task.taskId} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="glass-card p-4 flex items-center gap-4">
                <span className="text-xl flex-shrink-0">{TYPE_EMOJI[task.type] ?? '🔧'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm text-text-0 capitalize">{task.type.replace(/_/g, ' ')}</span>
                    <span className={`badge !text-[9px] ${STATUS_STYLE[task.status] ?? ''}`}>{task.status}</span>
                  </div>
                  <div className="text-[10px] text-text-3">
                    {String(task.conditions.tokenPair
                      ? `${task.conditions.tokenPair} @ $${task.conditions.triggerPrice} → ${task.conditions.action}`
                      : task.conditions.schedule
                        ? `${task.conditions.schedule} transfer`
                        : `Whale alert: ${task.conditions.minAmount}+ ${task.conditions.token}`
                    )}
                  </div>
                </div>
                <div className="text-right text-[10px] text-text-3 flex-shrink-0">
                  <div>Triggers: {task.triggerCount}</div>
                  <div>{new Date(task.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="flex gap-1">
                  {(task.status === 'active' || task.status === 'paused') && (
                    <button onClick={() => toggleTask(task)} className="p-1.5 rounded-lg text-text-3 hover:bg-bg-4 hover:text-text-0 transition-colors" title={task.status === 'active' ? 'Pause' : 'Resume'}>
                      {task.status === 'active' ? <Pause size={13} /> : <Play size={13} />}
                    </button>
                  )}
                  {task.status !== 'cancelled' && task.status !== 'completed' && (
                    <button onClick={() => cancelTask(task.taskId)} className="p-1.5 rounded-lg text-text-3 hover:bg-red-400/10 hover:text-red-400 transition-colors" title="Cancel">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
