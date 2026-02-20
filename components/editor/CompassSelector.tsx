"use client"

import { Wall } from "@/lib/room-types"

interface CompassSelectorProps {
  northWall: Wall
  onSelectNorthWall: (wall: Wall) => void
}

const DIRECTION_ORDER: { wall: Wall; label: string; angle: number }[] = [
  { wall: "top", label: "N", angle: 0 },
  { wall: "top", label: "NE", angle: 45 },
  { wall: "right", label: "E", angle: 90 },
  { wall: "right", label: "SE", angle: 135 },
  { wall: "bottom", label: "S", angle: 180 },
  { wall: "bottom", label: "SW", angle: 225 },
  { wall: "left", label: "W", angle: 270 },
  { wall: "left", label: "NW", angle: 315 },
]

const WALL_LABEL: Record<Wall, string> = {
  top: "Top",
  right: "Right",
  bottom: "Bottom",
  left: "Left",
}

export function CompassSelector({
  northWall,
  onSelectNorthWall,
}: CompassSelectorProps) {
  const radius = 56
  const center = 64

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-[var(--text-primary)]">
        Which wall faces North?
      </h3>
      <p className="text-xs text-[var(--text-muted)]">
        This helps map the Bagua energy zones accurately
      </p>
      <div className="relative w-[128px] h-[128px] mx-auto">
        {/* Compass rose: lines from centre to each direction */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 128 128"
        >
          {DIRECTION_ORDER.map((_, i) => {
            const angleRad = ((_.angle - 90) * Math.PI) / 180
            const x = center + radius * Math.cos(angleRad)
            const y = center + radius * Math.sin(angleRad)
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#E5E5E5"
                strokeWidth="1"
              />
            )
          })}
        </svg>
        {/* Direction buttons on the ring */}
        {DIRECTION_ORDER.map((dir, i) => {
          const angleRad = ((dir.angle - 90) * Math.PI) / 180
          const x = center + radius * Math.cos(angleRad)
          const y = center + radius * Math.sin(angleRad)
          const isSelected = northWall === dir.wall
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelectNorthWall(dir.wall)}
              className="absolute w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-semibold transition-all -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${(x / 128) * 100}%`,
                top: `${(y / 128) * 100}%`,
                backgroundColor: isSelected ? "var(--accent)" : "white",
                color: isSelected ? "var(--text-inverse)" : "var(--text-primary)",
                borderColor: isSelected ? "var(--accent)" : "var(--border-dark)",
              }}
            >
              {dir.label}
            </button>
          )
        })}
      </div>
      <p className="text-xs text-[var(--text-secondary)] text-center">
        North wall: {WALL_LABEL[northWall]}
      </p>
    </div>
  )
}
