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

export function makeBufferEmpty(): Buffer {
	return Buffer.from('', 'utf8');
}

interface ReportStrategy {
	generateReport: (
		wordCounts: WordCount[],
		phrases: Array<{ word: string; example_phrase_en: string; example_phrase_pt: string }>,
		batchSize: number
	) => Buffer;
}

class TxtReport implements ReportStrategy {
	generateReport(
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
}

abstract class BaseCsvReport implements ReportStrategy {
	abstract getHeaders(): CsvHeader[];
	abstract formatRecord(
		wordCount: WordCount,
		phrase: { word: string; example_phrase_en: string; example_phrase_pt: string }
	): Record<string, string>;

	generateReport(
		wordCounts: WordCount[],
		phrases: Array<{ word: string; example_phrase_en: string; example_phrase_pt: string }>,
		batchSize: number
	): Buffer {
		const csvStringifier = createObjectCsvStringifier({ header: this.getHeaders() });
		const records: Array<Record<string, string>> = [];

		for (let i = 0; i < wordCounts.length; i += batchSize) {
			const batch = wordCounts.slice(i, i + batchSize);

			for (const wordCount of batch) {
				const phrase = phrases.find((p) => p.word === wordCount.word);
				if (!phrase) return makeBufferEmpty();

				records.push(this.formatRecord(wordCount, phrase));
			}
		}

		return Buffer.from(csvStringifier.stringifyRecords(records));
	}
}

class CsvReport extends BaseCsvReport {
	getHeaders(): CsvHeader[] {
		return [
			{ id: 'palavra', title: 'palavra (en)' },
			{ id: 'traducao', title: 'tradução (pt-BR)' },
			{ id: 'quantidade', title: 'quantidade' },
			{ id: 'fraseEn', title: 'frase (en)' },
			{ id: 'frasePt', title: 'frase (pt-BR)' }
		];
	}

	formatRecord(
		wordCount: WordCount,
		phrase: { word: string; example_phrase_en: string; example_phrase_pt: string }
	): Record<string, string> {
		return {
			palavra: wordCount.word,
			traducao: phrase.example_phrase_pt || 'A palavra não pôde ser traduzida.',
			quantidade: wordCount.count.toString(),
			fraseEn: phrase.example_phrase_en || `The word '${wordCount.word}' could not be translated.`,
			frasePt: phrase.example_phrase_pt || 'A palavra não pôde ser traduzida.'
		};
	}
}

class AnkiReport extends BaseCsvReport {
	getHeaders(): CsvHeader[] {
		return [
			{ id: 'back', title: 'Back' },
			{ id: 'front', title: 'Front' }
		];
	}

	formatRecord(
		wordCount: WordCount,
		phrase: { word: string; example_phrase_en: string; example_phrase_pt: string }
	): Record<string, string> {
		return {
			back: phrase.example_phrase_en || `The word '${wordCount.word}' could not be translated.`,
			front: phrase.example_phrase_pt || 'A palavra não pôde ser traduzida.'
		};
	}
}
class ReportStrategyFactory {
	static getStrategy(format: FormatReports): ReportStrategy {
		switch (format) {
			case FormatReports.txt:
				return new TxtReport();
			case FormatReports.csv:
				return new CsvReport();
			case FormatReports.anki:
				return new AnkiReport();
			default:
				throw new Error('Formato não suportado.');
		}
	}
}

export class ReportService implements IReportService {
	private readonly strategy: ReportStrategy;

	constructor(format: FormatReports) {
		this.strategy = ReportStrategyFactory.getStrategy(format);
	}

	async generateReport(
		wordCounts: WordCount[],
		phrases: Array<{ word: string; example_phrase_en: string; example_phrase_pt: string }>,
		batchSize: number = BATCH_SIZE_DEFAULT
	): Promise<Buffer> {
		return this.strategy.generateReport(wordCounts, phrases, batchSize);
	}
}
