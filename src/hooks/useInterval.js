import { useEffect, useRef } from 'react'

// Standard "Dan Abramov" style interval hook -- keeps the latest callback
// without resetting the timer on every render.
export function useInterval(callback, delayMs) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delayMs === null) return
    const id = setInterval(() => savedCallback.current(), delayMs)
    return () => clearInterval(id)
  }, [delayMs])
}
