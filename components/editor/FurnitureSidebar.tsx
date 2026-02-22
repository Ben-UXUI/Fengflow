"use client"

import { useState, useMemo } from "react"
import { FurnitureItem } from "@/lib/room-types"
import { FURNITURE_ITEMS } from "@/lib/furniture-data"
import { ChevronLeft, ChevronRight, Sofa, Bed, UtensilsCrossed, Briefcase, Search, Droplets, Flower2, Trees } from "lucide-react"

const CATEGORY_ORDER = ["Bedroom", "Living", "Dining", "Bathroom", "Feng Shui", "Work", "Outdoor"] as const

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  BEDROOM:    <Bed        size={11} />,
  LIVING:     <Sofa       size={11} />,
  DINING:     <UtensilsCrossed size={11} />,
  BATHROOM:   <Droplets   size={11} />,
  "FENG SHUI":<span className="text-[11px] leading-none">☯</span>,
  WORK:       <Briefcase  size={11} />,
  OUTDOOR:    <Trees      size={11} />,
}

const CATEGORY_TINTS: Record<string, string> = {
  BEDROOM:    "#FEF9F5",
  LIVING:     "#F5F8FE",
  DINING:     "#FEF9EF",
  BATHROOM:   "#F0F8F8",
  "FENG SHUI":"#F8F5FE",
  WORK:       "#F8F8F8",
  OUTDOOR:    "#F5FAF5",
}

interface FurnitureSidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  onAddFurniture: (item: FurnitureItem) => void
}

export function FurnitureSidebar({ collapsed, onToggleCollapse, onAddFurniture }: FurnitureSidebarProps) {
  const [search, setSearch] = useState("")

  const byCategory = useMemo(() =>
    CATEGORY_ORDER.map((cat) => {
      const allItems = FURNITURE_ITEMS.filter((i) => i.category === cat)
      const filtered  = search.trim()
        ? allItems.filter(i => i.label.toLowerCase().includes(search.toLowerCase()))
        : allItems
      return { label: cat.toUpperCase(), cat, items: filtered, total: allItems.length }
    }).filter((g) => g.items.length > 0 || (search.trim() === "" && FURNITURE_ITEMS.some(i => i.category === g.cat)))
  , [search])

  const hasResults = byCategory.some(g => g.items.length > 0)

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
          {/* Header */}
          <div className="flex-shrink-0 px-3 pt-4 pb-2 border-b border-[var(--border)]">
            <h3 className="font-sans text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <Sofa size={14} />
              Furniture
            </h3>
          </div>

          {/* Search */}
          <div className="flex-shrink-0 px-3 py-2 border-b border-[var(--border)]">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search furniture…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-7 pr-2.5 py-1.5 font-sans text-[13px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-black transition-colors placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-3 py-3 min-h-0">
            {!hasResults && (
              <p className="font-sans text-[12px] text-gray-400 italic text-center mt-4">
                No furniture found
              </p>
            )}
            <div className="space-y-4">
              {byCategory.map((group) => group.items.length > 0 && (
                <div key={group.label}>
                  <p className="font-sans text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1">
                    {CATEGORY_ICONS[group.label]}
                    <span className="flex-1">{group.label}</span>
                    <span className="bg-[#F5F5F5] text-gray-400 rounded-full px-1.5 py-0.5 text-[9px] font-normal">
                      {group.items.length}
                    </span>
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onAddFurniture(item)}
                        className="flex flex-col items-center justify-center p-3 rounded-xl border border-[var(--border-dark)] hover:shadow-[2px_2px_0px_0px_var(--accent)] hover:-translate-y-0.5 transition-all duration-200"
                        style={{ backgroundColor: CATEGORY_TINTS[group.label] }}
                      >
                        <span className="text-2xl mb-1 leading-none">{item.emoji}</span>
                        <span className="font-sans text-[10px] font-medium text-[var(--text-primary)] text-center leading-tight line-clamp-2">
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="font-sans text-[10px] text-[var(--text-muted)] mt-4 pt-3 border-t border-[var(--border)] text-center">
              Click any item to add to canvas
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
