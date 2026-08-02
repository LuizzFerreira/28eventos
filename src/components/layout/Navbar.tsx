import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Bell, ChevronDown, LogOut, LayoutDashboard, Settings } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { LoginModal } from '@/components/ui/LoginModal'
import { Button } from '@/components/ui/Button'

const navLinks = [
  { label: 'Início', href: '/' },
  { label: 'Serviços', href: '/servicos' },
  { label: 'Galeria', href: '/#galeria' },
  { label: 'Contato', href: '/#contato' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const { user, profile, signOut } = useAuth()
  const location = useLocation()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          scrolled ? 'glass border-b border-white/5 py-3' : 'py-5'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-black gold-text tracking-tight">28</span>
            <span className="text-white font-light text-lg tracking-widest">EVENTOS</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  location.pathname === link.href
                    ? 'text-[#c9a84c]'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 glass border border-white/10 rounded-xl px-3 py-2 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <img
                    src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.nome}&background=c9a84c&color=000`}
                    alt={profile?.nome || ''}
                    className="w-7 h-7 rounded-full"
                  />
                  <span className="text-sm text-white/80">{profile?.nome?.split(' ')[0]}</span>
                  <ChevronDown size={14} className="text-white/40" />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      className="absolute right-0 top-full mt-2 w-52 glass border border-white/10 rounded-xl overflow-hidden shadow-2xl"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Link
                        to="/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/10 transition-colors"
                      >
                        <LayoutDashboard size={15} /> Meu Painel
                      </Link>
                      <Link
                        to="/dashboard/notificacoes"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/10 transition-colors"
                      >
                        <Bell size={15} /> Notificações
                      </Link>
                      {profile?.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-[#c9a84c] hover:bg-white/10 transition-colors"
                        >
                          <Settings size={15} /> Admin
                        </Link>
                      )}
                      <button
                        onClick={() => { signOut(); setProfileOpen(false) }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <LogOut size={15} /> Sair
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => setLoginOpen(true)}>Entrar</Button>
                <Button size="sm" onClick={() => setLoginOpen(true)}>Organizar Evento</Button>
              </>
            )}
          </div>

          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="md:hidden glass-solid border-t border-white/10 mt-3"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="px-4 py-4 space-y-3">
                {navLinks.map(link => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block text-white/70 hover:text-white py-2 text-sm"
                  >
                    {link.label}
                  </Link>
                ))}
                {user ? (
                  <>
                    <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block text-white/70 hover:text-white py-2 text-sm">Meu Painel</Link>
                    <button onClick={() => { signOut(); setMobileOpen(false) }} className="text-red-400 text-sm py-2 cursor-pointer">Sair</button>
                  </>
                ) : (
                  <Button className="w-full" onClick={() => { setLoginOpen(true); setMobileOpen(false) }}>
                    Organizar Evento
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  )
}
