import { FcGoogle } from 'react-icons/fc'
import { motion } from 'framer-motion'
import { Modal } from './Modal'
import { useAuth } from '@/context/AuthContext'
import { Sparkles } from 'lucide-react'

interface LoginModalProps {
  open: boolean
  onClose: () => void
}

export function LoginModal({ open, onClose }: LoginModalProps) {
  const { signInWithGoogle } = useAuth()

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="text-center space-y-6 py-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="w-16 h-16 gold-gradient rounded-2xl flex items-center justify-center mx-auto"
        >
          <Sparkles className="text-black" size={28} />
        </motion.div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo!</h2>
          <p className="text-white/60 text-sm">
            Entre com sua conta Google para organizar seu evento dos sonhos.
          </p>
        </div>

        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3 px-6 rounded-xl hover:bg-gray-100 transition-all duration-200 cursor-pointer"
        >
          <FcGoogle size={22} />
          Continuar com Google
        </button>

        <p className="text-white/30 text-xs">
          Ao entrar, você concorda com nossos termos de uso e política de privacidade.
        </p>
      </div>
    </Modal>
  )
}
