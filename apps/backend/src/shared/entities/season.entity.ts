import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'season' })
export class Season {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  season: number;
}
