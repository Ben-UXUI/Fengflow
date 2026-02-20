"use client"

import { FurnitureItem } from "@/lib/room-types"
import { FURNITURE_ITEMS } from "@/lib/furniture-data"
import { ChevronLeft, ChevronRight } from "lucide-react"

const CATEGORY_ORDER = ["Bedroom", "Work", "Living", "Dining", "Feng Shui"] as const

interface FurnitureSidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  onAddFurniture: (item: FurnitureItem) => void
}

export function FurnitureSidebar({ collapsed, onToggleCollapse, onAddFurniture }: FurnitureSidebarProps) {
  const byCategory = CATEGORY_ORDER.map((cat) => ({
    label: cat.toUpperCase(),
    items: FURNITURE_ITEMS.filter((i) => i.category === cat),
  })).filter((g) => g.items.length > 0)

  return (
    <div
      className="h-full flex bg-white border-l border-[var(--border-dark)] transition-[width] duration-300 ease-out overflow-hidden shrink-0"
      style={{ width: collapsed ? 40 : 260 }}
    >
      <button
        type="button"
        onClick={onToggleCollapse}
        className="flex-shrink-0 w-10 h-full min-h-0 flex items-center justify-center bg-[var(--accent)] text-[var(--text-inverse)] hover:bg-[var(--accent-hover)] transition-colors"
        aria-label={collapsed ? "Expand panel" : "Collapse panel"}
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {!collapsed && (
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-shrink-0 px-3 pt-4 pb-2 border-b border-[var(--border)]">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Furniture</h3>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-3 min-h-0">
            <div className="space-y-4">
              {byCategory.map((group) => (
                <div key={group.label}>
                  <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
                    {group.label}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onAddFurniture(item)}
                        className="flex flex-col items-center justify-center p-3 rounded-xl border border-[var(--border-dark)] bg-white hover:shadow-[2px_2px_0px_0px_var(--accent)] hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <span className="text-2xl mb-1">{item.emoji}</span>
                        <span className="text-[10px] font-medium text-[var(--text-primary)] text-center leading-tight line-clamp-2">
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-[var(--text-muted)] mt-4 pt-3 border-t border-[var(--border)] text-center">
              Click any item to add to canvas
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
