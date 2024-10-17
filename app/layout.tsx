import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryStateProvider } from '@/hooks/query-state'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'BYU Ticket Transfer',
  description: 'Transfer your BYU tickets with ease',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <TooltipProvider>
      <QueryStateProvider>
        <html lang='en'>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            {children}
          </body>
        </html>
      </QueryStateProvider>
    </TooltipProvider>
  )
}
