import { CommentInterface } from './comments.interface';
import { NewsStreamInterface } from './news-stream.interface';
import { NewsTypes } from './news-types.enum';

export interface NewsInterface {
  type: NewsTypes;
  id: number;
  authorId: number;
  authorName: string;
  currentRound: number | null;
  datetimezone: string;
  header: string;
  headerEn: string;
  image: string | null;
  cupId: number | null;
  multicupId: number | null;
  startTime: string | null;
  text: string | null;
  textEn: string | null;
  youtube: string | null;
  tableJson: string;
  comments: CommentInterface[];
  preposted: boolean;
  streams: NewsStreamInterface[];
}
