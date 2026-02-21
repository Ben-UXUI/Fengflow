"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { motion, useMotionValue, AnimatePresence } from "framer-motion"

const TRIGRAMS = ["☰", "☱", "☲", "☳", "☴", "☵", "☶", "☷"]
const SIZE     = 80   // outer container px
const CX       = SIZE / 2  // 40
const RING_R   = 30   // radius to place trigrams

// Octagon polygon points at RING_R - 2 (border sits slightly inside trigrams)
const BORDER_R = RING_R - 3
const OCTAGON_PTS = TRIGRAMS.map((_, i) => {
  const a = ((i * 45) - 90) * Math.PI / 180
  return `${(CX + BORDER_R * Math.cos(a)).toFixed(2)},${(CX + BORDER_R * Math.sin(a)).toFixed(2)}`
}).join(" ")

export function BaguaTrigrams() {
  const rotate        = useMotionValue(0)
  const rafRef        = useRef<number>(0)
  const stateRef      = useRef({ dir: 1, dps: 360 / 20 }) // degrees per second
  const reversedUntil = useRef(0)
  const [hovered,     setHovered]     = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [visible,     setVisible]     = useState(false)

  // ── RAF-based continuous rotation with entrance ────────────────────────────
  useEffect(() => {
    const ENTRANCE_MS = 1200
    const startedAt   = Date.now()
    let   lastT       = 0

    const tick = (t: number) => {
      const elapsed = Date.now() - startedAt

      if (elapsed < ENTRANCE_MS) {
        // Entrance: rotate from -180° → 0° with cubic easeOut
        const p     = Math.min(1, elapsed / ENTRANCE_MS)
        const eased = 1 - Math.pow(1 - p, 3)
        rotate.set(-180 * (1 - eased))
      } else {
        // Continuous spin — check reverse timer
        if (Date.now() > reversedUntil.current && stateRef.current.dir === -1) {
          stateRef.current.dir = 1
        }
        if (lastT !== 0) {
          const delta = (t - lastT) / 1000
          rotate.set(rotate.get() + stateRef.current.dir * stateRef.current.dps * delta)
        }
      }

      lastT          = t
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [rotate])

  // ── Sync hover speed to RAF state ────────────────────────────────────────
  useEffect(() => {
    stateRef.current.dps = hovered ? 360 / 3 : 360 / 20
  }, [hovered])

  // ── Click → reverse for 3 s ──────────────────────────────────────────────
  const handleClick = useCallback(() => {
    stateRef.current.dir = -1
    reversedUntil.current = Date.now() + 3000
  }, [])

  // ── Hover handlers ────────────────────────────────────────────────────────
  const onEnter = useCallback(() => {
    setHovered(true)
    setTimeout(() => setShowTooltip(true), 400)
  }, [])
  const onLeave = useCallback(() => {
    setHovered(false)
    setShowTooltip(false)
  }, [])

  // Trigger entrance opacity/scale after mount
  useEffect(() => { setVisible(true) }, [])

  return (
    <div className="relative flex flex-col items-center mb-6 select-none" style={{ userSelect: "none" }}>

      {/* ── Pulsing glow behind ── */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{ width: 80, height: 80, background: "rgba(0,0,0,0.06)", filter: "blur(20px)" }}
        animate={{ opacity: [0.04, 0.12, 0.04] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Entrance wrapper — handles opacity + scale fade-in ── */}
      <motion.div
        style={{ width: SIZE, height: SIZE }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={visible ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative cursor-pointer"
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onClick={handleClick}
        title=""
      >
        {/* ── Rotating element (RAF-driven) ── */}
        <motion.div style={{ width: SIZE, height: SIZE, rotate }}>

          {/* Octagon SVG border */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={SIZE}
            height={SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
          >
            <polygon
              points={OCTAGON_PTS}
              fill="none"
              stroke="black"
              strokeWidth={1}
              opacity={hovered ? 0.5 : 0.3}
              style={{ transition: "opacity 0.3s" }}
            />
          </svg>

          {/* Trigram symbols on the ring */}
          {TRIGRAMS.map((tri, i) => {
            const a  = ((i * 45) - 90) * Math.PI / 180
            const tx = CX + RING_R * Math.cos(a)
            const ty = CX + RING_R * Math.sin(a)
            return (
              <div
                key={i}
                className="absolute font-sans text-[13px] text-black leading-none"
                style={{
                  left: tx - 7,
                  top: ty - 8,
                  width: 14,
                  textAlign: "center",
                  opacity: hovered ? 1.0 : 0.7,
                  transition: "opacity 0.3s",
                  pointerEvents: "none",
                }}
              >
                {tri}
              </div>
            )
          })}
        </motion.div>
      </motion.div>

      {/* ── Tooltip ── */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            className="absolute top-full mt-2 font-sans text-[12px] text-gray-600 whitespace-nowrap pointer-events-none"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
          >
            The Eight Trigrams · 八卦
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
