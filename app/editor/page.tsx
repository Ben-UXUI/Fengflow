"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import dynamic from "next/dynamic"
import { TemplateSelector } from "@/components/editor/TemplateSelector"
import { CompassSelector } from "@/components/editor/CompassSelector"
import { FurnitureSidebar } from "@/components/editor/FurnitureSidebar"
import { AnalysisOverlay } from "@/components/editor/AnalysisOverlay"
import { AnimatedAnalyseButton } from "@/components/landing/AnimatedAnalyseButton"
import { Button } from "@/components/ui/button"
import { TEMPLATES } from "@/lib/furniture-data"
import { Template, Wall, PlacedFurniture, FurnitureItem, LayoutData, WindowItem } from "@/lib/room-types"
import { useToast } from "@/components/ui/use-toast"
import { RotateCcw, Trash2, Maximize2, Package, Plus } from "lucide-react"

const RoomCanvas = dynamic(
  () => import("@/components/editor/RoomCanvas").then((mod) => ({ default: mod.RoomCanvas })),
  { ssr: false }
)


export default function EditorPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [template, setTemplate] = useState<Template>(TEMPLATES[0])
  const [northWall, setNorthWall] = useState<Wall | null>(null)
  const [furniture, setFurniture] = useState<PlacedFurniture[]>([])
  const [doorPosition, setDoorPosition] = useState<{ wall: Wall; offset: number }>({ wall: "bottom", offset: 50 })
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null)
  const [is3D, setIs3D] = useState(false)
  const [windows, setWindows] = useState<WindowItem[]>([
    { id: "window-1", wall: "top",   offset: 50 },
    { id: "window-2", wall: "right", offset: 50 },
  ])
  const [selectedWindowId, setSelectedWindowId] = useState<string | null>(null)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)
  const [lastAddedId, setLastAddedId] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState(false)
  const [layoutRect, setLayoutRect] = useState<{
    offsetX: number
    offsetY: number
    roomWidth: number
    roomHeight: number
    scale: number
  } | null>(null)


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
        northWall: northWall ?? "top",
      },
      door: {
        wall: doorPosition.wall,
        positionPercent: doorPosition.offset,
      },
      windows: windows.map((w) => ({
        id: w.id,
        wall: w.wall,
        positionPercent: w.offset,
      })),
      furniture: furniture.map((item) => {
        const relativeX = item.x - rect.offsetX
        const relativeY = item.y - rect.offsetY
        return {
          id: item.id,
          label: item.label,
          element: item.element,
          xPercent: (relativeX / rect.roomWidth) * 100,
          yPercent: (relativeY / rect.roomHeight) * 100,
          widthPercent: (item.width  * (item.scaleX ?? 1) * rect.scale / rect.roomWidth)  * 100,
          heightPercent: (item.height * (item.scaleY ?? 1) * rect.scale / rect.roomHeight) * 100,
          rotation: item.rotation ?? 0,
        }
      }),
    }
  }, [template, northWall, doorPosition, windows, furniture, layoutRect])

  const handleAnalyze = async () => {
    if (!northWall) {
      toast({
        title: "North direction not set",
        description: "Please choose which wall faces North first.",
        variant: "destructive",
      })
      return
    }
    if (furniture.length < 3) {
      toast({
        title: "Not enough furniture",
        description: "Please add at least 3 furniture items for a proper analysis.",
        variant: "destructive",
      })
      return
    }
    setIsAnalyzing(true)
    setAnalysisComplete(false)
    setPendingNavigation(false)
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
      setPendingNavigation(true)
      setAnalysisComplete(true)
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
      setAnalysisComplete(false)
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-[var(--bg-primary)] overflow-hidden">
      {/* Top bar */}
      <div className="flex-shrink-0 h-[72px] px-4 flex items-center justify-between bg-white border-b border-[var(--border-dark)]">
        <p className="font-sans text-sm font-medium text-[var(--text-muted)]">Editor</p>
        <AnimatedAnalyseButton
          label="Analyse with Feng Shui AI"
          icon="sparkles"
          size="sm"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          isLoading={isAnalyzing}
          showSubLabel
        />
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
        <aside className="w-[280px] flex-shrink-0 bg-white border-r border-[var(--border-dark)] flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 p-4 overflow-y-auto">
            <TemplateSelector selectedTemplate={template} onSelectTemplate={setTemplate} />
            <div className="my-4 border-t border-[var(--border)]" />
            <CompassSelector northWall={northWall} onSelectNorthWall={(w) => setNorthWall(w)} />
            <div className="my-4 border-t border-[var(--border)]" />
            <div className="space-y-2">
              <p className="font-sans text-sm font-medium text-[var(--text-primary)] flex items-center gap-1.5">
                <Maximize2 size={13} className="text-[var(--text-muted)]" />
                {(template.width / 100).toFixed(1)}m × {(template.height / 100).toFixed(1)}m
              </p>
              <p className="font-sans text-xs text-[var(--text-muted)] flex items-center gap-1.5">
                <Package size={13} />
                {furniture.length} item{furniture.length !== 1 ? "s" : ""} placed
              </p>
            </div>
          </div>
        </aside>

        {/* Centre canvas - flex */}
        <div className="flex-1 min-w-0 flex flex-col bg-white">
          {/* Canvas toolbar */}
          <div className="flex-shrink-0 h-9 px-3 flex items-center gap-2 border-b border-[var(--border)]">
            <button
              type="button"
              onClick={() => setFurniture((prev) => prev.slice(0, -1))}
              disabled={furniture.length === 0}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-sans font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <RotateCcw size={12} />
              Undo
            </button>
            <button
              type="button"
              onClick={() => setFurniture([])}
              disabled={furniture.length === 0}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-sans font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 size={12} />
              Clear
            </button>
            {/* Add Window button */}
            <button
              type="button"
              onClick={() => {
                if (windows.length >= 4) {
                  toast({ title: "Maximum 4 windows reached", description: "Delete an existing window first." })
                  return
                }
                const newId = `window-${Date.now()}`
                setWindows((prev) => [...prev, { id: newId, wall: "top", offset: 30 + (prev.length * 20) % 60 }])
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-black text-xs font-sans font-medium text-black hover:bg-black hover:text-white transition-colors"
            >
              <Plus size={12} />
              Add Window
            </button>
            {/* 2D / 3D toggle */}
            <div className="ml-auto flex items-center bg-white border border-black rounded-full p-0.5">
              <button
                type="button"
                onClick={() => setIs3D(false)}
                className={`px-2.5 py-0.5 rounded-full font-sans text-[12px] font-medium transition-colors ${!is3D ? "bg-black text-white" : "text-black hover:bg-gray-100"}`}
              >
                2D
              </button>
              <button
                type="button"
                onClick={() => {
                  setIs3D(true)
                  toast({ title: "3D Preview", description: "Switch back to 2D to move furniture." })
                }}
                className={`px-2.5 py-0.5 rounded-full font-sans text-[12px] font-medium transition-colors ${is3D ? "bg-black text-white" : "text-black hover:bg-gray-100"}`}
              >
                3D
              </button>
            </div>
          </div>
          <RoomCanvas
            template={template}
            northWall={northWall}
            furniture={furniture}
            windows={windows}
            doorPosition={doorPosition}
            selectedFurnitureId={selectedFurnitureId}
            selectedWindowId={selectedWindowId}
            onFurnitureUpdate={setFurniture}
            onSelectFurniture={setSelectedFurnitureId}
            onRemoveFurniture={handleRemoveFurniture}
            onWindowsChange={setWindows}
            onSelectWindow={setSelectedWindowId}
            onLayoutReady={setLayoutRect}
            onDoorPositionChange={setDoorPosition}
            lastAddedId={lastAddedId}
            is3D={is3D}
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

      <AnalysisOverlay
        isVisible={isAnalyzing}
        isComplete={analysisComplete}
        onExitComplete={() => {
          if (pendingNavigation) router.push("/results")
        }}
      />
    </div>
  )
}
