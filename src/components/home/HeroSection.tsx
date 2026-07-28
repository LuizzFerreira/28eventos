import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Play, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LoginModal } from '@/components/ui/LoginModal'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'

export function HeroSection() {
  const [loginOpen, setLoginOpen] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  const particles = useMemo(() =>
    Array.from({ length: 20 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 3,
    })), [])

  function handleCTA() {
    if (user) navigate('/dashboard/criar-evento')
    else setLoginOpen(true)
  }

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* BG Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#0a0a0a] z-10" />
          <img
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&q=80"
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
        </div>

        {/* Glow */}
        <div className="absolute inset-0 hero-gradient z-10 pointer-events-none" />

        {/* Particles */}
        {useMemo(() => (
          <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
            {particles.map((p, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-[#c9a84c]/40"
                style={{ left: `${p.left}%`, top: `${p.top}%` }}
                animate={{ y: [-20, 20, -20], opacity: [0.2, 0.8, 0.2] }}
                transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
              />
            ))}
          </div>
        ), [])}

        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 glass-gold rounded-full px-4 py-2 mb-8"
          >
            <Sparkles size={14} className="text-[#c9a84c]" />
            <span className="text-[#c9a84c] text-sm font-medium">Experiências Premium em Eventos</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl sm:text-7xl lg:text-7xl font-black text-white leading-none mb-6"
          >
            Tudo para o seu evento,{' '}
            <span className="gold-text block">em um só lugar.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-white/60 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Transformamos cada detalhe em uma experiência inesquecível. Do planejamento à execução, cuidamos de tudo com excelência.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" onClick={handleCTA} className="group">
              Quero organizar meu evento
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => document.getElementById('servicos')?.scrollIntoView({ behavior: 'smooth' })}>
              <Play size={16} /> Ver serviços
            </Button>
          </motion.div>



        </div>
      </section>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  )
}
