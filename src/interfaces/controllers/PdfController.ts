// src/interfaces/controllers/PdfController.ts
import { type Request, type Response, type NextFunction } from 'express';
import { TOP_N_WORDS_DEFAULT, type GenerateWordReportUseCase } from '../../usecases/GenerateWordReportUseCase';
import { HTTP_STATUS } from '../../infrastructure/models/HttpStatus';
import { Readable } from 'stream';

export class PdfController {
	constructor(private readonly generateWordReportUseCase: GenerateWordReportUseCase) {}

	async processPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			if (!req.file) {
				res.status(HTTP_STATUS.BAD_REQUEST).send({ error: 'Nenhum arquivo foi enviado.' });
				return;
			}

			const { format } = req.body;

			if (!format || (format !== 'txt' && format !== 'csv')) {
				res.status(HTTP_STATUS.BAD_REQUEST).send({ error: 'Formato inválido. Use txt ou csv.' });
				return;
			}

			const pdfStream = new Readable();
			pdfStream.push(req.file.buffer);
			pdfStream.push(null);

			// Processar o arquivo PDF a partir do stream
			const reportContent = await this.generateWordReportUseCase.executeFromStream(
				pdfStream,
				TOP_N_WORDS_DEFAULT,
				format
			);

			// Configura o tipo de conteúdo e o nome do arquivo
			if (format === 'txt') {
				res.setHeader('Content-Type', 'text/plain');
				res.setHeader('Content-Disposition', 'attachment; filename=relatorio_palavras.txt');
				res.send(reportContent);
			} else if (format === 'csv') {
				res.setHeader('Content-Type', 'text/csv');
				res.setHeader('Content-Disposition', 'attachment; filename=relatorio_palavras.csv');
				res.send(reportContent);
			}
		} catch (error) {
			next(error);
		}
	}
}
