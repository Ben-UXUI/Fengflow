"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import dynamic from "next/dynamic"
import { TemplateSelector } from "@/components/editor/TemplateSelector"
import { CompassSelector } from "@/components/editor/CompassSelector"
import { FurnitureSidebar } from "@/components/editor/FurnitureSidebar"
import { Button } from "@/components/ui/button"
import { TEMPLATES, FURNITURE_ITEMS } from "@/lib/furniture-data"
import { Template, Wall, PlacedFurniture, FurnitureItem, LayoutData } from "@/lib/room-types"
import { useToast } from "@/components/ui/use-toast"

const RoomCanvas = dynamic(
  () => import("@/components/editor/RoomCanvas").then((mod) => ({ default: mod.RoomCanvas })),
  { ssr: false }
)

const loadingMessages = [
  "Consulting the Bagua...",
  "Mapping energy flows...",
  "Preparing your analysis...",
]

export default function EditorPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [template, setTemplate] = useState<Template>(TEMPLATES[0])
  const [northWall, setNorthWall] = useState<Wall>("top")
  const [furniture, setFurniture] = useState<PlacedFurniture[]>([])
  const [doorPosition] = useState<{ wall: Wall; offset: number }>({ wall: "bottom", offset: 50 })
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)
  const [lastAddedId, setLastAddedId] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
  const [layoutRect, setLayoutRect] = useState<{
    offsetX: number
    offsetY: number
    roomWidth: number
    roomHeight: number
    scale: number
  } | null>(null)

  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length)
      }, 1500)
      return () => clearInterval(interval)
    }
  }, [isAnalyzing])

  const handleAddFurniture = useCallback(
    (item: FurnitureItem) => {
      if (!layoutRect) return
      const cx = layoutRect.offsetX + layoutRect.roomWidth / 2
      const cy = layoutRect.offsetY + layoutRect.roomHeight / 2
      const w = item.w * layoutRect.scale
      const h = item.h * layoutRect.scale
      const newItem: PlacedFurniture = {
        id: `furniture-${Date.now()}`,
        itemId: item.id,
        label: item.label,
        emoji: item.emoji,
        element: item.element,
        x: cx - w / 2,
        y: cy - h / 2,
        width: item.w,
        height: item.h,
      }
      setFurniture((prev) => [...prev, newItem])
      setLastAddedId(newItem.id)
      setTimeout(() => setLastAddedId(null), 300)
    },
    [layoutRect]
  )

  const handleRemoveFurniture = useCallback((id: string) => {
    setFurniture((prev) => prev.filter((f) => f.id !== id))
    setSelectedFurnitureId(null)
  }, [])

  const serializeLayout = useCallback((): LayoutData => {
    const roomWidthMetres = template.width / 100
    const roomHeightMetres = template.height / 100
    const rect = layoutRect || {
      offsetX: 100,
      offsetY: 80,
      roomWidth: template.width * 1.2,
      roomHeight: template.height * 1.2,
      scale: 1.2,
    }
    return {
      room: {
        type: template.label,
        widthMetres: roomWidthMetres,
        heightMetres: roomHeightMetres,
        northWall: northWall,
      },
      door: {
        wall: doorPosition.wall,
        positionPercent: doorPosition.offset,
      },
      furniture: furniture.map((item) => {
        const relativeX = item.x - rect.offsetX
        const relativeY = item.y - rect.offsetY
        return {
          id: item.id,
          label: item.label,
          element: item.element,
          xPercent: (relativeX / rect.roomWidth) * 100,
          yPercent: (relativeY / rect.roomHeight) * 100,
          widthPercent: (item.width * rect.scale / rect.roomWidth) * 100,
          heightPercent: (item.height * rect.scale / rect.roomHeight) * 100,
        }
      }),
    }
  }, [template, northWall, doorPosition, furniture, layoutRect])

  const handleAnalyze = async () => {
    if (furniture.length < 3) {
      toast({
        title: "Not enough furniture",
        description: "Please add at least 3 furniture items before analysing",
        variant: "destructive",
      })
      return
    }
    setIsAnalyzing(true)
    try {
      const layoutData = serializeLayout()
      const response = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layoutData }),
      })
      if (!response.ok) throw new Error("Analysis failed")
      const data = await response.json()
      sessionStorage.setItem("fengflow_analysis", JSON.stringify(data.analysis))
      sessionStorage.setItem("fengflow_layout", JSON.stringify(layoutData))
      router.push("/results")
    } catch (error) {
      console.error("Analysis error:", error)
      const msg = error instanceof Error ? error.message : "Unknown error"
      toast({
        title: "Analysis failed",
        description: msg.includes("fetch") || msg.includes("network")
          ? "Network error — check your connection and try again."
          : "Something went wrong. Please try again.",
        variant: "destructive",
      })
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-[var(--bg-primary)] overflow-hidden">
      {/* Top bar */}
      <div className="flex-shrink-0 h-14 px-4 flex items-center justify-between bg-white border-b border-[var(--border-dark)]">
        <p className="text-sm font-medium text-[var(--text-muted)]">Editor</p>
        <Button
          size="lg"
          className="rounded-full px-6"
          onClick={handleAnalyze}
          disabled={isAnalyzing || furniture.length < 3}
        >
          {isAnalyzing ? (
            <span className="flex items-center gap-2">
              <span className="text-lg" style={{ animation: "spin 1s linear infinite" }}>☯</span>
              <span>{loadingMessages[loadingMessageIndex]}</span>
            </span>
          ) : (
            "✦ Analyse with Feng Shui AI"
          )}
        </Button>
      </div>

      {/* Mobile: message + buttons */}
      <div className="md:hidden flex-1 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-[var(--text-secondary)] mb-6 max-w-sm">
          The room editor works best on a larger screen. You can still view your analysis results and browse masters on mobile.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/results">
            <Button variant="outline" className="rounded-full w-full sm:w-auto">
              View Results
            </Button>
          </Link>
          <Link href="/masters">
            <Button variant="outline" className="rounded-full w-full sm:w-auto">
              Browse Masters
            </Button>
          </Link>
        </div>
      </div>

      {/* Desktop: three columns */}
      <div className="hidden md:flex flex-1 min-h-0">
        {/* Left panel - 280px */}
        <aside className="w-[280px] flex-shrink-0 bg-white border-r border-[var(--border-dark)] overflow-hidden flex flex-col">
          <div className="p-4 overflow-y-auto">
            <TemplateSelector selectedTemplate={template} onSelectTemplate={setTemplate} />
            <div className="my-4 border-t border-[var(--border)]" />
            <CompassSelector northWall={northWall} onSelectNorthWall={setNorthWall} />
            <div className="my-4 border-t border-[var(--border)]" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {(template.width / 100).toFixed(1)}m × {(template.height / 100).toFixed(1)}m
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {furniture.length} item{furniture.length !== 1 ? "s" : ""} placed
              </p>
            </div>
          </div>
        </aside>

        {/* Centre canvas - flex */}
        <div className="flex-1 min-w-0 flex flex-col bg-white">
          <RoomCanvas
            template={template}
            northWall={northWall}
            furniture={furniture}
            doorPosition={doorPosition}
            selectedFurnitureId={selectedFurnitureId}
            onFurnitureUpdate={setFurniture}
            onSelectFurniture={setSelectedFurnitureId}
            onRemoveFurniture={handleRemoveFurniture}
            onLayoutReady={setLayoutRect}
            lastAddedId={lastAddedId}
          />
        </div>

        {/* Right panel - 260px collapsible */}
        <div className="relative flex-shrink-0 h-full">
          <FurnitureSidebar
            collapsed={rightPanelCollapsed}
            onToggleCollapse={() => setRightPanelCollapsed((c) => !c)}
            onAddFurniture={handleAddFurniture}
          />
        </div>
      </div>
    </div>
  )
}
