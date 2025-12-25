'use client'

import { useState } from 'react'

export default function Home() {
  const [videoUrl, setVideoUrl] = useState('')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState<string[]>([])
  const [outputUrl, setOutputUrl] = useState('')
  const [error, setError] = useState('')

  const processVideo = async () => {
    if (!videoUrl) {
      setError('Please enter a video URL')
      return
    }

    setProcessing(true)
    setProgress([])
    setOutputUrl('')
    setError('')

    try {
      const response = await fetch('/api/process-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl }),
      })

      if (!response.ok) {
        throw new Error('Processing failed')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))
            if (data.progress) {
              setProgress(prev => [...prev, data.progress])
            }
            if (data.output) {
              setOutputUrl(data.output)
            }
            if (data.error) {
              setError(data.error)
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-center">AI Video Dubbing</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          Automatically dub videos to French with AI-generated voice and subtitles
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Video URL
            </label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://example.com/video.mp4"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
              disabled={processing}
            />
          </div>

          <button
            onClick={processVideo}
            disabled={processing}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {processing ? 'Processing...' : 'Process Video'}
          </button>
        </div>

        {progress.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Progress</h2>
            <div className="space-y-2">
              {progress.map((step, index) => (
                <div key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-sm">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {outputUrl && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Result</h2>
            <video
              src={outputUrl}
              controls
              className="w-full rounded-lg mb-4"
            />
            <a
              href={outputUrl}
              download
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Download Video
            </a>
          </div>
        )}

        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="font-semibold mb-2">Processing Steps:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>Extract original audio from video</li>
            <li>Transcribe audio to text</li>
            <li>Translate text to French</li>
            <li>Generate French voice dubbing</li>
            <li>Remove existing English subtitles</li>
            <li>Generate French subtitles</li>
            <li>Combine video with French audio and subtitles</li>
          </ol>
        </div>
      </div>
    </main>
  )
}
