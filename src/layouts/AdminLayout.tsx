import { useState } from 'react'
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Users, Calendar, Package, Tag,
  Image, BarChart2, LogOut, Menu, X, ChevronRight, MessageSquare
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const adminNav = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Calendar, label: 'Eventos', href: '/admin/eventos' },
  { icon: Users, label: 'Clientes', href: '/admin/clientes' },
  { icon: Package, label: 'Produtos', href: '/admin/produtos' },
  { icon: Tag, label: 'Categorias', href: '/admin/categorias' },
  { icon: Image, label: 'Imagens', href: '/admin/imagens' },
  { icon: MessageSquare, label: 'Mensagens', href: '/admin/mensagens' },
  { icon: BarChart2, label: 'Financeiro', href: '/admin/financeiro' },
]

export function AdminLayout() {
  const { user, profile, signOut, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!user || profile?.role !== 'admin') return <Navigate to="/" replace />

  return (
    <div className="min-h-screen flex bg-[#0a0a0a]">
      <motion.aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#111] border-r border-white/5 flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300`}
      >
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black gold-text">LG</span>
            <span className="text-white font-light tracking-widest text-sm">ADMIN</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {adminNav.map(({ icon: Icon, label, href }) => {
            const active = location.pathname === href
            return (
              <Link
                key={href}
                to={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active ? 'glass-gold text-[#c9a84c]' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={17} />
                {label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut size={15} /> Sair
          </button>
        </div>
      </motion.aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="bg-[#111] border-b border-white/5 px-4 sm:px-6 py-4 flex items-center gap-4 lg:hidden">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <span className="text-white font-semibold">Admin</span>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
