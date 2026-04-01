export type UserRole = 'recruitment_admin' | 'head_of_recruitment' | 'recruiter' | 'sourcer' | 'contractor';

export type RoleType = 'Active' | 'Inquiry' | 'Replacement' | 'Internal';
export type RoleStatus = 'open' | 'paused' | 'cancelled' | 'closed' | 'lost';
export type TargetRegion = 'Philippines' | 'Latin America' | 'Nigeria' | 'Sri Lanka' | 'South Africa';

export type CandidateStage =
  | 'applied'
  | 'screening'
  | 'interview_1'
  | 'interview_2'
  | 'interview_3'
  | 'offer'
  | 'hired'
  | 'rejected'
  | 'withdrawn';

export type AvailabilityOption = 'ASAP' | '1 Week' | '2 Weeks' | '1 Month' | 'Other';
export type ReferenceStatus = 'pending' | 'completed' | 'failed';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface Role {
  id: string;
  title: string;
  role_type: RoleType;
  headcount: number;
  client_name: string;
  account_manager?: string;
  client_monthly_rate?: number;
  estimated_budget_pay_rate?: number;
  timezone?: string;
  target_onboarding_date?: string;
  target_regions: TargetRegion[];
  jd_link?: string;
  jd_file_url?: string;
  client_jd_link?: string;
  hos_jd_link?: string;
  client_homework_link?: string;
  hos_homework_link?: string;
  workable_job_code_link?: string;
  salary_min?: number;
  salary_max?: number;
  main_recruiter_id?: string;
  sourcer_id?: string;
  internal_notes?: string;
  status: RoleStatus;
  date_opened: string;
  created_at: string;
  updated_at: string;
  // joined
  main_recruiter?: Profile;
  sourcer?: Profile;
}

export interface Candidate {
  id: string;
  name: string;
  email?: string;
  whatsapp?: string;
  hos_gmail?: string;
  role_id?: string;
  endorsement_writeup?: string;
  resume_url?: string;
  loom_video_link?: string;
  portfolio_url?: string;
  homework_url?: string;
  salary_expectation_min?: number;
  salary_expectation_max?: number;
  availability: AvailabilityOption;
  availability_details?: string;
  working_timezone?: string;
  planned_vacation?: string;
  reason_for_leaving?: string;
  references: CandidateReference[];
  red_flags?: string;
  miscellaneous_notes?: string;
  endorsement_stage: CandidateStage;
  assigned_reviewer_id?: string;
  recruiter_id?: string;
  created_at: string;
  updated_at: string;
  // joined
  role?: Role;
  assigned_reviewer?: Profile;
  recruiter?: Profile;
  stage_history?: StageHistory[];
}

export interface CandidateReference {
  name: string;
  email: string;
  phone: string;
  relationship: string;
  status: ReferenceStatus;
}

export interface StageHistory {
  id: string;
  candidate_id: string;
  from_stage?: CandidateStage;
  to_stage: CandidateStage;
  changed_by_id: string;
  notes?: string;
  created_at: string;
  changed_by?: Profile;
}

export interface ActivityLog {
  id: string;
  role_id?: string;
  candidate_id?: string;
  user_id: string;
  action: string;
  field_changed?: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
  user?: Profile;
}

export interface JobPosting {
  id: string;
  role_id: string;
  platform_name: string;
  date_posted: string;
  sponsored: boolean;
  duration_days?: number;
  ad_spend?: number;
  application_count: number;
  source_breakdown?: Record<string, number>;
  created_at: string;
  updated_at: string;
  role?: Role;
}

export interface Referral {
  id: string;
  contractor_name: string;
  referral_name: string;
  resume_link?: string;
  video_intro_link?: string;
  whatsapp_number?: string;
  role_applying_for?: string;
  submission_date: string;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';
  bonus_eligible: boolean;
  bonus_paid: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_active_roles: number;
  roles_in_sourcing: number;
  roles_in_interviews: number;
  roles_awaiting_feedback: number;
}

// Subset of Profile used in dropdowns and selects — matches what Supabase partial queries return
export type ProfileSummary = Pick<Profile, 'id' | 'full_name' | 'role'>;
