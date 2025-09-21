import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import axios, { AxiosResponse } from 'axios';
import * as sharp from 'sharp';
import { GlobalConfig } from '../configs/global-config';

@Injectable()
export class LevelshotsService {
  // This is used to calculate if levelshot is present, since WorldSpawn answers with 200 and default levelshot on unknown map
  private readonly NO_LEVELSHOT_FILESIZE = 11419;

  public async downloadLevelshot(mapname: string): Promise<void> {
    if (!GlobalConfig.settings.isWorldspawnParserEnabled) {
      return;
    }

    if (fs.existsSync(process.env.DFCOMPS_FILES_ABSOLUTE_PATH + `/images/maps/${mapname}.jpg`)) {
      return;
    }

    if (!fs.existsSync(process.env.DFCOMPS_FILES_ABSOLUTE_PATH + '/images/maps')) {
      fs.mkdirSync(process.env.DFCOMPS_FILES_ABSOLUTE_PATH + '/images/maps');
    }

    let imageBuffer: Buffer | null = null;

    // Authorshots should be a priority over levelshots
    const authorshotResponse: AxiosResponse = await axios.get(
      `http://ws.q3df.org/images/authorshots/512x384/${mapname}.jpg`,
      {
        responseType: 'arraybuffer',
      },
    );

    if (authorshotResponse.data.length !== this.NO_LEVELSHOT_FILESIZE) {
      imageBuffer = authorshotResponse.data;
    } else {
      const levelshotResponse: AxiosResponse = await axios.get(
        `http://ws.q3df.org/images/levelshots/512x384/${mapname}.jpg`,
        {
          responseType: 'arraybuffer',
        },
      );

      if (levelshotResponse.data.length !== this.NO_LEVELSHOT_FILESIZE) {
        imageBuffer = levelshotResponse.data;
      }
    }

    if (!imageBuffer) {
      return;
    }

    const resizedImage: Buffer = await sharp(imageBuffer)
      .resize(512, 384, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 80 })
      .toBuffer()
      .catch(() => {
        throw new InternalServerErrorException('Failed to resize image');
      });

    fs.writeFileSync(process.env.DFCOMPS_FILES_ABSOLUTE_PATH + `/images/maps/${mapname}.jpg`, resizedImage);
  }
}
