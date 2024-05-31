import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';

@Entity({ name: 'map_suggestions' })
export class MapSuggestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  map_name: string;

  @Column({ type: 'integer' })
  suggestions_count: number;
}
