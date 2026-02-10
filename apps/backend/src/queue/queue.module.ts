import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { QueueService } from "./queue.service";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: "RABBITMQ_SERVICE",
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672",
          ],
          queue: "my_queue",
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
