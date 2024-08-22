import { GoogleAIService } from './GoogleAIService';
import { type GenerativeModel } from '@google/generative-ai';

describe('GoogleAIService', () => {
	let mockModel: jest.Mocked<GenerativeModel>;
	let googleAIService: GoogleAIService;

	beforeEach(() => {
		// Criando um mock do GenerativeModel
		mockModel = {
			generateContent: jest.fn(),
		} as unknown as jest.Mocked<GenerativeModel>;

		googleAIService = new GoogleAIService(mockModel);
	});

	it('should generate the correct phrases for given words', async () => {
		const words = ['the', 'word'];

		// Definindo a resposta simulada do modelo
		const mockResponseText = `
		[
			{"word": "the", "example_phrase_en": "This is [the] example.", "example_phrase_pt": "Este é [o] exemplo."},
			{"word": "word", "example_phrase_en": "This is [word] example.", "example_phrase_pt": "Este é [palavra] exemplo."}
		]`;
		mockModel.generateContent.mockResolvedValue({
			response: {
				text: jest.fn().mockReturnValue(mockResponseText),
			},
		} as any); // Usamos `as any` para simplificar o mock

		// Chama o método que estamos testando
		const result = await googleAIService.generatePhrases(words);

		// Verifica se o prompt foi gerado corretamente e se o método foi chamado com o prompt correto
		expect(mockModel.generateContent).toHaveBeenCalledWith(expect.any(String));

		// Verifica se o resultado é o esperado
		expect(result).toEqual([
			{ word: 'the', example_phrase_en: 'This is [the] example.', example_phrase_pt: 'Este é [o] exemplo.' },
			{ word: 'word', example_phrase_en: 'This is [word] example.', example_phrase_pt: 'Este é [palavra] exemplo.' },
		]);
	});

	it('should handle invalid JSON response gracefully', async () => {
		const words = ['the'];

		// Simula uma resposta inválida
		mockModel.generateContent.mockResolvedValue({
			response: {
				text: jest.fn().mockReturnValue('Invalid JSON'),
			},
		} as any);

		// Verifica se o método gera um erro ao tentar processar um JSON inválido
		await expect(googleAIService.generatePhrases(words)).rejects.toThrow(SyntaxError);
	});

    it('should generate the correct prompt for given words', () => {
		const words = ['the', 'word'];
		const expectedPrompt = `For each of the following words [the, word], generate a JSON object with the following format: {"word":"a","example_phrase_en":"example.","example_phrase_pt":"Example."} in the phrase examples enclose the passed word between []. {"word":"the", "example_phrase_en":"This is [the] example.", "example_phrase_pt":"Este é [o] exemplo."}. For the example sentences try to find phrases from the context of technology, programming, nerd world, etc.`;

		const result = googleAIService.getPromptGoogleAi(words);
		expect(result).toBe(expectedPrompt);
	});


});
