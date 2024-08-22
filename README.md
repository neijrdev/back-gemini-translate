src/
├── domain/
│   ├── entities/
│   │   └── WordCount.ts
│   └── services/
│       ├── IGoogleAIService.ts
│       ├── IPdfService.ts
│       ├── IReportService.ts
│       └── IWordCountService.ts
├── usecases/
│   └── GenerateWordReportUseCase.ts
├── interfaces/
│   └── controllers/
│       ├── PdfController.ts
│       └── PdfControllerFactory.ts
├── infrastructure/
│   ├── middlewares/
│   │   └── AsyncHandler.ts
│   ├── models/
│   │   └── HttpStatus.ts
│   └── services/
│       ├── GoogleAIService.ts
│       ├── PdfService.ts
│       ├── ReportService.ts
│       └── WordCountService.ts
└── server.ts