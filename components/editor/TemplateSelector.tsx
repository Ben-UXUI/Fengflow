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
      <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">
        Room Template
      </h3>
      <div className="space-y-2">
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template)}
            className={`w-full text-left px-4 py-3 rounded-2xl border-2 transition-all ${
              selectedTemplate.id === template.id
                ? "border-[var(--accent)] bg-[var(--bg-secondary)]"
                : "border-[var(--border)] bg-white hover:border-[var(--accent-hover)]"
            }`}
          >
            <div className="font-medium text-sm text-[var(--text-primary)]">
              {template.label}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-1">
              {(template.width / 100).toFixed(1)}m × {(template.height / 100).toFixed(1)}m
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
