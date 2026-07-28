import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { eventService } from '@/services/event.service'
import { messageService } from '@/services/extra.service'
import { Skeleton } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Send } from 'lucide-react'
import type { Message } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function MessagesPage() {
  const { profile } = useAuth()
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  const { data: events } = useQuery({
    queryKey: ['my-events', profile?.id],
    queryFn: () => eventService.getMyEvents(profile!.id),
    enabled: !!profile?.id,
  })
  const eventId = events?.[0]?.id

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', eventId],
    queryFn: () => messageService.getMessages(eventId!),
    enabled: !!eventId,
    refetchInterval: 5000,
  })

  const sendMutation = useMutation({
    mutationFn: () => messageService.sendMessage(eventId!, profile!.id, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', eventId] })
      setText('')
    },
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!eventId) return (
    <div className="text-center py-20 text-white/50">
      <p>Crie um evento para acessar as mensagens.</p>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-12rem)]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-black text-white">Mensagens</h1>
        <p className="text-white/50 text-sm">Converse diretamente com nossa equipe.</p>
      </motion.div>

      <div className="flex-1 glass rounded-2xl p-4 overflow-y-auto space-y-3 mb-4">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : messages?.length === 0 ? (
          <div className="text-center py-12 text-white/30">
            <p>Nenhuma mensagem ainda. Diga olá! 👋</p>
          </div>
        ) : (
          messages?.map((msg: Message) => {
            const isMe = msg.user_id === profile?.id
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}
              >
                <img
                  src={(msg.user as { avatar_url?: string })?.avatar_url || `https://ui-avatars.com/api/?name=${(msg.user as { nome?: string })?.nome}&background=c9a84c&color=000`}
                  alt=""
                  className="w-8 h-8 rounded-full flex-shrink-0"
                />
                <div className={`max-w-xs ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                    isMe ? 'gold-gradient text-black' : 'glass text-white/90'
                  }`}>
                    {msg.conteudo}
                  </div>
                  <span className="text-white/30 text-xs px-1">
                    {format(new Date(msg.created_at), 'HH:mm', { locale: ptBR })}
                  </span>
                </div>
              </motion.div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Digite sua mensagem..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && text && sendMutation.mutate()}
        />
        <Button onClick={() => text && sendMutation.mutate()} loading={sendMutation.isPending}>
          <Send size={16} />
        </Button>
      </div>
    </div>
  )
}
