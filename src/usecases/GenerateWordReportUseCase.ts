import { type IPdfService } from '../domain/services/IPdfService';
import { type IWordCountService } from '../domain/services/IWordCountService';
import { type IGoogleAIService } from '../domain/services/IGoogleAIService';
import { type IReportService } from '../domain/services/IReportService';
import { type Readable } from 'stream';

export const TOP_N_WORDS_DEFAULT = 20;
export class GenerateWordReportUseCase {
	constructor(
		private readonly pdfService: IPdfService,
		private readonly wordCountService: IWordCountService,
		private readonly googleAIService: IGoogleAIService,
		private readonly reportService: IReportService
	) {}

	async executeFromStream(stream: Readable, topNWords: number): Promise<string | Buffer> {
		const initialCount = 0;
		const text = await this.pdfService.extractTextFromStream(stream);
		const wordCounts = this.wordCountService.countWords(text);
		const topWords = wordCounts.sort((a, b) => b.count - a.count).slice(initialCount, topNWords);

		const phrases = await this.googleAIService.generatePhrases(topWords.map((w) => w.word));

		return await this.reportService.generateReport(topWords, phrases);
	}
}
