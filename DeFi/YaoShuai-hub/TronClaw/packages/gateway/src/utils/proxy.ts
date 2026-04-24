/**
 * HTTP proxy support for Gemini API calls in restricted regions
 * Reads HTTPS_PROXY from env and patches global fetch if set
 */

let proxyPatched = false

export async function setupProxy(): Promise<void> {
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.https_proxy || process.env.http_proxy
  if (!proxyUrl || proxyPatched) return

  try {
    const https = await import('https')
    // Dynamic import with string variable to bypass TS module resolution
    const agentPkg = 'https-proxy-agent'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod = await import(/* @vite-ignore */ agentPkg).catch(() => null) as any
    if (mod) {
      const Cls = mod.HttpsProxyAgent ?? mod.default?.HttpsProxyAgent
      if (Cls) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(https as any).globalAgent = new Cls(proxyUrl)
        proxyPatched = true
        console.log(`[Proxy] https-proxy-agent set → ${proxyUrl}`)
        return
      }
    }
    console.warn('[Proxy] https-proxy-agent not found. Set HTTPS_PROXY but no agent library available.')
    console.warn('[Proxy] Install with: pnpm --filter @tronclaw/gateway add https-proxy-agent')
  } catch (e) {
    console.warn('[Proxy] Failed to set proxy:', (e as Error).message)
  }
}
