// src/infrastructure/services/ReportService.ts
import { type IReportService } from '../../domain/services/IReportService';
import { type WordCount } from '../../domain/entities/WordCount';
import { createObjectCsvStringifier } from 'csv-writer';

export const BATCH_SIZE_DEFAULT = 10;

export interface CsvHeader {
	id: string;
	title: string;
}

export interface Phrase {
	word: string;
	example_phrase_en: string;
	example_phrase_pt: string;
}

export enum FormatReports {
	txt = 'txt',
	csv = 'csv',
	anki = 'anki'
}

export function isFormatReport(value: string): value is FormatReports {
	return Object.values(FormatReports).includes(value as FormatReports);
}

export function getAcceptedReportFormats(): string {
	return Object.values(FormatReports).join(', ');
}

export function makeBufferEmpty(): Buffer {
	return Buffer.from('', 'utf8');
}

export class ReportService implements IReportService {
	private readonly format: FormatReports;

	constructor(format: FormatReports) {
		this.format = format;
	}

	async generateReport(
		wordCounts: WordCount[],
		phrases: Array<{ word: string; example_phrase_en: string; example_phrase_pt: string }>,
		batchSize: number = BATCH_SIZE_DEFAULT
	): Promise<Buffer> {
		switch (this.format) {
			case FormatReports.txt:
				return this.generateTxtReport(wordCounts, phrases, batchSize);
			case FormatReports.csv:
				return this.generateCsvReport(wordCounts, phrases, batchSize);
			case FormatReports.anki:
				return this.generateAnkiReport(wordCounts, phrases, batchSize);
			default:
				throw new Error('Formato de relatório inválido.');
		}
	}

	private generateTxtReport(
		wordCounts: WordCount[],
		phrases: Array<{ word: string; example_phrase_en: string; example_phrase_pt: string }>,
		batchSize: number
	): Buffer {
		let reportTxt = '';

		for (let i = 0; i < wordCounts.length; i += batchSize) {
			const batch = wordCounts.slice(i, i + batchSize);

			for (const wordCount of batch) {
				const phrase = phrases.find((p) => p.word === wordCount.word);
				if (!phrase) return makeBufferEmpty();

				const { example_phrase_en: phraseEn, example_phrase_pt: phrasePt } = phrase;

				reportTxt += `${wordCount.word}: ${wordCount.count}\n`;
				reportTxt += `Frase (en): ${phraseEn || `The word '${wordCount.word}' could not be translated.`}\n`;
				reportTxt += `Frase (pt-BR): ${phrasePt || 'A palavra não pôde ser traduzida.'}\n\n`;
			}
		}

		return Buffer.from(reportTxt, 'utf8');
	}

	private generateCsvReport(
		wordCounts: WordCount[],
		phrases: Array<{ word: string; example_phrase_en: string; example_phrase_pt: string }>,
		batchSize: number
	): Buffer {
		const csvStringifier = createObjectCsvStringifier({
			header: [
				{ id: 'palavra', title: 'palavra (en)' },
				{ id: 'traducao', title: 'tradução (pt-BR)' },
				{ id: 'quantidade', title: 'quantidade' },
				{ id: 'fraseEn', title: 'frase (en)' },
				{ id: 'frasePt', title: 'frase (pt-BR)' }
			]
		});

		const records = [];

		for (let i = 0; i < wordCounts.length; i += batchSize) {
			const batch = wordCounts.slice(i, i + batchSize);

			for (const wordCount of batch) {
				const phrase = phrases.find((p) => p.word === wordCount.word);

				if (!phrase) return makeBufferEmpty();

				const { example_phrase_en: phraseEn, example_phrase_pt: phrasePt } = phrase;

				records.push({
					palavra: wordCount.word,
					traducao: phrasePt || 'A palavra não pôde ser traduzida.',
					quantidade: wordCount.count,
					fraseEn: phraseEn || `The word '${wordCount.word}' could not be translated.`,
					frasePt: phrasePt || 'A palavra não pôde ser traduzida.'
				});
			}
		}

		const csvBuffer = Buffer.from(csvStringifier.stringifyRecords(records));
		return csvBuffer;
	}

	private generateAnkiReport(
		wordCounts: WordCount[],
		phrases: Array<{ word: string; example_phrase_en: string; example_phrase_pt: string }>,
		batchSize: number
	): Buffer {
		const csvStringifier = createObjectCsvStringifier({
			header: [
				{ id: 'back', title: 'Back' },
				{ id: 'front', title: 'Front' }
			]
		});

		const records = [];

		for (let i = 0; i < wordCounts.length; i += batchSize) {
			const batch = wordCounts.slice(i, i + batchSize);

			for (const wordCount of batch) {
				const phrase = phrases.find((p) => p.word === wordCount.word);

				if (!phrase) return makeBufferEmpty();

				const { example_phrase_en: phraseEn, example_phrase_pt: phrasePt } = phrase;

				records.push({
					back: phraseEn || `The word '${wordCount.word}' could not be translated.`,
					front: phrasePt || 'A palavra não pôde ser traduzida.'
				});
			}
		}

		const csvBuffer = Buffer.from(csvStringifier.stringifyRecords(records));
		return csvBuffer;
	}
}
