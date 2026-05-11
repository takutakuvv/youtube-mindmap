'use client'

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'

const MindMap = dynamic(() => import('@/components/MindMap'), { ssr: false })

interface Comment {
  text: string
  likes: number
  author: string
}

interface HistoryItem {
  id: string
  url: string
  videoTitle: string
  thumbnail: string
  commentCount: number
  markdown: string
  topComments: Comment[]
  savedAt: string
}

type Step = 'idle' | 'fetching-comments' | 'generating-mindmap' | 'done' | 'error'

const HISTORY_KEY = 'youtube-mindmap-history'
const MAX_HISTORY = 30

function loadHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveToHistory(item: Omit<HistoryItem, 'id' | 'savedAt'>) {
  const history = loadHistory()
  const newItem: HistoryItem = {
    ...item,
    id: Date.now().toString(),
    savedAt: new Date().toISOString(),
  }
  const updated = [newItem, ...history].slice(0, MAX_HISTORY)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
  return updated
}

function deleteFromHistory(id: string): HistoryItem[] {
  const history = loadHistory().filter(h => h.id !== id)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  return history
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function Home() {
  const [url, setUrl] = useState('')
  const [step, setStep] = useState<Step>('idle')
  const [error, setError] = useState('')
  const [videoTitle, setVideoTitle] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [commentCount, setCommentCount] = useState(0)
  const [markdown, setMarkdown] = useState('')
  const [topComments, setTopComments] = useState<Comment[]>([])
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return

    setError('')
    setMarkdown('')
    setSavedId(null)
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
      const sorted = [...comments].sort((a: Comment, b: Comment) => b.likes - a.likes)
      setTopComments(sorted.slice(0, 3))

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
    setTopComments([])
    setSavedId(null)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  function handleSave() {
    const updated = saveToHistory({ url, videoTitle, thumbnail, commentCount, markdown, topComments })
    setHistory(updated)
    setSavedId(updated[0].id)
  }

  function handleLoadHistory(item: HistoryItem) {
    setUrl(item.url)
    setVideoTitle(item.videoTitle)
    setThumbnail(item.thumbnail)
    setCommentCount(item.commentCount)
    setMarkdown(item.markdown)
    setTopComments(item.topComments)
    setSavedId(item.id)
    setStep('done')
    setShowHistory(false)
  }

  function handleDeleteHistory(id: string) {
    const updated = deleteFromHistory(id)
    setHistory(updated)
    if (savedId === id) setSavedId(null)
  }

  const isLoading = step === 'fetching-comments' || step === 'generating-mindmap'
  const alreadySaved = savedId !== null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
      <header className="px-6 py-5 border-b border-slate-700/50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="36" height="28" rx="6" fill="#EF4444"/>
              <polygon points="8,30 18,30 9,39" fill="#EF4444"/>
              <rect x="9" y="10" width="22" height="3" rx="1.5" fill="white"/>
              <rect x="9" y="16" width="22" height="3" rx="1.5" fill="white"/>
              <rect x="9" y="22" width="16" height="3" rx="1.5" fill="white"/>
            </svg>
            <div>
              <h1 className="text-sm sm:text-base font-bold leading-tight">
                <span className="sm:hidden">コメントを一瞬で見える化</span>
                <span className="hidden sm:inline">YouTube動画の大量コメントを、一瞬で見える化</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(true)}
              className="relative flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span className="hidden sm:inline">履歴</span>
              {history.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {history.length}
                </span>
              )}
            </button>
            {step === 'done' && (
              <button
                onClick={handleReset}
                className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-700"
              >
                ← 最初に戻る
              </button>
            )}
          </div>
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

              {step === 'idle' && (
                <div className="mt-16 space-y-10 text-left">
                  <section>
                    <h2 className="text-lg font-bold text-white mb-3 border-b border-slate-700 pb-2">このツールについて</h2>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      YouTubeのコメント欄には、動画への感想・質問・意見・批評など、多様な声が集まります。しかし数百・数千件のコメントをすべて読むのは現実的ではありません。
                      このツールはAIが最大100件のコメントを自動で分析・分類し、マインドマップとして視覚的に整理します。視聴者の声の全体像を一瞬で把握できます。
                    </p>
                  </section>

                  <section>
                    <h2 className="text-lg font-bold text-white mb-3 border-b border-slate-700 pb-2">使い方</h2>
                    <ol className="space-y-3">
                      {[
                        'YouTubeで気になる動画を開く',
                        'ブラウザのアドレスバーからURLをコピーする',
                        '上の入力欄にURLを貼り付けて「分析・生成」を押す',
                        'AIがコメントを自動分析し、マインドマップを表示する',
                      ].map((s, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                          <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                          {s}
                        </li>
                      ))}
                    </ol>
                  </section>

                  <section>
                    <h2 className="text-lg font-bold text-white mb-3 border-b border-slate-700 pb-2">活用例</h2>
                    <ul className="space-y-2">
                      {[
                        '商品レビュー動画のコメントから購入者の評判を把握する',
                        'ニュース・解説動画のコメントから視聴者の関心事を分析する',
                        '自分の動画のコメントを整理してファンの声を可視化する',
                        '競合チャンネルの反応を調査するマーケティングリサーチ',
                      ].map((ex, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                          <span className="text-red-400 mt-0.5">›</span>
                          {ex}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-lg font-bold text-white mb-3 border-b border-slate-700 pb-2">もっと詳しく知る</h2>
                    <div className="space-y-4">
                      {[
                        { q: '無料で使えますか？', a: 'はい、完全無料でご利用いただけます。' },
                        { q: 'どんな動画でも使えますか？', a: 'コメント欄が公開されているYouTube動画であれば利用できます。コメントが無効になっている動画は分析できません。' },
                        { q: 'マインドマップはどう操作しますか？', a: 'ドラッグで移動、スクロールでズーム、ノードをクリックで折りたたみができます。' },
                      ].map(({ q, a }, i) => (
                        <div key={i} className="bg-slate-800/50 rounded-xl p-4">
                          <p className="text-sm font-semibold text-white mb-1">Q. {q}</p>
                          <p className="text-sm text-slate-400">A. {a}</p>
                        </div>
                      ))}
                    </div>
                  </section>
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
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{videoTitle}</p>
                  <p className="text-xs text-slate-400">{commentCount}件のコメントを分析</p>
                </div>
                <button
                  onClick={alreadySaved ? undefined : handleSave}
                  disabled={alreadySaved}
                  className={`flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    alreadySaved
                      ? 'bg-green-500/20 text-green-400 cursor-default'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                  }`}
                >
                  {alreadySaved ? '✓ 保存済み' : '保存する'}
                </button>
              </div>
            </div>

            {topComments.length > 0 && (
              <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700/50">
                <div className="max-w-screen-xl mx-auto">
                  <p className="text-xs font-bold text-slate-400 mb-3">👍 いいね数 TOP3</p>
                  <div className="space-y-2">
                    {topComments.map((c, i) => (
                      <div key={i} className="flex items-start gap-3 bg-slate-700/40 rounded-xl px-4 py-3">
                        <span className="text-base font-bold text-red-400 flex-shrink-0 w-5">{i + 1}</span>
                        <p className="text-sm text-slate-200 leading-relaxed flex-1 line-clamp-2">{c.text}</p>
                        <span className="text-xs text-slate-400 flex-shrink-0 flex items-center gap-1">
                          👍 {c.likes.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white flex-1 min-h-0" style={{ minHeight: '300px' }}>
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

      {/* 履歴パネル */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center sm:justify-end">
          <div className="bg-slate-900 border border-slate-700 w-full sm:w-96 sm:h-full sm:rounded-none rounded-t-2xl flex flex-col max-h-[85vh] sm:max-h-full">
            <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between flex-shrink-0">
              <h2 className="font-bold text-white">保存済みの履歴 ({history.length}件)</h2>
              <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-sm">
                  <svg className="w-10 h-10 mb-3 opacity-40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  保存された履歴はありません
                </div>
              ) : (
                <ul className="divide-y divide-slate-800">
                  {history.map(item => (
                    <li key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 group">
                      <button className="flex items-center gap-3 flex-1 min-w-0 text-left" onClick={() => handleLoadHistory(item)}>
                        {item.thumbnail && (
                          <img src={item.thumbnail} alt="" className="w-14 h-10 object-cover rounded-lg flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm text-white font-medium truncate">{item.videoTitle}</p>
                          <p className="text-xs text-slate-500">{formatDate(item.savedAt)}</p>
                        </div>
                      </button>
                      <button
                        onClick={() => handleDeleteHistory(item.id)}
                        className="flex-shrink-0 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
