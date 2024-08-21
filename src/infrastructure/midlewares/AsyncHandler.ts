import { type Request, type Response, type NextFunction } from 'express';

export class AsyncHandler {
	static asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
		return (req: Request, res: Response, next: NextFunction) => {
			Promise.resolve(fn(req, res, next)).catch(next);
		};
	}
}
