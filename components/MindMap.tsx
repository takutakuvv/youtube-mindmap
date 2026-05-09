'use client'

import { useEffect, useRef } from 'react'
import { Transformer } from 'markmap-lib'
import { Markmap } from 'markmap-view'

interface MindMapProps {
  markdown: string
}

const transformer = new Transformer()

export default function MindMap({ markdown }: MindMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const mmRef = useRef<Markmap | null>(null)

  useEffect(() => {
    if (!svgRef.current) return
    if (!mmRef.current) {
      mmRef.current = Markmap.create(svgRef.current, {
        maxWidth: 260,
        duration: 300,
      })
    }
    const { root } = transformer.transform(markdown)
    mmRef.current.setData(root)
    mmRef.current.fit()
  }, [markdown])

  // ウィンドウリサイズ時に再フィット
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      mmRef.current?.fit()
    })
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  )
}
