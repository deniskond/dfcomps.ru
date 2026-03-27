import { Q3_HUFFMAN_NYT_SYM } from '../const/constants';

export class Q3HuffmanNode {
  left: Q3HuffmanNode | null = null;
  right: Q3HuffmanNode | null = null;
  symbol: number = Q3_HUFFMAN_NYT_SYM;
}
