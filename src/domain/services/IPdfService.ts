import { type Readable } from 'stream';

export interface IPdfService {
	extractTextFromStream: (stream: Readable) => Promise<string>;
}
