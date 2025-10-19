import { BigXiiSchoolWithGames } from '../games-info';
import {
  AdvantageInfo,
  multiTeamTiebreaker,
  twoTeamTiebreaker,
} from './tiebreakers';
import { groupTiedTeams, sortRecordPercentage, TiebreakerGroup } from './utils';

export interface TeamInfo {
  team: BigXiiSchoolWithGames;
  advantageInfo: AdvantageInfo[];
}
export const getStandings = (schools: BigXiiSchoolWithGames[]): TeamInfo[] => {
  let recordSorted = schools.slice().sort(sortRecordPercentage);
  const tiedTeams = groupTiedTeams(recordSorted);
  const teamsAdvantageInfo: TeamInfo[] = recordSorted.map((team) => ({
    team,
    advantageInfo: [],
  }));

  for (let i = 0; i < tiedTeams.length; i++) {
    let group = tiedTeams[i];
    if (group.teams.length === 1) continue;

    const twoTeamBreaker = twoTeamTiebreaker(tiedTeams);
    const multiTeamBreaker = multiTeamTiebreaker(tiedTeams);

    // Sort the two team groups
    if (group.teams.length === 2) {
      const { result, allResults } = twoTeamBreaker(
        group.teams[0],
        group.teams[1]
      );
      group.teams.sort((a, b) => {
        if (a === group.teams[0] && b === group.teams[1]) return result;

        return -result;
      });
      setAdvantageInfo(
        group.teams[0],
        teamsAdvantageInfo,
        allResults.map((result) => result.advantageInfo)
      );
    } else {
      // The multi team tie breaker goes until we get an advantage team
      // when this happens, we redo the tie breaker with the rest of the teams
      const { advantage, rest, allResults } = multiTeamBreaker(group.teams);

      tiedTeams[i] = { teams: [advantage, ...rest], index: group.index };
      group = tiedTeams[i];
      tiedTeams.splice(i + 1, 0, { teams: rest, index: group.index + 1 });
      setAdvantageInfo(
        advantage,
        teamsAdvantageInfo,
        allResults.map((result) => result.advantageInfo)
      );
    }

    recordSorted = reinsertTiedGroup(group, recordSorted);
    // Update the amount of teams in group to make sure it is consistent
    if (i < tiedTeams.length - 1) {
      tiedTeams[i].teams = group.teams.slice(
        0,
        tiedTeams[i + 1].index - group.index
      );
    }
  }

  return recordSorted.map((team) => {
    const info = teamsAdvantageInfo.find(
      (teamInfo) => teamInfo.team.id === team.id
    );
    if (!info) throw new Error('Team info not found');
    return info;
  });
};

const setAdvantageInfo = (
  advantageTeam: BigXiiSchoolWithGames,
  teamsAdvantageInfo: TeamInfo[],
  advantageInfo: AdvantageInfo[]
) => {
  teamsAdvantageInfo.forEach((teamInfo) => {
    if (teamInfo.team.id === advantageTeam.id) {
      teamInfo.advantageInfo = advantageInfo;
    }
  });
};

const reinsertTiedGroup = (
  group: TiebreakerGroup,
  sorted: BigXiiSchoolWithGames[]
) =>
  sorted
    .slice(0, group.index)
    .concat(group.teams)
    .concat(sorted.slice(group.index + group.teams.length));
