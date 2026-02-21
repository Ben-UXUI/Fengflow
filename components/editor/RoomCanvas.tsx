"use client"

import { useEffect, useRef, useState, useMemo, useCallback } from "react"
import { Stage, Layer, Rect, Group, Text, Line, Path, Circle, Transformer } from "react-konva"
import { PlacedFurniture, Template, Wall, WindowItem } from "@/lib/room-types"
import Konva from "konva"
import { RotateCcw, RotateCw, Minus, Plus, Trash2 } from "lucide-react"

// ── Constants ───────────────────────────────────────────────────────────────
const DOT_SPACING = 20
const DOOR_W      = 40   // door gap width px
const WIN_W       = 50   // window gap width px
const WALL_SW     = 3    // default wall stroke width

// ── Bagua data ───────────────────────────────────────────────────────────────
const ZONE_GRIDS: Record<Wall, string[][]> = {
  top:    [["NW","N","NE"],["W","C","E"],["SW","S","SE"]],
  bottom: [["SW","S","SE"],["W","C","E"],["NW","N","NE"]],
  right:  [["SW","W","NW"],["S","C","N"],["SE","E","NE"]],
  left:   [["NE","E","SE"],["N","C","S"],["NW","W","SW"]],
}
const ZONE_NAME: Record<string, string> = {
  N:"Career", NE:"Knowledge", E:"Family", SE:"Wealth",
  S:"Fame", SW:"Relation.", W:"Creativity", NW:"Helpful", C:"Health",
}
const ZONE_COLOR: Record<string, string> = {
  N:"#2196F3", NE:"#D4A843", E:"#4CAF50", SE:"#4CAF50",
  S:"#E74C3C", SW:"#D4A843", W:"#9E9E9E", NW:"#9E9E9E", C:"#D4A843",
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function getWallCenter(wall: Wall, offset: number, ox: number, oy: number, rw: number, rh: number) {
  const p = offset / 100
  switch (wall) {
    case "top":    return { x: ox + p * rw, y: oy }
    case "bottom": return { x: ox + p * rw, y: oy + rh }
    case "left":   return { x: ox,          y: oy + p * rh }
    case "right":  return { x: ox + rw,     y: oy + p * rh }
  }
}
const getDoorCenter   = getWallCenter
const getWindowCenter = getWallCenter

function doorArcPath(wall: Wall, cx: number, cy: number, dw: number): string {
  const h = dw / 2
  switch (wall) {
    case "bottom": return `M ${cx-h} ${cy-dw} A ${dw} ${dw} 0 0 1 ${cx+h} ${cy}`
    case "top":    return `M ${cx-h} ${cy+dw} A ${dw} ${dw} 0 0 0 ${cx+h} ${cy}`
    case "left":   return `M ${cx+dw} ${cy-h} A ${dw} ${dw} 0 0 0 ${cx} ${cy+h}`
    case "right":  return `M ${cx-dw} ${cy-h} A ${dw} ${dw} 0 0 1 ${cx} ${cy+h}`
  }
}

function doorClosedLine(wall: Wall, cx: number, cy: number, dw: number): number[] {
  const h = dw / 2
  switch (wall) {
    case "bottom": return [cx-h, cy, cx-h, cy-dw]
    case "top":    return [cx-h, cy, cx-h, cy+dw]
    case "left":   return [cx, cy-h, cx+dw, cy-h]
    case "right":  return [cx, cy-h, cx-dw, cy-h]
  }
}

function getZone(item: PlacedFurniture, ox: number, oy: number, rw: number, rh: number, nw: Wall | null): string | null {
  if (!nw) return null
  const relX = (item.x - ox) / rw
  const relY = (item.y - oy) / rh
  if (relX < 0 || relX > 1 || relY < 0 || relY > 1) return null
  const col = Math.min(2, Math.floor(relX * 3))
  const row = Math.min(2, Math.floor(relY * 3))
  return ZONE_GRIDS[nw][row]?.[col] ?? null
}

// Three lines parallel to wall, pointing inward, spaced 8px apart
function windowLinePoints(wall: Wall, cx: number, cy: number, ww: number): number[][] {
  const half = ww / 2
  const offsets = [2, 10, 18]
  switch (wall) {
    case "top":    return offsets.map(d => [cx - half, cy + d,  cx + half, cy + d])
    case "bottom": return offsets.map(d => [cx - half, cy - d,  cx + half, cy - d])
    case "left":   return offsets.map(d => [cx + d,   cy - half, cx + d,   cy + half])
    case "right":  return offsets.map(d => [cx - d,   cy - half, cx - d,   cy + half])
  }
}

function windowLabelPos(wall: Wall, cx: number, cy: number): { x: number; y: number } {
  switch (wall) {
    case "top":    return { x: cx - 4, y: cy + 22 }
    case "bottom": return { x: cx - 4, y: cy - 22 }
    case "left":   return { x: cx + 20, y: cy - 4 }
    case "right":  return { x: cx - 16, y: cy - 4 }
  }
}

function windowOutlineRect(wall: Wall, cx: number, cy: number, ww: number): { x: number; y: number; width: number; height: number } {
  const half = ww / 2
  switch (wall) {
    case "top":    return { x: cx - half - 2, y: cy - 4,       width: ww + 4, height: 28 }
    case "bottom": return { x: cx - half - 2, y: cy - 24,      width: ww + 4, height: 28 }
    case "left":   return { x: cx - 4,        y: cy - half - 2, width: 28, height: ww + 4 }
    case "right":  return { x: cx - 24,       y: cy - half - 2, width: 28, height: ww + 4 }
  }
}

function glassRect(wall: Wall, cx: number, cy: number, ww: number): { x: number; y: number; width: number; height: number } {
  const half = ww / 2
  switch (wall) {
    case "top":    return { x: cx - half, y: cy,       width: ww, height: 20 }
    case "bottom": return { x: cx - half, y: cy - 20,  width: ww, height: 20 }
    case "left":   return { x: cx,        y: cy - half, width: 20, height: ww }
    case "right":  return { x: cx - 20,   y: cy - half, width: 20, height: ww }
  }
}

// ── Component ────────────────────────────────────────────────────────────────
export interface RoomCanvasProps {
  template: Template
  northWall: Wall | null
  furniture: PlacedFurniture[]
  windows: WindowItem[]
  doorPosition: { wall: Wall; offset: number }
  selectedFurnitureId: string | null
  selectedWindowId: string | null
  onFurnitureUpdate: (f: PlacedFurniture[]) => void
  onSelectFurniture: (id: string | null) => void
  onRemoveFurniture: (id: string) => void
  onWindowsChange: (windows: WindowItem[]) => void
  onSelectWindow: (id: string | null) => void
  onLayoutReady?: (l: { offsetX: number; offsetY: number; roomWidth: number; roomHeight: number; scale: number }) => void
  onDoorPositionChange?: (d: { wall: Wall; offset: number }) => void
  lastAddedId?: string | null
  is3D?: boolean
}

export function RoomCanvas({
  template, northWall, furniture, windows, doorPosition,
  selectedFurnitureId, selectedWindowId,
  onFurnitureUpdate, onSelectFurniture, onRemoveFurniture,
  onWindowsChange, onSelectWindow,
  onLayoutReady, onDoorPositionChange,
  lastAddedId, is3D = false,
}: RoomCanvasProps) {

  const containerRef   = useRef<HTMLDivElement>(null)
  const stageRef       = useRef<Konva.Stage>(null)
  const transformerRef = useRef<Konva.Transformer>(null)

  const [stageSize,        setStageSize]        = useState({ width: 600, height: 500 })
  const [localDoor,        setLocalDoor]        = useState(doorPosition)
  const [toolbarPos,       setToolbarPos]       = useState<{ x: number; y: number } | null>(null)
  const [windowToolbarPos, setWindowToolbarPos] = useState<{ x: number; y: number } | null>(null)
  const [dotPattern,       setDotPattern]       = useState<HTMLCanvasElement | null>(null)
  const [woodPattern,      setWoodPattern]      = useState<HTMLCanvasElement | null>(null)
  const [flashing,         setFlashing]         = useState(false)
  const prevIs3DRef = useRef(is3D)

  // ── Dot pattern ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const c = document.createElement("canvas")
    c.width = DOT_SPACING; c.height = DOT_SPACING
    const ctx = c.getContext("2d")!
    ctx.fillStyle = "#CFCFCF"
    ctx.beginPath(); ctx.arc(DOT_SPACING / 2, DOT_SPACING / 2, 1.2, 0, Math.PI * 2); ctx.fill()
    setDotPattern(c)
  }, [])

  // ── Wood plank pattern ───────────────────────────────────────────────────────
  useEffect(() => {
    const c = document.createElement("canvas")
    c.width = 40; c.height = 40
    const ctx = c.getContext("2d")!
    ctx.fillStyle = "#F5F0E8"
    ctx.fillRect(0, 0, 40, 40)
    ctx.fillStyle = "#E8E0D0"
    ctx.fillRect(38, 0, 2, 40)
    setWoodPattern(c)
  }, [])

  // ── Canvas flash on 3D toggle ────────────────────────────────────────────────
  useEffect(() => {
    if (prevIs3DRef.current !== is3D) {
      setFlashing(true)
      const t = setTimeout(() => setFlashing(false), 300)
      prevIs3DRef.current = is3D
      return () => clearTimeout(t)
    }
  }, [is3D])

  // ── Size observer ────────────────────────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return
      setStageSize({ width: containerRef.current.offsetWidth, height: containerRef.current.offsetHeight })
    }
    update()
    const ro = new ResizeObserver(update)
    if (containerRef.current) ro.observe(containerRef.current)
    window.addEventListener("resize", update)
    return () => { ro.disconnect(); window.removeEventListener("resize", update) }
  }, [template])

  // Sync localDoor when prop changes
  useEffect(() => { setLocalDoor(doorPosition) }, [doorPosition])

  // ── Layout geometry ──────────────────────────────────────────────────────────
  const scaleX  = stageSize.width  / (template.width  + 120)
  const scaleY  = stageSize.height / (template.height + 80)
  const scale   = Math.min(scaleX, scaleY) * 0.85
  const roomW   = template.width  * scale
  const roomH   = template.height * scale
  const offsetX = (stageSize.width  - roomW) / 2
  const offsetY = (stageSize.height - roomH) / 2

  useEffect(() => {
    onLayoutReady?.({ offsetX, offsetY, roomWidth: roomW, roomHeight: roomH, scale })
  }, [offsetX, offsetY, roomW, roomH, scale, onLayoutReady])

  // ── Transformer attachment ───────────────────────────────────────────────────
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return
    if (!selectedFurnitureId) {
      transformerRef.current.nodes([])
      transformerRef.current.getLayer()?.batchDraw()
      setToolbarPos(null)
      return
    }
    const node = stageRef.current.findOne<Konva.Group>("#" + selectedFurnitureId)
    if (node) {
      transformerRef.current.nodes([node])
      transformerRef.current.getLayer()?.batchDraw()
      updateToolbar(node)
    }
  }, [selectedFurnitureId, furniture]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Window toolbar position ──────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedWindowId) { setWindowToolbarPos(null); return }
    const win = windows.find(w => w.id === selectedWindowId)
    if (!win) { setWindowToolbarPos(null); return }
    const c = getWindowCenter(win.wall, win.offset, offsetX, offsetY, roomW, roomH)
    setWindowToolbarPos({ x: c.x, y: c.y - 56 })
  }, [selectedWindowId, windows, offsetX, offsetY, roomW, roomH])

  // ── Toolbar position helper ──────────────────────────────────────────────────
  const updateToolbar = useCallback((node: Konva.Node) => {
    const box = node.getClientRect({ relativeTo: stageRef.current! })
    setToolbarPos({ x: box.x + box.width / 2, y: box.y - 52 })
  }, [])

  // ── Drag end (furniture) ─────────────────────────────────────────────────────
  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>, id: string) => {
    const node = e.target
    const x = Math.round(node.x() / 20) * 20
    const y = Math.round(node.y() / 20) * 20
    const item = furniture.find(f => f.id === id)
    if (!item) return
    const iw = item.width  * (item.scaleX ?? 1) * scale
    const ih = item.height * (item.scaleY ?? 1) * scale
    const cx = Math.max(offsetX, Math.min(x, offsetX + roomW - iw))
    const cy = Math.max(offsetY, Math.min(y, offsetY + roomH - ih))
    node.position({ x: cx, y: cy })
    onFurnitureUpdate(furniture.map(f => f.id === id ? { ...f, x: cx, y: cy } : f))
    updateToolbar(node)
  }, [furniture, offsetX, offsetY, roomW, roomH, scale, onFurnitureUpdate, updateToolbar])

  const handleTransformEnd = useCallback((e: Konva.KonvaEventObject<Event>, id: string) => {
    const node = e.target
    onFurnitureUpdate(furniture.map(f =>
      f.id === id
        ? { ...f, x: node.x(), y: node.y(), scaleX: node.scaleX(), scaleY: node.scaleY(), rotation: node.rotation() }
        : f
    ))
    updateToolbar(node)
  }, [furniture, onFurnitureUpdate, updateToolbar])

  // ── Door drag ────────────────────────────────────────────────────────────────
  const handleDoorDragMove = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    const { x, y } = e.target.position()
    const dTop    = Math.abs(y - offsetY)
    const dBottom = Math.abs(y - (offsetY + roomH))
    const dLeft   = Math.abs(x - offsetX)
    const dRight  = Math.abs(x - (offsetX + roomW))
    const minD = Math.min(dTop, dBottom, dLeft, dRight)
    let newWall: Wall
    let newOffset: number
    if (minD === dTop)         { newWall = "top";    newOffset = ((x - offsetX) / roomW) * 100 }
    else if (minD === dBottom) { newWall = "bottom"; newOffset = ((x - offsetX) / roomW) * 100 }
    else if (minD === dLeft)   { newWall = "left";   newOffset = ((y - offsetY) / roomH) * 100 }
    else                       { newWall = "right";  newOffset = ((y - offsetY) / roomH) * 100 }
    newOffset = Math.max(10, Math.min(90, newOffset))
    setLocalDoor({ wall: newWall, offset: newOffset })
    const snap = getDoorCenter(newWall, newOffset, offsetX, offsetY, roomW, roomH)
    e.target.x(snap.x); e.target.y(snap.y)
  }, [offsetX, offsetY, roomW, roomH])

  const handleDoorDragEnd = useCallback(() => {
    onDoorPositionChange?.(localDoor)
  }, [localDoor, onDoorPositionChange])

  // ── Window drag ──────────────────────────────────────────────────────────────
  const windowDragBound = useCallback((win: WindowItem) => (pos: { x: number; y: number }) => {
    const margin = WIN_W / 2 + 4
    switch (win.wall) {
      case "top":
        return { x: Math.max(offsetX + margin, Math.min(pos.x, offsetX + roomW - margin)), y: offsetY }
      case "bottom":
        return { x: Math.max(offsetX + margin, Math.min(pos.x, offsetX + roomW - margin)), y: offsetY + roomH }
      case "left":
        return { x: offsetX, y: Math.max(offsetY + margin, Math.min(pos.y, offsetY + roomH - margin)) }
      case "right":
        return { x: offsetX + roomW, y: Math.max(offsetY + margin, Math.min(pos.y, offsetY + roomH - margin)) }
    }
  }, [offsetX, offsetY, roomW, roomH])

  const handleWindowDragMove = useCallback((e: Konva.KonvaEventObject<DragEvent>, win: WindowItem) => {
    setWindowToolbarPos({ x: e.target.x(), y: e.target.y() - 56 })
  }, [])

  const handleWindowDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>, win: WindowItem) => {
    const { x, y } = e.target.position()
    let newOffset: number
    if (win.wall === "top" || win.wall === "bottom") {
      newOffset = ((x - offsetX) / roomW) * 100
    } else {
      newOffset = ((y - offsetY) / roomH) * 100
    }
    newOffset = Math.max(10, Math.min(90, newOffset))
    onWindowsChange(windows.map(w => w.id === win.id ? { ...w, offset: newOffset } : w))
    setWindowToolbarPos({ x: e.target.x(), y: e.target.y() - 56 })
  }, [windows, offsetX, offsetY, roomW, roomH, onWindowsChange])

  // ── Toolbar actions (furniture) ──────────────────────────────────────────────
  const rotateItem = useCallback((deg: number) => {
    if (!selectedFurnitureId) return
    onFurnitureUpdate(furniture.map(f =>
      f.id === selectedFurnitureId
        ? { ...f, rotation: (((f.rotation ?? 0) + deg) % 360 + 360) % 360 }
        : f
    ))
  }, [selectedFurnitureId, furniture, onFurnitureUpdate])

  const scaleItem = useCallback((delta: number) => {
    if (!selectedFurnitureId) return
    onFurnitureUpdate(furniture.map(f => {
      if (f.id !== selectedFurnitureId) return f
      const ns = Math.max(0.5, Math.min(2.0, (f.scaleX ?? 1) + delta))
      return { ...f, scaleX: ns, scaleY: ns }
    }))
  }, [selectedFurnitureId, furniture, onFurnitureUpdate])

  const scalePercent = useMemo(() => {
    const sel = furniture.find(f => f.id === selectedFurnitureId)
    return sel ? Math.round((sel.scaleX ?? 1) * 100) : 100
  }, [furniture, selectedFurnitureId])

  // ── Wall segments with dynamic gaps ─────────────────────────────────────────
  const wallLines = useMemo(() => {
    const dc = getDoorCenter(localDoor.wall, localDoor.offset, offsetX, offsetY, roomW, roomH)

    // Build gap list per wall: { from, to } in wall-axis coordinates
    type Gap = { from: number; to: number }
    const wallGaps: Record<Wall, Gap[]> = { top: [], right: [], bottom: [], left: [] }

    // Door gap
    const dh = DOOR_W / 2
    if (localDoor.wall === "top" || localDoor.wall === "bottom") {
      wallGaps[localDoor.wall].push({ from: dc.x - dh, to: dc.x + dh })
    } else {
      wallGaps[localDoor.wall].push({ from: dc.y - dh, to: dc.y + dh })
    }

    // Window gaps
    const wh = WIN_W / 2
    for (const win of windows) {
      const wc = getWindowCenter(win.wall, win.offset, offsetX, offsetY, roomW, roomH)
      if (win.wall === "top" || win.wall === "bottom") {
        wallGaps[win.wall].push({ from: wc.x - wh, to: wc.x + wh })
      } else {
        wallGaps[win.wall].push({ from: wc.y - wh, to: wc.y + wh })
      }
    }

    // Generate line segments for each wall
    const wallSW = is3D ? 4 : WALL_SW
    const STROKE_CONFIG = { stroke: "#1A1A1A", strokeWidth: wallSW, lineCap: "square" as const, listening: false }
    const segs: { points: number[] }[] = []

    const genSegs = (wall: Wall) => {
      const gaps = wallGaps[wall].sort((a, b) => a.from - b.from)
      let axisStart: number
      let axisEnd: number
      let toPoints: (f: number, t: number) => number[]

      switch (wall) {
        case "top":
          axisStart = offsetX; axisEnd = offsetX + roomW
          toPoints  = (f, t) => [f, offsetY,        t, offsetY]
          break
        case "bottom":
          axisStart = offsetX; axisEnd = offsetX + roomW
          toPoints  = (f, t) => [f, offsetY + roomH, t, offsetY + roomH]
          break
        case "left":
          axisStart = offsetY; axisEnd = offsetY + roomH
          toPoints  = (f, t) => [offsetX,        f, offsetX,        t]
          break
        case "right":
          axisStart = offsetY; axisEnd = offsetY + roomH
          toPoints  = (f, t) => [offsetX + roomW, f, offsetX + roomW, t]
          break
      }

      let prev = axisStart
      for (const gap of gaps) {
        const gFrom = Math.max(axisStart, gap.from)
        const gTo   = Math.min(axisEnd,   gap.to)
        if (prev < gFrom) segs.push({ points: toPoints(prev, gFrom) })
        prev = Math.max(prev, gTo)
      }
      if (prev < axisEnd) segs.push({ points: toPoints(prev, axisEnd) })
    }

    ;(["top", "right", "bottom", "left"] as Wall[]).forEach(genSegs)

    // Window rendering data
    const winCenters = windows.map(win => ({
      ...win,
      center: getWindowCenter(win.wall, win.offset, offsetX, offsetY, roomW, roomH),
    }))

    return { segs, STROKE_CONFIG, dc, winCenters }
  }, [localDoor, windows, offsetX, offsetY, roomW, roomH, is3D])

  // ── Compass rose rotation ────────────────────────────────────────────────────
  const compassRot = northWall === "top" ? 0 : northWall === "right" ? 90 : northWall === "bottom" ? 180 : northWall === "left" ? 270 : null

  // ── Stage click (deselect all) ───────────────────────────────────────────────
  const handleStageMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      onSelectFurniture(null)
      onSelectWindow(null)
    }
  }, [onSelectFurniture, onSelectWindow])

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 w-full h-full relative overflow-hidden">

      {/* ── 3D-transformed canvas wrapper ── */}
      <div
        style={{
          width: "100%", height: "100%",
          transform: is3D
            ? "perspective(900px) rotateX(42deg) rotateZ(-18deg) scale(1.15)"
            : "none",
          transition: "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
          transformOrigin: "center center",
          opacity: flashing ? 0.85 : 1,
          // opacity transition matches flash duration
          transitionProperty: "transform, opacity",
          transitionDuration: "0.7s, 0.3s",
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1), ease",
        }}
      >
        <div ref={containerRef} className="w-full h-full">
          <Stage
            ref={stageRef}
            width={stageSize.width}
            height={stageSize.height}
            onMouseDown={handleStageMouseDown}
          >
            <Layer>

              {/* ── Background ──────────────────────────────────────────── */}
              <Rect x={0} y={0} width={stageSize.width} height={stageSize.height} fill="#F2F0EC" listening={false} />
              {dotPattern && (
                <Rect
                  x={0} y={0} width={stageSize.width} height={stageSize.height}
                  fillPatternImage={dotPattern as unknown as HTMLImageElement}
                  fillPatternRepeat="repeat"
                  listening={false}
                />
              )}

              {/* ── Room floor ──────────────────────────────────────────── */}
              {is3D && woodPattern ? (
                <Rect
                  x={offsetX} y={offsetY} width={roomW} height={roomH}
                  fillPatternImage={woodPattern as unknown as HTMLImageElement}
                  fillPatternRepeat="repeat"
                  listening={false}
                />
              ) : (
                <Rect
                  x={offsetX} y={offsetY} width={roomW} height={roomH}
                  fill="#F8F6F2"
                  listening={false}
                />
              )}

              {/* ── 3D: wall extrusion ───────────────────────────────── */}
              {is3D && (
                <>
                  {/* Bottom edge extrusion */}
                  <Rect x={offsetX + 6} y={offsetY + roomH} width={roomW} height={6}
                    fill="#0A0A0A" opacity={0.6} cornerRadius={[0,0,2,2]} listening={false} />
                  {/* Right edge extrusion */}
                  <Rect x={offsetX + roomW} y={offsetY + 6} width={6} height={roomH}
                    fill="#2A2A2A" opacity={0.5} cornerRadius={[0,2,2,0]} listening={false} />
                </>
              )}

              {/* ── Bagua grid overlay ───────────────────────────────── */}
              {northWall && (
                <>
                  {[1, 2].map(i => (
                    <Line key={`bv${i}`}
                      points={[offsetX + (roomW/3)*i, offsetY, offsetX + (roomW/3)*i, offsetY + roomH]}
                      stroke="#AAAAAA" strokeWidth={1} dash={[4,4]} opacity={0.5} listening={false}
                    />
                  ))}
                  {[1, 2].map(i => (
                    <Line key={`bh${i}`}
                      points={[offsetX, offsetY + (roomH/3)*i, offsetX + roomW, offsetY + (roomH/3)*i]}
                      stroke="#AAAAAA" strokeWidth={1} dash={[4,4]} opacity={0.5} listening={false}
                    />
                  ))}
                  {ZONE_GRIDS[northWall].flatMap((row, ri) =>
                    row.map((zone, ci) => (
                      <Text
                        key={`z${ri}${ci}`}
                        text={ZONE_NAME[zone] ?? zone}
                        x={offsetX + ci * (roomW/3)}
                        y={offsetY + ri * (roomH/3) + (roomH/3)/2 - 6}
                        width={roomW/3}
                        align="center"
                        fontSize={9}
                        fontFamily="sans-serif"
                        fill="#AAAAAA"
                        listening={false}
                      />
                    ))
                  )}
                </>
              )}

              {/* ── Room walls with dynamic gaps ─────────────────────── */}
              {wallLines.segs.map((s, i) => (
                <Line key={i} {...wallLines.STROKE_CONFIG} points={s.points} />
              ))}

              {/* ── Door symbol ──────────────────────────────────────── */}
              <Path
                data={doorArcPath(localDoor.wall, wallLines.dc.x, wallLines.dc.y, DOOR_W)}
                stroke="#1A1A1A"
                strokeWidth={is3D ? 2 : 1}
                fill="transparent"
                listening={false}
              />
              <Line
                points={doorClosedLine(localDoor.wall, wallLines.dc.x, wallLines.dc.y, DOOR_W)}
                stroke="#1A1A1A" strokeWidth={is3D ? 2 : 1} listening={false}
              />
              <Text
                text="Door"
                x={wallLines.dc.x - 12}
                y={localDoor.wall === "top"   ? wallLines.dc.y + 8
                  : localDoor.wall === "left"  ? wallLines.dc.y - 5
                  : localDoor.wall === "right" ? wallLines.dc.y - 5
                  : wallLines.dc.y + 7}
                fontSize={8} fontFamily="sans-serif" fill="#999" listening={false}
              />
              {/* Draggable door handle */}
              <Circle
                x={wallLines.dc.x} y={wallLines.dc.y}
                radius={5}
                fill="white" stroke="#555" strokeWidth={1.5}
                draggable={!is3D}
                onDragMove={handleDoorDragMove}
                onDragEnd={handleDoorDragEnd}
                onMouseEnter={e => { e.target.getStage()!.container().style.cursor = "grab" }}
                onMouseLeave={e => { e.target.getStage()!.container().style.cursor = "default" }}
              />

              {/* ── Window symbols (dynamic) ─────────────────────────── */}
              {wallLines.winCenters.map((wc) => {
                const isWinSelected = wc.id === selectedWindowId
                const lines = windowLinePoints(wc.wall, wc.center.x, wc.center.y, WIN_W)
                const sw    = is3D ? 1.5 : 1
                const lp    = windowLabelPos(wc.wall, wc.center.x, wc.center.y)
                const or    = isWinSelected ? windowOutlineRect(wc.wall, wc.center.x, wc.center.y, WIN_W) : null
                const gr    = is3D ? glassRect(wc.wall, wc.center.x, wc.center.y, WIN_W) : null

                return (
                  <Group key={wc.id}>
                    {/* Glass tint in 3D */}
                    {gr && <Rect {...gr} fill="rgba(173,216,230,0.15)" listening={false} />}

                    {/* Three architectural lines */}
                    {lines.map((pts, i) => (
                      <Line key={i} points={pts} stroke="#1A1A1A" strokeWidth={sw} listening={false} />
                    ))}

                    {/* "W" label */}
                    <Text text="W" x={lp.x} y={lp.y} fontSize={8} fontFamily="sans-serif" fill="#999" listening={false} />

                    {/* Selected dashed outline */}
                    {or && (
                      <Rect
                        {...or} stroke="black" strokeWidth={1} dash={[4,3]}
                        fill="transparent" listening={false}
                      />
                    )}

                    {/* Draggable handle */}
                    <Circle
                      x={wc.center.x} y={wc.center.y}
                      radius={isWinSelected ? 7 : 5}
                      fill={isWinSelected ? "black" : "white"}
                      stroke={isWinSelected ? "white" : "#555"}
                      strokeWidth={1.5}
                      draggable={!is3D}
                      dragBoundFunc={windowDragBound(wc)}
                      onClick={() => { onSelectWindow(wc.id); onSelectFurniture(null) }}
                      onTap={()   => { onSelectWindow(wc.id); onSelectFurniture(null) }}
                      onDragMove={e => handleWindowDragMove(e, wc)}
                      onDragEnd={e  => handleWindowDragEnd(e, wc)}
                      onMouseEnter={e => { if (!is3D) e.target.getStage()!.container().style.cursor = "grab" }}
                      onMouseLeave={e => { e.target.getStage()!.container().style.cursor = "default" }}
                    />
                  </Group>
                )
              })}

              {/* ── Dimension labels ─────────────────────────────────── */}
              <Text
                text={`${(template.width  / 100).toFixed(1)}m`}
                x={offsetX} y={offsetY + roomH + 14} width={roomW} align="center"
                fontSize={9} fontFamily="sans-serif" fill="#999" listening={false}
              />
              <Text
                text={`${(template.height / 100).toFixed(1)}m`}
                x={offsetX + roomW + 8} y={offsetY + roomH / 2 - 6}
                fontSize={9} fontFamily="sans-serif" fill="#999" listening={false}
              />

              {/* ── Room label ───────────────────────────────────────── */}
              <Text
                text={template.label}
                x={offsetX + 8} y={offsetY + 8}
                fontSize={10} fontFamily="sans-serif" fontStyle="italic" fill="#BBBBBB"
                listening={false}
              />

              {/* ── Scale bar ────────────────────────────────────────── */}
              <Rect
                x={offsetX + 4} y={offsetY + roomH + 30} width={40} height={3}
                fill="#AAAAAA" cornerRadius={1} listening={false}
              />
              <Text
                text="1 grid = 0.5m"
                x={offsetX + 48} y={offsetY + roomH + 27}
                fontSize={8} fontFamily="sans-serif" fill="#AAAAAA" listening={false}
              />

              {/* ── Empty state ──────────────────────────────────────── */}
              {furniture.length === 0 && (
                <>
                  <Text
                    text="☯"
                    x={offsetX} y={offsetY + roomH / 2 - 70}
                    width={roomW} align="center"
                    fontSize={80} fill="black" opacity={0.05} listening={false}
                  />
                  <Text
                    text="Click furniture from the panel to begin"
                    x={offsetX} y={offsetY + roomH / 2 + 22}
                    width={roomW} align="center"
                    fontSize={12} fontFamily="sans-serif" fill="#BBBBBB" listening={false}
                  />
                  <Text
                    text="Start with your bed or sofa as the commanding piece"
                    x={offsetX} y={offsetY + roomH / 2 + 40}
                    width={roomW} align="center"
                    fontSize={10} fontFamily="sans-serif" fill="#CCCCCC" listening={false}
                  />
                </>
              )}

              {/* ── Furniture items ──────────────────────────────────── */}
              {furniture.map((item) => {
                const w  = item.width  * scale
                const h  = item.height * scale
                const sx = item.scaleX ?? 1
                const sy = item.scaleY ?? 1
                const isSelected  = item.id === selectedFurnitureId
                const zone        = getZone(item, offsetX, offsetY, roomW, roomH, northWall)
                const borderColor = zone ? ZONE_COLOR[zone] : "#D0D0D0"
                const emojiFSize  = Math.min(w, h) * (is3D ? 0.50 : 0.42)

                return (
                  <Group
                    key={item.id}
                    id={item.id}
                    x={item.x}
                    y={item.y}
                    rotation={item.rotation ?? 0}
                    scaleX={sx}
                    scaleY={sy}
                    draggable={!is3D}
                    onClick={() => { if (!is3D) { onSelectFurniture(item.id); onSelectWindow(null) } }}
                    onTap={()   => { if (!is3D) { onSelectFurniture(item.id); onSelectWindow(null) } }}
                    onDragEnd={e => handleDragEnd(e, item.id)}
                    onDragMove={e => updateToolbar(e.target)}
                    onTransformEnd={e => handleTransformEnd(e, item.id)}
                    dragBoundFunc={pos => ({
                      x: Math.max(offsetX, Math.min(pos.x, offsetX + roomW - w * sx)),
                      y: Math.max(offsetY, Math.min(pos.y, offsetY + roomH - h * sy)),
                    })}
                    onMouseEnter={e => { if (!is3D) e.target.getStage()!.container().style.cursor = "grab" }}
                    onMouseLeave={e => { e.target.getStage()!.container().style.cursor = "default" }}
                    shadowEnabled={is3D}
                    shadowColor="rgba(0,0,0,0.25)"
                    shadowBlur={8}
                    shadowOffsetX={4}
                    shadowOffsetY={4}
                  >
                    <Rect
                      width={w} height={h}
                      fill="white"
                      cornerRadius={8}
                      stroke={zone && northWall ? borderColor : "#D0D0D0"}
                      strokeWidth={zone && northWall ? 1.5 : 1}
                      shadowColor="rgba(0,0,0,0.06)"
                      shadowBlur={4}
                      shadowOffsetX={0}
                      shadowOffsetY={1}
                    />
                    <Text
                      text={item.emoji}
                      x={0} y={h * 0.12}
                      width={w} height={h * 0.6}
                      align="center" verticalAlign="middle"
                      fontSize={emojiFSize}
                      listening={false}
                    />
                    <Text
                      text={item.label}
                      x={0} y={h * 0.68}
                      width={w}
                      align="center"
                      fontSize={Math.max(7, Math.min(9, w / 7))}
                      fontFamily="sans-serif"
                      fill={isSelected ? "#333" : "#999"}
                      listening={false}
                    />
                  </Group>
                )
              })}

              {/* ── Konva Transformer ────────────────────────────────── */}
              <Transformer
                ref={transformerRef}
                anchorSize={8}
                anchorFill="black"
                anchorStroke="white"
                anchorStrokeWidth={1.5}
                anchorCornerRadius={1}
                borderStroke="black"
                borderStrokeWidth={1.5}
                borderDash={[5,3]}
                rotateAnchorOffset={20}
                keepRatio={false}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 20 || newBox.height < 20) return oldBox
                  return newBox
                }}
              />

              {/* ── Canvas compass rose ──────────────────────────────── */}
              <Group x={stageSize.width - 58} y={52}>
                <Circle radius={26} fill="white" stroke="#DDDDDD" strokeWidth={1} listening={false} />
                {compassRot !== null && (
                  <Group rotation={compassRot}>
                    <Line points={[0,-18,-5,-6,5,-6]} closed fill="red" stroke="red" strokeWidth={0.5} listening={false} />
                    <Line points={[0,-6,0,10]}         stroke="#CCCCCC" strokeWidth={2} listening={false} />
                    <Line points={[0,10,-5,6,5,6]}    closed fill="#CCCCCC" stroke="#CCCCCC" strokeWidth={0.5} listening={false} />
                  </Group>
                )}
                <Text text="N" x={-4} y={compassRot !== null ? -26 : -8} fontSize={9}
                  fontFamily="sans-serif" fontStyle="bold"
                  fill={compassRot !== null ? "red" : "#AAAAAA"} listening={false}
                />
                {compassRot !== null && (
                  <>
                    <Text text="S" x={-4}  y={18}  fontSize={8} fontFamily="sans-serif" fill="#AAAAAA" listening={false} />
                    <Text text="E" x={17}  y={-4}  fontSize={8} fontFamily="sans-serif" fill="#AAAAAA" listening={false} />
                    <Text text="W" x={-22} y={-4}  fontSize={8} fontFamily="sans-serif" fill="#AAAAAA" listening={false} />
                  </>
                )}
              </Group>

            </Layer>
          </Stage>
        </div>
      </div>

      {/* ── HTML furniture toolbar ─────────────────────────────────────────── */}
      {selectedFurnitureId && toolbarPos && !is3D && (
        <div
          className="absolute z-20 flex items-center gap-0.5 bg-white border border-black rounded-xl shadow-lg px-2 py-1 pointer-events-auto"
          style={{ left: toolbarPos.x, top: Math.max(4, toolbarPos.y), transform: "translateX(-50%)" }}
        >
          <button type="button" onClick={() => rotateItem(-45)}
            className="w-7 h-7 flex items-center justify-center bg-white border border-black rounded-lg hover:bg-black hover:text-white transition-colors"
            title="Rotate CCW"><RotateCcw size={12} /></button>
          <button type="button" onClick={() => rotateItem(45)}
            className="w-7 h-7 flex items-center justify-center bg-white border border-black rounded-lg hover:bg-black hover:text-white transition-colors"
            title="Rotate CW"><RotateCw size={12} /></button>
          <div className="w-px h-5 bg-gray-200 mx-0.5" />
          <button type="button" onClick={() => scaleItem(-0.1)}
            className="w-7 h-7 flex items-center justify-center bg-white border border-black rounded-lg hover:bg-black hover:text-white transition-colors"
            title="Decrease size"><Minus size={12} /></button>
          <span className="font-sans text-[11px] text-gray-500 w-8 text-center select-none">{scalePercent}%</span>
          <button type="button" onClick={() => scaleItem(0.1)}
            className="w-7 h-7 flex items-center justify-center bg-white border border-black rounded-lg hover:bg-black hover:text-white transition-colors"
            title="Increase size"><Plus size={12} /></button>
          <div className="w-px h-5 bg-gray-200 mx-0.5" />
          <button type="button"
            onClick={() => { onRemoveFurniture(selectedFurnitureId); setToolbarPos(null) }}
            className="w-7 h-7 flex items-center justify-center bg-white border border-red-300 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
            title="Remove"><Trash2 size={12} /></button>
        </div>
      )}

      {/* ── HTML window toolbar ───────────────────────────────────────────── */}
      {selectedWindowId && windowToolbarPos && !is3D && (
        <div
          className="absolute z-20 flex items-center gap-1 bg-white border border-black rounded-xl shadow-lg px-2 py-1.5 pointer-events-auto"
          style={{ left: windowToolbarPos.x, top: Math.max(4, windowToolbarPos.y), transform: "translateX(-50%)" }}
        >
          <span className="font-sans text-[11px] text-gray-400 mr-0.5 select-none">Move to:</span>
          {(["Top", "Right", "Bottom", "Left"] as const).map((label) => {
            const wall = label.toLowerCase() as Wall
            const win  = windows.find(w => w.id === selectedWindowId)
            const isCurrent = win?.wall === wall
            return (
              <button
                key={wall}
                type="button"
                onClick={() => {
                  onWindowsChange(windows.map(w => w.id === selectedWindowId ? { ...w, wall, offset: 50 } : w))
                }}
                className={`px-2 py-0.5 rounded-full font-sans text-[11px] font-medium border transition-colors ${
                  isCurrent
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-black hover:bg-gray-100"
                }`}
              >
                {label}
              </button>
            )
          })}
          <div className="w-px h-5 bg-gray-200 mx-0.5" />
          <button
            type="button"
            onClick={() => {
              onWindowsChange(windows.filter(w => w.id !== selectedWindowId))
              onSelectWindow(null)
            }}
            className="w-7 h-7 flex items-center justify-center bg-white border border-red-300 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
            title="Delete window"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}

      {/* ── 3D badge (flat, outside transform) ──────────────────────────── */}
      {is3D && (
        <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none">
          <span className="bg-black text-white font-sans text-[11px] font-medium rounded-full px-2.5 py-1 leading-none">
            3D Preview
          </span>
          <span className="font-sans text-[10px] text-gray-400 pl-1">
            Switch to 2D to edit
          </span>
        </div>
      )}

      {/* ── Canvas hint ───────────────────────────────────────────────────── */}
      {!is3D && (
        <p className="absolute bottom-2 left-1/2 -translate-x-1/2 font-sans text-[11px] text-gray-400 whitespace-nowrap pointer-events-none select-none">
          Click to select · Drag to move · Drag ◦ to move door/window
        </p>
      )}
    </div>
  )
}
