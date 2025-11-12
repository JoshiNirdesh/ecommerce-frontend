import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "@/context/auth-context"
import { CartProvider } from "@/context/cart-context"
import Navigation from "@/components/navigation"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Restaurant Hub - Order Delicious Food Online",
  description: "Order fresh, delicious food from local restaurants",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          <CartProvider>
            <Navigation />
            <main className="min-h-screen bg-background">{children}</main>
          </CartProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
