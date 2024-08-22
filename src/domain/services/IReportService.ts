import { type WordCount } from '../entities/WordCount';

export interface IReportService {
	generateReport: (
		wordCounts: WordCount[],
		phrases: Array<{ word: string; example_phrase_en: string; example_phrase_pt: string }>,
		batchSize?: number
	) => Promise<string | Buffer>;
}
