import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventService } from '@/services/event.service'
import { Skeleton } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/utils/cn'
import { Check, X, ChevronDown, ChevronUp, Calendar, MapPin, Users, Clock, Search, Trash2, Pencil } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { toast } from 'sonner'
import { AdminPreferenceView } from '@/components/admin/AdminPreferenceView'
import { ConfirmModal } from '@/components/ui/CancelConfirmModal'
import type { Event, EventStatus } from '@/types'

type AdminEvent = Event & { profiles?: { nome?: string; email?: string; avatar_url?: string } }

const statusLabel: Record<EventStatus, { label: string; color: string }> = {
  em_criacao: { label: 'Em Criação', color: 'text-white/40 bg-white/10' },
  orcamento:  { label: 'Aguardando', color: 'text-blue-400 bg-blue-500/20' },
  em_analise: { label: 'Em Análise', color: 'text-purple-400 bg-purple-500/20' },
  confirmado: { label: 'Confirmado', color: 'text-green-400 bg-green-500/20' },
  finalizado: { label: 'Finalizado', color: 'text-[#c9a84c] bg-[#c9a84c]/20' },
  cancelado:  { label: 'Cancelado', color: 'text-red-400 bg-red-500/20' },
}

const DEV_BYPASS = import.meta.env.VITE_DEV_BYPASS_AUTH === 'true'

