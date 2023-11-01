import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';

@Entity({ name: 'movies' })
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'character varying' })
  name: string;

  @Column({ type: 'character varying' })
  youtube: string;

  @Column({ type: 'character varying' })
  author: string;

  @Column({ type: 'character varying' })
  year: string;
}
