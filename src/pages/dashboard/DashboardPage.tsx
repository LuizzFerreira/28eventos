import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { eventService } from '@/services/event.service'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Badge, statusBadge, Skeleton } from '@/components/ui/Badge'
import { formatCurrency, formatDate, eventTypeLabels } from '@/utils/cn'
import { Plus, Calendar, DollarSign, Users, Clock, ArrowRight } from 'lucide-react'

export default function DashboardPage() {
  const { profile } = useAuth()

  const { data: events, isLoading } = useQuery({
    queryKey: ['my-events', profile?.id],
    queryFn: () => eventService.getMyEvents(profile!.id),
    enabled: !!profile?.id,
  })

  const latestEvent = events?.[0]
  const totalValue = events?.reduce((acc, e) => acc + (e.valor_total || 0), 0) || 0
  const confirmed = events?.filter(e => e.status === 'confirmado').length || 0

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black text-white">
          Olá, <span className="gold-text">{profile?.nome?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-white/50 mt-1">Bem-vindo ao seu painel de eventos.</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Calendar, label: 'Eventos', value: events?.length || 0, color: 'text-blue-400' },
          { icon: DollarSign, label: 'Valor Total', value: formatCurrency(totalValue), color: 'text-green-400' },
          { icon: Users, label: 'Confirmados', value: confirmed, color: 'text-[#c9a84c]' },
          { icon: Clock, label: 'Em Análise', value: events?.filter(e => e.status === 'em_analise').length || 0, color: 'text-purple-400' },
        ].map(({ icon: Icon, label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-5"
          >
            <Icon size={20} className={color} />
            <div className="text-2xl font-black text-white mt-3">
              {isLoading ? <Skeleton className="h-7 w-16" /> : value}
            </div>
            <div className="text-white/50 text-sm mt-1">{label}</div>
          </motion.div>
        ))}
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : latestEvent ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-gold rounded-2xl p-6"
        >
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <span className="text-[#c9a84c] text-xs font-semibold uppercase tracking-widest">Seu Evento</span>
              <h2 className="text-2xl font-black text-white mt-1">{latestEvent.nome_evento}</h2>
              <p className="text-white/60 text-sm mt-1">
                {eventTypeLabels[latestEvent.tipo_evento]} • {latestEvent.data ? formatDate(latestEvent.data) : 'Data não definida'}
              </p>
              <p className="text-white/50 text-sm">{latestEvent.cidade}, {latestEvent.estado} • {latestEvent.quantidade_pessoas} pessoas</p>
            </div>
            <div className="text-right">
              <Badge variant={statusBadge[latestEvent.status].variant}>{statusBadge[latestEvent.status].label}</Badge>
              <div className="text-2xl font-black gold-text mt-2">{formatCurrency(latestEvent.valor_total)}</div>
              <div className="text-white/40 text-xs">Valor estimado</div>
            </div>
          </div>

          {latestEvent.itens && latestEvent.itens.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-white/60 text-sm mb-3">{latestEvent.itens.length} serviço(s) selecionado(s)</p>
              <div className="flex flex-wrap gap-2">
                {latestEvent.itens.slice(0, 5).map(item => (
                  <span key={item.id} className="glass px-3 py-1 rounded-full text-xs text-white/70">
                    {item.produto?.nome}
                  </span>
                ))}
                {latestEvent.itens.length > 5 && (
                  <span className="glass px-3 py-1 rounded-full text-xs text-[#c9a84c]">
                    +{latestEvent.itens.length - 5} mais
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Link to="/dashboard/evento">
              <Button size="sm">Ver detalhes <ArrowRight size={14} /></Button>
            </Link>
            <Link to="/servicos">
              <Button variant="outline" size="sm"><Plus size={14} /> Adicionar serviços</Button>
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-12 text-center"
        >
          <Calendar size={48} className="text-white/20 mx-auto mb-4" />
          <h3 className="text-white font-semibold text-lg mb-2">Nenhum evento criado</h3>
          <p className="text-white/50 text-sm mb-6">Comece agora a planejar o evento dos seus sonhos!</p>
          <Link to="/dashboard/criar-evento">
            <Button><Plus size={16} /> Criar meu evento</Button>
          </Link>
        </motion.div>
      )}

      {events && events.length > 1 && (
        <div>
          <h3 className="text-white font-semibold mb-4">Todos os eventos</h3>
          <div className="space-y-3">
            {events.slice(1).map(event => (
              <Link key={event.id} to="/dashboard/evento">
                <motion.div
                  whileHover={{ x: 4 }}
                  className="glass rounded-xl p-4 flex items-center justify-between hover:border-[#c9a84c]/20 transition-all"
                >
                  <div>
                    <p className="text-white font-medium text-sm">{event.nome_evento}</p>
                    <p className="text-white/50 text-xs">{eventTypeLabels[event.tipo_evento]} • {event.data ? formatDate(event.data) : '—'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusBadge[event.status].variant}>{statusBadge[event.status].label}</Badge>
                    <span className="text-[#c9a84c] font-semibold text-sm">{formatCurrency(event.valor_total)}</span>
                    <ArrowRight size={14} className="text-white/30" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
