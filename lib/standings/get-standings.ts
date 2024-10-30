import { BigXiiSchoolWithGames } from '../games-info'
import { multiTeamTiebreaker, twoTeamTiebreaker } from './tiebreakers'
import { groupTiedTeams, sortRecordPercentage, TiebreakerGroup } from './utils'

export const getStandings = (
  schools: BigXiiSchoolWithGames[]
): BigXiiSchoolWithGames[] => {
  let recordSorted = schools.slice().sort(sortRecordPercentage)
  const tiedTeams = groupTiedTeams(recordSorted)

  for (let i = 0; i < tiedTeams.length; i++) {
    let group = tiedTeams[i]
    if (group.teams.length === 1) continue

    const twoTeamBreaker = twoTeamTiebreaker(tiedTeams)
    const multiTeamBreaker = multiTeamTiebreaker(tiedTeams)

    // Sort the two team groups
    if (group.teams.length === 2) {
      group.teams.sort(twoTeamBreaker)
    } else {
      // The multi team tie breaker goes until we get an advantage team
      // when this happens, we redo the tie breaker with the rest of the teams
      const { advantage, rest } = multiTeamBreaker(group.teams)

      if (advantage) {
        tiedTeams[i] = { teams: [advantage, ...rest], index: group.index }
        group = tiedTeams[i]
        tiedTeams.splice(i + 1, 0, { teams: rest, index: group.index + 1 })
      } else {
        //Continue until we have an advantage team (the coin toss plays out)
        i--
        continue
      }
    }

    recordSorted = reinsertTiedGroup(group, recordSorted)
    // Update the amount of teams in group to make sure it is consistent
    if (i < tiedTeams.length - 1) {
      tiedTeams[i].teams = group.teams.slice(
        0,
        tiedTeams[i + 1].index - group.index
      )
    }
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
