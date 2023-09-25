import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

  // create(createAuthDto: CreateAuthDto): Promise<Auth> {
  //   const auth: Auth = new Auth();

  //   auth.login = createAuthDto.login;
  //   auth.password = createAuthDto.password;

  //   return this.authRepository.save(auth);
  // }

  // findAll(): Promise<Auth[]> {
  //   return this.authRepository.find();
  // }

  // findOne(id: number): Promise<Auth> {
  //   return this.authRepository.findOneBy({ id });
  // }

  // update(id: number, updateAuthDto: UpdateAuthDto) {
  //   const auth: Auth = new Auth();

  //   auth.login = updateAuthDto.login;
  //   auth.password = updateAuthDto.password;

  //   return this.authRepository.save(auth);
  // }

  // remove(id: number): Promise<{ affected?: number }> {
  //   return this.authRepository.delete(id);
  // }
}
