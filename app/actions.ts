'use server'

import { BigXiiSchoolWithGames, SimulationGame } from '@/lib/games-info'
import { getStandings as getStandingsRaw } from '@/lib/standings/get-standings'
import { getBigXiiSchools, getGames } from '@/lib/standings/get-teams'
import { runSimulation } from '@/lib/standings/run-simulation'
import {
  generateReceiveCode as generateReceiveCodeServer,
  downloadTicket as downloadTicketServer,
} from '@/server/receive-code'

export const generateReceiveCode: typeof generateReceiveCodeServer = async (
  ...props
) => {
  return generateReceiveCodeServer(...props)
}

export const downloadTicket: typeof downloadTicketServer = async (...props) => {
  return downloadTicketServer(...props)
}

export const getStandings = async (
  simulations: SimulationGame[]
): Promise<BigXiiSchoolWithGames[]> => {
  const schools = await getBigXiiSchools(await getGames(), simulations)
  const byuId = 32
  await runSimulation(byuId, 6)
  return getStandingsRaw(schools)
}

export const getTeam = async (
  teamId: number,
  simulations: SimulationGame[]
): Promise<BigXiiSchoolWithGames | undefined> => {
  const games = await getGames()
  const schools = await getBigXiiSchools(games, simulations)
  return schools.find((school) => school.id === teamId)
}
