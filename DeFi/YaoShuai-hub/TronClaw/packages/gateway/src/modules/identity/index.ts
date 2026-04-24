/**
 * Identity Module — Bank of AI 8004 On-chain Identity Protocol
 * Registers AI Agent identity with on-chain proof via TRON transaction memo
 */
import { v4 as uuidv4 } from 'uuid'
import { getDb } from '../../db/index.js'
import { isMockMode } from '../../tron/client.js'
import type { AgentIdentity } from '@tronclaw/shared'

export async function registerAgentIdentity(
  agentName: string,
  capabilities: string[],
  ownerAddress: string,
): Promise<AgentIdentity> {
  const agentId = `agent_${uuidv4().replace(/-/g, '').slice(0, 16)}`
  const now = Date.now()

  // 8004 On-chain Identity: create proof tx on TRON
  // Send 0 TRX self-transfer with 8004 identity memo to create verifiable on-chain record
  let identityTxHash = `8004_${agentId}`
  if (!isMockMode()) {
    try {
      const { getTronWeb } = await import('../../tron/client.js')
      const tronWeb = getTronWeb()
      const memo = JSON.stringify({
        protocol: '8004',
        agentId,
        agentName,
        capabilities,
        ownerAddress,
        registeredAt: now,
      })
      // Build TRX transfer to TronClaw Identity Registry with 8004 memo as on-chain proof
      // Registry address: TVF2Mp9QY7FEGTnr3DBpFLobA6jguHyMvi (Nile testnet identity registry)
      const IDENTITY_REGISTRY = 'TVF2Mp9QY7FEGTnr3DBpFLobA6jguHyMvi'
      const tx = await tronWeb.transactionBuilder.sendTrx(
        IDENTITY_REGISTRY,
        1, // 1 SUN = negligible amount, just to create on-chain record
        ownerAddress,
      )
      // Add memo to transaction
      const txWithMemo = await tronWeb.transactionBuilder.addUpdateData(tx, memo, 'utf8')
      const signedTx = await tronWeb.trx.sign(txWithMemo)
      const result = await tronWeb.trx.sendRawTransaction(signedTx)
      if (result.txid) {
        identityTxHash = result.txid
        console.log(`[8004] Agent identity registered on-chain: ${identityTxHash}`)
      }
    } catch (e) {
      console.warn('[8004] On-chain registration failed, using local identity:', (e as Error).message)
      identityTxHash = `8004_local_${agentId}`
    }
  }

  const identity: AgentIdentity = {
    agentId,
    agentName,
    ownerAddress,
    capabilities,
    trustScore: 100,
    totalTransactions: 0,
    successRate: 1.0,
    registeredAt: now,
    identityTxHash,
  }

  const db = getDb()
  db.prepare(`
    INSERT OR REPLACE INTO agent_identities
    (agent_id, agent_name, owner_address, capabilities, trust_score, total_transactions, success_rate, registered_at, identity_tx_hash)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    agentId, agentName, ownerAddress,
    JSON.stringify(capabilities),
    100, 0, 1.0, now,
    identityTxHash,
  )

  return identity
}

export async function getAgentReputation(agentId: string): Promise<AgentIdentity | null> {
  const db = getDb()
  const row = db.prepare('SELECT * FROM agent_identities WHERE agent_id = ?').get(agentId) as
    Record<string, unknown> | undefined

  if (!row) return null

  return {
    agentId: row.agent_id as string,
    agentName: row.agent_name as string,
    ownerAddress: row.owner_address as string,
    capabilities: JSON.parse(row.capabilities as string),
    trustScore: row.trust_score as number,
    totalTransactions: row.total_transactions as number,
    successRate: row.success_rate as number,
    registeredAt: row.registered_at as number,
    identityTxHash: row.identity_tx_hash as string,
  }
}

export async function verifyAgent(agentId: string): Promise<{ verified: boolean; identity: AgentIdentity | null }> {
  const identity = await getAgentReputation(agentId)
  return {
    verified: identity !== null && identity.trustScore >= 50,
    identity,
  }
}
