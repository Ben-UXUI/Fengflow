"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("App error:", error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Something went wrong</h1>
      <p className="text-sm text-[var(--text-muted)] mb-6 max-w-md text-center">
        {error.message || "An unexpected error occurred."}
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} variant="outline" size="sm">Try again</Button>
        <Link href="/">
          <Button variant="default" size="sm">Go home</Button>
        </Link>
      </div>
    </div>
  )
}
