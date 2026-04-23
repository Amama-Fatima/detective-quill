import { Injectable, Logger } from "@nestjs/common";
import { CommitSnapshot } from "@detective-quill/shared-types";
import { AdminSupabaseService } from "../supabase/admin-supabase.service";
import { WorkerSnapshotsService } from "../snapshots/worker-snapshots.service";
import { QueueService } from "../queue/queue.service";
import { extractPlainTextFromEditorContent } from "../utils/editor-content";
import { randomUUID } from "crypto";

@Injectable()
export class CommitKnowledgeGraphService {
  private readonly logger = new Logger(CommitKnowledgeGraphService.name);

  constructor(
    private readonly adminSupabaseService: AdminSupabaseService,
    private readonly snapshotsService: WorkerSnapshotsService,
    private readonly queueService: QueueService,
  ) {}

  async enqueueCommitKnowledgeGraphJobs(
    projectId: string,
    commitId: string,
    userId: string | null | undefined,
    changedFileFsNodeIds?: string[],
  ): Promise<{ enqueued: number }> {
    if (userId == null || String(userId).trim() === "") {
      this.logger.warn(
        `Skipping KG enqueue for commit ${commitId}: no user_id (nlp_analysis_jobs require it)`,
      );
      return { enqueued: 0 };
    }

    const supabase = this.adminSupabaseService.client;

    const snapshots =
      await this.snapshotsService.getSnapshotsByCommit(commitId);

    let fileSnapshots = snapshots.filter(
      (row: CommitSnapshot): boolean =>
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

      const { error: jobError } = await supabase
        .from("nlp_analysis_jobs")
        .upsert(
          {
            job_id: jobId,
            user_id: userId,
            scene_text: sceneText,
            status: "QUEUED",
            progress: 0,
            commit_id: commitId,
            fs_node_id: snapshot.fs_node_id,
            snapshot_id: snapshot.id,
          },
          { onConflict: "job_id" },
        );

      if (jobError) {
        this.logger.error(
          `Failed to upsert nlp_analysis_jobs row for file ${snapshot.fs_node_id}: ${jobError.message}`,
        );
        continue;
      }

      try {
        await this.queueService.sendSceneAnalysisJob({
          job_id: jobId,
          scene_text: sceneText,
          user_id: userId,
          commit_id: commitId,
          project_id: projectId,
          fs_node_id: snapshot.fs_node_id,
        });
        enqueued++;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(
          `Failed to send scene analysis job for file ${jobId} to queue: ${message}`,
        );
      }
    }

    this.logger.log(
      `Enqueued ${enqueued}/${fileSnapshots.length} KG jobs for commit ${commitId}`,
    );
    return { enqueued };
  }
}
