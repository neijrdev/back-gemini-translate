// src/interfaces/controllers/PdfControllerFactory.ts
import { PdfService } from '../../infrastructure/services/PdfService';
import { WordCountService } from '../../infrastructure/services/WordCountService';
import { GoogleAIService } from '../../infrastructure/services/GoogleAIService';
import { ReportService } from '../../infrastructure/services/ReportService';
import { GenerateWordReportUseCase } from '../../usecases/GenerateWordReportUseCase';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { PdfController } from './PdfController';

dotenv.config();

export class PdfControllerFactory {
	static create(): PdfController {
		const pdfService = new PdfService();
		const wordCountService = new WordCountService();

		// Configurar a API do Google
		const genAI = new GoogleGenerativeAI(process.env.API_KEY ?? '');
		const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
		const googleAIService = new GoogleAIService(model);

		// Configurar o serviço de relatórios
		const reportService = new ReportService('relatorio_palavras.csv', 'relatorio_palavras.txt');

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
