"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"

interface Recommendation {
  priority: number
  title: string
  action: string
  reason: string
  effort: "Easy" | "Medium" | "Effort"
}

interface RecommendationListProps {
  recommendations: Recommendation[]
}

export function RecommendationList({ recommendations }: RecommendationListProps) {
  const sortedRecs = [...recommendations].sort((a, b) => a.priority - b.priority)

  const getEffortVariant = (effort: string) => {
    switch (effort) {
      case "Easy":
        return "destructive"
      case "Medium":
        return "secondary"
      case "Effort":
        return "default"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-4">
      {sortedRecs.map((rec, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-4 rounded-2xl border border-[var(--border-dark)] bg-white shadow-[1px_1px_0px_0px_var(--accent)]"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-[var(--accent)] text-[var(--text-primary)] flex items-center justify-center font-bold text-lg">
              {rec.priority}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-[var(--text-primary)]">
                  {rec.title}
                </h4>
                <Badge variant={getEffortVariant(rec.effort)}>
                  {rec.effort}
                </Badge>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-2">
                <span className="font-medium">Action:</span> {rec.action}
              </p>
              <p className="text-sm text-[var(--text-muted)]">{rec.reason}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
