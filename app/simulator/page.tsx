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
import { simulationGameSchema } from '@/lib/games-info'
import { Button } from '@/components/ui/button'

const jsonSchema = z
  .string()
  .refine((value) => {
    try {
      JSON.parse(value)
      return true
    } catch {
      return false
    }
  })
  .transform((value) => JSON.parse(value))

export default async function SimulatorPage({
  searchParams,
}: {
  searchParams?: { drawer?: string; simulations?: string }
}) {
  const simulations =
    z
      .array(simulationGameSchema)
      .optional()
      .parse(jsonSchema.optional().parse(searchParams?.simulations)) ?? []
  const teamId = z.coerce.number().optional().parse(searchParams?.drawer)
  const schools = await getStandings(simulations)

  return (
    <CenterLayout>
      <div className='w-full max-w-2xl'>
        <h1 className='text-center text-4xl'>BIG XII Simulator</h1>
        {simulations.length > 0 ? (
          <Button>
            <a href='/simulator'>Reset</a>
          </Button>
        ) : null}
        <Table>
          <TableCaption>BIG XII STANDINGS</TableCaption>
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
            <SimulateRecord teamId={teamId} simulations={simulations} />
          ) : undefined}
        </Suspense>
      </SimulateDrawer>
    </CenterLayout>
  )
}
