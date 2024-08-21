// src/infrastructure/services/PdfService.ts
import { type IPdfService } from '../../domain/services/IPdfService';
import fs from 'fs';
import pdfParse from 'pdf-parse';

export class PdfService implements IPdfService {
	async extractText(filePath: string): Promise<string> {
		const dataBuffer = fs.readFileSync(filePath);
		const data = await pdfParse(dataBuffer);
		return data.text;
	}
}
