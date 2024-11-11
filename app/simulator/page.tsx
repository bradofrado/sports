import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
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
  Conference,
  conferences,
  conferenceSchema,
  SimulationGame,
  simulationGameSchema,
} from '@/lib/games-info'
import { Button } from '@/components/ui/button'
import { withSearchParams } from '@/lib/search-params/search-param-hoc'
import { createJsonSchema } from '@/lib/search-params/utils'
import { Skeleton } from '@/components/ui/skeleton'

export default withSearchParams(
  function SimulatorPage({ simulations, drawer: teamId, conference }) {
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
                {/* <TableHead></TableHead> */}
                <TableHead>Team</TableHead>
                <TableHead>Record</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <Suspense
                key={JSON.stringify({ simulations, conference, teamId })}
                fallback={
                  <TableRow>
                    <TableCell colSpan={2} className='space-y-4'>
                      <Skeleton className='h-8 w-full' />
                      <Skeleton className='h-8 w-full' />
                      <Skeleton className='h-8 w-full' />
                    </TableCell>
                  </TableRow>
                }
              >
                <StandingsList
                  key={JSON.stringify({ simulations, conference })}
                  conference={conference}
                  simulations={simulations}
                />
              </Suspense>
            </TableBody>
          </Table>
        </div>
        <SimulateDrawer>
          <Suspense key={JSON.stringify({ simulations, conference, teamId })}>
            {teamId ? (
              <SimulateRecord
                teamId={teamId}
                simulations={simulations}
                conference={conference}
              />
            ) : null}
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

async function StandingsList({
  conference,
  simulations,
}: {
  conference: Conference
  simulations: SimulationGame[]
}) {
  const schools = await getStandings(conference, simulations)
  return (
    <>
      {schools.map((school) => (
        <TeamRow key={school.team.id} teamInfo={school} />
      ))}
    </>
  )
}
