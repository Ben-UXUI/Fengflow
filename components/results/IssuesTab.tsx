"use client"

import { motion } from "framer-motion"
import { AlertTriangle, AlertCircle, Info, Map, CheckCircle } from "lucide-react"
import { FengShuiAnalysis } from "@/lib/room-types"

interface IssuesTabProps {
  issues: FengShuiAnalysis["issues"]
}

const SEVERITY_CONFIG = {
  High: {
    bg: "bg-black",
    text: "text-white",
    icon: <AlertTriangle size={11} />,
  },
  Medium: {
    bg: "bg-gray-700",
    text: "text-white",
    icon: <AlertCircle size={11} />,
  },
  Low: {
    bg: "bg-gray-200",
    text: "text-gray-700",
    icon: <Info size={11} />,
  },
} as const

const SEVERITY_ORDER: Record<string, number> = { High: 0, Medium: 1, Low: 2 }

export function IssuesTab({ issues }: IssuesTabProps) {
  const sorted = [...issues].sort(
    (a, b) => (SEVERITY_ORDER[a.severity] ?? 3) - (SEVERITY_ORDER[b.severity] ?? 3)
  )

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <CheckCircle size={56} className="text-black" />
        <h3 className="font-display font-bold text-[28px] text-black">Excellent Layout</h3>
        <p className="font-sans text-[14px] text-gray-500">
          No significant issues detected in your room arrangement.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="font-sans text-[14px] text-gray-500 mb-4">
        Areas that need attention in your current layout based on classical Feng Shui principles.
      </p>
      {sorted.map((issue, i) => {
        const sev = SEVERITY_CONFIG[issue.severity] ?? SEVERITY_CONFIG.Low
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            className="bg-white border border-black rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <span
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-sans text-[12px] font-bold ${sev.bg} ${sev.text}`}
              >
                {sev.icon}
                {issue.severity}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-black font-sans text-[12px] text-black">
                <Map size={11} />
                {issue.affected_zone}
              </span>
            </div>
            <h4 className="font-sans text-[16px] font-bold text-black mb-1.5">{issue.title}</h4>
            <p className="font-sans text-[14px] text-gray-500 leading-[1.6]">{issue.description}</p>
            <div className="mt-4 h-px bg-gray-100" />
          </motion.div>
        )
      })}
    </div>
  )
}
