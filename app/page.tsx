"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FloatingBadges } from "@/components/landing/FloatingBadges"
import { HeroText } from "@/components/landing/HeroText"
import { AnimatedAnalyseButton } from "@/components/landing/AnimatedAnalyseButton"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { BaguaTrigrams } from "@/components/landing/BaguaTrigrams"

export default function Home() {
  return (
    <>
      {/* ── Hero section ── */}
      <div className="relative flex flex-col items-center min-h-[calc(100vh-4rem)] px-4 overflow-hidden">
        {/* Decorative background ☯ — atmospheric watermark */}
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <div
            className="select-none"
            style={{
              fontSize: "520px",
              lineHeight: 1,
              color: "#1A1A1A",
              opacity: 0.09,
              filter: "blur(0.5px) drop-shadow(0 0 40px rgba(0,0,0,0.08))",
              animation: "spin 60s linear infinite",
            }}
          >
            ☯
          </div>
        </div>

        {/* Floating Feng Shui principle badges */}
        <FloatingBadges />

        {/* Hero */}
        <div className="relative z-10 flex flex-col items-center text-center w-full max-w-4xl pt-20 pb-16">
          {/* Animated Bagua trigram element above headline */}
          <BaguaTrigrams />

          {/* Cycling headline */}
          <HeroText />

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row items-center gap-4 mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
          >
            <AnimatedAnalyseButton href="/editor" label="Analyse My Room" icon="compass" />
            <Link href="/masters">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full h-14 px-8 font-sans font-medium border-black gap-2"
              >
                <Users size={16} />
                Meet the Masters
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ── How It Works — full-width dark section ── */}
      <HowItWorks />
    </>
  )
}
