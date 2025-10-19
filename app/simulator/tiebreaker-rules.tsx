'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { type Tiebreaker } from '@/lib/standings/tiebreakers';
import { FC, useState } from 'react';

export const TiebreakerRules: FC<{
  tiebreakers: Omit<Tiebreaker, 'func'>[];
}> = ({ tiebreakers }) => {
  const [multiTeamEnabled, setMultiTeamEnabled] = useState(false);
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-semibold mt-4">Tiebreaker Rules</h2>

      <Label>{multiTeamEnabled ? 'Multi Team' : 'Two Team'}</Label>
      <Switch
        checked={multiTeamEnabled}
        onCheckedChange={setMultiTeamEnabled}
      />
      {multiTeamEnabled ? (
        <p className="text-xs">
          In the event of a tie between more than two teams, the following
          procedures will be used. After one team has an advantage and is
          “seeded”, all remaining teams in the multipleteam tiebreaker will
          repeat the tie-breaking procedure. If at any point the multiple-team
          tie is reduced to two teams, the two-team tie-breaking procedure will
          be applied.
        </p>
      ) : null}
      <div className="space-y-2">
        {tiebreakers.map((tiebreaker) => (
          <div key={tiebreaker.ruleNumber}>
            {tiebreaker.ruleNumber}. {tiebreaker.title}
            {getDescriptionFormatted(
              multiTeamEnabled
                ? tiebreaker.multiTeamDescription
                : tiebreaker.twoTeamDescription
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const getDescriptionFormatted = (description: string) => {
  const splitDescription = description.split(/(?=\b\d+\.)/g);
  const bulletPoints = splitDescription.slice(1);
  const mainDescription = splitDescription[0];

  return (
    <p className="text-xs">
      {mainDescription}
      {bulletPoints.length > 0 ? (
        <ul className="ml-3 space-y-1">
          {bulletPoints.map((point) => (
            <li key={point}>{point.trim()}</li>
          ))}
        </ul>
      ) : null}
    </p>
  );
};
