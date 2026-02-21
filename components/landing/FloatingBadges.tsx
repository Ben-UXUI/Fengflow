"use client"

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence, type TargetAndTransition, type Transition } from "framer-motion"

// ── 12 tonal colour styles ────────────────────────────────────────────────────
const STYLES = {
  A: { bg: "#F5EDED", border: "#D4B8B8", text: "#5C2E2E" },
  B: { bg: "#EDF2ED", border: "#B8CCB8", text: "#2E4A2E" },
  C: { bg: "#EEEDF5", border: "#C4B8D4", text: "#3A2E5C" },
  D: { bg: "#EDF2F2", border: "#B8CCCC", text: "#1E3D3D" },
  E: { bg: "#F5EEEB", border: "#D4BDB8", text: "#5C3528" },
  F: { bg: "#F2EDF2", border: "#CCB8CC", text: "#4A2E4A" },
  G: { bg: "#F5F2EB", border: "#D4C8A8", text: "#4A3C1E" },
  H: { bg: "#EDF0F5", border: "#B8C4D4", text: "#1E2E4A" },
  I: { bg: "#F0F2EB", border: "#C4CCB0", text: "#3A4220" },
  J: { bg: "#F5EEEC", border: "#D4BCB8", text: "#5C3230" },
  K: { bg: "#EEEDF5", border: "#C0B8D4", text: "#2E2A5C" },
  L: { bg: "#F2F0EC", border: "#CCC8BE", text: "#3C3828" },
} as const

type StyleKey = keyof typeof STYLES
type Layer = "back" | "mid" | "front"
type Size = "lg" | "md" | "sm"

interface BadgeConfig {
  en: string
  zh: string
  style: StyleKey
  left: string
  top: string
  size: Size
  layer: Layer
  delay: number          // seconds before float-in starts
  floatDuration: number  // seconds the float-in takes
  bobY: number           // px vertical bob amplitude
  driftX: number         // px horizontal drift amplitude
  bobDuration: number    // seconds per bob cycle
  startX: number         // px horizontal offset at spawn
  startY: number         // px below final position at spawn
  tooltip: string
  mobileShow: boolean
}

// ── Rest values by layer ─────────────────────────────────────────────────────
const REST_SCALE: Record<Layer, number>   = { back: 0.48, mid: 0.72, front: 0.90 }
const REST_OPACITY: Record<Layer, number> = { back: 0.50, mid: 0.75, front: 0.90 }
const Z_IDX: Record<Layer, number>        = { back: 1,    mid: 2,    front: 3    }

