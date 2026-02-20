"use client"

import { MASTERS } from "@/lib/furniture-data"
import { MasterCard } from "@/components/masters/MasterCard"

export default function MastersPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-[var(--text-primary)] mb-4">
            Meet Our Feng Shui Masters
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Connect with experienced practitioners trained in classical Feng Shui
            principles. Book a consultation for personalised guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {MASTERS.map((master) => (
            <MasterCard key={master.id} master={master} />
          ))}
        </div>
      </div>
    </div>
  )
}
