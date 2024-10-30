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
      //
      const newGroups = multiTeamBreaker(group.teams)
      if (newGroups.length === 1) {
        group.teams = newGroups[0].teams
      } else {
        const sortedGroups = newGroups.map((group) => ({
          teams: getStandings(group.teams),
          index: group.index,
        }))
        sortedGroups.forEach((sortedGroup) => {
          group.teams = reinsertTiedGroup(sortedGroup, group.teams)
        })
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
