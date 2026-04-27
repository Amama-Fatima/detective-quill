# Version Control Internals

This document explains how commits, branches, snapshots, and filesystem nodes interact to implement version control — specifically commit creation, branch switching, and commit reverting.

---

## Core Data Model

Before diving into operations, here are the four tables that power everything:

### `commits`
| Column | Type | Purpose |
|---|---|---|
| `id` | UUID | Primary key |
| `branch_id` | UUID | Which branch this commit belongs to |
| `project_id` | UUID | Project scope |
| `message` | string | Commit message |
| `parent_commit_id` | UUID \| null | Previous commit — forms the chain |
| `created_at` | timestamp | When it was created |

Commits form a **linked list** going backward. Each commit knows only its parent, not its children.

### `branches`
| Column | Type | Purpose |
|---|---|---|
| `id` | UUID | Primary key |
| `project_id` | UUID | Project scope |
| `head_commit_id` | UUID \| null | The latest (current) commit on this branch |
| `parent_branch_id` | UUID \| null | Which branch this was forked from |
| `parent_commit_id` | UUID \| null | The commit on the parent branch where forking happened |
| `is_active` | boolean | Only one branch is active per project at a time |

The `head_commit_id` pointer is the most important field — it is the only thing that moves when a new commit is made or a revert happens.

### `commit_snapshots`
| Column | Type | Purpose |
|---|---|---|
| `id` | UUID | Primary key |
| `commit_id` | UUID | Which commit this snapshot row belongs to |
| `fs_node_id` | UUID | Which node was captured |
| `project_id` | UUID | Project scope |
| `name` | string | Node name at time of commit |
| `node_type` | `"file"` \| `"folder"` | Type |
| `path` | string | Full path (e.g. `Chapter 1/Scene 2.md`) |
| `content` | string \| null | Full text content (files only) |
| `content_hash` | string | SHA-256 of content, used for change detection |
| `word_count` | number | Word count of content |
| `parent_id` | UUID \| null | Parent folder ID, preserved from node |
| `depth` | number | Nesting level |
| `sort_order` | number | Ordering among siblings |
| `original_created_at` | timestamp | Timestamp from the original `fs_nodes` row |
| `original_updated_at` | timestamp | Timestamp from the original `fs_nodes` row |

A commit's complete state is described by the set of all `commit_snapshots` rows that share its `commit_id`. There are **no diffs** — every snapshot is a full copy of every node.

### `fs_nodes`
| Column | Type | Purpose |
|---|---|---|
| `id` | UUID | Primary key |
| `project_id` | UUID | Project scope |
| `branch_id` | UUID \| null | Which branch this node is currently visible on. `null` means hidden |
| `parent_id` | UUID \| null | Parent folder (self-referential) |
| `name` | string | File or folder name |
| `node_type` | `"file"` \| `"folder"` | Type |
| `path` | string | Auto-computed full path |
| `depth` | number | Auto-computed nesting level |
| `content` | string \| null | Current text content |
| `word_count` | number | Auto-computed from content |
| `sort_order` | number | Ordering among siblings |
| `created_at`, `updated_at` | timestamps | Node timestamps |

`fs_nodes` is the **live working tree** — what the user sees and edits right now. Its content changes whenever the user edits a file, switches branches, or reverts a commit.

---

## Creating a Commit

The goal is to freeze the current state of `fs_nodes` into an immutable snapshot and advance the branch's `head_commit_id`.

### Step 1 — Read the current HEAD

The current `head_commit_id` on the branch is fetched. This will become the new commit's `parent_commit_id`.

```
branches.head_commit_id  →  new commit's parent_commit_id
```

### Step 2 — Insert the commit row

A new row is inserted into `commits`:

```
{
  branch_id,
  project_id,
  message,
  parent_commit_id: (current HEAD from step 1),
  created_at: NOW()
}
```

At this point the commit exists but is empty — it has no snapshots yet.

### Step 3 — Create snapshots from live nodes

Every `fs_nodes` row that belongs to this branch is fetched. For each node, one `commit_snapshots` row is inserted:

```
{
  commit_id:            (new commit id),
  fs_node_id:           node.id,
  project_id:           node.project_id,
  name:                 node.name,
  node_type:            node.node_type,
  path:                 node.path,
  content:              node.content,
  content_hash:         SHA256(node.content ?? ""),
  word_count:           node.word_count,
  parent_id:            node.parent_id,
  depth:                node.depth,
  sort_order:           node.sort_order,
  original_created_at:  node.created_at,
  original_updated_at:  node.updated_at
}
```

After this step, the database holds a permanent, verbatim copy of every file and folder as it exists right now.

### Step 4 — Advance the branch HEAD

```
UPDATE branches SET head_commit_id = (new commit id) WHERE id = branch_id
```

The branch now points to the new commit. The parent chain is intact because the new commit already holds the old HEAD as its `parent_commit_id`.

### Step 5 — Detect changed files (informational only)

This step does **not** change any state. It compares hashes:

1. Fetch all snapshots for the new commit.
2. Fetch all snapshots for the parent commit.
3. Build maps: `fs_node_id → snapshot` for each set.
4. Categorise file nodes only (folders are skipped):
   - **Added** — present in new, absent in parent.
   - **Deleted** — present in parent, absent in new.
   - **Modified** — present in both, `content_hash` differs.

