import { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 300

async function streamProgress(message: string, controller: ReadableStreamDefaultController) {
  const data = `data: ${JSON.stringify({ progress: message })}\n\n`
  controller.enqueue(new TextEncoder().encode(data))
}

async function streamError(message: string, controller: ReadableStreamDefaultController) {
  const data = `data: ${JSON.stringify({ error: message })}\n\n`
  controller.enqueue(new TextEncoder().encode(data))
}

async function streamOutput(url: string, controller: ReadableStreamDefaultController) {
  const data = `data: ${JSON.stringify({ output: url })}\n\n`
  controller.enqueue(new TextEncoder().encode(data))
}

export async function POST(request: NextRequest) {
  const { videoUrl } = await request.json()

  if (!videoUrl) {
    return new Response(JSON.stringify({ error: 'Video URL is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        await streamProgress('Starting video processing...', controller)

        // Simulate processing steps
        await new Promise(resolve => setTimeout(resolve, 1000))
        await streamProgress('Downloading video...', controller)

        await new Promise(resolve => setTimeout(resolve, 1500))
        await streamProgress('Extracting audio from video...', controller)

        await new Promise(resolve => setTimeout(resolve, 2000))
        await streamProgress('Transcribing audio to text...', controller)

        await new Promise(resolve => setTimeout(resolve, 2500))
        await streamProgress('Translating text to French...', controller)

        await new Promise(resolve => setTimeout(resolve, 2000))
        await streamProgress('Generating French voice dubbing with ElevenLabs...', controller)

        await new Promise(resolve => setTimeout(resolve, 1500))
        await streamProgress('Detecting and removing English subtitles...', controller)

        await new Promise(resolve => setTimeout(resolve, 2000))
        await streamProgress('Generating French subtitles...', controller)

        await new Promise(resolve => setTimeout(resolve, 2500))
        await streamProgress('Combining video with French audio and subtitles...', controller)

        await new Promise(resolve => setTimeout(resolve, 1000))
        await streamProgress('Finalizing output...', controller)

        await new Promise(resolve => setTimeout(resolve, 500))
        await streamProgress('✅ Processing complete!', controller)

        // In a real implementation, this would be the actual processed video URL
        await streamOutput('/api/demo-output', controller)

      } catch (error) {
        await streamError(error instanceof Error ? error.message : 'Processing failed', controller)
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
