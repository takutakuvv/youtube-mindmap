'use client'

import { useState, useRef } from 'react'
import dynamic from 'next/dynamic'

const MindMap = dynamic(() => import('@/components/MindMap'), { ssr: false })

interface Comment {
  text: string
  likes: number
  author: string
}

type Step = 'idle' | 'fetching-comments' | 'generating-mindmap' | 'done' | 'error'

export default function Home() {
  const [url, setUrl] = useState('')
  const [step, setStep] = useState<Step>('idle')
  const [error, setError] = useState('')
  const [videoTitle, setVideoTitle] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [commentCount, setCommentCount] = useState(0)
  const [markdown, setMarkdown] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return

    setError('')
    setMarkdown('')
    setStep('fetching-comments')

    try {
      const commentsRes = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const commentsData = await commentsRes.json()
      if (!commentsRes.ok) throw new Error(commentsData.error)

      const { videoTitle, thumbnail, comments } = commentsData
      setVideoTitle(videoTitle)
      setThumbnail(thumbnail)
      setCommentCount(comments.length)

      setStep('generating-mindmap')

      const mindmapRes = await fetch('/api/mindmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoTitle, comments }),
      })
      const mindmapData = await mindmapRes.json()
      if (!mindmapRes.ok) throw new Error(mindmapData.error)

      setMarkdown(mindmapData.markdown)
      setStep('done')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました')
      setStep('error')
    }
  }

  function handleReset() {
    setUrl('')
    setStep('idle')
    setError('')
    setMarkdown('')
    setVideoTitle('')
    setThumbnail('')
    setCommentCount(0)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const isLoading = step === 'fetching-comments' || step === 'generating-mindmap'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
      <header className="px-6 py-5 border-b border-slate-700/50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* 吹き出し＋再生ボタンのオリジナルアイコン */}
            <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* 吹き出し本体 */}
              <rect x="2" y="2" width="36" height="28" rx="6" fill="#EF4444"/>
              {/* 吹き出しの尻尾 */}
              <polygon points="10,30 18,30 10,38" fill="#EF4444"/>
              {/* 再生ボタン（三角形） */}
              <polygon points="15,12 15,22 27,17" fill="white"/>
            </svg>
            <div>
              <h1 className="text-base font-bold leading-tight">YouTube動画の大量コメントを、一瞬で見える化</h1>
            </div>
          </div>
          {step === 'done' && (
            <button
              onClick={handleReset}
              className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-700"
            >
              ← 最初に戻る
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {step !== 'done' && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
            <div className="w-full max-w-2xl">
              <div className="text-center mb-10">
                <p className="text-2xl font-bold text-white drop-shadow-lg">
                  YouTubeのURLを貼り付けるだけで、<br />コメントを自動で分析し、マインドマップを作成します。
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  ref={inputRef}
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  disabled={isLoading}
                  className="w-full px-5 py-4 bg-slate-800 border border-slate-600 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all text-sm disabled:opacity-50"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isLoading || !url.trim()}
                  className="w-full py-4 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 rounded-2xl font-bold text-lg tracking-wide shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      {step === 'fetching-comments' ? 'コメントを取得中...' : 'AIが分析中...'}
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"/>
                      </svg>
                      分析・生成
                    </>
                  )}
                </button>
              </form>

              {isLoading && (
                <div className="mt-8 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${step === 'fetching-comments' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}>
                      {step === 'fetching-comments' ? '1' : '✓'}
                    </div>
                    <span className={`text-sm ${step === 'fetching-comments' ? 'text-white' : 'text-green-400'}`}>
                      YouTubeコメントを取得
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${step === 'generating-mindmap' ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`}>
                      2
                    </div>
                    <span className={`text-sm ${step === 'generating-mindmap' ? 'text-white' : 'text-slate-500'}`}>
                      AIがコメントを分析・分類
                    </span>
                  </div>
                </div>
              )}

              {step === 'error' && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <p className="text-red-400 text-sm">エラー: {error}</p>
                </div>
              )}

              {step === 'idle' && (
                <div className="mt-10 text-center">
                  <p className="text-slate-500 text-xs mb-3">対応URLの例</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['youtube.com/watch?v=...', 'youtu.be/...', 'youtube.com/shorts/...'].map((ex) => (
                      <span key={ex} className="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-full border border-slate-700">
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'done' && markdown && (
          <div className="flex-1 flex flex-col">
            <div className="px-6 py-3 border-b border-slate-700/50 bg-slate-800/50">
              <div className="max-w-screen-xl mx-auto flex items-center gap-4">
                {thumbnail && (
                  <img src={thumbnail} alt="" className="w-16 h-12 object-cover rounded-lg flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{videoTitle}</p>
                  <p className="text-xs text-slate-400">{commentCount}件のコメントを分析</p>
                </div>
              </div>
            </div>

            <div className="bg-white" style={{ height: 'calc(100dvh - 120px)', minHeight: '400px' }}>
              <MindMap markdown={markdown} />
            </div>

            <div className="px-6 py-2 text-center border-t border-slate-700/50 bg-slate-900/80">
              <p className="text-xs text-slate-500">
                ドラッグでパン・スクロールでズーム・ノードをクリックで折りたたみ
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
