"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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
import { Template, Direction, Wall, PlacedFurniture, FurnitureItem, LayoutData, WindowItem } from "@/lib/room-types"
import { useToast } from "@/components/ui/use-toast"
import { RotateCcw, Trash2, Maximize2, Package, Plus, ZoomIn, ZoomOut } from "lucide-react"

const RoomCanvas = dynamic(
  () => import("@/components/editor/RoomCanvas").then((mod) => ({ default: mod.RoomCanvas })),
  { ssr: false }
)

type RoomStyle = "default" | "blueprint"

// Facing direction → which wall the door appears on
const FACING_TO_DOOR: Record<Direction, { wall: Wall; offset: number }> = {
  N:  { wall: "top",    offset: 50 },
  NE: { wall: "top",    offset: 75 },
  E:  { wall: "right",  offset: 50 },
  SE: { wall: "right",  offset: 75 },
  S:  { wall: "bottom", offset: 50 },
  SW: { wall: "bottom", offset: 25 },
  W:  { wall: "left",   offset: 50 },
  NW: { wall: "left",   offset: 25 },
}

const WALL_LABEL: Record<Wall, string> = {
  top: "top", right: "right", bottom: "bottom", left: "left",
}

const ROOM_STYLE_LABELS: Record<RoomStyle, string> = {
  default: "Default", blueprint: "Blueprint",
}

