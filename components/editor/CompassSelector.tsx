"use client"

import { Wall } from "@/lib/room-types"
import { CompassRose } from "./CompassRose"

interface CompassSelectorProps {
  northWall: Wall
  onSelectNorthWall: (wall: Wall) => void
}

const directions: { wall: Wall; label: string; position: string }[] = [
  { wall: "top", label: "N", position: "top-0 left-1/2 -translate-x-1/2" },
  { wall: "top", label: "NE", position: "top-0 right-0" },
  { wall: "right", label: "E", position: "top-1/2 right-0 -translate-y-1/2" },
  { wall: "right", label: "SE", position: "bottom-0 right-0" },
  { wall: "bottom", label: "S", position: "bottom-0 left-1/2 -translate-x-1/2" },
  { wall: "bottom", label: "SW", position: "bottom-0 left-0" },
  { wall: "left", label: "W", position: "top-1/2 left-0 -translate-y-1/2" },
  { wall: "left", label: "NW", position: "top-0 left-0" },
]

export function CompassSelector({
  northWall,
  onSelectNorthWall,
}: CompassSelectorProps) {
  return (
    <div className="space-y-3">
      <CompassRose />
      <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">
        Which wall faces North?
      </h3>
      <div className="relative w-48 h-48 mx-auto">
        <div className="absolute inset-0 rounded-full border-2 border-[var(--border-dark)] bg-white" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[var(--accent)] rounded-full" />
        {directions.map((dir, index) => {
          const isSelected = northWall === dir.wall
          return (
            <button
              key={index}
              onClick={() => onSelectNorthWall(dir.wall)}
              className={`absolute ${dir.position} w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-semibold transition-all ${
                isSelected
                  ? "bg-[var(--accent)] text-[var(--text-inverse)] border-[var(--accent)] scale-110"
                  : "bg-white text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)] hover:scale-105"
              }`}
            >
              {dir.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
