import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/context/AuthContext'
import { eventService, sendQuoteEmail } from '@/services/event.service'
import { productService } from '@/services/product.service'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { fetchAddressByCEP, formatCEP } from '@/utils/cn'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronRight, Minus, Plus, ShoppingCart } from 'lucide-react'
import { ProductSearch } from '@/components/ui/ProductSearch'
import type { EventType, Product } from '@/types'

const DEV_BYPASS = import.meta.env.VITE_DEV_BYPASS_AUTH === 'true'

// Tipos que sempre têm aniversariante — pula a pergunta e vai direto aos campos
const SEMPRE_ANIVERSARIANTE: EventType[] = ['aniversario', '15_anos', 'infantil']
// Tipos que nunca têm aniversariante — pula o step inteiro
const NUNCA_ANIVERSARIANTE: EventType[] = ['casamento', 'corporativo', 'formatura', 'outro']

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

const eventTypes: { value: EventType; label: string }[] = [
  { value: 'casamento', label: 'Casamento' },
  { value: '15_anos', label: '15 Anos' },
  { value: 'formatura', label: 'Formatura' },
  { value: 'corporativo', label: 'Corporativo' },
  { value: 'infantil', label: 'Infantil' },
  { value: 'aniversario', label: 'Aniversário' },
  { value: 'outro', label: 'Outro' },
]

// Steps visíveis para o indicador (sem "Aniversariante" pois é condicional)
const STEP_LABELS = ['Tipo', 'Dados', 'Local', 'Serviços']

