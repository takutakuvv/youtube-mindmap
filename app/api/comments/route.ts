import { NextRequest, NextResponse } from 'next/server'

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
    /(?:youtu\.be\/)([^&\n?#]+)/,
    /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
    /(?:youtube\.com\/shorts\/)([^&\n?#]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export async function POST(req: NextRequest) {
  const { url } = await req.json()

  const videoId = extractVideoId(url)
  if (!videoId) {
    return NextResponse.json({ error: '無効なYouTube URLです' }, { status: 400 })
  }

  const apiKey = process.env.YOUTUBE_API_KEY

  const videoRes = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
  )
  const videoData = await videoRes.json()

  if (!videoData.items?.length) {
    return NextResponse.json({ error: '動画が見つかりません' }, { status: 404 })
  }

  const videoTitle = videoData.items[0].snippet.title
  const thumbnail = videoData.items[0].snippet.thumbnails?.medium?.url

  const commentsRes = await fetch(
    `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=100&order=relevance&key=${apiKey}`
  )
  const commentsData = await commentsRes.json()

  if (commentsData.error) {
    const msg = commentsData.error.message || 'コメントの取得に失敗しました'
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  const comments = (commentsData.items || []).map((item: any) => ({
    text: item.snippet.topLevelComment.snippet.textDisplay,
    likes: item.snippet.topLevelComment.snippet.likeCount,
    author: item.snippet.topLevelComment.snippet.authorDisplayName,
  }))

  return NextResponse.json({ videoTitle, thumbnail, comments, videoId })
}
