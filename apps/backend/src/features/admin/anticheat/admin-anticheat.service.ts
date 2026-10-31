import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as moment from 'moment-timezone';
import {
  AnticheatDemoCheckInterface,
  AnticheatDemoCheckStatus,
  AnticheatDemoDisplayInterface,
  AnticheatDemoSourceInterface,
  AnticheatPlayerDisplayInterface,
  AnticheatPlayerScoresInterface,
} from '@dfcomps/contracts';
import { UserRoles, checkUserRoles, isSuperadmin } from '@dfcomps/auth';
import { AuthService } from '../../auth/auth.service';
import { CupDemo } from '../../../shared/entities/cup-demo.entity';
import { User } from '../../../shared/entities/user.entity';
import { UserAccessInterface } from '../../../shared/interfaces/user-access.interface';
import { LoggerService } from '../../../shared/services/logger.service';

export interface CheckerResponse {
  status: number;
  body: unknown;
}

const CHECKER_URL = process.env.NODE_ENV === 'production' ? 'http://dfcomps-anticheat:3000' : 'http://localhost:3000';
const CHECKED_DEMOS_PAGE_SIZE = 5000;
const MAX_POSTGRES_INTEGER = 2147483647;
const MAX_SIMULTANEOUS_PLAYER_REQUESTS = 5;
const DEFAULT_TIMEOUT_MS = 10000;
const CHECK_DEMO_TIMEOUT_MS = 30000;
const PUT_SCORES_TIMEOUT_MS = 120000;

@Injectable()
export class AdminAnticheatService {
  constructor(
    @InjectRepository(CupDemo) private readonly cupsDemosRepository: Repository<CupDemo>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly authService: AuthService,
    private readonly loggerService: LoggerService,
  ) {}

  public async getStatus(accessToken: string | undefined): Promise<CheckerResponse> {
    await this.assertSuperadmin(accessToken);

    return this.callChecker({ method: 'GET', url: '/admin/status' });
  }

  public async getCheckedDemos(accessToken: string | undefined): Promise<CheckerResponse> {
    await this.assertSuperadmin(accessToken);

    const demoIds: string[] = [];
    let nextPageCursor: string | null = null;

    do {
      const page: CheckerResponse = await this.callChecker({
        method: 'GET',
        url: '/admin/checked_demos',
        params: { limit: CHECKED_DEMOS_PAGE_SIZE, ...(nextPageCursor ? { after: nextPageCursor } : {}) },
      });

      if (page.status !== 200) {
        return page;
      }

      const { demo_ids, next } = page.body as { demo_ids: string[]; next: string | null };

      demoIds.push(...demo_ids);
      nextPageCursor = next;
    } while (nextPageCursor);

    return { status: 200, body: { demo_ids: demoIds } };
  }

  public async getDemoSources(
    accessToken: string | undefined,
    demoIds: string[],
  ): Promise<AnticheatDemoSourceInterface[]> {
    await this.assertSuperadmin(accessToken);

    const numericIds: number[] = demoIds.filter((demoId: string) => this.isPostgresInteger(demoId)).map(Number);

    if (!numericIds.length) {
      return [];
    }

    const demos: CupDemo[] = await this.cupsDemosRepository.find({
      where: { id: In(numericIds) },
      relations: { cup: true, user: true },
    });

    return demos.map((demo: CupDemo) => ({
      demoId: String(demo.id),
      playerId: String(demo.user.id),
      playerName: demo.user.displayed_nick,
      archiveUrl: demo.cup.archive_link || null,
      fileName: path.basename(demo.demopath),
    }));
  }

  public async getPlayerScores(accessToken: string | undefined): Promise<CheckerResponse> {
    await this.assertSuperadmin(accessToken);

    return this.callChecker({ method: 'GET', url: '/admin/player_scores' });
  }

  public async putPlayerScores(accessToken: string | undefined, body: unknown): Promise<CheckerResponse> {
    await this.assertSuperadmin(accessToken);

    const response: CheckerResponse = await this.callChecker({
      method: 'PUT',
      url: '/admin/player_scores',
      data: body,
      timeout: PUT_SCORES_TIMEOUT_MS,
    });

    if (response.status === 200) {
      await this.saveUserScores(body);
    }

    return response;
  }

