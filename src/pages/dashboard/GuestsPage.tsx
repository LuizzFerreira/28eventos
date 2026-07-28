import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { eventService } from '@/services/event.service'
import { guestService } from '@/services/extra.service'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Badge'
import { Plus, Check, X, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'

export default function GuestsPage() {
  const { profile } = useAuth()
  const queryClient = useQueryClient()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')

  const { data: events } = useQuery({
    queryKey: ['my-events', profile?.id],
    queryFn: () => eventService.getMyEvents(profile!.id),
    enabled: !!profile?.id,
  })
  const eventId = events?.[0]?.id

  const { data: guests, isLoading } = useQuery({
    queryKey: ['guests', eventId],
    queryFn: () => guestService.getGuests(eventId!),
    enabled: !!eventId,
  })

  const addGuest = useMutation({
    mutationFn: () => guestService.addGuest({ evento_id: eventId!, nome, email, telefone, confirmado: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] })
      setNome(''); setEmail(''); setTelefone('')
      toast.success('Convidado adicionado!')
    },
  })

  const toggleRSVP = useMutation({
    mutationFn: ({ id, confirmado }: { id: string; confirmado: boolean }) =>
      guestService.updateRSVP(id, confirmado),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['guests'] }),
  })

  const removeGuest = useMutation({
    mutationFn: (id: string) => guestService.removeGuest(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['guests'] }),
  })

  const confirmed = guests?.filter(g => g.confirmado).length || 0

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white">Lista de Convidados</h1>
        <p className="text-white/50 text-sm">{guests?.length || 0} convidados • {confirmed} confirmados</p>
      </motion.div>

      <div className="glass rounded-2xl p-5 space-y-4">
        <h3 className="text-white font-semibold">Adicionar convidado</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <Input placeholder="Nome *" value={nome} onChange={e => setNome(e.target.value)} />
          <Input placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} />
          <Input placeholder="Telefone" value={telefone} onChange={e => setTelefone(e.target.value)} />
        </div>
        <Button onClick={() => nome && addGuest.mutate()} loading={addGuest.isPending} disabled={!nome}>
          <Plus size={14} /> Adicionar
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : guests?.length === 0 ? (
        <div className="text-center py-16">
          <Users size={48} className="text-white/10 mx-auto mb-4" />
          <p className="text-white/40">Nenhum convidado adicionado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {guests?.map(guest => (
            <motion.div
              key={guest.id}
              layout
              className="glass rounded-xl p-4 flex items-center gap-3"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                guest.confirmado ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'
              }`}>
                {guest.nome[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm">{guest.nome}</p>
                {guest.email && <p className="text-white/40 text-xs">{guest.email}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleRSVP.mutate({ id: guest.id, confirmado: !guest.confirmado })}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    guest.confirmado
                      ? 'bg-green-500/20 text-green-400 hover:bg-red-500/20 hover:text-red-400'
                      : 'glass text-white/50 hover:bg-green-500/20 hover:text-green-400'
                  }`}
                >
                  {guest.confirmado ? <><Check size={10} /> Confirmado</> : <><X size={10} /> Pendente</>}
                </button>
                <button
                  onClick={() => removeGuest.mutate(guest.id)}
                  className="text-white/20 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
