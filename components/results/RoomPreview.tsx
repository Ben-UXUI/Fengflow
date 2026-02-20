"use client"

import { useEffect, useRef, useState } from "react"
import { Stage, Layer, Rect, Group, Text } from "react-konva"
import { LayoutData } from "@/lib/room-types"
import Konva from "konva"

interface RoomPreviewProps {
  layoutData: LayoutData
}

export function RoomPreview({ layoutData }: RoomPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 400, height: 300 })

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth
        const height = width * (layoutData.room.heightMetres / layoutData.room.widthMetres)
        setSize({ width, height: Math.min(height, 400) })
      }
    }
    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [layoutData])

  const roomWidth = size.width * 0.9
  const roomHeight = size.height * 0.9
  const offsetX = (size.width - roomWidth) / 2
  const offsetY = (size.height - roomHeight) / 2

  // Draw Bagua grid
  const gridSize = 3
  const cellWidth = roomWidth / gridSize
  const cellHeight = roomHeight / gridSize

  const baguaZones = [
    { name: "Wealth", pos: [2, 0] },
    { name: "Fame", pos: [1, 0] },
    { name: "Love", pos: [0, 0] },
    { name: "Creativity", pos: [0, 1] },
    { name: "Health", pos: [1, 1] },
    { name: "Family", pos: [2, 1] },
    { name: "Knowledge", pos: [2, 2] },
    { name: "Career", pos: [1, 2] },
    { name: "Helpful", pos: [0, 2] },
  ]

  return (
    <div ref={containerRef} className="w-full">
      <Stage width={size.width} height={size.height}>
        <Layer>
          {/* Bagua grid */}
          {Array.from({ length: gridSize + 1 }).map((_, i) => (
            <Rect
              key={`v-${i}`}
              x={offsetX + i * cellWidth}
              y={offsetY}
              width={1}
              height={roomHeight}
              fill="#0A0A0A"
              opacity={0.15}
            />
          ))}
          {Array.from({ length: gridSize + 1 }).map((_, i) => (
            <Rect
              key={`h-${i}`}
              x={offsetX}
              y={offsetY + i * cellHeight}
              width={roomWidth}
              height={1}
              fill="#0A0A0A"
              opacity={0.15}
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

          {/* Furniture */}
          {layoutData.furniture.map((item) => {
            const x = offsetX + (item.xPercent / 100) * roomWidth
            const y = offsetY + (item.yPercent / 100) * roomHeight
            const width = (item.widthPercent / 100) * roomWidth
            const height = (item.heightPercent / 100) * roomHeight

            return (
              <Group key={item.id} x={x} y={y}>
                <Rect
                  width={width}
                  height={height}
                  fill="#F5F5F5"
                  stroke="#0A0A0A"
                  strokeWidth={1}
                  cornerRadius={2}
                />
              </Group>
            )
          })}

          {/* Door */}
          {(() => {
            const doorLength = 40
            const doorOffset = (layoutData.door.positionPercent / 100) *
              (layoutData.door.wall === "top" || layoutData.door.wall === "bottom"
                ? roomWidth
                : roomHeight)

            if (layoutData.door.wall === "top") {
              return (
                <Rect
                  x={offsetX + doorOffset - doorLength / 2}
                  y={offsetY}
                  width={doorLength}
                  height={8}
                  fill="#0A0A0A"
                />
              )
            } else if (layoutData.door.wall === "right") {
              return (
                <Rect
                  x={offsetX + roomWidth - 8}
                  y={offsetY + doorOffset - doorLength / 2}
                  width={8}
                  height={doorLength}
                  fill="#0A0A0A"
                />
              )
            } else if (layoutData.door.wall === "bottom") {
              return (
                <Rect
                  x={offsetX + doorOffset - doorLength / 2}
                  y={offsetY + roomHeight - 8}
                  width={doorLength}
                  height={8}
                  fill="#0A0A0A"
                />
              )
            } else {
              return (
                <Rect
                  x={offsetX}
                  y={offsetY + doorOffset - doorLength / 2}
                  width={8}
                  height={doorLength}
                  fill="#0A0A0A"
                />
              )
            }
          })()}
        </Layer>
      </Stage>
    </div>
  )
}
