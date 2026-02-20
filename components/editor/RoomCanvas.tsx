"use client"

import { useEffect, useRef, useState } from "react"
import { Stage, Layer, Rect, Group, Text, Line } from "react-konva"
import { PlacedFurniture, Template, Wall } from "@/lib/room-types"
import Konva from "konva"

interface RoomCanvasProps {
  template: Template
  northWall: Wall
  furniture: PlacedFurniture[]
  doorPosition: { wall: Wall; offset: number }
  onFurnitureUpdate: (furniture: PlacedFurniture[]) => void
  onDoorUpdate: (position: { wall: Wall; offset: number }) => void
}

const GRID_SIZE = 20

export function RoomCanvas({
  template,
  northWall,
  furniture,
  doorPosition,
  onFurnitureUpdate,
  onDoorUpdate,
}: RoomCanvasProps) {
  const [stageSize, setStageSize] = useState({ width: 600, height: 500 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth
        const height = Math.min(600, width * (template.height / template.width))
        setStageSize({ width, height })
      }
    }
    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [template])

  const scaleX = stageSize.width / template.width
  const scaleY = stageSize.height / template.height
  const scale = Math.min(scaleX, scaleY)

  const roomWidth = template.width * scale
  const roomHeight = template.height * scale
  const offsetX = (stageSize.width - roomWidth) / 2
  const offsetY = (stageSize.height - roomHeight) / 2

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>, itemId: string) => {
    const node = e.target
    const x = node.x()
    const y = node.y()

    // Snap to grid
    const snappedX = Math.round(x / GRID_SIZE) * GRID_SIZE
    const snappedY = Math.round(y / GRID_SIZE) * GRID_SIZE

    // Constrain within room bounds
    const constrainedX = Math.max(
      offsetX,
      Math.min(snappedX, offsetX + roomWidth - node.width())
    )
    const constrainedY = Math.max(
      offsetY,
      Math.min(snappedY, offsetY + roomHeight - node.height())
    )

    node.position({ x: constrainedX, y: constrainedY })

    // Update furniture state
    const updatedFurniture = furniture.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          x: constrainedX,
          y: constrainedY,
        }
      }
      return item
    })
    onFurnitureUpdate(updatedFurniture)
  }

  const dragBoundFunc = (pos: { x: number; y: number }, item: PlacedFurniture) => {
    return {
      x: Math.max(
        offsetX,
        Math.min(pos.x, offsetX + roomWidth - item.width * scale)
      ),
      y: Math.max(
        offsetY,
        Math.min(pos.y, offsetY + roomHeight - item.height * scale)
      ),
    }
  }

  // Draw door
  const getDoorPosition = () => {
    const doorLength = 60
    const doorOffset = (doorPosition.offset / 100) * (doorPosition.wall === "top" || doorPosition.wall === "bottom" ? roomWidth : roomHeight)
    
    if (doorPosition.wall === "top") {
      return {
        x: offsetX + doorOffset - doorLength / 2,
        y: offsetY,
        width: doorLength,
        height: 10,
      }
    } else if (doorPosition.wall === "right") {
      return {
        x: offsetX + roomWidth - 10,
        y: offsetY + doorOffset - doorLength / 2,
        width: 10,
        height: doorLength,
      }
    } else if (doorPosition.wall === "bottom") {
      return {
        x: offsetX + doorOffset - doorLength / 2,
        y: offsetY + roomHeight - 10,
        width: doorLength,
        height: 10,
      }
    } else {
      return {
        x: offsetX,
        y: offsetY + doorOffset - doorLength / 2,
        width: 10,
        height: doorLength,
      }
    }
  }

  const doorPos = getDoorPosition()

  return (
    <div ref={containerRef} className="w-full h-full bg-[var(--bg-secondary)] rounded-2xl p-4">
      <Stage width={stageSize.width} height={stageSize.height}>
        <Layer>
          {/* Grid lines */}
          {Array.from({ length: Math.ceil(roomWidth / GRID_SIZE) }).map((_, i) => (
            <Line
              key={`v-${i}`}
              points={[
                offsetX + i * GRID_SIZE * scale,
                offsetY,
                offsetX + i * GRID_SIZE * scale,
                offsetY + roomHeight,
              ]}
              stroke="#E5E5E5"
              strokeWidth={0.5}
              opacity={0.3}
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
              stroke="#E5E5E5"
              strokeWidth={0.5}
              opacity={0.3}
            />
          ))}

          {/* Room rectangle */}
          <Rect
            x={offsetX}
            y={offsetY}
            width={roomWidth}
            height={roomHeight}
            fill="#FFFFFF"
            stroke="#1A1A1A"
            strokeWidth={2}
          />

          {/* Door */}
          <Rect
            x={doorPos.x}
            y={doorPos.y}
            width={doorPos.width}
            height={doorPos.height}
            fill="#0A0A0A"
            stroke="#0A0A0A"
            strokeWidth={2}
          />

          {/* Furniture items */}
          {furniture.map((item) => (
            <Group
              key={item.id}
              x={item.x}
              y={item.y}
              draggable
              onDragEnd={(e) => handleDragEnd(e, item.id)}
              dragBoundFunc={(pos) => dragBoundFunc(pos, item)}
            >
              <Rect
                width={item.width * scale}
                height={item.height * scale}
                fill="#F5F5F5"
                stroke="#0A0A0A"
                strokeWidth={1.5}
                cornerRadius={4}
                shadowBlur={5}
                shadowOpacity={0.2}
              />
              <Text
                text={item.emoji}
                fontSize={Math.min(item.width * scale * 0.4, 30)}
                x={item.width * scale / 2}
                y={item.height * scale / 2}
                offsetX={Math.min(item.width * scale * 0.2, 15)}
                offsetY={Math.min(item.height * scale * 0.2, 15)}
              />
            </Group>
          ))}
        </Layer>
      </Stage>
    </div>
  )
}
