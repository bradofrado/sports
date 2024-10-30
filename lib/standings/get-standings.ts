import { BigXiiSchoolWithGames } from '../games-info'
import { multiTeamTiebreaker, twoTeamTiebreaker } from './tiebreakers'
import { groupTiedTeams, sortRecordPercentage, TiebreakerGroup } from './utils'

export const getStandings = (
  schools: BigXiiSchoolWithGames[]
): BigXiiSchoolWithGames[] => {
  let recordSorted = schools.slice().sort(sortRecordPercentage)
  const tiedTeams = groupTiedTeams(recordSorted)

  const twoTeamBreaker = twoTeamTiebreaker(recordSorted)
  const multiTeamBreaker = multiTeamTiebreaker(recordSorted)
  for (const group of tiedTeams) {
    if (group.teams.length === 1) continue

    // Sort the two team groups
    if (group.teams.length === 2) {
      group.teams.sort(twoTeamBreaker)
    } else {
      // The multi team tie breaker goes until we get an advantage team
      // when this happens, we redo the tie breaker with the rest of the teams
      const { advantage, rest } = multiTeamBreaker(group.teams)
      const restSorted = getStandings(rest)
      if (advantage) {
        group.teams = [advantage, ...restSorted]
      } else {
        group.teams = restSorted
      }
    }

    recordSorted = reinsertTiedGroup(group, recordSorted)
  }

  return recordSorted
}

const reinsertTiedGroup = (
  group: TiebreakerGroup,
  sorted: BigXiiSchoolWithGames[]
) =>
  sorted
    .slice(0, group.index)
    .concat(group.teams)
    .concat(sorted.slice(group.index + group.teams.length))
