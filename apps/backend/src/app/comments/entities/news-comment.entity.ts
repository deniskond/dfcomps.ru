import { PrimaryGeneratedColumn, Column, Entity, ManyToOne } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { News } from '../../news/entities/news.entity';

@Entity({ name: 'news_comments' })
export class NewsComment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  comment: string;

  @Column({ type: 'timestamp without time zone', nullable: true })
  datetime: string | null;

  @Column({ type: 'timestamp with time zone' })
  datetimezone: string;

  @Column({ type: 'character varying' })
  reason: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => News)
  news: News;
}
