"use client"

export function CompassRose() {
  return (
    <svg
      viewBox="0 0 120 120"
      className="w-24 h-24 mx-auto mb-4 text-[var(--text-primary)]"
    >
      <circle cx="60" cy="60" r="55" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="60" cy="60" r="3" fill="currentColor" />
      {/* N */}
      <line x1="60" y1="10" x2="60" y2="25" stroke="currentColor" strokeWidth="2" />
      <text x="60" y="20" textAnchor="middle" fontSize="10" fill="currentColor" fontWeight="bold">N</text>
      {/* S */}
      <line x1="60" y1="95" x2="60" y2="110" stroke="currentColor" strokeWidth="2" />
      <text x="60" y="108" textAnchor="middle" fontSize="10" fill="currentColor" fontWeight="bold">S</text>
      {/* E */}
      <line x1="95" y1="60" x2="110" y2="60" stroke="currentColor" strokeWidth="2" />
      <text x="105" y="64" textAnchor="middle" fontSize="10" fill="currentColor" fontWeight="bold">E</text>
      {/* W */}
      <line x1="10" y1="60" x2="25" y2="60" stroke="currentColor" strokeWidth="2" />
      <text x="15" y="64" textAnchor="middle" fontSize="10" fill="currentColor" fontWeight="bold">W</text>
      {/* NE, SE, SW, NW */}
      <line x1="78" y1="78" x2="88" y2="88" stroke="currentColor" strokeWidth="1" />
      <line x1="78" y1="42" x2="88" y2="32" stroke="currentColor" strokeWidth="1" />
      <line x1="42" y1="42" x2="32" y2="32" stroke="currentColor" strokeWidth="1" />
      <line x1="42" y1="78" x2="32" y2="88" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}