  public async checkDemo(accessToken: string | undefined, demoId: number): Promise<AnticheatDemoCheckInterface> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.VALIDATOR])) {
      throw new UnauthorizedException('Unauthorized to check demo, VALIDATOR role needed');
    }

    const demo: CupDemo | null = await this.cupsDemosRepository.findOne({
      where: { id: demoId },
      relations: { cup: true },
    });

    if (!demo) {
      throw new NotFoundException(`Demo with id = ${demoId} not found`);
    }

    // Players can delete their demos until the cup ends, so demos are not checked before that
    if (moment().isBefore(moment(demo.cup.end_datetime))) {
      return { status: AnticheatDemoCheckStatus.NOT_STARTED };
    }

    if (demo.cup.rating_calculated) {
      return { status: AnticheatDemoCheckStatus.NOT_AVAILABLE };
    }

    const demoPath: string = path.join(
      process.env.DFCOMPS_FILES_ABSOLUTE_PATH!,
      `demos/cup${demo.cup.id}`,
      path.basename(demo.demopath),
    );

    if (!fs.existsSync(demoPath)) {
      return { status: AnticheatDemoCheckStatus.UNAVAILABLE };
    }

    const formData = new FormData();

    formData.append('demo_id', String(demo.id));
    formData.append('demo', new Blob([await fs.promises.readFile(demoPath)]), path.basename(demo.demopath));

    const { status, body }: CheckerResponse = await this.callChecker({
      method: 'POST',
      url: '/check_demo',
      data: formData,
      timeout: CHECK_DEMO_TIMEOUT_MS,
    });
    const { display, error } = (body ?? {}) as { display?: AnticheatDemoDisplayInterface; error?: string };

    if (status === 200 && display) {
      return { status: AnticheatDemoCheckStatus.CHECKED, display };
    }

    return {
      status: error === 'not_a_demo' ? AnticheatDemoCheckStatus.NOT_A_DEMO : AnticheatDemoCheckStatus.UNAVAILABLE,
    };
  }

  public async getCupPlayerScores(
    accessToken: string | undefined,
    cupId: number,
  ): Promise<AnticheatPlayerScoresInterface> {
    await this.assertSuperadmin(accessToken);

    const demos: CupDemo[] = await this.cupsDemosRepository.find({
      where: { cup: { id: cupId } },
      relations: { user: true },
    });
    const playerIds: number[] = [...new Set(demos.map((demo: CupDemo) => demo.user.id))];
    const scores: AnticheatPlayerScoresInterface['scores'] = [];

    for (let index = 0; index < playerIds.length; index += MAX_SIMULTANEOUS_PLAYER_REQUESTS) {
      const playerIdsBatch: number[] = playerIds.slice(index, index + MAX_SIMULTANEOUS_PLAYER_REQUESTS);

      scores.push(
        ...(await Promise.all(
          playerIdsBatch.map(async (playerId: number) => ({
            playerId,
            display: await this.getPlayerDisplay(playerId),
          })),
        )),
      );
    }

    return { scores };
  }

  private async saveUserScores(body: unknown): Promise<void> {
    const { scores } = body as { scores: { player_id: string; p_scripter: number }[] };

    await this.usersRepository.manager.transaction(async (manager: EntityManager) => {
      for (const { player_id, p_scripter } of scores.filter(({ player_id }) => this.isPostgresInteger(player_id))) {
        await manager.update(User, { id: Number(player_id) }, { antiscript_score: p_scripter });
      }
    });
  }

  private isPostgresInteger(id: string): boolean {
    return /^\d+$/.test(id) && Number(id) <= MAX_POSTGRES_INTEGER;
  }

  private async getPlayerDisplay(playerId: number): Promise<AnticheatPlayerDisplayInterface | null> {
    const { status, body }: CheckerResponse = await this.callChecker({
      method: 'GET',
      url: '/player_score',
      params: { player_id: String(playerId) },
    });

    return status === 200 ? ((body as { display?: AnticheatPlayerDisplayInterface }).display ?? null) : null;
  }

  private async assertSuperadmin(accessToken: string | undefined): Promise<void> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    // checkUserRoles also accepts ADMIN, which is not enough here
    if (!isSuperadmin(userAccess.roles)) {
      throw new UnauthorizedException('Unauthorized to access anticheat, SUPERADMIN role needed');
    }
  }

  private async callChecker(config: AxiosRequestConfig): Promise<CheckerResponse> {
    const apiKey: string | undefined = process.env.ANTICHEAT_API_KEY;

    if (!apiKey) {
      return { status: 503, body: { error: 'checker_not_configured' } };
    }

    try {
      const response: AxiosResponse = await axios.request({
        baseURL: CHECKER_URL,
        timeout: DEFAULT_TIMEOUT_MS,
        maxRedirects: 0,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        validateStatus: () => true,
        ...config,
        headers: { 'X-Api-Key': apiKey },
      });

      if (response.status === 401) {
        this.loggerService.error('Anticheat checker refused ANTICHEAT_API_KEY');
      }

      return { status: response.status, body: response.data };
    } catch {
      return { status: 502, body: { error: 'checker_unavailable' } };
    }
  }
}
