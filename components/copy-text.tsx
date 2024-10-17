'use client'

import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

interface CopyTextProps {
  text: string
  className?: string
}
export const CopyText: React.FunctionComponent<CopyTextProps> = ({
  className,
  text,
}) => {
  const [copied, setCopied] = useState(false)
  const [copiedText, setCopiedText] = useState('')
  useEffect(() => {
    if (text !== copiedText) {
      setCopied(false)
    }
  }, [text, copiedText])

  const copyText = () => {
    void navigator.clipboard.writeText(text)
    setCopied(true)
    setCopiedText(text)
  }
  return (
    <button
      type='button'
      className={cn(
        '[--is-toggle-tooltip:false] hs-tooltip relative py-1.5 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-mono rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800',
        className
      )}
      onClick={copyText}
    >
      <span className='overflow-hidden whitespace-nowrap'>{text}</span>
      <span className='border-s ps-3.5 dark:border-neutral-700'>
        {!copied ? (
          <svg
            className='size-4 group-hover:rotate-6 transition'
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            stroke-width='2'
            stroke-linecap='round'
            stroke-linejoin='round'
          >
            <rect width='8' height='4' x='8' y='2' rx='1' ry='1'></rect>
            <path d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'></path>
          </svg>
        ) : (
          <svg
            className='size-4 text-blue-600 rotate-6'
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            stroke-width='2'
            stroke-linecap='round'
            stroke-linejoin='round'
          >
            <polyline points='20 6 9 17 4 12'></polyline>
          </svg>
        )}
      </span>
    </button>
  )
}
