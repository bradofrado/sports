const globalThisForApp = globalThis as unknown as {
  sendCodes: { authToken: string; sendCode: string }[]
}
const sendCodes = globalThisForApp.sendCodes ?? []
if (!globalThisForApp.sendCodes) globalThisForApp.sendCodes = sendCodes

export const generateReceiveCode = async (
  authToken: string
): Promise<string> => {
  const alreadyGenerated = sendCodes.find((sc) => sc.authToken === authToken)
  if (alreadyGenerated) return alreadyGenerated.sendCode

  const sendCode = Math.random().toString(36).substring(2, 8)
  sendCodes.push({ authToken, sendCode })
  return sendCode
}

export const downloadTicket = async (code: string): Promise<string> => {
  const sentCode = sendCodes.find((sc) => sc.sendCode === code)
  if (!sentCode) {
    throw new Error('Invalid code')
  }

  return getDownloadUrl(sentCode.authToken)
}

async function getDownloadUrl(authToken: string) {
  const headers = { 'pac-authz': authToken }
  async function events() {
    const response = await fetch(
      'https://byutickets.evenue.net/pac-api/orderhistory-event/F24/E03',
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
    const u = { ...eventStuff, ...accountStuff }

    return {
      ticketInfo: {
        season: u.seasonCd,
        event: u.eventCd,
        seat: {
          level: u.transferSeatId.split('^')[2].split(':')[0],
          section: u.transferSeatId.split('^')[2].split(':')[1],
          row: u.transferSeatId.split('^')[3],
          seat: u.transferSeatId.split('^')[4],
        },
        patronId: u.patronId,
        dataAccountId: u.dataAccountId,
        barcode: u.barcode,
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
