"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useAuth } from "@/context/auth-context"

interface OrderItem {
  productId: string
  name: string
  quantity: number
  price: number
}

interface Order {
  _id: string
  items: OrderItem[]
  totalAmount: number
  status: string
  deliveryAddress: string
  phone: string
  createdAt: string
}

export default function MyOrdersPage() {
  const { token } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = async () => {
    try {
      setError(null)
      setLoading(true)

      const res = await fetch("http://localhost:5000/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error(`API Error: ${res.status}`)
      const data = await res.json()
      setOrders(data || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load orders"
      setError(message)
      console.error("[MyOrdersPage] Fetch error:", message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchOrders()
  }, [token])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-12">Loading orders...</div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="pt-12 text-center">
            <p className="text-muted-foreground mb-4">You have no orders yet.</p>
            <Link href="/">
              <Button>Shop Now</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <Card key={order._id} className="hover:shadow-lg transition">
              <CardHeader>
                <CardTitle>Order #{order._id.slice(-6)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-2">
                  Placed on: {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm mb-2">
                  Status:{" "}
                  <span className="font-medium text-blue-600 capitalize">
                    {order.status}
                  </span>
                </p>

                <div className="space-y-2 mb-4">
                  {order.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center border-b py-1"
                    >
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <p className="font-semibold mb-2">
                  Total: ${order.totalAmount.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  Delivery: {order.deliveryAddress}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Phone: {order.phone}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
