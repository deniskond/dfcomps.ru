import { PrimaryGeneratedColumn, Column, Entity, OneToMany } from 'typeorm';
import { News } from './news.entity';
import { NewsTypes } from '@dfcomps/contracts';

// TODO This entity needs to be deleted
@Entity({ name: 'news_types' })
export class NewsType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'character varying' })
  name: NewsTypes;

  @Column({ type: 'character varying' })
  name_rus: string;

  @OneToMany(() => News, news => news.newsType)
  news: News[];
}
