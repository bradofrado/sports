import { getStandings } from '../actions'
import { CenterLayout } from '../center-layout'

export default async function SimulatorPage() {
  const schools = await getStandings()
  return (
    <CenterLayout>
      <h1 className='text-center text-4xl'>BIG XII Simulator</h1>
      {schools.map((school) => (
        <div key={school.id}>
          <p>
            {school.title} ({school.overallRecord.wins}-
            {school.overallRecord.losses}) ({school.record.wins}-
            {school.record.losses})
          </p>
        </div>
      ))}
    </CenterLayout>
  )
}

//Teams:
// BYU Cougars
// ISU
// Iowa State Cyclones
// KSU
// Kansas State Wildcats
// Colorado Buffaloes
// TCU Horned Frogs
// Texas Tech Red Raiders
// Cincinnati Bearcats
// West Virginia Mountaineers
// Arizona State Sun Devils
// Baylor Bears
// Houston Cougars
// Arizona Wildcats
// Utah Utes
// UCF Knights
// Kansas Jayhawks
// Oklahoma State Cowboys
// const teams: FootballTeam[] = [
//   { id: 'BYU', name: 'BYU Cougars' },
//   { id: 'ISU', name: 'Iowa State Cyclones' },
//   { id: 'KSU', name: 'Kansas State Wildcats' },
//   { id: 'CU', name: 'Colorado Buffaloes' },
//   { id: 'TCU', name: 'TCU Horned Frogs' },
//   { id: 'TTU', name: 'Texas Tech Red Raiders' },
//   { id: 'CIN', name: 'Cincinnati Bearcats' },
//   { id: 'WVU', name: 'West Virginia Mountaineers' },
//   { id: 'ASU', name: 'Arizona State Sun Devils' },
//   { id: 'BU', name: 'Baylor Bears' },
//   { id: 'UH', name: 'Houston Cougars' },
//   { id: 'AZ', name: 'Arizona Wildcats' },
//   { id: 'UTAH', name: 'Utah Utes' },
//   { id: 'UCF', name: 'UCF Knights' },
//   { id: 'KU', name: 'Kansas Jayhawks' },
//   { id: 'OSU', name: 'Oklahoma State Cowboys' },
// ]

// interface FootballMatch {
//   home: FootballTeam
//   away: FootballTeam
//   date: Date
//   result?: FootballMatchResult
// }

// interface FootballMatchResult {
//   home: number
//   away: number
//   winner: FootballTeam
// }

// interface FootballTeam {
//   id: string
//   name: string
// }

// interface FootballRecord {
//   team: FootballTeam
//   wins: number
//   losses: number
// }
