"use client"

import React from "react"
import { motion } from "framer-motion"
import { LayoutDashboard, Move, Sparkles, ChevronRight, type LucideIcon } from "lucide-react"

// ── Data ─────────────────────────────────────────────────────────────────────
interface Step {
  badge: string
  Icon: LucideIcon
  title: string
  desc: string
  chinese: string
}

const STEPS: Step[] = [
  {
    badge: "Step 01",
    Icon: LayoutDashboard,
    title: "Choose Your Layout",
    desc: "Pick from common UK home templates — studio flat, bedroom, living room or open plan. Each template is proportioned to real UK room sizes.",
    chinese: "选",
  },
  {
    badge: "Step 02",
    Icon: Move,
    title: "Arrange Your Space",
    desc: "Drag and drop furniture onto your floor plan. Set your compass direction to align the Bagua energy map to your real space.",
    chinese: "排",
  },
  {
    badge: "Step 03",
    Icon: Sparkles,
    title: "Receive Your Analysis",
    desc: "Submit your layout and receive a detailed classical Feng Shui analysis with zone mapping, issues found and prioritised recommendations.",
    chinese: "析",
  },
]

// ── Glassmorphism card ────────────────────────────────────────────────────────
function GlassCard({ step, index }: { step: Step; index: number }) {
  const { badge, Icon, title, desc, chinese } = step
  return (
    <motion.div
      className="flex flex-col"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
      whileHover={{
        y: -6,
        transition: { duration: 0.3, ease: "easeOut" },
      }}
      style={{
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 24,
        boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
        padding: "36px 28px",
        transition: "background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.background = "rgba(255,255,255,0.10)"
        el.style.borderColor = "rgba(255,255,255,0.22)"
        el.style.boxShadow = "0 16px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)"
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.background = "rgba(255,255,255,0.06)"
        el.style.borderColor = "rgba(255,255,255,0.12)"
        el.style.boxShadow = "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)"
      }}
    >
      {/* Step badge */}
      <div
        className="inline-flex items-center self-start"
        style={{
          background: "rgba(255,255,255,0.10)",
          border: "1px solid rgba(255,255,255,0.20)",
          borderRadius: 9999,
          padding: "4px 12px",
        }}
      >
        <span className="font-sans text-[11px] font-medium text-white">{badge}</span>
      </div>

      {/* Icon circle */}
      <div
        className="mt-5 flex items-center justify-center"
        style={{
          width: 56, height: 56,
          background: "rgba(255,255,255,0.10)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 9999,
          boxShadow: "0 0 20px rgba(255,255,255,0.08)",
          transition: "background 0.3s ease",
          flexShrink: 0,
        }}
      >
        <Icon size={24} color="white" />
      </div>

      {/* Title */}
      <h3
        className="font-display font-bold text-white"
        style={{ fontSize: 26, marginTop: 20, lineHeight: 1.25 }}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className="font-sans"
        style={{
          fontSize: 14,
          color: "rgba(255,255,255,0.65)",
          lineHeight: 1.7,
          marginTop: 12,
          flexGrow: 1,
        }}
      >
        {desc}
      </p>

      {/* Bottom decorative area */}
      <div style={{ marginTop: "auto", paddingTop: 24 }}>
        <div
          style={{
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
          }}
        />
        <p
          className="font-sans text-center select-none"
          style={{ fontSize: 28, color: "rgba(255,255,255,0.06)", marginTop: 12, lineHeight: 1 }}
        >
          {chinese}
        </p>
      </div>
    </motion.div>
  )
}

// ── Pulsing arrow ─────────────────────────────────────────────────────────────
function PulsingArrow() {
  return (
    <motion.div
      className="hidden md:flex items-center justify-center self-center px-1 shrink-0"
      animate={{ opacity: [0.2, 0.5, 0.2] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <ChevronRight size={20} style={{ color: "rgba(255,255,255,0.3)" }} />
    </motion.div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export function HowItWorks() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0A0A0A 0%, #1A1A2E 40%, #0A0A0A 100%)",
      }}
    >
      {/* Dot texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      {/* Colour blobs */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: -60, left: -60,
          width: 300, height: 300,
          borderRadius: "50%",
          background: "#1A5C3A",
          opacity: 0.15,
          filter: "blur(80px)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          top: -40, right: -40,
          width: 280, height: 280,
          borderRadius: "50%",
          background: "#1A4A7A",
          opacity: 0.12,
          filter: "blur(80px)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: -60,
          left: "50%",
          transform: "translateX(-50%)",
          width: 260, height: 260,
          borderRadius: "50%",
          background: "#B8962E",
          opacity: 0.10,
          filter: "blur(80px)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">

        {/* ── Header ── */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <p
            className="font-sans font-medium uppercase tracking-[0.15em] mb-4"
            style={{ fontSize: 11, color: "#999999" }}
          >
            HOW IT WORKS
          </p>
          <h2
            className="font-display font-bold text-white leading-tight"
            style={{ fontSize: "clamp(36px, 5vw, 52px)" }}
          >
            Three steps to harmony
          </h2>
          <p
            className="font-sans mx-auto mt-4"
            style={{ fontSize: 15, color: "#888888", lineHeight: 1.7, maxWidth: 480 }}
          >
            From empty room to personalised Feng Shui guidance in minutes
          </p>
        </motion.div>

        {/* ── Desktop cards + arrows ── */}
        <div className="hidden md:grid gap-0" style={{ gridTemplateColumns: "1fr auto 1fr auto 1fr", alignItems: "stretch" }}>
          {STEPS.map((step, i) => (
            <React.Fragment key={step.badge}>
              <GlassCard step={step} index={i} />
              {i < STEPS.length - 1 && <PulsingArrow />}
            </React.Fragment>
          ))}
        </div>

        {/* ── Mobile cards ── */}
        <div className="md:hidden flex flex-col gap-5">
          {STEPS.map((step, i) => (
            <GlassCard key={step.badge} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
