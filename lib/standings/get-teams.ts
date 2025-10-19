import {
  BigXiiGame,
  BigXiiGameRaw,
  BigXiiSchool,
  BigXiiSchoolWithGames,
  Conference,
  SimulationGame,
} from '../games-info';
import { calculateRecord, getStartAndEndDates } from './utils';

const conferenceUrls: Record<Conference, string> = {
  'big-12':
    'https://big12sports.com/services/responsive-calendar.ashx?start=08%2F29%2F2024&end=2024-11-30+23%3A59%3A59&sport_id=4&school_id=0',
  acc: 'https://theacc.com/services/responsive-calendar.ashx?start=08%2F24%2F2024&end=2024-11-30+23%3A59%3A59&sport_id=3&school_id=0',
};

export const getGames = async (
  conference: Conference
): Promise<BigXiiGameRaw[]> => {
  const { start, end } = getStartAndEndDates();
  const url = new URL(conferenceUrls[conference]);
  url.searchParams.set('start', start);
  url.searchParams.set('end', end);
  const response = await fetch(url, {
    next: { revalidate: 3600 },
  });
  const data = await response.json();

  return data as BigXiiGameRaw[];
};

export const getBigXiiSchools = async (
  games: BigXiiGameRaw[],
  simulations: SimulationGame[]
): Promise<BigXiiSchoolWithGames[]> => {
  const schools = new Map<number, BigXiiSchool>();
  games.forEach((game) => {
    let school = schools.get(game.school.id);
    let opponent = schools.get(game.opponent.id);
    if (!school) {
      school = game.school;
      schools.set(game.school.id, game.school);
    }

    if (!opponent) {
      opponent = game.opponent;
      schools.set(game.opponent.id, opponent);
    }
  });

  const allSchools: BigXiiSchoolWithGames[] = Array.from(schools.values()).map(
    (school) => {
      return {
        ...school,
        games: new Map<number, BigXiiGame>(),
        allGames: [],
        record: { wins: 0, losses: 0 },
        overallRecord: { wins: 0, losses: 0 },
      };
    }
  );

  const conferenceGames = games
    .filter((game) => game.is_conference)
    .map((g) => g.id);
  games.forEach((game) => {
    const school = allSchools.find((school) => school.id === game.school.id);
    const opponent = allSchools.find(
      (school) => school.id === game.opponent.id
    );
    if (!school || !opponent) throw new Error("Schools weren't found");

    const simulationGame = simulations.find((sim) => sim.gameId === game.id);
    const result = simulationGame?.result ?? game.result?.status ?? '';

    const gameWithSchool: BigXiiGame = {
      ...game,
      school,
      opponent,
      result,
    };
    school.allGames.push(gameWithSchool);
    opponent.allGames.push(gameWithSchool);

    if (!game.is_conference) return gameWithSchool;

    school.games.set(game.opponent.id, gameWithSchool);
    opponent.games.set(game.school.id, gameWithSchool);

    return gameWithSchool;
  });

  allSchools.forEach((school) => {
    school.record = calculateRecord(school, Array.from(school.games.values()));
    school.overallRecord = calculateRecord(school, school.allGames);
  });

  return allSchools.filter((school) =>
    school.allGames.find((g) => conferenceGames.includes(g.id))
  );
};
