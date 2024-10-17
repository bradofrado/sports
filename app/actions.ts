'use server'

import {
  generateReceiveCode as generateReceiveCodeServer,
  downloadTicket as downloadTicketServer,
} from '@/server/receive-code'

export const generateReceiveCode: typeof generateReceiveCodeServer = async (
  ...props
) => {
  return generateReceiveCodeServer(...props)
}

export const downloadTicket: typeof downloadTicketServer = async (...props) => {
  return downloadTicketServer(...props)
}
