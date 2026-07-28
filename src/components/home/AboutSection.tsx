import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Trophy, Heart, Clock, Star } from 'lucide-react'

function CountUp({ end, duration = 2.5 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = end / (duration * 60)
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [end, duration])
  return <>{count}</>
}

const stats = [
  { icon: Trophy, value: 500, suffix: '+', label: 'Eventos Realizados', color: 'text-yellow-400' },
  { icon: Heart, value: 98, suffix: '%', label: 'Clientes Satisfeitos', color: 'text-red-400' },
  { icon: Clock, value: 10, suffix: '+', label: 'Anos de Experiência', color: 'text-blue-400' },
  { icon: Star, value: 50, suffix: '+', label: 'Parceiros Premium', color: 'text-purple-400' },
]

const differentials = [
  {
    title: 'Experiência Completa',
    desc: 'Não vendemos apenas serviços. Criamos experiências únicas e memoráveis do início ao fim.',
  },
  {
    title: 'Equipe Especializada',
    desc: 'Profissionais altamente qualificados e apaixonados pelo que fazem.',
  },
  {
    title: 'Tecnologia de Ponta',
    desc: 'Equipamentos modernos e soluções inovadoras para seu evento.',
  },
  {
    title: 'Suporte Total',
    desc: 'Acompanhamento completo antes, durante e após o evento.',
  },
]

export function AboutSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="sobre" className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-[#c9a84c] text-sm font-semibold tracking-widest uppercase">Quem Somos</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-3 mb-6 leading-tight">
            Mais que um evento,<br />
            <span className="gold-text">uma experiência.</span>
          </h2>
          <p className="text-white/60 leading-relaxed mb-6">
            A LG Eventos nasceu da paixão por criar momentos inesquecíveis. Com mais de 10 anos de experiência, somos referência em eventos premium no Brasil.
          </p>
          <p className="text-white/60 leading-relaxed mb-8">
            Nossa missão é transformar cada celebração em uma obra de arte, cuidando de cada detalhe com dedicação e excelência.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {differentials.map((d, i) => (
              <motion.div
                key={d.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl p-4"
              >
                <h4 className="text-white font-semibold text-sm mb-1">{d.title}</h4>
                <p className="text-white/50 text-xs leading-relaxed">{d.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div ref={ref}>
          <div className="grid grid-cols-2 gap-4">
            {stats.map(({ icon: Icon, value, suffix, label, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, type: 'spring' }}
                className="glass rounded-2xl p-6 text-center card-hover"
              >
                <Icon size={28} className={`${color} mx-auto mb-3`} />
                <div className="text-4xl font-black text-white">
                  {inView && <CountUp end={value} duration={2.5} />}{suffix}
                </div>
                <div className="text-white/50 text-sm mt-1">{label}</div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-4 glass-gold rounded-2xl p-6"
          >
            <p className="text-[#c9a84c] font-semibold mb-1">Nossa Promessa</p>
            <p className="text-white/70 text-sm leading-relaxed">
              "Cada evento é único. Cada detalhe importa. Cada momento é eterno."
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
