import { NestFactory } from "@nestjs/core";
import { WorkerModule } from "./worker.module";
import { Transport } from "@nestjs/microservices";

async function bootstrap() {
  const app = await NestFactory.createMicroservice(WorkerModule, {
    transport: Transport.RMQ,
    options: {
      urls: ["amqp://guest:guest@localhost:5672"],
      queue: "my_queue",
      queueOptions: { durable: true },
    },
  });

  await app.listen();
  console.log("Worker is running...");
}

bootstrap();
