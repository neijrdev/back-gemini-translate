import { getAcceptedReportFormats, isFormatReport } from './ReportService';

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
