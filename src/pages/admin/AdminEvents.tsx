import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventService } from '@/services/event.service'
import { Skeleton } from '@/components/ui/Badge'
import { formatCurrency, formatDate, eventTypeLabels } from '@/utils/cn'
import { Search, Eye } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Input'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import type { Event, EventStatus } from '@/types'

const statusOptions: { value: EventStatus | ''; label: string }[] = [
  { value: '', label: 'Todos os status' },
  { value: 'em_criacao', label: 'Em Criação' },
  { value: 'orcamento', label: 'Orçamento' },
  { value: 'em_analise', label: 'Em Análise' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'finalizado', label: 'Finalizado' },
]

export default function AdminEvents() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<EventStatus | ''>('')
  const queryClient = useQueryClient()

  const { data: events, isLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: eventService.getAllEvents,
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: EventStatus }) =>
      eventService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] })
      toast.success('Status atualizado!')
    },
  })

  const filtered = events?.filter((e: Event & { profiles?: { nome?: string } }) => {
    const matchSearch = !search ||
      e.nome_evento.toLowerCase().includes(search.toLowerCase()) ||
      e.profiles?.nome?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || e.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black text-white">Eventos</h1>
        <p className="text-white/50 mt-1">{events?.length || 0} eventos no total</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input placeholder="Buscar evento ou cliente..." value={search} onChange={e => setSearch(e.target.value)} icon={<Search size={16} />} />
        </div>
        <div className="sm:w-52">
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value as EventStatus | '')}>
            {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Evento', 'Cliente', 'Data', 'Pessoas', 'Valor', 'Status', 'Ações'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? [...Array(6)].map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-4 py-3"><Skeleton className="h-8 w-full" /></td></tr>
                ))
                : filtered?.map((event: Event & { profiles?: { nome?: string } }) => (
                  <motion.tr
                    key={event.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="text-white font-medium text-sm">{event.nome_evento}</p>
                      <p className="text-white/40 text-xs">{eventTypeLabels[event.tipo_evento]}</p>
                    </td>
                    <td className="px-4 py-3 text-white/70 text-sm">{event.profiles?.nome || '—'}</td>
                    <td className="px-4 py-3 text-white/70 text-sm">{event.data ? formatDate(event.data) : '—'}</td>
                    <td className="px-4 py-3 text-white/70 text-sm">{event.quantidade_pessoas}</td>
                    <td className="px-4 py-3 text-[#c9a84c] font-semibold text-sm">{formatCurrency(event.valor_total)}</td>
                    <td className="px-4 py-3">
                      <Select
                        value={event.status}
                        onChange={e => updateStatus.mutate({ id: event.id, status: e.target.value as EventStatus })}
                        className="text-xs py-1.5 px-2"
                      >
                        {statusOptions.slice(1).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/admin/eventos/${event.id}`}>
                        <button className="text-white/40 hover:text-white transition-colors cursor-pointer">
                          <Eye size={16} />
                        </button>
                      </Link>
                    </td>
                  </motion.tr>
                ))
              }
            </tbody>
          </table>
        </div>
        {!isLoading && filtered?.length === 0 && (
          <div className="text-center py-12 text-white/40">Nenhum evento encontrado.</div>
        )}
      </div>
    </div>
  )
}
