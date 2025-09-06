export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  created_at: string;
  profile: {
    id: string;
    full_name: string;
    username: string;
    email: string;
    avatar_url: string | null;
  };
}
