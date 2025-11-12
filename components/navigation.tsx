"use client"

import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { ShoppingCart, LogOut, User } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Navigation() {
  const { user, logout, loading } = useAuth()
  const { items } = useCart()
  const router = useRouter()
  const cartCount = items.length

  if (loading) return null

  return (
    <nav className="border-b bg-card sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary">
          🍽️ Restaurant Hub
        </Link>

        <div className="flex gap-6 items-center">
          <Link href="/" className="hover:text-primary transition">
            Home
          </Link>

          {user && (
            <>
              <Link href="/cart" className="relative hover:text-primary transition">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {cartCount}
                    </span>
                  )}
                </div>
              </Link>

              <Link href="/orders" className="hover:text-primary transition">
                Orders
              </Link>

              {user.role === "admin" && (
                <Link href="/admin" className="hover:text-primary transition font-semibold">
                  Admin
                </Link>
              )}
            </>
          )}

          <div className="flex gap-2 items-center">
            {user ? (
              <>
                <div className="flex items-center gap-2">
                  <User size={18} />
                  <span className="text-sm">{user.name}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    logout()
                    router.push("/")
                  }}
                >
                  <LogOut size={18} />
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
