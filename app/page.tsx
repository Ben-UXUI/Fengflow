"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      {/* Yin yang background - large rotating symbol */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div
          className="text-[24rem] text-[var(--text-primary)] select-none opacity-[0.06]"
          style={{ animation: "spin 60s linear infinite" }}
        >
          ☯
        </div>
      </div>

      {/* Yin yang circles - overlapping black and white */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="relative w-[600px] h-[600px] opacity-[0.04]">
          <div className="absolute top-1/2 left-1/2 -translate-x-[75%] -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-[var(--bg-dark)]" />
          <div className="absolute top-1/2 left-1/2 translate-x-[-25%] -translate-y-1/2 w-[300px] h-[300px] rounded-full border-2 border-[var(--border-dark)] bg-[var(--bg-primary)]" />
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-md">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-3 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <span className="text-5xl">☯</span>
          <span className="font-display font-bold text-[var(--text-primary)] text-4xl">
            FengFlow
          </span>
        </motion.div>

        {/* Tagline */}
        <motion.p
          className="text-lg text-[var(--text-secondary)] mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          AI-powered Feng Shui analysis. Arrange your space, receive expert guidance.
        </motion.p>

        {/* CTA */}
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <Link href="/editor" className="block w-full">
            <Button size="lg" className="w-full rounded-full text-base h-14">
              Analyse My Room
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
