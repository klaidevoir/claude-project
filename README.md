# Recruitment Dashboard

A full-featured recruitment operations dashboard built with **Next.js 14**, **Tailwind CSS**, and **Supabase**. Manage roles, track candidates, monitor job postings, handle referrals, and streamline your entire hiring pipeline in one place.

---

## Features

- **Main Hub** — Role table with filters, headcount, rates, days-open tracking
- **Candidate Tracker** — Pipeline stages, stage history timelines, fall-off tracking, recruiter breakdown
- **Job Progress Hub** — Activity log per role, daily summaries, PDF export
- **Recruiter Hub** — Personal dashboard per recruiter with their own pipeline view
- **Referral Hub** — Public referral form (no login required) + admin tracker with bonus management
- **Job Posting Management** — Track ads per platform, sponsored history, cost-per-application analytics
- **Slack Integration** — `/role` and `/endorse` slash commands with modal forms that save directly to the database
- **Role-Based Access Control** — 5 roles: Recruitment Admin, Head of Recruitment, Recruiter, Sourcer, Contractor

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth with SSR |
| Forms | React Hook Form + Zod |
| PDF Export | jsPDF |
| Charts | Recharts |
| Notifications | react-hot-toast |
| Slack | Slack Bolt / Block Kit modals |

---

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Vercel](https://vercel.com) account (for deployment)
- A Slack workspace with a Slack App (for Slack integration)

---

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-org/recruitment-dashboard.git
cd recruitment-dashboard
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example env file:

```bash
cp .env.local.example .env.local
```

Fill in your values in `.env.local`:

```env
# Supabase — found in your Supabase project settings > API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Slack — found in your Slack App settings
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
SLACK_SIGNING_SECRET=your-slack-signing-secret

# App URL (used for Slack interactivity endpoint)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set up Supabase schema

In your Supabase project, go to **SQL Editor** and run the migration file:

```bash
# Copy and paste the contents of this file into the Supabase SQL Editor:
supabase/migrations/001_initial_schema.sql
```

Optionally, seed sample data for development:

```bash
# Copy and paste into SQL Editor (dev only):
supabase/migrations/002_seed_data.sql
```

### 5. Create your first admin user

In Supabase **Authentication > Users**, click **Add User** and create a user with:
- Email: `admin@yourcompany.com`
- Password: (set a strong password)

Then in **SQL Editor**, run:

```sql
UPDATE public.profiles
SET role = 'recruitment_admin', full_name = 'Your Name'
WHERE email = 'admin@yourcompany.com';
```

### 6. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with your admin credentials.

---

## Supabase Configuration

### Enable Row Level Security

RLS is enabled automatically by the migration. All tables have policies for:
- **Recruitment Admin / Head of Recruitment** — full access
- **Recruiters** — access their own candidates
- **Sourcers** — access job postings
- **Public** — can insert referrals (no auth required)

### Storage (optional, for resume uploads)

To enable file uploads for resumes/JDs:

1. In Supabase dashboard, go to **Storage**
2. Create a new bucket named `resumes` (public or private as needed)
3. Add a storage policy allowing authenticated uploads

### Real-time (optional)

To enable live updates, go to **Database > Replication** in Supabase and enable real-time for the `candidates` and `activity_log` tables.

---

## Deploying to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

### 2. Import project in Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository**
3. Select your repository
4. Vercel will auto-detect Next.js settings — leave them as-is

### 3. Configure environment variables in Vercel

In the Vercel project settings, go to **Settings > Environment Variables** and add:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `SLACK_BOT_TOKEN` | Your Slack bot OAuth token |
| `SLACK_SIGNING_SECRET` | Your Slack app signing secret |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL (e.g. `https://your-app.vercel.app`) |

### 4. Deploy

Click **Deploy**. Vercel will build and deploy your app. Subsequent pushes to `main` will auto-deploy.

### 5. Update Supabase allowed URLs

In Supabase, go to **Authentication > URL Configuration** and add your Vercel URL:
- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: `https://your-app.vercel.app/**`

---

## Slack Integration Setup

### 1. Create a Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps) and click **Create New App**
2. Choose **From scratch**, name it `Recruitment Hub`, select your workspace

### 2. Configure slash commands

In your Slack app settings, go to **Slash Commands** and add:

| Command | Request URL | Description |
|---|---|---|
| `/role` | `https://your-app.vercel.app/api/slack` | Open role intake form |
| `/endorse` | `https://your-app.vercel.app/api/slack` | Endorse a candidate |

### 3. Configure Interactivity

1. Go to **Interactivity & Shortcuts**
2. Toggle **Interactivity** ON
3. Set **Request URL** to: `https://your-app.vercel.app/api/slack/interactivity`

### 4. Set OAuth Scopes

Under **OAuth & Permissions > Bot Token Scopes**, add:
- `commands`
- `chat:write`

### 5. Install to workspace

Click **Install to Workspace** and authorize. Copy the **Bot User OAuth Token** — this is your `SLACK_BOT_TOKEN`.

Copy the **Signing Secret** from **Basic Information** — this is your `SLACK_SIGNING_SECRET`.

### 6. Test the commands

In any Slack channel where the app is installed:
- Type `/role` → A modal form opens for role intake
- Type `/endorse` → A modal form opens for candidate endorsement

Both forms save directly to the Supabase database on submit.

---

## User Roles & Access

| Hub | Admin | Head of Recruitment | Recruiter | Sourcer | Contractor |
|---|---|---|---|---|---|
| Main Hub | ✅ | ✅ | ✅ | ✅ | ❌ |
| Job Progress | ✅ | ✅ | ✅ | ❌ | ❌ |
| Candidate Tracker | ✅ | ✅ | ✅ | ❌ | ❌ |
| Recruiter Hub | ✅ (all) | ✅ (all) | ✅ (own only) | ❌ | ❌ |
| Referral Hub | ✅ | ✅ | ✅ | ✅ | Public form only |
| Job Postings | ✅ | ✅ | ❌ | ✅ | ❌ |

### Creating Users

Users are created via Supabase Auth (dashboard or API). After creation, update their role in the `profiles` table:

```sql
UPDATE public.profiles
SET role = 'recruiter', full_name = 'Jane Smith'
WHERE email = 'jane@yourcompany.com';
```

Valid roles: `recruitment_admin`, `head_of_recruitment`, `recruiter`, `sourcer`, `contractor`

---

## Project Structure

```
recruitment-dashboard/
├── app/
│   ├── (auth)/
│   │   └── login/          # Login page
│   ├── (dashboard)/
│   │   ├── layout.tsx      # Sidebar + auth gate
│   │   ├── page.tsx        # Main Hub
│   │   ├── candidates/     # Candidate Tracker
│   │   ├── job-progress/   # Job Progress Hub
│   │   ├── recruiter-hub/  # Recruiter Hub
│   │   ├── referrals/      # Referral Hub (admin view)
│   │   └── job-postings/   # Job Posting Management
│   ├── referral/           # Public referral form (no auth)
│   └── api/
│       └── slack/
│           ├── route.ts           # Slash command handler
│           └── interactivity/
│               └── route.ts       # Modal submission handler
├── components/
│   ├── layout/
│   │   └── Sidebar.tsx
│   ├── ui/
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── StatCard.tsx
│   └── hubs/
│       ├── MainHubClient.tsx
│       ├── RolesTable.tsx
│       ├── RoleModal.tsx
│       ├── CandidateTrackerClient.tsx
│       ├── CandidateModal.tsx
│       ├── CandidateProfileModal.tsx
│       ├── JobProgressClient.tsx
│       ├── RecruiterHubClient.tsx
│       ├── ReferralHubClient.tsx
│       └── JobPostingsClient.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Browser client
│   │   ├── server.ts       # Server client
│   │   └── middleware.ts   # Session refresh
│   ├── actions/
│   │   └── auth.ts         # Server actions
│   └── utils.ts            # Helpers & formatters
├── types/
│   └── index.ts            # TypeScript types
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       └── 002_seed_data.sql
├── middleware.ts            # Route protection
└── .env.local.example
```

---

## Troubleshooting

**`Error: Missing Supabase environment variables`**
→ Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in `.env.local`.

**`RLS policy violation` on insert/update**
→ The user's profile role may not have the required permission. Check the user's `role` in the `profiles` table.

**Slack modal not opening**
→ Verify `SLACK_BOT_TOKEN` and `SLACK_SIGNING_SECRET` are correct, and that the slash command request URL matches your deployment URL exactly.

**Slack interactivity webhook failing**
→ Ensure the interactivity request URL ends with `/api/slack/interactivity` and is publicly reachable (Vercel deployment, not localhost).

**Public referral form shows login redirect**
→ Check that `/referral` is in the `isPublicPath` list in `lib/supabase/middleware.ts`.

---

## License

MIT
