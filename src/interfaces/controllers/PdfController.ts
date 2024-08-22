import { type Request, type Response, type NextFunction } from 'express';
import { type GenerateWordReportUseCase } from '../../usecases/GenerateWordReportUseCase';
import { HTTP_STATUS } from '../../infrastructure/models/HttpStatus';
import { Readable } from 'stream';
import { ReportStrategyFactory } from '../../infrastructure/services/ReportStrategyFactory';
import { ReportFormatValidator } from '../../infrastructure/services/ReportFormatValidator';

export const TOP_N_WORDS_DEFAULT = 20;

export class PdfController {
	private readonly formatValidator: ReportFormatValidator;

	constructor(private readonly generateWordReportUseCase: GenerateWordReportUseCase) {
		this.formatValidator = new ReportFormatValidator();
	}

	async processPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			if (!req.file) {
				res.status(HTTP_STATUS.BAD_REQUEST).send({ error: 'Nenhum arquivo foi enviado.' });
				return;
			}

			if (req.file.mimetype !== 'application/pdf') {
				res.status(HTTP_STATUS.BAD_REQUEST).send({ error: 'O arquivo enviado não é um PDF.' });
				return;
			}

			// eslint-disable-next-line camelcase, @typescript-eslint/naming-convention
			const { format, number_ranked_words = TOP_N_WORDS_DEFAULT } = req.body;

			if (!format || !this.formatValidator.isValidFormat(format)) {
				res.status(HTTP_STATUS.BAD_REQUEST).send({
					error: `Formato inválido. Use um dos formatos a seguir: ${this.formatValidator.getAcceptedFormats()}`
				});
				return;
			}

			const pdfStream = new Readable();
			pdfStream.push(req.file.buffer);
			pdfStream.push(null);

			const reportContent = await this.generateWordReportUseCase.executeFromStream(pdfStream, number_ranked_words);
			const strategy = ReportStrategyFactory.getStrategy(format);

			res.setHeader('Content-Type', strategy.getContentType());
			res.setHeader('Content-Disposition', `attachment; filename=${strategy.getFileName()}`);
			res.send(strategy.generateReport(reportContent));
		} catch (error) {
			next(error);
		}
	}
}
