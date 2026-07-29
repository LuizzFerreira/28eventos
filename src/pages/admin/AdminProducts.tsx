import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productService, categoryService } from '@/services/product.service'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Badge'
import { formatCurrency } from '@/utils/cn'
import { Plus, Pencil, Trash2, Search, Star, EyeOff, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import type { Product } from '@/types'

import { ImageManager } from '@/components/admin/ImageManager'

export default function AdminProducts() {
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const queryClient = useQueryClient()

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: productService.getAllAdmin,
  })

  const { data: categories } = useQuery({
    queryKey: ['categories-admin'],
    queryFn: categoryService.getAllAdmin,
  })

  const { register, handleSubmit, reset, setValue } = useForm<Omit<Product, 'id' | 'created_at' | 'categoria' | 'imagens'>>()

  const createMutation = useMutation({
    mutationFn: (data: Omit<Product, 'id' | 'created_at' | 'categoria' | 'imagens'>) =>
      productService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      toast.success('Produto criado!')
      setModalOpen(false)
      reset()
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: Omit<Product, 'id' | 'created_at' | 'categoria' | 'imagens'>) =>
      productService.updateProduct(editing!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      toast.success('Produto atualizado!')
      setModalOpen(false)
      setEditing(null)
      reset()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await productService.deleteProductImages(id)
      await productService.deleteProduct(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      toast.success('Produto removido!')
    },
  })

  const toggleAtivoMutation = useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) =>
      productService.updateProduct(id, { ativo }),
    onSuccess: (_, { ativo }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success(ativo ? 'Produto visível!' : 'Produto ocultado!')
    },
  })
    setEditing(product)
    setValue('nome', product.nome)
    setValue('descricao', product.descricao || '')
    setValue('preco', product.preco)
    setValue('categoria_id', product.categoria_id || '')
    setValue('ativo', product.ativo)
    setValue('destaque', product.destaque)
    setModalOpen(true)
  }

  function openCreate() {
    setEditing(null)
    reset()
    setModalOpen(true)
  }

  function onSubmit(data: Omit<Product, 'id' | 'created_at' | 'categoria' | 'imagens'>) {
    if (editing) updateMutation.mutate(data)
    else createMutation.mutate(data)
  }

  const filtered = products?.filter(p =>
    !search || p.nome.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Produtos</h1>
          <p className="text-white/50 mt-1">{products?.length || 0} produtos cadastrados</p>
        </div>
        <Button onClick={openCreate}><Plus size={16} /> Novo produto</Button>
      </motion.div>

      <Input placeholder="Buscar produto..." value={search} onChange={e => setSearch(e.target.value)} icon={<Search size={16} />} />

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Produto', 'Categoria', 'Preço', 'Destaque', 'Status', 'Ações'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? [...Array(6)].map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-3"><Skeleton className="h-8 w-full" /></td></tr>
                ))
                : filtered?.map(product => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.imagens?.[0]?.url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=60&q=80'}
                          alt={product.nome}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-white font-medium text-sm">{product.nome}</p>
                          <p className="text-white/40 text-xs line-clamp-1">{product.descricao}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/70 text-sm">{product.categoria?.nome || '—'}</td>
                    <td className="px-4 py-3 text-[#c9a84c] font-semibold text-sm">{formatCurrency(product.preco)}</td>
                    <td className="px-4 py-3">
                      {product.destaque && <Star size={14} className="text-[#c9a84c] fill-[#c9a84c]" />}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${product.ativo ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {product.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleAtivoMutation.mutate({ id: product.id, ativo: !product.ativo })}
                          title={product.ativo ? 'Ocultar produto' : 'Mostrar produto'}
                          className={`transition-colors cursor-pointer ${product.ativo ? 'text-white/40 hover:text-yellow-400' : 'text-yellow-400 hover:text-white/40'}`}
                        >
                          {product.ativo ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button onClick={() => openEdit(product)} className="text-white/40 hover:text-white transition-colors cursor-pointer">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => deleteMutation.mutate(product.id)} className="text-white/40 hover:text-red-400 transition-colors cursor-pointer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); reset() }} title={editing ? 'Editar produto' : 'Novo produto'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Nome" placeholder="Nome do serviço" {...register('nome')} />
          <Textarea label="Descrição" placeholder="Descreva o serviço..." rows={3} {...register('descricao')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Preço (R$)" type="number" step="0.01" placeholder="0,00" {...register('preco', { valueAsNumber: true })} />
            <Select label="Categoria" {...register('categoria_id')}>
              <option value="">Selecione</option>
              {categories?.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </Select>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('ativo')} className="accent-[#c9a84c]" />
              <span className="text-white/70 text-sm">Ativo</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('destaque')} className="accent-[#c9a84c]" />
              <span className="text-white/70 text-sm">Destaque</span>
            </label>
          </div>
          
          {editing && <ImageManager productId={editing.id} />}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => { setModalOpen(false); reset() }}>Cancelar</Button>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {editing ? 'Salvar' : 'Criar produto'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
