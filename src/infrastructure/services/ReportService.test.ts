import { ReportService, FormatReports, makeBufferEmpty } from './ReportService';
import { type WordCount } from '../../domain/entities/WordCount';

describe('ReportService', () => {
	let wordCounts: WordCount[];
	let phrases: Array<{ word: string; example_phrase_en: string; example_phrase_pt: string }>;

	beforeEach(() => {
		wordCounts = [
			{ word: 'hello', count: 5 },
			{ word: 'world', count: 3 }
		];

		phrases = [
			{ word: 'hello', example_phrase_en: 'Hello, world!', example_phrase_pt: 'Olá, mundo!' },
			{ word: 'world', example_phrase_en: 'The world is big.', example_phrase_pt: 'O mundo é grande.' }
		];
	});

	describe('ReportStrategyFactory', () => {
		it('should create and use the TxtReport strategy for txt format', async () => {
			const service = new ReportService(FormatReports.txt);
			const result = await service.generateReport(
				[{ word: 'test', count: 1 }],
				[{ word: 'test', example_phrase_en: 'Test', example_phrase_pt: 'Teste' }]
			);
			expect(result.toString('utf8')).toContain('test: 1');
		});

		it('should create and use the CsvReport strategy for csv format', async () => {
			const service = new ReportService(FormatReports.csv);
			const result = await service.generateReport(
				[{ word: 'test', count: 1 }],
				[{ word: 'test', example_phrase_en: 'Test', example_phrase_pt: 'Teste' }]
			);
			expect(result.toString('utf8')).toContain('test');
			expect(result.toString('utf8')).toContain('1');
			expect(result.toString('utf8')).toContain('Test');
		});

		it('should create and use the AnkiReport strategy for anki format', async () => {
			const service = new ReportService(FormatReports.anki);
			const result = await service.generateReport(
				[{ word: 'test', count: 1 }],
				[{ word: 'test', example_phrase_en: 'Test', example_phrase_pt: 'Teste' }]
			);
			expect(result.toString('utf8')).toContain('Test');
			expect(result.toString('utf8')).toContain('Teste');
		});

		it('should throw an error for unsupported format', () => {
			expect(() => new ReportService('unsupported' as FormatReports)).toThrow('Formato não suportado.');
		});
	});

	describe('TxtReport generation', () => {
		it('should generate a text report', async () => {
			const service = new ReportService(FormatReports.txt);
			const result = await service.generateReport(wordCounts, phrases);

			const expectedReport = Buffer.from(
				'hello: 5\nFrase (en): Hello, world!\nFrase (pt-BR): Olá, mundo!\n\n' +
					'world: 3\nFrase (en): The world is big.\nFrase (pt-BR): O mundo é grande.\n\n',
				'utf8'
			);

			expect(result).toEqual(expectedReport);
		});

		it('should return an empty buffer if no phrase matches', async () => {
			const service = new ReportService(FormatReports.txt);
			const noMatchPhrases = [{ word: 'test', example_phrase_en: 'Test this', example_phrase_pt: 'Teste isso' }];
			const result = await service.generateReport(wordCounts, noMatchPhrases);

			expect(result).toEqual(makeBufferEmpty());
		});
	});

	describe('CsvReport generation', () => {
		it('should generate a CSV report', async () => {
			const service = new ReportService(FormatReports.csv);
			const result = await service.generateReport(wordCounts, phrases);

			// Ajuste do esperado para incluir as quebras de linha
			const expectedCsv =
				'hello,"Olá, mundo!",5,"Hello, world!","Olá, mundo!"\n' +
				'world,O mundo é grande.,3,The world is big.,O mundo é grande.\n';

			expect(result.toString('utf8')).toEqual(expectedCsv);
		});
	});

	describe('AnkiReport generation', () => {
		it('should generate an Anki CSV report', async () => {
			const service = new ReportService(FormatReports.anki);
			const result = await service.generateReport(wordCounts, phrases);

			// Ajuste do esperado para refletir a saída real gerada pelo csv-writer
			const expectedCsv = '"Hello, world!","Olá, mundo!"\n' + 'The world is big.,O mundo é grande.\n';

			expect(result.toString('utf8')).toEqual(expectedCsv);
		});
	});
});
