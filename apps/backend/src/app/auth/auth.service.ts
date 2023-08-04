import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from './entities/auth.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(Auth) private readonly authRepository: Repository<Auth>) {}

  create(createAuthDto: CreateAuthDto): Promise<Auth> {
    const auth: Auth = new Auth();

    auth.name = createAuthDto.name;
    auth.password = createAuthDto.password;

    return this.authRepository.save(auth);
  }

  findAll(): Promise<Auth[]> {
    return this.authRepository.find();
  }

  findOne(id: number): Promise<Auth> {
    return this.authRepository.findOneBy({ id });
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    const auth: Auth = new Auth();

    auth.name = updateAuthDto.name;
    auth.password = updateAuthDto.password;

    return this.authRepository.save(auth);
  }

  remove(id: number): Promise<{ affected?: number }> {
    return this.authRepository.delete(id);
  }
}
