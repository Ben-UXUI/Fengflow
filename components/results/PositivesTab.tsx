"use client"

import { motion } from "framer-motion"
import { CheckCircle } from "lucide-react"
import { FengShuiAnalysis } from "@/lib/room-types"

interface PositivesTabProps {
  features: FengShuiAnalysis["auspicious_features"]
}

export function PositivesTab({ features }: PositivesTabProps) {
  return (
    <div className="space-y-3">
      <p className="font-sans text-[14px] text-gray-500 mb-4">
        What your layout is already doing well according to classical Feng Shui.
      </p>

      {features.length === 0 && (
        <p className="font-sans text-[14px] text-gray-400 text-center py-8">
          No positive features identified yet.
        </p>
      )}

      {features.map((feature, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1, duration: 0.3 }}
          className="flex items-start gap-4 bg-[#FDFAF5] border-l-[3px] border-black rounded-xl px-5 py-4"
        >
          <CheckCircle size={24} className="text-black flex-shrink-0 mt-0.5" />
          <p className="font-sans text-[15px] text-black leading-[1.6]">{feature}</p>
        </motion.div>
      ))}

      {features.length < 3 && (
        <p className="font-sans text-[13px] text-gray-400 italic mt-4 pt-2 border-t border-gray-100">
          Tip: Adding Feng Shui specific items like plants, mirrors and water features can increase
          your positive features score.
        </p>
      )}
    </div>
  )
}
