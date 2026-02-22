"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Direction, Wall } from "@/lib/room-types"

interface CompassSelectorProps {
  facingDirection: Direction | null
  onSelectFacingDirection: (dir: Direction) => void
}

const DIRS: { dir: Direction; angle: number; cardinal: boolean }[] = [
  { dir: "N",  angle: 0,   cardinal: true  },
  { dir: "NE", angle: 45,  cardinal: false },
  { dir: "E",  angle: 90,  cardinal: true  },
  { dir: "SE", angle: 135, cardinal: false },
  { dir: "S",  angle: 180, cardinal: true  },
  { dir: "SW", angle: 225, cardinal: false },
  { dir: "W",  angle: 270, cardinal: true  },
  { dir: "NW", angle: 315, cardinal: false },
]

// Which wall the door appears on for each facing direction
const FACING_WALL_LABEL: Record<Direction, string> = {
  N:  "top wall",         NE: "top wall (right)",
  E:  "right wall",       SE: "right wall (bottom)",
  S:  "bottom wall",      SW: "bottom wall (left)",
  W:  "left wall",        NW: "left wall (top)",
}

const DIR_INFO: Record<Direction, {
  zone: string; chinese: string; element: string; color: string; feedback: string
  auspice: string; auspiceColor: string; auspiceBg: string
}> = {
  N:  { zone: "Career",         chinese: "事业", element: "Water", color: "#2196F3", feedback: "Career zone activated at entrance · Water element",           auspice: "Neutral",      auspiceColor: "#B8962E", auspiceBg: "#FEF3E2" },
  NE: { zone: "Knowledge",      chinese: "智慧", element: "Earth", color: "#D4A843", feedback: "Knowledge zone at entrance · Earth element",                 auspice: "Standard",     auspiceColor: "#666666", auspiceBg: "#F5F5F5" },
  E:  { zone: "Family",         chinese: "家庭", element: "Wood",  color: "#4CAF50", feedback: "Family zone at entrance · Wood element",                     auspice: "Standard",     auspiceColor: "#666666", auspiceBg: "#F5F5F5" },
  SE: { zone: "Wealth",         chinese: "财富", element: "Wood",  color: "#4CAF50", feedback: "Wealth zone at entrance · Wood element — most auspicious",   auspice: "Auspicious ✦", auspiceColor: "#1A5C3A", auspiceBg: "#E8F5EE" },
  S:  { zone: "Fame",           chinese: "名誉", element: "Fire",  color: "#E74C3C", feedback: "Fame zone at entrance · Fire element — highly auspicious",   auspice: "Auspicious ✦", auspiceColor: "#1A5C3A", auspiceBg: "#E8F5EE" },
  SW: { zone: "Relationships",  chinese: "感情", element: "Earth", color: "#D4A843", feedback: "Relationships zone at entrance · Earth element",             auspice: "Standard",     auspiceColor: "#666666", auspiceBg: "#F5F5F5" },
  W:  { zone: "Creativity",     chinese: "创意", element: "Metal", color: "#9E9E9E", feedback: "Creativity zone at entrance · Metal element",               auspice: "Standard",     auspiceColor: "#666666", auspiceBg: "#F5F5F5" },
  NW: { zone: "Helpful People", chinese: "贵人", element: "Metal", color: "#9E9E9E", feedback: "Helpful People zone at entrance · Metal element — very auspicious", auspice: "Neutral", auspiceColor: "#B8962E", auspiceBg: "#FEF3E2" },
}

const SIZE = 220
const CX = SIZE / 2
const RING_R = 86

