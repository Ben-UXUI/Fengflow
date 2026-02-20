"use client"

import { FurnitureItem } from "@/lib/room-types"
import { FURNITURE_ITEMS } from "@/lib/furniture-data"
import { useState } from "react"

interface FurnitureSidebarProps {
  onAddFurniture: (item: FurnitureItem) => void
}

export function FurnitureSidebar({ onAddFurniture }: FurnitureSidebarProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = Array.from(new Set(FURNITURE_ITEMS.map((item) => item.category)))
  const filteredItems = selectedCategory
    ? FURNITURE_ITEMS.filter((item) => item.category === selectedCategory)
    : FURNITURE_ITEMS

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">
          Furniture
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === null
                ? "bg-[var(--accent)] text-[var(--text-inverse)]"
                : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--border)]"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-[var(--accent)] text-[var(--text-inverse)]"
                  : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--border)]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onAddFurniture(item)}
            className="w-full p-3 rounded-2xl border border-[var(--border-dark)] bg-white hover:border-[var(--accent)] shadow-[1px_1px_0px_0px_var(--accent)] hover:shadow-[2px_2px_0px_0px_var(--accent)] transition-all text-left group"
          >
            <div className="flex items-center space-x-3">
              <div className="text-3xl">{item.emoji}</div>
              <div className="flex-1">
                <div className="font-medium text-sm text-[var(--text-primary)] group-hover:text-[var(--accent)]">
                  {item.label}
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-1">
                  {item.category} • {item.element}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
