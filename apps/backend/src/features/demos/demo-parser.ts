import { Injectable } from '@nestjs/common';
import { Physics } from '@dfcomps/contracts';
import { DemoConfigInterface } from './demo-config.interface';
import { Q3Const } from './demo-parser/const/q3-const';
import { Q3DemoParser } from './demo-parser/parser/q3-demo-parser';
import { Q3Utils } from './demo-parser/utils/q3-utils';

@Injectable()
export class DemoParser {
  public parseDemo(demoName: string): DemoConfigInterface | null {
    let rawInfo: ReturnType<typeof Q3DemoParser.getRawInfo>;

    try {
      rawInfo = Q3DemoParser.getRawInfo(demoName);
    } catch {
      return null;
    }

    const { clc, client } = rawInfo;
    const conf = clc.configs;

    const result: DemoConfigInterface = {} as DemoConfigInterface;

    if (conf[Q3Const.Q3_DEMO_CFG_FIELD_CLIENT]) {
      result.client = Q3Utils.splitConfig(conf[Q3Const.Q3_DEMO_CFG_FIELD_CLIENT]) as DemoConfigInterface['client'];
      result.physic = (result.client as any).df_promode === '0' ? Physics.VQ3 : Physics.CPM;
    }

    if (conf[Q3Const.Q3_DEMO_CFG_FIELD_GAME]) {
      result.game = Q3Utils.splitConfig(conf[Q3Const.Q3_DEMO_CFG_FIELD_GAME]) as DemoConfigInterface['game'];
    }

    if (conf[Q3Const.Q3_DEMO_CFG_FIELD_PLAYER]) {
      result.player = Q3Utils.splitConfig(conf[Q3Const.Q3_DEMO_CFG_FIELD_PLAYER]) as DemoConfigInterface['player'];
    }

    result.raw = conf as unknown as DemoConfigInterface['raw'];

    // New fields from full snapshot parsing
    result.clientEvents = client.clientEvents.map((e) => ({
      time: e.time,
      timeHasError: e.timeHasError,
      serverTime: e.serverTime,
      playerNum: e.playerNum,
      playerMode: e.playerMode,
      speed: e.speed,
      eventStartFile: e.eventStartFile,
      eventStartTime: e.eventStartTime,
      eventTimeReset: e.eventTimeReset,
      eventFinish: e.eventFinish,
      eventCheckPoint: e.eventCheckPoint,
      eventSomeTrigger: e.eventSomeTrigger,
      eventChangePmType: e.eventChangePmType,
      eventChangeUser: e.eventChangeUser,
    }));
    result.isCpmInParams = client.isCpmInParams;
    result.isCpmInSnapshots = client.isCpmInSnapshots;
    result.isCheatsOn = client.isCheatsOn;
    result.isOnline = client.isOnline;
    result.maxSpeed = client.maxSpeed;
    result.dfvers = client.dfvers;

    return result;
  }
}
