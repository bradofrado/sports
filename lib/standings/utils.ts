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

export const commonGamePercentage = (
  a: BigXiiSchoolWithGames,
  b: BigXiiSchoolWithGames
): number => {
  const commonGamesA = Array.from(a.games.entries())
    .filter(
      ([opponentId, game]) =>
        b.games?.has(opponentId) &&
        game.result &&
        b.games.get(opponentId)?.result
    )
    .map(([, game]) => game)

  if (commonGamesA.length === 0) {
    return 0
  }

  const aWinPercentage = calculateWinPercentage(a, commonGamesA)
  return aWinPercentage
}
