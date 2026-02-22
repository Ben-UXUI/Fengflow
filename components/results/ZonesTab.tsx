"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { FengShuiAnalysis } from "@/lib/room-types"
import { ZonesIllustration } from "./TabIllustrations"

interface ZonesTabProps {
  zones: FengShuiAnalysis["zone_analysis"]
  isActive?: boolean
}

// Bagua grid: South at top (traditional orientation)
const BAGUA_GRID = [
  { name: "South-West", short: "SW" },
  { name: "South", short: "S" },
  { name: "South-East", short: "SE" },
  { name: "West", short: "W" },
  { name: "Centre", short: "CTR" },
  { name: "East", short: "E" },
  { name: "North-West", short: "NW" },
  { name: "North", short: "N" },
  { name: "North-East", short: "NE" },
]

const STATUS_COLORS: Record<string, { bg: string; dot: string }> = {
  Good:      { bg: "#F0F7F0", dot: "#4CAF50" },
  Attention: { bg: "#FEF3E2", dot: "#D4A843" },
  Issue:     { bg: "#FDECEA", dot: "#E74C3C" },
  default:   { bg: "#F5F5F5", dot: "#9E9E9E" },
}

const ELEMENT_CONFIG: Record<string, { bg: string; text: string; border: string; zh: string }> = {
  wood:  { bg: "#e8f5e8", text: "#1B5E20", border: "#4CAF50", zh: "木" },
  fire:  { bg: "#fee2e2", text: "#7F1D1D", border: "#E74C3C", zh: "火" },
  earth: { bg: "#fef3c7", text: "#78350F", border: "#D4A843", zh: "土" },
  metal: { bg: "#f3f4f6", text: "#374151", border: "#9E9E9E", zh: "金" },
  water: { bg: "#dbeafe", text: "#1E3A5F", border: "#2196F3", zh: "水" },
}

function getElementConfig(element: string) {
  return ELEMENT_CONFIG[element?.toLowerCase()] ?? ELEMENT_CONFIG.earth
}

export function ZonesTab({ zones, isActive = false }: ZonesTabProps) {
  const [openSet, setOpenSet] = useState<Set<number>>(new Set())

  const zoneMap = new Map(zones.map((z, idx) => [String(z?.zone ?? "").trim() || `_${idx}`, z]))

  const toggle = (i: number) => {
    setOpenSet((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  return (
    <div className="space-y-6">
      {/* Illustration */}
      <div className="flex flex-col items-center mb-1">
        <ZonesIllustration isActive={isActive} />
        <p className="font-sans text-[11px] text-gray-400 italic mt-2">
          The nine Bagua life zones in your space
        </p>
      </div>

      <p className="font-sans text-[14px] text-gray-500">
        How the nine Bagua life zones map to your current room arrangement.
      </p>

      {/* Bagua 3×3 grid */}
      <div>
        <p className="font-sans text-[12px] text-gray-400 uppercase tracking-wider mb-2">
          Your Bagua Map
        </p>
        <div className="grid grid-cols-3 gap-px rounded-xl overflow-hidden border border-[var(--border)]">
          {BAGUA_GRID.map(({ name, short }) => {
            const zone = zoneMap.get(name)
            const colors = (zone ? STATUS_COLORS[zone.status] : undefined) ?? STATUS_COLORS.default
            return (
              <div
                key={name}
                className="p-2.5 text-center"
                style={{ backgroundColor: colors.bg }}
              >
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: colors.dot }}
                  />
                  <span className="font-sans text-[11px] font-bold text-black leading-none">
                    {short}
                  </span>
                </div>
                <span className="font-sans text-[10px] text-gray-500 leading-tight block truncate">
                  {zone?.life_area ?? "—"}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Accordion rows */}
      <div className="space-y-1.5">
        {zones.map((zone, i) => {
          const isOpen = openSet.has(i)
          const el = getElementConfig(zone?.element ?? "earth")
          const colors = STATUS_COLORS[zone?.status ?? ""] ?? STATUS_COLORS.default

          return (
            <div key={i} className="border border-[var(--border)] rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggle(i)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: colors.dot }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-[14px] font-bold text-black leading-tight">
                    {zone?.zone ?? "Zone"}
                  </p>
                  <p className="font-sans text-[12px] text-gray-500 leading-tight">{zone?.life_area ?? "—"}</p>
                </div>
                <span
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full font-sans text-[11px] font-medium flex-shrink-0"
                  style={{ backgroundColor: el.bg, color: el.text }}
                >
                  {zone?.element ?? "—"} {el.zh}
                </span>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown size={16} className="text-gray-400" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="px-4 py-3 ml-7 font-sans text-[14px] text-gray-500 leading-[1.6] border-l-2"
                      style={{ borderColor: el.border }}
                    >
                      {zone?.note ?? "—"}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
