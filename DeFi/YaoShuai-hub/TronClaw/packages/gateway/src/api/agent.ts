import { Router, type RequestHandler } from 'express'
import path from 'path'
import { ok, err } from '@tronclaw/shared'

export const agentRouter: Router = Router()

// GET /api/v1/agent/connect-config
// Returns MCP config and OpenClaw skill config for connecting external agents
const configHandler: RequestHandler = (req, res) => {
  const gatewayUrl = process.env.GATEWAY_URL ?? `http://localhost:${process.env.PORT ?? 3000}`
  const network = process.env.TRON_NETWORK ?? 'nile'

  res.json(ok({
    mcp: {
      description: 'Add to Claude Desktop / Cursor mcp config',
      config: {
        mcpServers: {
          tronclaw: {
            command: 'node',
            args: [path.join(process.cwd(), 'dist', 'mcp-entry.js')],
            env: {
              TRONCLAW_GATEWAY: gatewayUrl,
              TRON_NETWORK: network,
              MOCK_TRON: process.env.MOCK_TRON ?? 'false',
            },
          },
        },
      },
      configPath: '~/.config/claude/claude_desktop_config.json',
    },
    openclaw: {
      description: 'Add to OpenClaw config.yaml skills section',
      skill: 'tronclaw',
      gatewayUrl,
      configSnippet: `skills:\n  tronclaw:\n    gateway_url: ${gatewayUrl}\n    network: ${network}`,
      skillsDir: '~/.openclaw/skills/tronclaw',
      installCmd: `clawhub install tronclaw || git clone https://github.com/YaoShuai-hub/TronClaw ~/.openclaw/skills/tronclaw`,
    },
    rest: {
      description: 'Direct REST API integration',
      baseUrl: `${gatewayUrl}/api/v1`,
      healthCheck: `${gatewayUrl}/health`,
      docs: 'https://github.com/YaoShuai-hub/TronClaw#api-reference',
    },
    status: {
      gateway: 'online',
      network,
      mock: process.env.MOCK_TRON === 'true',
      tools: 17,
    },
  }))
}

// POST /api/v1/agent/register — register an external agent connection
const registerHandler: RequestHandler = (req, res) => {
  try {
    const { agentName, agentType, version } = req.body as { agentName: string; agentType: string; version: string }
    console.log(`[Agent] Connected: ${agentName} (${agentType} v${version})`)
    res.json(ok({
      message: `Welcome ${agentName}! TronClaw gateway ready.`,
      agentId: `ext_${Date.now().toString(16)}`,
      tools: 17,
      network: process.env.TRON_NETWORK ?? 'nile',
    }))
  } catch (e) { res.status(500).json(err((e as Error).message)) }
}

agentRouter.get('/connect-config', configHandler)
agentRouter.post('/register', registerHandler)
