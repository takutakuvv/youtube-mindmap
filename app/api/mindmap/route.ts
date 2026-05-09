import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  const { videoTitle, comments } = await req.json()

  const commentsText = comments
    .slice(0, 80)
    .map((c: { text: string; likes: number; author: string }, i: number) =>
      `${i + 1}. [👍${c.likes}] ${c.text}`
    )
    .join('\n')

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `以下はYouTube動画「${videoTitle}」のコメントです。
これらのコメントを分析し、マインドマップ用のMarkdown形式で整理してください。

出力ルール:
- 1行目: # ${videoTitle}
- コメントを5〜8個の意味あるカテゴリに分類（例: 感想・評価、質問・疑問、情報・補足、批判・改善点、共感・体験談 など）
- 各カテゴリに代表的なコメントや要約を3〜5個の箇条書きで含める
- コメントは要約・言い換えしてOK（長すぎる場合は短く）
- 日本語で出力
- Markdownのみ出力（前置き・説明文は不要）

コメント一覧:
${commentsText}`,
      },
    ],
  })

  const markdown =
    message.content[0].type === 'text' ? message.content[0].text : ''

  return NextResponse.json({ markdown })
}
