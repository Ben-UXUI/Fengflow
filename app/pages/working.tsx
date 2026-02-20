"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { TEMPLATES } from "@/lib/furniture-data"
import { Template, Wall, PlacedFurniture, FurnitureItem, LayoutData } from "@/lib/room-types"
import { useToast } from "@/components/ui/use-toast"

// Simple furniture data for testing
const TEST_FURNITURE: FurnitureItem[] = [
  { id: 'test-bed', label: 'Test Bed', emoji: '🛏️', w: 80, h: 100, element: 'wood', category: 'Bedroom' },
  { id: 'test-sofa', label: 'Test Sofa', emoji: '🛋️', w: 120, h: 60, element: 'earth', category: 'Living' },
  { id: 'test-table', label: 'Test Table', emoji: '🪑', w: 80, h: 50, element: 'wood', category: 'Dining' },
]

export default function WorkingEditor() {
  const [template, setTemplate] = useState<Template>(TEMPLATES[0])
  const [northWall, setNorthWall] = useState<Wall>("top")
  const [furniture, setFurniture] = useState<PlacedFurniture[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedFurniture, setSelectedFurniture] = useState<string | null>(null)
  const router = useRouter()

  const handleAddFurniture = (item: FurnitureItem) => {
    const newItem: PlacedFurniture = {
      id: `furniture-${Date.now()}`,
      itemId: item.id,
      label: item.label,
      emoji: item.emoji,
      element: item.element,
      x: 100,
      y: 100,
      width: item.w,
      height: item.h,
    }
    setFurniture([...furniture, newItem])
    console.log("Furniture added:", newItem)
  }

  const handleFurnitureClick = (itemId: string) => {
    console.log("Furniture clicked:", itemId)
    setSelectedFurniture(selectedFurniture === itemId ? null : itemId)
  }

  const handleDeleteFurniture = (itemId: string) => {
    console.log("Furniture deleted:", itemId)
    const updatedFurniture = furniture.filter((item) => item.id !== itemId)
    setFurniture(updatedFurniture)
    setSelectedFurniture(null)
  }

  const handleAnalyze = () => {
    if (furniture.length < 1) {
      alert("Add furniture first!")
      return
    }
    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
      alert("Analysis complete!")
    }, 2000)
  }

  return (
    <div className="h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-black">WORKING EDITOR</h1>
      
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Simple Test Controls</h2>
            <div className="space-x-4">
              <button
                onClick={() => setTemplate(TEMPLATES[0])}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Studio Flat
              </button>
              <button
                onClick={() => setTemplate(TEMPLATES[1])}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                1-Bed Bedroom
              </button>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-bold mb-4">Test Furniture</h3>
            <div className="grid grid-cols-3 gap-4">
              {TEST_FURNITURE.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleAddFurniture(item)}
                  className="bg-white border-2 border-gray-300 rounded-lg p-4 hover:border-black hover:shadow-md transition-all"
                >
                  <div className="text-2xl mb-2">{item.emoji}</div>
                  <div className="text-sm">{item.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-bold mb-4">Canvas Furniture ({furniture.length})</h3>
            <div className="space-y-2">
              {furniture.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleFurnitureClick(item.id)}
                  className={`border-2 rounded p-3 cursor-pointer transition-all ${
                    selectedFurniture === item.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{item.emoji}</span>
                    <span className="ml-2">{item.label}</span>
                    {selectedFurniture === item.id && (
                      <button
                        onClick={() => handleDeleteFurniture(item.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-6">
            <button
              onClick={handleAnalyze}
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Furniture'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
