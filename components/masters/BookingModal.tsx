"use client"

import { useState } from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Master } from "@/lib/furniture-data"
import { X, User, Mail, Send, CheckCircle, Clock } from "lucide-react"

interface BookingModalProps {
  master: Master
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SESSION_LENGTHS = [30, 60, 90] as const

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
      setSessionLength(60)
    }, 3000)
  }

  const inputBase =
    "w-full h-9 px-3 font-sans text-[14px] text-black bg-white border border-[#E5E5E5] rounded-lg outline-none transition-colors focus:border-black placeholder:text-gray-400"
  const inputWithIcon =
    "w-full h-9 pl-8 pr-3 font-sans text-[14px] text-black bg-white border border-[#E5E5E5] rounded-lg outline-none transition-colors focus:border-black placeholder:text-gray-400"

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Overlay */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Modal panel */}
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-[520px] -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl border border-[#E5E5E5] overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          style={{ maxHeight: "85vh" }}
        >
          {/* Close button */}
          <DialogPrimitive.Close className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-gray-400 hover:text-black transition-colors">
            <X size={16} />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>

          {/* Scrollable content */}
          <div className="overflow-y-auto" style={{ maxHeight: "85vh" }}>

            {/* ── Header ── */}
            <div className="px-5 pt-5 pb-4 border-b border-[#F0F0F0]">
              <div className="flex items-center gap-3 pr-8">
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-[18px] flex-shrink-0 select-none">
                  {master.avatar}
                </div>
                <div className="min-w-0">
                  <p className="font-display font-bold text-[18px] text-black leading-tight truncate">
                    {master.name}
                  </p>
                  <p className="font-sans text-[12px] text-gray-400 leading-tight truncate">
                    {master.title}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Body ── */}
            {isSubmitted ? (
              /* Success state */
              <div className="px-5 py-8 flex flex-col items-center text-center">
                <CheckCircle size={40} className="text-black mb-2" />
                <h3 className="font-display font-bold text-[22px] text-black mb-1.5">
                  Request Sent!
                </h3>
                <p className="font-sans text-[13px] text-gray-500 leading-[1.5] max-w-[320px]">
                  Master {master.name} will be in touch within 24 hours to confirm your session.
                </p>
                <button
                  onClick={() => onOpenChange(false)}
                  className="mt-5 px-5 py-2 rounded-full border border-black font-sans text-[13px] text-black bg-white hover:bg-black hover:text-white transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-5 py-4 flex flex-col gap-[10px]">

                {/* Session length */}
                <div>
                  <p className="font-sans text-[12px] text-gray-400 uppercase tracking-wide mb-1.5">
                    Session
                  </p>
                  <div className="flex gap-2 items-center">
                    {SESSION_LENGTHS.map((len) => {
                      const isActive = sessionLength === len
                      const sessionPrice = Math.round((master.pricePerSession / 60) * len)
                      return (
                        <button
                          key={len}
                          type="button"
                          onClick={() => setSessionLength(len)}
                          className={`px-4 py-1.5 rounded-full border font-sans text-[13px] transition-colors ${
                            isActive
                              ? "bg-black text-white border-black"
                              : "bg-white text-black border-black hover:bg-gray-50"
                          }`}
                        >
                          {len} min
                        </button>
                      )
                    })}
                    <span className="font-sans text-[13px] font-bold text-black ml-1">
                      · £{price}
                    </span>
                  </div>
                </div>

                {/* Name + Email side by side on desktop, stacked on mobile */}
                <div className="flex flex-col sm:flex-row gap-[10px]">
                  <div className="flex-1 min-w-0">
                    <label htmlFor="bm-name" className="block font-sans text-[12px] text-gray-400 mb-1">
                      Name
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        id="bm-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Your name"
                        className={inputWithIcon}
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <label htmlFor="bm-email" className="block font-sans text-[12px] text-gray-400 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        id="bm-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="your@email.com"
                        className={inputWithIcon}
                      />
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="bm-message" className="block font-sans text-[12px] text-gray-400 mb-1">
                    Message
                  </label>
                  <textarea
                    id="bm-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    placeholder="Describe your room, concerns, or what you'd like to improve..."
                    className={`${inputBase} h-[72px] resize-none py-2`}
                  />
                </div>

                {/* Availability note */}
                <div className="flex items-center gap-1.5">
                  <Clock size={12} className="text-gray-400 flex-shrink-0" />
                  <span className="font-sans text-[12px] text-gray-400 italic">
                    Master will confirm within 24 hours
                  </span>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-black text-white font-sans text-[14px] font-medium hover:bg-[#1a1a1a] transition-colors mt-1"
                >
                  <Send size={16} />
                  Request Booking
                </button>

              </form>
            )}

          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
