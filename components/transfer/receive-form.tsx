'use client'

import { downloadTicket } from '@/app/actions'
import { downloadURI } from '@/lib/utils'
import { useState } from 'react'
import { Button } from '../ui/button'
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../ui/card'
import { Label } from '../ui/label'
import { Input } from '../ui/input'

export const ReceiveForm: React.FunctionComponent<{
  downloadTicket: typeof downloadTicket
}> = ({ downloadTicket }) => {
  const [receiveCode, setReceiveCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onDownload = async () => {
    if (!receiveCode) return
    setLoading(true)
    try {
      const code = await downloadTicket(receiveCode)
      downloadURI(code, 'Apple Wallet Ticket')
    } catch (err) {
      console.error(err)
      setError('There was an error downloading the ticket')
    } finally {
      setLoading(false)
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
          <Input id='code' onChange={setReceiveCode} />
        </div>
        {error ? <p className='text-red-500 text-sm'>{error}</p> : null}
      </CardContent>
      <CardFooter>
        <Button onClick={onDownload} loading={loading}>
          Download Ticket
        </Button>
      </CardFooter>
    </>
  )
}
