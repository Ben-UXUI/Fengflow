"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Master } from "@/lib/furniture-data"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface BookingModalProps {
  master: Master
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BookingModal({ master, open, onOpenChange }: BookingModalProps) {
  const [sessionLength, setSessionLength] = useState<30 | 60 | 90>(60)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const price = Math.round((master.pricePerSession / 60) * sessionLength)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
    setTimeout(() => {
      onOpenChange(false)
      setIsSubmitted(false)
      setName("")
      setEmail("")
      setMessage("")
    }, 3000)
  }

  if (isSubmitted) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Sent!</DialogTitle>
            <DialogDescription>
              Master {master.name} will contact you within 24 hours.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-[var(--accent)] flex items-center justify-center text-3xl">
              {master.avatar}
            </div>
            <div>
              <DialogTitle>{master.name}</DialogTitle>
              <DialogDescription>{master.title}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Select a session length</Label>
            <div className="flex gap-2 mt-2">
              {[30, 60, 90].map((length) => (
                <button
                  key={length}
                  type="button"
                  onClick={() => setSessionLength(length as 30 | 60 | 90)}
                  className={`flex-1 px-4 py-2 rounded-2xl border-2 transition-all ${
                    sessionLength === length
                      ? "border-[var(--accent)] bg-[var(--bg-secondary)]"
                      : "border-[var(--border)] bg-white hover:border-[var(--accent)]"
                  }`}
                >
                  <div className="font-bold text-[var(--text-primary)]">{length} min</div>
                  <div className="text-xs text-[var(--text-muted)]">
                    £{Math.round((master.pricePerSession / 60) * length)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="message">Tell the master about your space</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="mt-1"
              placeholder="Describe your room, concerns, or what you'd like to improve..."
            />
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-dark)]">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--text-secondary)]">
                Total Price
              </span>
              <span className="text-2xl font-bold text-[var(--text-primary)]">
                £{price}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full">
              Cancel
            </Button>
            <Button type="submit" className="rounded-full">Request Booking</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
