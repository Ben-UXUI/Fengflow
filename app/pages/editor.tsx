"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { TemplateSelector } from "@/components/editor/TemplateSelector"
import { SimpleCompass } from "@/components/editor/SimpleCompass"
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
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null)
  const [lastAddedId, setLastAddedId] = useState<string | null>(null)
  const [layoutRect, setLayoutRect] = useState<{ offsetX: number; offsetY: number; roomWidth: number; roomHeight: number; scale: number } | null>(null)

  const loadingMessages = [
    "Consulting the Bagua...",
    "Mapping your energy zones...",
    "Analysing Five Elements...",
    "Detecting Qi flow pathways...",
    "Identifying commanding positions...",
    "Preparing your analysis...",
  ]

  useEffect(() => {
    if (isAnalyzing) {
      const messageInterval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length)
      }, 2000)
      
      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 90) return prev
          return prev + 4.5 // 90% over 20 seconds
        })
      }, 1000)
      
      return () => {
        clearInterval(messageInterval)
        clearInterval(progressInterval)
      }
    } else {
      setLoadingProgress(0)
    }
  }, [isAnalyzing])

  const handleAddFurniture = (item: FurnitureItem) => {
    const rect = layoutRect ?? {
      offsetX: 80,
      offsetY: 60,
      roomWidth: template.width,
      roomHeight: template.height,
      scale: 1,
    }
    const scaledW = rect.roomWidth * rect.scale
    const scaledH = rect.roomHeight * rect.scale
    const cx = rect.offsetX + scaledW / 2
    const cy = rect.offsetY + scaledH / 2
    const id = `furniture-${Date.now()}`
    const newItem: PlacedFurniture = {
      id,
      itemId: item.id,
      label: item.label,
      emoji: item.emoji,
      element: item.element,
      x: cx - item.w / 2,
      y: cy - item.h / 2,
      width: item.w,
      height: item.h,
    }
    setFurniture((prev) => [...prev, newItem])
    setLastAddedId(id)
    setTimeout(() => setLastAddedId(null), 400)
  }

  const handleRemoveFurniture = (id: string) => {
    setFurniture((prev) => prev.filter((f) => f.id !== id))
    if (selectedFurnitureId === id) setSelectedFurnitureId(null)
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
    const rect = layoutRect ?? {
      offsetX: 80,
      offsetY: 60,
      roomWidth: template.width,
      roomHeight: template.height,
      scale: 1,
    }
    const scaledW = rect.roomWidth * rect.scale
    const scaledH = rect.roomHeight * rect.scale

    return {
      room: {
        type: template.label,
        widthMetres: roomWidthMetres,
        heightMetres: roomHeightMetres,
        facingDirection: northWall,
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
          xPercent: (relativeX / scaledW) * 100,
          yPercent: (relativeY / scaledH) * 100,
          widthPercent: (item.width / scaledW) * 100,
          heightPercent: (item.height / scaledH) * 100,
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
    setLoadingProgress(0)

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
      setLoadingProgress(100)
      
      // Brief delay to show 100% before transitioning
      setTimeout(() => {
        sessionStorage.setItem("fengflow_analysis", JSON.stringify(data.analysis))
        sessionStorage.setItem("fengflow_layout", JSON.stringify(layoutData))
        setIsAnalyzing(false)
        router.push("/results")
      }, 500)
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

  // Mobile layout
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-8">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-black mb-4">
            The room editor works best on a larger screen.
          </h2>
          <p className="text-gray-600 mb-8">
            You can still view your analysis results and browse masters on mobile.
          </p>
          <div className="space-y-4">
            <Button
              className="w-full bg-black text-white hover:bg-gray-800"
              onClick={() => router.push("/results")}
            >
              View Results
            </Button>
            <Button
              variant="outline"
              className="w-full border-black text-black hover:bg-black hover:text-white"
              onClick={() => router.push("/masters")}
            >
              Browse Masters
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-black px-6 py-4 flex items-center justify-between">
        <div className="text-gray-600 font-sans">Editor</div>
        <Button
          size="lg"
          className="bg-black text-white hover:bg-gray-800 rounded-full px-8 py-3 text-base font-medium"
          onClick={handleAnalyze}
          disabled={isAnalyzing || furniture.length < 3}
        >
          {isAnalyzing ? (
            <span className="flex items-center justify-center gap-3">
              <span className="text-xl" style={{ animation: "spin 1s linear infinite" }}>☯</span>
              <span>{loadingMessages[loadingMessageIndex]}</span>
            </span>
          ) : (
            "✦ Analyse with Feng Shui AI"
          )}
        </Button>
      </div>

      {/* Three Column Layout */}
      <div className="flex-1 flex">
        {/* Left Panel - Room Settings (280px) */}
        <div className="w-[280px] bg-white border-r border-black flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-20">
            {/* Room Template Section */}
            <div className="relative">
              <h3 className="font-bold text-black mb-4">Choose Room Type</h3>
              <TemplateSelector
                selectedTemplate={template}
                onSelectTemplate={setTemplate}
              />
            </div>

            {/* Compass Section */}
            <div className="relative">
              <h3 className="font-bold text-black mb-2">Which wall faces North?</h3>
              <p className="text-xs text-gray-600 mb-4">
                Stand in your room and point to North. Which wall are you facing?
              </p>
              <SimpleCompass northWall={northWall} onSelectNorthWall={setNorthWall} />
            </div>

            {/* Room Info Section */}
            <div className="relative">
              <h3 className="font-bold text-black mb-2">Room Info</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div>Room: {(template.width / 100).toFixed(1)}m × {(template.height / 100).toFixed(1)}m</div>
                <div>Furniture: {furniture.length} items placed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Centre Canvas - Room Editor */}
        <div className="flex-1 bg-white relative">
          <div className="absolute inset-0 bg-gray-50" style={{
            backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}>
            <RoomCanvas
              template={template}
              facingDirection={null}
              furniture={furniture}
              windows={[]}
              doorPosition={doorPosition}
              selectedFurnitureId={selectedFurnitureId}
              selectedWindowId={null}
              onFurnitureUpdate={setFurniture}
              onSelectFurniture={setSelectedFurnitureId}
              onRemoveFurniture={handleRemoveFurniture}
              onWindowsChange={() => {}}
              onSelectWindow={() => {}}
              onLayoutReady={setLayoutRect}
              lastAddedId={lastAddedId}
            />
          </div>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
            Click furniture to select · Drag to move · ✕ to remove
          </div>
        </div>

        {/* Right Panel - Furniture Palette (260px, collapsible) */}
        <FurnitureSidebar
          collapsed={isRightPanelCollapsed}
          onToggleCollapse={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
          onAddFurniture={handleAddFurniture}
        />
      </div>

      {/* Loading Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center animate-in fade-in-0 duration-300">
          <div className="text-6xl mb-8 animate-spin" style={{ animationDuration: '8s' }}>
            ☯
          </div>
          
          <div className="text-xl text-black font-medium mb-4 h-8 flex items-center">
            <span className="animate-in fade-in-0 duration-500">
              {loadingMessages[loadingMessageIndex]}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-64 h-1 bg-gray-200 rounded-full mb-8 overflow-hidden">
            <div 
              className="h-full bg-black transition-all duration-1000 ease-out"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          
          <div className="text-sm text-gray-500">
            Classical Feng Shui analysis powered by AI
          </div>
        </div>
      )}
    </div>
  )
}
