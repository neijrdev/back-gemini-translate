// src/infrastructure/services/ReportService.ts
import { type IReportService } from '../../domain/services/IReportService';
import { type WordCount } from '../../domain/entities/WordCount';
import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';
import path from 'path';
import { type CsvWriter } from 'csv-writer/src/lib/csv-writer';

export const BATCH_SIZE_DEFAULT = 10;

export interface CsvHeader {
	id: string;
	title: string;
}

interface CsvRecord {
	palavra: string;
	traducao: string;
	quantidade: number;
	fraseEn: string;
	frasePt: string;
}

export interface Phrase {
	word: string;
	example_phrase_en: string;
	example_phrase_pt: string;
}

export class ReportService implements IReportService {
	private readonly csvWriter: CsvWriter<CsvRecord>;
	private readonly txtPath: string;
	private readonly csvPath: string;

	constructor(csvPath: string, txtPath: string) {
		this.csvWriter = createObjectCsvWriter({
			path: csvPath,
			header: [
				{ id: 'palavra', title: 'palavra (en)' },
				{ id: 'traducao', title: 'tradução (pt-BR)' },
				{ id: 'quantidade', title: 'quantidade' },
				{ id: 'fraseEn', title: 'frase (en)' },
				{ id: 'frasePt', title: 'frase (pt-BR)' }
			]
		});
		this.txtPath = txtPath;
		this.csvPath = csvPath;
	}

	async generateReport(
		wordCounts: WordCount[],
		phrases: Phrase[],
		batchSize: number = BATCH_SIZE_DEFAULT
	): Promise<void> {
		let reportTxt = '';

		for (let i = 0; i < wordCounts.length; i += batchSize) {
			const batch = wordCounts.slice(i, i + batchSize);

			for (const wordCount of batch) {
				const phrase = phrases.find((p) => p.word === wordCount.word);

				if (!phrase) return;

				const { example_phrase_en: phraseEn, example_phrase_pt: phrasePt } = phrase;

				reportTxt += `${wordCount.word}: ${wordCount.count}\n`;
				reportTxt += `Frase (en): ${phraseEn || `The word '${wordCount.word}' could not be translated.`}\n`;
				reportTxt += `Frase (pt-BR): ${phrasePt || 'A palavra não pôde ser traduzida.'}\n\n`;

				await this.csvWriter.writeRecords([
					{
						palavra: wordCount.word,
						traducao: phrasePt || 'A palavra não pôde ser traduzida.',
						quantidade: wordCount.count,
						fraseEn: phraseEn || `The word '${wordCount.word}' could not be translated.`,
						frasePt: phrasePt || 'A palavra não pôde ser traduzida.'
					}
				]);
			}
		}

		fs.writeFileSync(this.txtPath, reportTxt);
	}

	getReportPaths(): { txt: string; csv: string } {
		return {
			txt: path.resolve(__dirname, this.txtPath),
			csv: path.resolve(__dirname, this.csvPath)
		};
	}
}
