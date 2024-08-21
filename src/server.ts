import { GoogleGenerativeAI } from '@google/generative-ai';
import promptSync from 'prompt-sync';
import dotenv from 'dotenv';
import { PdfService } from './domain/services/PdfService';
import { WordCountService } from './infrastructure/services/WordCountService';
import { GoogleAIService } from './infrastructure/services/GoogleAIService';
import { ReportService } from './infrastructure/services/ReportService';
import { GenerateWordReportUseCase } from './usecases/GenerateWordReportUseCase';
import { GenerateWordReportController } from './interfaces/controllers/GenerateWordReportController';

dotenv.config();

export const TOP_N_WORDS_DEFAULT = 20;

(() => {
	void main();
})();

async function main(): Promise<void> {
	const pdfService = new PdfService();
	const wordCountService = new WordCountService();

	// Configurar a API do Google
	const genAI = new GoogleGenerativeAI(process.env.API_KEY ?? '');
	const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
	const googleAIService = new GoogleAIService(model);

	const reportsPath = 'reports';
	const reportService = new ReportService(
		`${reportsPath}/relatorio_palavras.csv`,
		`${reportsPath}/relatorio_palavras.txt`
	);

	const generateWordReportUseCase = new GenerateWordReportUseCase(
		pdfService,
		wordCountService,
		googleAIService,
		reportService
	);
	const generateWordReportController = new GenerateWordReportController(generateWordReportUseCase);

	const prompt = promptSync();
	const suggestedPath = 'file.pdf';
	const filePath = prompt(`Por favor, insira o caminho completo para o arquivo PDF: ${suggestedPath}`, suggestedPath);

	await generateWordReportController.handleRequest(filePath, TOP_N_WORDS_DEFAULT);

	void main();
}
