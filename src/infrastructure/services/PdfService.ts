import pdfParse from 'pdf-parse';
import { type Readable } from 'stream';
import { type IPdfService } from '../../domain/services/IPdfService';

export class PdfService implements IPdfService {
	async extractTextFromStream(stream: Readable): Promise<string> {
		const dataBuffer = await this.streamToBuffer(stream);
		const data = await pdfParse(dataBuffer);
		return data.text;
	}

	private async streamToBuffer(stream: Readable): Promise<Buffer> {
		return await new Promise((resolve, reject) => {
			const chunks: Buffer[] = [];
			stream.on('data', (chunk) => chunks.push(chunk));
			stream.on('end', () => {
				resolve(Buffer.concat(chunks));
			});
			stream.on('error', (err) => {
				reject(err);
			});
		});
	}
}
