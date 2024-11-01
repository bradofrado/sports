import { downloadTicket, generateReceiveCode } from '../actions'
import { TransferForm } from '../../components/transfer/transfer-form'
import { CenterLayout } from '../center-layout'

export default function Home({
  searchParams,
}: {
  searchParams?: { tab?: string }
}) {
  const tab = searchParams?.tab ?? 'send'
  return (
    <CenterLayout>
      <h1 className='text-center text-4xl'>BYU Ticket Transfer</h1>
      <div className='mt-4'>
        <TransferForm
          tabValue={tab}
          generateReceiveCode={generateReceiveCode}
          downloadTicket={downloadTicket}
        />
      </div>
    </CenterLayout>
  )
}