The result is returned to the caller and used to enqueue NLP analysis jobs for changed files.

---

## Switching Branches

Switching branches replaces the entire live working tree (`fs_nodes`) with the snapshot recorded at the target branch's HEAD commit.

### Step 1 — Look up the target branch

Fetch the target branch record. The key field is `head_commit_id` — this is the snapshot that must be restored.

### Step 2 — Restore fs_nodes from the snapshot

This is the core of branch switching. The snapshot for `head_commit_id` is loaded and becomes the new live tree via an **upsert + hide** strategy:

**Upsert (insert or update) every snapshot row as an fs_node:**

Snapshots are sorted by `depth` ascending so folders are always created before the files inside them. For each snapshot:

```
UPSERT fs_nodes SET
  id             = snapshot.fs_node_id,
  project_id     = snapshot.project_id,
  branch_id      = (target branch id),   ← makes it visible on this branch
  name           = snapshot.name,
  node_type      = snapshot.node_type,
  parent_id      = snapshot.parent_id,
  path           = snapshot.path,
  content        = snapshot.content,
  word_count     = snapshot.word_count,
  file_extension = snapshot.file_extension,
  sort_order     = snapshot.sort_order,
  depth          = snapshot.depth,
  created_at     = snapshot.original_created_at,
  updated_at     = snapshot.original_updated_at
WHERE id = snapshot.fs_node_id
```

After all upserts, every node that was in the snapshot now exists in `fs_nodes` with the content it had at that commit, and its `branch_id` points to the branch being switched to.

**Hide orphaned nodes:**

Some nodes may exist in `fs_nodes` from the previous branch that are not part of the target snapshot. These are not deleted — they are hidden by nulling out their `branch_id`:

```sql
UPDATE fs_nodes
SET branch_id = null
WHERE project_id = :projectId
  AND id NOT IN (:snapshotNodeIds)
```

Setting `branch_id = null` removes them from every branch's view without destroying the rows.

### Step 3 — Update the active branch flag

```sql
UPDATE branches SET is_active = false WHERE project_id = :projectId
UPDATE branches SET is_active = true  WHERE id = :branchId
```

Only one branch is active at a time. The `is_active` flag is the application's way of knowing which branch's nodes are currently in the working tree.

After these three steps the user's editor will see the files exactly as they existed when the last commit was made on the target branch.

---

## Reverting a Commit

Reverting rolls the branch back to an earlier commit, discards all commits that came after it, and restores the working tree to match that earlier state.

### Step 1 — Validate that the target is an ancestor

The code walks backward from the current HEAD through the `parent_commit_id` chain:

```
HEAD → parent → grandparent → ... → target?
```

If the target `commitId` is never encountered before reaching a null parent, it is not an ancestor and a `BadRequestException` is thrown. Along the way, every commit ID that is visited (all commits between HEAD and target, exclusive of target itself) is collected into a list: these are the commits that will be deleted.

### Step 2 — Restore the working tree

Identical to the restore step in branch switching: fetch all `commit_snapshots` rows for the target `commitId` and upsert them back into `fs_nodes`, then null out any nodes that weren't in that snapshot.

After this step the user sees the files exactly as they were when the target commit was made.

### Step 3 — Move the branch HEAD backward

```sql
UPDATE branches SET head_commit_id = :targetCommitId WHERE id = :branchId
```

The branch now points to the target commit. All the commits that were "ahead" of it are now unreachable from the chain.

### Step 4 — Delete the orphaned commits and their snapshots

The list of commit IDs collected in Step 1 is now used to clean up:

```sql
DELETE FROM commit_snapshots WHERE commit_id IN (:orphanedIds)
DELETE FROM commits          WHERE id         IN (:orphanedIds)
```

Snapshots are deleted first because they reference commits via a foreign key. After deletion those commits and their states are gone permanently — this revert is **destructive**, not a new "revert commit" on top of history.

---

## Relationships at a Glance

```
branches
  └─ head_commit_id ──────────────────────────────────┐
                                                       ↓
commits ←── parent_commit_id ←── parent_commit_id ← commits
  │                                                    │
  └─ id ────────────────────────────────────────────────
         ↓
   commit_snapshots  (one row per file/folder per commit)
         │
         └─ fs_node_id ──► fs_nodes  (live working tree)
                              │
                              └─ branch_id  (null = hidden)
```

Key invariants:
- `fs_node_id` is the **permanent identity** of a file or folder. The same UUID appears in every `commit_snapshots` row that records that file across all commits and branches. Restoring a snapshot always upserts back under the original `fs_node_id`, so any reference to a file by ID remains valid after a branch switch or revert.
- What changes between branches and commits is the **content and visibility** of a node, not its identity. `fs_nodes.content` is overwritten on restore; `fs_nodes.branch_id` is set to null to hide a node that doesn't exist on the target branch.
- A branch's state is fully described by the set of `commit_snapshots` rows matching its `head_commit_id`.
- Switching branches or reverting fully replaces the live content via upsert + hide — the IDs stay the same.
- Commit history is a singly-linked list: each commit points to its parent, never to its children.
- There are no diffs stored anywhere — every snapshot is a complete copy of every node.
