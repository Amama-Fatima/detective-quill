import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as amqp from "amqp-connection-manager";
import { WorkerNlpAnalysisService } from "src/nlp-analysis/worker-nlp-analysis.service";

@Injectable()
export class ManualRabbitMQConsumer implements OnModuleInit {
  private connection: any;
  private channelWrapper: any;

  constructor(
    private configService: ConfigService,
    private nlpAnalysisService: WorkerNlpAnalysisService,
  ) {}

  async onModuleInit() {
    const rabbitmqUrl =
      this.configService.get<string>("RABBITMQ_URL") ||
      "amqp://guest:guest@localhost:5672";

    console.log("Connecting to RabbitMQ for NLP results consumer...");

    this.connection = amqp.connect([rabbitmqUrl]);

    this.channelWrapper = this.connection.createChannel({
      json: false, // We'll parse JSON manually
      setup: async (channel: any) => {
        await channel.assertQueue("scene_analysis_results_queue", {
          durable: true,
        });

        await channel.consume(
          "scene_analysis_results_queue",
          async (msg: any) => {
            if (msg) {
              await this.handleMessage(msg, channel);
            }
          },
          { noAck: false },
        );

        console.log("✓ Listening on scene_analysis_results_queue");
      },
    });

    this.connection.on("connect", () => {
      console.log("✓ Connected to RabbitMQ for NLP consumer");
    });

    this.connection.on("disconnect", (err: any) => {
      console.error("✗ Disconnected from RabbitMQ:", err);
    });
  }

  private async handleMessage(msg: any, channel: any) {
    try {
      const content = msg.content.toString();
      console.log("=== RAW MESSAGE RECEIVED ===");
      console.log("Content:", content);
      console.log("===========================");

      const data = JSON.parse(content);
      const { job_id, status, result, error } = data;

      console.log(`Received result for job ${job_id}: ${status}`);

      if (status === "completed" && result) {
        await this.nlpAnalysisService.saveAnalysisResult(job_id, result);

        console.log(`✓ Saved knowledge graph for job ${job_id}`);
        console.log(`  - Entities: ${result.metadata.num_entities}`);
        console.log(`  - Relationships: ${result.metadata.num_relationships}`);
      } else {
        console.error(`✗ Job ${job_id} failed: ${error}`);
        await this.nlpAnalysisService.markJobAsFailed(
          job_id,
          error || "Unknown error",
        );
      }

      channel.ack(msg);
    } catch (err) {
      console.error("Error processing message:", err);
      channel.nack(msg, false, false); // Don't requeue to avoid infinite loop
    }
  }
}
