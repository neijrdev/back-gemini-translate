// src/infrastructure/frameworks/expressServer.ts
import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import cors from 'cors';
import { PdfControllerFactory } from './interfaces/controllers/PdfControllerFactory';
import { AsyncHandler } from './infrastructure/midlewares/AsyncHandler';

dotenv.config();

const app = express();
app.use(cors({}));
const upload = multer({ storage: multer.memoryStorage() });

app.post(
	'/process-pdf',
	upload.single('file'),
	AsyncHandler.asyncHandler(async (req, res, next) => {
		const pdfController = PdfControllerFactory.create(req.body.format);

		await pdfController.processPdf(req, res, next);
	})
);

const PORT_DEFAULT = 3000;

const PORT = process.env.PORT ?? PORT_DEFAULT;
app.listen(PORT, () => {
	console.log(`Servidor rodando na porta ${PORT}`);
});
