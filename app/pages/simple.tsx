"use client"

import { useState } from "react"

export default function SimpleTest() {
  const [count, setCount] = useState(0)
  const [message, setMessage] = useState("Click any button to test")
  
  const handleIncrement = () => {
    const newCount = count + 1
    setCount(newCount)
    setMessage(`Incremented to ${newCount}`)
    console.log("Increment worked! New count:", newCount)
  }
  
  const handleDecrement = () => {
    const newCount = Math.max(0, count - 1)
    setCount(newCount)
    setMessage(`Decremented to ${newCount}`)
    console.log("Decrement worked! New count:", newCount)
  }
  
  const handleReset = () => {
    setCount(0)
    setMessage("Reset to 0")
    console.log("Reset worked!")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-black">
          SIMPLE WORKING TEST
        </h1>
        
        <div className="text-center mb-8">
          <p className="text-xl mb-4 text-gray-600">Current Count: <span className="font-bold text-2xl text-blue-600">{count}</span></p>
          <p className="text-sm text-gray-500">{message}</p>
        </div>
        
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={handleIncrement}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Increment (+1)
          </button>
          
          <button
            onClick={handleDecrement}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Decrement (-1)
          </button>
          
          <button
            onClick={handleReset}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Reset (0)
          </button>
        </div>
        
        <div className="border-t pt-6">
          <h2 className="text-lg font-bold mb-4">Test Instructions:</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>Click "Increment" - should increase count and update message</li>
            <li>Click "Decrement" - should decrease count and update message</li>
            <li>Click "Reset" - should reset count to 0</li>
            <li>Open browser console (F12) to see console.log messages</li>
          </ol>
          
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>If this works:</strong> React state is working, issue is in complex editor<br/>
              <strong>If this doesn't work:</strong> There's a fundamental React/Next.js issue
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
