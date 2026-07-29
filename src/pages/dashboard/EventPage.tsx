import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { eventService } from '@/services/event.service'
import { checklistService } from '@/services/extra.service'
import { Badge, statusBadge, Skeleton } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate, eventTypeLabels } from '@/utils/cn'
import { Link } from 'react-router-dom'
import { Plus, Check, Trash2, Calendar, MapPin, Users, Clock, XCircle, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/Input'
import { ServicePreferenceForm } from '@/components/ui/ServicePreferenceForm'

const DEV_BYPASS = import.meta.env.VITE_DEV_BYPASS_AUTH === 'true'

export default function EventPage() {
  const { profile } = useAuth()
  const queryClient = useQueryClient()
  const [newTask, setNewTask] = useState('')

  const { data: events, isLoading } = useQuery({
    queryKey: ['my-events', profile?.id],
    queryFn: () => eventService.getMyEvents(profile!.id),
    enabled: !!profile?.id && !DEV_BYPASS,
  })

  const event = events?.[0]

  const { data: checklist } = useQuery({
    queryKey: ['checklist', event?.id],
    queryFn: () => checklistService.getChecklist(event!.id),
    enabled: !!event?.id,
  })

  const addTask = useMutation({
    mutationFn: () => checklistService.addItem({
      evento_id: event!.id,
      titulo: newTask,
      concluido: false,
      ordem: (checklist?.length || 0) + 1,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist'] })
      setNewTask('')
    },
  })

  const toggleTask = useMutation({
    mutationFn: ({ id, concluido }: { id: string; concluido: boolean }) =>
      checklistService.toggleItem(id, concluido),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['checklist'] }),
  })

  const removeTask = useMutation({
    mutationFn: (id: string) => checklistService.removeItem(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['checklist'] }),
  })

  const cancelEvent = useMutation({
    mutationFn: () => eventService.updateStatus(event!.id, 'cancelado'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-events'] })
      toast.success('Evento cancelado.')
    },
  })

  if (isLoading) return <Skeleton className="h-96 w-full" />

  if (!event) return (
    <div className="text-center py-20">
      <p className="text-white/50 mb-4">Nenhum evento encontrado.</p>
      <Link to="/dashboard/criar-evento"><Button>Criar evento</Button></Link>
    </div>
  )

  const done = checklist?.filter(c => c.concluido).length || 0
  const total = checklist?.length || 0
  const progress = total > 0 ? (done / total) * 100 : 0

  return (
    <div className="space-y-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <span className="text-[#c9a84c] text-xs font-semibold uppercase tracking-widest">
              {eventTypeLabels[event.tipo_evento]}
            </span>
            <h1 className="text-3xl font-black text-white mt-1">{event.nome_evento}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={statusBadge[event.status].variant}>{statusBadge[event.status].label}</Badge>
            {event.status !== 'cancelado' && event.status !== 'finalizado' && (
              <button
                onClick={() => { if (confirm('Tem certeza que deseja cancelar este evento?')) cancelEvent.mutate() }}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 glass px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <XCircle size={13} /> Cancelar evento
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Info cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Calendar, label: 'Data', value: event.data ? formatDate(event.data) : '—' },
          { icon: Clock, label: 'Horário', value: event.horario_inicio ? `${event.horario_inicio} - ${event.horario_fim}` : '—' },
          { icon: Users, label: 'Pessoas', value: `${event.quantidade_pessoas}` },
          { icon: MapPin, label: 'Local', value: `${event.cidade}, ${event.estado}` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="glass rounded-xl p-4">
            <Icon size={16} className="text-[#c9a84c] mb-2" />
            <p className="text-white/40 text-xs">{label}</p>
            <p className="text-white font-medium text-sm mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Financial */}
      <div className="glass-gold rounded-2xl p-6">
        <h2 className="text-white font-bold mb-4">Resumo Financeiro</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/50 text-sm">Valor estimado</p>
            <p className="text-4xl font-black gold-text">{formatCurrency(event.valor_total)}</p>
          </div>
          <div className="text-right">
            <p className="text-white/50 text-sm">{event.itens?.length || 0} serviços</p>
            <Link to="/servicos">
              <Button variant="outline" size="sm" className="mt-2"><Plus size={14} /> Adicionar</Button>
            </Link>
          </div>
        </div>

        {event.itens && event.itens.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
            {event.itens.map(item => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-white/70">{item.produto?.nome}</span>
                <div className="flex items-center gap-4">
                  <span className="text-white/40">x{item.quantidade}</span>
                  <span className="text-[#c9a84c] font-medium">{formatCurrency(item.subtotal)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Personalize seus serviços */}
      {event.itens && event.itens.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={18} className="text-[#c9a84c]" />
            <h2 className="text-white font-bold">Personalize seus serviços</h2>
          </div>
          <p className="text-white/40 text-sm mb-5">Preencha as preferências de cada serviço para que tudo saia perfeito.</p>
          <div className="space-y-3">
            {event.itens.map(item => (
              <ServicePreferenceForm key={item.id} item={item} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Checklist */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold">Checklist do Evento</h2>
          <span className="text-white/50 text-sm">{done}/{total} concluídos</span>
        </div>

        {total > 0 && (
          <div className="w-full bg-white/10 rounded-full h-2 mb-4">
            <motion.div
              className="gold-gradient h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        )}

        <div className="space-y-2 mb-4">
          {checklist?.map(item => (
            <motion.div
              key={item.id}
              layout
              className="flex items-center gap-3 p-3 glass rounded-xl"
            >
              <button
                onClick={() => toggleTask.mutate({ id: item.id, concluido: !item.concluido })}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                  item.concluido ? 'bg-green-500 border-green-500' : 'border-white/30 hover:border-[#c9a84c]'
                }`}
              >
                {item.concluido && <Check size={10} className="text-white" />}
              </button>
              <span className={`flex-1 text-sm ${item.concluido ? 'line-through text-white/30' : 'text-white/80'}`}>
                {item.titulo}
              </span>
              <button
                onClick={() => removeTask.mutate(item.id)}
                className="text-white/20 hover:text-red-400 transition-colors cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Nova tarefa..."
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && newTask && addTask.mutate()}
          />
          <Button
            size="sm"
            onClick={() => newTask && addTask.mutate()}
            loading={addTask.isPending}
          >
            <Plus size={14} />
          </Button>
        </div>
      </div>
    </div>
  )
}
