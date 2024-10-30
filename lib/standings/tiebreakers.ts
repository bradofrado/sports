import { BigXiiSchoolWithGames } from '../games-info'
import {
  commonGamesPercentage,
  calculateWinPercentage,
  calculateWinPercentageAgainstTeams,
  groupTiedTeams,
} from './utils'

export type Tiebreaker = (
  a: BigXiiSchoolWithGames,
  b: BigXiiSchoolWithGames[],
  currentStandings: BigXiiSchoolWithGames[]
) => number

export const twoTeamTiebreaker =
  (schools: BigXiiSchoolWithGames[]) =>
  (a: BigXiiSchoolWithGames, b: BigXiiSchoolWithGames): number => {
    const tiebreakers: Tiebreaker[] = [
      headToHeadTiebreaker,
      winPercentageTiebreaker,
      winPercentageAgainstTopTiebreaker,
      combinedWinPercentageTiebreaker,
      totalNumberOfWinsTiebreaker,
      analyticRankingsTiebreaker,
      coinTossTiebreaker,
    ]

    for (const tiebreaker of tiebreakers) {
      const resultA = tiebreaker(a, [b], schools)
      const resultB = tiebreaker(b, [a], schools)
      if (resultA === -1 || resultB === -1 || resultA === resultB) continue

      return resultB - resultA
    }

    return 0
  }

/*
  In the event of a tie between more than two teams, the following procedures will be used.
  After one team has an advantage and is “seeded”, all remaining teams in the multipleteam tiebreaker will repeat the tie-breaking procedure. If at any point the multiple-team tie
  is reduced to two teams, the two-team tie-breaking procedure will be applied.
*/
export const multiTeamTiebreaker =
  (teams: BigXiiSchoolWithGames[]) =>
  (
    tiedTeams: BigXiiSchoolWithGames[]
  ): {
    advantage: BigXiiSchoolWithGames | undefined
    rest: BigXiiSchoolWithGames[]
  } => {
    const getOthers = (team: BigXiiSchoolWithGames) => {
      return tiedTeams.filter((tiedTeam) => tiedTeam.id !== team.id)
    }

    const tiebreakers: Tiebreaker[] = [
      headToHeadTiebreaker,
      winPercentageTiebreaker,
      winPercentageAgainstTopTiebreaker,
      combinedWinPercentageTiebreaker,
      totalNumberOfWinsTiebreaker,
      analyticRankingsTiebreaker,
      coinTossTiebreaker,
    ]

    const currTeams = tiedTeams.slice()
    for (const tiebreaker of tiebreakers) {
      const results = currTeams.map((team) =>
        tiebreaker(team, getOthers(team), teams)
      )
      if (results.includes(-1)) {
        if (tiebreaker === headToHeadTiebreaker) {
          const defeatOtherTeamsIndex = results.findIndex(
            (result) => result === 1
          )
          if (defeatOtherTeamsIndex !== -1) {
            const defeatOtherTeams = currTeams[defeatOtherTeamsIndex]
            return {
              advantage: defeatOtherTeams,
              rest: currTeams.filter((team) => team.id !== defeatOtherTeams.id),
            }
          }
        }
      } else {
        currTeams.sort(
          (a, b) =>
            results[currTeams.indexOf(b)] - results[currTeams.indexOf(a)]
        )
        results.sort((a, b) => b - a)

        const newGroups = groupTiedTeams(currTeams, results)
        // If we get a lone winner at the top, that means we have an advantage team
        //and can return the rest of the teams
        if (newGroups.length > 1 && newGroups[0].teams.length === 1)
          return {
            advantage: newGroups[0].teams[0],
            rest: newGroups.slice(1).flatMap((group) => group.teams),
          }
      }
    }

    //If we get here, that means the coin toss tiebreaker did not determine a winner,
    //so let's just do it again, which will give us another coin toss scenario
    return { rest: currTeams, advantage: undefined }
  }

/*
  a. Head-to-head competition among the two tied teams. 
*/
export const headToHeadTiebreaker: Tiebreaker = (a, b) => {
  const headToHeadResult = calculateWinPercentageAgainstTeams(a, b)

  return headToHeadResult
}

