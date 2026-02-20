import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { FENGSHUI_SYSTEM_PROMPT } from '@/lib/feng-shui-prompt'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

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

Remember: respond ONLY with the JSON object, no other text.`

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      system: FENGSHUI_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }]
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    
    // Parse the JSON response
    const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim()
    const analysis = JSON.parse(cleanedResponse)

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Feng Shui analysis error:', error)
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' },
      { status: 500 }
    )
  }
}
