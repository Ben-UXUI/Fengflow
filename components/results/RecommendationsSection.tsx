"use client"

import { motion } from "framer-motion"
import { Lightbulb } from "lucide-react"
import { FengShuiAnalysis } from "@/lib/room-types"

interface RecommendationsSectionProps {
  recommendations: FengShuiAnalysis["recommendations"]
}

const EFFORT_CONFIG: Record<string, { bg: string; text: string }> = {
  Easy:   { bg: "#e8f5e8", text: "#1B5E20" },
  Medium: { bg: "#fef3c7", text: "#78350F" },
  Effort: { bg: "#fee2e2", text: "#7F1D1D" },
  Hard:   { bg: "#fee2e2", text: "#7F1D1D" },
}

export function RecommendationsSection({ recommendations }: RecommendationsSectionProps) {
  const sorted = [...recommendations].sort((a, b) => a.priority - b.priority)

  if (sorted.length === 0) return null

  return (
    <div className="mt-10 space-y-4">
      <h3 className="font-display font-bold text-[28px] text-black flex items-center gap-2">
        <Lightbulb size={22} className="flex-shrink-0" />
        Recommendations
      </h3>

      {sorted.map((rec, i) => {
        const effort = EFFORT_CONFIG[rec.effort] ?? EFFORT_CONFIG.Medium
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
            className="bg-white border border-black rounded-2xl p-5"
          >
            <div className="flex items-start gap-5">
              {/* Priority circle */}
              <div className="flex-shrink-0 w-14 h-14 rounded-full border-2 border-black flex items-center justify-center">
                <span
                  className="font-display font-bold text-black leading-none"
                  style={{ fontSize: "30px" }}
                >
                  {rec.priority}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-sans text-[15px] font-bold text-black">{rec.title}</h4>
                  <span
                    className="flex-shrink-0 px-2.5 py-1 rounded-full font-sans text-[11px] font-medium"
                    style={{ backgroundColor: effort.bg, color: effort.text }}
                  >
                    {rec.effort}
                  </span>
                </div>
                <p className="font-sans text-[14px] text-gray-500 leading-[1.6] mb-2">
                  {rec.action}
                </p>
                <p className="font-sans text-[13px] text-gray-400 italic flex items-start gap-1.5">
                  <Lightbulb size={13} className="mt-0.5 flex-shrink-0 text-gray-400" />
                  <span>Why: {rec.reason}</span>
                </p>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
