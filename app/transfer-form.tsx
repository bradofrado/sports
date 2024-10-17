'use client'

import { CopyText } from '@/components/copy-text'
import { Button } from '@/components/ui/button'
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { downloadTicket, generateReceiveCode } from './actions'
import { useState } from 'react'
import { downloadURI } from '@/lib/utils'

export const TransferForm: React.FunctionComponent<{
  generateReceiveCode: typeof generateReceiveCode
  downloadTicket: typeof downloadTicket
}> = ({ generateReceiveCode, downloadTicket }) => {
  return (
    <Tabs defaultValue='account' className='w-[400px]'>
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

const SendForm: React.FunctionComponent<{
  generateReceiveCode: typeof generateReceiveCode
}> = ({ generateReceiveCode }) => {
  const [token, setToken] = useState('')
  const [sendCode, setSendCode] = useState('')
  const [error, setError] = useState('')

  const onSend = async () => {
    if (!token) return
    try {
      const code = await generateReceiveCode(token)
      setSendCode(code)
    } catch (err) {
      console.error(err)
      setSendCode('')
      setError('There was an error sending the ticket')
    }
  }
  return (
    <>
      <CardHeader>
        <CardTitle>Send Ticket</CardTitle>
        <CardDescription>
          In order to send a ticket, you must have the <code>pac-authz</code>{' '}
          authentication token from your byu tickets account.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-2'>
        <div className='space-y-1'>
          <Label htmlFor='token'>pac-authz token</Label>
          <Input
            id='token'
            placeholder='abcde-1234-5678-fghij'
            onChange={(e) => setToken(e.target.value)}
          />
        </div>
      </CardContent>
      {sendCode ? (
        <CardContent>
          <div className='space-y-1 flex flex-col'>
            <Label>Your receive code:</Label>
            <p className='text-sm text-gray-600'>
              Give this code to the recipient.
            </p>
            <CopyText text={sendCode} />
          </div>
        </CardContent>
      ) : null}
      {error ? (
        <CardContent>
          <p className='text-red-500 text-sm'>{error}</p>
        </CardContent>
      ) : null}
      <CardFooter>
        <Button onClick={onSend}>Send</Button>
      </CardFooter>
    </>
  )
}

const ReceiveForm: React.FunctionComponent<{
  downloadTicket: typeof downloadTicket
}> = ({ downloadTicket }) => {
  const [receiveCode, setReceiveCode] = useState('')
  const [error, setError] = useState('')

  const onDownload = async () => {
    try {
      const code = await downloadTicket(receiveCode)
      downloadURI(code, 'Apple Wallet Ticket')
    } catch (err) {
      console.error(err)
      setError('There was an error downloading the ticket')
    }
  }
  return (
    <>
      <CardHeader>
        <CardTitle>Receive Ticket</CardTitle>
        <CardDescription>
          Enter in the receive code from the sender to receive the ticket.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-2'>
        <div className='space-y-1'>
          <Label htmlFor='code'>Receive Code</Label>
          <Input id='code' onChange={(e) => setReceiveCode(e.target.value)} />
        </div>
        {error ? <p className='text-red-500 text-sm'>{error}</p> : null}
      </CardContent>
      <CardFooter>
        <Button onClick={onDownload}>Download Ticket</Button>
      </CardFooter>
    </>
  )
}
