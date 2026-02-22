"use client"

import { motion } from "framer-motion"
import {
  AlertTriangle, AlertCircle, Info, Map, CheckCircle,
  Bed, DoorOpen, Triangle, Layers, Droplets, Monitor, Wind, Scale,
} from "lucide-react"
import { FengShuiAnalysis } from "@/lib/room-types"
import { IssuesIllustration } from "./TabIllustrations"

interface IssuesTabProps {
  issues: FengShuiAnalysis["issues"]
  isActive?: boolean
}

const SEVERITY_CONFIG = {
  High: {
    badgeBg:      "#FEE2E2",
    badgeBorder:  "#FCA5A5",
    badgeText:    "#991B1B",
    badgeIcon:    <AlertTriangle size={11} color="#DC2626" />,
    cardBg:       "rgba(254, 226, 226, 0.22)",
    cardBorder:   "rgba(252, 165, 165, 0.4)",
    accentColor:  "#DC2626",
    iconBg:       "rgba(254, 226, 226, 0.45)",
    iconColor:    "#DC2626",
  },
  Medium: {
    badgeBg:      "#FEF3C7",
    badgeBorder:  "#FCD34D",
    badgeText:    "#92400E",
    badgeIcon:    <AlertCircle size={11} color="#D97706" />,
    cardBg:       "rgba(254, 243, 199, 0.22)",
    cardBorder:   "rgba(252, 211, 77, 0.4)",
    accentColor:  "#D97706",
    iconBg:       "rgba(254, 243, 199, 0.45)",
    iconColor:    "#D97706",
  },
  Low: {
    badgeBg:      "#F3F4F6",
    badgeBorder:  "#D1D5DB",
    badgeText:    "#374151",
    badgeIcon:    <Info size={11} color="#6B7280" />,
    cardBg:       "rgba(243, 244, 246, 0.25)",
    cardBorder:   "rgba(209, 213, 219, 0.4)",
    accentColor:  "#9CA3AF",
    iconBg:       "rgba(243, 244, 246, 0.45)",
    iconColor:    "#6B7280",
  },
} as const

const SEVERITY_ORDER: Record<string, number> = { High: 0, Medium: 1, Low: 2 }

function getIssueIcon(title: string, description: string, color: string): React.ReactNode {
  const text = ((title ?? "") + " " + (description ?? "")).toLowerCase()

  if (text.includes("bed") || text.includes("headboard") || text.includes("mattress"))
    return <Bed size={16} color={color} />
  if (text.includes("door") || text.includes("entrance") || text.includes("entry"))
    return <DoorOpen size={16} color={color} />
  if (text.includes("sharp") || text.includes("corner") || text.includes("arrow") || text.includes("poison"))
    return <Triangle size={16} color={color} />
  if (text.includes("mirror"))
    return <Layers size={16} color={color} />
  if (text.includes("water") || text.includes("fountain") || text.includes("aquarium"))
    return <Droplets size={16} color={color} />
  if (text.includes("desk") || text.includes("work") || text.includes("office") || text.includes("computer"))
    return <Monitor size={16} color={color} />
  if (text.includes("qi") || text.includes("flow") || text.includes("energy") || text.includes("chi"))
    return <Wind size={16} color={color} />
  if (text.includes("zone") || text.includes("bagua") || text.includes("sector") || text.includes("area"))
    return <Map size={16} color={color} />
  if (text.includes("element") || text.includes("balance") || text.includes("metal") || text.includes("earth"))
    return <Scale size={16} color={color} />
  return <AlertCircle size={16} color={color} />
}

export function IssuesTab({ issues, isActive = false }: IssuesTabProps) {
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
      {/* Illustration */}
      <div className="flex flex-col items-center mb-5">
        <IssuesIllustration isActive={isActive} />
        <p className="font-sans text-[11px] text-gray-400 italic mt-2">
          Areas where energy flow needs attention
        </p>
      </div>

      {sorted.map((issue, i) => {
        const sev = SEVERITY_CONFIG[issue.severity as keyof typeof SEVERITY_CONFIG] ?? SEVERITY_CONFIG.Low
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            className="rounded-2xl p-5 shadow-sm"
            style={{
              background:    sev.cardBg,
              border:        `1px solid ${sev.cardBorder}`,
              borderLeft:    `3px solid ${sev.accentColor}`,
            }}
          >
            {/* Top row: severity badge left, icon + zone badge right */}
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <span
                className="flex items-center gap-1.5 px-3 py-1 rounded-full font-sans text-[12px] font-bold"
                style={{
                  backgroundColor: sev.badgeBg,
                  border:          `1px solid ${sev.badgeBorder}`,
                  color:           sev.badgeText,
                }}
              >
                {sev.badgeIcon}
                {issue.severity ?? "Low"}
              </span>

              <div className="flex items-center gap-2">
                {/* Content-based icon circle */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: sev.iconBg }}
                >
                  {getIssueIcon(issue.title ?? "", issue.description ?? "", sev.iconColor)}
                </div>
                {/* Affected zone badge */}
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-black font-sans text-[12px] text-black">
                  <Map size={11} />
                  {issue.affected_zone ?? "General"}
                </span>
              </div>
            </div>

            <h4 className="font-sans text-[15px] font-bold text-black mb-1.5">{issue.title ?? "Issue"}</h4>
            <p className="font-sans text-[14px] leading-[1.6]" style={{ color: "#4B5563" }}>
              {issue.description ?? ""}
            </p>
          </motion.div>
        )
      })}
    </div>
  )
}
