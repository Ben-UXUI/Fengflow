"use client"

import { FengShuiAnalysis } from "@/lib/room-types"
import { ScoreBadge } from "./ScoreBadge"
import { ZoneCard } from "./ZoneCard"
import { RecommendationList } from "./RecommendationList"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Lightbulb,
  Map,
  CheckCircle,
} from "lucide-react"

interface AnalysisPanelProps {
  analysis: FengShuiAnalysis
}

export function AnalysisPanel({ analysis }: AnalysisPanelProps) {
  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case "High":
        return "default"
      case "Medium":
        return "secondary"
      case "Low":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "High": return <AlertTriangle size={13} />
      case "Medium": return <AlertCircle size={13} />
      default: return <Info size={13} />
    }
  }

  const getZoneStatusVariant = (status: string) => {
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
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <ScoreBadge score={analysis.overall_score} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <h3 className="font-display text-[36px] md:text-[48px] font-bold leading-tight mb-2 text-[var(--text-primary)]">
          Overall Assessment
        </h3>
        <p className="font-display text-[20px] leading-[1.7] font-normal text-[var(--text-secondary)]">{analysis.overall_summary}</p>
        <Badge variant="outline" className="font-sans mt-3">
          {analysis.harmony_level}
        </Badge>
      </motion.div>

      {analysis.issues.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <h3 className="font-display text-[36px] md:text-[48px] font-bold leading-tight mb-4 text-[var(--text-primary)] flex items-center gap-3">
            <AlertTriangle size={28} />
            Issues Found
          </h3>
          <div className="space-y-3">
            {analysis.issues.map((issue, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl border border-[var(--border-dark)] bg-white shadow-[1px_1px_0px_0px_var(--accent)]"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-display font-bold text-[var(--text-primary)]">
                    {issue.title}
                  </h4>
                  <Badge variant={getSeverityVariant(issue.severity)} className="font-sans flex items-center gap-1">
                    {getSeverityIcon(issue.severity)}
                    {issue.severity}
                  </Badge>
                </div>
                <p className="font-sans text-sm text-[var(--text-secondary)]">
                  {issue.description}
                </p>
                <p className="font-sans text-xs text-[var(--text-muted)] mt-2">
                  Zone: {issue.affected_zone}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <h3 className="font-display text-[36px] md:text-[48px] font-bold leading-tight mb-4 text-[var(--text-primary)] flex items-center gap-3">
          <Map size={28} />
          Zone Analysis
        </h3>
        <Accordion type="single" collapsible className="w-full">
          {analysis.zone_analysis.map((zone, index) => (
            <AccordionItem key={index} value={`zone-${index}`}>
              <AccordionTrigger>
                <div className="flex items-center space-x-3">
                  <span className="font-display font-medium text-[var(--text-primary)]">{zone.zone}</span>
                  <Badge variant={getZoneStatusVariant(zone.status)}>
                    {zone.status}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ZoneCard zone={zone.zone} lifeArea={zone.life_area} element={zone.element} status={zone.status} note={zone.note} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <h3 className="font-display text-[36px] md:text-[48px] font-bold leading-tight mb-4 text-[var(--text-primary)] flex items-center gap-3">
          <Lightbulb size={28} />
          Recommendations
        </h3>
        <RecommendationList recommendations={analysis.recommendations} />
      </motion.div>

      {analysis.auspicious_features.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <h3 className="font-display text-[36px] md:text-[48px] font-bold leading-tight mb-4 text-[var(--text-primary)] flex items-center gap-3">
            <CheckCircle size={28} />
            Positive Features
          </h3>
          <ul className="space-y-2">
            {analysis.auspicious_features.map((feature, index) => (
              <li
                key={index}
                className="font-sans flex items-start gap-2 text-[var(--text-secondary)]"
              >
                <CheckCircle size={15} className="mt-0.5 flex-shrink-0 text-[var(--text-primary)]" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  )
}
