import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getStandings } from '../actions'
import { CenterLayout } from '../center-layout'
import { TeamRow } from './team-row'
import { SimulateDrawer } from './simulate-drawer'
import { z } from 'zod'
import { Suspense } from 'react'
import { SimulateRecord } from './simulate-record'
import {
  conferences,
  conferenceSchema,
  simulationGameSchema,
} from '@/lib/games-info'
import { Button } from '@/components/ui/button'
import { withSearchParams } from '@/lib/search-params/search-param-hoc'
import { createJsonSchema } from '@/lib/search-params/utils'

export default withSearchParams(
  async function SimulatorPage({ simulations, drawer: teamId, conference }) {
    const schools = await getStandings(conference, simulations)
    const futureGames = schools
      .flatMap((school) => school.allGames)
      .filter((game) => new Date(game.date) > new Date())
      .map((game) => ({ gameId: game.id, result: game.result as 'W' | 'L' }))
    const conferenceItem =
      conferences.find((c) => c.name === conference) ?? conferences[0]

    return (
      <CenterLayout>
        <div className='w-full max-w-2xl'>
          <h1 className='text-center text-4xl'>
            {conferenceItem.title} Simulator
          </h1>
          {simulations.length > 0 ? (
            <Button>
              <a href='/simulator'>Reset</a>
            </Button>
          ) : null}
          <Table>
            <TableCaption>{conferenceItem.title} STANDINGS</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead>Record</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schools.map((school) => (
                <TeamRow key={school.id} school={school} />
              ))}
            </TableBody>
          </Table>
        </div>
        <SimulateDrawer>
          <Suspense>
            {teamId ? (
              <SimulateRecord
                teamId={teamId}
                simulations={futureGames}
                conference={conference}
              />
            ) : undefined}
          </Suspense>
        </SimulateDrawer>
      </CenterLayout>
    )
  },
  {
    drawer: z.coerce.number().optional(),
    simulations: createJsonSchema(
      z.array(simulationGameSchema).optional().default([])
    ),
    conference: conferenceSchema.optional().default('big-12'),
  }
)
