import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: "http://localhost:3000",
    credentials: true,
  });

    // Global validation: transforms payloads into DTO instances and strips unknown props
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,     // plain -> class instances (enables class-transformer)
      whitelist: true,     // remove properties not in the DTO
      forbidNonWhitelisted: false, // set true to throw on unknown props
      transformOptions: { enableImplicitConversion: true }, // optional
    })
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Backend server running on http://localhost:${port}`);
}
bootstrap();
