import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from '../../shared/entities/movie.entity';

@Injectable()
export class MoviesService {
  constructor(@InjectRepository(Movie) private readonly moviesRepository: Repository<Movie>) {}

  findAll(): Promise<Movie[]> {
    return this.moviesRepository.find();
  }
}
