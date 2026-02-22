"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { motion } from "framer-motion"
import { Menu, X, Home, Compass, Users } from "lucide-react"

const NAV_ITEMS = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/editor", label: "Analyse", Icon: Compass },
  { href: "/masters", label: "Masters", Icon: Users },
]

export function AppNav() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border-dark)]" style={{ backgroundColor: "#FAF6EC" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2">
            {/* Slowly spinning ☯ */}
            <motion.span
              style={{ fontSize: 18, lineHeight: 1, display: "inline-block" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              ☯
            </motion.span>

            {/* Feng | Flow editorial brand */}
            <div
              className="flex items-center"
              style={{ letterSpacing: "0.04em" }}
            >
              {/* "Feng" — bold italic */}
              <span
                className="font-display font-bold italic text-[#0A0A0A]"
                style={{ fontSize: "clamp(20px, 2.5vw, 22px)" }}
              >
                Feng
              </span>

              {/* Thin vertical separator */}
              <span
                className="inline-block mx-2 group-hover:bg-black transition-colors duration-300"
                style={{
                  width: 1,
                  height: 16,
                  background: "#D0D0D0",
                  alignSelf: "center",
                  flexShrink: 0,
                }}
              />

              {/* "Flow" — normal italic, boldens on hover */}
              <span
                className="font-display italic text-[#0A0A0A] group-hover:font-bold transition-all duration-300"
                style={{ fontSize: "clamp(20px, 2.5vw, 22px)", fontWeight: 400 }}
              >
                Flow
              </span>
            </div>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-8 h-full">
            {NAV_ITEMS.map(({ href, label, Icon }) => {
              const isActive =
                pathname === href ||
                (href !== "/" && pathname.startsWith(href))
              return (
                <Link
                  key={href}
                  href={href}
                  className={`font-sans text-[14px] font-medium flex items-center gap-1.5 h-full py-4 transition-colors duration-200 border-b-2 -mb-px ${
                    isActive
                      ? "text-[var(--text-primary)] border-[var(--text-primary)]"
                      : "text-[var(--text-primary)] border-transparent hover:text-[var(--text-secondary)]"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 -mr-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen
              ? <X className="h-6 w-6 text-[var(--text-primary)]" strokeWidth={2} />
              : <Menu className="h-6 w-6 text-[var(--text-primary)]" strokeWidth={2} />
            }
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border)]" style={{ backgroundColor: "#FAF6EC" }}>
          <nav className="px-4 py-4 space-y-1">
            {NAV_ITEMS.map(({ href, label, Icon }) => {
              const isActive =
                pathname === href ||
                (href !== "/" && pathname.startsWith(href))
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`font-sans text-[14px] font-medium flex items-center gap-2 py-3 px-4 rounded-lg transition-colors ${
                    isActive
                      ? "text-[var(--text-primary)] bg-[var(--bg-secondary)]"
                      : "text-[var(--text-primary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}
