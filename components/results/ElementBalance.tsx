"use client"

import { motion } from "framer-motion"
import { FengShuiAnalysis } from "@/lib/room-types"

interface ElementBalanceProps {
  elementBalance: FengShuiAnalysis["element_balance"]
}

const ELEMENTS = [
  { key: "wood" as const, label: "Wood", zh: "木", color: "#4CAF50" },
  { key: "fire" as const, label: "Fire", zh: "火", color: "#E74C3C" },
  { key: "earth" as const, label: "Earth", zh: "土", color: "#D4A843" },
  { key: "metal" as const, label: "Metal", zh: "金", color: "#9E9E9E" },
  { key: "water" as const, label: "Water", zh: "水", color: "#2196F3" },
]

export function ElementBalance({ elementBalance }: ElementBalanceProps) {
  return (
    <div className="space-y-3">
      <p className="font-sans text-[12px] text-gray-400 uppercase tracking-wider">Element Balance</p>
      {ELEMENTS.map((el, i) => {
        const pct = Math.min(100, Math.max(0, elementBalance[el.key] ?? 0))
        return (
          <div key={el.key} className="flex items-center gap-2">
            <span className="font-sans text-[12px] text-gray-700 w-9 flex-shrink-0">{el.label}</span>
            <span className="font-sans text-[11px] text-gray-400 w-4 flex-shrink-0">{el.zh}</span>
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: el.color }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: i * 0.1, duration: 1, ease: "easeOut" }}
              />
            </div>
            <span className="font-sans text-[12px] text-gray-400 w-8 text-right flex-shrink-0">{pct}%</span>
          </div>
        )
      })}
      {elementBalance.assessment && (
        <p className="font-sans text-[12px] text-gray-400 italic pt-1">{elementBalance.assessment}</p>
      )}
    </div>
  )
}
