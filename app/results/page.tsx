"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { AnalysisPanel } from "@/components/results/AnalysisPanel"
import { Button } from "@/components/ui/button"
import { FengShuiAnalysis, LayoutData } from "@/lib/room-types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const RoomPreview = dynamic(
  () => import("@/components/results/RoomPreview").then((mod) => ({ default: mod.RoomPreview })),
  { ssr: false }
)

export default function ResultsPage() {
  const router = useRouter()
  const [analysis, setAnalysis] = useState<FengShuiAnalysis | null>(null)
  const [layoutData, setLayoutData] = useState<LayoutData | null>(null)

  useEffect(() => {
    const storedAnalysis = sessionStorage.getItem("fengflow_analysis")
    const storedLayout = sessionStorage.getItem("fengflow_layout")

    if (!storedAnalysis || !storedLayout) {
      router.push("/editor")
      return
    }

    try {
      setAnalysis(JSON.parse(storedAnalysis))
      setLayoutData(JSON.parse(storedLayout))
    } catch (error) {
      console.error("Error parsing stored data:", error)
      router.push("/editor")
    }
  }, [router])

  const handleCopyAnalysis = () => {
    if (!analysis) return

    const text = `Feng Shui Analysis - Score: ${analysis.overall_score}/100\n\n${analysis.overall_summary}\n\nRecommendations:\n${analysis.recommendations.map((r) => `${r.priority}. ${r.title}: ${r.action}`).join("\n")}`

    navigator.clipboard.writeText(text)
  }

  if (!analysis || !layoutData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="text-4xl" style={{ animation: "spin 1s linear infinite" }}>☯</span>
          <p className="text-[var(--text-secondary)]">Loading analysis...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-[var(--text-primary)]">
            Your Feng Shui Analysis
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-white">
              <CardContent className="p-6">
                <RoomPreview layoutData={layoutData} />
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="outline">
                    North: {layoutData.room.northWall}
                  </Badge>
                  <Badge variant="outline">
                    {layoutData.room.type}
                  </Badge>
                  <Badge variant="outline">
                    {layoutData.furniture.length} items
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <div className="mb-6 flex justify-end">
              <Button variant="outline" size="sm" onClick={handleCopyAnalysis} className="rounded-full">
                Copy Analysis
              </Button>
            </div>
            <AnalysisPanel analysis={analysis} />

            <div className="mt-12 p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-dark)] shadow-[2px_2px_0px_0px_var(--accent)]">
              <h3 className="text-lg font-bold mb-4 text-[var(--text-primary)]">
                Want personalised guidance?
              </h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => router.push("/masters")}
                  className="flex-1 rounded-full"
                >
                  Book a session with a Feng Shui Master
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={() => router.push("/editor")}
                  className="flex-1 rounded-full"
                >
                  Analyse Another Room
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
