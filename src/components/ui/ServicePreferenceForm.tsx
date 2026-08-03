import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Save, Check, Sparkles } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { preferenceService } from '@/services/extra.service'
import { getConfigForCategory } from '@/config/servicePreferences'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import type { EventItem } from '@/types'

interface Props {
  item: EventItem
}

export function ServicePreferenceForm({ item }: Props) {
  const categoryName = item.produto?.categoria?.nome ?? ''
  console.log('[Preference] produto:', item.produto?.nome, '| categoria:', categoryName)
  const config = getConfigForCategory(categoryName)
  console.log('[Preference] config encontrado:', !!config)
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [answers, setAnswers] = useState<Record<string, unknown>>({})

  const { data: saved } = useQuery({
    queryKey: ['preferences', item.id],
    queryFn: () => preferenceService.get(item.id),
    enabled: open,
  })

  useEffect(() => {
    if (saved) setAnswers(saved)
  }, [saved])

  const saveMutation = useMutation({
    mutationFn: () => preferenceService.save(item.id, answers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences', item.id] })
      toast.success('Preferências salvas!')
    },
  })

  if (!config) return null

  function setField(key: string, value: unknown) {
    setAnswers(prev => ({ ...prev, [key]: value }))
  }

  function toggleMulti(key: string, option: string) {
    const current = (answers[key] as string[]) ?? []
    setField(key, current.includes(option) ? current.filter(v => v !== option) : [...current, option])
  }

  function toggleNested(key: string, parent: string, sub?: string) {
    const current = (answers[key] as Record<string, string[]>) ?? {}
    if (!sub) {
      if (current[parent] !== undefined) {
        const next = { ...current }
        delete next[parent]
        setField(key, next)
      } else {
        setField(key, { ...current, [parent]: [] })
      }
    } else {
      const subs = current[parent] ?? []
      setField(key, {
        ...current,
        [parent]: subs.includes(sub) ? subs.filter(s => s !== sub) : [...subs, sub],
      })
    }
  }

  const summaryLines: string[] = []
  for (const field of config.fields) {
    if (field.summaryFn && answers[field.key] !== undefined) {
      const result = field.summaryFn(answers[field.key], answers)
      if (result) summaryLines.push(...result.split('\n'))
    }
  }

  const hasAnswers = Object.keys(answers).some(k => {
    const v = answers[k]
    if (Array.isArray(v)) return v.length > 0
    if (typeof v === 'object' && v !== null) return Object.keys(v).length > 0
    return v !== '' && v !== undefined && v !== null
  })

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/3 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="text-white/80 text-sm font-medium">{item.produto?.nome}</span>
          {hasAnswers && <span className="w-2 h-2 rounded-full bg-[#c9a84c]" />}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/30 text-xs">{categoryName}</span>
          {open ? <ChevronUp size={14} className="text-white/40" /> : <ChevronDown size={14} className="text-white/40" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 space-y-5 border-t border-white/5">
              {config.fields.map(field => (
                <div key={field.key}>
                  <label className="text-white/70 text-sm font-medium block mb-2">{field.label}</label>
                  {field.hint && <p className="text-white/30 text-xs mb-2">{field.hint}</p>}

                  {field.type === 'text' && (
                    <textarea
                      value={(answers[field.key] as string) ?? ''}
                      onChange={e => setField(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={2}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#c9a84c]/50 resize-none"
                    />
                  )}

                  {field.type === 'number' && (
                    <input
                      type="number"
                      value={(answers[field.key] as string) ?? ''}
                      onChange={e => setField(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#c9a84c]/50"
                    />
                  )}

                  {field.type === 'select' && (
                    <div className="flex flex-wrap gap-2">
                      {field.options?.map(opt => {
                        const selected = answers[field.key] === opt
                        return (
                          <button
                            key={opt}
                            onClick={() => setField(field.key, selected ? '' : opt)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                              selected ? 'bg-[#c9a84c] text-black' : 'glass text-white/60 hover:text-white'
                            }`}
                          >
                            {selected && <Check size={10} className="inline mr-1" />}{opt}
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {field.type === 'multiselect' && (
                    <div className="flex flex-wrap gap-2">
                      {field.options?.map(opt => {
                        const selected = ((answers[field.key] as string[]) ?? []).includes(opt)
                        return (
                          <button
                            key={opt}
                            onClick={() => toggleMulti(field.key, opt)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                              selected ? 'bg-[#c9a84c] text-black' : 'glass text-white/60 hover:text-white'
                            }`}
                          >
                            {selected && <Check size={10} className="inline mr-1" />}{opt}
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {field.type === 'multiselect_nested' && (
                    <div className="space-y-2">
                      {field.nestedOptions?.map(opt => {
                        const nested = (answers[field.key] as Record<string, string[]>) ?? {}
                        const parentSelected = nested[opt.label] !== undefined
                        return (
                          <div key={opt.label}>
                            <button
                              onClick={() => toggleNested(field.key, opt.label)}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                                parentSelected ? 'bg-[#c9a84c] text-black' : 'glass text-white/60 hover:text-white'
                              }`}
                            >
                              {parentSelected && <Check size={10} className="inline mr-1" />}{opt.label}
                            </button>

                            {parentSelected && opt.suboptions && opt.suboptions.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-wrap gap-1.5 mt-2 ml-3"
                              >
                                {opt.suboptions.map(sub => {
                                  const subSelected = nested[opt.label]?.includes(sub)
                                  return (
                                    <button
                                      key={sub}
                                      onClick={() => toggleNested(field.key, opt.label, sub)}
                                      className={`px-2.5 py-1 rounded-full text-xs transition-all cursor-pointer ${
                                        subSelected ? 'bg-[#c9a84c]/30 text-[#c9a84c] border border-[#c9a84c]/50' : 'bg-white/5 text-white/50 hover:text-white border border-white/10'
                                      }`}
                                    >
                                      {sub}
                                    </button>
                                  )
                                })}
                              </motion.div>
                            )}

                            {parentSelected && opt.label === 'Outros' && (
                              <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-2 ml-3"
                              >
                                <textarea
                                  value={(answers[`${field.key}_outros`] as string) ?? ''}
                                  onChange={e => setField(`${field.key}_outros`, e.target.value)}
                                  placeholder="Ex: Mojito — rum, hortelã, limão, açúcar, água com gás"
                                  rows={2}
                                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#c9a84c]/50 resize-none"
                                />
                              </motion.div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}

              {summaryLines.length > 0 && (
                <div className="bg-[#c9a84c]/10 border border-[#c9a84c]/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-[#c9a84c]" />
                    <span className="text-[#c9a84c] text-xs font-semibold">Lista de compras estimada</span>
                  </div>
                  {summaryLines.map((line, i) => (
                    <p key={i} className="text-white/70 text-xs leading-relaxed">{line}</p>
                  ))}
                </div>
              )}

              <Button size="sm" onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>
                <Save size={13} /> Salvar preferências
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