export default function CreateEventPage() {
  const [step, setStep] = useState(0)
  const [tipo, setTipo] = useState<EventType | null>(null)
  const [possuiAniversariante, setPossuiAniversariante] = useState(false)
  const [nomeAniversariante, setNomeAniversariante] = useState('')
  const [idadeAniversariante, setIdadeAniversariante] = useState('')
  const [cart, setCart] = useState<{ produto: Product; quantidade: number }[]>([])
  const [_eventId, setEventId] = useState<string | null>(null)

  const { profile } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const form2 = useForm({ resolver: zodResolver(step2Schema) })
  const form3 = useForm({ resolver: zodResolver(step3Schema) })

  const { data: products } = useQuery({
    queryKey: ['products', null],
    queryFn: () => productService.getProducts(),
    enabled: step === 4,
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      if (DEV_BYPASS) {
        await new Promise(r => setTimeout(r, 800))
        return
      }

      const d2 = form2.getValues()
      const d3 = form3.getValues()
      const event = await eventService.createEvent(profile!.id, {
        tipo_evento: tipo!,
        ...d2,
        ...d3,
        possui_aniversariante: possuiAniversariante,
        nome_aniversariante: nomeAniversariante,
        idade_aniversariante: Number(idadeAniversariante),
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

      const fullEvent = await eventService.getEventWithItems(event.id)
      await sendQuoteEmail(fullEvent, profile!.nome ?? '', profile!.email).catch(() => {})

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

  async function handleNext() {
    if (step === 1) {
      const valid = await form2.trigger()
      if (!valid) return
    }
    if (step === 2) {
      const valid = await form3.trigger()
      if (!valid) return
      // Após local: decide se mostra step de aniversariante
      if (tipo && NUNCA_ANIVERSARIANTE.includes(tipo)) {
        setPossuiAniversariante(false)
        setStep(4) // pula direto para serviços
        return
      }
      if (tipo && SEMPRE_ANIVERSARIANTE.includes(tipo)) {
        setPossuiAniversariante(true)
        setStep(3) // vai para campos do aniversariante (sem a pergunta sim/não)
        return
      }
    }
    setStep(s => s + 1)
  }

  // Indicador de progresso simplificado
  // step 0=Tipo, 1=Dados, 2=Local, 3=Aniversariante(condicional), 4=Serviços
  // Mapeia para os 4 labels visíveis
  const indicatorIndex = step === 4 ? 3 : step === 3 ? 2 : step

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 min-w-0">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Criar Evento</h1>
        <p className="text-white/50 mt-1 text-sm">Monte o evento dos seus sonhos passo a passo.</p>
      </motion.div>

      {/* Indicador de progresso simples */}
      <div className="flex items-center gap-2">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-shrink-0">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
              i === indicatorIndex ? 'gold-gradient text-black' :
              i < indicatorIndex ? 'bg-green-500/20 text-green-400' :
              'bg-white/5 text-white/30'
            }`}>
              {i < indicatorIndex ? <Check size={10} /> : <span>{i + 1}</span>}
              <span>{label}</span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`h-px w-4 sm:w-8 flex-shrink-0 transition-all ${i < indicatorIndex ? 'bg-green-500/40' : 'bg-white/10'}`} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
        >
          {/* Step 0: Tipo */}
          {step === 0 && (
            <div className="space-y-6">
              <h2 className="text-lg sm:text-xl font-bold text-white">Qual o tipo do evento?</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {eventTypes.map(et => (
                  <motion.button
                    key={et.value}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setTipo(et.value)}
                    className={`glass rounded-2xl p-4 sm:p-6 text-center cursor-pointer transition-all ${
                      tipo === et.value ? 'border-[#c9a84c] glass-gold' : 'hover:border-white/20'
                    }`}
                  >
                    <div className="text-white font-medium text-sm">{et.label}</div>
                    {tipo === et.value && <Check size={16} className="text-[#c9a84c] mx-auto mt-2" />}
                  </motion.button>
                ))}
              </div>
              <Button onClick={() => tipo && setStep(1)} disabled={!tipo} className="w-full sm:w-auto">
                Continuar <ChevronRight size={16} />
              </Button>
            </div>
          )}

          {/* Step 1: Dados */}
          {step === 1 && (
            <div className="space-y-4 w-full max-w-xl">
              <h2 className="text-lg sm:text-xl font-bold text-white">Dados do evento</h2>
              <Input label="Nome do evento" placeholder="Ex: Casamento João e Maria" error={form2.formState.errors.nome_evento?.message} {...form2.register('nome_evento')} />
              <Input label="Data" type="date" error={form2.formState.errors.data?.message} {...form2.register('data')} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Horário início" type="time" error={form2.formState.errors.horario_inicio?.message} {...form2.register('horario_inicio')} />
                <Input label="Horário fim" type="time" error={form2.formState.errors.horario_fim?.message} {...form2.register('horario_fim')} />
              </div>
              <Input label="Quantidade de pessoas" type="number" placeholder="Ex: 200" error={form2.formState.errors.quantidade_pessoas?.message} {...form2.register('quantidade_pessoas')} />
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep(0)} className="flex-1 sm:flex-none">Voltar</Button>
                <Button onClick={handleNext} className="flex-1 sm:flex-none">Continuar <ChevronRight size={16} /></Button>
              </div>
            </div>
          )}

          {/* Step 2: Local */}
          {step === 2 && (
            <div className="space-y-4 w-full max-w-xl">
              <h2 className="text-lg sm:text-xl font-bold text-white">Local do evento</h2>
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
              <div className="grid grid-cols-2 gap-3">
                <Input label="Número" placeholder="123" error={form3.formState.errors.numero?.message} {...form3.register('numero')} />
                <Input label="Complemento" placeholder="Apto, Bloco..." {...form3.register('complemento')} />
              </div>
              <Input label="Bairro" error={form3.formState.errors.bairro?.message} {...form3.register('bairro')} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Cidade" error={form3.formState.errors.cidade?.message} {...form3.register('cidade')} />
                <Input label="Estado" placeholder="SP" error={form3.formState.errors.estado?.message} {...form3.register('estado')} />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 sm:flex-none">Voltar</Button>
                <Button onClick={handleNext} className="flex-1 sm:flex-none">Continuar <ChevronRight size={16} /></Button>
              </div>
            </div>
          )}

          {/* Step 3: Aniversariante (condicional) */}
          {step === 3 && (
            <div className="space-y-4 w-full max-w-xl">
              {tipo && SEMPRE_ANIVERSARIANTE.includes(tipo) ? (
                // Já sabemos que tem aniversariante — pede direto as infos
                <>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Dados do aniversariante</h2>
                  <Input label="Nome do aniversariante" placeholder="Nome completo" value={nomeAniversariante} onChange={e => setNomeAniversariante(e.target.value)} />
                  <Input label="Idade" type="number" placeholder="Ex: 15" value={idadeAniversariante} onChange={e => setIdadeAniversariante(e.target.value)} />
                </>
              ) : (
                // Pergunta sim/não (para tipos ambíguos — não deve chegar aqui com a lógica atual)
                <>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Tem aniversariante?</h2>
                  <div className="flex gap-3">
                    {[true, false].map(v => (
                      <button
                        key={String(v)}
                        onClick={() => setPossuiAniversariante(v)}
                        className={`flex-1 glass rounded-xl py-4 text-center font-medium transition-all cursor-pointer ${
                          possuiAniversariante === v ? 'glass-gold text-[#c9a84c]' : 'text-white/60 hover:text-white'
                        }`}
                      >
                        {v ? 'Sim' : 'Não'}
                      </button>
                    ))}
                  </div>
                  {possuiAniversariante && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <Input label="Nome do aniversariante" placeholder="Nome completo" value={nomeAniversariante} onChange={e => setNomeAniversariante(e.target.value)} />
                      <Input label="Idade" type="number" placeholder="Ex: 15" value={idadeAniversariante} onChange={e => setIdadeAniversariante(e.target.value)} />
                    </motion.div>
                  )}
                </>
              )}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1 sm:flex-none">Voltar</Button>
                <Button onClick={() => setStep(4)} className="flex-1 sm:flex-none">Continuar <ChevronRight size={16} /></Button>
              </div>
            </div>
          )}

          {/* Step 4: Serviços */}
          {step === 4 && (
            <div className="flex flex-col gap-6">
              {/* Cart summary */}
              <div className="glass-gold rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={18} className="text-[#c9a84c]" />
                  <h3 className="text-white font-bold">Resumo do pedido</h3>
                </div>
                {cart.length === 0 ? (
                  <p className="text-white/40 text-sm text-center py-2">Nenhum serviço adicionado</p>
                ) : (
                  <div className="space-y-2">
                    {cart.map(item => (
                      <div key={item.produto.id} className="flex items-center justify-between text-sm">
                        <span className="text-white/70 truncate flex-1">{item.produto.nome}</span>
                        <span className="text-white/50 ml-2">x{item.quantidade}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="border-t border-white/10 pt-3">
                  <p className="text-white/40 text-xs text-center">O valor será apresentado após a confirmação.</p>
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

              {/* Lista de serviços */}
              <div className="space-y-4">
                <h2 className="text-lg sm:text-xl font-bold text-white">Selecione os serviços</h2>
                <ProductSearch
                  products={products ?? []}
                  onSelect={addToCart}
                  placeholder="Buscar serviço... ex: DJ, foto, brinquedos"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {products?.map(product => {
                    const inCart = cart.find(i => i.produto.id === product.id)
                    return (
                      <motion.div
                        key={product.id}
                        whileTap={{ scale: 0.98 }}
                        className={`glass rounded-xl p-3 sm:p-4 transition-all ${inCart ? 'border-[#c9a84c]/40' : ''}`}
                      >
                        <div className="flex gap-3">
                          <img
                            src={product.imagens?.[0]?.url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=100&q=80'}
                            alt={product.nome}
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm truncate">{product.nome}</p>
                            <p className="text-white/50 text-xs line-clamp-2">{product.descricao}</p>
                          </div>
                        </div>
                        {inCart ? (
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-3">
                              <button onClick={() => updateQty(product.id, inCart.quantidade - 1)} className="w-8 h-8 glass rounded-full flex items-center justify-center text-white hover:bg-white/10 cursor-pointer">
                                <Minus size={13} />
                              </button>
                              <span className="text-white font-medium w-6 text-center">{inCart.quantidade}</span>
                              <button onClick={() => updateQty(product.id, inCart.quantidade + 1)} className="w-8 h-8 glass rounded-full flex items-center justify-center text-white hover:bg-white/10 cursor-pointer">
                                <Plus size={13} />
                              </button>
                            </div>
                            <span className="text-green-400 text-xs font-medium">Adicionado</span>
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
                <Button variant="outline" onClick={() => {
                  // Voltar: se tipo nunca tem aniversariante, volta para local; senão volta para step 3
                  if (tipo && NUNCA_ANIVERSARIANTE.includes(tipo)) setStep(2)
                  else setStep(3)
                }} className="w-full sm:w-auto">Voltar</Button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
