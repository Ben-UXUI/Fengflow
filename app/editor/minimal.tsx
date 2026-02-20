"use client"

import { useState } from "react"

export default function MinimalEditor() {
  const [count, setCount] = useState(0)
  
  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-black">Minimal Test Editor</h1>
      <p className="mb-6 text-gray-600">Testing if basic clicks work:</p>
      
      <div className="space-x-4 mb-8">
        <button 
          onClick={() => setCount(count + 1)}
          className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 text-lg font-semibold"
        >
          Increment: {count}
        </button>
        
        <button 
          onClick={() => setCount(Math.max(0, count - 1))}
          className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 text-lg font-semibold"
        >
          Decrement: {count}
        </button>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Current Count: {count}</h2>
        <p className="text-sm text-gray-600">
          {count === 0 && "Click increment to test"}
          {count > 0 && "Click decrement to test"}
        </p>
      </div>
    </div>
  )
}
