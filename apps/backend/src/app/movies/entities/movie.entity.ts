import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';

@Entity({ name: 'movies' })
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  youtube: string;

  @Column({ type: 'varchar' })
  author: string;

  @Column({ type: 'varchar' })
  year: string;
}
