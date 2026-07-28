import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Clock, Tag, Star, Plus, Heart, Play } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/utils/cn'
import type { Product } from '@/types'

interface ServiceDetailModalProps {
  product: Product | null
  onClose: () => void
  onAddToEvent: () => void
  onFavorite?: (id: string) => void
}

const FALLBACK = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80'

export function ServiceDetailModal({ product, onClose, onAddToEvent, onFavorite }: ServiceDetailModalProps) {
  const [imgIndex, setImgIndex] = useState(0)
  const [showVideo, setShowVideo] = useState<string | null>(null)

  if (!product) return null

  const images = product.imagens?.length ? product.imagens : [{ id: '0', produto_id: product.id, url: FALLBACK, ordem: 0 }]
  const videos = product.videos ?? []
  const media = [...images.map(i => ({ type: 'image' as const, src: i.url })), ...videos.map(v => ({ type: 'video' as const, src: v }))]

  function prev() { setImgIndex(i => (i - 1 + media.length) % media.length) }
  function next() { setImgIndex(i => (i + 1) % media.length) }

  const current = media[imgIndex]

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

        <motion.div
          className="relative w-full max-w-4xl glass rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
          initial={{ scale: 0.92, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 24 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-9 h-9 glass rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="flex flex-col lg:flex-row overflow-auto">
            {/* Gallery */}
            <div className="lg:w-1/2 flex-shrink-0">
              <div className="relative h-72 lg:h-full min-h-72 bg-black/40">
                {current.type === 'video' ? (
                  showVideo === current.src ? (
                    <iframe
                      src={current.src.replace('watch?v=', 'embed/')}
                      className="w-full h-full"
                      allow="autoplay; fullscreen"
                      allowFullScreen
                    />
                  ) : (
                    <div className="relative w-full h-full flex items-center justify-center bg-black/60">
                      <img src={images[0]?.url || FALLBACK} alt="" className="w-full h-full object-cover opacity-40" />
                      <button
                        onClick={() => setShowVideo(current.src)}
                        className="absolute w-16 h-16 bg-[#c9a84c] rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Play size={24} className="text-black ml-1" />
                      </button>
                    </div>
                  )
                ) : (
                  <img src={current.src} alt={product.nome} className="w-full h-full object-cover" />
                )}

                {media.length > 1 && (
                  <>
                    <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 glass rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer">
                      <ChevronLeft size={16} />
                    </button>
                    <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 glass rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer">
                      <ChevronRight size={16} />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {media.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => { setImgIndex(i); setShowVideo(null) }}
                          className={`w-2 h-2 rounded-full transition-all cursor-pointer ${i === imgIndex ? 'bg-[#c9a84c] w-4' : 'bg-white/40'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {media.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto bg-black/20">
                  {media.map((m, i) => (
                    <button
                      key={i}
                      onClick={() => { setImgIndex(i); setShowVideo(null) }}
                      className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${i === imgIndex ? 'border-[#c9a84c]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                      {m.type === 'video' ? (
                        <div className="w-full h-full bg-black/60 flex items-center justify-center">
                          <Play size={16} className="text-[#c9a84c]" />
                        </div>
                      ) : (
                        <img src={m.src} alt="" className="w-full h-full object-cover" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="lg:w-1/2 p-6 flex flex-col gap-4 overflow-y-auto">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[#c9a84c] text-xs font-semibold flex items-center gap-1">
                    <Tag size={11} /> {product.categoria?.nome}
                  </span>
                  {product.destaque && (
                    <span className="flex items-center gap-1 bg-[#c9a84c]/20 text-[#c9a84c] text-xs font-bold px-2 py-0.5 rounded-full">
                      <Star size={10} /> Destaque
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-black text-white">{product.nome}</h2>
              </div>

              {product.duracao && (
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <Clock size={14} className="text-[#c9a84c]" />
                  <span>Duração: <span className="text-white font-medium">{product.duracao}</span></span>
                </div>
              )}

              <div>
                <p className="text-white/70 text-sm leading-relaxed">{product.descricao}</p>
              </div>

              <div className="glass rounded-xl p-4 mt-auto">
                <span className="text-white/40 text-xs">A partir de</span>
                <div className="text-3xl font-black text-[#c9a84c] mt-1">{formatCurrency(product.preco)}</div>
                <p className="text-white/40 text-xs mt-1">Valor pode variar conforme detalhes do evento</p>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1" onClick={onAddToEvent}>
                  <Plus size={16} /> Adicionar ao Evento
                </Button>
                {onFavorite && (
                  <button
                    onClick={() => onFavorite(product.id)}
                    className="w-11 h-11 glass rounded-xl flex items-center justify-center text-white/60 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <Heart size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
