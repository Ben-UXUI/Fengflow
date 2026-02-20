"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MASTERS } from "@/lib/furniture-data"

export function MastersTeaser() {
  const featuredMasters = MASTERS.slice(0, 3)

  return (
    <section className="py-20 bg-[var(--bg-secondary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-4xl md:text-5xl font-display font-bold text-center mb-4 text-[var(--text-primary)]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          Or speak to a real Feng Shui Master
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {featuredMasters.map((master, index) => (
            <motion.div
              key={master.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow bg-white">
                <CardHeader>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-[var(--green-light)] flex items-center justify-center text-3xl">
                      {master.avatar}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{master.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {master.location}
                      </CardDescription>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {master.bio}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-[var(--green-deep)]">
                        ⭐ {master.rating}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {master.reviewCount} reviews
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        £{master.pricePerSession}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        per session
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Link href="/masters">
            <Button size="lg" variant="ghost">
              Browse All Masters →
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
