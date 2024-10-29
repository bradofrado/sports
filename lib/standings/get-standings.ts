import { BigXiiSchoolWithGames } from '../games-info'
import {
  Tiebreaker,
  recordPercentageTiebreaker,
  headToHeadTiebreaker,
  winPercentageTiebreaker,
  winPercentageAgainstTopTiebreaker,
  combinedWinPercentageTiebreaker,
  totalNumberOfWinsTiebreaker,
  analyticRankingsTiebreaker,
  coinTossTiebreaker,
} from './tiebreakers'

export const getStandings = async (
  schools: BigXiiSchoolWithGames[]
): Promise<BigXiiSchoolWithGames[]> => {
  const tiebreakers: Tiebreaker[] = [
    recordPercentageTiebreaker,
    headToHeadTiebreaker,
    winPercentageTiebreaker,
    winPercentageAgainstTopTiebreaker,
    combinedWinPercentageTiebreaker,
    totalNumberOfWinsTiebreaker,
    analyticRankingsTiebreaker,
    coinTossTiebreaker,
  ]

  for (let i = 0; i < tiebreakers.length; i++) {
    const currTiebreakers = tiebreakers.slice(0, i + 1)
    let wasChanged = false
    schools = schools.slice().sort((a, b) => {
      for (const tiebreaker of currTiebreakers) {
        const res = tiebreaker(a, b, schools)
        if (res !== 0) {
          wasChanged = true
          return res
        }
      }

      return 0
    })
    if (!wasChanged) break
  }

  return schools
}
