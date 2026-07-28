import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { productService } from '@/services/product.service'
import { categoryService } from '@/services/product.service'
import { CardSkeleton } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { LoginModal } from '@/components/ui/LoginModal'
import { ServiceDetailModal } from '@/components/ui/ServiceDetailModal'
import { formatCurrency } from '@/utils/cn'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Plus, Star, Search, Eye } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { favoriteService } from '@/services/extra.service'
import { toast } from 'sonner'
import type { Product } from '@/types'

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [loginOpen, setLoginOpen] = useState(false)
  const [selected, setSelected] = useState<Product | null>(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getCategories,
  })

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', activeCategory],
    queryFn: () => productService.getProducts(activeCategory ?? undefined),
  })

  const filtered = products?.filter(p =>
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    p.descricao?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleFavorite(productId: string) {
    if (!user) { setLoginOpen(true); return }
    const added = await favoriteService.toggle(user.id, productId)
    toast.success(added ? 'Adicionado aos favoritos!' : 'Removido dos favoritos')
  }

  function handleAddToEvent() {
    if (!user) { setLoginOpen(true); return }
    setSelected(null)
    navigate('/dashboard/criar-evento')
  }

  return (
    <>
      <div className="pt-24 pb-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="text-[#c9a84c] text-sm font-semibold tracking-widest uppercase">Catálogo</span>
          <h1 className="text-4xl sm:text-6xl font-black text-white mt-3 mb-4">
            Nossos <span className="gold-text">Serviços</span>
          </h1>
          <p className="text-white/50 max-w-xl mx-auto">
            Escolha os serviços ideais para o seu evento e monte um pacote personalizado.
          </p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <Input
              placeholder="Buscar serviços..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              icon={<Search size={16} />}
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
          <button
            onClick={() => setActiveCategory(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
              !activeCategory ? 'gold-gradient text-black' : 'glass text-white/60 hover:text-white'
            }`}
          >
            Todos
          </button>
          {categories?.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                activeCategory === cat.id ? 'gold-gradient text-black' : 'glass text-white/60 hover:text-white'
              }`}
            >
              {cat.nome}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading
            ? [...Array(12)].map((_, i) => <CardSkeleton key={i} />)
            : filtered?.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass rounded-2xl overflow-hidden card-hover group cursor-pointer"
                onClick={() => setSelected(product)}
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={product.imagens?.[0]?.url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80'}
                    alt={product.nome}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {product.destaque && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-[#c9a84c] text-black text-xs font-bold px-2 py-1 rounded-full">
                      <Star size={10} /> Destaque
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2 bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                      <Eye size={13} /> Ver detalhes
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <span className="text-[#c9a84c] text-xs font-medium">{product.categoria?.nome}</span>
                  <h3 className="text-white font-semibold mt-1 mb-2">{product.nome}</h3>
                  <p className="text-white/50 text-xs leading-relaxed line-clamp-2 mb-4">{product.descricao}</p>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-white/40 text-xs">A partir de</span>
                      <div className="text-[#c9a84c] font-bold">{formatCurrency(product.preco)}</div>
                    </div>
                    <Button size="sm" onClick={e => { e.stopPropagation(); handleAddToEvent() }}>
                      <Plus size={14} /> Adicionar
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          }
        </div>

        {!isLoading && filtered?.length === 0 && (
          <div className="text-center py-20 text-white/40">
            <p className="text-lg">Nenhum serviço encontrado.</p>
          </div>
        )}
      </div>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      <ServiceDetailModal
        product={selected}
        onClose={() => setSelected(null)}
        onAddToEvent={handleAddToEvent}
        onFavorite={handleFavorite}
      />
    </>
  )
}
