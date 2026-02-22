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
      <div
        className="relative flex flex-col items-center min-h-[calc(100vh-4rem)] px-4 overflow-x-hidden"
        style={{
          backgroundImage:
            "linear-gradient(160deg, #FDF9F0 0%, #FAF6EC 40%, #F5EFE0 100%), url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
          backgroundBlendMode: "normal, multiply",
        }}
      >
        {/* Decorative background ☯ — atmospheric watermark (behind all content) */}
        <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden" aria-hidden>
          <motion.div
            className="select-none"
            style={{
              fontSize: "520px",
              lineHeight: 1,
              color: "#1A1A1A",
              filter: "blur(0.5px) drop-shadow(0 0 40px rgba(0,0,0,0.08))",
            }}
            animate={{
              scale: [0.94, 1.06, 0.94],
              opacity: [0.06, 0.12, 0.06],
            }}
            transition={{
              scale:   { duration: 6, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            ☯
          </motion.div>
        </div>

        {/* Floating Feng Shui principle badges */}
        <FloatingBadges />

        {/* Hero — above badges and watermark */}
        <div className="relative z-10 flex flex-col items-center text-center w-full max-w-4xl pt-12 sm:pt-20 pb-16 px-2">
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
