"use client"

import { motion } from "framer-motion"
import { Master } from "@/lib/furniture-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookingModal } from "./BookingModal"
import { useState } from "react"

interface MasterCardProps {
  master: Master
}

export function MasterCard({ master }: MasterCardProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <Card className="h-full hover:shadow-[3px_3px_0px_0px_var(--accent)] transition-all cursor-pointer bg-white">
          <CardHeader>
            <div className="flex items-start space-x-4 mb-4">
              <div className="w-20 h-20 rounded-full bg-[var(--accent)] flex items-center justify-center text-4xl flex-shrink-0">
                {master.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl mb-1 text-[var(--text-primary)]">{master.name}</CardTitle>
                <CardDescription className="text-sm mb-2">
                  {master.title}
                </CardDescription>
                <div className="flex items-center space-x-2 text-xs text-[var(--text-muted)]">
                  <span>📍</span>
                  <span>{master.location}</span>
                </div>
              </div>
            </div>
            <CardDescription className="line-clamp-2 mb-4">
              {master.bio}
            </CardDescription>
            <div className="flex flex-wrap gap-2 mb-4">
              {master.specialities.map((spec, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {spec}
                </Badge>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--border)]">
              <div className="flex items-center space-x-4">
                <div>
                  <div className="text-sm font-bold text-[var(--text-primary)]">
                    ★ {master.rating}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {master.reviewCount} reviews
                  </div>
                </div>
                <div>
                  <div className="text-sm font-bold text-[var(--text-primary)]">
                    {master.experience} years
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    experience
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[var(--text-primary)]">
                  £{master.pricePerSession}
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  per session
                </div>
              </div>
            </div>
            <div className="text-xs text-[var(--text-muted)] mb-4">
              {master.availability}
            </div>
            <Button
              className="w-full rounded-full"
              onClick={() => setIsBookingOpen(true)}
            >
              Book a Consultation
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <BookingModal
        master={master}
        open={isBookingOpen}
        onOpenChange={setIsBookingOpen}
      />
    </>
  )
}
