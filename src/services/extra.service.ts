import { supabase } from '@/lib/supabase'
import type { Notification, Message, GuestRSVP, EventChecklist } from '@/types'

export const notificationService = {
  async getNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notificacoes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as Notification[]
  },

  async markAsRead(id: string) {
    const { error } = await supabase
      .from('notificacoes')
      .update({ lida: true })
      .eq('id', id)
    if (error) throw error
  },

  async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from('notificacoes')
      .update({ lida: true })
      .eq('user_id', userId)
    if (error) throw error
  },
}

export const messageService = {
  async getMessages(eventoId: string) {
    const { data, error } = await supabase
      .from('mensagens')
      .select('*, profiles(nome, avatar_url, role)')
      .eq('evento_id', eventoId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data as Message[]
  },

  async sendMessage(eventoId: string, userId: string, conteudo: string) {
    const { data, error } = await supabase
      .from('mensagens')
      .insert({ evento_id: eventoId, user_id: userId, conteudo })
      .select('*, profiles(nome, avatar_url, role)')
      .single()
    if (error) throw error
    return data as Message
  },

  subscribeToMessages(eventoId: string, callback: (msg: Message) => void) {
    return supabase
      .channel(`messages:${eventoId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'mensagens',
        filter: `evento_id=eq.${eventoId}`,
      }, (payload) => callback(payload.new as Message))
      .subscribe()
  },
}

export const guestService = {
  async getGuests(eventoId: string) {
    const { data, error } = await supabase
      .from('convidados')
      .select('*')
      .eq('evento_id', eventoId)
      .order('nome')
    if (error) throw error
    return data as GuestRSVP[]
  },

  async addGuest(guest: Omit<GuestRSVP, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('convidados')
      .insert(guest)
      .select()
      .single()
    if (error) throw error
    return data as GuestRSVP
  },

  async updateRSVP(id: string, confirmado: boolean) {
    const { error } = await supabase
      .from('convidados')
      .update({ confirmado })
      .eq('id', id)
    if (error) throw error
  },

  async removeGuest(id: string) {
    const { error } = await supabase.from('convidados').delete().eq('id', id)
    if (error) throw error
  },
}

export const checklistService = {
  async getChecklist(eventoId: string) {
    const { data, error } = await supabase
      .from('checklist')
      .select('*')
      .eq('evento_id', eventoId)
      .order('ordem')
    if (error) throw error
    return data as EventChecklist[]
  },

  async addItem(item: Omit<EventChecklist, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('checklist')
      .insert(item)
      .select()
      .single()
    if (error) throw error
    return data as EventChecklist
  },

  async toggleItem(id: string, concluido: boolean) {
    const { error } = await supabase
      .from('checklist')
      .update({ concluido })
      .eq('id', id)
    if (error) throw error
  },

  async removeItem(id: string) {
    const { error } = await supabase.from('checklist').delete().eq('id', id)
    if (error) throw error
  },
}

export const favoriteService = {
  async getFavorites(userId: string) {
    const { data, error } = await supabase
      .from('favoritos')
      .select('*, produtos(*, imagens(*), categorias(*))')
      .eq('user_id', userId)
    if (error) throw error
    return data
  },

  async toggle(userId: string, produtoId: string) {
    const { data: existing } = await supabase
      .from('favoritos')
      .select('id')
      .eq('user_id', userId)
      .eq('produto_id', produtoId)
      .single()

    if (existing) {
      await supabase.from('favoritos').delete().eq('id', existing.id)
      return false
    } else {
      await supabase.from('favoritos').insert({ user_id: userId, produto_id: produtoId })
      return true
    }
  },
}
