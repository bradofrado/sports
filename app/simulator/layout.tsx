import { conferences } from '@/lib/games-info'
import Link from 'next/link'

export default function SimulatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className='p-4 space-x-2'>
        {conferences.map(({ name, title }) => (
          <Link
            key={name}
            className='p-2 rounded-md bg-background hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50'
            href={{ query: { conference: name } }}
          >
            {title}
          </Link>
        ))}
      </div>
      {children}
    </>
  )
}
