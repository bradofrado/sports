import { BigXiiSchoolWithGames } from '../games-info'
import {
  commonGamesPercentage,
  calculateWinPercentage,
  calculateWinPercentageAgainstTeams,
  groupTiedTeams,
  TiebreakerGroup,
} from './utils'
import { close } from './utils'

export type TiebreakerFunction = (
  a: BigXiiSchoolWithGames,
  b: BigXiiSchoolWithGames[],
  groups: TiebreakerGroup[]
) => { result: number; commonTeams?: BigXiiSchoolWithGames[] }

export interface Tiebreaker {
  func: TiebreakerFunction
  title: string
  ruleNumber: number
  twoTeamDescription: string
  multiTeamDescription: string
}

export interface AdvantageInfo {
  results: {
    team: BigXiiSchoolWithGames
    result: ReturnType<TiebreakerFunction>
  }[]
  tiebreaker: Omit<Tiebreaker, 'func'>
  type: 'two-team' | 'multi-team'
}

export const twoTeamTiebreaker =
  (groups: TiebreakerGroup[]) =>
  (
    a: BigXiiSchoolWithGames,
    b: BigXiiSchoolWithGames
  ): { result: number; advantageInfo: AdvantageInfo } => {
    for (const tiebreaker of tiebreakers) {
      const resultA = tiebreaker.func(a, [b], groups)
      const resultB = tiebreaker.func(b, [a], groups)
      if (
        resultA.result === -1 ||
        resultB.result === -1 ||
        close(resultA.result, resultB.result)
        //resultA.result === resultB.result
      )
        continue

      const result = resultB.result - resultA.result
      return {
        result,
        advantageInfo: {
          results: [
            { team: a, result: resultA },
            { team: b, result: resultB },
          ],
          tiebreaker: {
            ruleNumber: tiebreaker.ruleNumber,
            title: tiebreaker.title,
            twoTeamDescription: tiebreaker.twoTeamDescription,
            multiTeamDescription: tiebreaker.multiTeamDescription,
          },
          type: 'two-team',
        },
      }
    }

    //If we get here, then that means the coin toss tiebreaker did not determine a winner
    //so retry the tiebreaker
    return twoTeamTiebreaker(groups)(a, b)
  }

/*
  In the event of a tie between more than two teams, the following procedures will be used.
  After one team has an advantage and is “seeded”, all remaining teams in the multipleteam tiebreaker will repeat the tie-breaking procedure. If at any point the multiple-team tie
  is reduced to two teams, the two-team tie-breaking procedure will be applied.
*/
interface MultiTeamBreakerResult {
  advantage: BigXiiSchoolWithGames
  rest: BigXiiSchoolWithGames[]
  advantageInfo: AdvantageInfo
}
export const multiTeamTiebreaker =
  (groups: TiebreakerGroup[]) =>
  (tiedTeams: BigXiiSchoolWithGames[]): MultiTeamBreakerResult => {
    const getOthers = (team: BigXiiSchoolWithGames) => {
      return tiedTeams.filter((tiedTeam) => tiedTeam.id !== team.id)
    }

    const currTeams = tiedTeams.slice()
    for (const tiebreaker of tiebreakers) {
      const teamResults = currTeams.map((team) =>
        tiebreaker.func(team, getOthers(team), groups)
      )
      const results = teamResults.map((result) => result.result)
      if (results.includes(-1)) {
        if (tiebreaker.ruleNumber === 1) {
          const defeatOtherTeamsIndex = results.findIndex(
            (result) => result === 1
          )
          if (defeatOtherTeamsIndex !== -1) {
            const defeatOtherTeams = currTeams[defeatOtherTeamsIndex]
            return {
              advantage: defeatOtherTeams,
              rest: currTeams.filter((team) => team.id !== defeatOtherTeams.id),
              advantageInfo: {
                results: currTeams.map((team) => ({
                  team,
                  result: teamResults[currTeams.indexOf(team)],
                })),
                tiebreaker: {
                  ruleNumber: tiebreaker.ruleNumber,
                  title: tiebreaker.title,
                  twoTeamDescription: tiebreaker.twoTeamDescription,
                  multiTeamDescription: tiebreaker.multiTeamDescription,
                },
                type: 'multi-team',
              },
            }
          }
        }
      } else {
        currTeams.sort(
          (a, b) =>
            results[currTeams.indexOf(b)] - results[currTeams.indexOf(a)]
        )
        results.sort((a, b) => b - a)
        teamResults.sort((a, b) => b.result - a.result)

        const newGroups = groupTiedTeams(currTeams, results)
        // If we get a lone winner at the top, that means we have an advantage team
        //and can return the rest of the teams
        if (newGroups.length > 1 && newGroups[0].teams.length === 1)
          return {
            advantage: newGroups[0].teams[0],
            rest: newGroups.slice(1).flatMap((group) => group.teams),
            advantageInfo: {
              results: currTeams.map((team) => ({
                team,
                result: teamResults[currTeams.indexOf(team)],
              })),
              tiebreaker: {
                ruleNumber: tiebreaker.ruleNumber,
                title: tiebreaker.title,
                twoTeamDescription: tiebreaker.twoTeamDescription,
                multiTeamDescription: tiebreaker.multiTeamDescription,
              },
              type: 'multi-team',
            },
          }
      }
    }

    //If we get here, that means the coin toss tiebreaker did not determine a winner,
    //so let's just do it again, which will give us another coin toss scenario
    return multiTeamTiebreaker(groups)(tiedTeams)
  }

