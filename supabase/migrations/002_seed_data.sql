-- Seed example data for development
-- Run ONLY in development environments

-- Note: In production, create users via the Supabase Auth UI or API
-- This seed creates sample profiles assuming you've created auth users first

-- Insert sample roles for demonstration
insert into public.roles (title, role_type, headcount, client_name, account_manager, client_monthly_rate, estimated_budget_pay_rate, salary_min, salary_max, timezone, status, date_opened, target_regions)
values
  ('Senior React Developer', 'Active', 2, 'TechCorp Inc', 'Sarah Johnson', 8000, 5500, 4000, 6000, 'US/Eastern', 'open', current_date - interval '15 days', array['Philippines', 'Latin America']::target_region[]),
  ('Full Stack Engineer', 'Active', 1, 'StartupXYZ', 'Mike Chen', 6000, 4000, 3000, 4500, 'US/Pacific', 'open', current_date - interval '7 days', array['Philippines']::target_region[]),
  ('DevOps Engineer', 'Inquiry', 1, 'Enterprise Co', 'Lisa Park', 9000, 6000, 4500, 7000, 'US/Central', 'open', current_date - interval '3 days', array['Philippines', 'Sri Lanka']::target_region[]),
  ('UI/UX Designer', 'Active', 1, 'Creative Agency', 'Tom Wilson', 5500, 3500, 2500, 4000, 'US/Eastern', 'paused', current_date - interval '30 days', array['Latin America', 'South Africa']::target_region[]),
  ('Data Analyst', 'Replacement', 1, 'DataDriven LLC', 'Amy Brown', 7000, 4800, 3500, 5500, 'US/Eastern', 'open', current_date - interval '5 days', array['Philippines', 'Nigeria']::target_region[]);
