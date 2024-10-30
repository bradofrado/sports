export interface GameInfo {
  seasonId: string
  gameId: string
  name: string
}
export interface SportInfo {
  sportId: string
  games: GameInfo[]
  title: string
}
export const sports: SportInfo[] = [
  {
    sportId: 'F',
    title: 'Football',
    games: [
      {
        seasonId: 'F24',
        gameId: 'E01',
        name: 'Southern Illinois',
      },
      {
        seasonId: 'F24',
        gameId: 'E02',
        name: 'Kansas State',
      },
      {
        seasonId: 'F24',
        gameId: 'E03',
        name: 'Arizona',
      },
      {
        seasonId: 'F24',
        gameId: 'E04',
        name: 'Oklahoma State',
      },
      {
        seasonId: 'F24',
        gameId: 'E05',
        name: 'Kansas',
      },
      {
        seasonId: 'F24',
        gameId: 'E06',
        name: 'Houston',
      },
    ],
  },
  {
    sportId: 'B',
    title: 'Basketball',
    games: [
      {
        seasonId: 'B24',
        gameId: 'E01',
        name: 'Colorado Christian',
      },
    ],
  },
]
