import { Conference, SimulationGame } from '@/lib/games-info'
import { getTeam } from '../actions'
import { SimulateOutcome } from './simulate-outcome'

export const SimulateRecord: React.FunctionComponent<{
  teamId: number
  simulations: SimulationGame[]
  conference: Conference
}> = async ({ teamId, simulations, conference }) => {
  const team = await getTeam(teamId, conference, simulations)
  if (!team) return null

  const games = Array.from(team.games.values()).sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })
  return (
    <div className='p-4 overflow-auto'>
      <div className='flex justify-center items-center gap-2'>
        <h1 className='text-center text-4xl'>{team.title}</h1>{' '}
        <span>
          {team.overallRecord.wins}-{team.overallRecord.losses} (
          {team.record.wins}-{team.record.losses})
        </span>
      </div>
      <div className='flex flex-col gap-2 mt-2'>
        {games.map((game) => (
          <SimulateOutcome key={game.id} game={game} school={team} />
        ))}
      </div>
    </div>
  )
}
