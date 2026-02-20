"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const steps = [
  {
    emoji: "🏠",
    title: "Choose Your Layout",
    description: "Pick from common UK home templates or start from scratch",
  },
  {
    emoji: "🪑",
    title: "Arrange Your Space",
    description: "Drag and drop furniture to match your home",
  },
  {
    emoji: "✨",
    title: "Receive Your Analysis",
    description: "Get classical Feng Shui guidance powered by AI",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-[var(--bg-primary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-4xl md:text-5xl font-display font-bold text-center mb-12 text-[var(--text-primary)]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          How It Works
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow cursor-default bg-white">
                <CardHeader>
                  <div className="text-6xl mb-4 text-center">{step.emoji}</div>
                  <CardTitle className="text-center text-[var(--green-deep)]">
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
