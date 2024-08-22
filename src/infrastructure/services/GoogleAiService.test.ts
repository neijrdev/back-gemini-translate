import { GoogleAIService } from './GoogleAIService';
import { type GenerativeModel } from '@google/generative-ai';

describe('GoogleAIService', () => {
	let mockModel: jest.Mocked<Partial<GenerativeModel>>;
	let googleAIService: GoogleAIService;

	beforeEach(() => {
		// Criando o mock diretamente com o tipo correto
		const mockGenerateContent: jest.MockedFunction<GenerativeModel['generateContent']> = jest.fn();

		mockModel = {
			generateContent: mockGenerateContent
		};

		googleAIService = new GoogleAIService(mockModel as GenerativeModel);
	});

	it('should generate the correct phrases for given words', async () => {
		const words = ['the', 'word'];

		// Definindo o tipo MockResponse localmente
		interface MockResponse {
			response: {
				text: () => string;
			};
		}

		const mockResponseText = `
		[
			{"word": "the", "example_phrase_en": "This is [the] example.", "example_phrase_pt": "Este é [o] exemplo."},
			{"word": "word", "example_phrase_en": "This is [word] example.", "example_phrase_pt": "Este é [palavra] exemplo."}
		]`;

		(mockModel.generateContent as jest.Mock).mockResolvedValue({
			response: {
				text: jest.fn().mockReturnValue(mockResponseText)
			}
		} as unknown as MockResponse);

		const result = await googleAIService.generatePhrases(words);

		expect(mockModel.generateContent).toHaveBeenCalledWith(expect.any(String));
		expect(result).toEqual([
			{ word: 'the', example_phrase_en: 'This is [the] example.', example_phrase_pt: 'Este é [o] exemplo.' },
			{ word: 'word', example_phrase_en: 'This is [word] example.', example_phrase_pt: 'Este é [palavra] exemplo.' }
		]);
	});

	it('should handle invalid JSON response gracefully', async () => {
		const words = ['the'];

		interface MockResponse {
			response: {
				text: () => string;
			};
		}

		(mockModel.generateContent as jest.Mock).mockResolvedValue({
			response: {
				text: jest.fn().mockReturnValue('Invalid JSON')
			}
		} as unknown as MockResponse);

		await expect(googleAIService.generatePhrases(words)).rejects.toThrow(SyntaxError);
	});

	it('should generate the correct prompt for given words', () => {
		const words = ['the', 'word'];
		const expectedPrompt =
			'For each of the following words [the, word], generate a JSON object with the following format: {"word":"a","example_phrase_en":"example.","example_phrase_pt":"Example."} in the phrase examples enclose the passed word between []. {"word":"the", "example_phrase_en":"This is [the] example.", "example_phrase_pt":"Este é [o] exemplo."}. For the example sentences try to find phrases from the context of technology, programming, nerd world, etc.';

		const result = googleAIService.getPromptGoogleAi(words);
		expect(result).toBe(expectedPrompt);
	});
});
