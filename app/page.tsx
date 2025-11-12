"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"
import { ShoppingCart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiCall } from "@/lib/api"

interface Product {
  _id: string
  name: string
  description: string
  price: number
  category: string
  image: string
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState("")

  const { addToCart } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()

  // Static categories to replace API call
  const categories = ["All", "Pizza", "Burgers", "Drinks"]

  useEffect(() => {
    fetchProducts()
  }, [page, category])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await apiCall(
        `/api/products?page=${page}&limit=12${category && category !== "All" ? `&category=${category}` : ""}`
      )
      setProducts(data.products || [])
    } catch (error) {
      console.error("Failed to fetch products:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load products. Is the backend server running?",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      toast({
        title: "Please Login",
        description: "You need to login to add items to cart",
      })
      return
    }

    try {
      await addToCart(product._id, 1, product)
      toast({
        title: "Success",
        description: `${product.name} added to cart!`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to cart",
        variant: "destructive",
      })
    }
  }

  return (
    
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Discover Delicious Food</h1>

        <div className="flex gap-2 flex-wrap mb-6">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={category === cat || (category === "" && cat === "All") ? "default" : "outline"}
              onClick={() => {
                setCategory(cat === "All" ? "" : cat)
                setPage(1)
              }}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">No products found</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {products.map((product) => (
              <Card key={product._id} className="hover:shadow-lg transition">
                <div className="relative h-48 bg-muted overflow-hidden">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary">${product.price}</span>
                    <span className="text-xs bg-muted px-2 py-1 rounded">{product.category}</span>
                  </div>
                  <Button className="w-full" onClick={() => handleAddToCart(product)}>
                    <ShoppingCart size={18} className="mr-2" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
              Previous
            </Button>
            <span className="flex items-center">Page {page}</span>
            <Button variant="outline" onClick={() => setPage(page + 1)} disabled={products.length < 12}>
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
