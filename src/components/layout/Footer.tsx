import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin } from 'lucide-react'
import { FaWhatsapp, FaInstagram, FaYoutube } from 'react-icons/fa'

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#080808]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl font-black gold-text">28</span>
              <span className="text-white font-light text-xl tracking-widest">EVENTOS</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Transformamos momentos em experiências inesquecíveis. Cada evento é único, cada detalhe importa.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a href="#" className="w-10 h-10 glass rounded-xl flex items-center justify-center text-white/60 hover:text-[#c9a84c] hover:border-[#c9a84c]/30 transition-all">
                <FaInstagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 glass rounded-xl flex items-center justify-center text-white/60 hover:text-[#c9a84c] transition-all">
                <FaYoutube size={18} />
              </a>
              <a href="#" className="w-10 h-10 glass rounded-xl flex items-center justify-center text-white/60 hover:text-[#c9a84c] transition-all">
                <FaWhatsapp size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Links</h4>
            <ul className="space-y-2">
              {[
                { label: 'Início', href: '/' },
                { label: 'Serviços', href: '/servicos' },
                { label: 'Galeria', href: '/#galeria' },
                { label: 'Contato', href: '/#contato' },
              ].map(l => (
                <li key={l.href}>
                  <Link to={l.href} className="text-white/50 hover:text-[#c9a84c] text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-white/50 text-sm">
                <Phone size={14} className="text-[#c9a84c]" /> (21) 99557-5988
              </li>
              <li className="flex items-center gap-2 text-white/50 text-sm">
                <Mail size={14} className="text-[#c9a84c]" /> luizgferreira13@gmail.com
              </li>
              <li className="flex items-center gap-2 text-white/50 text-sm">
                <MapPin size={14} className="text-[#c9a84c]" /> Rio de Janeiro, RJ
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">© 2025 28 Eventos. Todos os direitos reservados.</p>
          <p className="text-white/20 text-xs">Feito com ❤️ para momentos inesquecíveis</p>
        </div>
      </div>
    </footer>
  )
}
