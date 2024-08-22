import { FormatReports } from './ReportService';

interface ReportStrategy {
	generateReport: (content: Buffer) => Buffer;
	getContentType: () => string;
	getFileName: () => string;
}

abstract class BaseReportStrategy implements ReportStrategy {
	constructor(
		private readonly contentType: string,
		private readonly fileName: string
	) {}

	generateReport(content: Buffer): Buffer {
		return content;
	}

	getContentType(): string {
		return this.contentType;
	}

	getFileName(): string {
		return this.fileName;
	}
}

class TxtReportStrategy extends BaseReportStrategy {
	constructor() {
		super('text/plain', 'relatorio_palavras.txt');
	}
}

class CsvReportStrategy extends BaseReportStrategy {
	constructor() {
		super('text/csv', 'relatorio_palavras.csv');
	}
}

export class ReportStrategyFactory {
	static getStrategy(format: FormatReports): ReportStrategy {
		switch (format) {
			case FormatReports.txt:
				return new TxtReportStrategy();
			case FormatReports.csv:
			case FormatReports.anki:
				return new CsvReportStrategy();
			default:
				throw new Error('Formato não suportado.');
		}
	}
}
