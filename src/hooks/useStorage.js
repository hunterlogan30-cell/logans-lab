import { useState, useEffect } from 'react'

export function useStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored !== null) return JSON.parse(stored)
      // Save default immediately so it persists
      localStorage.setItem(key, JSON.stringify(defaultValue))
      return defaultValue
    } catch {
      return defaultValue
    }
  })

  const set = (val) => {
    const next = typeof val === 'function' ? val(value) : val
    setValue(next)
    try {
      localStorage.setItem(key, JSON.stringify(next))
    } catch (e) {
      console.error('Storage write failed:', e)
    }
  }

  return [value, set]
}