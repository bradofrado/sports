import { GameInfo } from '@/lib/season-info'

const globalThisForApp = globalThis as unknown as {
  sendCodes: { authToken: string; sendCode: string; game: GameInfo }[]
}
const sendCodes = globalThisForApp.sendCodes ?? []
if (!globalThisForApp.sendCodes) globalThisForApp.sendCodes = sendCodes

export const generateReceiveCode = async (
  authToken: string,
  game: GameInfo
): Promise<string> => {
  const alreadyGenerated = sendCodes.find(
    (sc) =>
      sc.authToken === authToken &&
      sc.game.gameId === game.gameId &&
      sc.game.seasonId === game.seasonId
  )
  if (alreadyGenerated) return alreadyGenerated.sendCode

  const sendCode = Math.random().toString(36).substring(2, 8)
  sendCodes.push({ authToken, sendCode, game })
  return sendCode
}

export const downloadTicket = async (code: string): Promise<string> => {
  const sentCode = sendCodes.find((sc) => sc.sendCode === code)
  if (!sentCode) {
    throw new Error('Invalid code')
  }

  return getDownloadUrl(sentCode.authToken, sentCode.game)
}

async function getDownloadUrl(authToken: string, game: GameInfo) {
  const headers = { 'pac-authz': authToken }
  async function events() {
    const response = await fetch(
      `https://byutickets.evenue.net/pac-api/orderhistory-event/${game.seasonId}/${game.gameId}`,
      { headers }
    )
    const json = await response.json()
    return {
      seasonCd: json.events[0].seasonCd,
      eventCd: json.events[0].eventCd,
      transferSeatId: json.events[0].seats[0].transferSeatId,
      barcode: json.events[0].seats[0].barcode,
    }
  }

  async function accounts() {
    const response = await fetch(
      'https://byutickets.evenue.net/pac-api/accounts',
      { headers }
    )
    const json = await response.json()
    return {
      patronId: json.key.id,
      dataAccountId: json.dataAccountId,
    }
  }

  async function createRequest() {
    const eventStuff = await events()
    const accountStuff = await accounts()
    const rawRequest = { ...eventStuff, ...accountStuff }

    return {
      ticketInfo: {
        season: rawRequest.seasonCd,
        event: rawRequest.eventCd,
        seat: {
          level: rawRequest.transferSeatId.split('^')[2].split(':')[0],
          section: rawRequest.transferSeatId.split('^')[2].split(':')[1],
          row: rawRequest.transferSeatId.split('^')[3],
          seat: rawRequest.transferSeatId.split('^')[4],
        },
        patronId: rawRequest.patronId,
        dataAccountId: rawRequest.dataAccountId,
        barcode: rawRequest.barcode,
        generateVas: true,
        passType: 'apple',
      },
    }
  }

  async function getPass(req: Awaited<ReturnType<typeof createRequest>>) {
    const response = await fetch(
      'https://byutickets.evenue.net/pac-api/mobile-pass',
      {
        method: 'POST',
        body: JSON.stringify(req),
        headers: { ...headers, 'Content-Type': 'application/json' },
      }
    )
    const json = await response.json()
    return json.applePassUrl
  }
  async function run() {
    const req = await createRequest()
    const url = await getPass(req)
    return url
  }

  return run()
}
