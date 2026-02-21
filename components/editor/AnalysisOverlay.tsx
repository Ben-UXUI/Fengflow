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

  // Reset state when overlay appears
  useEffect(() => {
    if (isVisible) {
      setMessageIndex(0)
      setProgress(0)
      setShouldExit(false)
    }
  }, [isVisible])

  // Cycle messages every 2s while visible
  useEffect(() => {
    if (!isVisible || shouldExit) return
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [isVisible, shouldExit])

  // Progress bar: 0 → 90% over 20s
  useEffect(() => {
    if (!isVisible || shouldExit) return
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev
        return prev + 4.5
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isVisible, shouldExit])

  // When complete: jump to 100%, then fade out after 600ms
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
          {/* Rotating ☯ */}
          <motion.div
            className="text-7xl mb-8 select-none"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          >
            ☯
          </motion.div>

          {/* Cycling message */}
          <div className="h-8 flex items-center justify-center mb-10">
            <AnimatePresence mode="wait">
              <motion.p
                key={messageIndex}
                className="text-lg font-medium text-black tracking-wide"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
              >
                {MESSAGES[messageIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Progress bar */}
          <div className="w-56 h-px bg-gray-200 rounded-full overflow-hidden mb-16">
            <motion.div
              className="h-full bg-black rounded-full origin-left"
              animate={{ scaleX: progress / 100 }}
              transition={{ duration: progress === 100 ? 0.3 : 1, ease: "easeOut" }}
              style={{ transformOrigin: "left" }}
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
