import { CommentInterface } from '../../../interfaces/comments.interface';
import { NewsTypes } from '../../../enums/news-types.enum';

export interface NewsInterface {
    type: NewsTypes;
    id: string;
    authorId: string;
    authorName: string;
    currentRound: string;
    datetimezone: string;
    header: string;
    headerEn: string;
    image: string;
    cupId: string;
    multicupId: string;
    startTime: string;
    text: string;
    textEn: string;
    youtube: string;
    tableJson: string;
    twitch1: string;
    twitch2: string;
    comments: CommentInterface[];
}
