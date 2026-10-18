import { useEffect, useRef, type CSSProperties } from 'react'


function norm(diff: number, total: number) {
  let r = ((diff % total) + total) % total
  if (r > total / 2) r -= total
  return r
}

type Motion = { className: string; style: CSSProperties }
const NONE: Motion = { className: '', style: {} }


export function useCarouselMotion(activeIndex: number, total: number) {
  const prev = useRef({ activeIndex, total, steps: 0 })
  const p = prev.current

  const step =
    total > 0 && p.total === total ? norm(activeIndex - p.activeIndex, total) : 0
  const steps = p.steps + (step !== 0 ? 1 : 0)

  useEffect(() => {
    prev.current = { activeIndex, total, steps }
  })

  return (trackIndex: number, offset: number): Motion => {
    if (step === 0) return NONE


    const prevOffset = norm(trackIndex - p.activeIndex, total)
    if (offset === prevOffset - step) return NONE

  
    return {
      className: `carousel-pop-${steps % 2}`,
      style: { transition: 'none' },
    }
  }
}
