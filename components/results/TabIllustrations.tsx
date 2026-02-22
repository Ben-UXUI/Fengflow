"use client"

import React from "react"
import { motion } from "framer-motion"

// ── Issues Tab: room outline with pulsing red dots ──────────────────────────
const ISSUE_DOTS = [
  { cx: 18, cy: 16 },
  { cx: 44, cy: 34 },
  { cx: 20, cy: 46 },
]

export function IssuesIllustration({ isActive }: { isActive: boolean }) {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
      {/* Room outline */}
      <rect x="4" y="4" width="52" height="52" stroke="#D0D0D0" strokeWidth="1.5" rx="2" />
      {/* Door gap hint */}
      <rect x="4" y="27" width="4" height="9" fill="white" />
      {/* Window hint */}
      <rect x="19" y="4" width="10" height="3" fill="white" />
      <line x1="24" y1="4" x2="24" y2="7" stroke="#D0D0D0" strokeWidth="0.5" />
      {/* Problem dots */}
      {ISSUE_DOTS.map((pos, i) => (
        <motion.circle
          key={i}
          cx={pos.cx}
          cy={pos.cy}
          r={3.5}
          fill="#DC2626"
          animate={
            isActive
              ? { scale: [1, 1.55, 1], opacity: [0.65, 1, 0.65] }
              : { scale: 1, opacity: 0.65 }
          }
          transition={{
            duration: 1.2,
            repeat: isActive ? Infinity : 0,
            delay: i * 0.5,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: `${pos.cx}px ${pos.cy}px` }}
        />
      ))}
    </svg>
  )
}

// ── Zones Tab: 3×3 Bagua grid cells filling in sequentially ────────────────
const ZONE_COLORS = [
  "#E2A4A4", "#E74C3C", "#B8962E",
  "#9B8EC4", "#D4A843", "#4CAF50",
  "#9B8EC4", "#2196F3", "#D4A843",
]
const CELL = 22
const GAP  = 1
const GRID  = 3 * CELL + 2 * GAP

export function ZonesIllustration({ isActive }: { isActive: boolean }) {
  return (
    <svg width={GRID} height={GRID} viewBox={`0 0 ${GRID} ${GRID}`} fill="none">
      <rect width={GRID} height={GRID} stroke="#D0D0D0" strokeWidth="1" rx="1" />
      {ZONE_COLORS.map((color, i) => {
        const col = i % 3
        const row = Math.floor(i / 3)
        const x = col * (CELL + GAP)
        const y = row * (CELL + GAP)
        return (
          <motion.rect
            key={i}
            x={x} y={y} width={CELL} height={CELL}
            fill={color}
            initial={{ opacity: 0 }}
            animate={isActive ? { opacity: [0, 0.32, 0.14, 0] } : { opacity: 0 }}
            transition={{
              duration: 1.5,
              delay: i * 0.3,
              repeat: isActive ? Infinity : 0,
              repeatDelay: 1,
              ease: "easeInOut",
            }}
          />
        )
      })}
      {/* Grid lines */}
      {[CELL + GAP, 2 * (CELL + GAP)].map((pos) => (
        <React.Fragment key={pos}>
          <line x1={pos} y1={0} x2={pos} y2={GRID} stroke="#D0D0D0" strokeWidth="0.5" />
          <line x1={0} y1={pos} x2={GRID} y2={pos} stroke="#D0D0D0" strokeWidth="0.5" />
        </React.Fragment>
      ))}
    </svg>
  )
}

// ── Positives Tab: growing plant with leaves and gold sparkle ───────────────
const CYCLE = 4

export function PositivesIllustration({ isActive }: { isActive: boolean }) {
  return (
    <svg width="50" height="52" viewBox="0 0 50 52" fill="none">
      {/* Stem */}
      <motion.path
        d="M 25 49 L 25 12"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={isActive ? { pathLength: [0, 1, 1, 0] } : { pathLength: 0 }}
        transition={{
          duration: CYCLE,
          times: [0, 0.20, 0.84, 1],
          repeat: isActive ? Infinity : 0,
          ease: "easeOut",
        }}
      />
      {/* Left leaf */}
      <motion.path
        d="M 25 30 Q 8 24 12 13"
        stroke="#1A1A1A"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={isActive ? { pathLength: [0, 0, 1, 1, 0] } : { pathLength: 0 }}
        transition={{
          duration: CYCLE,
          times: [0, 0.20, 0.40, 0.84, 1],
          repeat: isActive ? Infinity : 0,
          ease: "easeOut",
        }}
      />
      {/* Right leaf */}
      <motion.path
        d="M 25 30 Q 42 24 38 13"
        stroke="#1A1A1A"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={isActive ? { pathLength: [0, 0, 1, 1, 0] } : { pathLength: 0 }}
        transition={{
          duration: CYCLE,
          times: [0, 0.25, 0.45, 0.84, 1],
          repeat: isActive ? Infinity : 0,
          ease: "easeOut",
        }}
      />
      {/* Gold sparkle dot */}
      <motion.circle
        cx={25}
        cy={8}
        r={4.5}
        fill="#B8962E"
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: [0, 0, 0, 1, 1, 0] } : { opacity: 0 }}
        transition={{
          duration: CYCLE,
          times: [0, 0.20, 0.44, 0.54, 0.84, 1],
          repeat: isActive ? Infinity : 0,
        }}
      />
    </svg>
  )
}

// ── Recommendations Tab: 3 priority lines drawing left to right ─────────────
const REC_LINES = [
  { y: 14, color: "#1A1A1A", lineWidth: 62, dot: 5.5 },
  { y: 28, color: "#555555", lineWidth: 48, dot: 4.5 },
  { y: 42, color: "#AAAAAA", lineWidth: 34, dot: 3.5 },
]

export function RecommendationsIllustration({ isActive }: { isActive: boolean }) {
  return (
    <svg width="88" height="54" viewBox="0 0 88 54" fill="none">
      {REC_LINES.map((line, i) => {
        const x1 = line.dot * 2 + 5
        const x2 = x1 + line.lineWidth
        const d = `M ${x1} ${line.y} L ${x2} ${line.y}`
        return (
          <g key={i}>
            <circle cx={line.dot + 1} cy={line.y} r={line.dot} fill={line.color} />
            <motion.path
              d={d}
              stroke={line.color}
              strokeWidth={3.5}
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={isActive ? { pathLength: [0, 1, 1, 0] } : { pathLength: 0 }}
              transition={{
                duration: 3.5,
                times: [0, 0.35, 0.80, 1],
                delay: i * 0.3,
                repeat: isActive ? Infinity : 0,
                repeatDelay: 1,
                ease: "easeOut",
              }}
            />
          </g>
        )
      })}
    </svg>
  )
}
