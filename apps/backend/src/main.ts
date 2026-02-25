import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import * as bodyParser from "body-parser";

// import helmet from "helmet";

// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: ["'self'"], // add trusted CDNs or nonces as needed
//       styleSrc: ["'self'"],
//       imgSrc: ["'self'", "data:"],
//     }
//   }
// }));

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.enableCors({
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: false,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 Backend server running on http://localhost:${port}`);
  } catch (error) {
    console.error("Error during bootstrap:", error);
    process.exit(1); // ← this makes Render show the actual error in logs
  }
}
bootstrap();
