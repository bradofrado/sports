import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { downloadTicket, generateReceiveCode } from '../../app/actions'
import { SendForm } from './send-form'
import { ReceiveForm } from './receive-form'

export const TransferForm: React.FunctionComponent<{
  generateReceiveCode: typeof generateReceiveCode
  downloadTicket: typeof downloadTicket
  tabValue: string
}> = ({ generateReceiveCode, downloadTicket, tabValue }) => {
  return (
    <Tabs defaultValue={tabValue} className='max-w-[400px]'>
      <TabsList className='grid w-full grid-cols-2'>
        <TabsTrigger value='send'>Send</TabsTrigger>
        <TabsTrigger value='receive'>Receive</TabsTrigger>
      </TabsList>
      <TabsContent value='send'>
        <SendForm generateReceiveCode={generateReceiveCode} />
      </TabsContent>
      <TabsContent value='receive'>
        <ReceiveForm downloadTicket={downloadTicket} />
      </TabsContent>
    </Tabs>
  )
}
