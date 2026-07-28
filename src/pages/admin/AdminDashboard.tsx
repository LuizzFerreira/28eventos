import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { eventService } from '@/services/event.service'
import { profileService } from '@/services/profile.service'
import { formatCurrency } from '@/utils/cn'
import { Skeleton } from '@/components/ui/Badge'
import { Calendar, Users, DollarSign, CheckCircle, TrendingUp } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function AdminDashboard() {
  const { data: events, isLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: eventService.getAllEvents,
  })

  const { data: profiles } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: profileService.getAllProfiles,
  })

  const totalRevenue = events?.reduce((acc: number, e: { valor_total?: number }) => acc + (e.valor_total || 0), 0) || 0
  const confirmed = events?.filter((e: { status: string }) => e.status === 'confirmado').length || 0
  const thisMonth = events?.filter((e: { data?: string }) => {
    if (!e.data) return false
    const d = new Date(e.data)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length || 0

  const monthlyData = [...Array(6)].map((_, i) => {
    const date = subMonths(new Date(), 5 - i)
    const start = startOfMonth(date)
    const end = endOfMonth(date)
    const monthEvents = events?.filter((e: { created_at?: string; valor_total?: number }) => {
      if (!e.created_at) return false
      const d = new Date(e.created_at)
      return d >= start && d <= end
    }) || []
    return {
      mes: format(date, 'MMM', { locale: ptBR }),
      eventos: monthEvents.length,
      receita: monthEvents.reduce((acc: number, e: { valor_total?: number }) => acc + (e.valor_total || 0), 0),
    }
  })

  const stats = [
    { icon: Calendar, label: 'Eventos este mês', value: thisMonth, color: 'text-blue-400' },
    { icon: DollarSign, label: 'Receita estimada', value: formatCurrency(totalRevenue), color: 'text-green-400' },
    { icon: Users, label: 'Clientes', value: profiles?.filter(p => p.role === 'cliente').length || 0, color: 'text-purple-400' },
    { icon: CheckCircle, label: 'Confirmados', value: confirmed, color: 'text-[#c9a84c]' },
  ]

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black text-white">Dashboard</h1>
        <p className="text-white/50 mt-1">Visão geral do sistema.</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-5"
          >
            <Icon size={20} className={color} />
            <div className="text-2xl font-black text-white mt-3">
              {isLoading ? <Skeleton className="h-7 w-20" /> : value}
            </div>
            <div className="text-white/50 text-sm mt-1">{label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <h3 className="text-white font-bold mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-[#c9a84c]" /> Eventos por mês
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="mes" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                labelStyle={{ color: '#fff' }}
                itemStyle={{ color: '#c9a84c' }}
              />
              <Bar dataKey="eventos" fill="#c9a84c" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="text-white font-bold mb-6 flex items-center gap-2">
            <DollarSign size={18} className="text-[#c9a84c]" /> Receita mensal
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="mes" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                labelStyle={{ color: '#fff' }}
                formatter={(value: number) => [formatCurrency(value), 'Receita']}
              />
              <Line type="monotone" dataKey="receita" stroke="#c9a84c" strokeWidth={2} dot={{ fill: '#c9a84c', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4">Eventos recentes</h3>
        <div className="space-y-3">
          {isLoading
            ? [...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
            : events?.slice(0, 8).map((event: { id: string; nome_evento: string; profiles?: { nome?: string }; cidade?: string; valor_total: number; status: string }) => (
              <div key={event.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-white text-sm font-medium">{event.nome_evento}</p>
                  <p className="text-white/40 text-xs">{event.profiles?.nome} • {event.cidade}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#c9a84c] font-semibold text-sm">{formatCurrency(event.valor_total)}</p>
                  <p className="text-white/40 text-xs">{event.status}</p>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
