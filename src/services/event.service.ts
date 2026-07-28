import { supabase } from '@/lib/supabase'
import type { Event, EventFormData, EventItem } from '@/types'

export const eventService = {
  async getMyEvents(userId: string) {
    const { data, error } = await supabase
      .from('eventos')
      .select('*, evento_itens(*, produtos(*, imagens(*), categorias(*)))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as Event[]
  },

  async getEvent(id: string) {
    const { data, error } = await supabase
      .from('eventos')
      .select('*, evento_itens(*, produtos(*, imagens(*), categorias(*)))')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as Event
  },

  async createEvent(userId: string, formData: EventFormData) {
    const { data, error } = await supabase
      .from('eventos')
      .insert({ ...formData, user_id: userId })
      .select()
      .single()
    if (error) throw error
    return data as Event
  },

  async updateEvent(id: string, updates: Partial<Event>) {
    const { data, error } = await supabase
      .from('eventos')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as Event
  },

  async addItem(item: Omit<EventItem, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('evento_itens')
      .insert(item)
      .select('*, produtos(*, imagens(*))')
      .single()
    if (error) throw error
    return data as EventItem
  },

  async removeItem(id: string) {
    const { error } = await supabase.from('evento_itens').delete().eq('id', id)
    if (error) throw error
  },

  async updateItemQuantity(id: string, quantidade: number, subtotal: number) {
    const { error } = await supabase
      .from('evento_itens')
      .update({ quantidade, subtotal })
      .eq('id', id)
    if (error) throw error
  },

  async getAllEvents() {
    const { data, error } = await supabase
      .from('eventos')
      .select('*, profiles(nome, email, avatar_url), evento_itens(*)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async updateStatus(id: string, status: Event['status']) {
    const { error } = await supabase
      .from('eventos')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  },
}
