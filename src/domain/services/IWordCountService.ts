import { type WordCount } from '../entities/WordCount';

export interface IWordCountService {
	countWords: (text: string) => WordCount[];
}
