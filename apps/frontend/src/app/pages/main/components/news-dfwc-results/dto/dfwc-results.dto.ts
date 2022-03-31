import { DfwcSingleResultDtoInterface } from './dfwc-single-result.dto';

export interface DfwcResultsDtoInterface {
  vq3: Record<string, DfwcSingleResultDtoInterface>;
  cpm: Record<string, DfwcSingleResultDtoInterface>;
}
