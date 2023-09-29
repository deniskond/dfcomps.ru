import {
  Controller,
  Post,
  Body,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CheckLoginDto,
  GetDiscordTokenDto,
  GetPasswordTokenDto,
  LoginAvailableDto,
  LoginResponseDto,
  RegisterDto,
} from '@dfcomps/contracts';
import { InjectRepository } from '@nestjs/typeorm';
import { OldUser } from './entities/old-user.entity';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { sha256 } from 'js-sha256';
import * as moment from 'moment';
import * as md5 from 'md5';
import { v4 } from 'uuid';
import { UserRole } from '@dfcomps/contracts';
import { AuthRole } from './entities/auth-role.entity';
import { HttpService } from '@nestjs/axios';
import { Observable, catchError, firstValueFrom, from, map, switchMap } from 'rxjs';
import { AxiosResponse } from 'axios';

@Controller('auth')
export class AuthController {
  // TODO Delete mock
  private loginResponseMock: LoginResponseDto = {
    user: {
      avatar: '',
      country: 'ru',
      cpmRating: 1500,
      vq3Rating: 1500,
      id: '10',
      nick: 'Nosf',
      roles: [UserRole.SUPERADMIN],
    },
    token: '123',
  };

  constructor(
    private readonly authService: AuthService,
    @InjectRepository(AuthRole) private readonly authRoleRepository: Repository<AuthRole>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(OldUser) private readonly oldUserRepository: Repository<OldUser>,
    private readonly httpService: HttpService,
  ) {}

  @Post('get-password-token')
  async getPasswordToken(@Body() { login, password }: GetPasswordTokenDto): Promise<LoginResponseDto> {
    const user: User = await this.userRepository.findOneBy({ login });
    const hashedPassword = sha256(md5(md5(password)) + process.env.SALT);

    if (user.password === hashedPassword) {
      const authRoles: AuthRole[] = await this.authRoleRepository.findBy({ user_id: user.id });

      return {
        user: {
          avatar: user.avatar,
          country: user.country,
          cpmRating: user.cpm_rating,
          vq3Rating: user.vq3_rating,
          id: user.id.toString(),
          nick: user.displayed_nick,
          roles: authRoles.map(({ role }: AuthRole) => role),
        },
        token: user.access_token,
      };
    }

    throw new NotFoundException('User not found');
  }

  @Post('get-discord-token')
  async getDiscordToken(@Body() { discordAccessToken }: GetDiscordTokenDto): Promise<LoginResponseDto> {
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
    const user: User = await this.userRepository.findOneBy({ discord_tag: discordUserInfo.username });

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
        id: user.id.toString(),
        nick: user.displayed_nick,
        roles: authRoles.map(({ role }: AuthRole) => role),
      },
      token: user.access_token,
    };
  }

  @Post('check-login')
  async checkLogin(@Body() { login }: CheckLoginDto): Promise<LoginAvailableDto> {
    const user: User | undefined = await this.userRepository.findOneBy({ login });

    return {
      loginAvailable: !user,
    };
  }

  @Post('register')
  async register(@Body() { login, discordAccessToken }: RegisterDto): Promise<LoginResponseDto> {
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
    const queryResult = await this.userRepository
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
        id: userId.toString(),
        nick: login,
        roles: [],
      },
      token: userAccessToken,
    };
  }

  @Post('convert-table')
  async convertTable() {
    const oldUsers: OldUser[] = await this.oldUserRepository.createQueryBuilder('old_users').getMany();

    const newUsers: User[] = oldUsers.map(
      ({
        id,
        nick,
        displayed_nick,
        last_nick_change_time,
        password,
        initial_cpm_rating,
        cpm_rating,
        initial_vq3_rating,
        vq3_rating,
        country,
        avatar,
        comments_ban_date,
      }) => ({
        id,
        login: nick,
        displayed_nick,
        password: sha256(password + process.env.SALT),
        discord_tag: null,
        last_discord_prompt: null,
        access_token: v4(),
        last_nick_change_time,
        initial_cpm_rating,
        cpm_rating,
        initial_vq3_rating,
        vq3_rating,
        country,
        avatar,
        comments_ban_date: comments_ban_date ? moment(comments_ban_date).format('X') : null,
      }),
    );

    // Uncomment when migrating
    // await this.userRepository.createQueryBuilder().insert().into(User).values(newUsers).execute();

    return 'ok';
  }

  // @Post()
  // create(@Body() createAuthDto: CreateAuthDto) {
  //   return this.authService.create(createAuthDto);
  // }

  // @Get()
  // findAll() {
  //   return this.authService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.authService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.authService.remove(+id);
  // }
}
