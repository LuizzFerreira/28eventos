import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productService } from '@/services/product.service'
import { toast } from 'sonner'
import { Upload, Trash2, Image as ImageIcon, Loader } from 'lucide-react'

interface ImageManagerProps {
  productId: string
}

export function ImageManager({ productId }: ImageManagerProps) {
  const queryClient = useQueryClient()
  const [isUploading, setIsUploading] = useState(false)

  const { data: product } = useQuery({
    queryKey: ['admin-product', productId],
    queryFn: () => productService.getProduct(productId),
  })

  const deleteImageMutation = useMutation({
    mutationFn: (id: string) => productService.deleteProductImage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-product', productId] })
      queryClient.invalidateQueries({ queryKey: ['admin-products'] }) // To update thumbnail in table
      toast.success('Imagem removida.')
    },
    onError: () => toast.error('Erro ao remover imagem.'),
  })

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const url = await productService.uploadImage(file)
      await productService.createProductImage(productId, url)
      queryClient.invalidateQueries({ queryKey: ['admin-product', productId] })
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      toast.success('Imagem enviada!')
    } catch (err) {
      toast.error('Falha no upload da imagem.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4 pt-4">
      <h3 className="text-white/80 font-semibold text-sm">Imagens</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {product?.imagens?.map(img => (
          <div key={img.id} className="relative aspect-square group">
            <img src={img.url} alt="Produto" className="w-full h-full object-cover rounded-lg" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={() => deleteImageMutation.mutate(img.id)}
                className="text-white/70 hover:text-red-400 p-2"
                disabled={deleteImageMutation.isPending}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        <label className="aspect-square rounded-lg border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-white/40 hover:bg-white/5 hover:border-white/40 transition-colors cursor-pointer">
          {isUploading ? (
            <Loader size={20} className="animate-spin" />
          ) : (
            <>
              <Upload size={20} />
              <span className="text-xs mt-1 text-center">Adicionar</span>
            </>
          )}
          <input type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} disabled={isUploading} />
        </label>
      </div>
      {product?.imagens?.length === 0 && (
         <div className="text-center text-white/30 text-sm py-4">
            <ImageIcon size={24} className="mx-auto mb-2" />
            Nenhuma imagem.
        </div>
      )}
    </div>
  )
}
