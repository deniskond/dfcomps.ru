import { Controller, Get } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { Movie } from '../../shared/entities/movie.entity';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  findAll(): Promise<Movie[]> {
    return this.moviesService.findAll();
  }
}
