import { Readable } from 'stream';
import { PdfService } from './PdfService';

jest.mock('pdf-parse', () => {
	return jest.fn();
});

describe('PdfService', () => {
	let pdfService: PdfService;

	beforeEach(() => {
		pdfService = new PdfService();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should extract text from a valid PDF stream', async () => {
		const mockText = 'This is the extracted text.';
		const pdfParse = require('pdf-parse');
		pdfParse.mockResolvedValue({ text: mockText });

		const stream = Readable.from(Buffer.from('sample pdf content'));

		const extractedText = await pdfService.extractTextFromStream(stream);

		expect(extractedText).toBe(mockText);
		expect(pdfParse).toHaveBeenCalledWith(expect.any(Buffer));
	});

	it('should handle stream errors', async () => {
		const errorStream = new Readable({
			read() {
				this.emit('error', new Error('Stream error'));
			},
		});

		await expect(pdfService.extractTextFromStream(errorStream)).rejects.toThrow('Stream error');
	});
});
