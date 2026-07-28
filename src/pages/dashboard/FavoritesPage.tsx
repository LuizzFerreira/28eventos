import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { favoriteService } from '@/services/extra.service'
import { CardSkeleton } from '@/components/ui/Badge'
import { formatCurrency } from '@/utils/cn'
import { Heart } from 'lucide-react'

export default function FavoritesPage() {
  const { profile } = useAuth()

  const { data: favorites, isLoading } = useQuery({
    queryKey: ['favorites', profile?.id],
    queryFn: () => favoriteService.getFavorites(profile!.id),
    enabled: !!profile?.id,
  })

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white">Favoritos</h1>
        <p className="text-white/50 text-sm">{favorites?.length || 0} serviços salvos</p>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : favorites?.length === 0 ? (
        <div className="text-center py-20">
          <Heart size={48} className="text-white/10 mx-auto mb-4" />
          <p className="text-white/40">Nenhum favorito ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites?.map((fav: { id: string; produtos: { nome: string; descricao: string; preco: number; imagens?: { url: string }[]; categorias?: { nome: string } } }) => (
            <motion.div
              key={fav.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl overflow-hidden card-hover"
            >
              <div className="h-44 overflow-hidden">
                <img
                  src={fav.produtos?.imagens?.[0]?.url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80'}
                  alt={fav.produtos?.nome}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <span className="text-[#c9a84c] text-xs">{fav.produtos?.categorias?.nome}</span>
                <h3 className="text-white font-semibold mt-1">{fav.produtos?.nome}</h3>
                <p className="text-white/50 text-xs mt-1 line-clamp-2">{fav.produtos?.descricao}</p>
                <p className="text-[#c9a84c] font-bold mt-3">{formatCurrency(fav.produtos?.preco)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
