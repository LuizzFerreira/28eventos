import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { isSupabaseConfigured } from '@/lib/supabase'
import { productService } from '@/services/product.service'
import { CardSkeleton } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/utils/cn'
import { Plus, Star, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { LoginModal } from '@/components/ui/LoginModal'
import { useNavigate } from 'react-router-dom'
import { ServiceDetailModal } from '@/components/ui/ServiceDetailModal'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Navigation } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import type { Product } from '@/types'

import 'swiper/css'
import 'swiper/css/pagination'

export function ServicesSection() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [selected, setSelected] = useState<Product | null>(null)
  const [hovered, setHovered] = useState(false)
  const swiperRef = useRef<SwiperType | null>(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', null],
    queryFn: () => productService.getProducts(),
    enabled: !!isSupabaseConfigured,
    retry: 0,
  })

  const featuredProducts = products?.filter(p => p.destaque)

  function handleAddToEvent() {
    if (!user) { setLoginOpen(true); return }
    setSelected(null)
    navigate('/dashboard/criar-evento')
  }

  return (
    <>
      <section id="servicos" className="py-24 px-4 sm:px-6 max-w-7xl mx-auto" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
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
            Conheça alguns dos nossos serviços mais populares e dê o primeiro passo para um evento inesquecível.
          </p>
        </motion.div>

        <div className="relative">
          <button
            onClick={() => swiperRef.current?.slidePrev()}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 z-10 w-10 h-10 glass rounded-full flex items-center justify-center text-white hover:text-[#c9a84c] transition-all duration-300 cursor-pointer ${
              hovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
            }`}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => swiperRef.current?.slideNext()}
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 z-10 w-10 h-10 glass rounded-full flex items-center justify-center text-white hover:text-[#c9a84c] transition-all duration-300 cursor-pointer ${
              hovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
            }`}
          >
            <ChevronRight size={20} />
          </button>
          {isLoading
            ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{[...Array(8)].map((_, i) => <CardSkeleton key={i} />)}</div>
            : (
              <Swiper
                modules={[Pagination, Navigation]}
                spaceBetween={24}
                slidesPerView={1}
                pagination={{ clickable: true, dynamicBullets: true }}
                onSwiper={swiper => { swiperRef.current = swiper }}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                  1280: { slidesPerView: 4 },
                }}
                className="!pb-12"
              >
                {featuredProducts?.map((product, i) => (
                  <SwiperSlide key={product.id} className="h-auto">
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="glass rounded-2xl overflow-hidden card-hover group cursor-pointer h-full flex flex-col"
                      onClick={() => setSelected(product)}
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
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center gap-2 bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                            <Eye size={13} /> Ver detalhes
                          </div>
                        </div>
                      </div>

                      <div className="p-4 flex flex-col flex-grow">
                        <span className="text-[#c9a84c] text-xs font-medium">{product.categoria?.nome}</span>
                        <h3 className="text-white font-semibold mt-1 mb-2">{product.nome}</h3>
                        <p className="text-white/50 text-xs leading-relaxed line-clamp-2 mb-4">{product.descricao}</p>

                        <div className="flex items-center justify-between mt-auto">
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
                  </SwiperSlide>
                ))}
              </Swiper>
            )
          }
        </div>

        {!isLoading && featuredProducts?.length === 0 && (
          <div className="text-center py-16 text-white/40">
            <p>Nenhum serviço em destaque no momento.</p>
          </div>
        )}

        <div className="mt-12 text-center">
          <Button variant="outline" onClick={() => navigate('/servicos')}>
            Ver todos os serviços
          </Button>
        </div>
      </section>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      <ServiceDetailModal
        product={selected}
        onClose={() => setSelected(null)}
        onAddToEvent={handleAddToEvent}
      />
    </>
  )
}
