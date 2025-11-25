import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, BarChart3, PieChart } from 'lucide-react'
import Dashboard from '@/components/Dashboard'

function App() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('connected')) {
      setIsConnected(true);
      // Clean URL
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  const handleConnect = () => {
    window.location.href = 'http://localhost:3000/auth/google';
  };

  if (isConnected) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Dashboard />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-md w-full"
      >
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
          <div className="p-10 text-center">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-6xl mb-6"
            >
              📅✨
            </motion.div>

            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
              Calendar Vibes
            </h1>

            <p className="text-slate-300 mb-8 text-sm">
              Unlock AI-powered insights from your calendar. Discover patterns you never knew existed.
            </p>

            <button
              onClick={handleConnect}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-blue-500/30"
            >
              🚀 Connect with Google
            </button>

            <p className="text-slate-500 text-xs mt-6">
              Your data stays private. We only read your calendar to generate insights.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default App
