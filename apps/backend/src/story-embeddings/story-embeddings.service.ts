import { Injectable, Logger } from "@nestjs/common";
import {
  type CommitSnapshot,
  type TablesInsert,
} from "@detective-quill/shared-types";
import { AdminSupabaseService } from "src/supabase/admin-supabase.service";
import { WorkerSnapshotsService } from "src/snapshots/worker-snapshots.service";
import { extractPlainTextFromEditorContent } from "src/utils/editor-content";

type StoryEmbeddingInsert = TablesInsert<"story_embeddings">;
type EmbeddableSnapshot = CommitSnapshot & {
  content: string;
  fs_node_id: string;
};

type ChangedFile = {
  fs_node_id: string;
};

type ChangedFiles = {
  added: ChangedFile[];
  modified: ChangedFile[];
  deleted: ChangedFile[];
};

type EmbeddingProvider = "modal" | "open";

const DEFAULT_EMBEDDING_MODEL = "BAAI/bge-small-en-v1.5";
const DEFAULT_EMBEDDING_DIMENSIONS = 384;
const OPENAI_EMBEDDING_API_URL = "https://api.openai.com/v1/embeddings";
const OPENAI_EMBEDDING_MODEL = "text-embedding-3-small";

@Injectable()
export class StoryEmbeddingsService {
  private readonly logger = new Logger(StoryEmbeddingsService.name);

  private readonly embeddingProvider: EmbeddingProvider;
  private readonly embeddingApiUrl: string;
  private readonly embeddingApiKey?: string;
  private readonly embeddingAuthHeader: string;
  private readonly embeddingAuthScheme: string;
  private readonly embeddingModel: string;
  private readonly embeddingDimensions: number;
  private readonly maxChunkChars: number;
  private readonly chunkOverlapChars: number;

  constructor(
    private readonly adminSupabaseService: AdminSupabaseService,
    private readonly snapshotsService: WorkerSnapshotsService,
  ) {
    this.embeddingProvider = this.resolveEmbeddingProvider();
    this.embeddingApiUrl =
      this.embeddingProvider === "open"
        ? (process.env.OPENAI_EMBEDDING_API_URL ?? OPENAI_EMBEDDING_API_URL)
        : (process.env.EMBEDDING_API_URL ?? "");
    this.embeddingApiKey =
      this.embeddingProvider === "open"
        ? (process.env.OPENAI_API_KEY ?? process.env.EMBEDDING_API_KEY)
        : process.env.EMBEDDING_API_KEY;
    this.embeddingAuthHeader =
      process.env.EMBEDDING_AUTH_HEADER ?? "Authorization";
    this.embeddingAuthScheme = process.env.EMBEDDING_AUTH_SCHEME ?? "Bearer";
    this.embeddingModel =
      this.embeddingProvider === "open"
        ? (process.env.OPENAI_EMBEDDING_MODEL ?? OPENAI_EMBEDDING_MODEL)
        : (process.env.EMBEDDING_MODEL ?? DEFAULT_EMBEDDING_MODEL);
    this.embeddingDimensions = Number(
      this.embeddingProvider === "open"
        ? (process.env.OPENAI_EMBEDDING_DIMENSIONS ??
            process.env.EMBEDDING_DIMENSIONS ??
            DEFAULT_EMBEDDING_DIMENSIONS)
        : (process.env.EMBEDDING_DIMENSIONS ?? DEFAULT_EMBEDDING_DIMENSIONS),
    );
    this.maxChunkChars = Number(process.env.EMBEDDING_CHUNK_SIZE ?? 1200);
    this.chunkOverlapChars = Number(process.env.EMBEDDING_CHUNK_OVERLAP ?? 200);
  }

  async syncEmbeddingsForCommit(
    projectId: string,
    commitId: string,
    changedFiles: ChangedFiles,
  ): Promise<{ insertedChunks: number; deletedRows: number }> {
    if (!this.embeddingApiUrl) {
      this.logger.warn(
        "Skipping story embeddings sync: EMBEDDING_API_URL is not configured.",
      );
      return { insertedChunks: 0, deletedRows: 0 };
    }

    if (this.embeddingProvider === "open" && !this.embeddingApiKey) {
      this.logger.warn(
        "Skipping story embeddings sync: OPENAI_API_KEY is not configured.",
      );
      return { insertedChunks: 0, deletedRows: 0 };
    }

    const supabase = this.adminSupabaseService.client;
    const idsToDelete = Array.from(
      new Set([
        ...changedFiles.modified.map((f) => f.fs_node_id),
        ...changedFiles.deleted.map((f) => f.fs_node_id),
      ]),
    );

    let deletedRows = 0;
    if (idsToDelete.length > 0) {
      const { error: deleteError, count } = await supabase
        .from("story_embeddings")
        .delete({ count: "exact" })
        .in("fs_node_id", idsToDelete);

      if (deleteError) {
        this.logger.error(
          `Failed deleting old story embeddings: ${deleteError.message}`,
        );
      } else {
        deletedRows = count ?? 0;
      }
    }

    const idsToUpsert = new Set([
      ...changedFiles.added.map((f) => f.fs_node_id),
      ...changedFiles.modified.map((f) => f.fs_node_id),
    ]);

    if (idsToUpsert.size === 0) {
      return { insertedChunks: 0, deletedRows };
    }

    const snapshots =
      await this.snapshotsService.getSnapshotsByCommit(commitId);
    const targetSnapshots = snapshots.filter(
      (row: CommitSnapshot): row is EmbeddableSnapshot =>
        row.node_type === "file" &&
        row.fs_node_id != null &&
        idsToUpsert.has(row.fs_node_id) &&
        row.content != null &&
        String(row.content).trim() !== "",
    );

    let insertedChunks = 0;

    for (const snapshot of targetSnapshots) {
      const plainText = extractPlainTextFromEditorContent(snapshot.content);
      if (plainText.trim() === "") {
        continue;
      }

      const chunks = this.chunkText(plainText);
      if (chunks.length === 0) {
        continue;
      }

      const rows: StoryEmbeddingInsert[] = [];
      const embeddings = await this.generateEmbeddings(chunks);

      for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
        const chunkText = chunks[chunkIndex];
        const embedding = embeddings[chunkIndex];
        if (!embedding) {
          continue;
        }

        rows.push({
          project_id: projectId,
          commit_id: commitId,
          fs_node_id: snapshot.fs_node_id,
          snapshot_id: snapshot.id,
          path: snapshot.path ?? "",
          content_hash: snapshot.content_hash ?? "",
          chunk_index: chunkIndex,
          chunk_text: chunkText,
          embedding: this.vectorToSqlLiteral(embedding),
        });
      }

      if (rows.length === 0) {
        continue;
      }

      const { error: insertError } = await supabase
        .from("story_embeddings")
        .insert(rows);

      if (insertError) {
        this.logger.error(
          `Failed inserting story embeddings for fs_node ${snapshot.fs_node_id}: ${insertError.message}`,
        );
        continue;
      }

      insertedChunks += rows.length;
    }

