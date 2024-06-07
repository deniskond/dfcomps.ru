import { WorldspawnMapInfoInterface } from '@dfcomps/contracts';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { getMapLevelshot } from '../helpers/get-map-levelshot';

@Injectable()
export class WorldspawnParseService {
  public async getWorldspawnMapInfo(map: string): Promise<WorldspawnMapInfoInterface> {
    const url = `http://ws.q3df.org/map/${map}/`;
    let mapPageHtml: string;

    try {
      mapPageHtml = (await axios.get(url)).data;
    } catch (e) {
      throw new NotFoundException(`Map ${map} was not found on worldspawn`);
    }

    if (mapPageHtml.includes('A server error occured. Please try again later.')) {
      throw new NotFoundException(`Map ${map} was not found on worldspawn`);
    }

    const weaponsRegex = /\<td\>Weapons\<\/td\>((.*\n)*?)(.*?)\<\/td\>/;
    const weaponsMatches = mapPageHtml.match(weaponsRegex);
    const mapWeapons: WorldspawnMapInfoInterface['weapons'] = {
      grenade: false,
      rocket: false,
      plasma: false,
      lightning: false,
      bfg: false,
      railgun: false,
      shotgun: false,
      grapple: false,
      machinegun: false,
      gauntlet: false,
    };

    let isWeaponFound = false;

    if (weaponsMatches) {
      const weaponsHtml = weaponsMatches[0];

      const weaponsIcons: string[] = [
        'iconw_grenade',
        'iconw_rocket',
        'iconw_plasma',
        'iconw_bfg',
        'iconw_gauntlet',
        'iconw_machinegun',
        'iconw_shotgun',
        'iconw_lightning',
        'iconw_railgun',
        'iconw_grapple',
      ];

      weaponsIcons.forEach((icon: string) => {
        if (weaponsHtml.includes(icon)) {
          mapWeapons[icon.slice(6) as keyof WorldspawnMapInfoInterface['weapons']] = true;
          isWeaponFound = true;
        }
      });
    }

    if (!isWeaponFound) {
      mapWeapons.gauntlet = true;
    }

    const authorRegex = /\<td\>Author\<\/td\>((.*\n)*?)(.*?)link\"\>(.*?)\<\/a\>\<\/td\>/;
    const authorMatches = mapPageHtml.match(authorRegex);
    const pk3Regex = /\<a\shref=\"\/maps\/downloads\/(.*?)\.pk3/;
    const pk3Matches = mapPageHtml.match(pk3Regex);

    if (!pk3Matches) {
      throw new InternalServerErrorException(`Could not parse pk3 link for map ${map}`);
    }

    const sizeRegex = /\<td\>File size(.*)\n(.*)title=\"(.*?)\s/;
    const sizeMatches = mapPageHtml.match(sizeRegex);

    if (!sizeMatches) {
      throw new InternalServerErrorException(`Could not parse size for map ${map}`);
    }

    return {
      name: map,
      size: sizeMatches[3],
      author: authorMatches && authorMatches.length === 5 ? authorMatches[4] : 'Unknown',
      pk3: `https://ws.q3df.org/maps/downloads/${pk3Matches[1]}.pk3`,
      weapons: mapWeapons,
      levelshot: getMapLevelshot(map),
    };
  }
}
