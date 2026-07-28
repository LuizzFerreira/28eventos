import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { notificationService } from '@/services/extra.service'
import { Skeleton } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Bell, CheckCheck, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Notification } from '@/types'

const icons = {
  info: <Info size={16} className="text-blue-400" />,
  success: <CheckCircle size={16} className="text-green-400" />,
  warning: <AlertTriangle size={16} className="text-yellow-400" />,
  error: <XCircle size={16} className="text-red-400" />,
}

export default function NotificationsPage() {
  const { profile } = useAuth()
  const queryClient = useQueryClient()

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', profile?.id],
    queryFn: () => notificationService.getNotifications(profile!.id),
    enabled: !!profile?.id,
  })

  const markAll = useMutation({
    mutationFn: () => notificationService.markAllAsRead(profile!.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markOne = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const unread = notifications?.filter(n => !n.lida).length || 0

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Notificações</h1>
          {unread > 0 && <p className="text-white/50 text-sm">{unread} não lida(s)</p>}
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAll.mutate()}>
            <CheckCheck size={14} /> Marcar todas
          </Button>
        )}
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : notifications?.length === 0 ? (
        <div className="text-center py-20">
          <Bell size={48} className="text-white/10 mx-auto mb-4" />
          <p className="text-white/40">Nenhuma notificação.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications?.map((n: Notification) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => !n.lida && markOne.mutate(n.id)}
              className={`glass rounded-xl p-4 flex items-start gap-3 cursor-pointer transition-all hover:bg-white/5 ${
                !n.lida ? 'border-l-2 border-[#c9a84c]' : 'opacity-60'
              }`}
            >
              <div className="mt-0.5">{icons[n.tipo]}</div>
              <div className="flex-1">
                <p className="text-white font-medium text-sm">{n.titulo}</p>
                <p className="text-white/60 text-xs mt-0.5">{n.mensagem}</p>
                <p className="text-white/30 text-xs mt-1">
                  {format(new Date(n.created_at), "d 'de' MMM 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
              {!n.lida && <div className="w-2 h-2 rounded-full bg-[#c9a84c] flex-shrink-0 mt-1" />}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
