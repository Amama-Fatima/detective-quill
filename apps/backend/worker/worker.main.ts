import { NestFactory } from "@nestjs/core";
import { WorkerModule } from "./worker.module";
import { Transport } from "@nestjs/microservices";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function bootstrap() {
  const app = await NestFactory.createMicroservice(WorkerModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672"],
      queues: ["scene_analysis_results_queue", "invite_email_job"],
      queueOptions: { durable: true },
    },
  });

  await app.listen();
  console.log("Worker is running...");
}

bootstrap();
