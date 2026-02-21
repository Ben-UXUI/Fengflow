"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ScoreBadgeProps {
  score?: number | null
}

function getConfig(score: number) {
  if (score >= 80) {
    return {
      bg: "#F0FFF4",
      border: "#1A5C3A",
      text: "#1A5C3A",
      stops: ["#1A5C3A", "#2D7A52", "#4CAF50", "#81C784", "#1A5C3A"],
      glow: "0 0 20px rgba(26,92,58,0.3)",
      label: score >= 90 ? "Excellent" : "Good",
      tooltip: "Your space has excellent Feng Shui harmony",
    }
  }
  if (score >= 60) {
    return {
      bg: "#FFFBF0",
      border: "#B8962E",
      text: "#B8962E",
      stops: ["#B8962E", "#D4A843", "#F0C040", "#D4A843", "#B8962E"],
      glow: "0 0 20px rgba(184,150,46,0.3)",
      label: score >= 70 ? "Good" : "Fair",
      tooltip: "Your space has good energy with some areas to improve",
    }
  }
  return {
    bg: "#FFF5F5",
    border: "#C0392B",
    text: "#C0392B",
    stops: ["#C0392B", "#E74C3C", "#FF6B6B", "#E74C3C", "#C0392B"],
    glow: "0 0 20px rgba(192,57,43,0.3)",
    label: score >= 50 ? "Fair" : "Needs Attention",
    tooltip: "Your space needs Feng Shui attention in several areas",
  }
}

const NEUTRAL_CONFIG = {
  bg: "#F5F5F5",
  border: "#CCCCCC",
  text: "#999999",
  stops: ["#CCCCCC", "#DDDDDD", "#EEEEEE", "#DDDDDD", "#CCCCCC"],
  glow: "none",
  label: "—",
  tooltip: "Score not available",
}

export function ScoreBadge({ score }: ScoreBadgeProps) {
  const hasScore = score !== null && score !== undefined
  const finalScore = hasScore ? score : 0
  const config = hasScore ? getConfig(finalScore) : NEUTRAL_CONFIG
  const stopsStr = config.stops.join(", ")

  const [displayScore, setDisplayScore] = useState(0)
  // If there's no real score, skip the loading/counting state
  const [isLoading, setIsLoading] = useState(hasScore)
  const [showGlow, setShowGlow] = useState(false)
  const [pulsing, setPulsing] = useState(false)
  const [hovered, setHovered] = useState(false)

  const ringRef = useRef<HTMLDivElement>(null)
  const isLoadingRef = useRef(true)
  const hoveredRef = useRef(false)
  const lastTimeRef = useRef<number>(0)
  const angleRef = useRef(0)

  // RAF loop — direct DOM mutation, no re-renders per frame
  useEffect(() => {
    let active = true
    const tick = (time: number) => {
      if (!active) return
      const delta = lastTimeRef.current ? time - lastTimeRef.current : 0
      lastTimeRef.current = time
      const duration = isLoadingRef.current ? 1500 : hoveredRef.current ? 1000 : 3000
      angleRef.current = (angleRef.current + (delta / duration) * 360) % 360
      if (ringRef.current) {
        ringRef.current.style.background = `conic-gradient(from ${angleRef.current}deg, ${stopsStr})`
      }
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
    return () => { active = false }
  }, [stopsStr])

  useEffect(() => { isLoadingRef.current = isLoading }, [isLoading])
  useEffect(() => { hoveredRef.current = hovered }, [hovered])

  // Count-up animation
  useEffect(() => {
    if (!hasScore || !finalScore) return
    const duration = 1500
    const startTime = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // easeOut cubic
      setDisplayScore(Math.round(eased * finalScore))
      if (progress < 1) {
        requestAnimationFrame(tick)
      } else {
        setIsLoading(false)
        setTimeout(() => {
          setShowGlow(true)
          setPulsing(true)
          setTimeout(() => setPulsing(false), 600)
        }, 50)
      }
    }
    requestAnimationFrame(tick)
  }, [finalScore])

  return (
    <div className="flex flex-col items-center">
      <motion.div
        className="relative"
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        animate={{ scale: pulsing ? 1.08 : 1 }}
        whileHover={{ scale: 1.04 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Rotating gradient ring — 160px outer */}
        <div
          ref={ringRef}
          className="w-[160px] h-[160px] rounded-full flex items-center justify-center"
          style={{
            background: `conic-gradient(from 0deg, ${stopsStr})`,
            boxShadow: showGlow ? config.glow : "none",
            transition: "box-shadow 0.5s ease",
          }}
        >
          {/* Inner circle — 152px (4px ring visible on each side) */}
          <div
            className="w-[152px] h-[152px] rounded-full flex flex-col items-center justify-center"
            style={{
              background: isLoading ? "white" : config.bg,
              border: `3px solid ${config.border}`,
              transition: "background 0.5s ease",
            }}
          >
            <span
              className="font-display font-bold leading-none"
              style={{
                fontSize: hasScore ? "72px" : "48px",
                color: isLoading ? "#888888" : config.text,
                transition: "color 0.5s ease",
              }}
            >
              {hasScore ? displayScore : "—"}
            </span>

            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.span
                  key="calculating"
                  className="font-sans text-[11px] text-gray-400 mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  Calculating...
                </motion.span>
              ) : (
                <motion.span
                  key="label"
                  className="font-display italic text-[18px] leading-tight mt-1"
                  style={{ color: config.text }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {config.label}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Hover tooltip */}
        <AnimatePresence>
          {hovered && !isLoading && (
            <motion.div
              className="absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-white border border-black rounded-xl px-3.5 py-2 shadow-md font-sans text-[12px] text-gray-700 whitespace-nowrap z-20"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {config.tooltip}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <p className="font-sans text-[13px] text-gray-500 mt-3">Harmony Score</p>
    </div>
  )
}