export default function EditorPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [template,            setTemplate]            = useState<Template>(TEMPLATES[0])
  const [facingDirection,     setFacingDirection]     = useState<Direction | null>(null)
  const [furniture,           setFurniture]           = useState<PlacedFurniture[]>([])
  const [doorPosition,        setDoorPosition]        = useState<{ wall: Wall; offset: number }>({ wall: "bottom", offset: 50 })
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null)
  const [is3D,                setIs3D]                = useState(false)
  const [windows,             setWindows]             = useState<WindowItem[]>([
    { id: "window-1", wall: "top",   offset: 50 },
    { id: "window-2", wall: "right", offset: 50 },
  ])
  const [selectedWindowId,    setSelectedWindowId]    = useState<string | null>(null)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)
  const [lastAddedId,         setLastAddedId]         = useState<string | null>(null)
  const [isAnalyzing,         setIsAnalyzing]         = useState(false)
  const [analysisComplete,    setAnalysisComplete]    = useState(false)
  const [pendingNavigation,   setPendingNavigation]   = useState(false)
  const [layoutRect,          setLayoutRect]          = useState<{
    offsetX: number; offsetY: number; roomWidth: number; roomHeight: number; scale: number
  } | null>(null)
  const [zoom,      setZoom]      = useState(1.0)
  const [roomStyle, setRoomStyle] = useState<RoomStyle>("default")

  const prevFacingRef = useRef<Direction | null>(null)

  // ── Auto-place door when facing direction changes ─────────────────────────
  useEffect(() => {
    if (!facingDirection) { prevFacingRef.current = null; return }
    if (prevFacingRef.current === facingDirection) return
    const prev = prevFacingRef.current
    prevFacingRef.current = facingDirection

    const newDoor = FACING_TO_DOOR[facingDirection]
    setDoorPosition(newDoor)

    if (prev !== null) {
      toast({
        title: "Entrance positioned",
        description: `Door placed on ${WALL_LABEL[newDoor.wall]} wall — entrance now faces ${facingDirection}`,
      })
    }
  }, [facingDirection, toast])

  const handleAddFurniture = useCallback((item: FurnitureItem) => {
    if (!layoutRect) return
    const cx = layoutRect.offsetX + layoutRect.roomWidth  / 2
    const cy = layoutRect.offsetY + layoutRect.roomHeight / 2
    const w  = item.w * layoutRect.scale
    const h  = item.h * layoutRect.scale
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
  }, [layoutRect])

  const handleRemoveFurniture = useCallback((id: string) => {
    setFurniture((prev) => prev.filter((f) => f.id !== id))
    setSelectedFurnitureId(null)
  }, [])

  const serializeLayout = useCallback((): LayoutData => {
    const rect = layoutRect || {
      offsetX: 100, offsetY: 80,
      roomWidth: template.width * 1.2, roomHeight: template.height * 1.2, scale: 1.2,
    }
    return {
      room: {
        type: template.label,
        widthMetres:  template.width  / 100,
        heightMetres: template.height / 100,
        facingDirection: facingDirection ?? "N",
      },
      door: {
        wall: doorPosition.wall,
        positionPercent: doorPosition.offset,
      },
      windows: windows.map((w) => ({
        id: w.id, wall: w.wall, positionPercent: w.offset,
      })),
      furniture: furniture.map((item) => ({
        id:            item.id,
        label:         item.label,
        element:       item.element,
        xPercent:      ((item.x - rect.offsetX) / rect.roomWidth)  * 100,
        yPercent:      ((item.y - rect.offsetY) / rect.roomHeight) * 100,
        widthPercent:  (item.width  * (item.scaleX ?? 1) * rect.scale / rect.roomWidth)  * 100,
        heightPercent: (item.height * (item.scaleY ?? 1) * rect.scale / rect.roomHeight) * 100,
        rotation: item.rotation ?? 0,
      })),
    }
  }, [template, facingDirection, doorPosition, windows, furniture, layoutRect])

  const handleAnalyze = async () => {
    if (!facingDirection) {
      toast({ title: "Facing direction not set", description: "Please select which direction your main entrance faces.", variant: "destructive" })
      return
    }
    if (furniture.length < 3) {
      toast({ title: "Not enough furniture", description: "Please add at least 3 furniture items for a proper analysis.", variant: "destructive" })
      return
    }
    setIsAnalyzing(true); setAnalysisComplete(false); setPendingNavigation(false)
    try {
      const layoutData = serializeLayout()
      const response = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layoutData }),
      })
      if (!response.ok) throw new Error("Analysis failed")

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      if (!reader) throw new Error("No response stream")

      let analysisReceived = false
      let buffer = ""

      while (!analysisReceived) {
        const { done, value } = await reader.read()
        if (value) buffer += decoder.decode(value, { stream: true })

        const events = buffer.split("\n\n")
        buffer = events.pop() ?? ""

        for (const event of events) {
          const line = event.trim()
          if (!line.startsWith("data: ")) continue
          let data: { partial?: string; done?: boolean; analysis?: unknown; error?: string }
          try {
            data = JSON.parse(line.slice(6))
          } catch {
            continue
          }
          if (data.error) throw new Error(data.error)
          if (data.done && data.analysis) {
            sessionStorage.setItem("fengflow_analysis", JSON.stringify(data.analysis))
            sessionStorage.setItem("fengflow_layout",   JSON.stringify(layoutData))
            setPendingNavigation(true)
            setAnalysisComplete(true)
            analysisReceived = true
            break
          }
        }

        if (done) {
          if (buffer.trim()) {
            const line = buffer.trim()
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6)) as { done?: boolean; analysis?: unknown; error?: string }
                if (data.error) throw new Error(data.error)
                if (data.done && data.analysis) {
                  sessionStorage.setItem("fengflow_analysis", JSON.stringify(data.analysis))
                  sessionStorage.setItem("fengflow_layout", JSON.stringify(layoutData))
                  setPendingNavigation(true)
                  setAnalysisComplete(true)
                  analysisReceived = true
                }
              } catch (_) { /* ignore parse errors on final chunk */ }
            }
          }
          break
        }
      }

      if (!analysisReceived) {
        throw new Error("Analysis did not complete. Please try again.")
      }
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
      setIsAnalyzing(false); setAnalysisComplete(false)
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-[var(--bg-primary)] overflow-hidden">
      {/* Top bar — extra height so Analyse button + sublabel have room */}
      <div className="flex-shrink-0 min-h-[88px] py-3 px-4 flex items-center justify-between bg-white border-b border-[var(--border-dark)]">
        <p className="font-sans text-sm font-medium text-[var(--text-muted)]">Editor</p>
        <div className="flex flex-col items-center justify-center py-1">
          <AnimatedAnalyseButton
            label="Analyse with Feng Shui AI"
            icon="sparkles"
            size="sm"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            isLoading={isAnalyzing}
            showSubLabel
          />
          <span className="block h-2" aria-hidden />
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden flex-1 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-[var(--text-secondary)] mb-6 max-w-sm">
          The room editor works best on a larger screen. You can still view your analysis results and browse masters on mobile.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/results"><Button variant="outline" className="rounded-full w-full sm:w-auto">View Results</Button></Link>
          <Link href="/masters"><Button variant="outline" className="rounded-full w-full sm:w-auto">Browse Masters</Button></Link>
        </div>
      </div>

      {/* Desktop: three columns */}
      <div className="hidden md:flex flex-1 min-h-0">
        {/* Left panel */}
        <aside className="w-[280px] flex-shrink-0 bg-white border-r border-[var(--border-dark)] flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 p-4 overflow-y-auto">
            <TemplateSelector selectedTemplate={template} onSelectTemplate={setTemplate} />
            <div className="my-4 border-t border-[var(--border)]" />
            <CompassSelector
              facingDirection={facingDirection}
              onSelectFacingDirection={setFacingDirection}
            />
            <div className="my-4 border-t border-[var(--border)]" />
            <div className="space-y-2">
              <p className="font-sans text-sm font-medium text-[var(--text-primary)] flex items-center gap-1.5">
                <Maximize2 size={13} className="text-[var(--text-muted)]" />
                {(template.width/100).toFixed(1)}m × {(template.height/100).toFixed(1)}m
              </p>
              <p className="font-sans text-xs text-[var(--text-muted)] flex items-center gap-1.5">
                <Package size={13} />
                {furniture.length} item{furniture.length !== 1 ? "s" : ""} placed
              </p>
            </div>
          </div>
        </aside>

        {/* Centre canvas */}
        <div className="flex-1 min-w-0 flex flex-col bg-white">
          {/* Canvas toolbar */}
          <div className="flex-shrink-0 h-9 px-3 flex items-center gap-2 border-b border-[var(--border)] flex-nowrap overflow-x-auto">
            <button type="button" onClick={() => setFurniture(p => p.slice(0,-1))} disabled={furniture.length===0}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-sans font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0">
              <RotateCcw size={12} />Undo
            </button>
            <button type="button" onClick={() => setFurniture([])} disabled={furniture.length===0}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-sans font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0">
              <Trash2 size={12} />Clear
            </button>
            <button type="button"
              onClick={() => {
                if (windows.length >= 4) { toast({ title: "Maximum 4 windows reached", description: "Delete an existing window first." }); return }
                setWindows(p => [...p, { id: `window-${Date.now()}`, wall: "top", offset: 30 + (p.length * 20) % 60 }])
              }}
              className="flex items-center gap-1.5 h-6 px-2.5 rounded border border-black text-xs font-sans font-medium text-black hover:bg-black hover:text-white transition-colors flex-shrink-0 whitespace-nowrap">
              <Plus size={12} />Add Window
            </button>

            {/* Room style */}
            <div className="flex items-center bg-white border border-[#D0D0D0] rounded-lg p-0.5 gap-0.5 flex-shrink-0">
              {(["default","blueprint"] as RoomStyle[]).map(s => (
                <button key={s} type="button" onClick={() => setRoomStyle(s)}
                  className={`px-2 py-0.5 rounded font-sans text-[11px] font-medium transition-colors ${roomStyle===s ? "bg-black text-white" : "text-gray-500 hover:text-black hover:bg-gray-100"}`}>
                  {ROOM_STYLE_LABELS[s]}
                </button>
              ))}
            </div>

            {/* Zoom */}
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setZoom(z => Math.max(0.5, z-0.1))} disabled={zoom<=0.5}
                className="w-6 h-6 flex items-center justify-center rounded border border-[#D0D0D0] hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors" title="Zoom out">
                <ZoomOut size={11} />
              </button>
              <span className="font-sans text-[11px] text-gray-500 w-10 text-center select-none">{Math.round(zoom*100)}%</span>
              <button type="button" onClick={() => setZoom(z => Math.min(2.0, z+0.1))} disabled={zoom>=2.0}
                className="w-6 h-6 flex items-center justify-center rounded border border-[#D0D0D0] hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors" title="Zoom in">
                <ZoomIn size={11} />
              </button>
              {zoom !== 1.0 && (
                <button type="button" onClick={() => setZoom(1.0)}
                  className="px-1.5 py-0.5 rounded font-sans text-[10px] text-gray-400 hover:text-black hover:bg-gray-100 transition-colors">reset</button>
              )}
            </div>

            {/* 2D / 3D */}
            <div className="ml-auto flex items-center bg-white border border-black rounded-full p-0.5">
              <button type="button" onClick={() => setIs3D(false)}
                className={`px-2.5 py-0.5 rounded-full font-sans text-[12px] font-medium transition-colors ${!is3D ? "bg-black text-white" : "text-black hover:bg-gray-100"}`}>2D</button>
              <button type="button"
                onClick={() => { setIs3D(true); toast({ title: "3D Preview", description: "Switch back to 2D to move furniture." }) }}
                className={`px-2.5 py-0.5 rounded-full font-sans text-[12px] font-medium transition-colors ${is3D ? "bg-black text-white" : "text-black hover:bg-gray-100"}`}>3D</button>
            </div>
          </div>

          <RoomCanvas
            template={template}
            facingDirection={facingDirection}
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
            onIs3DInteract={() => toast({ title: "3D Preview Mode", description: "Switch to 2D to rearrange furniture." })}
            lastAddedId={lastAddedId}
            is3D={is3D}
            zoom={zoom}
            roomStyle={roomStyle}
          />
        </div>

        {/* Right panel */}
        <div className="relative flex-shrink-0 h-full">
          <FurnitureSidebar
            collapsed={rightPanelCollapsed}
            onToggleCollapse={() => setRightPanelCollapsed(c => !c)}
            onAddFurniture={handleAddFurniture}
          />
        </div>
      </div>

      <AnalysisOverlay
        isVisible={isAnalyzing}
        isComplete={analysisComplete}
        onExitComplete={() => { if (pendingNavigation) router.push("/results") }}
      />
    </div>
  )
}
