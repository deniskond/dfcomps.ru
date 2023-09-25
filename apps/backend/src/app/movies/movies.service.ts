import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MoviesService {
  constructor(@InjectRepository(Movie) private readonly moviesRepository: Repository<Movie>) {}

  findAll(): Promise<Movie[]> {
    return this.moviesRepository.find();
  }
}
