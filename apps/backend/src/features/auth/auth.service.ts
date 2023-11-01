import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { sha256 } from 'js-sha256';
import * as md5 from 'md5';
import { catchError, firstValueFrom, map } from 'rxjs';
import { AxiosResponse } from 'axios';
import { v4 } from 'uuid';
import * as moment from 'moment';
import { AuthRole } from '../../shared/entities/auth-role.entity';
import { User } from '../../shared/entities/user.entity';
import { UserAccessInterface } from '../../shared/interfaces/user-access.interface';
import { DiscordPromptInterface, LoginAvailableInterface, LoginResponseInterface } from '@dfcomps/auth';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthRole) private readonly authRoleRepository: Repository<AuthRole>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly httpService: HttpService,
  ) {}

  public async getPasswordToken(login: string, password: string): Promise<LoginResponseInterface> {
    const user: User | null = await this.userRepository.findOneBy({ login });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = sha256(md5(md5(password)) + process.env.SALT);

    if (user.password === hashedPassword) {
      const authRoles: AuthRole[] = await this.authRoleRepository.findBy({ user_id: user.id });

      return {
        user: {
          avatar: user.avatar,
          country: user.country,
          cpmRating: user.cpm_rating,
          vq3Rating: user.vq3_rating,
          id: user.id,
          nick: user.displayed_nick,
          roles: authRoles.map(({ role }: AuthRole) => role),
          discordTag: user.discord_tag,
        },
        token: user.access_token,
      };
    } else {
      throw new UnauthorizedException('Wrong password');
    }
  }

  public async getDiscordToken(discordAccessToken: string): Promise<LoginResponseInterface> {
    // 1. Getting discord user info
    const discordUserInfo = await firstValueFrom(
      this.httpService
        .get('https://discord.com/api/users/@me', {
          headers: {
            authorization: `Bearer ${discordAccessToken}`,
          },
        })
        .pipe(
          map(({ data }: AxiosResponse) => data),
          catchError(() => {
            throw new InternalServerErrorException('Discord auth error');
          }),
        ),
    );

    // 2. Finding user by discord username
    const user: User | null = await this.userRepository.findOneBy({ discord_tag: discordUserInfo.username });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 3. Getting user roles and mapping final response
    const authRoles = await this.authRoleRepository.findBy({ user_id: user.id });

    return {
      user: {
        avatar: user.avatar,
        country: user.country,
        cpmRating: user.cpm_rating,
        vq3Rating: user.vq3_rating,
        id: user.id,
        nick: user.displayed_nick,
        roles: authRoles.map(({ role }: AuthRole) => role),
        discordTag: discordUserInfo.username,
      },
      token: user.access_token,
    };
  }

  public async checkLogin(login: string): Promise<LoginAvailableInterface> {
    const user: User | null = await this.userRepository.findOneBy({ login });

    return {
      loginAvailable: !user,
    };
  }

  public async register(login: string, discordAccessToken: string): Promise<LoginResponseInterface> {
    // 1. Checking there's no user with passed login
    const userWithSameLogin: User | null = await this.userRepository.findOneBy({ login });

    if (userWithSameLogin) {
      throw new BadRequestException('User with this login already exists');
    }

    // 2. Getting discord tag associated with token
    const discordUsername = await firstValueFrom(
      this.httpService
        .get('https://discord.com/api/users/@me', {
          headers: {
            authorization: `Bearer ${discordAccessToken}`,
          },
        })
        .pipe(
          map(({ data }: AxiosResponse) => data.username),
          catchError(() => {
            throw new InternalServerErrorException('Discord auth error');
          }),
        ),
    );

    // 3. Checking there's no user associated with passed discordAccessToken
    const userWithSameDiscord: User | null = await this.userRepository.findOneBy({ discord_tag: discordUsername });

    if (userWithSameDiscord) {
      throw new BadRequestException('User with this discord already exists');
    }

    // 4. Inserting user into database
    const userAccessToken = v4();
    const queryResult: InsertResult = await this.userRepository
      .createQueryBuilder()
      .insert()
      .into(User)
      .values([
        {
          login,
          displayed_nick: login,
          password: null,
          discord_tag: discordUsername,
          last_discord_prompt: null,
          access_token: userAccessToken,
          last_nick_change_time: null,
          initial_cpm_rating: 1500,
          cpm_rating: 1500,
          initial_vq3_rating: 1500,
          vq3_rating: 1500,
          country: null,
          avatar: null,
          comments_ban_date: null,
        },
      ])
      .execute();

    const userId: number = queryResult.identifiers[0].id;

    // 5. Builiding login response
    return {
      user: {
        avatar: null,
        country: null,
        cpmRating: 1500,
        vq3Rating: 1500,
        id: userId,
        nick: login,
        roles: [],
        discordTag: discordUsername,
      },
      token: userAccessToken,
    };
  }

  public async getUserInfoByAccessToken(accessToken: string | undefined): Promise<UserAccessInterface> {
    if (!accessToken) {
      return {
        userId: null,
        commentsBanDate: null,
        roles: [],
      };
    }

    const user: User | null = await this.userRepository.findOneBy({ access_token: accessToken });

    if (!user) {
      throw new UnauthorizedException('User with such accessToken not found');
    }

    const authRoles: AuthRole[] = await this.authRoleRepository.findBy({ user_id: user.id });

    return {
      userId: user.id,
      commentsBanDate: user.comments_ban_date,
      roles: authRoles.map(({ role }: AuthRole) => role),
    };
  }

  public async getDiscordPrompt(accessToken: string | undefined): Promise<DiscordPromptInterface> {
    const { userId }: UserAccessInterface = await this.getUserInfoByAccessToken(accessToken);

    if (!userId) {
      return {
        prompt: false,
      };
    }

    const user: User = (await this.userRepository.createQueryBuilder().where({ id: userId }).getOne())!;

    if (user.discord_tag) {
      return {
        prompt: false,
      };
    }

    if (!user.last_discord_prompt || moment().subtract(1, 'month').isAfter(user.last_discord_prompt)) {
      await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set({
          last_discord_prompt: moment().format(),
        })
        .where({ id: userId })
        .execute();

      return {
        prompt: true,
      };
    }

    return {
      prompt: false,
    };
  }

  public async linkDiscord(
    accessToken: string | undefined,
    discordAccessToken: string,
  ): Promise<LoginResponseInterface> {
    const discordUserInfo = await firstValueFrom(
      this.httpService
        .get('https://discord.com/api/users/@me', {
          headers: {
            authorization: `Bearer ${discordAccessToken}`,
          },
        })
        .pipe(
          map(({ data }: AxiosResponse) => data),
          catchError(() => {
            throw new InternalServerErrorException('Discord auth error');
          }),
        ),
    );

    const sameTagUser: User | null = await this.userRepository.findOneBy({ discord_tag: discordUserInfo.username });

    if (sameTagUser) {
      throw new BadRequestException('User with this tag already exists');
    }

    const { userId }: UserAccessInterface = await this.getUserInfoByAccessToken(accessToken);

    if (!userId) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({
        discord_tag: discordUserInfo.username,
      })
      .where({ id: userId })
      .execute();
    
    const user: User = (await this.userRepository.findOneBy({ id: userId }))!;
    const authRoles: AuthRole[] = await this.authRoleRepository.findBy({ user_id: user.id });

    return {
      user: {
        avatar: user.avatar,
        country: user.country,
        cpmRating: user.cpm_rating,
        vq3Rating: user.vq3_rating,
        id: user.id,
        nick: user.displayed_nick,
        roles: authRoles.map(({ role }: AuthRole) => role),
        discordTag: discordUserInfo.username,
      },
      token: user.access_token,
    };
  }
}