// ── 33 badge configurations ──────────────────────────────────────────────────
const BADGES: BadgeConfig[] = [
  // ── TOP STRIP ──────────────────────────────────────────────────────────────
  {
    en: "Qi Flow", zh: "气流", style: "A",
    left: "8%", top: "5%", size: "lg", layer: "front",
    delay: 0, floatDuration: 14, bobY: 7, driftX: 4, bobDuration: 4.2,
    startX: -25, startY: 60,
    tooltip: "Qi Flow — the movement of vital energy through a space",
    mobileShow: true,
  },
  {
    en: "Bagua", zh: "八卦", style: "B",
    left: "25%", top: "3%", size: "sm", layer: "front",
    delay: 3.6, floatDuration: 12, bobY: 5, driftX: 3, bobDuration: 5.0,
    startX: 15, startY: 50,
    tooltip: "Bagua — the eight trigrams energy map used in Feng Shui",
    mobileShow: false,
  },
  {
    en: "Yin Yang", zh: "阴阳", style: "C",
    left: "45%", top: "2%", size: "md", layer: "mid",
    delay: 1.2, floatDuration: 16, bobY: 6, driftX: 3, bobDuration: 3.8,
    startX: -10, startY: 45,
    tooltip: "Yin Yang — the complementary opposite forces present in all things",
    mobileShow: false,
  },
  {
    en: "Five Elements", zh: "五行", style: "D",
    left: "62%", top: "5%", size: "md", layer: "front",
    delay: 0.9, floatDuration: 13, bobY: 8, driftX: 5, bobDuration: 4.8,
    startX: 20, startY: 55,
    tooltip: "Five Elements — Wood, Fire, Earth, Metal and Water in balance",
    mobileShow: false,
  },
  {
    en: "Feng Shui", zh: "风水", style: "E",
    left: "80%", top: "4%", size: "lg", layer: "mid",
    delay: 2.0, floatDuration: 15, bobY: 6, driftX: 4, bobDuration: 5.5,
    startX: 30, startY: 65,
    tooltip: "Feng Shui — the ancient art of space arrangement for harmony and flow",
    mobileShow: true,
  },

  // ── LEFT STRIP ─────────────────────────────────────────────────────────────
  {
    en: "Sha Qi", zh: "煞气", style: "F",
    left: "3%", top: "20%", size: "sm", layer: "back",
    delay: 4.0, floatDuration: 18, bobY: 4, driftX: 2, bobDuration: 6.0,
    startX: -45, startY: 40,
    tooltip: "Sha Qi — harmful cutting energy from sharp corners and angles",
    mobileShow: false,
  },
  {
    en: "Ming Tang", zh: "明堂", style: "G",
    left: "6%", top: "35%", size: "md", layer: "mid",
    delay: 1.8, floatDuration: 14, bobY: 7, driftX: 4, bobDuration: 4.5,
    startX: -35, startY: 55,
    tooltip: "Ming Tang — the bright hall, open space before the main entrance",
    mobileShow: false,
  },
  {
    en: "Commanding Position", zh: "主位", style: "H",
    left: "2%", top: "52%", size: "sm", layer: "back",
    delay: 5.5, floatDuration: 17, bobY: 4, driftX: 3, bobDuration: 5.8,
    startX: -55, startY: 70,
    tooltip: "Commanding Position — placing key furniture to see the door",
    mobileShow: true,
  },
  {
    en: "Wood", zh: "木", style: "I",
    left: "9%", top: "67%", size: "sm", layer: "mid",
    delay: 3.2, floatDuration: 13, bobY: 6, driftX: 4, bobDuration: 4.0,
    startX: -30, startY: 50,
    tooltip: "Wood — growth, vitality and upward expanding energy",
    mobileShow: false,
  },
  {
    en: "Fire", zh: "火", style: "J",
    left: "4%", top: "82%", size: "md", layer: "front",
    delay: 0.5, floatDuration: 12, bobY: 8, driftX: 5, bobDuration: 3.5,
    startX: -25, startY: 45,
    tooltip: "Fire — passion, fame and transformative energy",
    mobileShow: true,
  },

  // ── RIGHT STRIP ────────────────────────────────────────────────────────────
  {
    en: "Earth", zh: "土", style: "K",
    left: "85%", top: "20%", size: "sm", layer: "back",
    delay: 6.0, floatDuration: 18, bobY: 4, driftX: 2, bobDuration: 5.5,
    startX: 50, startY: 40,
    tooltip: "Earth — stability, nourishment and grounding energy",
    mobileShow: false,
  },
  {
    en: "Metal", zh: "金", style: "L",
    left: "89%", top: "33%", size: "md", layer: "front",
    delay: 1.5, floatDuration: 13, bobY: 7, driftX: 4, bobDuration: 4.2,
    startX: 40, startY: 55,
    tooltip: "Metal — clarity, precision and contracting energy",
    mobileShow: true,
  },
  {
    en: "Water", zh: "水", style: "A",
    left: "93%", top: "48%", size: "sm", layer: "mid",
    delay: 3.8, floatDuration: 15, bobY: 5, driftX: 3, bobDuration: 5.0,
    startX: 45, startY: 60,
    tooltip: "Water — wisdom, career flow and downward movement",
    mobileShow: false,
  },
  {
    en: "Wealth Zone", zh: "财位", style: "B",
    left: "87%", top: "63%", size: "md", layer: "mid",
    delay: 2.4, floatDuration: 14, bobY: 6, driftX: 4, bobDuration: 4.8,
    startX: 35, startY: 50,
    tooltip: "Wealth Zone — the south-east Bagua zone for prosperity and abundance",
    mobileShow: false,
  },
  {
    en: "Career Path", zh: "事业", style: "C",
    left: "91%", top: "80%", size: "sm", layer: "front",
    delay: 4.6, floatDuration: 12, bobY: 7, driftX: 5, bobDuration: 3.8,
    startX: 40, startY: 45,
    tooltip: "Career Path — the north Bagua zone for life direction and purpose",
    mobileShow: true,
  },

  // ── BOTTOM STRIP ───────────────────────────────────────────────────────────
  {
    en: "Relationships", zh: "感情", style: "D",
    left: "15%", top: "88%", size: "md", layer: "front",
    delay: 0.7, floatDuration: 11, bobY: 8, driftX: 5, bobDuration: 3.5,
    startX: -20, startY: 55,
    tooltip: "Relationships — the south-west Bagua zone for love and partnerships",
    mobileShow: false,
  },
  {
    en: "Family", zh: "家庭", style: "E",
    left: "32%", top: "93%", size: "sm", layer: "mid",
    delay: 5.2, floatDuration: 16, bobY: 5, driftX: 3, bobDuration: 5.2,
    startX: 10, startY: 50,
    tooltip: "Family — the east Bagua zone for ancestors, health and community",
    mobileShow: false,
  },
  {
    en: "Fame", zh: "名誉", style: "F",
    left: "48%", top: "91%", size: "md", layer: "back",
    delay: 2.8, floatDuration: 17, bobY: 4, driftX: 2, bobDuration: 5.8,
    startX: -5, startY: 45,
    tooltip: "Fame — the south Bagua zone for recognition and reputation",
    mobileShow: false,
  },
  {
    en: "Knowledge", zh: "智慧", style: "G",
    left: "63%", top: "88%", size: "sm", layer: "front",
    delay: 7.5, floatDuration: 12, bobY: 6, driftX: 4, bobDuration: 4.0,
    startX: 15, startY: 55,
    tooltip: "Knowledge — the north-east Bagua zone for self-cultivation and wisdom",
    mobileShow: true,
  },
  {
    en: "Helpful People", zh: "贵人", style: "H",
    left: "80%", top: "92%", size: "md", layer: "mid",
    delay: 1.1, floatDuration: 14, bobY: 6, driftX: 4, bobDuration: 4.5,
    startX: 25, startY: 50,
    tooltip: "Helpful People — the north-west Bagua zone for mentors and benefactors",
    mobileShow: false,
  },

  // ── LEFT UPPER EDGE ────────────────────────────────────────────────────────
  {
    en: "Creativity", zh: "创意", style: "I",
    left: "16%", top: "14%", size: "sm", layer: "mid",
    delay: 6.8, floatDuration: 15, bobY: 5, driftX: 3, bobDuration: 5.5,
    startX: -35, startY: 50,
    tooltip: "Creativity — the west Bagua zone for children and creative projects",
    mobileShow: false,
  },
  {
    en: "Health", zh: "健康", style: "J",
    left: "19%", top: "26%", size: "sm", layer: "back",
    delay: 3.5, floatDuration: 17, bobY: 4, driftX: 2, bobDuration: 6.0,
    startX: -40, startY: 60,
    tooltip: "Health — the centre Bagua zone for overall wellbeing and balance",
    mobileShow: false,
  },

  // ── RIGHT UPPER EDGE ───────────────────────────────────────────────────────
  {
    en: "Flying Stars", zh: "飞星", style: "K",
    left: "79%", top: "14%", size: "sm", layer: "back",
    delay: 4.9, floatDuration: 18, bobY: 4, driftX: 2, bobDuration: 5.8,
    startX: 45, startY: 50,
    tooltip: "Flying Stars — a time-based energy mapping system in classical Feng Shui",
    mobileShow: false,
  },
  {
    en: "Luopan", zh: "罗盘", style: "L",
    left: "82%", top: "26%", size: "md", layer: "front",
    delay: 2.1, floatDuration: 13, bobY: 7, driftX: 4, bobDuration: 4.2,
    startX: 40, startY: 55,
    tooltip: "Luopan — the traditional Feng Shui compass used for site readings",
    mobileShow: false,
  },

  // ── LEFT MID ───────────────────────────────────────────────────────────────
  {
    en: "Dragon", zh: "龙", style: "A",
    left: "10%", top: "44%", size: "sm", layer: "mid",
    delay: 0.4, floatDuration: 14, bobY: 6, driftX: 4, bobDuration: 4.5,
    startX: -38, startY: 55,
    tooltip: "Dragon — the green dragon protective energy on the left side of a space",
    mobileShow: true,
  },
  {
    en: "Phoenix", zh: "凤", style: "B",
    left: "3%", top: "60%", size: "sm", layer: "back",
    delay: 7.0, floatDuration: 17, bobY: 4, driftX: 3, bobDuration: 5.5,
    startX: -50, startY: 65,
    tooltip: "Phoenix — the red phoenix energy in front of the space",
    mobileShow: false,
  },
  {
    en: "Tiger", zh: "虎", style: "C",
    left: "13%", top: "76%", size: "md", layer: "front",
    delay: 3.0, floatDuration: 12, bobY: 8, driftX: 5, bobDuration: 3.8,
    startX: -28, startY: 48,
    tooltip: "Tiger — the white tiger protective energy on the right side",
    mobileShow: false,
  },

  // ── RIGHT MID ──────────────────────────────────────────────────────────────
  {
    en: "Tortoise", zh: "龟", style: "D",
    left: "94%", top: "43%", size: "sm", layer: "mid",
    delay: 5.8, floatDuration: 16, bobY: 5, driftX: 3, bobDuration: 5.0,
    startX: 52, startY: 55,
    tooltip: "Tortoise — the black tortoise support energy behind the space",
    mobileShow: false,
  },
  {
    en: "Chi Energy", zh: "能量", style: "E",
    left: "87%", top: "58%", size: "sm", layer: "back",
    delay: 1.9, floatDuration: 18, bobY: 4, driftX: 2, bobDuration: 6.0,
    startX: 48, startY: 70,
    tooltip: "Chi Energy — the universal life force energy that flows through all things",
    mobileShow: false,
  },
  {
    en: "Harmony", zh: "和谐", style: "F",
    left: "94%", top: "72%", size: "md", layer: "front",
    delay: 6.4, floatDuration: 13, bobY: 7, driftX: 4, bobDuration: 4.2,
    startX: 42, startY: 52,
    tooltip: "Harmony — the balanced state of all energies working in concert",
    mobileShow: true,
  },

  // ── BOTTOM CENTRE ──────────────────────────────────────────────────────────
  {
    en: "Balance", zh: "平衡", style: "G",
    left: "23%", top: "82%", size: "sm", layer: "mid",
    delay: 4.2, floatDuration: 15, bobY: 5, driftX: 3, bobDuration: 5.2,
    startX: -18, startY: 48,
    tooltip: "Balance — the equal distribution of yin and yang forces in a space",
    mobileShow: false,
  },
  {
    en: "Prosperity", zh: "繁荣", style: "H",
    left: "38%", top: "84%", size: "md", layer: "front",
    delay: 2.6, floatDuration: 12, bobY: 8, driftX: 5, bobDuration: 3.8,
    startX: 8, startY: 55,
    tooltip: "Prosperity — the abundant flow of wealth energy and good fortune",
    mobileShow: true,
  },
  {
    en: "Auspicious", zh: "吉祥", style: "I",
    left: "56%", top: "86%", size: "sm", layer: "back",
    delay: 8.0, floatDuration: 17, bobY: 4, driftX: 2, bobDuration: 5.8,
    startX: 12, startY: 50,
    tooltip: "Auspicious — bringing good fortune and positive energy into a space",
    mobileShow: false,
  },
]

