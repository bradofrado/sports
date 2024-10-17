import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { downloadTicket, generateReceiveCode } from '../../app/actions'
import { SendForm } from './send-form'
import { ReceiveForm } from './receive-form'

export const TransferForm: React.FunctionComponent<{
  generateReceiveCode: typeof generateReceiveCode
  downloadTicket: typeof downloadTicket
}> = ({ generateReceiveCode, downloadTicket }) => {
  return (
    <Tabs defaultValue='account' className='max-w-[400px]'>
      <TabsList className='grid w-full grid-cols-2'>
        <TabsTrigger value='account'>Send</TabsTrigger>
        <TabsTrigger value='password'>Receive</TabsTrigger>
      </TabsList>
      <TabsContent value='account'>
        <SendForm generateReceiveCode={generateReceiveCode} />
      </TabsContent>
      <TabsContent value='password'>
        <ReceiveForm downloadTicket={downloadTicket} />
      </TabsContent>
    </Tabs>
  )
}
