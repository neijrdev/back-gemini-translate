// src/interfaces/IReportService.ts
export interface IReportService {
	generateReport: (
		wordCounts: Array<[string, number]>,
		phrases: Array<{ word: string; example_phrase_en: string; example_phrase_pt: string }>,
		batchSize?: number
	) => Promise<void>;
	getReportPaths: () => { txt: string; csv: string };
}
