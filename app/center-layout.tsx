export const CenterLayout: React.FunctionComponent<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <main className='flex flex-col min-h-[100dvh] bg-background px-4 py-12 sm:px-6 lg:px-8'>
      <div className='flex flex-col items-center flex-1 mt-20'>{children}</div>
    </main>
  )
}
