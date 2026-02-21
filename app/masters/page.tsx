"use client"

import { motion } from "framer-motion"
import { MASTERS } from "@/lib/furniture-data"
import { MasterCard } from "@/components/masters/MasterCard"
import { Users, Star, Globe } from "lucide-react"

// ── Bagua octagon SVG ──────────────────────────────────────────
const TRIGRAMS = ["☵", "☶", "☳", "☴", "☲", "☷", "☱", "☰"]

function BaguaOctagon() {
  // Centre at (120, 120), viewBox 240×240, with 20px padding for labels
  const cx = 120
  const cy = 120
  const octR = 78   // octagon vertices radius
  const labelR = 100 // trigram label radius — stays within 20..220 range

  const points = Array.from({ length: 8 }, (_, n) => {
    const angle = (n * 45 - 90) * (Math.PI / 180)
    return {
      ox: cx + octR * Math.cos(angle),
      oy: cy + octR * Math.sin(angle),
      lx: cx + labelR * Math.cos(angle),
      ly: cy + labelR * Math.sin(angle),
      trigram: TRIGRAMS[n],
    }
  })

  const octagonPoints = points.map((p) => `${p.ox.toFixed(1)},${p.oy.toFixed(1)}`).join(" ")

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.4 }}
      className="hidden md:flex items-center justify-center flex-shrink-0"
    >
      <motion.svg
        width="220"
        height="220"
        viewBox="0 0 240 240"
        overflow="visible"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {/* Octagon outline */}
        <polygon
          points={octagonPoints}
          fill="none"
          stroke="#0A0A0A"
          strokeWidth="1.5"
          opacity="0.7"
        />
        {/* Connecting lines from centre */}
        {points.map((p, i) => (
          <line
            key={i}
            x1={cx} y1={cy}
            x2={p.ox.toFixed(1)} y2={p.oy.toFixed(1)}
            stroke="#0A0A0A"
            strokeWidth="0.5"
            opacity="0.2"
          />
        ))}
        {/* Trigram symbols at each vertex */}
        {points.map((p, i) => (
          <text
            key={i}
            x={p.lx.toFixed(1)}
            y={p.ly.toFixed(1)}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="14"
            fontFamily="var(--font-dm-sans), sans-serif"
            fill="#0A0A0A"
          >
            {p.trigram}
          </text>
        ))}
        {/* Centre yin yang */}
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="32"
          fill="#0A0A0A"
        >
          ☯
        </text>
      </motion.svg>
    </motion.div>
  )
}

// ── Stat chips ──────────────────────────────────────────────────
const avgRating = (MASTERS.reduce((s, m) => s + m.rating, 0) / MASTERS.length).toFixed(1)

const STATS = [
  { icon: <Users size={13} />, label: `${MASTERS.length} Verified Masters` },
  { icon: <Star size={13} className="fill-current" />, label: `${avgRating} Average Rating` },
  { icon: <Globe size={13} />, label: "UK Wide Coverage" },
]

// ── Page ────────────────────────────────────────────────────────
export default function MastersPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ══════════════════════════════════════
          HEADER
      ══════════════════════════════════════ */}
      <header className="relative overflow-hidden bg-white border-b border-[#E5E5E5]">
        {/* Decorative background trigrams */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <span
            className="absolute font-display text-black opacity-[0.04]"
            style={{ fontSize: 200, top: -40, right: "18%", transform: "rotate(15deg)", lineHeight: 1 }}
          >
            ☰
          </span>
          <span
            className="absolute font-display text-black opacity-[0.04]"
            style={{ fontSize: 160, bottom: -50, left: "8%", transform: "rotate(-12deg)", lineHeight: 1 }}
          >
            ☷
          </span>
          <span
            className="absolute font-display text-black opacity-[0.04]"
            style={{ fontSize: 120, top: 10, left: "35%", transform: "rotate(6deg)", lineHeight: 1 }}
          >
            ☵
          </span>
          {/* Radial gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse at 40% 50%, white 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-14 flex items-center justify-between gap-8">
          {/* Left: text content */}
          <div className="flex-1 max-w-2xl">
            <motion.p
              className="font-sans text-[11px] uppercase tracking-[0.2em] text-gray-400 mb-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              Certified Practitioners
            </motion.p>

            <motion.h1
              className="font-display font-bold text-[56px] leading-tight text-black mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Meet Our Feng Shui Masters
            </motion.h1>

            <motion.p
              className="font-sans text-[16px] text-gray-500 leading-[1.7] mb-7 max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Connect with classically trained Feng Shui consultants. Each master is verified in
              traditional Chinese Feng Shui principles.
            </motion.p>

            {/* Stat chips */}
            <motion.div
              className="flex flex-wrap gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + i * 0.08 }}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-black font-sans text-[13px] text-black bg-white"
                >
                  {stat.icon}
                  {stat.label}
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right: animated Bagua octagon */}
          <BaguaOctagon />
        </div>
      </header>

      {/* ══════════════════════════════════════
          CARDS GRID
      ══════════════════════════════════════ */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          style={{ alignItems: "stretch" }}
        >
          {MASTERS.map((master, index) => (
            <MasterCard key={master.id} master={master} index={index} />
          ))}
        </div>

        {/* ══════════════════════════════════════
            BOTTOM CTA
        ══════════════════════════════════════ */}
        <motion.div
          className="flex flex-col items-center text-center pt-16 pb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.span
            className="text-[32px] mb-5 select-none block"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            ☯
          </motion.span>

          <h2 className="font-display font-bold text-[32px] text-black mb-3">
            Are you a Feng Shui practitioner?
          </h2>
          <p className="font-sans text-[15px] text-gray-500 max-w-md mb-7 leading-[1.6]">
            Join our growing community of verified masters and connect with clients across the UK.
          </p>
          <motion.button
            className="px-8 py-3 rounded-full border border-black text-black font-sans text-[14px] bg-white transition-colors duration-200 hover:bg-black hover:text-white"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Apply to Join →
          </motion.button>
        </motion.div>
      </main>

    </div>
  )
}
