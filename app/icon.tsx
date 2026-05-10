import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          {/* 吹き出し本体 */}
          <rect x="2" y="2" width="28" height="22" rx="5" fill="#EF4444"/>
          {/* 吹き出しの尻尾 */}
          <polygon points="6,24 14,24 7,31" fill="#EF4444"/>
          {/* 横棒1本目 */}
          <rect x="7" y="8" width="18" height="2.5" rx="1.25" fill="white"/>
          {/* 横棒2本目 */}
          <rect x="7" y="13" width="18" height="2.5" rx="1.25" fill="white"/>
          {/* 横棒3本目 */}
          <rect x="7" y="18" width="13" height="2.5" rx="1.25" fill="white"/>
        </svg>
      </div>
    ),
    { ...size }
  )
}
