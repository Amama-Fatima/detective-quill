import { NestFactory } from "@nestjs/core";
import { WorkerModule } from "./worker.module";
import { Transport } from "@nestjs/microservices";
import * as dotenv from "dotenv";
import * as path from "path";
import express from "express";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function bootstrap() {
  // Create microservice for RabbitMQ
  const app = await NestFactory.createMicroservice(WorkerModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672"],
      queue: "scene_analysis_results_queue",
      queueOptions: { durable: true },
      noAck: false,
    },
  });

  await app.listen();
  console.log("Worker microservice is running...");

  const httpApp = express();
  httpApp.get("/health", (req, res) => {
    res.json({ status: "ok", service: "worker" });
  });

  const port = process.env.PORT || 3002;
  httpApp.listen(port, () => {
    console.log(`Health check server running on port ${port}`);
  });
}

bootstrap();
