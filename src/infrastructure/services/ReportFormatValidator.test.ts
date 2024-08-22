import { ReportFormatValidator } from './ReportFormatValidator';
import { FormatReports } from './ReportService';

describe('ReportFormatValidator', () => {
	let formatValidator: ReportFormatValidator;

	beforeEach(() => {
		formatValidator = new ReportFormatValidator();
	});

	describe('isValidFormat', () => {
		it('should return true for valid format', () => {
			expect(formatValidator.isValidFormat(FormatReports.txt)).toBe(true);
			expect(formatValidator.isValidFormat(FormatReports.csv)).toBe(true);
			expect(formatValidator.isValidFormat(FormatReports.anki)).toBe(true);
		});

		it('should return false for invalid format', () => {
			expect(formatValidator.isValidFormat('invalidFormat')).toBe(false);
			expect(formatValidator.isValidFormat('')).toBe(false);
			expect(formatValidator.isValidFormat('pdf')).toBe(false);
		});
	});

	describe('getAcceptedFormats', () => {
		it('should return a string with all accepted formats', () => {
			const acceptedFormats = formatValidator.getAcceptedFormats();
			const expectedFormats = Object.values(FormatReports).join(', ');

			expect(acceptedFormats).toBe(expectedFormats);
		});
	});
});
