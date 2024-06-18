import { PrimaryGeneratedColumn, Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { NewsType } from './news-type.entity';
import { NewsComment } from './news-comment.entity';
import { User } from './user.entity';
import { Cup } from './cup.entity';

@Entity({ name: 'news' })
export class News {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'character varying' })
  header: string;

  @Column({ type: 'character varying' })
  header_en: string;

  @Column({ type: 'text', nullable: true })
  text: string | null;

  @Column({ type: 'text', nullable: true })
  text_en: string | null;

  @Column({ type: 'character varying', nullable: true })
  youtube: string | null;

  @Column({ type: 'timestamp with time zone' })
  datetimezone: string;

  @Column({ type: 'integer' })
  comments_count: number;

  @Column({ type: 'integer', nullable: true })
  multicup_id: number | null;

  @Column({ type: 'character varying', nullable: true })
  image: string | null;

  @Column({ type: 'text', nullable: true })
  table_json: string;

  @Column({ type: 'character varying', nullable: true })
  theme: string | null;

  @Column({ type: 'boolean' })
  hide_on_main: boolean;

  @Column({ type: 'text', nullable: true })
  streams: string | null;

  @ManyToOne(() => Cup, { nullable: true })
  cup: Cup | null;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => NewsType)
  newsType: NewsType;

  @OneToMany(() => NewsComment, newsComment => newsComment.news)
  newsComments: NewsComment[];
}
