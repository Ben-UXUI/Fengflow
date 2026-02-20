"use client"

import { Template } from "@/lib/room-types"
import { TEMPLATES } from "@/lib/furniture-data"

interface TemplateSelectorProps {
  selectedTemplate: Template
  onSelectTemplate: (template: Template) => void
}

export function TemplateSelector({
  selectedTemplate,
  onSelectTemplate,
}: TemplateSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-[var(--text-primary)]">
        Choose Room Type
      </h3>
      <div className="space-y-2">
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template)}
            className={`w-full py-2.5 rounded-full border-2 text-sm font-medium transition-all ${
              selectedTemplate.id === template.id
                ? "bg-[var(--accent)] text-[var(--text-inverse)] border-[var(--accent)]"
                : "bg-white text-[var(--text-primary)] border-[var(--border-dark)] hover:border-[var(--accent-hover)]"
            }`}
          >
            {template.label}
          </button>
        ))}
      </div>
    </div>
  )
}
