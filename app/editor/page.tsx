"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { TemplateSelector } from "@/components/editor/TemplateSelector"
import { CompassSelector } from "@/components/editor/CompassSelector"
import { FurnitureSidebar } from "@/components/editor/FurnitureSidebar"
import { Button } from "@/components/ui/button"
import { TEMPLATES, FURNITURE_ITEMS } from "@/lib/furniture-data"
import { Template, Wall, PlacedFurniture, FurnitureItem, LayoutData } from "@/lib/room-types"
import { useToast } from "@/components/ui/use-toast"

const RoomCanvas = dynamic(() => import("@/components/editor/RoomCanvas").then((mod) => ({ default: mod.RoomCanvas })), {
  ssr: false,
})

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
  const [doorPosition, setDoorPosition] = useState<{ wall: Wall; offset: number }>({
    wall: "bottom",
    offset: 50,
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)

  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length)
      }, 1500)
      return () => clearInterval(interval)
    }
  }, [isAnalyzing])

  const handleAddFurniture = (item: FurnitureItem) => {
    const newItem: PlacedFurniture = {
      id: `furniture-${Date.now()}`,
      itemId: item.id,
      label: item.label,
      emoji: item.emoji,
      element: item.element,
      x: 300,
      y: 250,
      width: item.w,
      height: item.h,
    }
    setFurniture([...furniture, newItem])
  }

  const handleClearCanvas = () => {
    setFurniture([])
  }

  const handleUndo = () => {
    setFurniture(furniture.slice(0, -1))
  }

  const serializeLayout = (): LayoutData => {
    const roomWidthMetres = template.width / 100
    const roomHeightMetres = template.height / 100

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
        // Calculate position as percentage of room dimensions
        // Assuming canvas is centered, we need to account for offsets
        const canvasWidth = 600 // approximate
        const canvasHeight = 500 // approximate
        const roomWidth = template.width
        const roomHeight = template.height
        const scale = Math.min(canvasWidth / roomWidth, canvasHeight / roomHeight)
        const scaledRoomWidth = roomWidth * scale
        const scaledRoomHeight = roomHeight * scale
        const offsetX = (canvasWidth - scaledRoomWidth) / 2
        const offsetY = (canvasHeight - scaledRoomHeight) / 2

        const relativeX = item.x - offsetX
        const relativeY = item.y - offsetY

        return {
          id: item.id,
          label: item.label,
          element: item.element,
          xPercent: (relativeX / scaledRoomWidth) * 100,
          yPercent: (relativeY / scaledRoomHeight) * 100,
          widthPercent: (item.width / scaledRoomWidth) * 100,
          heightPercent: (item.height / scaledRoomHeight) * 100,
        }
      }),
    }
  }

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ layoutData }),
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const data = await response.json()
      sessionStorage.setItem("fengflow_analysis", JSON.stringify(data.analysis))
      sessionStorage.setItem("fengflow_layout", JSON.stringify(layoutData))
      router.push("/results")
    } catch (error) {
      console.error("Analysis error:", error)
      toast({
        title: "Analysis failed",
        description: "Please try again. Make sure your API key is configured.",
        variant: "destructive",
      })
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-[var(--text-primary)]">
            Room Editor
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">
            Arrange your furniture and submit for Feng Shui analysis
          </p>
        </div>

        {/* Mobile warning */}
        <div className="md:hidden mb-6 p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-dark)]">
          <p className="text-sm text-[var(--text-secondary)]">
            The room editor works best on desktop. Your analysis results are fully mobile-optimised.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-250px)]">
          {/* Left Column - Templates & Controls */}
          <div className="lg:col-span-2 space-y-6 overflow-y-auto">
            <TemplateSelector
              selectedTemplate={template}
              onSelectTemplate={setTemplate}
            />
            <CompassSelector northWall={northWall} onSelectNorthWall={setNorthWall} />
            
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleClearCanvas}
                disabled={furniture.length === 0}
              >
                Clear Canvas
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleUndo}
                disabled={furniture.length === 0}
              >
                Undo Last
              </Button>
            </div>

            <div className="text-sm text-[var(--text-muted)]">
              <div>Room: {(template.width / 100).toFixed(1)}m × {(template.height / 100).toFixed(1)}m</div>
              <div className="mt-1">Furniture: {furniture.length} items</div>
            </div>
          </div>

          {/* Center Column - Canvas */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-4 border border-[var(--border-dark)] shadow-[2px_2px_0px_0px_var(--accent)]">
            <RoomCanvas
              template={template}
              northWall={northWall}
              furniture={furniture}
              doorPosition={doorPosition}
              onFurnitureUpdate={setFurniture}
              onDoorUpdate={setDoorPosition}
            />
          </div>

          {/* Right Column - Furniture Palette */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-4 border border-[var(--border-dark)] shadow-[2px_2px_0px_0px_var(--accent)]">
            <FurnitureSidebar onAddFurniture={handleAddFurniture} />
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6">
          <Button
            size="lg"
            className="w-full text-lg"
            onClick={handleAnalyze}
            disabled={isAnalyzing || furniture.length < 3}
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center gap-3">
                <span className="text-xl" style={{ animation: "spin 1s linear infinite" }}>☯</span>
                <span>{loadingMessages[loadingMessageIndex]}</span>
              </span>
            ) : (
              "Analyse with Feng Shui AI →"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
