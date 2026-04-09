import { useEffect, useState } from 'react'

export function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    let raf = 0
    let start: number | null = null
    const tick = (time: number) => {
      if (!start) start = time
      const progress = Math.min((time - start) / duration, 1)
      setValue(Math.round(target * progress))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return value
}
