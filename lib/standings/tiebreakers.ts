import { BigXiiSchoolWithGames } from '../games-info'
import {
  recordPercentage,
  commonGamePercentage,
  calculateWinPercentage,
} from './utils'

export type Tiebreaker = (
  a: BigXiiSchoolWithGames,
  b: BigXiiSchoolWithGames,
  currentStandings: BigXiiSchoolWithGames[]
) => number

export const recordPercentageTiebreaker: Tiebreaker = (a, b) => {
  const aPercentage = recordPercentage(a.record)
  const bPercentage = recordPercentage(b.record)

  return bPercentage - aPercentage
}

export const headToHeadTiebreaker: Tiebreaker = (a, b) => {
  if (!a.games || !b.games) {
    return 0
  }

  const headToHeadGame = a.games.get(b.id)

  if (headToHeadGame?.result === 'W') {
    return 1
  }

  if (headToHeadGame?.result === 'L') {
    return -1
  }

  return 0
}

export const winPercentageTiebreaker: Tiebreaker = (a, b) => {
  const aWinPercentage = commonGamePercentage(a, b)
  const bWinPercentage = commonGamePercentage(b, a)

  return bWinPercentage - aWinPercentage
}

export const winPercentageAgainstTopTiebreaker: Tiebreaker = (
  a,
  b,
  schools
) => {
  const positionA = schools.findIndex((school) => school.id === a.id)
  const positionB = schools.findIndex((school) => school.id === b.id)
  let currIndex = (positionA > positionB ? positionA : positionB) + 1
  for (; currIndex < schools.length; currIndex++) {
    const nextTopSchool = schools[currIndex]
    const positionACommonWinPercentage = commonGamePercentage(a, nextTopSchool)
    const positionBCommonWinPercentage = commonGamePercentage(b, nextTopSchool)

    if (positionACommonWinPercentage === positionBCommonWinPercentage) {
      continue
    }

    return positionBCommonWinPercentage - positionACommonWinPercentage
  }

  return 0
}

export const combinedWinPercentageTiebreaker: Tiebreaker = (a, b) => {
  const getOpponents = (
    school: BigXiiSchoolWithGames
  ): BigXiiSchoolWithGames[] => {
    if (!school.games) return []
    return Array.from(school.games.values()).map((game) => {
      return game.opponent.id === school.id ? game.school : game.opponent
    })
  }

  const aOpponents = getOpponents(a)
  const bOpponents = getOpponents(b)

  const aWinPercentage =
    aOpponents
      .map((opponent) =>
        calculateWinPercentage(
          opponent,
          opponent.games ? Array.from(opponent.games.values()) : []
        )
      )
      .reduce((acc, curr) => acc + curr, 0) / aOpponents.length
  const bWinPercentage =
    bOpponents
      .map((opponent) =>
        calculateWinPercentage(
          opponent,
          opponent.games ? Array.from(opponent.games.values()) : []
        )
      )
      .reduce((acc, curr) => acc + curr, 0) / bOpponents.length

  return bWinPercentage - aWinPercentage
}

export const totalNumberOfWinsTiebreaker: Tiebreaker = (a, b) => {
  return a.record!.wins! - b.record!.wins!
}

export const analyticRankingsTiebreaker: Tiebreaker = () => {
  return 0
}

export const coinTossTiebreaker: Tiebreaker = () => {
  return Math.random() > 0.5 ? 1 : -1
}
