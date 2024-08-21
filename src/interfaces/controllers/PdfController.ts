// src/interfaces/controllers/PdfController.ts
import { type Request, type Response, type NextFunction } from 'express';
import { TOP_N_WORDS_DEFAULT, type GenerateWordReportUseCase } from '../../usecases/GenerateWordReportUseCase';
import path from 'path';
import { HTTP_STATUS } from '../../infrastructure/models/HttpStatus';

export class PdfController {
	constructor(private readonly generateWordReportUseCase: GenerateWordReportUseCase) {}

	async processPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			if (!req.file) {
				res.status(HTTP_STATUS.BAD_REQUEST).send('Nenhum arquivo foi enviado.');
				return;
			}

			// Processa o arquivo PDF
			const filePath = path.resolve(req.file.path);
			await this.generateWordReportUseCase.execute(filePath, TOP_N_WORDS_DEFAULT);

			// Obter os caminhos dos relatórios
			const { txt, csv } = this.generateWordReportUseCase.getReportPaths();

			// Enviar os arquivos como resposta
			res.status(HTTP_STATUS.SUCCESS).json({
				message: 'Relatórios gerados com sucesso.',
				txtReport: txt,
				csvReport: csv
			});
		} catch (error) {
			next(error);
		}
	}
}
