import {
  BigXiiGameRaw,
  BigXiiSchoolWithGames,
  SimulationGame,
} from '../games-info'
import { getStandings } from './get-standings'
import { getBigXiiSchools, getGames } from './get-teams'
import { reverseResult } from './utils'

export const runNumContendersSimulation = async (
  //BYU is coded as 32 for now
  teamHopeful: number,
  contenders: number[]
) => {
  const maxLosses = 2
  const games = await getGames('big-12')
  const futureGames = games.filter((game) => game.result === null)
  const currStandings = (
    await getStandings(await getBigXiiSchools(games, []))
  ).map(({ team }) => team)
  const teamsToContend = [
    ...contenders.map((index) => currStandings[index]),
  ].map<TeamPermutations>((school) => ({
    school,
    permutations: generateMaxWinLossPermutations({
      futureGames,
      school,
      result: 'L',
      numResult: maxLosses,
    }),
  }))
  const { gameResults, teamSimulations } = await runSimulations(
    teamsToContend,
    games
  )

  logHopefulResults({ teamHopeful, gameResults, teamSimulations, maxLosses })
}

export const runBYU1LossScenario = async () => {
  const games = await getGames('big-12')
  const futureGames = games.filter((game) => game.result === null)
  const currStandings = (
    await getStandings(await getBigXiiSchools(games, []))
  ).map(({ team }) => team)

  const byu = currStandings.find((school) => school.title === 'BYU')
  const kansasSt = currStandings.find(
    (school) => school.title === 'Kansas State'
  )
  const westVirginia = currStandings.find(
    (school) => school.title === 'West Virginia'
  )
  const TCU = currStandings.find((school) => school.title === 'TCU')

  if (!byu || !kansasSt || !westVirginia || !TCU)
    throw new Error('School not found')

  const teamPermutations: TeamPermutations[] = [
    {
      school: byu,
      //At most 1 loss
      permutations: generateMaxWinLossPermutations({
        school: byu,
        futureGames,
        result: 'L',
        numResult: 1,
      }),
    },
    {
      school: kansasSt,
      //At most 2 losses
      permutations: generateMaxWinLossPermutations({
        school: kansasSt,
        futureGames,
        result: 'L',
        numResult: 2,
      }),
    },
    ...[westVirginia, TCU].map((school) => ({
      school,
      //At most 6 wins
      permutations: generateMaxWinLossPermutations({
        school,
        futureGames,
        result: 'W',
        numResult: 6,
      }),
    })),
  ]
  const { gameResults } = await runSimulations(teamPermutations, games)
  logStats(gameResults, 32)
}

interface TeamPermutations {
  school: BigXiiSchoolWithGames
  permutations: string[]
}
export const runSimulations = async (
  teamPermutations: TeamPermutations[],
  games: BigXiiGameRaw[]
) => {
  const futureGames = games.filter((game) => game.result === null)
  const currStandings = (
    await getStandings(await getBigXiiSchools(games, []))
  ).map(({ team }) => team)

  let teamSimulations: SimulationGame[][] = []
  const toString = (sim: SimulationGame[]) =>
    sim.map((s) => `${s.gameId}-${s.result}`).join(',')
  const addTeamSimulations = ({
    team,
    includeOppositeVariant = true,
    permutations,
  }: {
    team: BigXiiSchoolWithGames
    permutations: string[]
    includeOppositeVariant?: boolean
  }) => {
    const currSimulations: SimulationGame[][] = []
    const addToCurr = (simulations: SimulationGame[]) => {
      currSimulations.push(simulations)
    }
    const futureGamesForTeam = futureGames.filter(
      (game) => game.school.id === team.id || game.opponent.id === team.id
    )
    const winningPermutations = permutations

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

          const grouped: SimulationGame[][] = Array.from({
            length: sameGames.length / 2,
          }).map(() => [])
          for (let i = 0; i < sameGames.length; i++) {
            //group same games together in their own arrays
            const sameGame = sameGames[i]
            const position = i % (sameGames.length / 2)
            grouped[position].push(sameGame)
          }
          let sameGroupsPermutations = groupPermutations(grouped)
          if (!includeOppositeVariant)
            sameGroupsPermutations = [sameGroupsPermutations[0]]
          for (const group of sameGroupsPermutations) {
            const withoutGroup = curr.filter(
              (c) => !group.find((g) => g.gameId === c.gameId)
            )
            withoutGroup.push(...group)
            addToCurr(withoutGroup)
          }

          continue
        }
        addToCurr(curr)
      }
      if (teamSimulations.length === 0) {
        addToCurr(contenderSimulations)
      }
    }
    teamSimulations = currSimulations
  }
  for (const { school, permutations } of teamPermutations) {
    addTeamSimulations({ team: school, permutations })
  }
  for (let i = 0; i < currStandings.length; i++) {
    const team = currStandings[i]
    const isContender = teamPermutations.find(
      (contender) => contender.school.id === team.id
    )
    if (isContender) continue
    addTeamSimulations({
      team,
      permutations: generateMaxWinLossPermutations({
        school: team,
        result: 'L',
        numResult: 0,
        futureGames,
      }),
      includeOppositeVariant: false,
    })
  }

  const gameResults: BigXiiSchoolWithGames[][] = []

  //Remove duplicate simulations
  const tempSet = new Set<string>()
  teamSimulations = teamSimulations.filter((simulation) => {
    const str = toString(simulation)
    if (tempSet.has(str)) return false
    tempSet.add(str)
    return true
  })

  for (const group of teamSimulations) {
    const simulationsForGroup = group
    const standings = (
      await getStandings(await getBigXiiSchools(games, simulationsForGroup))
    ).map(({ team }) => team)
    gameResults.push(standings)
  }

  return { gameResults, teamSimulations }
}

