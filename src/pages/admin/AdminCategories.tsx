import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoryService } from '@/services/product.service'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Badge'
import { Plus, Pencil, Tag } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import type { Category } from '@/types'

export default function AdminCategories() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const queryClient = useQueryClient()

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories-admin'],
    queryFn: categoryService.getAllAdmin,
  })

  const { register, handleSubmit, reset, setValue } = useForm<Omit<Category, 'id' | 'created_at'>>()

  const createMutation = useMutation({
    mutationFn: (data: Omit<Category, 'id' | 'created_at'>) => categoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories-admin'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Categoria criada!')
      setModalOpen(false)
      reset()
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: Omit<Category, 'id' | 'created_at'>) =>
      categoryService.updateCategory(editing!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories-admin'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Categoria atualizada!')
      setModalOpen(false)
      setEditing(null)
      reset()
    },
  })

  function openEdit(cat: Category) {
    setEditing(cat)
    setValue('nome', cat.nome)
    setValue('descricao', cat.descricao || '')
    setValue('icone', cat.icone || '')
    setValue('ativo', cat.ativo)
    setModalOpen(true)
  }

  function onSubmit(data: Omit<Category, 'id' | 'created_at'>) {
    if (editing) updateMutation.mutate(data)
    else createMutation.mutate(data)
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Categorias</h1>
          <p className="text-white/50 mt-1">{categories?.length || 0} categorias</p>
        </div>
        <Button onClick={() => { setEditing(null); reset(); setModalOpen(true) }}>
          <Plus size={16} /> Nova categoria
        </Button>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {isLoading
          ? [...Array(10)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
          : categories?.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className={`glass rounded-xl p-4 flex flex-col items-center text-center gap-2 card-hover ${!cat.ativo ? 'opacity-50' : ''}`}
            >
              <Tag size={20} className="text-[#c9a84c]" />
              <p className="text-white font-medium text-sm">{cat.nome}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${cat.ativo ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {cat.ativo ? 'Ativa' : 'Inativa'}
              </span>
              <button
                onClick={() => openEdit(cat)}
                className="text-white/30 hover:text-white transition-colors cursor-pointer"
              >
                <Pencil size={12} />
              </button>
            </motion.div>
          ))
        }
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); reset() }} title={editing ? 'Editar categoria' : 'Nova categoria'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Nome" placeholder="Nome da categoria" {...register('nome')} />
          <Input label="Descrição" placeholder="Descrição opcional" {...register('descricao')} />
          <Input label="Ícone" placeholder="Ex: music, camera..." {...register('icone')} />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('ativo')} defaultChecked className="accent-[#c9a84c]" />
            <span className="text-white/70 text-sm">Ativa</span>
          </label>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => { setModalOpen(false); reset() }}>Cancelar</Button>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {editing ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
