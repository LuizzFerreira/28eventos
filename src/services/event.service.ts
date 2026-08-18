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
        preferencias: Array.isArray(i.evento_item_preferencias)
          ? (i.evento_item_preferencias[0]?.respostas ?? null)
          : (i.evento_item_preferencias?.respostas ?? null),
      })),
    }))
  },

  async updateValorPago(id: string, valor_pago: number) {
    const { error } = await supabase
      .from('eventos')
      .update({ valor_pago, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  },

  async updateStatus(id: string, status: Event['status']) {
    const { error } = await supabase
      .from('eventos')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  },

  async confirmEvent(id: string, confirmedItemIds: string[]) {
    // Marca cada item como confirmado ou não
    const allItemIds = confirmedItemIds // só os selecionados chegam aqui
    // Busca todos os itens do evento para marcar os não selecionados como false
    const { data: allItems } = await supabase
      .from('evento_itens')
      .select('id')
      .eq('evento_id', id)

    const updates = (allItems ?? []).map((item: { id: string }) =>
      supabase.from('evento_itens').update({ confirmado: allItemIds.includes(item.id) }).eq('id', item.id)
    )
    await Promise.all(updates)

    // Recalcula valor_total com base nos itens confirmados
    const { data: confirmedItems } = await supabase
      .from('evento_itens')
      .select('subtotal')
      .eq('evento_id', id)
      .in('id', confirmedItemIds)

    const novoTotal = (confirmedItems ?? []).reduce((acc: number, i: { subtotal: number }) => acc + i.subtotal, 0)

    const { error } = await supabase
      .from('eventos')
      .update({ status: 'confirmado', valor_total: novoTotal, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  },

  async updateItemPrice(itemId: string, novoValor: number, quantidade: number) {
    const { error } = await supabase
      .from('evento_itens')
      .update({ valor_unitario: novoValor, subtotal: novoValor * quantidade })
      .eq('id', itemId)
    if (error) throw error
  },

  async deleteEvent(id: string) {
    const { error } = await supabase
      .from('eventos')
      .delete()
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
