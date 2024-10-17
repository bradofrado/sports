'use server'

import {
  generateReceiveCode as generateReceiveCodeServer,
  downloadTicket as downloadTicketServer,
} from '@/server/receive-code'

export const generateReceiveCode = async (
  authToken: string
): Promise<string> => {
  return generateReceiveCodeServer(authToken)
}

export const downloadTicket = async (code: string): Promise<string> => {
  return downloadTicketServer(code)
}
