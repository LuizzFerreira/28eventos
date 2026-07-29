import { supabase } from '@/lib/supabase'
import type { Event, EventFormData, EventItem } from '@/types'

export async function sendQuoteEmail(event: Event, clientName: string, clientEmail: string) {
  const items = (event.itens ?? []).map(i => ({
    nome: i.produto?.nome ?? '',
    quantidade: i.quantidade,
    subtotal: i.subtotal,
  }))
  await supabase.functions.invoke('send-quote-email', {
    body: { event, items, clientName, clientEmail },
  })
}

export const eventService = {
  async getMyEvents(userId: string) {
    const { data, error } = await supabase
      .from('eventos')
      .select('*, evento_itens(*, produtos(*, imagens(*), categorias(*)))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).map((e: any) => ({
      ...e,
      itens: (e.evento_itens ?? []).map((i: any) => ({
        ...i,
        produto: i.produtos
          ? { ...i.produtos, categoria: i.produtos.categorias ?? null }
          : null,
      })),
    })) as Event[]
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
      .select('*, profiles(nome, email, avatar_url), evento_itens(*, produtos(nome, preco, categorias(nome)), evento_item_preferencias(respostas))')
      .order('created_at', { ascending: false })
    if (error) throw error
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).map((e: any) => ({
      ...e,
      itens: (e.evento_itens ?? []).map((i: any) => ({
        ...i,
        produto: i.produtos ? { ...i.produtos, categoria: i.produtos.categorias ?? null } : null,
        preferencias: i.evento_item_preferencias?.respostas ?? null,
      })),
    }))
  },

  async updateStatus(id: string, status: Event['status']) {
    const { error } = await supabase
      .from('eventos')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  },

  async getEventWithItems(id: string) {
    const { data, error } = await supabase
      .from('eventos')
      .select('*, evento_itens(*, produtos(nome, preco))')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as Event
  },
}