export function CompassSelector({ facingDirection, onSelectFacingDirection }: CompassSelectorProps) {
  const [pulsing, setPulsing] = useState(false)

  const handleSelect = (dir: Direction) => {
    onSelectFacingDirection(dir)
    setPulsing(true)
    setTimeout(() => setPulsing(false), 500)
  }

  const info = facingDirection ? DIR_INFO[facingDirection] : null

  return (
    <div className="space-y-3">
      {/* Heading + explanation */}
      <div>
        <h3 className="font-sans text-[13px] font-bold text-black mb-1.5">Facing Direction</h3>
        <p className="font-sans text-[12px] text-gray-500 leading-[1.6]">
          Which direction does your main door or largest window face outward? Stand at your door
          looking out — that direction is your Facing Direction.
        </p>
      </div>

      {/* Small diagram */}
      <div className="flex justify-center">
        <svg width="90" height="62" viewBox="0 0 90 62" fill="none" className="overflow-visible">
          {/* Room box */}
          <rect x="22" y="4" width="46" height="34" rx="1" stroke="#D0D0D0" strokeWidth="1.5" fill="#F8F6F2" />
          {/* "You" label */}
          <text x="45" y="23" textAnchor="middle" fontSize="7" fill="#AAAAAA" fontFamily="sans-serif">You</text>
          {/* Door gap on bottom wall */}
          <line x1="22" y1="38" x2="36" y2="38" stroke="#D0D0D0" strokeWidth="1.5" />
          <line x1="54" y1="38" x2="68" y2="38" stroke="#D0D0D0" strokeWidth="1.5" />
          <line x1="22" y1="38" x2="22" y2="38" stroke="#D0D0D0" strokeWidth="1.5" />
          {/* White gap for door */}
          <rect x="36" y="36" width="18" height="4" fill="#F8F6F2" />
          {/* Outward arrow */}
          <line x1="45" y1="38" x2="45" y2="54" stroke="#555555" strokeWidth="1.5" />
          <polygon points="45,58 41,51 49,51" fill="#555555" />
          {/* "Facing →" labels */}
          <text x="57" y="50" fontSize="6.5" fill="#888888" fontFamily="sans-serif">Facing</text>
          <text x="57" y="58" fontSize="6.5" fill="#888888" fontFamily="sans-serif">Direction</text>
        </svg>
      </div>

      {/* Compass rose */}
      <div className="flex justify-center">
        <div className="relative" style={{ width: SIZE, height: SIZE }}>
          <svg
            className="absolute inset-0 pointer-events-none"
            width={SIZE} height={SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
          >
            <circle cx={CX} cy={CX} r={CX - 6} fill="none" stroke="#1A1A1A" strokeWidth="1.5" />
            <circle cx={CX} cy={CX} r={18} fill="white" stroke="#E0E0E0" strokeWidth="1" />
            {DIRS.map((d, i) => {
              const rad = ((d.angle - 90) * Math.PI) / 180
              return (
                <line key={i}
                  x1={CX} y1={CX}
                  x2={(CX + RING_R * Math.cos(rad)).toFixed(1)}
                  y2={(CX + RING_R * Math.sin(rad)).toFixed(1)}
                  stroke="#E0E0E0" strokeWidth="1"
                />
              )
            })}
          </svg>

          {/* Centre ☯ */}
          <div
            className="absolute flex items-center justify-center select-none"
            style={{ width: 36, height: 36, left: CX - 18, top: CX - 18, fontSize: 22, lineHeight: 1 }}
          >☯</div>

          {/* Direction buttons */}
          {DIRS.map((d, i) => {
            const rad = ((d.angle - 90) * Math.PI) / 180
            const bx = CX + RING_R * Math.cos(rad)
            const by = CX + RING_R * Math.sin(rad)
            const isSelected = facingDirection === d.dir
            const sz = d.cardinal ? 36 : 30
            return (
              <motion.button
                key={i}
                type="button"
                onClick={() => handleSelect(d.dir)}
                className="absolute flex items-center justify-center rounded-full border-2 font-sans font-bold transition-colors"
                style={{
                  width: sz, height: sz,
                  left: bx - sz / 2, top: by - sz / 2,
                  fontSize: d.cardinal ? "13px" : "10px",
                  backgroundColor: isSelected ? "#0A0A0A" : "white",
                  color: isSelected ? "white" : "#0A0A0A",
                  borderColor: isSelected ? "#0A0A0A" : "#CCCCCC",
                  zIndex: 10,
                }}
                animate={isSelected && pulsing ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                {d.dir}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Feedback card */}
      <AnimatePresence mode="wait">
        {info ? (
          <motion.div
            key={facingDirection!}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="bg-white border border-black rounded-xl p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-sans text-[13px] font-bold text-black">
                Entrance faces {facingDirection}
              </span>
              <span
                className="px-2 py-0.5 rounded-full font-sans text-[11px] font-medium"
                style={{ backgroundColor: info.auspiceBg, color: info.auspiceColor }}
              >
                {info.auspice}
              </span>
            </div>
            <p className="font-sans text-[11px] text-gray-500 leading-[1.5]">
              {info.feedback}
            </p>
            <div className="flex items-center gap-1.5 pt-1 border-t border-gray-100">
              <span
                className="px-2 py-0.5 rounded-full font-sans text-[10px] font-medium"
                style={{ backgroundColor: info.color + "22", color: info.color }}
              >
                {info.element}
              </span>
              <span className="font-sans text-[10px] text-gray-400">
                {info.zone} · {info.chinese}
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-sans text-[12px] text-gray-400 italic text-center py-1"
          >
            Select a direction to see your Bagua alignment
          </motion.p>
        )}
      </AnimatePresence>

      {/* Confirmation message */}
      <AnimatePresence>
        {info && facingDirection && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-0.5 pt-1">
              <p className="font-sans text-[11px] font-medium" style={{ color: "#1A5C3A" }}>
                ✓ Your main entrance faces {facingDirection}
              </p>
              <p className="font-sans text-[11px]" style={{ color: "#1A5C3A" }}>
                The {info.zone} Bagua zone is most activated
              </p>
              <p className="font-sans text-[11px] text-gray-400">
                Door placed on {FACING_WALL_LABEL[facingDirection]}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
