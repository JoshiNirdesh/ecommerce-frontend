"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./auth-context"

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  image: string
}

interface CartContextType {
  items: CartItem[]
  loading: boolean
  addToCart: (productId: string, quantity: number, product: any) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => void
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const { token } = useAuth()

  useEffect(() => {
    if (token) {
      fetchCart()
    }
  }, [token])

  const fetchCart = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:5000/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setItems(data.items || [])
    } catch (error) {
      console.error("Failed to fetch cart:", error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId: string, quantity: number, product: any) => {
    try {
      await fetch("http://localhost:5000/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity }),
      })

      const existingItem = items.find((item) => item.productId === productId)
      if (existingItem) {
        setItems(
          items.map((item) => (item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item)),
        )
      } else {
        setItems([
          ...items,
          {
            productId,
            name: product.name,
            price: product.price,
            quantity,
            image: product.image,
          },
        ])
      }
    } catch (error) {
      console.error("Failed to add to cart:", error)
      throw error
    }
  }

  const removeFromCart = async (productId: string) => {
    try {
      await fetch(`http://localhost:5000/api/cart/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      setItems(items.filter((item) => item.productId !== productId))
    } catch (error) {
      console.error("Failed to remove from cart:", error)
      throw error
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      await fetch(`http://localhost:5000/api/cart/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      })
      setItems(items.map((item) => (item.productId === productId ? { ...item, quantity } : item)))
    } catch (error) {
      console.error("Failed to update quantity:", error)
      throw error
    }
  }

  const clearCart = () => {
    setItems([])
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }
  return context
}
