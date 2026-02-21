"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Master } from "@/lib/furniture-data"
import { BookingModal } from "./BookingModal"
import { MapPin, Globe, Star, Tag, Calendar } from "lucide-react"

interface MasterCardProps {
  master: Master
  index?: number
}

const BADGE_COLORS = [
  { bg: "#E8F5EE", text: "#1A5C3A" },
  { bg: "#EEF4FB", text: "#1A4A7A" },
  { bg: "#FEF3E2", text: "#B8962E" },
  { bg: "#F3EFFE", text: "#5B2D8E" },
  { bg: "#FDECEA", text: "#C0392B" },
  { bg: "#F5F5F5", text: "#444444" },
]

const MAX_BADGES = 3

function StarRating({ rating }: { rating: number }) {
  const filled = Math.round(rating)
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < filled ? "fill-black text-black" : "text-gray-200 fill-gray-200"}
        />
      ))}
    </div>
  )
}

export function MasterCard({ master, index = 0 }: MasterCardProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  const isLeft = index % 2 === 0
  const visibleSpecs = master.specialities.slice(0, MAX_BADGES)
  const extraCount = master.specialities.length - MAX_BADGES
  const isAvailableSoon =
    master.availability.toLowerCase().includes("tomorrow") ||
    master.availability.toLowerCase().includes("today")

  return (
    <>
      <motion.div
        className="h-full"
        initial={{ opacity: 0, y: 30, x: isLeft ? -10 : 10 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 0.5, delay: index * 0.12, ease: "easeOut" }}
      >
        <div
          className="flex flex-col h-full bg-white rounded-2xl p-6 cursor-pointer transition-all duration-[250ms] ease-in-out"
          style={{
            border: "1px solid #E5E5E5",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget
            el.style.boxShadow = "0 8px 32px rgba(0,0,0,0.12)"
            el.style.borderColor = "#0A0A0A"
            el.style.transform = "translateY(-4px)"
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget
            el.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"
            el.style.borderColor = "#E5E5E5"
            el.style.transform = "translateY(0)"
          }}
        >
          {/* ── Flex-grow content area ── */}
          <div className="flex-1 space-y-3">

            {/* TOP: Avatar + name/title/location */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center text-2xl flex-shrink-0 select-none">
                {master.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-[20px] text-black leading-tight">
                  {master.name}
                </h3>
                <p className="font-sans text-[13px] text-gray-500 truncate">{master.title}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin size={12} className="text-gray-400 flex-shrink-0" />
                  <span className="font-sans text-[12px] text-gray-400">{master.location}</span>
                </div>
              </div>
            </div>

            {/* RATING ROW */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StarRating rating={master.rating} />
                <span className="font-sans text-[13px] font-bold text-black">{master.rating}</span>
                <span className="font-sans text-[12px] text-gray-400">({master.reviewCount} reviews)</span>
              </div>
              <span
                className="font-sans text-[11px] rounded-full px-2.5 py-0.5"
                style={{ background: "#F5F5F5", color: "#555" }}
              >
                {master.experience} yrs exp
              </span>
            </div>

            {/* BIO — 2-line clamp */}
            <p
              className="font-sans text-[14px] text-gray-500 leading-[1.6]"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {master.bio}
            </p>

            {/* SPECIALITIES */}
            <div className="flex flex-wrap gap-1.5">
              {visibleSpecs.map((spec, i) => {
                const color = BADGE_COLORS[i % BADGE_COLORS.length]
                return (
                  <span
                    key={spec}
                    className="font-sans text-[11px] font-medium rounded-full px-2.5 py-1"
                    style={{ background: color.bg, color: color.text }}
                  >
                    {spec}
                  </span>
                )
              })}
              {extraCount > 0 && (
                <span
                  className="font-sans text-[11px] font-medium rounded-full px-2.5 py-1"
                  style={{ background: "#F5F5F5", color: "#666" }}
                >
                  +{extraCount} more
                </span>
              )}
            </div>

            {/* LANGUAGES + AVAILABILITY */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Globe size={12} className="text-gray-400 flex-shrink-0" />
                <span className="font-sans text-[12px] text-gray-400">
                  {master.languages.join(", ")}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: isAvailableSoon ? "#1A5C3A" : "#B8962E" }}
                />
                <span className="font-sans text-[12px] text-gray-500">{master.availability}</span>
              </div>
            </div>

          </div>
          {/* ── end flex-grow content ── */}

          {/* PRICE + BUTTON — pinned to bottom */}
          <div className="mt-4 pt-4 border-t border-[#F0F0F0]">
            <div className="flex items-center justify-between mb-4">
              <span className="font-sans text-[12px] text-gray-400">From</span>
              <span className="font-display font-bold text-[24px] text-black leading-none">
                £{master.pricePerSession}
              </span>
              <div className="flex items-center gap-1">
                <Tag size={12} className="text-gray-400" />
                <span className="font-sans text-[11px] text-gray-400">per session</span>
              </div>
            </div>
            <button
              onClick={() => setIsBookingOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-black text-white font-sans text-[14px] font-medium transition-all duration-200 hover:bg-[#1a1a1a] hover:scale-[1.01]"
            >
              <Calendar size={16} />
              Book a Consultation
            </button>
          </div>

        </div>
      </motion.div>

      <BookingModal
        master={master}
        open={isBookingOpen}
        onOpenChange={setIsBookingOpen}
      />
    </>
  )
}
