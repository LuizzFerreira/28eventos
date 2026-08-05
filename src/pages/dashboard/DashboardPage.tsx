import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { eventService } from '@/services/event.service'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Badge, statusBadge, Skeleton } from '@/components/ui/Badge'
import { formatCurrency, formatDate, eventTypeLabels } from '@/utils/cn'
import { Plus, Calendar, Clock, ArrowRight, Check, XCircle } from 'lucide-react'
import imagemEvento from '@/assets/imagem-evento.png'

const DEV_BYPASS = import.meta.env.VITE_DEV_BYPASS_AUTH === 'true'

export default function DashboardPage() {
  const { profile } = useAuth()

  const { data: events, isLoading } = useQuery({
    queryKey: ['my-events', profile?.id],
    queryFn: () => eventService.getMyEvents(profile!.id),
    enabled: !!profile?.id && !DEV_BYPASS,
  })

  const latestEvent = events?.[0]

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black text-white">
          Olá, <span className="gold-text">{profile?.nome?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-white/50 mt-1">Bem-vindo ao seu painel de eventos.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <img src={imagemEvento} alt="Eventos" className="w-full rounded-2xl object-cover max-h-64" />
      </motion.div>

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
              {(latestEvent.status === 'confirmado' || latestEvent.status === 'finalizado') ? (
                <>
                  <div className="text-2xl font-black gold-text mt-2">{formatCurrency(latestEvent.valor_total)}</div>
                  <div className="text-white/40 text-xs">Valor do pacote</div>
                </>
              ) : (
                <div className="text-white/30 text-xs mt-2">Valor após confirmação</div>
              )}
            </div>
          </div>

          {latestEvent.status === 'orcamento' && (
            <div className="mt-4 flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3">
              <Clock size={16} className="text-blue-400 flex-shrink-0" />
              <p className="text-blue-300 text-sm">Seu orçamento foi enviado! Nossa equipe entrará em contato em até 24h para confirmar.</p>
            </div>
          )}

          {latestEvent.status === 'confirmado' && (
            <div className="mt-4 flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
              <Check size={16} className="text-green-400 flex-shrink-0" />
              <p className="text-green-300 text-sm font-medium">Seu evento foi confirmado! Em breve entraremos em contato com os próximos passos.</p>
            </div>
          )}

          {latestEvent.status === 'cancelado' && (
            <div className="mt-4 flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <XCircle size={16} className="text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm font-medium">Este evento foi cancelado. Entre em contato conosco para mais informações.</p>
            </div>
          )}

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

          <div className="flex flex-wrap gap-3 mt-6">
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
                    {(event.status === 'confirmado' || event.status === 'finalizado') && (
                      <span className="text-[#c9a84c] font-semibold text-sm">{formatCurrency(event.valor_total)}</span>
                    )}
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
