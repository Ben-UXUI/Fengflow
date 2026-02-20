"use client"

import { useEffect, useRef, useState } from "react"
import { Stage, Layer, Rect, Group, Text, Line, Circle, Path } from "react-konva"
import { PlacedFurniture, Template, Wall } from "@/lib/room-types"
import Konva from "konva"

interface RoomCanvasProps {
  template: Template
  northWall: Wall
  furniture: PlacedFurniture[]
  doorPosition: { wall: Wall; offset: number }
  selectedFurnitureId: string | null
  onFurnitureUpdate: (furniture: PlacedFurniture[]) => void
  onSelectFurniture: (id: string | null) => void
  onRemoveFurniture: (id: string) => void
  onLayoutReady?: (layout: { offsetX: number; offsetY: number; roomWidth: number; roomHeight: number; scale: number }) => void
  lastAddedId?: string | null
}

const GRID_SIZE = 20
const DOT_SPACING = 12

export function RoomCanvas({
  template,
  furniture,
  doorPosition,
  selectedFurnitureId,
  onFurnitureUpdate,
  onSelectFurniture,
  onRemoveFurniture,
  onLayoutReady,
  lastAddedId,
}: RoomCanvasProps) {
  const [stageSize, setStageSize] = useState({ width: 600, height: 500 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth
        const height = containerRef.current.offsetHeight
        setStageSize({ width, height })
      }
    }
    updateSize()
    const ro = new ResizeObserver(updateSize)
    if (containerRef.current) ro.observe(containerRef.current)
    window.addEventListener("resize", updateSize)
    return () => {
      window.removeEventListener("resize", updateSize)
      ro.disconnect()
    }
  }, [template])

  const scaleX = stageSize.width / template.width
  const scaleY = stageSize.height / template.height
  const scale = Math.min(scaleX, scaleY)
  const roomWidth = template.width * scale
  const roomHeight = template.height * scale
  const offsetX = (stageSize.width - roomWidth) / 2
  const offsetY = (stageSize.height - roomHeight) / 2

  useEffect(() => {
    onLayoutReady?.({ offsetX, offsetY, roomWidth, roomHeight, scale })
  }, [offsetX, offsetY, roomWidth, roomHeight, scale, onLayoutReady])

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>, itemId: string) => {
    const node = e.target
    const x = node.x()
    const y = node.y()
    const snappedX = Math.round(x / GRID_SIZE) * GRID_SIZE
    const snappedY = Math.round(y / GRID_SIZE) * GRID_SIZE
    const constrainedX = Math.max(offsetX, Math.min(snappedX, offsetX + roomWidth - node.width()))
    const constrainedY = Math.max(offsetY, Math.min(snappedY, offsetY + roomHeight - node.height()))
    node.position({ x: constrainedX, y: constrainedY })
    const updatedFurniture = furniture.map((item) =>
      item.id === itemId ? { ...item, x: constrainedX, y: constrainedY } : item
    )
    onFurnitureUpdate(updatedFurniture)
  }

  const dragBoundFunc = (pos: { x: number; y: number }, item: PlacedFurniture) => ({
    x: Math.max(offsetX, Math.min(pos.x, offsetX + roomWidth - item.width * scale)),
    y: Math.max(offsetY, Math.min(pos.y, offsetY + roomHeight - item.height * scale)),
  })

  const doorGap = 50
  const doorOffsetPx = (doorPosition.offset / 100) * (doorPosition.wall === "top" || doorPosition.wall === "bottom" ? roomWidth : roomHeight)
  const doorCenterX = offsetX + doorOffsetPx
  const doorStartX = doorCenterX - doorGap / 2
  const doorEndX = doorCenterX + doorGap / 2
  const isDoorBottom = doorPosition.wall === "bottom"
  const bottomY = offsetY + roomHeight

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col bg-white relative">
      <div className="flex-1 min-h-0 relative">
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          onClick={(e) => {
            if (e.target === e.target.getStage()) onSelectFurniture(null)
          }}
        >
          <Layer>
            {/* Dot grid background */}
            {Array.from({ length: Math.ceil(stageSize.width / DOT_SPACING) + 1 }).map((_, i) =>
              Array.from({ length: Math.ceil(stageSize.height / DOT_SPACING) + 1 }).map((_, j) => (
                <Circle
                  key={`d-${i}-${j}`}
                  x={i * DOT_SPACING}
                  y={j * DOT_SPACING}
                  radius={0.8}
                  fill="#D1D1D1"
                  opacity={0.5}
                />
              ))
            )}

            {/* Inner room grid (20px) */}
            {Array.from({ length: Math.ceil(roomWidth / GRID_SIZE) }).map((_, i) => (
              <Line
                key={`v-${i}`}
                points={[
                  offsetX + i * GRID_SIZE * scale,
                  offsetY,
                  offsetX + i * GRID_SIZE * scale,
                  offsetY + roomHeight,
                ]}
                stroke="#E8E8E8"
                strokeWidth={0.5}
              />
            ))}
            {Array.from({ length: Math.ceil(roomHeight / GRID_SIZE) }).map((_, i) => (
              <Line
                key={`h-${i}`}
                points={[
                  offsetX,
                  offsetY + i * GRID_SIZE * scale,
                  offsetX + roomWidth,
                  offsetY + i * GRID_SIZE * scale,
                ]}
                stroke="#E8E8E8"
                strokeWidth={0.5}
              />
            ))}

            {/* Room outline: door on bottom with gap + arc */}
            {isDoorBottom ? (
              <>
                <Line points={[offsetX, offsetY, offsetX + roomWidth, offsetY]} stroke="#0A0A0A" strokeWidth={2} />
                <Line points={[offsetX + roomWidth, offsetY, offsetX + roomWidth, bottomY]} stroke="#0A0A0A" strokeWidth={2} />
                <Line points={[doorEndX, bottomY, offsetX + roomWidth, bottomY]} stroke="#0A0A0A" strokeWidth={2} />
                <Line points={[offsetX, offsetY, offsetX, bottomY]} stroke="#0A0A0A" strokeWidth={2} />
                <Line points={[doorStartX, bottomY, offsetX, bottomY]} stroke="#0A0A0A" strokeWidth={2} />
                <Path
                  data={`M ${doorStartX} ${bottomY} A ${doorGap / 2} ${doorGap / 2} 0 0 1 ${doorEndX} ${bottomY}`}
                  stroke="#0A0A0A"
                  strokeWidth={2}
                  fill="transparent"
                />
              </>
            ) : (
              <Rect
                x={offsetX}
                y={offsetY}
                width={roomWidth}
                height={roomHeight}
                fill="transparent"
                stroke="#0A0A0A"
                strokeWidth={2}
              />
            )}

            {/* Furniture */}
            {furniture.map((item) => {
              const isSelected = selectedFurnitureId === item.id
              const justAdded = lastAddedId === item.id
              const w = item.width * scale
              const h = item.height * scale
              return (
                <Group
                  key={item.id}
                  x={item.x}
                  y={item.y}
                  scaleX={justAdded ? 0.8 : 1}
                  scaleY={justAdded ? 0.8 : 1}
                  draggable
                  onDragEnd={(e) => handleDragEnd(e, item.id)}
                  dragBoundFunc={(pos) => dragBoundFunc(pos, item)}
                  onClick={(e) => { e.cancelBubble = true; onSelectFurniture(item.id) }}
                  onTap={() => onSelectFurniture(item.id)}
                  ref={(node) => {
                    if (node && justAdded) {
                      node.to({ scaleX: 1, scaleY: 1, duration: 0.2 })
                    }
                  }}
                >
                  <Rect
                    width={w}
                    height={h}
                    fill="white"
                    stroke="#0A0A0A"
                    strokeWidth={isSelected ? 2 : 1}
                    dash={isSelected ? [6, 4] : undefined}
                    cornerRadius={6}
                  />
                  <Text
                    text={item.emoji}
                    fontSize={Math.min(w * 0.45, 28)}
                    x={w / 2}
                    y={h * 0.35}
                    offsetX={Math.min(w * 0.22, 14)}
                    offsetY={Math.min(h * 0.18, 14)}
                    listening={false}
                  />
                  <Text
                    text={item.label}
                    fontSize={Math.min(9, w * 0.12)}
                    fontFamily="DM Sans, sans-serif"
                    fill="#0A0A0A"
                    x={2}
                    y={h - 14}
                    width={w - 4}
                    align="center"
                    listening={false}
                    wrap="none"
                    ellipsis
                  />
                  {isSelected && (
                    <Group x={w - 20} y={0} onClick={(e) => { e.cancelBubble = true; onRemoveFurniture(item.id) }}>
                      <Rect width={20} height={20} fill="#0A0A0A" cornerRadius={4} />
                      <Text text="✕" fontSize={12} fill="white" x={4} y={2} width={12} align="center" listening={false} />
                    </Group>
                  )}
                </Group>
              )
            })}
          </Layer>
        </Stage>
      </div>
      <p className="text-xs text-[var(--text-muted)] py-2 text-center border-t border-[var(--border)]">
        Click furniture to select · Drag to move · ✕ to remove
      </p>
    </div>
  )
}
