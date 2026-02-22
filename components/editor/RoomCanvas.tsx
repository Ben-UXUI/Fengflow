"use client"

import { useEffect, useRef, useState, useMemo, useCallback } from "react"
import { Stage, Layer, Rect, Group, Text, Line, Path, Circle, Transformer } from "react-konva"
import { PlacedFurniture, Template, Direction, Wall, WindowItem } from "@/lib/room-types"
import Konva from "konva"
import { RotateCcw, RotateCw, Minus, Plus, Trash2, Copy, ArrowUpToLine, ArrowDownToLine } from "lucide-react"

// ── Constants ──────────────────────────────────────────────────────────────
const DOT_SPACING = 20
const DOOR_W      = 48
const WIN_W       = 50
const WALL_SW     = 3
const SNAP_THRESH = 8

// ── Fixed Bagua grid — South always at top, North always at bottom ─────────
// Row 0 = top row (South side), Row 2 = bottom row (North side)
const FIXED_BAGUA = [
  ["SW", "S",  "SE"],
  ["W",  "C",  "E" ],
  ["NW", "N",  "NE"],
] as const

const FIXED_ZONE: Record<string, { label: string; zh: string; element: string; color: string }> = {
  S:  { label: "Fame",       zh: "名誉", element: "Fire",  color: "#E74C3C" },
  SW: { label: "Love",       zh: "感情", element: "Earth", color: "#D4A843" },
  SE: { label: "Wealth",     zh: "财富", element: "Wood",  color: "#4CAF50" },
  W:  { label: "Creativity", zh: "创意", element: "Metal", color: "#9E9E9E" },
  C:  { label: "Health",     zh: "健康", element: "Earth", color: "#D4A843" },
  E:  { label: "Family",     zh: "家庭", element: "Wood",  color: "#4CAF50" },
  NW: { label: "Helpful",    zh: "贵人", element: "Metal", color: "#9E9E9E" },
  N:  { label: "Career",     zh: "事业", element: "Water", color: "#2196F3" },
  NE: { label: "Knowledge",  zh: "智慧", element: "Earth", color: "#D4A843" },
}

// Facing direction → which wall the door is on and at what offset
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

// Element colour for the facing wall highlight
const FACING_COLOR: Record<Direction, string> = {
  N: "#2196F3", NE: "#D4A843", E: "#4CAF50", SE: "#4CAF50",
  S: "#E74C3C", SW: "#D4A843", W: "#9E9E9E", NW: "#9E9E9E",
}

// Angle (from North, clockwise) for compass rose gold dot
const DIR_ANGLE: Record<Direction, number> = {
  N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315,
}

// ── Room style ─────────────────────────────────────────────────────────────
type RoomStyle = "default" | "blueprint" | "parchment"
const STYLE_CFG: Record<RoomStyle, {
  canvasBg: string; roomFill: string; wallColor: string; textColor: string; dotColor: string
}> = {
  default:   { canvasBg: "#F2F0EC", roomFill: "#F8F6F2", wallColor: "#1A1A1A", textColor: "#999999", dotColor: "#CFCFCF" },
  blueprint: { canvasBg: "#0A1628", roomFill: "#0D1F38", wallColor: "#00B4D8", textColor: "#4FC3F7", dotColor: "#1A3855" },
  parchment: { canvasBg: "#EDE0CC", roomFill: "#F5EDD8", wallColor: "#6B4E2A", textColor: "#8B7355", dotColor: "#C4B090" },
}

// ── Helpers ────────────────────────────────────────────────────────────────
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

// Convert room-relative percent to canvas pixel position/size
function itemToPixels(
  item: PlacedFurniture,
  offsetX: number, offsetY: number, roomW: number, roomH: number
) {
  return {
    x: offsetX + (item.xPercent / 100) * roomW,
    y: offsetY + (item.yPercent / 100) * roomH,
    w: (item.widthPercent / 100) * roomW,
    h: (item.heightPercent / 100) * roomH,
  }
}

// Get the Bagua zone for a point (pixel coords) based on fixed layout
function getZone(px: number, py: number, ox: number, oy: number, rw: number, rh: number): string | null {
  const relX = (px - ox) / rw
  const relY = (py - oy) / rh
  if (relX < 0 || relX > 1 || relY < 0 || relY > 1) return null
  const col = Math.min(2, Math.floor(relX * 3))
  const row = Math.min(2, Math.floor(relY * 3))
  return FIXED_BAGUA[row]?.[col] ?? null
}

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
function windowOutlineRect(wall: Wall, cx: number, cy: number, ww: number) {
  const half = ww / 2
  switch (wall) {
    case "top":    return { x: cx-half-2, y: cy-4,       width: ww+4, height: 28 }
    case "bottom": return { x: cx-half-2, y: cy-24,      width: ww+4, height: 28 }
    case "left":   return { x: cx-4,      y: cy-half-2,  width: 28, height: ww+4 }
    case "right":  return { x: cx-24,     y: cy-half-2,  width: 28, height: ww+4 }
  }
}
function glassRect(wall: Wall, cx: number, cy: number, ww: number) {
  const half = ww / 2
  switch (wall) {
    case "top":    return { x: cx-half, y: cy,       width: ww, height: 20 }
    case "bottom": return { x: cx-half, y: cy-20,    width: ww, height: 20 }
    case "left":   return { x: cx,      y: cy-half,  width: 20, height: ww }
    case "right":  return { x: cx-20,   y: cy-half,  width: 20, height: ww }
  }
}

// ── Component ──────────────────────────────────────────────────────────────
export interface RoomCanvasProps {
  template:             Template
  facingDirection:      Direction | null
  furniture:            PlacedFurniture[]
  windows:              WindowItem[]
  doorPosition:         { wall: Wall; offset: number }
  selectedFurnitureId:  string | null
  selectedWindowId:     string | null
  onFurnitureUpdate:    (f: PlacedFurniture[]) => void
  onSelectFurniture:    (id: string | null) => void
  onRemoveFurniture:    (id: string) => void
  onWindowsChange:      (windows: WindowItem[]) => void
  onSelectWindow:       (id: string | null) => void
  onLayoutReady?:       (l: { offsetX: number; offsetY: number; roomWidth: number; roomHeight: number; scale: number }) => void
  onDoorPositionChange?:(d: { wall: Wall; offset: number }) => void
  onIs3DInteract?:      () => void
  lastAddedId?:         string | null
  is3D?:                boolean
  zoom?:                number
  roomStyle?:           RoomStyle
}

