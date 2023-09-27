import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetDiscordTokenDto, GetPasswordTokenDto, LoginResponseDto } from '@dfcomps/contracts';
import { InjectRepository } from '@nestjs/typeorm';
import { OldUser } from './entities/old-user.entity';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { sha256 } from 'js-sha256';
import * as moment from 'moment';
import { v4 } from 'uuid';
import { UserRole } from '@dfcomps/contracts';

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
    @InjectRepository(OldUser) private readonly oldUserRepository: Repository<OldUser>,
  ) {}

  @Post('get-password-token')
  getPasswordToken(@Body() getPasswordTokenDto: GetPasswordTokenDto): Promise<LoginResponseDto> {
    return Promise.resolve(this.loginResponseMock);
  }

  @Post('get-password-token')
  getDiscordToken(@Body() getDiscordTokenDto: GetDiscordTokenDto): Promise<LoginResponseDto> {
    return Promise.resolve(this.loginResponseMock);
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
    // await this.oldUserRepository.createQueryBuilder('users').insert().into(User).values(newUsers).execute();

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
