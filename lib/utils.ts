import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function downloadURI(uri: string, name: string) {
  const link = document.createElement('a')
  link.download = name
  link.href = uri
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const encodeState = <T>(state: T): string => {
  if (typeof state === 'string') {
    return state
  }

  return JSON.stringify(state)
}

export const decodeState = <T>(state: string): T => {
  try {
    return JSON.parse(state) as T
  } catch {
    //If it fails to parse, then it is probably a string
    return state as T
  }
}
