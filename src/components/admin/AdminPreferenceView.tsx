import { Sparkles } from 'lucide-react'
import { getConfigForCategory } from '@/config/servicePreferences'

interface Props {
  itemNome: string
  categoriaNome: string
  preferencias: Record<string, unknown> | null
}

export function AdminPreferenceView({ itemNome, categoriaNome, preferencias }: Props) {
  const config = getConfigForCategory(categoriaNome)

  // Sem config para essa categoria
  if (!config) return null

  // Sem preferências preenchidas ainda
  if (!preferencias || Object.keys(preferencias).length === 0) {
    return (
      <div className="mt-2 px-1">
        <span className="text-white/20 text-xs italic">Preferências ainda não preenchidas pelo cliente</span>
      </div>
    )
  }

  // Calcula resumo inteligente (bartender etc)
  const summaryLines: string[] = []
  for (const field of config.fields) {
    if (field.summaryFn && preferencias[field.key] !== undefined) {
      const result = field.summaryFn(preferencias[field.key], preferencias)
      if (result) summaryLines.push(...result.split('\n'))
    }
  }

  function renderValue(_key: string, value: unknown): string | null {
    if (value === undefined || value === null || value === '') return null
    if (Array.isArray(value)) return value.length ? value.join(', ') : null
    if (typeof value === 'object') {
      // nested: { Caipirinha: ['Limão', 'Morango'], Cerveja: [] }
      const nested = value as Record<string, string[]>
      return Object.entries(nested)
        .map(([k, v]) => v.length ? `${k} (${v.join(', ')})` : k)
        .join(' · ') || null
    }
    return String(value)
  }

  return (
    <div className="mt-3 bg-[#c9a84c]/5 border border-[#c9a84c]/15 rounded-xl p-3 space-y-2">
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles size={12} className="text-[#c9a84c]" />
        <span className="text-[#c9a84c] text-xs font-semibold">Preferências — {itemNome}</span>
      </div>

      {config.fields.map(field => {
        const val = renderValue(field.key, preferencias[field.key])
        if (!val) return null
        return (
          <div key={field.key} className="flex gap-2 text-xs">
            <span className="text-white/40 flex-shrink-0 min-w-[120px]">{field.label}:</span>
            <span className="text-white/80">{val}</span>
          </div>
        )
      })}

      {summaryLines.length > 0 && (
        <div className="mt-2 pt-2 border-t border-[#c9a84c]/10">
          <p className="text-[#c9a84c] text-xs font-semibold mb-1">Resumo de compras estimado</p>
          {summaryLines.map((line, i) => (
            <p key={i} className="text-white/60 text-xs">{line}</p>
          ))}
        </div>
      )}
    </div>
  )
}
