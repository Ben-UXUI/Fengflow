import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { FENGSHUI_SYSTEM_PROMPT } from '@/lib/feng-shui-prompt'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

/**
 * Attempts to repair a truncated JSON string by:
 * 1. Detecting whether we're mid-string (unclosed quote)
 * 2. Trimming to the last complete element at depth ≤ 1
 * 3. Closing all unclosed braces/brackets
 */
function repairTruncatedJson(raw: string): unknown {
  // Walk to determine current parse state
  const stack: ('{' | '[')[] = []
  let inString = false
  let escaped  = false

  for (const c of raw) {
    if (escaped)              { escaped = false; continue }
    if (c === '\\' && inString) { escaped = true;  continue }
    if (c === '"')            { inString = !inString; continue }
    if (inString)             continue
    if (c === '{' || c === '[') stack.push(c)
    else if (c === '}' && stack[stack.length - 1] === '{') stack.pop()
    else if (c === ']' && stack[stack.length - 1] === '[') stack.pop()
  }

  const closers = (inString ? '"' : '') +
    [...stack].reverse().map(c => c === '{' ? '}' : ']').join('')

  // Try 1: just append closing tokens
  try { return JSON.parse(raw + closers) } catch { /* fall through */ }

  // Try 2: trim to the last complete element then close
  let depth = 0
  inString  = false
  escaped   = false
  let lastSafePos = 0

  for (let i = 0; i < raw.length; i++) {
    const c = raw[i]
    if (escaped)              { escaped = false; continue }
    if (c === '\\' && inString) { escaped = true;  continue }
    if (c === '"')            { inString = !inString; continue }
    if (inString)             continue
    if (c === '{' || c === '[') depth++
    else if (c === '}' || c === ']') {
      depth--
      if (depth <= 1) lastSafePos = i
    }
    if (c === ',' && depth <= 1) lastSafePos = i
  }

  if (lastSafePos > 0) {
    const trimmed = raw.slice(0, lastSafePos)
    // Recompute stack for trimmed version
    const s2: ('{' | '[')[] = []
    let inS = false; let esc = false
    for (const c of trimmed) {
      if (esc)             { esc = false;  continue }
      if (c === '\\' && inS) { esc = true;   continue }
      if (c === '"')       { inS = !inS;   continue }
      if (inS)             continue
      if (c === '{' || c === '[') s2.push(c)
      else if (c === '}' && s2[s2.length - 1] === '{') s2.pop()
      else if (c === ']' && s2[s2.length - 1] === '[') s2.pop()
    }
    const c2 = [...s2].reverse().map(c => c === '{' ? '}' : ']').join('')
    try { return JSON.parse(trimmed + c2) } catch { /* fall through */ }
  }

  throw new Error('JSON repair failed')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { layoutData } = body

    if (!layoutData) {
      return NextResponse.json({ error: 'No layout data provided' }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured' },
        { status: 500 }
      )
    }

    const userMessage = `Please analyse this room layout and provide a classical Feng Shui assessment:

${JSON.stringify(layoutData, null, 2)}

Remember: respond ONLY with the JSON object, no other text. Keep descriptions concise (max 15 words each).`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 16000,
      system: FENGSHUI_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }]
    })

    const stopReason   = message.stop_reason
    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Strip markdown code fences if present
    const cleaned = responseText.replace(/```json\n?|\n?```/g, '').trim()

    let analysis: unknown

    // Strategy 1 — clean parse
    try {
      analysis = JSON.parse(cleaned)
    } catch {
      // Strategy 2 — extract embedded JSON object
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          analysis = JSON.parse(jsonMatch[0])
        } catch {
          // Strategy 3 — repair truncated JSON (most likely cause: max_tokens hit)
          if (stopReason === 'max_tokens') {
            console.warn('Response truncated (max_tokens) — attempting JSON repair')
            try {
              analysis = repairTruncatedJson(jsonMatch[0])
            } catch { /* final catch below */ }
          }
        }
      }

      if (!analysis) {
        const preview = cleaned.slice(0, 300)
        throw new Error(
          `Claude response could not be parsed as JSON. Stop reason: ${stopReason}. Preview: ${preview}`
        )
      }
    }

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Feng Shui analysis error:', error)
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' },
      { status: 500 }
    )
  }
}
