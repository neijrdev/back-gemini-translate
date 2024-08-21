import { type IPdfService } from '../domain/services/IPdfService';
import { type IWordCountService } from '../domain/services/IWordCountService';
import { type IGoogleAIService } from '../domain/services/IGoogleAIService';
import { type ReportPath, type IReportService } from '../domain/services/IReportService';

export class GenerateWordReportUseCase {
	constructor(
		private readonly pdfService: IPdfService,
		private readonly wordCountService: IWordCountService,
		private readonly googleAIService: IGoogleAIService,
		private readonly reportService: IReportService
	) {}

	async execute(filePath: string, topNWords: number): Promise<void> {
		const initialN = 0;
		const text = await this.pdfService.extractText(filePath);
		const wordCounts = this.wordCountService.countWords(text);
		const topWords = wordCounts.sort((a, b) => b.count - a.count).slice(initialN, topNWords);

		try {
			const phrases = await this.googleAIService.generatePhrases(topWords.map((w) => w.word));
			await this.reportService.generateReport(topWords, phrases);
		} catch (error) {
			console.error('Erro ao gerar o relatório:', error);
		}
	}

	getReportPaths(): ReportPath {
		return this.reportService.getReportPaths();
	}
}
