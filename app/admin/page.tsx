"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Edit2 } from "lucide-react"

interface Product {
  _id: string
  name: string
  description: string
  price: number
  category: string
  image: string
}

interface Order {
  _id: string
  orderNumber: string
  items: Array<{ name: string; quantity: number }>
  total: number
  status: string
  user: { name: string; email: string }
}

export default function AdminPage() {
  const { user, loading, isAdmin } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({ name: "", description: "", price: "", category: "", image: "" })
  const [productsLoading, setProductsLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!loading) {
      if (!user || !isAdmin) {
        router.push("/")
      } else {
        fetchProducts()
        fetchOrders()
      }
    }
  }, [user, loading, isAdmin, router])

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/products?limit=100")
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error("Failed to fetch products:", error)
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      })
    } finally {
      setProductsLoading(false)
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/orders", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const data = await response.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error("Failed to fetch orders:", error)
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      })
    } finally {
      setOrdersLoading(false)
    }
  }

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.price || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const url = editingProduct
        ? `http://localhost:5000/api/products/${editingProduct._id}`
        : "http://localhost:5000/api/products"

      const method = editingProduct ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: Number.parseFloat(formData.price),
          category: formData.category,
          image: formData.image || "https://via.placeholder.com/300x300?text=Food",
        }),
      })

      if (!response.ok) throw new Error("Failed to save product")

      toast({
        title: "Success",
        description: editingProduct ? "Product updated!" : "Product created!",
      })

      setFormData({ name: "", description: "", price: "", category: "", image: "" })
      setEditingProduct(null)
      setShowProductForm(false)
      fetchProducts()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      toast({
        title: "Success",
        description: "Product deleted!",
      })

      fetchProducts()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      })
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update order")

      toast({
        title: "Success",
        description: "Order status updated!",
      })

      fetchOrders()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      })
    }
  }

  if (!isAdmin) return null

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <Tabs defaultValue="products">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Products Management</h2>
            <Button
              onClick={() => {
                setEditingProduct(null)
                setFormData({ name: "", description: "", price: "", category: "", image: "" })
                setShowProductForm(!showProductForm)
              }}
            >
              {showProductForm ? "Cancel" : "Add Product"}
            </Button>
          </div>

          {showProductForm && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md"
                />
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md"
                />
                <input
                  type="text"
                  placeholder="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md"
                />
                <input
                  type="text"
                  placeholder="Image URL"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md"
                />
                <Button onClick={handleSaveProduct} className="w-full">
                  {editingProduct ? "Update Product" : "Create Product"}
                </Button>
              </CardContent>
            </Card>
          )}

          {productsLoading ? (
            <div className="text-center py-12">Loading products...</div>
          ) : (
            <div className="grid gap-4">
              {products.map((product) => (
                <Card key={product._id}>
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-muted rounded flex-shrink-0">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-primary font-bold">${product.price}</span>
                          <span className="text-xs bg-muted px-2 py-1 rounded">{product.category}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingProduct(product)
                            setFormData({
                              name: product.name,
                              description: product.description,
                              price: product.price.toString(),
                              category: product.category,
                              image: product.image,
                            })
                            setShowProductForm(true)
                          }}
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product._id)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <h2 className="text-2xl font-bold">Orders Management</h2>

          {ordersLoading ? (
            <div className="text-center py-12">Loading orders...</div>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <Card key={order._id}>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">Order #{order.orderNumber}</h3>
                        <p className="text-sm text-muted-foreground">
                          {order.user.name} ({order.user.email})
                        </p>
                      </div>
                      <span className="font-bold">${order.total.toFixed(2)}</span>
                    </div>

                    <div>
                      <p className="text-sm font-medium">Items:</p>
                      <ul className="text-sm text-muted-foreground mt-1">
                        {order.items.map((item, idx) => (
                          <li key={idx}>
                            {item.name} x {item.quantity}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Status:</label>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-input rounded-md"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