    this.logger.log(
      `Story embeddings synced for commit ${commitId}: inserted ${insertedChunks} chunk(s), deleted ${deletedRows} stale row(s).`,
    );

    return { insertedChunks, deletedRows };
  }

  private chunkText(text: string): string[] {
    const normalized = text.trim();
    if (!normalized) {
      return [];
    }

    if (normalized.length <= this.maxChunkChars) {
      return [normalized];
    }

    const chunks: string[] = [];
    const step = Math.max(1, this.maxChunkChars - this.chunkOverlapChars);

    for (let start = 0; start < normalized.length; start += step) {
      const end = Math.min(start + this.maxChunkChars, normalized.length);
      const chunk = normalized.slice(start, end).trim();
      if (chunk.length > 0) {
        chunks.push(chunk);
      }
      if (end >= normalized.length) {
        break;
      }
    }

    return chunks;
  }

  private async generateEmbeddings(
    inputs: string[],
  ): Promise<Array<number[] | null>> {
    if (inputs.length === 0) {
      return [];
    }

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (this.embeddingApiKey) {
        headers[this.embeddingAuthHeader] =
          this.embeddingAuthScheme === ""
            ? this.embeddingApiKey
            : `${this.embeddingAuthScheme} ${this.embeddingApiKey}`;
      }

      const response = await fetch(this.embeddingApiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(this.buildEmbeddingRequestBody(inputs)),
      });

      if (!response.ok) {
        const body = await response.text();
        this.logger.error(
          `Embedding API failed (${response.status}): ${body.slice(0, 500)}`,
        );
        return inputs.map(() => null);
      }

      const payload = (await response.json()) as {
        data?: Array<{ embedding?: number[]; index?: number }>;
        embeddings?: number[][];
      };
      const embeddings = this.extractEmbeddingsFromPayload(
        payload,
        inputs.length,
      );

      if (embeddings.every((embedding) => embedding === null)) {
        this.logger.error(
          "Embedding API returned an invalid embedding payload",
        );
        return inputs.map(() => null);
      }

      for (const embedding of embeddings) {
        if (embedding && embedding.length !== this.embeddingDimensions) {
          this.logger.warn(
            `Embedding dimension mismatch: expected ${this.embeddingDimensions}, got ${embedding.length}`,
          );
        }
      }

      return embeddings;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Embedding generation failed: ${message}`);
      return inputs.map(() => null);
    }
  }

  private buildEmbeddingRequestBody(inputs: string[]): Record<string, unknown> {
    const body: Record<string, unknown> = {
      input: inputs.length === 1 ? inputs[0] : inputs,
    };

    if (this.embeddingProvider === "modal") {
      body.input_type = "document";
    }

    if (this.embeddingModel) {
      body.model = this.embeddingModel;
    }

    if (this.embeddingProvider === "open") {
      body.dimensions = this.embeddingDimensions;
    }

    return body;
  }

  private extractEmbeddingsFromPayload(
    payload: {
      data?: Array<{ embedding?: number[]; index?: number }>;
      embeddings?: number[][];
    },
    expectedCount: number,
  ): Array<number[] | null> {
    const results: Array<number[] | null> = Array.from(
      { length: expectedCount },
      () => null,
    );

    if (Array.isArray(payload.embeddings)) {
      payload.embeddings.forEach((embedding, index) => {
        if (Array.isArray(embedding)) {
          results[index] = embedding;
        }
      });
      return results;
    }

    if (Array.isArray(payload.data)) {
      payload.data.forEach((item, fallbackIndex) => {
        const index =
          typeof item.index === "number" ? item.index : fallbackIndex;
        if (
          index >= 0 &&
          index < expectedCount &&
          Array.isArray(item.embedding)
        ) {
          results[index] = item.embedding;
        }
      });
    }

    return results;
  }

  private vectorToSqlLiteral(values: number[]): string {
    return `[${values.join(",")}]`;
  }

  private resolveEmbeddingProvider(): EmbeddingProvider {
    const rawProvider = (process.env.use ?? process.env.USE ?? "modal")
      .trim()
      .toLowerCase();

    return rawProvider === "open" ? "open" : "modal";
  }
}