function logHopefulResults({
  teamHopeful,
  teamSimulations,
  gameResults,
  maxLosses,
}: {
  teamHopeful: number
  gameResults: BigXiiSchoolWithGames[][]
  teamSimulations: SimulationGame[][]
  maxLosses: number
}) {
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

  logStats(gameResults, teamHopeful)
  for (let loss = 0; loss <= maxLosses; loss++) {
    const results = gameResults.filter(
      (result) =>
        result.find((school) => school.id === teamHopeful)?.record.losses ===
        loss
    )

    logStats(results, teamHopeful, loss)

    const notInChampionshipResults = results.filter(byuNotInChampionshipFilter)
    if (loss === 1) {
      //Log a scenario where BYU is not in the championship
      console.log(
        JSON.stringify(getSimulationsForScenario(notInChampionshipResults[0]))
      )
      logResults(notInChampionshipResults)
    }
  }
}

function logStats(
  results: BigXiiSchoolWithGames[][],
  teamHopeful: number,
  loss?: number
) {
  const byuInChampionshipFilter = (result: BigXiiSchoolWithGames[]) =>
    result[0].id === teamHopeful || result[1].id === teamHopeful
  const byuResults = results.filter(byuInChampionshipFilter)
  const percentage = (byuResults.length / results.length) * 100
  console.log(
    `Percentage of BYU making the Big 12 Championship${
      loss !== undefined ? ` with ${loss} losses` : ''
    }: ${byuResults.length}/${results.length}, ${percentage}%`
  )
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

function generateMaxWinLossPermutations({
  school,
  futureGames,
  result,
  numResult,
}: {
  school: BigXiiSchoolWithGames
  futureGames: BigXiiGameRaw[]
  result: 'W' | 'L'
  numResult: number
}): string[] {
  const futureGamesForTeam = futureGames.filter(
    (game) => game.school.id === school.id || game.opponent.id === school.id
  )
  return generateWinLossPermutations(futureGamesForTeam.length).filter(
    (perm) =>
      perm.replaceAll(reverseResult(result), '').length <=
      Math.max(
        numResult -
          (result === 'L' ? school.record.losses : school.record.wins),
        0
      )
  )
}

function groupPermutations<T>(array: T[][]): T[][] {
  const results: T[][] = []

  // Recursive helper to generate each group permutation
  function generateGroup(permutation: T[], rowIndex: number) {
    // Base case: if we've set a value for each row, save this group permutation
    if (rowIndex === array.length) {
      results.push([...permutation]) // Convert each item to a nested array
      return
    }

    // For each element in the current row, replace the default with that element
    for (let colIndex = 0; colIndex < array[rowIndex].length; colIndex++) {
      const original = permutation[rowIndex]
      permutation[rowIndex] = array[rowIndex][colIndex]
      generateGroup(permutation, rowIndex + 1)
      permutation[rowIndex] = original // Restore original
    }
  }

  // Initialize the permutation with the first element of each row
  generateGroup(
    array.map((row) => row[0]),
    0
  )
  return results
}
