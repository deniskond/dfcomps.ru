import { PrimaryGeneratedColumn, Column, Entity, OneToMany } from 'typeorm';
import { News } from './news.entity';

@Entity({ name: 'news_types' })
export class NewsType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'character varying' })
  name: string;

  @Column({ type: 'character varying' })
  name_rus: string;

  @OneToMany(() => News, news => news.newsType)
  news: News[];
}
