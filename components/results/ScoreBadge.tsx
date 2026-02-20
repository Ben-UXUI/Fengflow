"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface ScoreBadgeProps {
  score: number
}

export function ScoreBadge({ score }: ScoreBadgeProps) {
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = score / steps
    const stepDuration = duration / steps

    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= score) {
        setDisplayScore(score)
        clearInterval(timer)
      } else {
        setDisplayScore(Math.floor(current))
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [score])

  return (
    <div className="flex flex-col items-center relative">
      {/* Bagua octagon decorative background */}
      <svg
        className="absolute w-40 h-40 opacity-[0.06] pointer-events-none"
        viewBox="0 0 100 100"
      >
        <polygon
          points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>

      <motion.div
        className="relative w-32 h-32 rounded-full border-4 border-[var(--accent)] flex items-center justify-center bg-white"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
      >
        <motion.span
          className="text-4xl font-bold text-[var(--text-primary)]"
          animate={displayScore === score ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          {displayScore}
        </motion.span>
      </motion.div>
      <p className="mt-4 text-sm font-bold text-[var(--text-secondary)]">
        Feng Shui Harmony Score
      </p>
    </div>
  )
}
