import Database from 'better-sqlite3'
import path from 'path'

let db: Database.Database

export function initDb(): void {
  const dbPath = process.env.DATABASE_PATH ?? './data.db'
  db = new Database(path.resolve(dbPath))
  db.pragma('journal_mode = WAL')

  // Payment requests table
  db.exec(`
    CREATE TABLE IF NOT EXISTS payment_requests (
      pay_id TEXT PRIMARY KEY,
      amount TEXT NOT NULL,
      token TEXT NOT NULL,
      description TEXT,
      recipient_address TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      tx_hash TEXT,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    )
  `)

  // Automation tasks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS automation_tasks (
      task_id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      conditions TEXT NOT NULL,
      actions TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      triggered_at INTEGER,
      trigger_count INTEGER DEFAULT 0
    )
  `)

  // Agent identities table
  db.exec(`
    CREATE TABLE IF NOT EXISTS agent_identities (
      agent_id TEXT PRIMARY KEY,
      agent_name TEXT NOT NULL,
      owner_address TEXT NOT NULL,
      capabilities TEXT NOT NULL,
      trust_score REAL DEFAULT 100,
      total_transactions INTEGER DEFAULT 0,
      success_rate REAL DEFAULT 1.0,
      registered_at INTEGER NOT NULL,
      identity_tx_hash TEXT
    )
  `)

  // Transaction log table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tx_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tx_hash TEXT,
      type TEXT,
      from_address TEXT,
      to_address TEXT,
      amount TEXT,
      token TEXT,
      status TEXT,
      timestamp INTEGER NOT NULL
    )
  `)

  // Market services table
  db.exec(`
    CREATE TABLE IF NOT EXISTS market_services (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      agent_name TEXT NOT NULL,
      agent_id TEXT NOT NULL,
      price TEXT NOT NULL,
      token TEXT NOT NULL,
      category TEXT DEFAULT 'General',
      rating REAL DEFAULT 5.0,
      total_calls INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      created_at INTEGER NOT NULL
    )
  `)

  // Market invocations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS market_invocations (
      id TEXT PRIMARY KEY,
      service_id TEXT NOT NULL,
      caller_address TEXT,
      tx_hash TEXT,
      amount TEXT NOT NULL,
      token TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      result TEXT,
      created_at INTEGER NOT NULL
    )
  `)

  // Seed demo services if empty
  const count = (db.prepare('SELECT COUNT(*) as c FROM market_services').get() as { c: number }).c
  if (count === 0) {
    const seedServices = [
      { id: 'svc_001', name: 'AI Writing Assistant', description: 'Generate articles, blog posts, marketing copy with AI. Auto-charged per request.', agent_name: 'TronClaw Writer', agent_id: 'agent_writer_01', price: '0.10', token: 'USDT', category: 'Content' },
      { id: 'svc_002', name: 'TRX Trading Signal', description: 'AI-analyzed trading signals for TRX/USDT pair. Real-time market insights.', agent_name: 'TronClaw Analyst', agent_id: 'agent_analyst_01', price: '0.50', token: 'USDT', category: 'Trading' },
      { id: 'svc_003', name: 'Smart Contract Audit', description: 'Automated security analysis of TRON smart contracts. Find vulnerabilities fast.', agent_name: 'TronClaw Auditor', agent_id: 'agent_auditor_01', price: '1.00', token: 'USDT', category: 'Security' },
      { id: 'svc_004', name: 'CN↔EN Translation', description: 'High-quality Chinese-English bidirectional translation for crypto content.', agent_name: 'TronClaw Translator', agent_id: 'agent_translator_01', price: '0.05', token: 'USDT', category: 'Content' },
      { id: 'svc_005', name: 'Whale Alert Summary', description: 'Daily summary of whale movements on TRON. Know what big players are doing.', agent_name: 'ChainEye Bot', agent_id: 'agent_chaineye_01', price: '0.20', token: 'USDT', category: 'Data' },
      { id: 'svc_006', name: 'DeFi Yield Report', description: 'Weekly AI-generated DeFi yield optimization report for your portfolio.', agent_name: 'TronSage Bot', agent_id: 'agent_sage_01', price: '0.30', token: 'USDT', category: 'DeFi' },
    ]
    const insertSvc = db.prepare('INSERT INTO market_services (id, name, description, agent_name, agent_id, price, token, category, rating, total_calls, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    const seedCalls = [1247, 856, 312, 2103, 678, 445]
    const ratings = [4.8, 4.5, 4.9, 4.7, 4.6, 4.4]
    for (let i = 0; i < seedServices.length; i++) {
      const s = seedServices[i]
      insertSvc.run(s.id, s.name, s.description, s.agent_name, s.agent_id, s.price, s.token, s.category, ratings[i], seedCalls[i], Date.now() - i * 86400000)
    }
  }

  console.log('[DB] SQLite initialized at', dbPath)
}

export function getDb(): Database.Database {
  if (!db) throw new Error('Database not initialized — call initDb() first')
  return db
}
