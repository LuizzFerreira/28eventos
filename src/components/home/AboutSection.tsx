import { motion } from 'framer-motion'
import imagemEvento from '@/assets/imagem-evento.png'

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
            A 28 Eventos nasceu da paixão por criar momentos inesquecíveis. Com mais de 10 anos de experiência, somos referência em eventos premium no Brasil.
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

        <div>
          <motion.img
            src={imagemEvento}
            alt="Evento 28"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full rounded-2xl object-cover"
          />
        </div>
      </div>
    </section>
  )
}
