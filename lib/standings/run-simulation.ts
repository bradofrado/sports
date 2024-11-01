import { BigXiiSchoolWithGames, SimulationGame } from '../games-info'
import { getStandings } from './get-standings'
import { getBigXiiSchools, getGames } from './get-teams'
import { reverseResult } from './utils'

export const runSimulation = async (
  //BYU is coded as 32 for now
  teamHopeful: number,
  numContenders: number
) => {
  const maxLosses = 2
  const games = await getGames()
  const futureGames = games.filter((game) => game.result === null)
  const currStandings = await getStandings(await getBigXiiSchools(games, []))

  let teamSimulations: SimulationGame[][] = []
  const addTeamSimulations = ({
    team,
    maxLosses,
    includeOppositeVariant = true,
  }: {
    team: BigXiiSchoolWithGames
    maxLosses: number
    includeOppositeVariant?: boolean
  }) => {
    const currSimulations: SimulationGame[][] = []
    const futureGamesForTeam = futureGames.filter(
      (game) => game.school.id === team.id || game.opponent.id === team.id
    )
    const winningPermutations = generateWinLossPermutations(
      futureGamesForTeam.length
    ).filter(
      (perm) =>
        perm.replaceAll('W', '').length <=
        Math.max(maxLosses - team.record.losses, 0)
    )
    for (const winning of winningPermutations) {
      const contenderSimulations = futureGamesForTeam.map<SimulationGame>(
        (game, i) => ({
          gameId: game.id,
          result:
            game.school.id === team.id
              ? (winning[i] as 'W' | 'L')
              : reverseResult(winning[i] as 'W' | 'L'),
        })
      )

      for (const simulation of teamSimulations) {
        const curr = [...simulation, ...contenderSimulations]
        const sameGames = curr.filter(
          (sim) =>
            curr.filter(
              (currSim) =>
                currSim.gameId === sim.gameId && currSim.result !== sim.result
            ).length >= 1
        )
        //If we have duplicate games with different results, lets add each scenario to our simulations
        if (sameGames.length > 0) {
          if (sameGames.length % 2 !== 0)
            throw new Error('Should be even array')

          const firstHalf = sameGames.slice(0, sameGames.length / 2)
          const secondHalf = sameGames.slice(sameGames.length / 2)
          const first = curr.filter(
            (c) => !secondHalf.find((f) => f.gameId === c.gameId)
          )
          first.push(...firstHalf)
          const second = curr.filter(
            (c) => !firstHalf.find((f) => f.gameId === c.gameId)
          )
          second.push(...secondHalf)
          currSimulations.push(first)

          //Sometimes we don't want to add the opposite variant in the case of a non contender because it just
          //adds unnecessary simulations and slows down the time
          if (includeOppositeVariant) currSimulations.push(second)

          continue
        }
        currSimulations.push(curr)
      }
      if (teamSimulations.length === 0) {
        currSimulations.push(contenderSimulations)
      }
    }
    teamSimulations = currSimulations
  }
  const teamsToContend = [...currStandings.slice(0, numContenders)]
  for (const contender of teamsToContend) {
    addTeamSimulations({ team: contender, maxLosses })
  }
  for (let i = 0; i < currStandings.length; i++) {
    const team = currStandings[i]
    const isContender = teamsToContend.find(
      (contender) => contender.id === team.id
    )
    if (isContender) continue
    addTeamSimulations({ team, maxLosses: 0, includeOppositeVariant: false })
  }

  const gameResults: BigXiiSchoolWithGames[][] = []
  for (const group of teamSimulations) {
    const simulationsForGroup = group
    const standings = await getStandings(
      await getBigXiiSchools(games, simulationsForGroup)
    )
    gameResults.push(standings)
  }

  const byuInChampionshipFilter = (result: BigXiiSchoolWithGames[]) =>
    result[0].id === teamHopeful || result[1].id === teamHopeful
  const byuNotInChampionshipFilter = (result: BigXiiSchoolWithGames[]) =>
    result[0].id !== 32 && result[1].id !== 32
  const getSimulationsForScenario = (result: BigXiiSchoolWithGames[]) =>
    teamSimulations[gameResults.findIndex((r) => r === result)]
  const logResults = (results: BigXiiSchoolWithGames[][]) =>
    console.log(
      results.map((result) =>
        result
          .map(
            (team) =>
              `${team.title} (${team.record.wins}-${team.record.losses})`
          )
          .join(',')
      )
    )

  const logStats = (results: BigXiiSchoolWithGames[][], loss?: number) => {
    const byuResults = results.filter(byuInChampionshipFilter)
    const percentage = (byuResults.length / results.length) * 100
    console.log(
      `Percentage of BYU making the Big 12 Championship${
        loss !== undefined ? ` with ${loss} losses` : ''
      }: ${byuResults.length}/${results.length}, ${percentage}%`
    )
  }

  logStats(gameResults)
  for (let loss = 0; loss <= maxLosses; loss++) {
    const results = gameResults.filter(
      (result) =>
        result.find((school) => school.id === teamHopeful)?.record.losses ===
        loss
    )

    logStats(results, loss)

    const notInChampionshipResults = results.filter(byuNotInChampionshipFilter)
    if (
      notInChampionshipResults.length <= 100 &&
      notInChampionshipResults.length > 0
    ) {
      //Log a scenario where BYU is not in the championship
      console.log(getSimulationsForScenario(notInChampionshipResults[0]))
      logResults(notInChampionshipResults)
    }
  }
}

function generateWinLossPermutations(length: number): string[] {
  const results: string[] = []
  const totalCombinations = 1 << length // 2^length

  for (let i = 0; i < totalCombinations; i++) {
    let combination = ''

    for (let bit = 0; bit < length; bit++) {
      combination += i & (1 << bit) ? 'L' : 'W'
    }

    results.push(combination)
  }

  return results
}
