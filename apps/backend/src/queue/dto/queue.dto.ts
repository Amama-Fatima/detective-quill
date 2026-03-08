export interface SceneAnalysisJobData {
  job_id: string;
  scene_text: string;
  user_id: string;
  project_id?: string;
  scene_id?: string;
}

export interface CreateCommitJobData {
  projectId: string;
  userId: string;
  createCommitDto: {
    message: string;
    branch_id: string;
  };
}

export interface RevertCommitJobData {
  projectId: string;
  commitId: string;
}
