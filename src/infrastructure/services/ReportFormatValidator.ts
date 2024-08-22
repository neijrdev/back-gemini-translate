import { FormatReports } from './ReportService';

export function isFormatReport(value: string): value is FormatReports {
	return Object.values(FormatReports).includes(value as FormatReports);
}

export function getAcceptedReportFormats(): string {
	return Object.values(FormatReports).join(', ');
}

interface FormatValidator {
	isValidFormat: (format: string) => boolean;
	getAcceptedFormats: () => string;
}

export class ReportFormatValidator implements FormatValidator {
	isValidFormat(format: string): boolean {
		return isFormatReport(format);
	}

	getAcceptedFormats(): string {
		return getAcceptedReportFormats();
	}
}
