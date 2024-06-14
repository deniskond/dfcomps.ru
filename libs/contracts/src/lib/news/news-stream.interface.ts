import { Languages } from '../global';
import { StreamingPlatforms } from './streaming-platforms.enum';

export interface NewsStreamInterface {
  streamer: string;
  platform: StreamingPlatforms;
  stream_id: string;
  language: Languages;
}
