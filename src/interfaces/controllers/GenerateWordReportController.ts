import { type GenerateWordReportUseCase } from '../../usecases/GenerateWordReportUseCase';

export class GenerateWordReportController {
	constructor(private readonly generateWordReportUseCase: GenerateWordReportUseCase) {}

	async handleRequest(filePath: string, topNWords: number): Promise<void> {
		await this.generateWordReportUseCase.execute(filePath, topNWords);

		const { txt, csv } = this.generateWordReportUseCase.getReportPaths();
		console.log(`Relatórios gerados: \n- TXT: file://${txt}\n- CSV: file://${csv}`);
	}
}
