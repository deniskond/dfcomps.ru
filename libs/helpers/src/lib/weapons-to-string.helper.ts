export function mapWeaponsToString(weapons: Record<string, boolean>): string {
  let weaponsString = '';

  if (weapons['gauntlet']) weaponsString += 'U';
  if (weapons['rocket']) weaponsString += 'R';
  if (weapons['shotgun']) weaponsString += 'S';
  if (weapons['railgun']) weaponsString += 'I';
  if (weapons['lightning']) weaponsString += 'L';
  if (weapons['grenade']) weaponsString += 'G';
  if (weapons['plasma']) weaponsString += 'P';
  if (weapons['bfg']) weaponsString += 'B';
  if (weapons['grapple']) weaponsString += 'H';

  return weaponsString;
}
