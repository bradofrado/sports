import { describe, expect, it } from 'vitest'
import { getStandings } from './get-standings'
import { BigXiiGame, BigXiiSchoolWithGames } from '../games-info'

describe('get-standings', () => {
  const expectStanding = (
    sorted: BigXiiSchoolWithGames[],
    expected: string
  ) => {
    const resultStr = `[${sorted.map((school) => school.title).join(', ')}]`
    expect(resultStr).toBe(expected)
  }

  const addGame = (game: BigXiiGame) => {
    game.school.games.set(game.opponent.id, game)
    game.opponent.games.set(game.school.id, game)
  }

  it('should sort 4 way tie where 2 teams have lost to the tie winner (winner by strength of schedule) and 1 team has won', () => {
    const school1: BigXiiSchoolWithGames = {
      id: 1,
      title: 'Kansas St.',
      games: new Map(),
      allGames: [],
      overallRecord: { wins: 5, losses: 1 },
      record: { wins: 5, losses: 1 },
    }
    const school2: BigXiiSchoolWithGames = {
      id: 2,
      title: 'Colorado',
      games: new Map(),
      allGames: [],
      overallRecord: { wins: 5, losses: 1 },
      record: { wins: 5, losses: 1 },
    }
    const school3: BigXiiSchoolWithGames = {
      id: 3,
      title: 'BYU',
      games: new Map(),
      allGames: [],
      overallRecord: { wins: 5, losses: 1 },
      record: { wins: 5, losses: 1 },
    }
    const school4: BigXiiSchoolWithGames = {
      id: 4,
      title: 'Iowa St.',
      games: new Map(),
      allGames: [],
      overallRecord: { wins: 5, losses: 1 },
      record: { wins: 5, losses: 1 },
    }
    const school5: BigXiiSchoolWithGames = {
      id: 5,
      title: 'Kansas',
      games: new Map(),
      allGames: [],
      overallRecord: { wins: 4, losses: 2 },
      record: { wins: 4, losses: 2 },
    }
    const school6: BigXiiSchoolWithGames = {
      id: 6,
      title: 'Texas Jr.',
      games: new Map(),
      allGames: [],
      overallRecord: { wins: 1, losses: 5 },
      record: { wins: 1, losses: 5 },
    }
    const school7: BigXiiSchoolWithGames = {
      id: 7,
      title: 'Texas',
      games: new Map(),
      allGames: [],
      overallRecord: { wins: 0, losses: 6 },
      record: { wins: 0, losses: 6 },
    }

    addGame({
      id: 1,
      school: school1,
      opponent: school2,
      is_conference: true,
      result: 'W',
      date: '',
    })

    addGame({
      id: 2,
      school: school1,
      opponent: school3,
      is_conference: true,
      result: 'L',
      date: '',
    })

    addGame({
      id: 3,
      school: school1,
      opponent: school4,
      is_conference: true,
      result: 'W',
      date: '',
    })

    addGame({
      id: 4,
      school: school1,
      opponent: school5,
      is_conference: true,
      result: 'W',
      date: '',
    })
    addGame({
      id: 5,
      school: school2,
      opponent: school5,
      is_conference: true,
      result: 'W',
      date: '',
    })
    addGame({
      id: 6,
      school: school3,
      opponent: school5,
      is_conference: true,
      result: 'L',
      date: '',
    })
    addGame({
      id: 7,
      school: school4,
      opponent: school5,
      is_conference: true,
      result: 'W',
      date: '',
    })
    addGame({
      id: 8,
      school: school2,
      opponent: school6,
      is_conference: true,
      result: 'W',
      date: '',
    })
    addGame({
      id: 9,
      school: school3,
      opponent: school6,
      is_conference: true,
      result: 'W',
      date: '',
    })
    addGame({
      id: 10,
      school: school4,
      opponent: school7,
      is_conference: true,
      result: 'W',
      date: '',
    })
    addGame({
      id: 11,
      school: school6,
      opponent: school7,
      is_conference: true,
      result: 'W',
      date: '',
    })

    const sorted = getStandings([school1, school2, school3, school4])
    expectStanding(
      sorted.map(({ team }) => team),
      '[Kansas St., BYU, Colorado, Iowa St.]'
    )
  })
})
