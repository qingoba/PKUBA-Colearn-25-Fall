#!/usr/bin/env node
/**
 * MCP stdio entry point — for Claude Desktop / OpenClaw integration
 * Usage: node dist/mcp-entry.js
 */
import 'dotenv/config'
import { startMcpStdio } from './mcp/server.js'

startMcpStdio().catch(console.error)
