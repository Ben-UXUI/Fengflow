"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

const PHRASES = [
  "Bring harmony to your home.",
  "Balance energy. Transform space.",
  "Ancient wisdom. Modern living.",
  "Your home. Your Qi. Your peace.",
  "Unlock the power of Feng Shui.",
  "Where tradition meets technology.",
]

export function HeroText() {
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [showStagger, setShowStagger] = useState(true)
  const cycleRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // Let the stagger animation play (~1.5s for ~30 chars), then start cycling
    const startTimer = setTimeout(() => {
      // Jump to index 1 immediately so cycling doesn't re-show phrase 0 with an entry animation
      setPhraseIndex(1)
      setShowStagger(false)
      cycleRef.current = setInterval(() => {
        setPhraseIndex((i) => (i + 1) % PHRASES.length)
      }, 3500)
    }, 3200)

    return () => {
      clearTimeout(startTimer)
      if (cycleRef.current) clearInterval(cycleRef.current)
    }
  }, [])

  const phrase = PHRASES[phraseIndex]
  const isItalic = phraseIndex % 2 !== 0

  return (
    <div className="flex flex-col items-center text-center w-full">
      {/* Fixed label */}
      <motion.p
        className="font-sans text-xs uppercase tracking-[0.2em] text-gray-500 mb-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        AI-POWERED FENG SHUI PLATFORM
      </motion.p>

      {/* Rotating headline — no overflow-hidden so text wraps freely on mobile */}
      <div className="min-h-[60px] md:min-h-[120px] flex items-center justify-center w-full">
        {showStagger ? (
          <div className="font-display font-bold text-[44px] sm:text-[52px] md:text-[80px] leading-tight text-black">
            {phrase.split("").map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.025, duration: 0.3, ease: "easeOut" }}
                className="inline-block"
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={phraseIndex}
              className={`font-display font-bold text-[44px] sm:text-[52px] md:text-[80px] leading-tight text-black${isItalic ? " italic" : ""}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              {phrase}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Static subheading */}
      <motion.p
        className="font-sans text-base text-[#666666] max-w-[520px] leading-[1.7] mt-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        Classical Feng Shui analysis powered by AI. Arrange your space, submit your layout, receive
        expert guidance in seconds.
      </motion.p>
    </div>
  )
}
