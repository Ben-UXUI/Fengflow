"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-[var(--bg-primary)] border-b border-[var(--border)]/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-display text-[var(--green-deep)] font-semibold">
              ☯ FengFlow
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/editor"
              className="text-[var(--text-secondary)] hover:text-[var(--green-deep)] transition-colors"
            >
              Analyse Room
            </Link>
            <Link
              href="/masters"
              className="text-[var(--text-secondary)] hover:text-[var(--green-deep)] transition-colors"
            >
              Masters
            </Link>
            <Link
              href="/#how-it-works"
              className="text-[var(--text-secondary)] hover:text-[var(--green-deep)] transition-colors"
            >
              How It Works
            </Link>
            <Link href="/editor">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              href="/editor"
              className="block py-2 text-[var(--text-secondary)] hover:text-[var(--green-deep)]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Analyse Room
            </Link>
            <Link
              href="/masters"
              className="block py-2 text-[var(--text-secondary)] hover:text-[var(--green-deep)]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Masters
            </Link>
            <Link
              href="/#how-it-works"
              className="block py-2 text-[var(--text-secondary)] hover:text-[var(--green-deep)]"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link href="/editor" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full mt-2">Get Started</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
