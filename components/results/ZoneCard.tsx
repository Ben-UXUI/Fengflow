"use client"

import { Badge } from "@/components/ui/badge"

interface ZoneCardProps {
  zone: string
  lifeArea: string
  element: string
  status: "Good" | "Attention" | "Issue"
  note: string
}

export function ZoneCard({ zone, lifeArea, element, status, note }: ZoneCardProps) {
  const getStatusVariant = () => {
    switch (status) {
      case "Good":
        return "secondary"
      case "Attention":
        return "destructive"
      case "Issue":
        return "default"
      default:
        return "outline"
    }
  }

  return (
    <div className="p-4 rounded-2xl border border-[var(--border-dark)] bg-white shadow-[1px_1px_0px_0px_var(--accent)]">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-bold text-[var(--text-primary)]">{zone}</h4>
          <p className="text-sm text-[var(--text-muted)]">{lifeArea}</p>
        </div>
        <Badge variant={getStatusVariant()}>
          {status}
        </Badge>
      </div>
      <div className="text-xs text-[var(--text-secondary)] mb-2">
        Element: <span className="font-medium">{element}</span>
      </div>
      <p className="text-sm text-[var(--text-secondary)]">{note}</p>
    </div>
  )
}
