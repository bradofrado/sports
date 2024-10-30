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
  try {
    const sentCode = sendCodes.find((sc) => sc.sendCode === code)
    if (!sentCode) {
      throw new Error('Invalid code')
    }

    return getDownloadUrl(sentCode.authToken, sentCode.game)
  } catch (err) {
    console.error(err)
    throw err
  }
}

async function getDownloadUrl(authToken: string, game: GameInfo) {
  const headers = {
    'pac-authz': authToken,
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
  }
  const makeFetch = async (url: string) => {
    const response = await fetch(url, { headers })
    if (!response.ok) {
      const text = await response.text()
      console.error(text)
      throw new Error('Bot detected :(')
    }

    return response.json()
  }
  async function events() {
    const json = await makeFetch(
      `https://byutickets.evenue.net/pac-api/orderhistory-event/${game.seasonId}/${game.gameId}`
    )
    return {
      seasonCd: json.events[0].seasonCd,
      eventCd: json.events[0].eventCd,
      transferSeatId: json.events[0].seats[0].transferSeatId,
      barcode: json.events[0].seats[0].barcode,
    }
  }

  async function accounts() {
    const json = await makeFetch(
      'https://byutickets.evenue.net/pac-api/accounts'
    )
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
    if (!response.ok) {
      throw new Error(await response.text())
    }
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
