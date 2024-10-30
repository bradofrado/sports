'use client'

import { generateReceiveCode } from '@/app/actions'
import { useState } from 'react'
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { CopyText } from '../copy-text'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { GameInfo, sports } from '@/lib/season-info'
import { useQueryState } from '@/hooks/query-state'

export const SendForm: React.FunctionComponent<{
  generateReceiveCode: typeof generateReceiveCode
}> = ({ generateReceiveCode }) => {
  const [token, setToken] = useQueryState({ key: 'token', defaultValue: '' })
  const [sendCode, setSendCode] = useQueryState({
    key: 'code',
    defaultValue: '',
  })
  const [error, setError] = useState('')
  const [selectedSport, setSelectedSport] = useQueryState<string | null>({
    key: 'sport',
    defaultValue: null,
  })
  const [selectedGame, setSelectedGame] = useQueryState<GameInfo | null>({
    key: 'game',
    defaultValue: null,
  })

  const games = sports.find((sport) => sport.sportId === selectedSport)?.games

  const onSend = async () => {
    if (!token || !selectedGame) return
    try {
      const code = await generateReceiveCode(token, selectedGame)
      setSendCode(code)
    } catch (err) {
      console.error(err)
      setSendCode('')
      setError('There was an error sending the ticket')
    }
  }

  const onGameSelect = (id: string) => {
    if (!games) return

    const [seasonId, gameId] = id.split('-')
    const game = games.find(
      (game) => game.gameId === gameId && game.seasonId === seasonId
    )
    if (!game) return

    setSelectedGame(game)
  }

  const onTokenChange = (value: string): void => {
    //remove quotes
    setToken(value.replaceAll("'", '').replaceAll('"', ''))
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
          <Label
            htmlFor='token'
            tooltip={
              <div className='max-w-80 flex flex-col gap-2'>
                <p>
                  Paste the following code into the console of your logged in{' '}
                  <a
                    className='text-blue-500'
                    href='https://byutickets.evenue.net'
                    target='_blank'
                  >
                    https://byutickets.evenue.net
                  </a>{' '}
                  tab:
                </p>
                <CopyText
                  className='w-full'
                  text='document.cookie.split(";").find(t=>t.includes("pac-authz")).split("=")[1]'
                />
              </div>
            }
          >
            pac-authz token
          </Label>
          <Input
            id='token'
            placeholder='abcde-1234-5678-fghij'
            value={token}
            onChange={onTokenChange}
          />
        </div>
        <div className='space-y-1'>
          <Label>Sport</Label>
          <Select
            onValueChange={setSelectedSport}
            value={selectedSport ?? undefined}
          >
            <SelectTrigger>
              <SelectValue placeholder='Select a sport' />
            </SelectTrigger>
            <SelectContent>
              {sports.map((sport) => (
                <SelectItem key={sport.sportId} value={sport.sportId}>
                  {sport.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {games ? (
          <div className='space-y-1'>
            <Label>Game</Label>
            <Select
              onValueChange={onGameSelect}
              value={`${selectedGame?.seasonId}-${selectedGame?.gameId}`}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select a game' />
              </SelectTrigger>
              <SelectContent>
                {games.map((game) => (
                  <SelectItem
                    key={game.gameId}
                    value={`${game.seasonId}-${game.gameId}`}
                  >
                    {game.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </CardContent>
      {error ? (
        <CardContent>
          <p className='text-red-500 text-sm'>{error}</p>
        </CardContent>
      ) : null}
      <CardFooter>
        <Button onClick={onSend} disabled={!token || !selectedGame}>
          Generate Code
        </Button>
      </CardFooter>
      {sendCode ? (
        <CardContent>
          <div className='space-y-1 flex flex-col'>
            <Label>Your receive code:</Label>
            <p className='text-sm text-gray-600'>
              Give this code to the recipient.
            </p>
            <CopyText className='w-fit' text={sendCode} />
            <p className='text-sm text-gray-600'>Or send them this link.</p>
            <CopyText
              className='w-full'
              text={constructReceiveLink(sendCode)}
            />
          </div>
        </CardContent>
      ) : null}
    </>
  )
}

const constructReceiveLink = (code: string): string => {
  return `https://tickets.braydonjones.com/?tab=receive&code=${code}`
}
