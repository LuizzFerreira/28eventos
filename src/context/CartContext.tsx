import { createContext, useContext, useState, type ReactNode } from 'react'
import type { CartItem, Product } from '@/types'

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, qty: number) => void
  clearCart: () => void
  total: number
  count: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  function addItem(product: Product) {
    setItems(prev => {
      const existing = prev.find(i => i.produto.id === product.id)
      if (existing) return prev.map(i =>
        i.produto.id === product.id ? { ...i, quantidade: i.quantidade + 1 } : i
      )
      return [...prev, { produto: product, quantidade: 1 }]
    })
  }

  function removeItem(productId: string) {
    setItems(prev => prev.filter(i => i.produto.id !== productId))
  }

  function updateQuantity(productId: string, qty: number) {
    if (qty <= 0) return removeItem(productId)
    setItems(prev => prev.map(i =>
      i.produto.id === productId ? { ...i, quantidade: qty } : i
    ))
  }

  function clearCart() { setItems([]) }

  const total = items.reduce((acc, i) => acc + i.produto.preco * i.quantidade, 0)
  const count = items.reduce((acc, i) => acc + i.quantidade, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
