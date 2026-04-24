import { Router, type RequestHandler } from 'express'
import { z } from 'zod'
import { registerAgentIdentity, getAgentReputation, verifyAgent } from '../modules/identity/index.js'
import { ok, err } from '@tronclaw/shared'

export const identityRouter: Router = Router()

const registerHandler: RequestHandler = async (req, res) => {
  try {
    const schema = z.object({
      agentName: z.string().min(1).max(100),
      capabilities: z.array(z.string()),
      ownerAddress: z.string().min(1),
    })
    const { agentName, capabilities, ownerAddress } = schema.parse(req.body)
    const result = await registerAgentIdentity(agentName, capabilities, ownerAddress)
    res.json(ok(result))
  } catch (e) {
    res.status(500).json(err((e as Error).message))
  }
}

const reputationHandler: RequestHandler = async (req, res) => {
  try {
    const { agentId } = req.params
    const result = await getAgentReputation(agentId)
    if (!result) {
      res.status(404).json(err('Agent not found'))
      return
    }
    res.json(ok(result))
  } catch (e) {
    res.status(500).json(err((e as Error).message))
  }
}

const verifyHandler: RequestHandler = async (req, res) => {
  try {
    const { agentId } = req.params
    const result = await verifyAgent(agentId)
    res.json(ok(result))
  } catch (e) {
    res.status(500).json(err((e as Error).message))
  }
}

identityRouter.post('/register', registerHandler)
identityRouter.get('/reputation/:agentId', reputationHandler)
identityRouter.get('/verify/:agentId', verifyHandler)
