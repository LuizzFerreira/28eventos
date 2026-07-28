import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'Como funciona o processo de contratação?',
    a: 'É simples! Crie sua conta, monte seu evento escolhendo os serviços desejados, e solicite um orçamento. Nossa equipe entrará em contato em até 24h.',
  },
  {
    q: 'Vocês atendem em todo o Brasil?',
    a: 'Atendemos principalmente São Paulo e região, mas para eventos especiais podemos atender em todo o território nacional. Entre em contato para verificar disponibilidade.',
  },
  {
    q: 'Qual o prazo mínimo para contratar?',
    a: 'Recomendamos pelo menos 30 dias de antecedência para garantir disponibilidade de todos os serviços. Para eventos maiores, 90 dias é o ideal.',
  },
  {
    q: 'Como funciona o pagamento?',
    a: 'Trabalhamos com entrada de 30% na confirmação e o restante até 7 dias antes do evento. Aceitamos PIX, transferência e cartão de crédito.',
  },
  {
    q: 'Posso alterar os serviços após a contratação?',
    a: 'Sim! Você pode adicionar ou remover serviços até 15 dias antes do evento, sujeito à disponibilidade e ajuste de valores.',
  },
  {
    q: 'Vocês fornecem contrato?',
    a: 'Sim, todos os nossos serviços são formalizados com contrato digital, garantindo segurança para ambas as partes.',
  },
]

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="py-24 px-4 sm:px-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <span className="text-[#c9a84c] text-sm font-semibold tracking-widest uppercase">FAQ</span>
        <h2 className="text-4xl sm:text-5xl font-black text-white mt-3">
          Perguntas <span className="gold-text">frequentes</span>
        </h2>
      </motion.div>

      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="glass rounded-2xl overflow-hidden"
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer"
            >
              <span className="text-white font-medium text-sm">{faq.q}</span>
              <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={18} className="text-[#c9a84c] flex-shrink-0 ml-4" />
              </motion.div>
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="px-6 pb-4 text-white/60 text-sm leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export function ContactSection() {
  return (
    <section id="contato" className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="glass-gold rounded-3xl p-8 sm:p-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10"
        >
          <span className="text-[#c9a84c] text-sm font-semibold tracking-widest uppercase">Vamos conversar</span>
          <h2 className="text-4xl sm:text-6xl font-black text-white mt-3 mb-6">
            Pronto para criar<br />
            <span className="gold-text">algo incrível?</span>
          </h2>
          <p className="text-white/60 max-w-xl mx-auto mb-10">
            Entre em contato conosco e vamos planejar juntos o evento dos seus sonhos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/5511999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 gold-gradient text-black font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-opacity"
            >
              Falar no WhatsApp
            </a>
            <a
              href="mailto:contato@lgeventos.com.br"
              className="inline-flex items-center gap-2 border border-[#c9a84c] text-[#c9a84c] font-semibold px-8 py-4 rounded-xl hover:bg-[#c9a84c]/10 transition-colors"
            >
              Enviar e-mail
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
