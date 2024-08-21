// src/interfaces/IGoogleAIService.ts
export interface IGoogleAIService {
	generatePhrases: (
		words: string[]
	) => Promise<Array<{ word: string; example_phrase_en: string; example_phrase_pt: string }>>;
}
