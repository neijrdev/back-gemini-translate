// src/infrastructure/services/GoogleAIService.ts
import { type IGoogleAIService } from '../../domain/services/IGoogleAIService';
import { type GenerativeModel } from '@google/generative-ai';

export class GoogleAIService implements IGoogleAIService {
	private readonly model: GenerativeModel;

	constructor(model: GenerativeModel) {
		this.model = model;
	}

	getPromptGoogleAi(words: string[]): string {
		const intro = `For each of the following words [${words.join(', ')}], generate a JSON object with the following format:`;
		const formatExample = '{"word":"a","example_phrase_en":"example.","example_phrase_pt":"Example."}';
		const instruction = 'in the phrase examples enclose the passed word between [].';
		const exampleUsage =
			'{"word":"the", "example_phrase_en":"This is [the] example.", "example_phrase_pt":"Este é [o] exemplo."}.';
		const context =
			'For the example sentences try to find phrases from the context of technology, programming, nerd world, etc.';

		return `${intro} ${formatExample} ${instruction} ${exampleUsage} ${context}`;
	}

	async generatePhrases(
		words: string[]
	): Promise<Array<{ word: string; example_phrase_en: string; example_phrase_pt: string }>> {
		const prompt = this.getPromptGoogleAi(words);

		const result = await this.model.generateContent(prompt);
		const response = result.response;
		const text = response.text().replace('```json', '').replace('```', '');
		return JSON.parse(text);
	}
}
