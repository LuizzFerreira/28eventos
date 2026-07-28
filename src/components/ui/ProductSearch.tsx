import { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Product } from '@/types'
import { formatCurrency } from '@/utils/cn'

interface Props {
  products: Product[]
  onSelect?: (product: Product) => void
  placeholder?: string
  /** se true, filtra os cards inline ao invés de mostrar dropdown */
  inline?: boolean
  onFilter?: (filtered: Product[]) => void
}

function normalize(str: string) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function ProductSearch({ products, onSelect, placeholder = 'Buscar serviços...', inline, onFilter }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const suggestions = query.length >= 2
    ? products.filter(p =>
        normalize(p.nome).includes(normalize(query)) ||
        normalize(p.descricao ?? '').includes(normalize(query)) ||
        normalize(p.categoria?.nome ?? '').includes(normalize(query))
      ).slice(0, 6)
    : []

  useEffect(() => {
    if (inline && onFilter) {
      const filtered = query.length >= 1
        ? products.filter(p =>
            normalize(p.nome).includes(normalize(query)) ||
            normalize(p.descricao ?? '').includes(normalize(query)) ||
            normalize(p.categoria?.nome ?? '').includes(normalize(query))
          )
        : products
      onFilter(filtered)
    }
  }, [query, products, inline, onFilter])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSelect(product: Product) {
    onSelect?.(product)
    setQuery('')
    setOpen(false)
  }

  function highlight(text: string) {
    if (!query) return text
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, i) =>
      regex.test(part) ? <mark key={i} className="bg-[#c9a84c]/30 text-[#c9a84c] rounded px-0.5">{part}</mark> : part
    )
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full glass rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c9a84c]/50 transition-colors"
        />
        {query && (
          <button onClick={() => { setQuery(''); setOpen(false) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 cursor-pointer">
            <X size={14} />
          </button>
        )}
      </div>

      {!inline && (
        <AnimatePresence>
          {open && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 w-full mt-2 glass rounded-xl overflow-hidden border border-white/10 shadow-xl"
            >
              {suggestions.map(product => (
                <button
                  key={product.id}
                  onClick={() => handleSelect(product)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left cursor-pointer"
                >
                  <img
                    src={product.imagens?.[0]?.url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=60&q=80'}
                    alt={product.nome}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{highlight(product.nome)}</p>
                    <p className="text-white/40 text-xs">{product.categoria?.nome}</p>
                  </div>
                  <span className="text-[#c9a84c] text-sm font-semibold flex-shrink-0">{formatCurrency(product.preco)}</span>
                </button>
              ))}
            </motion.div>
          )}
          {open && query.length >= 2 && suggestions.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute z-50 w-full mt-2 glass rounded-xl px-4 py-3 text-white/40 text-sm"
            >
              Nenhum serviço encontrado para "{query}"
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
