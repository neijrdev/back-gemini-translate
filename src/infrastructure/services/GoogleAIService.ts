// src/infrastructure/services/GoogleAIService.ts
import { type IGoogleAIService } from '../../domain/services/IGoogleAIService';
import { type GenerativeModel } from '@google/generative-ai';

export class GoogleAIService implements IGoogleAIService {
	private readonly model: GenerativeModel;

	constructor(model: GenerativeModel) {
		this.model = model;
	}

	async generatePhrases(
		words: string[]
	): Promise<Array<{ word: string; example_phrase_en: string; example_phrase_pt: string }>> {
		const prompt = `For each of the following words [${words.join(', ')}], generate a JSON object with the following format: {"word":"a","example_phrase_en":"example.","example_phrase_pt":"Example."}' in the phrase examples enclose the passed word between []. {"word":"the", "example_phrase_en":"This is [the] example.", "example_phrase_pt":"Este é [o] exemplo."}`;
		const result = await this.model.generateContent(prompt);
		const response = result.response;
		const text = response.text().replace('```json', '').replace('```', '');
		return JSON.parse(text);
	}
}
