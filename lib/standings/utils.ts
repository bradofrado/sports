import {
  BigXiiSchool,
  BigXiiGame,
  SchoolRecord,
  BigXiiSchoolWithGames,
} from '../games-info'

export const calculateRecord = (
  school: BigXiiSchool,
  games: BigXiiGame[]
): SchoolRecord => {
  let wins = 0
  let losses = 0

  games.forEach((game) => {
    if (!game.result) return

    const status = calculateStatus(game, school)
    if (status === 'W') {
      wins++
    } else if (status === 'L') {
      losses++
    }
  })

  return { wins, losses }
}

export const calculateStatus = (game: BigXiiGame, school: BigXiiSchool) => {
  if (!game.result) return ''
  const status =
    game.school.id === school.id ? game.result : game.result === 'W' ? 'L' : 'W'

  return status
}

export const calculateWinPercentage = (
  school: BigXiiSchool,
  games: BigXiiGame[]
): number => {
  const { wins, losses } = calculateRecord(school, games)

  if (wins === 0 && losses === 0) return 0

  return wins / (wins + losses)
}

export const calculateWinPercentageAgainstTeams = (
  team: BigXiiSchoolWithGames,
  opponents: BigXiiSchoolWithGames[]
): number => {
  const commonGames = opponents.map((opponent) => team.games.get(opponent.id))
  if (commonGames.includes(undefined)) return -1

  return calculateWinPercentage(team, commonGames as BigXiiGame[])
}

export const recordPercentage = (record: SchoolRecord): number => {
  return record.wins / (record.wins + record.losses)
}

export const getSchoolGames = (
  school: BigXiiSchool,
  allGames: BigXiiGame[]
) => {
  return allGames.filter(
    (game) => game.school.id === school.id || game.opponent.id === school.id
  )
}

export const commonGamesPercentage = (
  a: BigXiiSchoolWithGames,
  b: BigXiiSchoolWithGames[]
): number => {
  const commonGamesA = Array.from(a.games.entries())
    .filter(
      ([opponentId, game]) =>
        b.every((g) => g.games?.has(opponentId)) &&
        game.result &&
        b.every((g) => g.games.get(opponentId)?.result)
    )
    .map(([, game]) => game)

  if (commonGamesA.length === 0) {
    return -1 //No common games
  }

  const aWinPercentage = calculateWinPercentage(a, commonGamesA)
  return aWinPercentage
}

export const sortRecordPercentage = (
  a: BigXiiSchoolWithGames,
  b: BigXiiSchoolWithGames
): number => {
  const aPercentage = recordPercentage(a.record)
  const bPercentage = recordPercentage(b.record)

  return bPercentage - aPercentage
}

export interface TiebreakerGroup {
  teams: BigXiiSchoolWithGames[]
  index: number
}
export const groupTiedTeams = (
  schools: BigXiiSchoolWithGames[],
  relativeRecord?: number[]
): TiebreakerGroup[] => {
  const groups: { teams: BigXiiSchoolWithGames[]; index: number }[] = []
  let currGroup: BigXiiSchoolWithGames[] = []
  let currIndex = 0

  if (relativeRecord === undefined) {
    relativeRecord = schools.map((school) => recordPercentage(school.record))
  }

  for (let i = 0; i < schools.length; i++) {
    const school = schools[i]
    const prevSchool = schools[i - 1]

    if (prevSchool && relativeRecord[i] !== relativeRecord[i - 1]) {
      groups.push({ teams: currGroup, index: currIndex })
      currGroup = []
      currIndex = i
    }

    currGroup.push(school)
  }

  groups.push({ teams: currGroup, index: currIndex })

  return groups
}

export const reverseResult = (result: 'W' | 'L'): 'W' | 'L' => {
  return result === 'W' ? 'L' : 'W'
}
