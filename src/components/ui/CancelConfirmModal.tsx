import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Props {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
  onClose: () => void
  loading?: boolean
  danger?: boolean
}

export function ConfirmModal({ open, title, description, confirmLabel = 'Confirmar', onConfirm, onClose, loading, danger = true }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={e => e.stopPropagation()}
            className="relative glass rounded-2xl p-8 max-w-md w-full border border-white/10 shadow-2xl"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white/70 transition-colors cursor-pointer">
              <X size={18} />
            </button>

            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 mx-auto ${danger ? 'bg-red-500/15 border border-red-500/30' : 'bg-yellow-500/15 border border-yellow-500/30'}`}>
              <AlertTriangle size={26} className={danger ? 'text-red-400' : 'text-yellow-400'} />
            </div>

            <h2 className="text-white text-xl font-black text-center mb-2">{title}</h2>
            <p className="text-white/50 text-sm text-center leading-relaxed mb-8">{description}</p>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl glass text-white/60 hover:text-white text-sm font-medium transition-colors cursor-pointer"
              >
                Voltar
              </button>
              <Button
                className={`flex-1 ${danger ? 'bg-red-600 hover:bg-red-500 border-red-500/50' : ''}`}
                onClick={onConfirm}
                loading={loading}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
