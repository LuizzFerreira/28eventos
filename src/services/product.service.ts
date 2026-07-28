import { supabase } from '@/lib/supabase'
import type { Product, Category } from '@/types'

export const productService = {
  async getProducts(categoryId?: string) {
    let query = supabase
      .from('produtos')
      .select('*, categorias(*), imagens(*)')
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
      .select('*, categorias(*), imagens(*)')
      .eq('ativo', true)
      .eq('destaque', true)
      .limit(8)
    if (error) throw error
    return data as Product[]
  },

  async getProduct(id: string) {
    const { data, error } = await supabase
      .from('produtos')
      .select('*, categorias(*), imagens(*)')
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
      .select('*, categorias(*), imagens(*)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as Product[]
  },
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
