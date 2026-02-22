"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import { LayoutDashboard, Compass, Package, AlertTriangle, Map, Sparkles, Lightbulb, Calendar, RotateCcw } from "lucide-react"
import { FengShuiAnalysis, LayoutData } from "@/lib/room-types"
import { ScoreBadge } from "@/components/results/ScoreBadge"
import { ElementBalance } from "@/components/results/ElementBalance"
import { IssuesTab } from "@/components/results/IssuesTab"
import { ZonesTab } from "@/components/results/ZonesTab"
import { PositivesTab } from "@/components/results/PositivesTab"
import { RecommendationsTab } from "@/components/results/RecommendationsTab"

const RoomPreview = dynamic(
  () => import("@/components/results/RoomPreview").then((mod) => ({ default: mod.RoomPreview })),
  { ssr: false }
)

const TABS = [
  { id: "issues",          label: "Issues",          icon: <AlertTriangle size={14} /> },
  { id: "zones",           label: "Zones",           icon: <Map size={14} /> },
  { id: "positives",       label: "Positives",       icon: <Sparkles size={14} /> },
  { id: "recommendations", label: "Recommendations", icon: <Lightbulb size={14} /> },
] as const

type TabId = typeof TABS[number]["id"]

export default function ResultsPage() {
  const router = useRouter()
  const [analysis, setAnalysis] = useState<FengShuiAnalysis | null>(null)
  const [layoutData, setLayoutData] = useState<LayoutData | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>("issues")

  useEffect(() => {
    const storedAnalysis = sessionStorage.getItem("fengflow_analysis")
    const storedLayout = sessionStorage.getItem("fengflow_layout")
    if (!storedAnalysis || !storedLayout) { router.push("/editor"); return }
    try {
      setAnalysis(JSON.parse(storedAnalysis))
      setLayoutData(JSON.parse(storedLayout))
    } catch {
      router.push("/editor")
    }
  }, [router])

  if (!analysis || !layoutData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="text-4xl" style={{ animation: "spin 1s linear infinite" }}>☯</span>
          <p className="font-sans text-[var(--text-secondary)]">Loading analysis...</p>
        </div>
      </div>
    )
  }

  const issues = Array.isArray(analysis.issues) ? analysis.issues : []
  const zoneAnalysis = Array.isArray(analysis.zone_analysis) ? analysis.zone_analysis : []
  const positives = Array.isArray(analysis.auspicious_features) ? analysis.auspicious_features : []
  const recommendations = Array.isArray(analysis.recommendations) ? analysis.recommendations : []

  return (
    <div className="flex flex-col md:flex-row md:h-[calc(100vh-4rem)] bg-white overflow-hidden">

      {/* ═══════════════════════════════════════
          LEFT COLUMN — sticky room preview panel
      ═══════════════════════════════════════ */}
      <div className="md:w-[40%] md:flex-shrink-0 md:border-r border-black md:overflow-y-auto">
        <div className="p-6 space-y-5">

          {/* Room preview */}
          <div className="rounded-2xl overflow-hidden border border-[var(--border)]">
            <RoomPreview layoutData={layoutData} />
          </div>

          {/* Metadata chips */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black font-sans text-[13px] text-black">
              <LayoutDashboard size={13} />
              {layoutData.room.type}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black font-sans text-[13px] text-black">
              <Compass size={13} />
              {layoutData.room.facingDirection ?? (layoutData.room as { northWall?: string }).northWall ?? "—"}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black font-sans text-[13px] text-black">
              <Package size={13} />
              {Array.isArray(layoutData.furniture) ? layoutData.furniture.length : 0} items
            </div>
          </div>

          {/* Score badge */}
          <div className="flex justify-center py-4">
            <ScoreBadge score={typeof analysis.overall_score === "number" ? analysis.overall_score : 0} />
          </div>

          {/* Harmony level + overall summary */}
          <div className="space-y-2 text-center">
            <p
              className="font-display italic text-[18px]"
              style={{ color: "#555" }}
            >
              {analysis.harmony_level ?? "—"}
            </p>
            <p className="font-display text-[17px] leading-[1.8] text-gray-600">
              {analysis.overall_summary ?? "No summary available."}
            </p>
          </div>

          {/* Element balance */}
          {analysis.element_balance && (
            <ElementBalance elementBalance={analysis.element_balance} />
          )}

        </div>
      </div>

      {/* ═══════════════════════════════════════
          RIGHT COLUMN — tabbed analysis panel
      ═══════════════════════════════════════ */}
      <div className="md:flex-1 flex flex-col md:overflow-hidden">

        {/* Tab bar */}
        <div className="flex-shrink-0 flex border-b border-black bg-white overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-4 font-sans text-[13px] font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-black text-black"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.id === "issues" && issues.length > 0 && (
                <span className="ml-0.5 bg-black text-white font-sans text-[11px] rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {issues.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Scrollable tab content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">

            <AnimatePresence mode="wait">
              {activeTab === "issues" && (
                <motion.div
                  key="issues"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <IssuesTab issues={issues} isActive={activeTab === "issues"} />
                </motion.div>
              )}
              {activeTab === "zones" && (
                <motion.div
                  key="zones"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <ZonesTab zones={zoneAnalysis} isActive={activeTab === "zones"} />
                </motion.div>
              )}
              {activeTab === "positives" && (
                <motion.div
                  key="positives"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <PositivesTab features={positives} isActive={activeTab === "positives"} />
                </motion.div>
              )}
              {activeTab === "recommendations" && (
                <motion.div
                  key="recommendations"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <RecommendationsTab
                    recommendations={recommendations}
                    isActive={activeTab === "recommendations"}
                  />
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* ─── Sticky CTA bar — always visible ─── */}
        <div className="flex-shrink-0 border-t border-[var(--border)] bg-white px-6 py-4">
          <p className="font-sans text-[12px] text-gray-400 mb-3 text-right">
            Want a deeper analysis?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              onClick={() => router.push("/masters")}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-black text-white font-sans text-[14px] font-medium hover:bg-gray-800 transition-colors"
            >
              <Calendar size={15} />
              Book a Master
            </button>
            <button
              onClick={() => router.push("/editor")}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-black text-black font-sans text-[14px] font-medium hover:bg-gray-50 transition-colors"
            >
              <RotateCcw size={15} />
              Analyse Another Room
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
