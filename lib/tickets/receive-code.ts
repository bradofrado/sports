import { GameInfo } from '@/lib/season-info'

const globalThisForApp = globalThis as unknown as {
  sendCodes: {
    authToken: string
    sendCode: string
    game: GameInfo
    barcode: string
    patronId: string
    dataAccountId: string
    transferSeatId: string
  }[]
}
const sendCodes = globalThisForApp.sendCodes ?? []
if (!globalThisForApp.sendCodes) globalThisForApp.sendCodes = sendCodes

export const generateReceiveCode = async (
  authToken: string,
  game: GameInfo
): Promise<string> => {
  try {
    const alreadyGenerated = sendCodes.find(
      (sc) =>
        sc.authToken === authToken &&
        sc.game.gameId === game.gameId &&
        sc.game.seasonId === game.seasonId
    )
    if (alreadyGenerated) return alreadyGenerated.sendCode

    const sendCode = Math.random().toString(36).substring(2, 8)
    const fetcher = new TicketFetcher(authToken, game)
    const eventStuff = await fetcher.events()
    const accountStuff = await fetcher.accounts()

    sendCodes.push({
      authToken,
      sendCode,
      game,
      barcode: eventStuff.barcode,
      patronId: accountStuff.patronId,
      dataAccountId: accountStuff.dataAccountId,
      transferSeatId: eventStuff.transferSeatId,
    })
    return sendCode
  } catch (err) {
    console.error(err)
    throw err
  }
}

export const downloadTicket = async (code: string): Promise<string> => {
  try {
    const sentCode = sendCodes.find((sc) => sc.sendCode === code)
    if (!sentCode) {
      throw new Error('Invalid code')
    }
    const fetcher = new TicketFetcher(sentCode.authToken, sentCode.game)

    return fetcher.getDownloadUrl(
      {
        barcode: sentCode.barcode,
        eventCd: sentCode.game.gameId,
        seasonCd: sentCode.game.seasonId,
        transferSeatId: sentCode.transferSeatId,
      },
      { dataAccountId: sentCode.dataAccountId, patronId: sentCode.patronId }
    )
  } catch (err) {
    console.error(err)
    throw err
  }
}

class TicketFetcher {
  private headers: Record<string, string>
  constructor(private authToken: string, private game: GameInfo) {
    this.headers = {
      'pac-authz': authToken,
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
    }
  }

  public async events() {
    const json = await this.makeFetch(
      `https://byutickets.evenue.net/pac-api/orderhistory-event/${this.game.seasonId}/${this.game.gameId}`
    )
    return {
      seasonCd: json.events[0].seasonCd,
      eventCd: json.events[0].eventCd,
      transferSeatId: json.events[0].seats[0].transferSeatId,
      barcode: json.events[0].seats[0].barcode,
    }
  }

  public async accounts() {
    const json = await this.makeFetch(
      'https://byutickets.evenue.net/pac-api/accounts'
    )
    return {
      patronId: json.key.id,
      dataAccountId: json.dataAccountId,
    }
  }

  private createRequest(
    eventStuff: Awaited<ReturnType<typeof this.events>>,
    accountStuff: Awaited<ReturnType<typeof this.accounts>>
  ) {
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

  public async getDownloadUrl(
    eventStuff: Awaited<ReturnType<typeof this.events>>,
    accountStuff: Awaited<ReturnType<typeof this.accounts>>
  ) {
    const req = await this.createRequest(eventStuff, accountStuff)
    const url = await this.getPass(req)
    return url
  }

  private async getPass(req: Awaited<ReturnType<typeof this.createRequest>>) {
    const response = await fetch(
      'https://byutickets.evenue.net/pac-api/mobile-pass',
      {
        method: 'POST',
        body: JSON.stringify(req),
        headers: { ...this.headers, 'Content-Type': 'application/json' },
      }
    )
    if (!response.ok) {
      throw new Error(await response.text())
    }
    const json = await response.json()
    return json.applePassUrl
  }

  private async makeFetch(url: string) {
    const response = await fetch(url, { headers: this.headers })
    if (!response.ok) {
      const text = await response.text()
      console.error(text)
      throw new Error('Bot detected :(')
    }

    return response.json()
  }
}
