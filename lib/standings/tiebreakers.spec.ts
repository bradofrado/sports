import { describe, expect, it } from 'vitest'
import {
  combinedWinPercentageTiebreaker,
  headToHeadTiebreaker,
  Tiebreaker,
  winPercentageTiebreaker,
} from './tiebreakers'
import { BigXiiGame, BigXiiSchoolWithGames } from '../games-info'
import { sortRecordPercentage } from './utils'

describe('tiebreakers', () => {
  const expectStanding = (
    schools: BigXiiSchoolWithGames[],
    tiebreaker: Tiebreaker,
    expected: string
  ) => {
    const sorted = schools.slice().sort((a, b) => tiebreaker(a, b, schools))

    const resultStr = `[${sorted.map((school) => school.title).join(', ')}]`
    expect(resultStr).toBe(expected)
  }
  describe('sortRecordPercentage', () => {
    it('should sort better percentage first', () => {
      const school1: BigXiiSchoolWithGames = {
        id: 1,
        title: 'Baylor',
        games: new Map(),
        allGames: [],
        overallRecord: { wins: 5, losses: 2 },
        record: { wins: 4, losses: 1 },
      }
      const school2: BigXiiSchoolWithGames = {
        id: 2,
        title: 'BYU',
        games: new Map(),
        allGames: [],
        overallRecord: { wins: 7, losses: 0 },
        record: { wins: 5, losses: 0 },
      }

      expectStanding([school1, school2], sortRecordPercentage, '[BYU, Baylor]')
    })
  })

  describe('headToHeadTiebreaker', () => {
    it('Should sort better head to head first for away team win', () => {
      const school1: BigXiiSchoolWithGames = {
        id: 1,
        title: 'Baylor',
        games: new Map(),
        allGames: [],
        overallRecord: { wins: 5, losses: 2 },
        record: { wins: 4, losses: 1 },
      }
      const school2: BigXiiSchoolWithGames = {
        id: 2,
        title: 'BYU',
        games: new Map(),
        allGames: [],
        overallRecord: { wins: 7, losses: 0 },
        record: { wins: 5, losses: 0 },
      }
      const game: BigXiiGame = {
        id: 1,
        school: school1,
        opponent: school2,
        is_conference: true,
        result: 'L',
        date: '',
      }
      school1.games.set(school2.id, game)
      school2.games.set(school1.id, game)

      expectStanding([school1, school2], headToHeadTiebreaker, '[BYU, Baylor]')
    })

    it('Should sort better head to head first for home team win', () => {
      const school1: BigXiiSchoolWithGames = {
        id: 1,
        title: 'Baylor',
        games: new Map(),
        allGames: [],
        overallRecord: { wins: 5, losses: 2 },
        record: { wins: 4, losses: 1 },
      }
      const school2: BigXiiSchoolWithGames = {
        id: 2,
        title: 'BYU',
        games: new Map(),
        allGames: [],
        overallRecord: { wins: 7, losses: 0 },
        record: { wins: 5, losses: 0 },
      }
      const game: BigXiiGame = {
        id: 1,
        school: school2,
        opponent: school1,
        is_conference: true,
        result: 'W',
        date: '',
      }
      school1.games.set(school2.id, game)
      school2.games.set(school1.id, game)

      expectStanding([school1, school2], headToHeadTiebreaker, '[BYU, Baylor]')
    })
  })

  describe('winPercentageTiebreaker', () => {
    it('Should sort better win percentage first', () => {
      const school1: BigXiiSchoolWithGames = {
        id: 1,
        title: 'Baylor',
        games: new Map(),
        allGames: [],
        overallRecord: { wins: 5, losses: 2 },
        record: { wins: 4, losses: 1 },
      }
      const school2: BigXiiSchoolWithGames = {
        id: 2,
        title: 'BYU',
        games: new Map(),
        allGames: [],
        overallRecord: { wins: 7, losses: 0 },
        record: { wins: 5, losses: 0 },
      }
      const school3: BigXiiSchoolWithGames = {
        id: 3,
        title: 'UCF',
        games: new Map(),
        allGames: [],
        overallRecord: { wins: 7, losses: 0 },
        record: { wins: 5, losses: 0 },
      }
      const nonCommonSchool: BigXiiSchoolWithGames = {
        id: 4,
        title: 'Utah',
        games: new Map(),
        allGames: [],
        overallRecord: { wins: 7, losses: 0 },
        record: { wins: 5, losses: 0 },
      }

      const game1: BigXiiGame = {
        id: 1,
        school: school1,
        opponent: school3,
        is_conference: true,
        result: 'L',
        date: '',
      }
      const game2: BigXiiGame = {
        id: 2,
        school: school2,
        opponent: school3,
        is_conference: true,
        result: 'W',
        date: '',
      }
      const nonCommonGame: BigXiiGame = {
        id: 2,
        school: school1,
        opponent: nonCommonSchool,
        is_conference: true,
        result: 'W',
        date: '',
      }
      school1.games.set(school3.id, game1)
      school2.games.set(school3.id, game2)
      school1.games.set(nonCommonSchool.id, nonCommonGame)

      expectStanding(
        [school1, school2],
        winPercentageTiebreaker,
        '[BYU, Baylor]'
      )
    })

    it('Should not sort with same win percentage', () => {
      const school1: BigXiiSchoolWithGames = {
        id: 1,
        title: 'Baylor',
        games: new Map(),
        allGames: [],
        overallRecord: { wins: 5, losses: 2 },
        record: { wins: 4, losses: 1 },
      }
      const school2: BigXiiSchoolWithGames = {
        id: 2,
        title: 'BYU',
        games: new Map(),
        allGames: [],
        overallRecord: { wins: 7, losses: 0 },
        record: { wins: 5, losses: 0 },
      }
      const school3: BigXiiSchoolWithGames = {
        id: 3,
        title: 'UCF',
        games: new Map(),
        allGames: [],
        overallRecord: { wins: 7, losses: 0 },
        record: { wins: 5, losses: 0 },
      }
      const school4: BigXiiSchoolWithGames = {
        id: 4,
        title: 'Utah',
        games: new Map(),
        allGames: [],
        overallRecord: { wins: 7, losses: 0 },
        record: { wins: 5, losses: 0 },
      }

      const game1: BigXiiGame = {
        id: 1,
        school: school1,
        opponent: school3,
        is_conference: true,
        result: 'L',
        date: '',
      }
      const game2: BigXiiGame = {
        id: 2,
        school: school2,
        opponent: school3,
        is_conference: true,
        result: 'W',
        date: '',
      }
      const game3: BigXiiGame = {
        id: 2,
        school: school1,
        opponent: school4,
        is_conference: true,
        result: 'W',
        date: '',
      }
      const game4: BigXiiGame = {
        id: 2,
        school: school2,
        opponent: school4,
        is_conference: true,
        result: 'L',
        date: '',
      }
      school1.games.set(school3.id, game1)
      school2.games.set(school3.id, game2)
      school1.games.set(school4.id, game3)
      school2.games.set(school4.id, game4)

      expectStanding(
        [school1, school2],
        winPercentageTiebreaker,
        '[Baylor, BYU]'
      )
    })
  })

  describe('winPercentageAgainstTopTiebreaker', () => {})

  describe('combinedWinPercentageTiebreaker', () => {
    it('Should sort better combined win percentage first', () => {
      const school1: BigXiiSchoolWithGames = {
        id: 1,
        title: 'Baylor',
        games: new Map(),
        allGames: [],
        overallRecord: { wins: 5, losses: 2 },
        record: { wins: 4, losses: 1 },
      }
      const school2: BigXiiSchoolWithGames = {
        id: 2,
        title: 'BYU',
        games: new Map(),
        allGames: [],
        overallRecord: { wins: 7, losses: 0 },
        record: { wins: 5, losses: 0 },
      }
      const school3: BigXiiSchoolWithGames = {
        id: 3,
        title: 'UCF',
        games: new Map(),
        allGames: [],
        overallRecord: { wins: 7, losses: 0 },
        record: { wins: 5, losses: 0 },
      }
      const school4: BigXiiSchoolWithGames = {
        id: 4,
        title: 'Utah',
        games: new Map(),
        allGames: [],
        overallRecord: { wins: 7, losses: 0 },
        record: { wins: 5, losses: 0 },
      }

      const game1: BigXiiGame = {
        id: 1,
        school: school1,
        opponent: school3,
        is_conference: true,
        result: 'L',
        date: '',
      }
      const game2: BigXiiGame = {
        id: 2,
        school: school2,
        opponent: school4,
        is_conference: true,
        result: 'W',
        date: '',
      }
      const game3: BigXiiGame = {
        id: 2,
        school: school3,
        opponent: school4,
        is_conference: true,
        result: 'L',
        date: '',
      }
      school1.games.set(game1.opponent.id, game1)
      school2.games.set(game2.opponent.id, game2)
      school3.games.set(game3.opponent.id, game3)
      school4.games.set(game3.school.id, game3)

      expectStanding(
        [school1, school2],
        combinedWinPercentageTiebreaker,
        '[BYU, Baylor]'
      )
    })
  })
})
