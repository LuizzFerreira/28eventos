import { useState } from 'react'
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Calendar, Plus, Bell, MessageSquare,
  Users, CheckSquare, Heart, LogOut, Menu, X, ChevronRight, Shield
} from 'lucide-react'

const ADMIN_EMAILS = ['luizgferreira13@gmail.com', 'isabelavsc06@gmail.com']
import { useAuth } from '@/context/AuthContext'

const navItems = [
  { icon: LayoutDashboard, label: 'Painel', href: '/dashboard' },
  { icon: Calendar, label: 'Meu Evento', href: '/dashboard/evento' },
  { icon: Plus, label: 'Criar Evento', href: '/dashboard/criar-evento' },
  { icon: MessageSquare, label: 'Mensagens', href: '/dashboard/mensagens' },
  { icon: Bell, label: 'Notificações', href: '/dashboard/notificacoes' },
  { icon: Users, label: 'Convidados', href: '/dashboard/convidados' },
  { icon: CheckSquare, label: 'Checklist', href: '/dashboard/checklist' },
  { icon: Heart, label: 'Favoritos', href: '/dashboard/favoritos' },
]

export function DashboardLayout() {
  const { user, profile, signOut, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const isAdmin = ADMIN_EMAILS.includes(user?.email ?? '')

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!user) return <Navigate to="/" replace />

  return (
    <div className="min-h-screen flex bg-[#0a0a0a]">
      {/* Sidebar */}
      <motion.aside
        className={`fixed inset-y-0 left-0 z-30 w-64 glass-solid border-r border-white/10 flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300`}
      >
        <div className="p-6 border-b border-white/5">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-black gold-text">28</span>
            <span className="text-white font-light tracking-widest text-sm">EVENTOS</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ icon: Icon, label, href }) => {
            const active = location.pathname === href
            return (
              <Link
                key={href}
                to={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  active
                    ? 'glass-gold text-[#c9a84c]'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={17} />
                {label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            )
          })}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#c9a84c]/70 hover:text-[#c9a84c] hover:bg-[#c9a84c]/5 transition-all duration-200"
            >
              <Shield size={17} />
              Painel Admin
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.nome}&background=c9a84c&color=000`}
              alt={profile?.nome || ''}
              className="w-9 h-9 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{profile?.nome}</p>
              <p className="text-xs text-white/40 truncate">{profile?.email}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut size={15} /> Sair
          </button>
        </div>
      </motion.aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="glass-solid border-b border-white/5 px-4 sm:px-6 py-4 flex items-center gap-4 lg:hidden">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <span className="text-white font-semibold">Painel</span>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
