import { supabase } from '@/lib/supabase'
import type { Product, Category } from '@/types'

export const productService = {
  async getProducts(categoryId?: string) {
    let query = supabase
      .from('produtos')
      .select('*, categoria:categorias(*), imagens(*)')
      .eq('ativo', true)
      .order('destaque', { ascending: false })
    if (categoryId) query = query.eq('categoria_id', categoryId)
    const { data, error } = await query
    if (error) throw error
    return data as Product[]
  },

  async getFeatured() {
    const { data, error } = await supabase
      .from('produtos')
      .select('*, categoria:categorias(*), imagens(*)')
      .eq('ativo', true)
      .eq('destaque', true)
      .limit(8)
    if (error) throw error
    return data as Product[]
  },

  async getProduct(id: string) {
    const { data, error } = await supabase
      .from('produtos')
      .select('*, categoria:categorias(*), imagens(*)')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as Product
  },

  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'categoria' | 'imagens'>) {
    const { data, error } = await supabase
      .from('produtos')
      .insert(product)
      .select()
      .single()
    if (error) throw error
    return data as Product
  },

  async updateProduct(id: string, updates: Partial<Product>) {
    const { data, error } = await supabase
      .from('produtos')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as Product
  },

  async deleteProduct(id: string) {
    const { error } = await supabase.from('produtos').delete().eq('id', id)
    if (error) throw error
  },

  async getAllAdmin() {
    const { data, error } = await supabase
      .from('produtos')
      .select('*, categoria:categorias(*), imagens(*)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as Product[]
  },

  async uploadImage(file: File) {
    const fileName = `${crypto.randomUUID()}-${file.name}`
    const { data, error } = await supabase
      .storage
      .from('product-images')
      .upload(fileName, file)
    if (error) throw error
    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(data.path)
    return publicUrl
  },

  async createProductImage(produto_id: string, url: string, ordem = 0) {
    const { data, error } = await supabase
      .from('imagens')
      .insert({ produto_id, url, ordem })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteProductImage(id: string) {
    // First get the image url to delete from storage
    const { data: imgData, error: imgErr } = await supabase.from('imagens').select('url').eq('id', id).single()
    if (imgErr) throw imgErr

    const fileName = imgData.url.split('/').pop()
    if (fileName) {
      await supabase.storage.from('product-images').remove([fileName])
    }

    const { error } = await supabase.from('imagens').delete().eq('id', id)
    if (error) throw error
  },

  async setDestaqueImage(produto_id: string, destaque_id: string) {
    // Reset all images ordem to 1, then set the destaque to 0
    const { data: imgs } = await supabase.from('imagens').select('id').eq('produto_id', produto_id)
    if (imgs) {
      for (const img of imgs) {
        await supabase.from('imagens').update({ ordem: img.id === destaque_id ? 0 : 1 }).eq('id', img.id)
      }
    }
  },

  async deleteProductImages(productId: string) {
    const { data: images, error: imgErr } = await supabase.from('imagens').select('url').eq('produto_id', productId)
    if(imgErr) throw imgErr
    
    const fileNames = images.map(i => i.url.split('/').pop()).filter(Boolean) as string[]
    if(fileNames.length > 0) {
      await supabase.storage.from('product-images').remove(fileNames)
    }

    const { error } = await supabase.from('imagens').delete().eq('produto_id', productId)
    if (error) throw error
  }
}

export const categoryService = {
  async getCategories() {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .eq('ativo', true)
      .order('nome')
    if (error) throw error
    return data as Category[]
  },

  async getAllAdmin() {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('nome')
    if (error) throw error
    return data as Category[]
  },

  async createCategory(cat: Omit<Category, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('categorias')
      .insert(cat)
      .select()
      .single()
    if (error) throw error
    return data as Category
  },

  async updateCategory(id: string, updates: Partial<Category>) {
    const { data, error } = await supabase
      .from('categorias')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as Category
  },
}
