'use client'
import { TableCell, TableRow } from '@/components/ui/table'
import { BigXiiSchoolWithGames } from '@/lib/games-info'
import { useRouter } from 'next/navigation'

export const TeamRow: React.FunctionComponent<{
  school: BigXiiSchoolWithGames
}> = ({ school }) => {
  const router = useRouter()
  const onTeamClick = (team: BigXiiSchoolWithGames) => {
    const url = new URL(window.location.href)
    url.searchParams.set('drawer', String(team.id))
    router.push(url.toString())
  }
  return (
    <TableRow
      className='hover:cursor-pointer'
      key={school.id}
      onClick={() => onTeamClick(school)}
    >
      <TableCell>{school.title}</TableCell>
      <TableCell>
        {school.overallRecord.wins}-{school.overallRecord.losses} (
        {school.record.wins}-{school.record.losses})
      </TableCell>
    </TableRow>
  )
}
