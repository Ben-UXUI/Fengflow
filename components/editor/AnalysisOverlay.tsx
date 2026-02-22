"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const MESSAGES = [
  "Consulting the Bagua...",
  "Mapping your energy zones...",
  "Analysing the Five Elements...",
  "Detecting Qi flow pathways...",
  "Identifying commanding positions...",
  "Preparing your analysis...",
]

interface AnalysisOverlayProps {
  isVisible: boolean
  isComplete: boolean
  onExitComplete: () => void
}

export function AnalysisOverlay({ isVisible, isComplete, onExitComplete }: AnalysisOverlayProps) {
  const [messageIndex, setMessageIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [shouldExit, setShouldExit] = useState(false)
  const [displayedText, setDisplayedText] = useState("")
  const [charIndex, setCharIndex] = useState(0)

  // Reset state when overlay appears
  useEffect(() => {
    if (isVisible) {
      setMessageIndex(0)
      setProgress(0)
      setShouldExit(false)
      setDisplayedText("")
      setCharIndex(0)
    }
  }, [isVisible])

  // Cycle messages every 2.5s
  useEffect(() => {
    if (!isVisible || shouldExit) return
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [isVisible, shouldExit])

  // Reset typewriter when message changes
  useEffect(() => {
    setDisplayedText("")
    setCharIndex(0)
  }, [messageIndex])

  // Typewriter effect: one character every 28ms
  useEffect(() => {
    if (!isVisible || shouldExit) return
    const currentMessage = MESSAGES[messageIndex]
    if (charIndex >= currentMessage.length) return
    const timer = setTimeout(() => {
      setDisplayedText(currentMessage.slice(0, charIndex + 1))
      setCharIndex((prev) => prev + 1)
    }, 28)
    return () => clearTimeout(timer)
  }, [charIndex, messageIndex, isVisible, shouldExit])

  // Progress: phase 1 → 60% in 8s, phase 2 → 90% in 12s (200ms interval)
  // Phase 1: 1.5% per tick × 40 ticks = 60% in 8s
  // Phase 2: 0.5% per tick × 60 ticks = 30% in 12s
  useEffect(() => {
    if (!isVisible || shouldExit) return
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev
        if (prev < 60) return Math.min(60, prev + 1.5)
        return prev + 0.5
      })
    }, 200)
    return () => clearInterval(interval)
  }, [isVisible, shouldExit])

  // When complete: jump to 100%, then fade out after 700ms
  useEffect(() => {
    if (!isComplete) return
    setProgress(100)
    const timer = setTimeout(() => setShouldExit(true), 700)
    return () => clearTimeout(timer)
  }, [isComplete])

  const show = isVisible && !shouldExit

  return (
    <AnimatePresence onExitComplete={onExitComplete}>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* Hint text */}
          <p className="absolute top-8 font-sans text-[11px] text-gray-400 tracking-wide">
            Usually ready in 15–20 seconds
          </p>

          {/* Rotating ☯ */}
          <motion.div
            className="text-7xl mb-8 select-none"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          >
            ☯
          </motion.div>

          {/* Typewriter message */}
          <div className="h-8 flex items-center justify-center mb-10">
            <p className="text-lg font-medium text-black tracking-wide">
              {displayedText}
              <motion.span
                className="inline-block w-0.5 h-[18px] bg-black ml-0.5 align-middle"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "steps(1)" }}
              />
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-56 h-1.5 bg-gray-200 rounded-full overflow-hidden mb-16">
            <motion.div
              className="h-full w-full bg-black rounded-full"
              style={{ transformOrigin: "left" }}
              animate={{ scaleX: Math.min(100, progress) / 100 }}
              transition={{ duration: progress >= 100 ? 0.3 : 0.2, ease: "easeOut" }}
            />
          </div>

          {/* Footer */}
          <p className="absolute bottom-8 text-xs text-gray-400 tracking-wide">
            Classical Feng Shui analysis powered by AI
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
