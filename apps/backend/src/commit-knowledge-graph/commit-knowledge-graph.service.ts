import { Injectable, Logger } from "@nestjs/common";
import { randomUUID } from "crypto";
import { Database } from "@detective-quill/shared-types";
import { AdminSupabaseService } from "../supabase/admin-supabase.service";
import { WorkerSnapshotsService } from "../snapshots/worker-snapshots.service";
import { QueueService } from "../queue/queue.service";
import { extractPlainTextFromEditorContent } from "../utils/editor-content";

type CommitSnapshotRow = Database["public"]["Tables"]["commit_snapshots"]["Row"];
type CommitKgStatus = Database["public"]["Enums"]["commit_kg_status"];

@Injectable()
export class CommitKnowledgeGraphService {
  private readonly logger = new Logger(CommitKnowledgeGraphService.name);

  constructor(
    private readonly adminSupabaseService: AdminSupabaseService,
    private readonly snapshotsService: WorkerSnapshotsService,
    private readonly queueService: QueueService,
  ) {}

  async enqueueCommitKnowledgeGraphJobs(
    commitId: string,
    _projectId: string,
    userId: string | null | undefined,
    changedFileFsNodeIds?: string[],
  ): Promise<{ enqueued: number }> {
    if (userId == null || String(userId).trim() === "") {
      this.logger.warn(
        `Skipping KG enqueue for commit ${commitId}: no user_id (RLS/nlp_analysis_jobs require it)`,
      );
      return { enqueued: 0 };
    }

    const supabase = this.adminSupabaseService.client;

    const snapshots = await this.snapshotsService.getSnapshotsByCommit(
      commitId,
    );

    let fileSnapshots = snapshots.filter(
      (row: CommitSnapshotRow): boolean =>
        row.node_type === "file" &&
        row.content != null &&
        String(row.content).trim() !== "",
    );

    if (changedFileFsNodeIds != null && Array.isArray(changedFileFsNodeIds)) {
      const changedSet = new Set(changedFileFsNodeIds);
      fileSnapshots = fileSnapshots.filter((row) =>
        changedSet.has(row.fs_node_id),
      );
      this.logger.debug(
        `KG enqueue: limiting to ${fileSnapshots.length} changed file(s) (added/modified)`,
      );
    }

    if (fileSnapshots.length === 0) {
      this.logger.log(
        `No file snapshots with content for commit ${commitId}, skipping KG enqueue`,
      );
      return { enqueued: 0 };
    }

    let enqueued = 0;

    for (const snapshot of fileSnapshots) {
      const sceneText = extractPlainTextFromEditorContent(snapshot.content);
      if (sceneText.trim() === "") {
        this.logger.debug(
          `Skipping snapshot ${snapshot.id}: no plain text after extraction`,
        );
        continue;
      }

      const jobId = randomUUID();

      const { error: jobError } = await supabase.from("nlp_analysis_jobs").insert({
        job_id: jobId,
        user_id: userId,
        scene_text: sceneText,
        status: "QUEUED",
        progress: 0,
      });

      if (jobError) {
        this.logger.error(
          `Failed to create nlp_analysis_jobs row for snapshot ${snapshot.id}: ${jobError.message}`,
        );
        continue;
      }

      const ckgInsert: Database["public"]["Tables"]["commit_knowledge_graphs"]["Insert"] =
        {
          commit_id: commitId,
          commit_snapshot_id: snapshot.id,
          job_id: jobId,
          status: "pending" as CommitKgStatus,
        };

      const { error: ckgError } = await supabase
        .from("commit_knowledge_graphs")
        .insert(ckgInsert);

      if (ckgError) {
        this.logger.error(
          `Failed to create commit_knowledge_graphs row for job ${jobId}: ${ckgError.message}`,
        );
        continue;
      }

      try {
        await this.queueService.sendSceneAnalysisJob({
          job_id: jobId,
          scene_text: sceneText,
          user_id: userId,
          scene_id: jobId,
        });
        enqueued++;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(
          `Failed to send scene analysis job ${jobId} to queue: ${message}`,
        );
      }
    }

    this.logger.log(
      `Enqueued ${enqueued}/${fileSnapshots.length} KG jobs for commit ${commitId}`,
    );
    return { enqueued };
  }
}
