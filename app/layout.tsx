import type { Metadata } from "next"
import { Cormorant_Garamond, DM_Sans } from "next/font/google"
import "./globals.css"
import { AppNav } from "@/components/layout/AppNav"
import { Toaster } from "@/components/ui/toaster"

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
})

export const metadata: Metadata = {
  title: "FengFlow - AI-Powered Feng Shui Room Planner",
  description: "Bring harmony to your home with AI-powered Feng Shui room analysis grounded in classical principles.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${cormorant.variable} ${dmSans.variable} antialiased`} suppressHydrationWarning>
        <AppNav />
        <main className="min-h-screen pt-16">{children}</main>
        <Toaster />
      </body>
    </html>
  )
}