/*
  b. Win percentage against all common conference opponents among the tied
     teams. 
*/
export const winPercentageTiebreaker: Tiebreaker = (a, b) => {
  const aWinPercentage = commonGamesPercentage(a, b)
  //const bWinPercentage = commonGamesPercentage(b, [a])

  return aWinPercentage
}

/*
  c. Win percentage against the next highest placed common opponent in the
     standings (based on the record in all games played within the Conference),
     proceeding through the standings. When arriving at another group of tied
     teams while comparing records, use each team’s win percentage against the
     collective tied teams as a group (prior to that group’s own tie-breaking
     procedure) rather than the performance against individual tied teams.
 */
export const winPercentageAgainstTopTiebreaker: Tiebreaker = (
  a,
  b,
  schools
) => {
  const tiedGroups = groupTiedTeams(schools)

  const positionA = schools.findIndex((school) => school.id === a.id)
  const positionBs = b.map((b) =>
    schools.findIndex((school) => school.id === b.id)
  )
  const positionB = Math.max(...positionBs)
  let currIndex = (positionA > positionB ? positionA : positionB) + 1

  while (currIndex < schools.length) {
    // Compare records against tied teams as a group
    const nextTeams = tiedGroups.find(
      (group) =>
        currIndex >= group.index && currIndex < group.index + group.teams.length
    )?.teams ?? [schools[currIndex]]
    currIndex += nextTeams.length

    const positionACommonWinPercentage = calculateWinPercentageAgainstTeams(
      a,
      nextTeams
    )
    const positionBCommonWinPercentages = b.map((b) =>
      calculateWinPercentageAgainstTeams(b, nextTeams)
    )

    //Must be common opponents and must have a different win percentage
    if (
      positionACommonWinPercentage === -1 ||
      positionBCommonWinPercentages.includes(-1)
    ) {
      continue
    }

    return positionACommonWinPercentage
  }

  return -1
}

/*
  d. Combined win percentage in conference games of conference opponents (i.e.,
     the strength of conference schedule).
*/
export const combinedWinPercentageTiebreaker: Tiebreaker = (a) => {
  const getOpponents = (
    school: BigXiiSchoolWithGames
  ): BigXiiSchoolWithGames[] => {
    return Array.from(school.games.values()).map((game) => {
      return game.opponent.id === school.id ? game.school : game.opponent
    })
  }

  const aOpponents = getOpponents(a)
  //const bOpponents = getOpponents(b)

  //Combined win percentage is the same as the average of each opponent's win percentage
  const aWinPercentage =
    aOpponents
      .map((opponent) =>
        calculateWinPercentage(opponent, Array.from(opponent.games.values()))
      )
      .reduce((acc, curr) => acc + curr, 0) / aOpponents.length
  // const bWinPercentage =
  //   bOpponents
  //     .map((opponent) =>
  //       calculateWinPercentage(opponent, Array.from(opponent.games.values()))
  //     )
  //     .reduce((acc, curr) => acc + curr, 0) / bOpponents.length

  return aWinPercentage
}

/*
  e. Total number of wins in a 12-game season. The following conditions will apply
     to the calculation of the total number of wins: Only one win against a team from
     the NCAA Football Championship Subdivision or lower division will be counted
     annually. Any games that are exempted from counting against the annual
     maximum number of football contests per NCAA rules. (Current Bylaw
     17.10.5.2.1) shall not be included.
*/
export const totalNumberOfWinsTiebreaker: Tiebreaker = (a) => {
  //This assumes that each time has only played at most one FCS team
  return a.overallRecord!.wins!
}

/*
  f. Highest ranking by SportSource Analytics (team Rating Score metric) following
     the last weekend of regular-season games.
*/
export const analyticRankingsTiebreaker: Tiebreaker = () => {
  return 0
}

/*
  g. Coin toss
*/
export const coinTossTiebreaker: Tiebreaker = () => {
  //Randomly return 1 or -1
  return Math.random() > 0.5 ? 1 : 0
}
