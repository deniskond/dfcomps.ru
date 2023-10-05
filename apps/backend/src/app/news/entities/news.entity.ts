import { PrimaryGeneratedColumn, Column, Entity, ManyToOne } from 'typeorm';
import { Cup } from '../../cup/entities/cup.entity';

@Entity({ name: 'news' })
export class News {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'character varying' })
  header: string;

  @Column({ type: 'character varying' })
  header_en: string;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'text' })
  text_en: string;

  @Column({ type: 'character varying', nullable: true })
  youtube: string;

  @Column({ type: 'integer', nullable: true })
  cup_id: string;

  @Column({ type: 'integer' })
  type_id: string;

  @Column({ type: 'timestamp without time zone', nullable: true })
  datetime: string;

  @Column({ type: 'timestamp with time zone' })
  datetimezone: string;

  @Column({ type: 'integer' })
  author_id: number;

  @Column({ type: 'integer' })
  comments_count: number;

  @Column({ type: 'integer', nullable: true })
  multicup_id: number;

  @Column({ type: 'character varying', nullable: true })
  image: string;

  @Column({ type: 'text', nullable: true })
  table_json: string;

  @Column({ type: 'character varying', nullable: true })
  twitch_1: string;

  @Column({ type: 'character varying', nullable: true })
  twitch_2: string;

  @Column({ type: 'character varying', nullable: true })
  theme: string;

  @Column({ type: 'boolean' })
  hide_on_main: boolean;

  @ManyToOne(() => Cup, { nullable: true })
  cup: Cup;
}
