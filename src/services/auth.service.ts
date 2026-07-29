import { supabase } from '@/lib/supabase'

export const authService = {
  async signInWithGoogle() {
    const base = window.location.href.split('#')[0]
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: base },
    })
  },

  async signOut() {
    return supabase.auth.signOut()
  },

  async getSession() {
    return supabase.auth.getSession()
  },

  async getUser() {
    return supabase.auth.getUser()
  },

  onAuthStateChange(callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) {
    return supabase.auth.onAuthStateChange(callback)
  },
}