/*
  a. Head-to-head competition among the two tied teams. 
*/
export const headToHeadTiebreaker: TiebreakerFunction = (a, b) => {
  const headToHeadResult = calculateWinPercentageAgainstTeams(a, b)

  return { result: headToHeadResult }
}

/*
  b. Win percentage against all common conference opponents among the tied
     teams. 
*/
export const winPercentageTiebreaker: TiebreakerFunction = (a, b) => {
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
export const winPercentageAgainstTopTiebreaker: TiebreakerFunction = (
  a,
  b,
  tiedGroups
) => {
  const schools = tiedGroups.flatMap((group) => group.teams)

  const positionA = schools.findIndex((school) => school.id === a.id)
  const positionBs = b.map((b) =>
    schools.findIndex((school) => school.id === b.id)
  )
  let currIndex = 0

  while (currIndex < schools.length) {
    if (currIndex === positionA || positionBs.includes(currIndex)) {
      currIndex++
      continue
    }
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

    //Must be common opponents
    if (
      positionACommonWinPercentage === -1 ||
      positionBCommonWinPercentages.includes(-1)
    ) {
      continue
    }

    return { result: positionACommonWinPercentage, commonTeams: nextTeams }
  }

  return { result: -1 }
}

/*
  d. Combined win percentage in conference games of conference opponents (i.e.,
     the strength of conference schedule).
*/
export const combinedWinPercentageTiebreaker: TiebreakerFunction = (a) => {
  const getOpponents = (
    school: BigXiiSchoolWithGames
  ): BigXiiSchoolWithGames[] => {
    return Array.from(school.games.values()).map((game) => {
      return game.opponent.id === school.id ? game.school : game.opponent
    })
  }

  const aOpponents = getOpponents(a)

  //Combined win percentage is the same as the average of each opponent's win percentage
  const aWinPercentage =
    aOpponents
      .map((opponent) =>
        calculateWinPercentage(opponent, Array.from(opponent.games.values()))
      )
      .reduce((acc, curr) => acc + curr, 0) / aOpponents.length

  return { result: aWinPercentage }
}

/*
  e. Total number of wins in a 12-game season. The following conditions will apply
     to the calculation of the total number of wins: Only one win against a team from
     the NCAA Football Championship Subdivision or lower division will be counted
     annually. Any games that are exempted from counting against the annual
     maximum number of football contests per NCAA rules. (Current Bylaw
     17.10.5.2.1) shall not be included.
*/
export const totalNumberOfWinsTiebreaker: TiebreakerFunction = (a) => {
  //This assumes that each time has only played at most one FCS team
  return { result: a.overallRecord!.wins! }
}

/*
  f. Highest ranking by SportSource Analytics (team Rating Score metric) following
     the last weekend of regular-season games.
*/
export const analyticRankingsTiebreaker: TiebreakerFunction = () => {
  return { result: 0 }
}

/*
  g. Coin toss
*/
export const coinTossTiebreaker: TiebreakerFunction = () => {
  //Randomly return 1 or -1
  return { result: Math.random() > 0.5 ? 1 : 0 }
}

const tiebreakers: Tiebreaker[] = [
  {
    func: headToHeadTiebreaker,
    title: 'Head to Head',
    ruleNumber: 1,
    twoTeamDescription: 'Head-to-head competition among the two tied teams.',
    multiTeamDescription: 'Head-to-head competition among the tied teams.',
  },
  {
    func: winPercentageTiebreaker,
    title: 'Win Percentage',
    ruleNumber: 2,
    twoTeamDescription:
      'Win percentage against all common conference opponents among the tied teams.',
    multiTeamDescription:
      'Win percentage against all common conference opponents among the tied teams.',
  },
  {
    func: winPercentageAgainstTopTiebreaker,
    title: 'Win Percentage Against Top',
    ruleNumber: 3,
    twoTeamDescription:
      'Win percentage against the next highest placed common opponent in the standings (based on the record in all games played within the Conference), proceeding through the standings. When arriving at another group of tied teams while comparing records, use each team’s win percentage against the collective tied teams as a group (prior to that group’s own tie-breaking procedure) rather than the performance against individual tied teams.',
    multiTeamDescription:
      'Record of the three (or more) tied teams against the next highest placed common opponent in the standings (based on the record in all games played within the conference), proceeding through the standings. When arriving at another group of tied teams while comparing records, use each team’s win percentage against the collective tied teams as a group (prior to that group’s own tie-breaking procedure) rather than the performance against individual tied teams.',
  },
  {
    func: combinedWinPercentageTiebreaker,
    title: 'Combined Win Percentage',
    ruleNumber: 4,
    twoTeamDescription:
      'Combined win percentage in conference games of conference opponents (i.e., the strength of conference schedule).',
    multiTeamDescription:
      'Record of the three (or more) tied teams based on combined win percentage in conference games of conference opponents (i.e., strength of conference schedule)',
  },
  {
    func: totalNumberOfWinsTiebreaker,
    title: 'Total Number of Wins',
    ruleNumber: 5,
    twoTeamDescription: 'Total number of wins in a 12-game season',
    multiTeamDescription: 'Total number of wins in a 12-game season',
  },
  {
    func: analyticRankingsTiebreaker,
    title: 'Analytic Rankings',
    ruleNumber: 6,
    twoTeamDescription:
      'Highest ranking by SportSource Analytics (team Rating Score metric) following the last weekend of regular-season games.',
    multiTeamDescription:
      'Highest ranking by SportSource Analytics (team Rating Score metric) following the last weekend of regular-season games.',
  },
  {
    func: coinTossTiebreaker,
    title: 'Coin Toss',
    ruleNumber: 7,
    twoTeamDescription: '',
    multiTeamDescription: '',
  },
]
