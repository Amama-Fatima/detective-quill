export interface DetectiveProfile {
  id: string;
  email: string;
  full_name: string;
  pen_name: string;
  bio: string;
  avatar_url: string;
  detective_rank: string;
  joined_date: string;
  writing_stats: {
    total_words: number;
    completed_stories: number;
    active_cases: number;
    writing_streak: number;
    daily_target: number;
  };
  achievements: string[];
  case_files: {
    solved: number;
    cold_cases: number;
    active_investigations: number;
  };
  //   preferences: {
  //     theme: string;
  //     notifications: boolean;
  //     public_profile: boolean;
  //     show_stats: boolean;
  //   };
}