// ── Per-badge deterministic breathing values ──────────────────────────────────
function breathingValues(i: number) {
  // Stable pseudo-random via sin — unique per index, consistent across renders
  const r = (n: number) => Math.abs(Math.sin(i * n + 1.618))
  return {
    rx1: r(1) * 36 - 18,   // -18 → 18 px
    rx2: r(2) * 36 - 18,
    rx3: r(3) * 36 - 18,
    ry1: r(4) * 28 - 14,   // -14 → 14 px
    ry2: r(5) * 28 - 14,
    ry3: r(6) * 28 - 14,
    xDur:      12 + r(7)  * 10,   // 12–22 s
    yDur:      13 + r(8)  * 10,   // 13–23 s  (offset from x for organic path)
    scaleDur:   4 + r(9)  * 3,    //  4–7 s
    opacityDur: 5 + r(10) * 4,    //  5–9 s
  }
}

// ── Individual badge ──────────────────────────────────────────────────────────
const BadgeItem = memo(function BadgeItem({ badge, index }: { badge: BadgeConfig; index: number }) {
  const rs = REST_SCALE[badge.layer]
  const ro = REST_OPACITY[badge.layer]

  // Switch from float-in to breathing after arrival
  const [arrived, setArrived] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Stable per-badge breathing values — never recomputed
  const b = useMemo(() => breathingValues(index), [index])

  // Timer-based arrival — fires exactly when float-in animation ends
  useEffect(() => {
    const ms = (badge.delay + badge.floatDuration) * 1000
    const t = setTimeout(() => setArrived(true), ms)
    return () => clearTimeout(t)
  }, [badge.delay, badge.floatDuration])

  const onEnter = useCallback(() => {
    setHovered(true)
    tooltipTimer.current = setTimeout(() => setShowTooltip(true), 500)
  }, [])

  const onLeave = useCallback(() => {
    setHovered(false)
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current)
    setShowTooltip(false)
  }, [])

  const s = STYLES[badge.style]

  // ── Animation states ─────────────────────────────────────────────────────
  let currentAnimate: TargetAndTransition
  let currentTransition: Transition

  if (!arrived) {
    // Phase 0 — float-in from far away
    currentAnimate = { scale: rs, opacity: ro, x: 0, y: 0 }
    currentTransition = {
      duration: badge.floatDuration,
      delay: badge.delay,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    }
  } else if (hovered) {
    // Phase 2 — hover lift
    currentAnimate = { scale: rs * 1.15, opacity: 1, x: 0, y: 0 }
    currentTransition = { duration: 0.25, ease: "easeOut" }
  } else {
    // Phase 1 — organic orbital drift + breathing (runs after arrival)
    currentAnimate = {
      x: [0, b.rx1, b.rx2, b.rx3, 0],
      y: [0, b.ry1, b.ry2, b.ry3, 0],
      scale:   [rs * 0.96, rs * 1.04],
      opacity: [ro * 0.82, ro * 0.99],
    }
    currentTransition = {
      x:       { duration: b.xDur,       repeat: Infinity, ease: "easeInOut" },
      y:       { duration: b.yDur,       repeat: Infinity, ease: "easeInOut" },
      scale:   { duration: b.scaleDur,   repeat: Infinity, repeatType: "mirror" as const, ease: "easeInOut" },
      opacity: { duration: b.opacityDur, repeat: Infinity, repeatType: "mirror" as const, ease: "easeInOut" },
    }
  }

  const px = badge.size === "lg" ? "px-4 py-2" : badge.size === "md" ? "px-3.5 py-1.5" : "px-3 py-1"
  const enSize = badge.size === "lg" ? "text-[14px]" : badge.size === "md" ? "text-[12px]" : "text-[11px]"
  const zhSize = badge.size === "lg" ? "text-[11px]" : "text-[10px]"

  return (
    <motion.div
      className={`absolute ${badge.mobileShow ? "" : "hidden sm:block"}`}
      style={{
        left: badge.left,
        top: badge.top,
        zIndex: Z_IDX[badge.layer],
        willChange: "transform",
        pointerEvents: "auto",
        cursor: "default",
      }}
      initial={{ scale: 0.15, opacity: 0, x: badge.startX, y: badge.startY }}
      animate={currentAnimate}
      transition={currentTransition}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* Badge pill */}
      <div
        className={`rounded-full select-none ${px}`}
        style={{
          backgroundColor: s.bg,
          border: `1px solid ${s.border}`,
          boxShadow: hovered
            ? "0 4px 20px rgba(0,0,0,0.14)"
            : "0 2px 12px rgba(0,0,0,0.08)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          transition: "box-shadow 0.2s ease",
          whiteSpace: "nowrap",
        }}
      >
        <span className={`font-sans font-medium ${enSize}`} style={{ color: s.text }}>
          {badge.en}
        </span>
        <span
          className={`font-sans ml-1 ${zhSize}`}
          style={{ color: s.text, opacity: 0.65 }}
        >
          · {badge.zh}
        </span>
      </div>

      {/* Tooltip (appears after 0.5s hover) */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white border border-black rounded-lg px-2.5 py-1 shadow-md font-sans text-[11px] text-gray-800 whitespace-nowrap"
            style={{ zIndex: 50, pointerEvents: "none" }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
          >
            {badge.tooltip}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})

// ── Container ─────────────────────────────────────────────────────────────────
export function FloatingBadges() {
  return (
    <div
      className="absolute inset-0"
      style={{ pointerEvents: "none", zIndex: 1, overflow: "visible" }}
      aria-hidden
    >
      {/* Radial white gradient — keeps centre hero text clearly readable */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 520px 320px at 50% 44%, rgba(255,255,255,0.90) 0%, rgba(255,255,255,0.30) 55%, transparent 100%)",
          zIndex: 4,
          pointerEvents: "none",
        }}
      />

      {BADGES.map((badge, i) => (
        <BadgeItem key={i} badge={badge} index={i} />
      ))}
    </div>
  )
}
