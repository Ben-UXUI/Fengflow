import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'
import { FENGSHUI_SYSTEM_PROMPT } from '@/lib/feng-shui-prompt'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

function repairTruncatedJson(raw: string): unknown {
  const stack: ('{' | '[')[] = []
  let inString = false
  let escaped  = false

  for (const c of raw) {
    if (escaped)               { escaped = false; continue }
    if (c === '\\' && inString) { escaped = true;  continue }
    if (c === '"')             { inString = !inString; continue }
    if (inString)              continue
    if (c === '{' || c === '[') stack.push(c)
    else if (c === '}' && stack[stack.length - 1] === '{') stack.pop()
    else if (c === ']' && stack[stack.length - 1] === '[') stack.pop()
  }

  const closers = (inString ? '"' : '') +
    [...stack].reverse().map(c => c === '{' ? '}' : ']').join('')

  try { return JSON.parse(raw + closers) } catch { /* fall through */ }

  let depth = 0
  inString  = false
  escaped   = false
  let lastSafePos = 0

  for (let i = 0; i < raw.length; i++) {
    const c = raw[i]
    if (escaped)               { escaped = false; continue }
    if (c === '\\' && inString) { escaped = true;  continue }
    if (c === '"')             { inString = !inString; continue }
    if (inString)              continue
    if (c === '{' || c === '[') depth++
    else if (c === '}' || c === ']') {
      depth--
      if (depth <= 1) lastSafePos = i
    }
    if (c === ',' && depth <= 1) lastSafePos = i
  }

  if (lastSafePos > 0) {
    const trimmed = raw.slice(0, lastSafePos)
    const s2: ('{' | '[')[] = []
    let inS = false; let esc = false
    for (const c of trimmed) {
      if (esc)              { esc = false;  continue }
      if (c === '\\' && inS) { esc = true;   continue }
      if (c === '"')        { inS = !inS;   continue }
      if (inS)              continue
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
      return new Response(JSON.stringify({ error: 'No layout data provided' }), { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured' }), { status: 500 })
    }

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const anthropicStream = client.messages.stream({
            model: 'claude-sonnet-4-5',
            max_tokens: 3000,
            system: FENGSHUI_SYSTEM_PROMPT,
            messages: [{
              role: 'user',
              content: `Analyse this room layout. Respond ONLY with valid JSON. Be concise — maximum 2 sentences per description field. Keep recommendations to 4 maximum. Keep zone analysis notes to 1 sentence each:\n\n${JSON.stringify(layoutData, null, 2)}`
            }]
          })

          let fullText = ''

          for await (const chunk of anthropicStream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              fullText += chunk.delta.text
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ partial: chunk.delta.text })}\n\n`))
            }
          }

          const cleaned = fullText.replace(/```json\n?|\n?```/g, '').trim()

          let analysis: unknown
          try {
            analysis = JSON.parse(cleaned)
          } catch {
            const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              try {
                analysis = JSON.parse(jsonMatch[0])
              } catch {
                analysis = repairTruncatedJson(jsonMatch[0])
              }
            } else {
              analysis = repairTruncatedJson(cleaned)
            }
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, analysis })}\n\n`))
        } catch (error) {
          console.error('Streaming analysis error:', error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Analysis failed. Please try again.' })}\n\n`))
        } finally {
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    })
  } catch (error) {
    console.error('Request error:', error)
    return new Response(JSON.stringify({ error: 'Failed to process request' }), { status: 500 })
  }
}
