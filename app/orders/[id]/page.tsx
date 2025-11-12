"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useAuth } from "@/context/auth-context"

interface OrderItem {
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

export default function OrderDetailsPage() {
  const { id } = useParams()
  const { token } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`http://localhost:5000/api/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error(`Failed to fetch order (${res.status})`)

      const data = await res.json()
      setOrder(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error loading order"
      setError(message)
      console.error("[OrderDetailsPage]", message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id && token) fetchOrderDetails()
  }, [id, token])

  if (loading) return <div className="text-center py-12">Loading order...</div>

  if (error)
    return (
      <Alert variant="destructive" className="my-8">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )

  if (!order)
    return (
      <div className="text-center py-12 text-muted-foreground">
        No order details found.
      </div>
    )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Order #{order._id.slice(-6)}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-2">
            Placed on: {new Date(order.createdAt).toLocaleDateString()}
          </p>
          <p className="mb-2">
            <strong>Status:</strong>{" "}
            <span className="capitalize text-blue-600">{order.status}</span>
          </p>

          <div className="border-t my-4 pt-3">
            <h3 className="font-semibold mb-2">Items:</h3>
            {order.items.map((item, i) => (
              <p key={i}>
                {item.name} × {item.quantity} — ${item.price.toFixed(2)}
              </p>
            ))}
          </div>

          <p className="font-semibold text-lg mt-4 mb-2">
            Total: ${order.totalAmount.toFixed(2)}
          </p>

          <div className="text-sm text-gray-600 mt-4">
            <p>
              <strong>Delivery:</strong> {order.deliveryAddress}
            </p>
            <p>
              <strong>Phone:</strong> {order.phone}
            </p>
          </div>

          <Button variant="outline" className="mt-6" onClick={() => history.back()}>
            Back to Orders
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
