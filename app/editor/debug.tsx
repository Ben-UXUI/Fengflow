"use client"

import { useState } from "react"

export default function DebugTest() {
  const [count, setCount] = useState(0)
  
  const handleClick = () => {
    console.log("Debug button clicked, current count:", count)
    setCount(prev => {
      const newCount = prev + 1
      console.log("Setting new count:", newCount)
      return newCount
    })
  }
  
  const handleReset = () => {
    console.log("Reset button clicked")
    setCount(0)
  }
  
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Debug Test</h2>
      <p className="mb-4">Test if basic React state and clicks work:</p>
      
      <button 
        onClick={handleClick}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Click me! Count: {count}
      </button>
      
      <button 
        onClick={handleReset}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ml-4"
      >
        Reset
      </button>
    </div>
  )
}
