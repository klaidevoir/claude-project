-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =====================
-- PROFILES (extends auth.users)
-- =====================
create type user_role as enum (
  'recruitment_admin',
  'head_of_recruitment',
  'recruiter',
  'sourcer',
  'contractor'
);

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text not null,
  role user_role not null default 'recruiter',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view all profiles" on public.profiles
  for select using (auth.role() = 'authenticated');

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Admins can manage profiles" on public.profiles
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role in ('recruitment_admin', 'head_of_recruitment')
    )
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'recruiter')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================
-- ROLES (job roles)
-- =====================
create type role_type as enum ('Active', 'Inquiry', 'Replacement', 'Internal');
create type role_status as enum ('open', 'paused', 'cancelled', 'closed', 'lost');
create type target_region as enum (
  'Philippines', 'Latin America', 'Nigeria', 'Sri Lanka', 'South Africa'
);

create table public.roles (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  role_type role_type not null default 'Active',
  headcount integer not null default 1,
  client_name text,
  account_manager text,
  client_monthly_rate numeric(12,2),
  estimated_budget_pay_rate numeric(12,2),
  timezone text,
  target_onboarding_date date,
  target_regions target_region[] default '{}',
  jd_link text,
  jd_file_url text,
  client_jd_link text,
  hos_jd_link text,
  client_homework_link text,
  hos_homework_link text,
  workable_job_code_link text,
  salary_min numeric(12,2),
  salary_max numeric(12,2),
  main_recruiter_id uuid references public.profiles(id) on delete set null,
  sourcer_id uuid references public.profiles(id) on delete set null,
  internal_notes text,
  status role_status not null default 'open',
  date_opened date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.roles enable row level security;

create policy "Authenticated users can view roles" on public.roles
  for select using (auth.role() = 'authenticated');

create policy "Admins and HoR can manage roles" on public.roles
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role in ('recruitment_admin', 'head_of_recruitment')
    )
  );

create policy "Recruiters and sourcers can update their roles" on public.roles
  for update using (
    auth.uid() = main_recruiter_id or auth.uid() = sourcer_id
  );

-- =====================
-- CANDIDATES
-- =====================
create type candidate_stage as enum (
  'applied', 'screening', 'interview_1', 'interview_2', 'interview_3',
  'offer', 'hired', 'rejected', 'withdrawn'
);

create type availability_option as enum (
  'ASAP', '1 Week', '2 Weeks', '1 Month', 'Other'
);

create table public.candidates (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text,
  whatsapp text,
  hos_gmail text,
  role_id uuid references public.roles(id) on delete set null,
  endorsement_writeup text,
  resume_url text,
  loom_video_link text,
  portfolio_url text,
  homework_url text,
  salary_expectation_min numeric(12,2),
  salary_expectation_max numeric(12,2),
  availability availability_option not null default 'ASAP',
  availability_details text,
  working_timezone text,
  planned_vacation text,
  reason_for_leaving text,
  references jsonb not null default '[]'::jsonb,
  red_flags text,
  miscellaneous_notes text,
  endorsement_stage candidate_stage not null default 'applied',
  assigned_reviewer_id uuid references public.profiles(id) on delete set null,
  recruiter_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.candidates enable row level security;

create policy "Authenticated users can view candidates" on public.candidates
  for select using (auth.role() = 'authenticated');

create policy "Admins and HoR can manage candidates" on public.candidates
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role in ('recruitment_admin', 'head_of_recruitment')
    )
  );

create policy "Recruiters can manage their own candidates" on public.candidates
  for all using (auth.uid() = recruiter_id);

-- =====================
-- STAGE HISTORY
-- =====================
create table public.stage_history (
  id uuid primary key default uuid_generate_v4(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  from_stage candidate_stage,
  to_stage candidate_stage not null,
  changed_by_id uuid references public.profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.stage_history enable row level security;

create policy "Authenticated users can view stage history" on public.stage_history
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert stage history" on public.stage_history
  for insert with check (auth.role() = 'authenticated');

-- =====================
-- ACTIVITY LOG
-- =====================
create table public.activity_log (
  id uuid primary key default uuid_generate_v4(),
  role_id uuid references public.roles(id) on delete cascade,
  candidate_id uuid references public.candidates(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  field_changed text,
  old_value text,
  new_value text,
  created_at timestamptz not null default now()
);

alter table public.activity_log enable row level security;

create policy "Authenticated users can view activity log" on public.activity_log
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert activity log" on public.activity_log
  for insert with check (auth.role() = 'authenticated');

-- =====================
-- JOB POSTINGS
-- =====================
create table public.job_postings (
  id uuid primary key default uuid_generate_v4(),
  role_id uuid references public.roles(id) on delete cascade,
  platform_name text not null,
  date_posted date not null default current_date,
  sponsored boolean not null default false,
  duration_days integer,
  ad_spend numeric(12,2),
  application_count integer not null default 0,
  source_breakdown jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.job_postings enable row level security;

create policy "Authenticated users can view job postings" on public.job_postings
  for select using (auth.role() = 'authenticated');

create policy "Admins, HoR, sourcers can manage job postings" on public.job_postings
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role in ('recruitment_admin', 'head_of_recruitment', 'sourcer')
    )
  );

-- =====================
-- REFERRALS
-- =====================
create type referral_status as enum (
  'pending', 'reviewing', 'shortlisted', 'rejected', 'hired'
);

create table public.referrals (
  id uuid primary key default uuid_generate_v4(),
  contractor_name text not null,
  referral_name text not null,
  resume_link text,
  video_intro_link text,
  whatsapp_number text,
  role_applying_for text,
  submission_date date not null default current_date,
  status referral_status not null default 'pending',
  bonus_eligible boolean not null default false,
  bonus_paid boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.referrals enable row level security;

-- Public can insert referrals (no auth required)
create policy "Anyone can submit referrals" on public.referrals
  for insert with check (true);

create policy "Admins and HoR can manage referrals" on public.referrals
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role in ('recruitment_admin', 'head_of_recruitment')
    )
  );

-- =====================
-- UPDATED_AT TRIGGERS
-- =====================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_roles_updated_at before update on public.roles
  for each row execute procedure public.set_updated_at();

create trigger set_candidates_updated_at before update on public.candidates
  for each row execute procedure public.set_updated_at();

create trigger set_job_postings_updated_at before update on public.job_postings
  for each row execute procedure public.set_updated_at();

create trigger set_referrals_updated_at before update on public.referrals
  for each row execute procedure public.set_updated_at();

create trigger set_profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- =====================
-- INDEXES
-- =====================
create index idx_roles_status on public.roles(status);
create index idx_roles_main_recruiter on public.roles(main_recruiter_id);
create index idx_roles_sourcer on public.roles(sourcer_id);
create index idx_candidates_role on public.candidates(role_id);
create index idx_candidates_recruiter on public.candidates(recruiter_id);
create index idx_candidates_stage on public.candidates(endorsement_stage);
create index idx_stage_history_candidate on public.stage_history(candidate_id);
create index idx_activity_log_role on public.activity_log(role_id);
create index idx_activity_log_candidate on public.activity_log(candidate_id);
create index idx_job_postings_role on public.job_postings(role_id);
