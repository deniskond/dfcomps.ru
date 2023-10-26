export interface WorldspawnMapInfoInterface {
  name: string;
  size: number;
  author: string;
  pk3: string;
  levelshot: string;
  weapons: {
    grenade: boolean;
    rocket: boolean;
    plasma: boolean;
    lightning: boolean;
    bfg: boolean;
    railgun: boolean;
    shotgun: boolean;
    grapple: boolean;
    machinegun: boolean;
    gauntlet: boolean;
  }
}
