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

export function ImageManager({ productId }: Props) {
  const queryClient = useQueryClient()
  const [isUploading, setIsUploading] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [showVideoInput, setShowVideoInput] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [showImageUrlInput, setShowImageUrlInput] = useState(false)

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

  const removeVideoMutation = useMutation({
    mutationFn: async (url: string) => {
      const newVideos = videos.filter(v => v !== url)
      await productService.updateProduct(productId, { videos: newVideos })
    },
    onSuccess: () => { invalidate(); toast.success('Vídeo removido.') },
  })

  const addImageUrlMutation = useMutation({
    mutationFn: async (url: string) => {
      const ordem = images.length === 0 ? 0 : 1
      await productService.createProductImage(productId, url, ordem)
    },
    onSuccess: () => { invalidate(); setImageUrl(''); setShowImageUrlInput(false); toast.success('Imagem adicionada!') },
  })

  const addVideoMutation = useMutation({
    mutationFn: async (url: string) => {
      await productService.updateProduct(productId, { videos: [...videos, url] })
    },
    onSuccess: () => { invalidate(); setVideoUrl(''); setShowVideoInput(false); toast.success('Vídeo adicionado!') },
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
      <div className="flex items-center justify-between">
        <h3 className="text-white/80 font-semibold text-sm">Mídia do produto</h3>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => { setShowImageUrlInput(v => !v); setShowVideoInput(false) }}
            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-[#c9a84c] transition-colors cursor-pointer"
          >
            <Link size={13} /> Link de imagem
          </button>
          <button
            type="button"
            onClick={() => { setShowVideoInput(v => !v); setShowImageUrlInput(false) }}
            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-[#c9a84c] transition-colors cursor-pointer"
          >
            <Video size={13} /> Link de vídeo
          </button>
        </div>
      </div>

      {/* Image URL input */}
      {showImageUrlInput && (
        <div className="flex gap-2">
          <Input
            placeholder="URL da imagem (ex: https://site.com/foto.jpg)"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
          />
          <Button
            type="button"
            size="sm"
            onClick={() => imageUrl && addImageUrlMutation.mutate(imageUrl)}
            loading={addImageUrlMutation.isPending}
          >
            <Plus size={14} />
          </Button>
        </div>
      )}

      {/* Video input */}
      {showVideoInput && (
        <div className="flex gap-2">
          <Input
            placeholder="URL do YouTube (ex: https://youtube.com/watch?v=...)"
            value={videoUrl}
            onChange={e => setVideoUrl(e.target.value)}
          />
          <Button
            type="button"
            size="sm"
            onClick={() => videoUrl && addVideoMutation.mutate(videoUrl)}
            loading={addVideoMutation.isPending}
          >
            <Plus size={14} />
          </Button>
        </div>
      )}

      {/* Images grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {images.map(img => {
          const isDestaque = img.ordem === 0
          return (
            <div key={img.id} className="relative aspect-square group">
              <img src={img.url} alt="" className={`w-full h-full object-cover rounded-lg transition-all ${isDestaque ? 'ring-2 ring-[#c9a84c]' : ''}`} />
              {isDestaque && (
                <div className="absolute top-1 left-1 bg-[#c9a84c] rounded-full p-0.5">
                  <Star size={10} className="text-black fill-black" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                {!isDestaque && (
                  <button
                    type="button"
                    onClick={() => destaqueMutation.mutate(img.id)}
                    title="Definir como destaque"
                    className="text-[#c9a84c] hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star size={16} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(img.id)}
                  className="text-white/70 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )
        })}

        {/* Videos */}
        {videos.map((v, i) => (
          <div key={i} className="relative aspect-square group bg-black/40 rounded-lg flex items-center justify-center">
            <Video size={24} className="text-[#c9a84c]" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <button
                type="button"
                onClick={() => removeVideoMutation.mutate(v)}
                className="text-white/70 hover:text-red-400 transition-colors cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {/* Upload button */}
        <label className="aspect-square rounded-lg border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-white/40 hover:bg-white/5 hover:border-white/40 transition-colors cursor-pointer">
          {isUploading ? (
            <Loader size={20} className="animate-spin" />
          ) : (
            <>
              <Upload size={20} />
              <span className="text-xs mt-1 text-center">Upload</span>
            </>
          )}
          <input type="file" accept="image/*" multiple className="sr-only" onChange={handleUpload} disabled={isUploading} />
        </label>
      </div>

      <p className="text-white/30 text-xs">
        Clique na <Star size={10} className="inline text-[#c9a84c]" /> para definir a imagem de destaque (aparece na frente). Você pode enviar várias imagens de uma vez.
      </p>
    </div>
  )
}
