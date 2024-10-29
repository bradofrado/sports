import { BigXiiGameRaw } from '../games-info'

export const getTeams = async (): Promise<BigXiiGameRaw[]> => {
  const response = await fetch(
    'https://big12sports.com/services/responsive-calendar.ashx?start=08%2F29%2F2024&end=2024-11-30+23%3A59%3A59&sport_id=4&school_id=0',
    {
      cache: 'force-cache',
      next: { revalidate: 3600 },
    }
  )
  const data = await response.json()

  return data as BigXiiGameRaw[]
}
