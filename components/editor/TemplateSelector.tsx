"use client"

import { Template } from "@/lib/room-types"
import { TEMPLATES } from "@/lib/furniture-data"
import { LayoutDashboard, Bed, Sofa, UtensilsCrossed } from "lucide-react"

const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  studio:   <LayoutDashboard size={16} />,
  bedroom:  <Bed size={16} />,
  living:   <Sofa size={16} />,
  openplan: <UtensilsCrossed size={16} />,
}

interface TemplateSelectorProps {
  selectedTemplate: Template
  onSelectTemplate: (template: Template) => void
}

export function TemplateSelector({ selectedTemplate, onSelectTemplate }: TemplateSelectorProps) {
  return (
    <div className="space-y-2">
      <h3 className="font-sans text-[13px] font-bold text-[var(--text-primary)] flex items-center gap-1.5">
        <LayoutDashboard size={14} />
        Choose Room Type
      </h3>
      <div className="space-y-1.5">
        {TEMPLATES.map((template) => {
          const isSelected = selectedTemplate.id === template.id
          return (
            <button
              key={template.id}
              onClick={() => onSelectTemplate(template)}
              className={`w-full flex items-center gap-2.5 px-[14px] py-[10px] rounded-xl border font-sans text-[13px] font-medium transition-all ${
                isSelected
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-black hover:bg-gray-50"
              }`}
            >
              {TEMPLATE_ICONS[template.id]}
              {template.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
