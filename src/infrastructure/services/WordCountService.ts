// src/infrastructure/services/WordCountService.ts
import { type IWordCountService } from '../../domain/services/IWordCountService';
import { WordCount } from '../../domain/entities/WordCount';

export class WordCountService implements IWordCountService {
	countWords(text: string): WordCount[] {
		const minWordCharacter = 1;
		const initialWordCount = 0;
		const wordIncrement = 1;
		const words = text.toLowerCase().match(/\b\w+\b/g) ?? [];
		const filteredWords = words.filter((word) => word.length > minWordCharacter && isNaN(Number(word)));
		const wordCountMap: Record<string, number> = {};

		filteredWords.forEach((word) => {
			wordCountMap[word] = (wordCountMap[word] || initialWordCount) + wordIncrement;
		});

		return Object.entries(wordCountMap).map(([word, count]) => new WordCount(word, count));
	}
}
