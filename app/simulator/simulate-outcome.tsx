'use client'

import { Button } from '@/components/ui/button'
import { useQueryState } from '@/hooks/query-state'
import {
  BigXiiGame,
  BigXiiSchoolWithGames,
  SimulationGame,
} from '@/lib/games-info'
import { calculateStatus } from '@/lib/standings/utils'
import { cn } from '@/lib/utils'

export const SimulateOutcome: React.FunctionComponent<{
  game: BigXiiGame
  school: BigXiiSchoolWithGames
}> = ({ game, school }) => {
  const [simulations, setSimulations] = useQueryState<SimulationGame[]>({
    key: 'simulations',
    defaultValue: [],
  })
  const [, setTeamId] = useQueryState<number | undefined>({ key: 'drawer' })
  const location = game.school.id === school.id ? 'vs' : '@'
  const opponent = game.school.id === school.id ? game.opponent : game.school
  const result = calculateStatus(game, school)

  const onWinClick = () => {
    const index = simulations.findIndex((sim) => sim.gameId === game.id)
    const result = location === 'vs' ? 'W' : 'L'

    if (index === -1) {
      setSimulations([...simulations, { gameId: game.id, result }])
      return
    }
    const res: SimulationGame[] = simulations.map((simulation) => {
      if (simulation.gameId === game.id) {
        return { ...simulation, result }
      }
      return simulation
    })

    setSimulations(res)
  }

  const onLoseClick = () => {
    const index = simulations.findIndex((sim) => sim.gameId === game.id)
    const result = location === 'vs' ? 'L' : 'W'
    if (index === -1) {
      setSimulations([...simulations, { gameId: game.id, result }])
      return
    }

    const res: SimulationGame[] = simulations.map((simulation) => {
      if (simulation.gameId === game.id) {
        return { ...simulation, result }
      }
      return simulation
    })

    setSimulations(res)
  }

  return (
    <div
      className={cn(
        'flex justify-between items-center p-2 border rounded-md',
        new Date(game.date).getTime() > new Date().getTime()
          ? 'bg-blue-200'
          : ''
      )}
    >
      <Button variant='link' onClick={() => setTeamId(opponent.id)}>
        {location} {opponent.title}
      </Button>
      <div className='flex gap-2'>
        <Button
          variant={result === 'W' ? 'default' : 'outline'}
          onClick={onWinClick}
        >
          Win
        </Button>
        <Button
          variant={result === 'L' ? 'default' : 'outline'}
          onClick={onLoseClick}
        >
          Lose
        </Button>
      </div>
    </div>
  )
}
