import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { PdfService } from '../../infrastructure/services/PdfService';
import { WordCountService } from '../../infrastructure/services/WordCountService';
import { GoogleAIService } from '../../infrastructure/services/GoogleAIService';
import { type FormatReports, ReportService } from '../../infrastructure/services/ReportService';
import { GenerateWordReportUseCase } from '../../usecases/GenerateWordReportUseCase';
import { PdfController } from './PdfController';

dotenv.config();

export class PdfControllerFactory {
	static create(format: FormatReports): PdfController {
		const pdfService = new PdfService();
		const wordCountService = new WordCountService();

		// Configurar a API do Google
		const genAI = new GoogleGenerativeAI(process.env.API_KEY ?? '');
		const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
		const googleAIService = new GoogleAIService(model);

		// Configurar o serviço de relatórios
		const reportService = new ReportService(format);

		// Criar o caso de uso
		const generateWordReportUseCase = new GenerateWordReportUseCase(
			pdfService,
			wordCountService,
			googleAIService,
			reportService
		);

		// Retornar uma instância de PdfController com as dependências injetadas
		return new PdfController(generateWordReportUseCase);
	}
}
