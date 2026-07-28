import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/context/AuthContext'
import { eventService } from '@/services/event.service'
import { productService } from '@/services/product.service'
import { categoryService } from '@/services/product.service'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { formatCurrency, fetchAddressByCEP, formatCEP } from '@/utils/cn'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronRight, Minus, Plus, ShoppingCart } from 'lucide-react'
import type { EventType, Product } from '@/types'

const steps = ['Tipo', 'Dados', 'Local', 'Aniversariante', 'Serviços']

const step2Schema = z.object({
  nome_evento: z.string().min(3, 'Nome obrigatório'),
  data: z.string().min(1, 'Data obrigatória'),
  horario_inicio: z.string().min(1, 'Horário obrigatório'),
  horario_fim: z.string().min(1, 'Horário obrigatório'),
  quantidade_pessoas: z.coerce.number().min(1, 'Informe a quantidade'),
})

const step3Schema = z.object({
  cep: z.string().min(8, 'CEP inválido'),
  endereco: z.string().min(3, 'Endereço obrigatório'),
  numero: z.string().min(1, 'Número obrigatório'),
  complemento: z.string().optional(),
  bairro: z.string().min(2, 'Bairro obrigatório'),
  cidade: z.string().min(2, 'Cidade obrigatória'),
  estado: z.string().min(2, 'Estado obrigatório'),
})

const eventTypes: { value: EventType; label: string; emoji: string }[] = [
  { value: 'casamento', label: 'Casamento', emoji: '💍' },
  { value: '15_anos', label: '15 Anos', emoji: '👑' },
  { value: 'formatura', label: 'Formatura', emoji: '🎓' },
  { value: 'corporativo', label: 'Corporativo', emoji: '💼' },
  { value: 'infantil', label: 'Infantil', emoji: '🎈' },
  { value: 'aniversario', label: 'Aniversário', emoji: '🎂' },
  { value: 'outro', label: 'Outro', emoji: '✨' },
]

