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
    console.log("Checking router.stack --------------------------");
    console.log(app.getHttpAdapter().getInstance()._router?.stack);
    const adapter = app.getHttpAdapter();
    console.log("Adapter constructor:", adapter.constructor.name);
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.enableCors({
      origin: "http://localhost:3000",
      credentials: true,
    });

    // Global validation: transforms payloads into DTO instances and strips unknown props
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true, // plain -> class instances (enables class-transformer)
        whitelist: true, // remove properties not in the DTO
        forbidNonWhitelisted: false, // set true to throw on unknown props
        transformOptions: { enableImplicitConversion: true }, // optional
      })
    );

    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 Backend server running on http://localhost:${port}`);
  } catch (error) {
    console.error("Error during bootstrap:", error);
  }
}
bootstrap();
