import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { isSupabaseConfigured } from '@/lib/supabase'
import { productService } from '@/services/product.service'
import { categoryService } from '@/services/product.service'
import { CardSkeleton } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/utils/cn'
import { Heart, Plus, Star } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { LoginModal } from '@/components/ui/LoginModal'
import { useNavigate } from 'react-router-dom'

export function ServicesSection() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [loginOpen, setLoginOpen] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getCategories,
    enabled: !!isSupabaseConfigured,
    retry: 0,
  })

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', activeCategory],
    queryFn: () => productService.getProducts(activeCategory ?? undefined),
    enabled: !!isSupabaseConfigured,
    retry: 0,
  })

  function handleAddToEvent() {
    if (!user) { setLoginOpen(true); return }
    navigate('/dashboard/criar-evento')
  }

  return (
    <>
      <section id="servicos" className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-[#c9a84c] text-sm font-semibold tracking-widest uppercase">Nossos Serviços</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-3">
            Tudo para o seu <span className="gold-text">evento perfeito</span>
          </h2>
          <p className="text-white/50 mt-4 max-w-xl mx-auto">
            Mais de 39 categorias de serviços premium para tornar seu evento único e inesquecível.
          </p>
        </motion.div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
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
            ? [...Array(8)].map((_, i) => <CardSkeleton key={i} />)
            : products?.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl overflow-hidden card-hover group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={product.imagens?.[0]?.url || `https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80`}
                    alt={product.nome}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {product.destaque && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-[#c9a84c] text-black text-xs font-bold px-2 py-1 rounded-full">
                      <Star size={10} /> Destaque
                    </div>
                  )}
                  <button className="absolute top-3 right-3 w-8 h-8 glass rounded-full flex items-center justify-center text-white/60 hover:text-red-400 transition-colors cursor-pointer">
                    <Heart size={14} />
                  </button>
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
                    <Button size="sm" onClick={handleAddToEvent}>
                      <Plus size={14} /> Adicionar
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          }
        </div>

        {!isLoading && (!products || products.length === 0) && (
          <div className="text-center py-16 text-white/40">
            <p>Nenhum serviço encontrado nesta categoria.</p>
          </div>
        )}
      </section>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  )
}
