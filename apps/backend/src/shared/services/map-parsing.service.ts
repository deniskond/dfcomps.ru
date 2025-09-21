import { ParsedMapInfoInterface } from '@dfcomps/contracts';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { GlobalConfig } from '../configs/global-config';

@Injectable()
export class MapParsingService {
  public async getParsedMapInfo(map: string): Promise<ParsedMapInfoInterface> {
    return GlobalConfig.settings.isWorldspawnParserEnabled
      ? this.getWorldspawnMapInfo(map)
      : this.getDfracingMapInfo(map);
  }

  private async getWorldspawnMapInfo(map: string): Promise<ParsedMapInfoInterface> {
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
    const mapWeapons: ParsedMapInfoInterface['weapons'] = {
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
          mapWeapons[icon.slice(6) as keyof ParsedMapInfoInterface['weapons']] = true;
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
      levelshot: `https://ws.q3df.org/images/authorshots/512x384/${map}.jpg`,
    };
  }

  private async getDfracingMapInfo(map: string): Promise<ParsedMapInfoInterface> {
    const url = `https://defrag.racing/maps/${map}`;
    let mapPageHtml: string;

    try {
      mapPageHtml = (await axios.get(url)).data;
    } catch (e) {
      throw new NotFoundException(`Map ${map} was not found on dfracing`);
    }

    const weaponsRegex = /weapons&quot;:&quot;([^&]*)&quot;/;
    const weaponsMatches = mapPageHtml.match(weaponsRegex);
    const mapWeapons: ParsedMapInfoInterface['weapons'] = {
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

    if (weaponsMatches && weaponsMatches.length > 1) {
      const weaponsString = weaponsMatches[1];

      if (!weaponsString.trim() || weaponsString.includes('ga')) {
        mapWeapons.gauntlet = true;
      }

      if (weaponsString.includes('mg')) {
        mapWeapons.machinegun = true;
      }

      if (weaponsString.includes('sg')) {
        mapWeapons.shotgun = true;
      }

      if (weaponsString.includes('gl')) {
        mapWeapons.grenade = true;
      }

      if (weaponsString.includes('rl')) {
        mapWeapons.rocket = true;
      }

      if (weaponsString.includes('lg')) {
        mapWeapons.lightning = true;
      }

      if (weaponsString.includes('rg')) {
        mapWeapons.railgun = true;
      }

      if (weaponsString.includes('pg')) {
        mapWeapons.plasma = true;
      }

      if (weaponsString.includes('bfg')) {
        mapWeapons.bfg = true;
      }

      if (weaponsString.includes('hook')) {
        mapWeapons.grapple = true;
      }
    }

    const authorRegex = /author&quot;:&quot;([^&]*)&quot;/;
    const authorMatches = mapPageHtml.match(authorRegex);
    const pk3Regex = /pk3&quot;:&quot;([^&]*)&quot;/;
    const pk3Matches = mapPageHtml.match(pk3Regex);

    if (!pk3Matches) {
      throw new InternalServerErrorException(`Could not parse pk3 link for map ${map}`);
    }

    const sizeRegex = /pk3_size&quot;:([^&]*),&quot;/;
    const sizeMatches = mapPageHtml.match(sizeRegex);

    if (!sizeMatches) {
      throw new InternalServerErrorException(`Could not parse size for map ${map}`);
    }

    return {
      name: map,
      size: (Number(sizeMatches[1]) / (1024 * 1024)).toFixed(2),
      author: authorMatches && authorMatches.length > 1 ? authorMatches[1] : 'Unknown',
      pk3: `https://ws.q3df.org/maps/downloads/` + pk3Matches[1],
      weapons: mapWeapons,
      levelshot: `https://ws.q3df.org/images/authorshots/512x384/${map}.jpg`,
    };
  }
}
