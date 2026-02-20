"use client"

import { Wall } from "@/lib/room-types"

interface SimpleCompassProps {
  northWall: Wall
  onSelectNorthWall: (wall: Wall) => void
}

const directions = [
  { wall: "top" as Wall, label: "N", description: "Top wall faces North" },
  { wall: "right" as Wall, label: "E", description: "Right wall faces North" },
  { wall: "bottom" as Wall, label: "S", description: "Bottom wall faces North" },
  { wall: "left" as Wall, label: "W", description: "Left wall faces North" },
]

export function SimpleCompass({ northWall, onSelectNorthWall }: SimpleCompassProps) {
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-48 h-48">
        {/* Compass circle */}
        <div className="absolute inset-0 rounded-full border-2 border-gray-300 bg-white shadow-sm">
          {/* Direction buttons */}
          <div className="relative w-full h-full">
            {/* North */}
            <button
              onClick={() => onSelectNorthWall("top")}
              className={`absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full border-2 font-bold text-sm transition-all z-10 ${
                northWall === "top"
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-gray-300 hover:border-black"
              }`}
            >
              N
            </button>
            
            {/* East */}
            <button
              onClick={() => onSelectNorthWall("right")}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full border-2 font-bold text-sm transition-all z-10 ${
                northWall === "right"
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-gray-300 hover:border-black"
              }`}
            >
              E
            </button>
            
            {/* South */}
            <button
              onClick={() => onSelectNorthWall("bottom")}
              className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full border-2 font-bold text-sm transition-all z-10 ${
                northWall === "bottom"
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-gray-300 hover:border-black"
              }`}
            >
              S
            </button>
            
            {/* West */}
            <button
              onClick={() => onSelectNorthWall("left")}
              className={`absolute left-2 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full border-2 font-bold text-sm transition-all z-10 ${
                northWall === "left"
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-gray-300 hover:border-black"
              }`}
            >
              W
            </button>
            
            {/* Center dot */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-black rounded-full"></div>
          </div>
        </div>
      </div>
      
      {/* Selection description */}
      <div className="text-center space-y-1">
        <div className="font-bold text-black text-sm">
          North wall: {directions.find(d => d.wall === northWall)?.label}
        </div>
        <div className="text-xs text-gray-600">
          {directions.find(d => d.wall === northWall)?.description}
        </div>
      </div>
    </div>
  )
}
