"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Wall } from "@/lib/room-types"

interface CompassSelectorProps {
  northWall: Wall | null
  onSelectNorthWall: (wall: Wall) => void
}

const DIRS: { wall: Wall; label: string; angle: number; cardinal: boolean }[] = [
  { wall: "top",    label: "N",  angle: 0,   cardinal: true  },
  { wall: "top",    label: "NE", angle: 45,  cardinal: false },
  { wall: "right",  label: "E",  angle: 90,  cardinal: true  },
  { wall: "right",  label: "SE", angle: 135, cardinal: false },
  { wall: "bottom", label: "S",  angle: 180, cardinal: true  },
  { wall: "bottom", label: "SW", angle: 225, cardinal: false },
  { wall: "left",   label: "W",  angle: 270, cardinal: true  },
  { wall: "left",   label: "NW", angle: 315, cardinal: false },
]

const DIR_INFO: Record<string, { zone: string; element: string; color: string; life: string }> = {
  N:  { zone: "Career",        element: "Water", color: "#2196F3", life: "Career & Life Path" },
  NE: { zone: "Knowledge",     element: "Earth", color: "#D4A843", life: "Knowledge & Self-Cultivation" },
  E:  { zone: "Family",        element: "Wood",  color: "#4CAF50", life: "Family & Health" },
  SE: { zone: "Wealth",        element: "Wood",  color: "#4CAF50", life: "Wealth & Prosperity" },
  S:  { zone: "Fame",          element: "Fire",  color: "#E74C3C", life: "Fame & Reputation" },
  SW: { zone: "Relationships", element: "Earth", color: "#D4A843", life: "Love & Relationships" },
  W:  { zone: "Creativity",    element: "Metal", color: "#9E9E9E", life: "Creativity & Children" },
  NW: { zone: "Helpful People",element: "Metal", color: "#9E9E9E", life: "Helpful People & Travel" },
}

const SIZE = 220
const CX = SIZE / 2
const RING_R = 86

export function CompassSelector({ northWall, onSelectNorthWall }: CompassSelectorProps) {
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null)
  const [pulsing, setPulsing] = useState(false)

  useEffect(() => { if (northWall === null) setSelectedLabel(null) }, [northWall])

  const handleSelect = (wall: Wall, label: string) => {
    setSelectedLabel(label)
    onSelectNorthWall(wall)
    setPulsing(true)
    setTimeout(() => setPulsing(false), 500)
  }

  const info = selectedLabel ? DIR_INFO[selectedLabel] : null

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-sans text-[13px] font-bold text-black mb-1.5">Room Orientation</h3>
        <p className="font-sans text-[12px] text-gray-500 leading-[1.5]">
          Select the compass direction your main window or entrance faces. This aligns the Bagua
          energy map to your real space for an accurate analysis.
        </p>
      </div>

      {/* ── Compass ── */}
      <div className="flex justify-center">
        <div className="relative" style={{ width: SIZE, height: SIZE }}>

          {/* SVG: outer ring + spokes */}
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
                <line
                  key={i}
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
          >
            ☯
          </div>

          {/* Direction buttons */}
          {DIRS.map((d, i) => {
            const rad = ((d.angle - 90) * Math.PI) / 180
            const bx = CX + RING_R * Math.cos(rad)
            const by = CX + RING_R * Math.sin(rad)
            const isSelected = selectedLabel === d.label
            const sz = d.cardinal ? 36 : 30
            return (
              <motion.button
                key={i}
                type="button"
                onClick={() => handleSelect(d.wall, d.label)}
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
                {d.label}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* ── Feedback card ── */}
      <AnimatePresence mode="wait">
        {info ? (
          <motion.div
            key={selectedLabel!}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="bg-white border border-black rounded-xl p-3"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-sans text-[13px] font-bold text-black">
                Entrance faces {selectedLabel}
              </span>
              <span
                className="px-2 py-0.5 rounded-full font-sans text-[11px] font-medium"
                style={{ backgroundColor: info.color + "22", color: info.color }}
              >
                {info.element}
              </span>
            </div>
            <p className="font-sans text-[12px] text-gray-500">
              Primary: {info.zone} · {info.life}
            </p>
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
    </div>
  )
}