export function RoomCanvas({
  template, facingDirection, furniture, windows, doorPosition,
  selectedFurnitureId, selectedWindowId,
  onFurnitureUpdate, onSelectFurniture, onRemoveFurniture,
  onWindowsChange, onSelectWindow,
  onLayoutReady, onDoorPositionChange, onIs3DInteract,
  lastAddedId, is3D = false,
  zoom = 1.0,
  roomStyle = "default",
}: RoomCanvasProps) {

  const containerRef   = useRef<HTMLDivElement>(null)
  const stageRef       = useRef<Konva.Stage>(null)
  const transformerRef = useRef<Konva.Transformer>(null)
  const renameInputRef = useRef<HTMLInputElement>(null)

  const [stageSize,        setStageSize]        = useState({ width: 600, height: 500 })
  const [localDoor,        setLocalDoor]        = useState(doorPosition)
  const [toolbarPos,       setToolbarPos]       = useState<{ x: number; y: number } | null>(null)
  const [windowToolbarPos, setWindowToolbarPos] = useState<{ x: number; y: number } | null>(null)
  const [dotPattern,       setDotPattern]       = useState<HTMLCanvasElement | null>(null)
  const [woodPattern,      setWoodPattern]      = useState<HTMLCanvasElement | null>(null)
  const [renamingId,       setRenamingId]       = useState<string | null>(null)
  const [renameValue,      setRenameValue]      = useState("")
  const [contextMenu,      setContextMenu]      = useState<{ x: number; y: number; itemId: string } | null>(null)
  const [snapLines,        setSnapLines]        = useState<{ h: number[]; v: number[] }>({ h: [], v: [] })

  const colors = STYLE_CFG[roomStyle]

  // Zoom-adjusted coordinate transform (stage px → CSS px)
  const toCSS = useCallback((pt: { x: number; y: number }) => ({
    x: pt.x * zoom + stageSize.width  * (1 - zoom) / 2,
    y: pt.y * zoom + stageSize.height * (1 - zoom) / 2,
  }), [zoom, stageSize])

  // ── Dot pattern ──────────────────────────────────────────────────────────
  useEffect(() => {
    const c = document.createElement("canvas")
    c.width = DOT_SPACING; c.height = DOT_SPACING
    const ctx = c.getContext("2d")!
    ctx.fillStyle = colors.dotColor
    ctx.beginPath(); ctx.arc(DOT_SPACING/2, DOT_SPACING/2, 1.2, 0, Math.PI*2); ctx.fill()
    setDotPattern(c)
  }, [colors.dotColor])

  // ── Wood plank pattern (for 3D floor) ────────────────────────────────────
  useEffect(() => {
    const c = document.createElement("canvas")
    c.width = 40; c.height = 40
    const ctx = c.getContext("2d")!
    ctx.fillStyle = "#F5F0E8"; ctx.fillRect(0, 0, 40, 40)
    ctx.fillStyle = "#E8DFD0"; ctx.fillRect(39, 0, 1, 40)
    setWoodPattern(c)
  }, [])

  // ── Size observer ─────────────────────────────────────────────────────────
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

  useEffect(() => { setLocalDoor(doorPosition) }, [doorPosition])

  // ── Layout geometry ───────────────────────────────────────────────────────
  const scaleX = stageSize.width  / (template.width  + 120)
  const scaleY = stageSize.height / (template.height + 80)
  const scale  = Math.min(scaleX, scaleY) * 0.85
  const roomW  = template.width  * scale
  const roomH  = template.height * scale
  const offsetX = (stageSize.width  - roomW) / 2
  const offsetY = (stageSize.height - roomH) / 2

  useEffect(() => {
    onLayoutReady?.({ offsetX, offsetY, roomWidth: roomW, roomHeight: roomH, scale })
  }, [offsetX, offsetY, roomW, roomH, scale, onLayoutReady])

  // ── Transformer ───────────────────────────────────────────────────────────
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

  // ── Window toolbar ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedWindowId) { setWindowToolbarPos(null); return }
    const win = windows.find(w => w.id === selectedWindowId)
    if (!win) { setWindowToolbarPos(null); return }
    const c = getWindowCenter(win.wall, win.offset, offsetX, offsetY, roomW, roomH)
    setWindowToolbarPos({ x: c.x, y: c.y - 56 })
  }, [selectedWindowId, windows, offsetX, offsetY, roomW, roomH])

  const updateToolbar = useCallback((node: Konva.Node) => {
    const box = node.getClientRect({ relativeTo: stageRef.current! })
    setToolbarPos({ x: box.x + box.width / 2, y: box.y - 52 })
  }, [])

  // ── Snap lines ────────────────────────────────────────────────────────────
  const computeSnapLines = useCallback((draggedId: string, dragX: number, dragY: number) => {
    const item = furniture.find(f => f.id === draggedId)
    if (!item) return
    const dp = itemToPixels(item, offsetX, offsetY, roomW, roomH)
    const dw = dp.w, dh = dp.h
    const dEH = [dragY, dragY + dh/2, dragY + dh]
    const dEV = [dragX, dragX + dw/2, dragX + dw]
    const hLines: number[] = []
    const vLines: number[] = []
    for (const other of furniture) {
      if (other.id === draggedId) continue
      const op = itemToPixels(other, offsetX, offsetY, roomW, roomH)
      const iEH = [op.y, op.y + op.h/2, op.y + op.h]
      const iEV = [op.x, op.x + op.w/2, op.x + op.w]
      for (const de of dEH) for (const ie of iEH) if (Math.abs(de - ie) < SNAP_THRESH) hLines.push(ie)
      for (const de of dEV) for (const ie of iEV) if (Math.abs(de - ie) < SNAP_THRESH) vLines.push(ie)
    }
    for (const de of dEH) for (const re of [offsetY, offsetY+roomH/2, offsetY+roomH]) if (Math.abs(de - re) < SNAP_THRESH) hLines.push(re)
    for (const de of dEV) for (const re of [offsetX, offsetX+roomW/2, offsetX+roomW]) if (Math.abs(de - re) < SNAP_THRESH) vLines.push(re)
    setSnapLines({ h: [...new Set(hLines)], v: [...new Set(vLines)] })
  }, [furniture, offsetX, offsetY, roomW, roomH])

  // ── Drag end ──────────────────────────────────────────────────────────────
  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>, id: string) => {
    setSnapLines({ h: [], v: [] })
    const node = e.target
    let x = Math.round(node.x() / 20) * 20
    let y = Math.round(node.y() / 20) * 20
    const item = furniture.find(f => f.id === id)
    if (!item) return
    const pw = (item.widthPercent / 100) * roomW
    const ph = (item.heightPercent / 100) * roomH
    const cx = Math.max(offsetX, Math.min(x, offsetX + roomW - pw))
    const cy = Math.max(offsetY, Math.min(y, offsetY + roomH - ph))
    node.position({ x: cx, y: cy })
    const xPercent = ((cx - offsetX) / roomW) * 100
    const yPercent = ((cy - offsetY) / roomH) * 100
    onFurnitureUpdate(furniture.map(f => f.id === id ? { ...f, xPercent, yPercent } : f))
    updateToolbar(node)
  }, [furniture, offsetX, offsetY, roomW, roomH, onFurnitureUpdate, updateToolbar])

  // ── Transform end — absorb scale into widthPercent/heightPercent
  const handleTransformEnd = useCallback((e: Konva.KonvaEventObject<Event>, id: string) => {
    const node = e.target as Konva.Group
    const item = furniture.find(f => f.id === id)
    if (!item) return
    const sx = node.scaleX()
    const sy = node.scaleY()
    const pixelW = (item.widthPercent / 100) * roomW
    const pixelH = (item.heightPercent / 100) * roomH
    const newPixelW = Math.max(20, pixelW * Math.abs(sx))
    const newPixelH = Math.max(20, pixelH * Math.abs(sy))
    const px = node.x()
    const py = node.y()
    node.scaleX(1); node.scaleY(1)
    const xPercent = ((px - offsetX) / roomW) * 100
    const yPercent = ((py - offsetY) / roomH) * 100
    const widthPercent = (newPixelW / roomW) * 100
    const heightPercent = (newPixelH / roomH) * 100
    onFurnitureUpdate(furniture.map(f =>
      f.id === id
        ? { ...f, xPercent, yPercent, widthPercent, heightPercent, rotation: node.rotation() }
        : f
    ))
    updateToolbar(node)
  }, [furniture, offsetX, offsetY, roomW, roomH, onFurnitureUpdate, updateToolbar])

  // ── Door drag ─────────────────────────────────────────────────────────────
  const handleDoorDragMove = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    const { x, y } = e.target.position()
    const dT = Math.abs(y - offsetY), dB = Math.abs(y - (offsetY+roomH))
    const dL = Math.abs(x - offsetX), dR = Math.abs(x - (offsetX+roomW))
    const minD = Math.min(dT, dB, dL, dR)
    let newWall: Wall, newOffset: number
    if      (minD === dT) { newWall = "top";    newOffset = ((x-offsetX)/roomW)*100 }
    else if (minD === dB) { newWall = "bottom"; newOffset = ((x-offsetX)/roomW)*100 }
    else if (minD === dL) { newWall = "left";   newOffset = ((y-offsetY)/roomH)*100 }
    else                  { newWall = "right";  newOffset = ((y-offsetY)/roomH)*100 }
    newOffset = Math.max(10, Math.min(90, newOffset))
    setLocalDoor({ wall: newWall, offset: newOffset })
    const snap = getDoorCenter(newWall, newOffset, offsetX, offsetY, roomW, roomH)
    e.target.x(snap.x); e.target.y(snap.y)
  }, [offsetX, offsetY, roomW, roomH])

  const handleDoorDragEnd = useCallback(() => { onDoorPositionChange?.(localDoor) }, [localDoor, onDoorPositionChange])

  // ── Window drag ───────────────────────────────────────────────────────────
  const windowDragBound = useCallback((win: WindowItem) => (pos: { x: number; y: number }) => {
    const margin = WIN_W/2 + 4
    switch (win.wall) {
      case "top":    return { x: Math.max(offsetX+margin, Math.min(pos.x, offsetX+roomW-margin)), y: offsetY }
      case "bottom": return { x: Math.max(offsetX+margin, Math.min(pos.x, offsetX+roomW-margin)), y: offsetY+roomH }
      case "left":   return { x: offsetX, y: Math.max(offsetY+margin, Math.min(pos.y, offsetY+roomH-margin)) }
      case "right":  return { x: offsetX+roomW, y: Math.max(offsetY+margin, Math.min(pos.y, offsetY+roomH-margin)) }
    }
  }, [offsetX, offsetY, roomW, roomH])

  const handleWindowDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>, win: WindowItem) => {
    const { x, y } = e.target.position()
    let newOffset = win.wall === "top" || win.wall === "bottom"
      ? ((x-offsetX)/roomW)*100
      : ((y-offsetY)/roomH)*100
    newOffset = Math.max(10, Math.min(90, newOffset))
    onWindowsChange(windows.map(w => w.id === win.id ? { ...w, offset: newOffset } : w))
    setWindowToolbarPos({ x: e.target.x(), y: e.target.y() - 56 })
  }, [windows, offsetX, offsetY, roomW, roomH, onWindowsChange])

  // ── Toolbar actions ───────────────────────────────────────────────────────
  const rotateItem = useCallback((deg: number, id?: string) => {
    const tid = id ?? selectedFurnitureId; if (!tid) return
    onFurnitureUpdate(furniture.map(f => f.id === tid ? { ...f, rotation: (((f.rotation??0)+deg)%360+360)%360 } : f))
  }, [selectedFurnitureId, furniture, onFurnitureUpdate])

  const scaleItem = useCallback((delta: number) => {
    if (!selectedFurnitureId) return
    onFurnitureUpdate(furniture.map(f => {
      if (f.id !== selectedFurnitureId) return f
      const factor = Math.max(0.5, Math.min(2.0, 1 + delta))
      let wP = f.widthPercent * factor
      let hP = f.heightPercent * factor
      wP = Math.max(2, Math.min(50, wP))
      hP = Math.max(2, Math.min(50, hP))
      const xP = Math.max(0, Math.min(100 - wP, f.xPercent))
      const yP = Math.max(0, Math.min(100 - hP, f.yPercent))
      return { ...f, widthPercent: wP, heightPercent: hP, xPercent: xP, yPercent: yP }
    }))
  }, [selectedFurnitureId, furniture, onFurnitureUpdate])

  const duplicateItem = useCallback((id: string) => {
    const src = furniture.find(f => f.id === id); if (!src) return
    const delta = 4
    let xP = src.xPercent + delta
    let yP = src.yPercent + delta
    xP = Math.max(0, Math.min(100 - src.widthPercent, xP))
    yP = Math.max(0, Math.min(100 - src.heightPercent, yP))
    onFurnitureUpdate([...furniture, { ...src, id: `furniture-${Date.now()}`, xPercent: xP, yPercent: yP }])
  }, [furniture, onFurnitureUpdate])

  const moveToFront = useCallback((id: string) => {
    const idx = furniture.findIndex(f => f.id === id); if (idx < 0) return
    const arr = [...furniture]; const [item] = arr.splice(idx, 1); onFurnitureUpdate([...arr, item])
  }, [furniture, onFurnitureUpdate])

  const moveToBack = useCallback((id: string) => {
    const idx = furniture.findIndex(f => f.id === id); if (idx < 0) return
    const arr = [...furniture]; const [item] = arr.splice(idx, 1); onFurnitureUpdate([item, ...arr])
  }, [furniture, onFurnitureUpdate])

  const scalePercent = useMemo(() => {
    const sel = furniture.find(f => f.id === selectedFurnitureId)
    if (!sel) return 100
    const avg = (sel.widthPercent + sel.heightPercent) / 2
    return Math.round((avg / 10) * 100)
  }, [furniture, selectedFurnitureId])

  // ── Double-click rename ───────────────────────────────────────────────────
  const handleDblClick = useCallback((item: PlacedFurniture) => {
    if (is3D) return
    setRenamingId(item.id); setRenameValue(item.label)
    setTimeout(() => renameInputRef.current?.select(), 50)
  }, [is3D])

  const commitRename = useCallback(() => {
    if (!renamingId || !renameValue.trim()) { setRenamingId(null); return }
    onFurnitureUpdate(furniture.map(f => f.id === renamingId ? { ...f, label: renameValue.trim() } : f))
    setRenamingId(null)
  }, [renamingId, renameValue, furniture, onFurnitureUpdate])

  // ── Context menu ──────────────────────────────────────────────────────────
  const handleContextMenu = useCallback((e: Konva.KonvaEventObject<PointerEvent>, id: string) => {
    e.evt.preventDefault()
    if (is3D) return
    const rect = stageRef.current?.container().getBoundingClientRect()
    if (!rect) return
    setContextMenu({ x: e.evt.clientX - rect.left, y: e.evt.clientY - rect.top, itemId: id })
    onSelectFurniture(id)
  }, [is3D, onSelectFurniture])

  // ── Wall segments with dynamic gaps ──────────────────────────────────────
  const wallLines = useMemo(() => {
    const dc = getDoorCenter(localDoor.wall, localDoor.offset, offsetX, offsetY, roomW, roomH)
    type Gap = { from: number; to: number }
    const wallGaps: Record<Wall, Gap[]> = { top: [], right: [], bottom: [], left: [] }
    const dh = DOOR_W/2
    if (localDoor.wall === "top" || localDoor.wall === "bottom")
      wallGaps[localDoor.wall].push({ from: dc.x-dh, to: dc.x+dh })
    else
      wallGaps[localDoor.wall].push({ from: dc.y-dh, to: dc.y+dh })
    const wh = WIN_W/2
    for (const win of windows) {
      const wc = getWindowCenter(win.wall, win.offset, offsetX, offsetY, roomW, roomH)
      if (win.wall === "top" || win.wall === "bottom")
        wallGaps[win.wall].push({ from: wc.x-wh, to: wc.x+wh })
      else
        wallGaps[win.wall].push({ from: wc.y-wh, to: wc.y+wh })
    }
    const wallSW = is3D ? 4 : WALL_SW
    const segs: { points: number[]; wall: Wall }[] = []
    const genSegs = (wall: Wall) => {
      const gaps = wallGaps[wall].sort((a,b) => a.from - b.from)
      let axisStart: number, axisEnd: number, toPoints: (f:number,t:number)=>number[]
      switch (wall) {
        case "top":    axisStart=offsetX; axisEnd=offsetX+roomW; toPoints=(f,t)=>[f,offsetY,t,offsetY]; break
        case "bottom": axisStart=offsetX; axisEnd=offsetX+roomW; toPoints=(f,t)=>[f,offsetY+roomH,t,offsetY+roomH]; break
        case "left":   axisStart=offsetY; axisEnd=offsetY+roomH; toPoints=(f,t)=>[offsetX,f,offsetX,t]; break
        case "right":  axisStart=offsetY; axisEnd=offsetY+roomH; toPoints=(f,t)=>[offsetX+roomW,f,offsetX+roomW,t]; break
      }
      let prev = axisStart
      for (const gap of gaps) {
        const gFrom = Math.max(axisStart, gap.from)
        const gTo   = Math.min(axisEnd, gap.to)
        if (prev < gFrom) segs.push({ points: toPoints(prev, gFrom), wall })
        prev = Math.max(prev, gTo)
      }
      if (prev < axisEnd) segs.push({ points: toPoints(prev, axisEnd), wall })
    }
    ;(["top","right","bottom","left"] as Wall[]).forEach(genSegs)
    const winCenters = windows.map(win => ({ ...win, center: getWindowCenter(win.wall, win.offset, offsetX, offsetY, roomW, roomH) }))
    return { segs, wallSW, dc, winCenters }
  }, [localDoor, windows, offsetX, offsetY, roomW, roomH, is3D])

  // ── Facing direction wall highlight points ────────────────────────────────
  const facingHighlight = useMemo(() => {
    if (!facingDirection) return null
    const doorWall = FACING_TO_DOOR[facingDirection].wall
    const c = FACING_COLOR[facingDirection]
    const inset = 3
    switch (doorWall) {
      case "top":    return { points: [offsetX+inset, offsetY+inset, offsetX+roomW-inset, offsetY+inset], color: c }
      case "bottom": return { points: [offsetX+inset, offsetY+roomH-inset, offsetX+roomW-inset, offsetY+roomH-inset], color: c }
      case "left":   return { points: [offsetX+inset, offsetY+inset, offsetX+inset, offsetY+roomH-inset], color: c }
      case "right":  return { points: [offsetX+roomW-inset, offsetY+inset, offsetX+roomW-inset, offsetY+roomH-inset], color: c }
    }
  }, [facingDirection, offsetX, offsetY, roomW, roomH])

  // ── Facing direction outward arrow + label ────────────────────────────────
  const facingArrow = useMemo(() => {
    if (!facingDirection) return null
    const dc = wallLines.dc
    const ARR = 8; const GAP = 6
    let arrowPts: number[], labelPos: { x: number; y: number }, dirLabelPos: { x: number; y: number }
    switch (localDoor.wall) {
      case "top":
        arrowPts = [dc.x-ARR, dc.y-GAP-2, dc.x+ARR, dc.y-GAP-2, dc.x, dc.y-GAP-2-ARR*1.4]
        labelPos    = { x: dc.x-14, y: dc.y-GAP-2-ARR*1.4-14 }
        dirLabelPos = { x: dc.x-18, y: dc.y-GAP-2-ARR*1.4-26 }
        break
      case "bottom":
        arrowPts = [dc.x-ARR, dc.y+GAP+2, dc.x+ARR, dc.y+GAP+2, dc.x, dc.y+GAP+2+ARR*1.4]
        labelPos    = { x: dc.x-14, y: dc.y+GAP+2+ARR*1.4+2 }
        dirLabelPos = { x: dc.x-18, y: dc.y+GAP+2+ARR*1.4+14 }
        break
      case "left":
        arrowPts = [dc.x-GAP-2, dc.y-ARR, dc.x-GAP-2, dc.y+ARR, dc.x-GAP-2-ARR*1.4, dc.y]
        labelPos    = { x: dc.x-GAP-2-ARR*1.4-40, y: dc.y-6 }
        dirLabelPos = { x: dc.x-GAP-2-ARR*1.4-40, y: dc.y+6 }
        break
      case "right":
        arrowPts = [dc.x+GAP+2, dc.y-ARR, dc.x+GAP+2, dc.y+ARR, dc.x+GAP+2+ARR*1.4, dc.y]
        labelPos    = { x: dc.x+GAP+2+ARR*1.4+4, y: dc.y-6 }
        dirLabelPos = { x: dc.x+GAP+2+ARR*1.4+4, y: dc.y+6 }
        break
    }
    return { arrowPts, labelPos, dirLabelPos, dir: facingDirection, color: FACING_COLOR[facingDirection] }
  }, [facingDirection, localDoor.wall, wallLines.dc])

  // ── Rename input position ─────────────────────────────────────────────────
  const renamePos = useMemo(() => {
    if (!renamingId) return null
    const item = furniture.find(f => f.id === renamingId); if (!item) return null
    const p = itemToPixels(item, offsetX, offsetY, roomW, roomH)
    return toCSS({ x: p.x + p.w/2, y: p.y + p.h*0.78 })
  }, [renamingId, furniture, offsetX, offsetY, roomW, roomH, toCSS])

  // Zoom-adjusted toolbar CSS positions
  const toolbarCSSPos    = toolbarPos       ? toCSS(toolbarPos)       : null
  const winToolbarCSSPos = windowToolbarPos ? toCSS(windowToolbarPos) : null

  // Canvas compass rose position (bottom-right, inside canvas, outside room)
  const crX = stageSize.width  - 68
  const crY = stageSize.height - 68

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 w-full h-full relative overflow-hidden" onContextMenu={e => e.preventDefault()}>

      {/* ── 3D/zoom transform wrapper ───────────────────────────────────── */}
      <div
        style={{
          width: "100%", height: "100%",
          transform: is3D
            ? "perspective(1000px) rotateX(40deg) rotateZ(-15deg) scale(1.2)"
            : zoom !== 1 ? `scale(${zoom})` : "none",
          transition: "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
          transformOrigin: "center center",
          transformStyle: "preserve-3d",
        }}
      >
        <div ref={containerRef} className="w-full h-full">
          <Stage
            ref={stageRef}
            width={stageSize.width}
            height={stageSize.height}
            onMouseDown={e => {
              setContextMenu(null)
              if (is3D && e.target !== e.target.getStage()) {
                onIs3DInteract?.(); return
              }
              if (e.target === e.target.getStage()) {
                onSelectFurniture(null); onSelectWindow(null)
              }
            }}
          >
            <Layer>

              {/* ── Background ───────────────────────────────────────── */}
              <Rect x={0} y={0} width={stageSize.width} height={stageSize.height} fill={colors.canvasBg} listening={false} />
              {dotPattern && (
                <Rect x={0} y={0} width={stageSize.width} height={stageSize.height}
                  fillPatternImage={dotPattern as unknown as HTMLImageElement}
                  fillPatternRepeat="repeat" listening={false} />
              )}

              {/* ── Room floor ──────────────────────────────────────── */}
              {is3D && woodPattern ? (
                <Rect x={offsetX} y={offsetY} width={roomW} height={roomH}
                  fillPatternImage={woodPattern as unknown as HTMLImageElement}
                  fillPatternRepeat="repeat"
                  shadowColor="black" shadowBlur={2} shadowOffsetX={6} shadowOffsetY={6} shadowOpacity={0.3}
                  listening={false} />
              ) : (
                <Rect x={offsetX} y={offsetY} width={roomW} height={roomH}
                  fill={colors.roomFill} listening={false} />
              )}

              {/* ── 3D wall extrusion ────────────────────────────────── */}
              {is3D && (
                <>
                  <Rect x={offsetX+6} y={offsetY+roomH} width={roomW} height={6} fill="#0A0A0A" opacity={0.6} cornerRadius={[0,0,2,2]} listening={false} />
                  <Rect x={offsetX+roomW} y={offsetY+6} width={6} height={roomH} fill="#2A2A2A" opacity={0.5} cornerRadius={[0,2,2,0]} listening={false} />
                </>
              )}

              {/* ── Fixed Bagua grid — always shown ──────────────────── */}
              {[1,2].map(i => (
                <Line key={`bv${i}`}
                  points={[offsetX+(roomW/3)*i, offsetY, offsetX+(roomW/3)*i, offsetY+roomH]}
                  stroke="#E8E8E8" strokeWidth={1} dash={[4,4]} opacity={0.8} listening={false} />
              ))}
              {[1,2].map(i => (
                <Line key={`bh${i}`}
                  points={[offsetX, offsetY+(roomH/3)*i, offsetX+roomW, offsetY+(roomH/3)*i]}
                  stroke="#E8E8E8" strokeWidth={1} dash={[4,4]} opacity={0.8} listening={false} />
              ))}
              {/* Zone labels with element dots */}
              {FIXED_BAGUA.flatMap((row, ri) =>
                row.map((zoneKey, ci) => {
                  const z = FIXED_ZONE[zoneKey]
                  const cellW = roomW / 3
                  const cellH = roomH / 3
                  const cellX = offsetX + ci * cellW
                  const cellY = offsetY + ri * cellH
                  return [
                    // Element dot
                    <Circle
                      key={`dot${ri}${ci}`}
                      x={cellX + cellW/2} y={cellY + cellH/2 - 10}
                      radius={3}
                      fill={z.color} opacity={0.5} listening={false}
                    />,
                    // Zone label
                    <Text
                      key={`zlabel${ri}${ci}`}
                      text={`${z.label} · ${z.zh}`}
                      x={cellX} y={cellY + cellH/2 - 4}
                      width={cellW} align="center"
                      fontSize={7} fontFamily="sans-serif"
                      fill="#CCCCCC" listening={false}
                    />,
                  ]
                })
              )}

              {/* ── Facing direction wall highlight (inside room) ─────── */}
              {facingHighlight && (
                <Line
                  points={facingHighlight.points}
                  stroke={facingHighlight.color}
                  strokeWidth={2} opacity={0.5}
                  listening={false}
                />
              )}

              {/* ── Room walls with dynamic gaps ─────────────────────── */}
              {wallLines.segs.map((s, i) => (
                <Line key={i}
                  points={s.points}
                  stroke={colors.wallColor}
                  strokeWidth={wallLines.wallSW}
                  lineCap="square" listening={false}
                />
              ))}

              {/* ── Fixed wall cardinal labels outside the room ───────── */}
              {/* N — above top wall */}
              <Text text="N ↑"
                x={offsetX + roomW/2 - 8} y={offsetY - 16}
                fontSize={9} fontFamily="sans-serif" fontStyle="bold"
                fill={colors.textColor} listening={false} />
              {/* S — below bottom wall */}
              <Text text="S ↓"
                x={offsetX + roomW/2 - 8} y={offsetY + roomH + 3}
                fontSize={9} fontFamily="sans-serif"
                fill={colors.textColor} listening={false} />
              {/* E — right of right wall */}
              <Text text="E →"
                x={offsetX + roomW + 4} y={offsetY + roomH/2 - 5}
                fontSize={9} fontFamily="sans-serif"
                fill={colors.textColor} listening={false} />
              {/* W — left of left wall */}
              <Text text="← W"
                x={offsetX - 22} y={offsetY + roomH/2 - 5}
                fontSize={9} fontFamily="sans-serif"
                fill={colors.textColor} listening={false} />

              {/* ── Door symbol ──────────────────────────────────────── */}
              <Path
                data={doorArcPath(localDoor.wall, wallLines.dc.x, wallLines.dc.y, DOOR_W)}
                stroke={colors.wallColor} strokeWidth={is3D ? 2 : 1}
                fill="transparent" listening={false}
              />
              <Line
                points={doorClosedLine(localDoor.wall, wallLines.dc.x, wallLines.dc.y, DOOR_W)}
                stroke={colors.wallColor} strokeWidth={is3D ? 2 : 1} listening={false}
              />
              {/* "Entrance" label inside room */}
              <Text
                text="Entrance"
                x={wallLines.dc.x - 20}
                y={localDoor.wall==="top"   ? wallLines.dc.y + 6
                  : localDoor.wall==="left" ? wallLines.dc.y - 4
                  : localDoor.wall==="right"? wallLines.dc.y - 4
                  : wallLines.dc.y - 14}
                fontSize={8} fontFamily="sans-serif" fontStyle="bold"
                fill="#444444" listening={false}
              />
              {/* Facing direction outward arrow + label */}
              {facingArrow && (
                <>
                  <Line
                    points={facingArrow.arrowPts}
                    closed fill={facingArrow.color} stroke={facingArrow.color}
                    strokeWidth={0} opacity={0.75} listening={false}
                  />
                  <Text
                    text="Faces"
                    x={facingArrow.labelPos.x} y={facingArrow.labelPos.y}
                    fontSize={7} fontFamily="sans-serif" fill={facingArrow.color} opacity={0.8} listening={false}
                  />
                  <Text
                    text={facingArrow.dir}
                    x={facingArrow.dirLabelPos.x} y={facingArrow.dirLabelPos.y}
                    fontSize={8} fontFamily="sans-serif" fontStyle="bold"
                    fill={facingArrow.color} opacity={0.9} listening={false}
                  />
                </>
              )}
              {/* Draggable door handle */}
              <Circle
                x={wallLines.dc.x} y={wallLines.dc.y} radius={5}
                fill="white" stroke="#555" strokeWidth={1.5}
                draggable={!is3D}
                onDragMove={handleDoorDragMove}
                onDragEnd={handleDoorDragEnd}
                onMouseEnter={e => { e.target.getStage()!.container().style.cursor = "grab" }}
                onMouseLeave={e => { e.target.getStage()!.container().style.cursor = "default" }}
              />

              {/* ── Window symbols ───────────────────────────────────── */}
              {wallLines.winCenters.map((wc) => {
                const isWinSel = wc.id === selectedWindowId
                const lines = windowLinePoints(wc.wall, wc.center.x, wc.center.y, WIN_W)
                const lp    = windowLabelPos(wc.wall, wc.center.x, wc.center.y)
                const or    = isWinSel ? windowOutlineRect(wc.wall, wc.center.x, wc.center.y, WIN_W) : null
                const gr    = is3D ? glassRect(wc.wall, wc.center.x, wc.center.y, WIN_W) : null
                return (
                  <Group key={wc.id}>
                    {gr && <Rect {...gr} fill="rgba(173,216,230,0.15)" listening={false} />}
                    {lines.map((pts, i) => <Line key={i} points={pts} stroke={colors.wallColor} strokeWidth={is3D?1.5:1} listening={false} />)}
                    <Text text="W" x={lp.x} y={lp.y} fontSize={8} fontFamily="sans-serif" fill={colors.textColor} listening={false} />
                    {or && <Rect {...or} stroke="black" strokeWidth={1} dash={[4,3]} fill="transparent" listening={false} />}
                    <Circle
                      x={wc.center.x} y={wc.center.y}
                      radius={isWinSel ? 7 : 5}
                      fill={isWinSel ? "black" : "white"} stroke={isWinSel ? "white" : "#555"} strokeWidth={1.5}
                      draggable={!is3D}
                      dragBoundFunc={windowDragBound(wc)}
                      onClick={() => { onSelectWindow(wc.id); onSelectFurniture(null) }}
                      onTap={()   => { onSelectWindow(wc.id); onSelectFurniture(null) }}
                      onDragMove={e => setWindowToolbarPos({ x: e.target.x(), y: e.target.y() - 56 })}
                      onDragEnd={e  => handleWindowDragEnd(e, wc)}
                      onMouseEnter={e => { if (!is3D) e.target.getStage()!.container().style.cursor = "grab" }}
                      onMouseLeave={e => { e.target.getStage()!.container().style.cursor = "default" }}
                    />
                  </Group>
                )
              })}

              {/* ── Dimension labels ─────────────────────────────────── */}
              <Text text={`${(template.width/100).toFixed(1)}m`}
                x={offsetX} y={offsetY+roomH+24} width={roomW} align="center"
                fontSize={9} fontFamily="sans-serif" fill={colors.textColor} listening={false} />
              <Text text={`${(template.height/100).toFixed(1)}m`}
                x={offsetX+roomW+20} y={offsetY+roomH/2-6}
                fontSize={9} fontFamily="sans-serif" fill={colors.textColor} listening={false} />
              <Text text={template.label}
                x={offsetX+8} y={offsetY+8}
                fontSize={10} fontFamily="sans-serif" fontStyle="italic"
                fill={roomStyle==="blueprint" ? "#4FC3F7" : "#BBBBBB"} listening={false} />
              <Rect x={offsetX+4} y={offsetY+roomH+36} width={40} height={3} fill="#AAAAAA" cornerRadius={1} listening={false} />
              <Text text="1 grid = 0.5m"
                x={offsetX+48} y={offsetY+roomH+33}
                fontSize={8} fontFamily="sans-serif" fill="#AAAAAA" listening={false} />

              {/* ── Empty state ───────────────────────────────────────── */}
              {furniture.length === 0 && (
                <>
                  <Text text="☯"
                    x={offsetX} y={offsetY+roomH/2-70} width={roomW} align="center"
                    fontSize={80} fill={roomStyle==="blueprint" ? "#1A4060" : "black"} opacity={0.05} listening={false} />
                  <Text text="Click furniture from the panel to begin"
                    x={offsetX} y={offsetY+roomH/2+22} width={roomW} align="center"
                    fontSize={12} fontFamily="sans-serif" fill={colors.textColor} listening={false} />
                  <Text text="Start with your bed or sofa as the commanding piece"
                    x={offsetX} y={offsetY+roomH/2+40} width={roomW} align="center"
                    fontSize={10} fontFamily="sans-serif" fill="#CCCCCC" listening={false} />
                </>
              )}

              {/* ── Furniture items ───────────────────────────────────── */}
              {furniture.map((item) => {
                const p = itemToPixels(item, offsetX, offsetY, roomW, roomH)
                const isSelected  = item.id === selectedFurnitureId
                const zone        = getZone(p.x, p.y, offsetX, offsetY, roomW, roomH)
                const borderColor = zone ? FIXED_ZONE[zone].color : "#D0D0D0"
                const emojiFSize  = Math.max(16, Math.min(48, Math.min(p.w, p.h) * (is3D ? 0.50 : 0.42)))
                const labelFSize  = Math.max(7, Math.min(11, Math.min(p.w * 0.18, 11)))

                return (
                  <Group
                    key={item.id} id={item.id}
                    x={p.x} y={p.y}
                    rotation={item.rotation ?? 0}
                    draggable={!is3D}
                    onClick={() => { if (!is3D) { onSelectFurniture(item.id); onSelectWindow(null); setContextMenu(null) } }}
                    onTap={()   => { if (!is3D) { onSelectFurniture(item.id); onSelectWindow(null) } }}
                    onDblClick={() => handleDblClick(item)}
                    onContextMenu={e => handleContextMenu(e, item.id)}
                    onDragStart={() => setSnapLines({ h: [], v: [] })}
                    onDragMove={e => { updateToolbar(e.target); computeSnapLines(item.id, e.target.x(), e.target.y()) }}
                    onDragEnd={e => handleDragEnd(e, item.id)}
                    onTransformEnd={e => handleTransformEnd(e, item.id)}
                    dragBoundFunc={pos => ({
                      x: Math.max(offsetX, Math.min(pos.x, offsetX + roomW - p.w)),
                      y: Math.max(offsetY, Math.min(pos.y, offsetY + roomH - p.h)),
                    })}
                    onMouseEnter={e => { if (!is3D) e.target.getStage()!.container().style.cursor = "grab" }}
                    onMouseLeave={e => { e.target.getStage()!.container().style.cursor = "default" }}
                    shadowEnabled={is3D}
                    shadowColor="black" shadowBlur={4} shadowOffsetX={3} shadowOffsetY={3} shadowOpacity={0.2}
                  >
                    <Rect
                      width={p.w} height={p.h}
                      fill={roomStyle==="blueprint" ? "#0D1F38" : "white"}
                      cornerRadius={8}
                      stroke={zone ? borderColor : (roomStyle==="blueprint" ? "#00B4D8" : "#D0D0D0")}
                      strokeWidth={zone ? 1.5 : 1}
                      shadowColor="rgba(0,0,0,0.06)" shadowBlur={4} shadowOffsetX={0} shadowOffsetY={1}
                    />
                    <Text
                      text={item.emoji}
                      x={0} y={p.h * 0.08}
                      width={p.w} height={p.h * 0.62}
                      align="center" verticalAlign="middle"
                      fontSize={emojiFSize}
                      listening={false}
                    />
                    <Text
                      text={item.id === renamingId ? "" : item.label}
                      x={0} y={p.h * 0.68}
                      width={p.w} align="center"
                      fontSize={labelFSize} fontFamily="sans-serif"
                      fill={isSelected ? (roomStyle==="blueprint" ? "#4FC3F7" : "#333") : (roomStyle==="blueprint" ? "#4FC3F7" : "#999")}
                      listening={false}
                    />
                  </Group>
                )
              })}

              {/* ── Snap guide lines ─────────────────────────────────── */}
              {snapLines.h.map((y, i) => (
                <Line key={`sh${i}`} points={[0,y,stageSize.width,y]} stroke="red" strokeWidth={1} opacity={0.5} dash={[6,4]} listening={false} />
              ))}
              {snapLines.v.map((x, i) => (
                <Line key={`sv${i}`} points={[x,0,x,stageSize.height]} stroke="red" strokeWidth={1} opacity={0.5} dash={[6,4]} listening={false} />
              ))}

              {/* ── Konva Transformer ────────────────────────────────── */}
              <Transformer
                ref={transformerRef}
                anchorSize={8} anchorFill="black" anchorStroke="white" anchorStrokeWidth={1.5}
                anchorCornerRadius={1} borderStroke="black" borderStrokeWidth={1.5} borderDash={[5,3]}
                rotateAnchorOffset={20} keepRatio={false}
                boundBoxFunc={(oldBox, newBox) => newBox.width < 20 || newBox.height < 20 ? oldBox : newBox}
              />

              {/* ── Canvas compass rose — fixed, bottom-right ─────────── */}
              <Group x={crX} y={crY}>
                <Circle radius={26} fill={roomStyle==="blueprint" ? "#0D1F38" : "white"} stroke="#D0D0D0" strokeWidth={1} listening={false} />
                {/* Cardinal letters */}
                <Text text="N" x={-4} y={-25} fontSize={9} fontFamily="sans-serif" fontStyle="bold" fill="black" listening={false} />
                <Text text="S" x={-4} y={17}  fontSize={8} fontFamily="sans-serif" fill="#AAAAAA" listening={false} />
                <Text text="E" x={17} y={-4}  fontSize={8} fontFamily="sans-serif" fill="#AAAAAA" listening={false} />
                <Text text="W" x={-25} y={-4} fontSize={8} fontFamily="sans-serif" fill="#AAAAAA" listening={false} />
                {/* Red north triangle */}
                <Line points={[0,-18,-5,-6,5,-6]} closed fill="red" stroke="red" strokeWidth={0.5} listening={false} />
                <Line points={[0,-6,0,10]} stroke="#CCCCCC" strokeWidth={2} listening={false} />
                {/* Gold dot at facing direction */}
                {facingDirection && (() => {
                  const angle = DIR_ANGLE[facingDirection]
                  const rad = (angle - 90) * Math.PI / 180
                  const R = 19
                  const gx = R * Math.cos(rad)
                  const gy = R * Math.sin(rad)
                  return <Circle x={gx} y={gy} radius={4} fill="#B8962E" stroke="white" strokeWidth={1} listening={false} />
                })()}
              </Group>

            </Layer>
          </Stage>
        </div>
      </div>

      {/* ── HTML furniture toolbar (flat, outside 3D transform) ───────────── */}
      {selectedFurnitureId && toolbarCSSPos && !is3D && (
        <div
          className="absolute z-20 flex items-center gap-0.5 bg-white border border-black rounded-xl shadow-lg px-2 py-1 pointer-events-auto"
          style={{ left: toolbarCSSPos.x, top: Math.max(4, toolbarCSSPos.y), transform: "translateX(-50%)" }}
        >
          <button type="button" onClick={() => rotateItem(-45)}
            className="w-7 h-7 flex items-center justify-center bg-white border border-black rounded-lg hover:bg-black hover:text-white transition-colors"><RotateCcw size={12} /></button>
          <button type="button" onClick={() => rotateItem(45)}
            className="w-7 h-7 flex items-center justify-center bg-white border border-black rounded-lg hover:bg-black hover:text-white transition-colors"><RotateCw size={12} /></button>
          <div className="w-px h-5 bg-gray-200 mx-0.5" />
          <button type="button" onClick={() => scaleItem(-0.1)}
            className="w-7 h-7 flex items-center justify-center bg-white border border-black rounded-lg hover:bg-black hover:text-white transition-colors"><Minus size={12} /></button>
          <span className="font-sans text-[11px] text-gray-500 w-8 text-center select-none">{scalePercent}%</span>
          <button type="button" onClick={() => scaleItem(0.1)}
            className="w-7 h-7 flex items-center justify-center bg-white border border-black rounded-lg hover:bg-black hover:text-white transition-colors"><Plus size={12} /></button>
          <div className="w-px h-5 bg-gray-200 mx-0.5" />
          <button type="button" onClick={() => { onRemoveFurniture(selectedFurnitureId); setToolbarPos(null) }}
            className="w-7 h-7 flex items-center justify-center bg-white border border-red-300 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={12} /></button>
        </div>
      )}

      {/* ── HTML window toolbar ───────────────────────────────────────────── */}
      {selectedWindowId && winToolbarCSSPos && !is3D && (
        <div
          className="absolute z-20 flex items-center gap-1 bg-white border border-black rounded-xl shadow-lg px-2 py-1.5 pointer-events-auto"
          style={{ left: winToolbarCSSPos.x, top: Math.max(4, winToolbarCSSPos.y), transform: "translateX(-50%)" }}
        >
          <span className="font-sans text-[11px] text-gray-400 mr-0.5">Move to:</span>
          {(["Top","Right","Bottom","Left"] as const).map((label) => {
            const wall = label.toLowerCase() as Wall
            const win  = windows.find(w => w.id === selectedWindowId)
            return (
              <button key={wall} type="button"
                onClick={() => onWindowsChange(windows.map(w => w.id === selectedWindowId ? { ...w, wall, offset: 50 } : w))}
                className={`px-2 py-0.5 rounded-full font-sans text-[11px] font-medium border transition-colors ${
                  win?.wall === wall ? "bg-black text-white border-black" : "bg-white text-black border-black hover:bg-gray-100"
                }`}>{label}</button>
            )
          })}
          <div className="w-px h-5 bg-gray-200 mx-0.5" />
          <button type="button"
            onClick={() => { onWindowsChange(windows.filter(w => w.id !== selectedWindowId)); onSelectWindow(null) }}
            className="w-7 h-7 flex items-center justify-center bg-white border border-red-300 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={12} /></button>
        </div>
      )}

      {/* ── Rename input overlay ──────────────────────────────────────────── */}
      {renamingId && renamePos && (
        <input ref={renameInputRef} type="text"
          value={renameValue} onChange={e => setRenameValue(e.target.value)}
          onKeyDown={e => { if (e.key==="Enter") commitRename(); if (e.key==="Escape") setRenamingId(null) }}
          onBlur={commitRename}
          className="absolute z-30 font-sans text-[9px] border border-black rounded px-1 py-0 text-center bg-white outline-none shadow-sm"
          style={{ left: renamePos.x-30, top: renamePos.y, width: 60, height: 18 }}
        />
      )}

      {/* ── Right-click context menu ──────────────────────────────────────── */}
      {contextMenu && (
        <div
          className="absolute z-30 bg-white border border-black rounded-xl shadow-xl py-1 min-w-[160px] pointer-events-auto"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onMouseLeave={() => setContextMenu(null)}
        >
          {[
            { icon: <RotateCw size={13}/>,          label:"Rotate 90° CW",   action:()=>{ rotateItem(90,contextMenu.itemId);  setContextMenu(null) } },
            { icon: <RotateCcw size={13}/>,         label:"Rotate 90° CCW",  action:()=>{ rotateItem(-90,contextMenu.itemId); setContextMenu(null) } },
            { icon: <Copy size={13}/>,              label:"Duplicate",       action:()=>{ duplicateItem(contextMenu.itemId); setContextMenu(null) } },
            { icon: <ArrowUpToLine size={13}/>,     label:"Move to Front",   action:()=>{ moveToFront(contextMenu.itemId);   setContextMenu(null) } },
            { icon: <ArrowDownToLine size={13}/>,   label:"Move to Back",    action:()=>{ moveToBack(contextMenu.itemId);    setContextMenu(null) } },
            null,
            { icon: <Trash2 size={13} className="text-red-500"/>, label:"Delete", labelClass:"text-red-500",
              action:()=>{ onRemoveFurniture(contextMenu.itemId); setContextMenu(null) } },
          ].map((it,i) => it===null
            ? <div key={i} className="my-0.5 mx-2 h-px bg-gray-100" />
            : <button key={i} type="button" onClick={it.action}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-left font-sans text-[13px] hover:bg-gray-50 transition-colors ${it.labelClass??""}`}>
                {it.icon}{it.label}
              </button>
          )}
        </div>
      )}

      {/* ── 3D mode badge (stays flat outside transform) ──────────────────── */}
      {is3D && (
        <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none">
          <span className="bg-black text-white font-sans text-[11px] font-medium rounded-full px-2.5 py-1 leading-none">3D Preview</span>
          <span className="font-sans text-[10px] text-gray-400 pl-1">Switch to 2D to edit</span>
        </div>
      )}

      {/* ── Canvas hint ───────────────────────────────────────────────────── */}
      {!is3D && (
        <p className="absolute bottom-2 left-1/2 -translate-x-1/2 font-sans text-[11px] text-gray-400 whitespace-nowrap pointer-events-none select-none">
          Click to select · Drag to move · Double-click to rename · Right-click for options
        </p>
      )}
    </div>
  )
}
