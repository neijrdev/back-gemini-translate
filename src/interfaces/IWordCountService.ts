export interface IWordCountService {
	countWords: (text: string) => Record<string, number>;
}
