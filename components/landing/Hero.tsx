"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Hero() {
  const words = "Bring harmony".split(" ")
  const words2 = "to your home.".split(" ")

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--bg-primary)]">
      {/* Background decorative element */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="text-[20rem] opacity-[0.04] select-none"
          style={{
            animation: "spin 60s linear infinite",
          }}
        >
          ☯
        </div>
      </div>

      {/* Subtle gradient wash */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[var(--green-light)] opacity-30 rounded-full blur-[200px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold text-[var(--text-primary)] mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {words.map((word, i) => (
            <motion.span
              key={i}
              className="inline-block mr-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              {word}
            </motion.span>
          ))}
          <br />
          {words2.map((word, i) => (
            <motion.span
              key={i + words.length}
              className="inline-block mr-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (i + words.length) * 0.1, duration: 0.4 }}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          className="text-lg sm:text-xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          AI-powered Feng Shui room analysis grounded in classical principles.
          Arrange your space, submit your layout, receive expert guidance.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          <Link href="/editor">
            <Button size="lg" className="text-lg px-8">
              Analyse My Room →
            </Button>
          </Link>
          <Link href="/masters">
            <Button size="lg" variant="ghost" className="text-lg px-8">
              Meet the Masters
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
