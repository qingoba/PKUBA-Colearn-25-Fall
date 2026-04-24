import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.tsx'
import Landing from './pages/Landing.tsx'
import Overview from './pages/Overview.tsx'
import Market from './pages/Market.tsx'
import DeFi from './pages/DeFi.tsx'
import Data from './pages/Data.tsx'
import Auto from './pages/Auto.tsx'
import Chat from './pages/Chat.tsx'
import { initWallet } from './stores/wallet.ts'

export default function App() {
  useEffect(() => {
    const timer = setTimeout(initWallet, 800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<Layout />}>
        <Route path="/overview" element={<Overview />} />
        <Route path="/market" element={<Market />} />
        <Route path="/defi" element={<DeFi />} />
        <Route path="/data" element={<Data />} />
        <Route path="/auto" element={<Auto />} />
        <Route path="/chat" element={<Chat />} />
      </Route>
    </Routes>
  )
}
