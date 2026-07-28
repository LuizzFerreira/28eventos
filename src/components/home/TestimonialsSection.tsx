import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Ana Carolina',
    event: 'Casamento',
    text: 'A LG Eventos superou todas as nossas expectativas. Cada detalhe foi pensado com carinho e profissionalismo. Nosso casamento foi simplesmente perfeito!',
    rating: 5,
    avatar: 'https://i.pravatar.cc/100?img=1',
  },
  {
    name: 'Roberto Mendes',
    event: 'Formatura',
    text: 'Contratamos para a formatura da turma e foi incrível. A organização, a iluminação, o DJ... tudo impecável. Recomendo demais!',
    rating: 5,
    avatar: 'https://i.pravatar.cc/100?img=3',
  },
  {
    name: 'Fernanda Lima',
    event: '15 Anos',
    text: 'Minha filha ficou encantada com a festa. O robô de LED foi o ponto alto da noite. Profissionais extremamente dedicados.',
    rating: 5,
    avatar: 'https://i.pravatar.cc/100?img=5',
  },
  {
    name: 'Carlos Eduardo',
    event: 'Corporativo',
    text: 'Realizamos nosso evento corporativo com a LG e o resultado foi excepcional. Transmissão ao vivo perfeita e estrutura impecável.',
    rating: 5,
    avatar: 'https://i.pravatar.cc/100?img=7',
  },
  {
    name: 'Juliana Santos',
    event: 'Aniversário',
    text: 'Festa incrível! A decoração ficou exatamente como eu sonhei. Equipe super atenciosa e profissional do início ao fim.',
    rating: 5,
    avatar: 'https://i.pravatar.cc/100?img=9',
  },
]

const galleryImages = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80',
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80',
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80',
  'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=600&q=80',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
]

export function TestimonialsSection() {
  return (
    <section className="py-24 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-[#c9a84c] text-sm font-semibold tracking-widest uppercase">Depoimentos</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-3">
            O que nossos <span className="gold-text">clientes dizem</span>
          </h2>
        </motion.div>

        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={24}
          slidesPerView={1}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="pb-12"
        >
          {testimonials.map((t, i) => (
            <SwiperSlide key={i}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 h-full"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={14} className="text-[#c9a84c] fill-[#c9a84c]" />
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-[#c9a84c] text-xs">{t.event}</p>
                  </div>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}

export function GallerySection() {
  return (
    <section id="galeria" className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <span className="text-[#c9a84c] text-sm font-semibold tracking-widest uppercase">Galeria</span>
        <h2 className="text-4xl sm:text-5xl font-black text-white mt-3">
          Momentos <span className="gold-text">eternizados</span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {galleryImages.map((img, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`relative overflow-hidden rounded-2xl group cursor-pointer ${
              i === 0 ? 'md:col-span-2 md:row-span-2' : ''
            }`}
            style={{ height: i === 0 ? '400px' : '190px' }}
          >
            <img
              src={img}
              alt={`Evento ${i + 1}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300" />
          </motion.div>
        ))}
      </div>
    </section>
  )
}