export default function CreateEventPage() {
  const [step, setStep] = useState(0)
  const [tipo, setTipo] = useState<EventType | null>(null)
  const [possuiAniversariante, setPossuiAniversariante] = useState(false)
  const [cart, setCart] = useState<{ produto: Product; quantidade: number }[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [_eventId, setEventId] = useState<string | null>(null)

  const { profile } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const form2 = useForm({ resolver: zodResolver(step2Schema) })
  const form3 = useForm({ resolver: zodResolver(step3Schema) })

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: categoryService.getCategories })
  const { data: products } = useQuery({
    queryKey: ['products', activeCategory],
    queryFn: () => productService.getProducts(activeCategory ?? undefined),
    enabled: step === 4,
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      const d2 = form2.getValues()
      const d3 = form3.getValues()
      const event = await eventService.createEvent(profile!.id, {
        tipo_evento: tipo!,
        ...d2,
        ...d3,
        possui_aniversariante: possuiAniversariante,
      } as Parameters<typeof eventService.createEvent>[1])
      setEventId(event.id)

      for (const item of cart) {
        await eventService.addItem({
          evento_id: event.id,
          produto_id: item.produto.id,
          quantidade: item.quantidade,
          valor_unitario: item.produto.preco,
          subtotal: item.produto.preco * item.quantidade,
        })
      }

      const total = cart.reduce((acc, i) => acc + i.produto.preco * i.quantidade, 0)
      await eventService.updateEvent(event.id, { valor_total: total, status: 'orcamento' })
      return event
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-events'] })
      toast.success('Evento criado! Aguarde nosso contato.')
      navigate('/dashboard')
    },
    onError: () => toast.error('Erro ao criar evento. Tente novamente.'),
  })

  async function handleCEP(cep: string) {
    const addr = await fetchAddressByCEP(cep)
    if (addr) {
      form3.setValue('endereco', addr.endereco)
      form3.setValue('bairro', addr.bairro)
      form3.setValue('cidade', addr.cidade)
      form3.setValue('estado', addr.estado)
    }
  }

  function addToCart(product: Product) {
    setCart(prev => {
      const existing = prev.find(i => i.produto.id === product.id)
      if (existing) return prev.map(i => i.produto.id === product.id ? { ...i, quantidade: i.quantidade + 1 } : i)
      return [...prev, { produto: product, quantidade: 1 }]
    })
    toast.success(`${product.nome} adicionado!`)
  }

  function removeFromCart(productId: string) {
    setCart(prev => prev.filter(i => i.produto.id !== productId))
  }

  function updateQty(productId: string, qty: number) {
    if (qty <= 0) return removeFromCart(productId)
    setCart(prev => prev.map(i => i.produto.id === productId ? { ...i, quantidade: qty } : i))
  }

  const cartTotal = cart.reduce((acc, i) => acc + i.produto.preco * i.quantidade, 0)

  async function handleNext() {
    if (step === 1) {
      const valid = await form2.trigger()
      if (!valid) return
    }
    if (step === 2) {
      const valid = await form3.trigger()
      if (!valid) return
    }
    setStep(s => s + 1)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black text-white">Criar Evento</h1>
        <p className="text-white/50 mt-1">Monte o evento dos seus sonhos passo a passo.</p>
      </motion.div>

      {/* Stepper */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-shrink-0">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              i === step ? 'gold-gradient text-black' :
              i < step ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
              'glass text-white/40'
            }`}>
              {i < step ? <Check size={14} /> : <span>{i + 1}</span>}
              {s}
            </div>
            {i < steps.length - 1 && <ChevronRight size={14} className="text-white/20 flex-shrink-0" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          {/* Step 0: Tipo */}
          {step === 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">Qual o tipo do evento?</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {eventTypes.map(et => (
                  <motion.button
                    key={et.value}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setTipo(et.value)}
                    className={`glass rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      tipo === et.value ? 'border-[#c9a84c] glass-gold' : 'hover:border-white/20'
                    }`}
                  >
                    <div className="text-4xl mb-3">{et.emoji}</div>
                    <div className="text-white font-medium text-sm">{et.label}</div>
                    {tipo === et.value && <Check size={16} className="text-[#c9a84c] mx-auto mt-2" />}
                  </motion.button>
                ))}
              </div>
              <Button onClick={() => tipo && setStep(1)} disabled={!tipo} size="lg">
                Continuar <ChevronRight size={16} />
              </Button>
            </div>
          )}

          {/* Step 1: Dados */}
          {step === 1 && (
            <div className="space-y-6 max-w-xl">
              <h2 className="text-xl font-bold text-white">Dados do evento</h2>
              <Input label="Nome do evento" placeholder="Ex: Casamento João e Maria" error={form2.formState.errors.nome_evento?.message} {...form2.register('nome_evento')} />
              <Input label="Data" type="date" error={form2.formState.errors.data?.message} {...form2.register('data')} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Horário início" type="time" error={form2.formState.errors.horario_inicio?.message} {...form2.register('horario_inicio')} />
                <Input label="Horário fim" type="time" error={form2.formState.errors.horario_fim?.message} {...form2.register('horario_fim')} />
              </div>
              <Input label="Quantidade de pessoas" type="number" placeholder="Ex: 200" error={form2.formState.errors.quantidade_pessoas?.message} {...form2.register('quantidade_pessoas')} />
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(0)}>Voltar</Button>
                <Button onClick={handleNext}>Continuar <ChevronRight size={16} /></Button>
              </div>
            </div>
          )}

          {/* Step 2: Local */}
          {step === 2 && (
            <div className="space-y-6 max-w-xl">
              <h2 className="text-xl font-bold text-white">Local do evento</h2>
              <Input
                label="CEP"
                placeholder="00000-000"
                error={form3.formState.errors.cep?.message}
                {...form3.register('cep', {
                  onChange: e => {
                    const v = formatCEP(e.target.value)
                    form3.setValue('cep', v)
                    if (v.replace(/\D/g, '').length === 8) handleCEP(v)
                  }
                })}
              />
              <Input label="Endereço" placeholder="Rua, Avenida..." error={form3.formState.errors.endereco?.message} {...form3.register('endereco')} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Número" placeholder="123" error={form3.formState.errors.numero?.message} {...form3.register('numero')} />
                <Input label="Complemento" placeholder="Apto, Bloco..." {...form3.register('complemento')} />
              </div>
              <Input label="Bairro" error={form3.formState.errors.bairro?.message} {...form3.register('bairro')} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Cidade" error={form3.formState.errors.cidade?.message} {...form3.register('cidade')} />
                <Input label="Estado" placeholder="SP" error={form3.formState.errors.estado?.message} {...form3.register('estado')} />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>Voltar</Button>
                <Button onClick={handleNext}>Continuar <ChevronRight size={16} /></Button>
              </div>
            </div>
          )}

          {/* Step 3: Aniversariante */}
          {step === 3 && (
            <div className="space-y-6 max-w-xl">
              <h2 className="text-xl font-bold text-white">Tem aniversariante?</h2>
              <div className="flex gap-4">
                {[true, false].map(v => (
                  <button
                    key={String(v)}
                    onClick={() => setPossuiAniversariante(v)}
                    className={`flex-1 glass rounded-xl py-4 text-center font-medium transition-all cursor-pointer ${
                      possuiAniversariante === v ? 'glass-gold text-[#c9a84c]' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {v ? '🎂 Sim' : '❌ Não'}
                  </button>
                ))}
              </div>
              {possuiAniversariante && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <Input label="Nome do aniversariante" placeholder="Nome completo" />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Idade" type="number" placeholder="Ex: 15" />
                    <Select label="Sexo">
                      <option value="">Selecione</option>
                      <option value="masculino">Masculino</option>
                      <option value="feminino">Feminino</option>
                    </Select>
                  </div>
                </motion.div>
              )}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)}>Voltar</Button>
                <Button onClick={() => setStep(4)}>Continuar <ChevronRight size={16} /></Button>
              </div>
            </div>
          )}

          {/* Step 4: Serviços */}
          {step === 4 && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-xl font-bold text-white">Selecione os serviços</h2>

                <div className="flex gap-2 overflow-x-auto pb-2">
                  <button
                    onClick={() => setActiveCategory(null)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      !activeCategory ? 'gold-gradient text-black' : 'glass text-white/60'
                    }`}
                  >
                    Todos
                  </button>
                  {categories?.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        activeCategory === cat.id ? 'gold-gradient text-black' : 'glass text-white/60'
                      }`}
                    >
                      {cat.nome}
                    </button>
                  ))}
                </div>

                <div className="grid sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
                  {products?.map(product => {
                    const inCart = cart.find(i => i.produto.id === product.id)
                    return (
                      <motion.div
                        key={product.id}
                        whileHover={{ y: -2 }}
                        className={`glass rounded-xl p-4 transition-all ${inCart ? 'border-[#c9a84c]/40' : ''}`}
                      >
                        <div className="flex gap-3">
                          <img
                            src={product.imagens?.[0]?.url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=100&q=80'}
                            alt={product.nome}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm truncate">{product.nome}</p>
                            <p className="text-white/50 text-xs line-clamp-1">{product.descricao}</p>
                            <p className="text-[#c9a84c] font-bold text-sm mt-1">{formatCurrency(product.preco)}</p>
                          </div>
                        </div>
                        {inCart ? (
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <button onClick={() => updateQty(product.id, inCart.quantidade - 1)} className="w-7 h-7 glass rounded-full flex items-center justify-center text-white hover:bg-white/10 cursor-pointer">
                                <Minus size={12} />
                              </button>
                              <span className="text-white font-medium w-6 text-center">{inCart.quantidade}</span>
                              <button onClick={() => updateQty(product.id, inCart.quantidade + 1)} className="w-7 h-7 glass rounded-full flex items-center justify-center text-white hover:bg-white/10 cursor-pointer">
                                <Plus size={12} />
                              </button>
                            </div>
                            <span className="text-[#c9a84c] text-sm font-semibold">{formatCurrency(product.preco * inCart.quantidade)}</span>
                          </div>
                        ) : (
                          <Button size="sm" className="w-full mt-3" onClick={() => addToCart(product)}>
                            <Plus size={14} /> Adicionar
                          </Button>
                        )}
                      </motion.div>
                    )
                  })}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(3)}>Voltar</Button>
                </div>
              </div>

              {/* Cart summary */}
              <div className="lg:sticky lg:top-8 h-fit">
                <div className="glass-gold rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <ShoppingCart size={18} className="text-[#c9a84c]" />
                    <h3 className="text-white font-bold">Resumo</h3>
                  </div>

                  {cart.length === 0 ? (
                    <p className="text-white/40 text-sm text-center py-4">Nenhum serviço adicionado</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {cart.map(item => (
                        <div key={item.produto.id} className="flex items-center justify-between text-sm">
                          <span className="text-white/70 truncate flex-1">{item.produto.nome}</span>
                          <span className="text-white/50 mx-2">x{item.quantidade}</span>
                          <span className="text-[#c9a84c] font-medium flex-shrink-0">{formatCurrency(item.produto.preco * item.quantidade)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-white/10 pt-3">
                    <div className="flex justify-between text-sm text-white/60 mb-1">
                      <span>Subtotal</span>
                      <span>{formatCurrency(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span className="text-white">Total estimado</span>
                      <span className="gold-text text-lg">{formatCurrency(cartTotal)}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    loading={createMutation.isPending}
                    onClick={() => createMutation.mutate()}
                    disabled={cart.length === 0}
                  >
                    Solicitar Orçamento
                  </Button>
                  <p className="text-white/30 text-xs text-center">Nossa equipe entrará em contato em até 24h</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
