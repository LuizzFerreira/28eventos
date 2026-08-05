import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productService } from '@/services/product.service'
import { toast } from 'sonner'
import { Trash2, Star, Loader, Plus, Video, Link, Upload } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface Props {
  productId: string
}

type Tab = 'upload-img' | 'link-img' | 'link-video'

export function ImageManager({ productId }: Props) {
  const queryClient = useQueryClient()
  const [isUploading, setIsUploading] = useState(false)
  const [tab, setTab] = useState<Tab | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')

  const { data: product } = useQuery({
    queryKey: ['admin-product', productId],
    queryFn: () => productService.getProduct(productId),
  })

  const images = [...(product?.imagens ?? [])].sort((a, b) => a.ordem - b.ordem)
  const videos = product?.videos ?? []

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin-product', productId] })
    queryClient.invalidateQueries({ queryKey: ['admin-products'] })
  }

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.deleteProductImage(id),
    onSuccess: () => { invalidate(); toast.success('Imagem removida.') },
    onError: () => toast.error('Erro ao remover imagem.'),
  })

  const destaqueMutation = useMutation({
    mutationFn: (id: string) => productService.setDestaqueImage(productId, id),
    onSuccess: () => { invalidate(); toast.success('Imagem de destaque definida!') },
  })

  const addImageUrlMutation = useMutation({
    mutationFn: async (url: string) => {
      const ordem = images.length === 0 ? 0 : 1
      await productService.createProductImage(productId, url, ordem)
    },
    onSuccess: () => { invalidate(); setImageUrl(''); setTab(null); toast.success('Imagem adicionada!') },
  })

  const removeVideoMutation = useMutation({
    mutationFn: async (url: string) => {
      await productService.updateProduct(productId, { videos: videos.filter(v => v !== url) })
    },
    onSuccess: () => { invalidate(); toast.success('Vídeo removido.') },
  })

  const addVideoMutation = useMutation({
    mutationFn: async (url: string) => {
      await productService.updateProduct(productId, { videos: [...videos, url] })
    },
    onSuccess: () => { invalidate(); setVideoUrl(''); setTab(null); toast.success('Vídeo adicionado!') },
  })

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setIsUploading(true)
    try {
      for (const file of files) {
        const url = await productService.uploadImage(file)
        const ordem = images.length === 0 ? 0 : 1
        await productService.createProductImage(productId, url, ordem)
      }
      invalidate()
      toast.success(`${files.length} imagem(ns) enviada(s)!`)
    } catch {
      toast.error('Falha no upload.')
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-4 pt-4 border-t border-white/5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-white/80 font-semibold text-sm">Mídia do produto</h3>
        <div className="flex gap-3">
          <button type="button" onClick={() => setTab(t => t === 'upload-img' ? null : 'upload-img')}
            className={`flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${tab === 'upload-img' ? 'text-[#c9a84c]' : 'text-white/50 hover:text-[#c9a84c]'}`}>
            <Upload size={13} /> Upload arquivo
          </button>
          <button type="button" onClick={() => setTab(t => t === 'link-img' ? null : 'link-img')}
            className={`flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${tab === 'link-img' ? 'text-[#c9a84c]' : 'text-white/50 hover:text-[#c9a84c]'}`}>
            <Link size={13} /> Link imagem
          </button>
          <button type="button" onClick={() => setTab(t => t === 'link-video' ? null : 'link-video')}
            className={`flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${tab === 'link-video' ? 'text-[#c9a84c]' : 'text-white/50 hover:text-[#c9a84c]'}`}>
            <Video size={13} /> Link vídeo
          </button>
        </div>
      </div>

      {/* Upload arquivo */}
      {tab === 'upload-img' && (
        <label className="flex items-center gap-3 glass rounded-xl px-4 py-3 cursor-pointer hover:border-[#c9a84c]/40 transition-colors">
          {isUploading ? <Loader size={16} className="animate-spin text-[#c9a84c]" /> : <Upload size={16} className="text-white/50" />}
          <span className="text-white/60 text-sm">{isUploading ? 'Enviando...' : 'Selecionar imagens do computador'}</span>
          <input type="file" accept="image/*" multiple className="sr-only" onChange={handleUpload} disabled={isUploading} />
        </label>
      )}

      {/* Link imagem */}
      {tab === 'link-img' && (
        <div className="flex gap-2">
          <Input placeholder="https://site.com/imagem.jpg" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
          <Button type="button" size="sm" onClick={() => imageUrl && addImageUrlMutation.mutate(imageUrl)} loading={addImageUrlMutation.isPending}>
            <Plus size={14} />
          </Button>
        </div>
      )}

      {/* Link vídeo */}
      {tab === 'link-video' && (
        <div className="flex gap-2">
          <Input placeholder="https://youtube.com/watch?v=..." value={videoUrl} onChange={e => setVideoUrl(e.target.value)} />
          <Button type="button" size="sm" onClick={() => videoUrl && addVideoMutation.mutate(videoUrl)} loading={addVideoMutation.isPending}>
            <Plus size={14} />
          </Button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {images.map(img => {
          const isDestaque = img.ordem === 0
          return (
            <div key={img.id} className="relative aspect-square group">
              <img src={img.url} alt="" className={`w-full h-full object-cover rounded-lg ${isDestaque ? 'ring-2 ring-[#c9a84c]' : ''}`} />
              {isDestaque && (
                <div className="absolute top-1 left-1 bg-[#c9a84c] rounded-full p-0.5">
                  <Star size={10} className="text-black fill-black" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                {!isDestaque && (
                  <button type="button" onClick={() => destaqueMutation.mutate(img.id)} title="Definir como destaque"
                    className="text-[#c9a84c] hover:scale-110 transition-transform cursor-pointer">
                    <Star size={16} />
                  </button>
                )}
                <button type="button" onClick={() => deleteMutation.mutate(img.id)}
                  className="text-white/70 hover:text-red-400 transition-colors cursor-pointer">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )
        })}

        {videos.map((v, i) => (
          <div key={i} className="relative aspect-square group bg-black/40 rounded-lg flex items-center justify-center">
            <Video size={24} className="text-[#c9a84c]" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <button type="button" onClick={() => removeVideoMutation.mutate(v)}
                className="text-white/70 hover:text-red-400 transition-colors cursor-pointer">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-white/30 text-xs">
        Passe o mouse sobre uma imagem e clique em ⭐ para definir como destaque. A imagem destaque aparece na frente.
      </p>
    </div>
  )
}
