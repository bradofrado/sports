import { downloadTicket, generateReceiveCode } from './actions'
import { TransferForm } from './transfer-form'

export default function Home() {
  return (
    <main className='flex flex-col min-h-[100dvh] bg-background px-4 py-12 sm:px-6 lg:px-8'>
      <div className='flex flex-col items-center flex-1 mt-20'>
        <h1 className='text-center text-4xl'>BYU Ticket Transfer</h1>
        <div className='mt-4'>
          <TransferForm
            generateReceiveCode={generateReceiveCode}
            downloadTicket={downloadTicket}
          />
        </div>
      </div>
    </main>
  )
}
