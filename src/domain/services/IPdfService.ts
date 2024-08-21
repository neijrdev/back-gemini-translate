export interface IPdfService {
	extractText: (filePath: string) => Promise<string>;
}