export default function AdminEvents() {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [cancelTarget, setCancelTarget] = useState<AdminEvent | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminEvent | null>(null)
  const [selectedItems, setSelectedItems] = useState<Record<string, Set<string>>>({})
  const [editingPrice, setEditingPrice] = useState<Record<string, string>>({})
  const [savingPrice, setSavingPrice] = useState<string | null>(null)
  const [editingPago, setEditingPago] = useState<Record<string, string>>({})
  const [savingPago, setSavingPago] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: events, isLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: eventService.getAllEvents,
    enabled: !DEV_BYPASS,
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: EventStatus }) =>
      eventService.updateStatus(id, status),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] })
      setCancelTarget(null)
      toast.success(status === 'cancelado' ? 'Evento cancelado.' : 'Evento rejeitado.')
    },
  })

  const confirmEvent = useMutation({
    mutationFn: ({ id, itemIds }: { id: string; itemIds: string[] }) =>
      eventService.confirmEvent(id, itemIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] })
      toast.success('Evento confirmado!')
    },
  })

  function getSelected(event: AdminEvent): Set<string> {
    return selectedItems[event.id] ?? new Set((event.itens ?? []).map(i => i.id))
  }

  async function savePrice(itemId: string, quantidade: number) {
    const raw = editingPrice[itemId]
    const valor = parseFloat(raw?.replace(',', '.'))
    if (isNaN(valor) || valor < 0) return
    setSavingPrice(itemId)
    try {
      await eventService.updateItemPrice(itemId, valor, quantidade)
      queryClient.invalidateQueries({ queryKey: ['admin-events'] })
      toast.success('Valor atualizado!')
      setEditingPrice(prev => { const n = { ...prev }; delete n[itemId]; return n })
    } catch {
      toast.error('Erro ao salvar valor.')
    } finally {
      setSavingPrice(null)
    }
  }

  async function savePago(eventId: string, valor: string) {
    const num = parseFloat(valor.replace(',', '.'))
    if (isNaN(num) || num < 0) return
    setSavingPago(eventId)
    try {
      await eventService.updateValorPago(eventId, num)
      queryClient.invalidateQueries({ queryKey: ['admin-events'] })
      toast.success('Valor pago atualizado!')
      setEditingPago(prev => { const n = { ...prev }; delete n[eventId]; return n })
    } catch {
      toast.error('Erro ao salvar.')
    } finally {
      setSavingPago(null)
    }
  }

  function toggleItem(eventId: string, itemId: string, allIds: string[]) {
    setSelectedItems(prev => {
      const current = prev[eventId] ?? new Set(allIds)
      const next = new Set(current)
      next.has(itemId) ? next.delete(itemId) : next.add(itemId)
      return { ...prev, [eventId]: next }
    })
  }

  const deleteEvent = useMutation({
    mutationFn: (id: string) => eventService.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] })
      setDeleteTarget(null)
      toast.success('Evento apagado permanentemente.')
    },
  })

  const filtered = (events as AdminEvent[] | undefined)?.filter(e => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      e.nome_evento.toLowerCase().includes(q) ||
      e.profiles?.nome?.toLowerCase().includes(q) ||
      e.profiles?.email?.toLowerCase().includes(q)
    )
  })

  const pending = filtered?.filter(e => e.status === 'orcamento' || e.status === 'em_analise') ?? []
  const others  = filtered?.filter(e => e.status !== 'orcamento' && e.status !== 'em_analise') ?? []

  function toggle(id: string) {
    setExpanded(prev => prev === id ? null : id)
  }

  function EventCard({ event }: { event: AdminEvent }) {
    const open = expanded === event.id
    const s = statusLabel[event.status]

    return (
      <motion.div
        layout
        className={`glass rounded-2xl overflow-hidden transition-all ${event.status === 'orcamento' ? 'border border-blue-500/20' : ''}`}
      >
        {/* Header */}
        <button
          onClick={() => toggle(event.id)}
          className="w-full flex items-center gap-4 p-5 text-left cursor-pointer hover:bg-white/3 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
              <span className="text-white/30 text-xs">{event.data ? formatDate(event.data) : '—'}</span>
            </div>
            <p className="text-white font-bold mt-1 truncate">{event.nome_evento}</p>
            <p className="text-white/50 text-sm">{event.profiles?.nome} · {event.profiles?.email}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[#c9a84c] font-bold">{formatCurrency(event.valor_total)}</p>
            <p className="text-white/30 text-xs">{(event as Event & { evento_itens?: unknown[] }).evento_itens?.length ?? 0} serviços</p>
          </div>
          {open ? <ChevronUp size={16} className="text-white/40 flex-shrink-0" /> : <ChevronDown size={16} className="text-white/40 flex-shrink-0" />}
        </button>

        {/* Details */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 space-y-5 border-t border-white/5 pt-4">
                {/* Info grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: Calendar, label: 'Data', value: event.data ? formatDate(event.data) : '—' },
                    { icon: Clock, label: 'Horário', value: event.horario_inicio ? `${event.horario_inicio} - ${event.horario_fim}` : '—' },
                    { icon: Users, label: 'Pessoas', value: String(event.quantidade_pessoas) },
                    { icon: MapPin, label: 'Local', value: `${event.cidade}, ${event.estado}` },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="bg-white/5 rounded-xl p-3">
                      <Icon size={13} className="text-[#c9a84c] mb-1" />
                      <p className="text-white/40 text-xs">{label}</p>
                      <p className="text-white text-sm font-medium">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Address */}
                <div className="bg-white/5 rounded-xl p-3 text-sm text-white/70">
                  <span className="text-white/40 text-xs block mb-1">Endereço completo</span>
                  {event.endereco}, {event.numero}{event.complemento ? ` - ${event.complemento}` : ''} · {event.bairro} · CEP {event.cep}
                </div>

                {/* Aniversariante */}
                {event.possui_aniversariante && (
                  <div className="bg-white/5 rounded-xl p-3 text-sm">
                    <span className="text-white/40 text-xs block mb-1">Aniversariante</span>
                    <span className="text-white">{event.nome_aniversariante}</span>
                    <span className="text-white/50"> · {event.idade_aniversariante} anos · {event.sexo_aniversariante}</span>
                  </div>
                )}

                {/* Observações */}
                {event.observacoes && (
                  <div className="bg-white/5 rounded-xl p-3 text-sm">
                    <span className="text-white/40 text-xs block mb-1">Observações</span>
                    <span className="text-white/80">{event.observacoes}</span>
                  </div>
                )}

                {/* Pagamento */}
                {(event.status === 'confirmado' || event.status === 'finalizado') && (
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-white/40 text-xs mb-3">Controle de pagamento</p>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-white/50 text-xs">Total do evento</p>
                        <p className="text-white font-bold">{formatCurrency(event.valor_total)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/50 text-xs">50% (entrada)</p>
                        <p className="text-[#c9a84c] font-bold">{formatCurrency(event.valor_total / 2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/50 text-sm flex-shrink-0">Valor pago: R$</span>
                      {editingPago[event.id] !== undefined ? (
                        <div className="flex items-center gap-1 flex-1">
                          <input
                            autoFocus
                            className="flex-1 bg-white/10 border border-[#c9a84c]/50 rounded-lg px-2 py-1 text-[#c9a84c] text-sm font-medium outline-none focus:border-[#c9a84c]"
                            value={editingPago[event.id]}
                            onChange={e => setEditingPago(prev => ({ ...prev, [event.id]: e.target.value }))}
                            onKeyDown={e => {
                              if (e.key === 'Enter') savePago(event.id, editingPago[event.id])
                              if (e.key === 'Escape') setEditingPago(prev => { const n = { ...prev }; delete n[event.id]; return n })
                            }}
                          />
                          <button onClick={() => savePago(event.id, editingPago[event.id])} disabled={savingPago === event.id} className="text-green-400 hover:text-green-300 cursor-pointer disabled:opacity-50"><Check size={15} /></button>
                          <button onClick={() => setEditingPago(prev => { const n = { ...prev }; delete n[event.id]; return n })} className="text-white/30 hover:text-white/60 cursor-pointer"><X size={15} /></button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingPago(prev => ({ ...prev, [event.id]: String(event.valor_pago ?? 0) }))}
                          className="flex items-center gap-1.5 text-[#c9a84c] font-bold hover:underline cursor-pointer"
                        >
                          {formatCurrency(event.valor_pago ?? 0)} <Pencil size={12} className="text-white/30" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Serviços */}
                {event.itens && event.itens.length > 0 && (
                  <div>
                    <p className="text-white/40 text-xs mb-2">
                      {(event.status === 'orcamento' || event.status === 'em_analise')
                        ? 'Selecione os serviços que serão entregues'
                        : 'Serviços solicitados'}
                    </p>
                    <div className="space-y-2">
                      {event.itens.map(item => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const pref = (item as any).preferencias as Record<string, unknown> | null
                        const catNome = item.produto?.categoria?.nome ?? ''
                        const isPending = event.status === 'orcamento' || event.status === 'em_analise'
                        const allIds = (event.itens ?? []).map(i => i.id)
                        const checked = isPending ? getSelected(event).has(item.id) : (item.confirmado !== false)
                        return (
                          <div key={item.id} className={`rounded-xl px-3 py-2 transition-all ${
                            isPending
                              ? checked ? 'bg-white/5' : 'bg-white/2 opacity-50'
                              : item.confirmado === false ? 'bg-red-500/5 border border-red-500/10' : 'bg-white/5'
                          }`}>
                            <div className="flex items-center justify-between text-sm gap-3">
                              {isPending && (
                                <button
                                  onClick={() => toggleItem(event.id, item.id, allIds)}
                                  className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all cursor-pointer ${
                                    checked ? 'bg-green-500 border-green-500' : 'border-white/20 hover:border-white/40'
                                  }`}
                                >
                                  {checked && <Check size={11} className="text-white" />}
                                </button>
                              )}
                              <span className={`flex-1 ${
                                isPending && !checked ? 'line-through text-white/30' : 'text-white/80'
                              }`}>{item.produto?.nome}</span>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {!isPending && item.confirmado === false && (
                                  <span className="text-red-400 text-xs">Não incluído</span>
                                )}
                                <span className="text-white/40">x{item.quantidade}</span>
                                {editingPrice[item.id] !== undefined ? (
                                  <div className="flex items-center gap-1">
                                    <span className="text-white/40 text-xs">R$</span>
                                    <input
                                      autoFocus
                                      className="w-20 bg-white/10 border border-[#c9a84c]/50 rounded-lg px-2 py-0.5 text-[#c9a84c] text-sm font-medium outline-none focus:border-[#c9a84c]"
                                      value={editingPrice[item.id]}
                                      onChange={e => setEditingPrice(prev => ({ ...prev, [item.id]: e.target.value }))}
                                      onKeyDown={e => {
                                        if (e.key === 'Enter') savePrice(item.id, item.quantidade)
                                        if (e.key === 'Escape') setEditingPrice(prev => { const n = { ...prev }; delete n[item.id]; return n })
                                      }}
                                    />
                                    <button
                                      onClick={() => savePrice(item.id, item.quantidade)}
                                      disabled={savingPrice === item.id}
                                      className="text-green-400 hover:text-green-300 cursor-pointer disabled:opacity-50"
                                    >
                                      <Check size={14} />
                                    </button>
                                    <button
                                      onClick={() => setEditingPrice(prev => { const n = { ...prev }; delete n[item.id]; return n })}
                                      className="text-white/30 hover:text-white/60 cursor-pointer"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 group/price">
                                    <span className="text-[#c9a84c] font-medium">{formatCurrency(item.subtotal)}</span>
                                    <button
                                      onClick={() => setEditingPrice(prev => ({ ...prev, [item.id]: String(item.valor_unitario) }))}
                                      className="opacity-0 group-hover/price:opacity-100 text-white/30 hover:text-[#c9a84c] transition-opacity cursor-pointer"
                                      title="Editar valor"
                                    >
                                      <Pencil size={12} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <AdminPreferenceView
                              itemNome={item.produto?.nome ?? ''}
                              categoriaNome={catNome}
                              preferencias={pref}
                            />
                          </div>
                        )
                      })}
                      <div className="flex justify-between px-3 py-2 text-sm font-bold">
                        <span className="text-white">Total estimado</span>
                        <span className="text-[#c9a84c] text-base">{formatCurrency(event.valor_total)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {(event.status === 'orcamento' || event.status === 'em_analise') && (() => {
                  const sel = getSelected(event)
                  const allIds = (event.itens ?? []).map(i => i.id)
                  const someDeselected = allIds.some(id => !sel.has(id))
                  return (
                    <div className="space-y-2 pt-2">
                      {someDeselected && (
                        <p className="text-yellow-400/70 text-xs bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-3 py-2">
                          ⚠️ {allIds.filter(id => !sel.has(id)).length} serviço(s) desmarcado(s) não serão incluídos no pacote do cliente.
                        </p>
                      )}
                      <div className="flex gap-3">
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-500"
                          loading={confirmEvent.isPending}
                          onClick={() => confirmEvent.mutate({ id: event.id, itemIds: [...sel] })}
                          disabled={sel.size === 0}
                        >
                          <Check size={15} /> Confirmar evento
                        </Button>
                        <button
                          onClick={() => updateStatus.mutate({ id: event.id, status: 'em_criacao' })}
                          disabled={updateStatus.isPending}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl glass text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium cursor-pointer disabled:opacity-50"
                        >
                          <X size={15} /> Rejeitar
                        </button>
                      </div>
                    </div>
                  )
                })()}

                {event.status === 'confirmado' && (
                  <div className="pt-2">
                    <button
                      onClick={() => setCancelTarget(event)}
                      disabled={updateStatus.isPending}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl glass text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium cursor-pointer disabled:opacity-50"
                    >
                      <X size={15} /> Cancelar evento
                    </button>
                  </div>
                )}

                {event.status === 'cancelado' && (
                  <div className="pt-2">
                    <button
                      onClick={() => setDeleteTarget(event)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium cursor-pointer"
                    >
                      <Trash2 size={15} /> Apagar evento permanentemente
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black text-white">Orçamentos</h1>
        <p className="text-white/50 mt-1">{pending.length} aguardando confirmação</p>
      </motion.div>

      <Input
        placeholder="Buscar por evento ou cliente..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        icon={<Search size={16} />}
      />

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="space-y-3">
              <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">Aguardando confirmação</p>
              {pending.map(e => <EventCard key={e.id} event={e} />)}
            </div>
          )}

          {others.length > 0 && (
            <div className="space-y-3">
              <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mt-6">Histórico</p>
              {others.map(e => <EventCard key={e.id} event={e} />)}
            </div>
          )}

          {filtered?.length === 0 && (
            <div className="text-center py-16 text-white/40">Nenhum evento encontrado.</div>
          )}
        </>
      )}

      <ConfirmModal
        open={!!cancelTarget}
        title="Cancelar evento?"
        description={`Tem certeza que deseja cancelar "${cancelTarget?.nome_evento}"? O cliente será notificado e o evento ficará marcado como cancelado.`}
        confirmLabel="Sim, cancelar evento"
        onConfirm={() => cancelTarget && updateStatus.mutate({ id: cancelTarget.id, status: 'cancelado' })}
        onClose={() => setCancelTarget(null)}
        loading={updateStatus.isPending}
      />

      <ConfirmModal
        open={!!deleteTarget}
        title="Apagar evento permanentemente?"
        description={`Isso vai deletar "${deleteTarget?.nome_evento}" e TODOS os dados relacionados (serviços, preferências, checklist, mensagens). Esta ação é irreversível.`}
        confirmLabel="Apagar tudo"
        onConfirm={() => deleteTarget && deleteEvent.mutate(deleteTarget.id)}
        onClose={() => setDeleteTarget(null)}
        loading={deleteEvent.isPending}
      />
    </div>
  )
}
