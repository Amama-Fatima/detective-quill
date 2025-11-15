import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { SupabaseModule } from "./supabase/supabase.module";
import { ConfigModule } from "@nestjs/config";
import { ProjectsService } from "./projects/projects.service";
import { ProjectsModule } from "./projects/projects.module";
import { FsNodesModule } from "./fs-nodes/fs-nodes.module";
import { BlueprintsModule } from "./blueprints/blueprints.module";
import { BlueprintCardsModule } from "./blueprint_cards/blueprint_cards.module";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { CommentsModule } from "./comments/comments.module";
import { MembersModule } from "./members/members.module";
import { InvitationsModule } from './invitations/invitations.module';
import { EmailModule } from "./email/email.module";
import { QueueModule } from "./queue/queue.module";
@Module({
  controllers: [AppController],
  providers: [AppService, ProjectsService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    ClientsModule.register([
      {
        name: "RABBITMQ_SERVICE",
        transport: Transport.RMQ,
        options: {
          urls: ["amqp://guest:guest@localhost:5672"],
          queue: "my_queue",
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
    SupabaseModule,
    ProjectsModule,
    FsNodesModule,
    BlueprintsModule,
    BlueprintCardsModule,
    CommentsModule,
    MembersModule,
    InvitationsModule,
    EmailModule,
    QueueModule,
  ],
})
export class AppModule {}
