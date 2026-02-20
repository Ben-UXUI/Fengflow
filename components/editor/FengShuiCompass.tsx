"use client"

import { Wall } from "@/lib/room-types"

interface FengShuiCompassProps {
  northWall: Wall
  onSelectNorthWall: (wall: Wall) => void
}

const directions = [
  { wall: "top", label: "N", chinese: "北", element: "water", angle: 0 },
  { wall: "top", label: "NE", chinese: "东北", element: "earth", angle: 45 },
  { wall: "right", label: "E", chinese: "东", element: "wood", angle: 90 },
  { wall: "right", label: "SE", chinese: "东南", element: "wood", angle: 135 },
  { wall: "bottom", label: "S", chinese: "南", element: "fire", angle: 180 },
  { wall: "bottom", label: "SW", chinese: "西南", element: "earth", angle: 225 },
  { wall: "left", label: "W", chinese: "西", element: "metal", angle: 270 },
  { wall: "left", label: "NW", chinese: "西北", element: "metal", angle: 315 },
]

const elementColors = {
  water: "#1e40af", // dark blue
  earth: "#eab308", // yellow
  wood: "#16a34a", // green
  fire: "#dc2626", // red
  metal: "#6b7280", // white/grey
}

const zoneTips = {
  N: "Career & Life Path zone activated",
  S: "Fame & Reputation zone activated", 
  E: "Family & Health zone activated",
  SE: "Wealth & Prosperity zone activated",
  SW: "Love & Relationships zone activated",
  W: "Creativity & Children zone activated",
  NW: "Helpful People & Travel zone activated",
  NE: "Knowledge & Wisdom zone activated",
}

export function FengShuiCompass({ northWall, onSelectNorthWall }: FengShuiCompassProps) {
  const selectedDirection = directions.find(d => d.wall === northWall)
  const selectedElement = selectedDirection?.element || "water"

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-60 h-60">
        {/* Outer ring - Five Elements */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 240 240">
          {/* Element arcs */}
          {directions.map((dir, index) => {
            const startAngle = dir.angle - 22.5
            const endAngle = dir.angle + 22.5
            const color = elementColors[dir.element as keyof typeof elementColors]
            
            return (
              <path
                key={index}
                d={`M 120 120 L 120 40 A 80 80 ${startAngle} ${endAngle} A 80 80 ${endAngle} ${startAngle} Z`}
                fill="none"
                stroke={color}
                strokeWidth="8"
                opacity="0.7"
              />
            )
          })}
          
          {/* Direction lines */}
          {directions.map((dir, index) => {
            const angle = (dir.angle - 90) * (Math.PI / 180)
            const x1 = 120 + 60 * Math.cos(angle)
            const y1 = 120 + 60 * Math.sin(angle)
            const x2 = 120 + 100 * Math.cos(angle)
            const y2 = 120 + 100 * Math.sin(angle)
            
            return (
              <line
                key={index}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#000000"
                strokeWidth="1"
                opacity="0.3"
              />
            )
          })}
          
          {/* Middle ring - 8 directions */}
          <circle cx="120" cy="120" r="60" fill="none" stroke="#000000" strokeWidth="2" />
          
          {/* Inner circle */}
          <circle cx="120" cy="120" r="30" fill="none" stroke="#000000" strokeWidth="1" />
          
          {/* Direction buttons */}
          {directions.map((dir, index) => {
            const angle = (dir.angle - 90) * (Math.PI / 180)
            const x = 120 + 60 * Math.cos(angle)
            const y = 120 + 60 * Math.sin(angle)
            const isSelected = northWall === dir.wall
            
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="16"
                  fill={isSelected ? "#000000" : "#ffffff"}
                  stroke="#000000"
                  strokeWidth="2"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => onSelectNorthWall(dir.wall as Wall)}
                />
                <text
                  x={x}
                  y={y - 4}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                  fill={isSelected ? "#ffffff" : "#000000"}
                  pointerEvents="none"
                >
                  {dir.label}
                </text>
                <text
                  x={x}
                  y={y + 8}
                  textAnchor="middle"
                  fontSize="8"
                  fill={isSelected ? "#ffffff" : "#000000"}
                  pointerEvents="none"
                >
                  {dir.chinese}
                </text>
              </g>
            )
          })}
          
          {/* Centre - Yin Yang symbol */}
          <circle cx="120" cy="120" r="8" fill="#000000" />
          <path
            d="M 120 112 A 4 4 0 1 120 120 A 4 4 0 0 120 128"
            fill="#ffffff"
            stroke="#000000"
            strokeWidth="1"
          />
          <circle cx="120" cy="116" r="2" fill="#ffffff" />
          <circle cx="120" cy="124" r="2" fill="#000000" />
        </svg>
      </div>
      
      {/* Clear wall descriptions */}
      <div className="text-center space-y-2">
        <div className="font-bold text-black text-sm">
          North wall: {selectedDirection?.label}
        </div>
        <div className="text-xs text-gray-600">
          {northWall === "top" && "The wall at the top of the screen faces North"}
          {northWall === "right" && "The wall on the right side faces North"}
          {northWall === "bottom" && "The wall at the bottom of the screen faces North"}
          {northWall === "left" && "The wall on the left side faces North"}
        </div>
        <div className="text-xs text-gray-500 italic">
          Element: {selectedElement} • {zoneTips[selectedDirection?.label as keyof typeof zoneTips] || ""}
        </div>
      </div>
    </div>
  )
}
