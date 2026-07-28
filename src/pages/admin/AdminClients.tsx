import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { profileService } from '@/services/profile.service'
import { Skeleton } from '@/components/ui/Badge'
import { formatDate } from '@/utils/cn'
import { Users, Search } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { useState } from 'react'
import type { UserProfile } from '@/types'

export default function AdminClients() {
  const [search, setSearch] = useState('')

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: profileService.getAllProfiles,
  })

  const clients = profiles?.filter(p => p.role === 'cliente')
  const filtered = clients?.filter(p =>
    !search ||
    p.nome?.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black text-white">Clientes</h1>
        <p className="text-white/50 mt-1">{clients?.length || 0} clientes cadastrados</p>
      </motion.div>

      <Input placeholder="Buscar cliente..." value={search} onChange={e => setSearch(e.target.value)} icon={<Search size={16} />} />

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Cliente', 'E-mail', 'Telefone', 'Cidade', 'Cadastro'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? [...Array(6)].map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-4 py-3"><Skeleton className="h-8 w-full" /></td></tr>
                ))
                : filtered?.map((profile: UserProfile) => (
                  <motion.tr
                    key={profile.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.nome}&background=c9a84c&color=000`}
                          alt={profile.nome || ''}
                          className="w-8 h-8 rounded-full"
                        />
                        <p className="text-white font-medium text-sm">{profile.nome || '—'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/60 text-sm">{profile.email}</td>
                    <td className="px-4 py-3 text-white/60 text-sm">{profile.telefone || '—'}</td>
                    <td className="px-4 py-3 text-white/60 text-sm">
                      {profile.cidade ? `${profile.cidade}, ${profile.estado}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-white/60 text-sm">{formatDate(profile.created_at)}</td>
                  </motion.tr>
                ))
              }
            </tbody>
          </table>
        </div>
        {!isLoading && filtered?.length === 0 && (
          <div className="text-center py-12">
            <Users size={40} className="text-white/10 mx-auto mb-3" />
            <p className="text-white/40">Nenhum cliente encontrado.</p>
          </div>
        )}
      </div>
    </div>
  )
}
