import { useState } from 'react'
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

  function handleCTA() {
    if (user) navigate('/dashboard/criar-evento')
    else setLoginOpen(true)
  }

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video BG */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#0a0a0a] z-10" />
          <video
            autoPlay muted loop playsInline
            className="w-full h-full object-cover opacity-40"
            poster="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&q=80"
          >
            <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Glow */}
        <div className="absolute inset-0 hero-gradient z-10 pointer-events-none" />

        {/* Particles */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-[#c9a84c]/40"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{ y: [-20, 20, -20], opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }}
            />
          ))}
        </div>

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
            className="text-5xl sm:text-7xl lg:text-8xl font-black text-white leading-none mb-6"
          >
            Seu evento,{' '}
            <span className="gold-text block">nossa arte.</span>
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

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-wrap items-center justify-center gap-8 mt-16"
          >
            {[
              { value: '500+', label: 'Eventos realizados' },
              { value: '98%', label: 'Satisfação' },
              { value: '10+', label: 'Anos de experiência' },
              { value: '50+', label: 'Parceiros' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-black gold-text">{stat.value}</div>
                <div className="text-white/40 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-1">
            <div className="w-1 h-3 bg-[#c9a84c] rounded-full" />
          </div>
        </motion.div>
      </section>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  )
}
