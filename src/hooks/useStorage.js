import { useState } from 'react'

export function useStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : defaultValue
    } catch { return defaultValue }
  })

  const set = (val) => {
    const next = typeof val === 'function' ? val(value) : val
    setValue(next)
    try { localStorage.setItem(key, JSON.stringify(next)) } catch {}
  }

  return [value, set]
}