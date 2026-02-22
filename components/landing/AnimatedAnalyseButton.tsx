"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Compass, Sparkles } from "lucide-react"

interface AnimatedAnalyseButtonProps {
  href?: string
  onClick?: () => void
  isLoading?: boolean
  disabled?: boolean
  label?: string
  icon?: "compass" | "sparkles"
  showSubLabel?: boolean
  size?: "default" | "sm"
}

export function AnimatedAnalyseButton({
  href,
  onClick,
  isLoading = false,
  disabled = false,
  label = "Analyse My Room",
  icon = "compass",
  showSubLabel = false,
  size = "default",
}: AnimatedAnalyseButtonProps) {
  const [hovered, setHovered] = useState(false)

  const px = size === "default" ? "px-10 py-4 text-base" : "px-6 py-[10px] text-[14px]"
  const iconSize = size === "default" ? 18 : 15

  const btnClass = [
    "relative inline-flex items-center justify-center gap-2 font-sans font-medium text-white rounded-full transition-colors",
    size === "default" ? "min-h-[56px] min-w-[200px] sm:min-w-[220px]" : "min-h-[38px]",
    hovered ? "bg-[#1A1A1A]" : "bg-[#0A0A0A]",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    px,
  ].join(" ")

  const content = (
    <>
      {isLoading ? (
        <span className="text-lg leading-none" style={{ animation: "spin 1s linear infinite" }}>
          ☯
        </span>
      ) : icon === "sparkles" ? (
        <Sparkles size={iconSize} />
      ) : (
        <Compass size={iconSize} />
      )}
      <span>{isLoading ? "Analysing..." : label}</span>
    </>
  )

  return (
    <div className="flex flex-col items-center gap-1.5">
      <motion.div
        className={`relative p-[2px] rounded-full inline-block ${hovered ? "animate-border-spin-fast" : "animate-border-spin"}`}
        style={{
          background:
            "conic-gradient(from var(--border-angle), #B8962E, #1A5C3A, #1A4A7A, #C0392B, #B8962E)",
          boxShadow: hovered ? "0 0 30px rgba(184,150,46,0.3)" : "none",
        }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        {href ? (
          <Link href={href} className={btnClass} style={{ textDecoration: "none" }}>
            {content}
          </Link>
        ) : (
          <button onClick={onClick} disabled={disabled || isLoading} className={btnClass}>
            {content}
          </button>
        )}
      </motion.div>

      {showSubLabel && (
        <p className="font-sans text-[11px] text-gray-400 text-center tracking-wide leading-tight mb-0.5">
          Powered by Claude AI · Classical Feng Shui Principles
        </p>
      )}
    </div>
  )
}
