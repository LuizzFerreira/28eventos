import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'gold' | 'green' | 'blue' | 'red' | 'gray' | 'purple'
  className?: string
}

const variants = {
  gold: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  green: 'bg-green-500/20 text-green-400 border-green-500/30',
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  red: 'bg-red-500/20 text-red-400 border-red-500/30',
  gray: 'bg-white/10 text-white/60 border-white/20',
  purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

export function Badge({ children, variant = 'gray', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      variants[variant], className
    )}>
      {children}
    </span>
  )
}

export const statusBadge = {
  em_criacao: { label: 'Em Criação', variant: 'gray' as const },
  orcamento: { label: 'Orçamento', variant: 'blue' as const },
  em_analise: { label: 'Em Análise', variant: 'purple' as const },
  confirmado: { label: 'Confirmado', variant: 'green' as const },
  finalizado: { label: 'Finalizado', variant: 'gold' as const },
}

interface SkeletonProps { className?: string }

export function Skeleton({ className }: SkeletonProps) {
  return (
    <motion.div
      className={cn('bg-white/5 rounded-xl', className)}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="glass rounded-2xl p-4 space-y-3">
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}
