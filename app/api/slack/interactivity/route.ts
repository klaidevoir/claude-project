import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'crypto';

function verifySlackSignature(req: NextRequest, body: string): boolean {
  const signingSecret = process.env.SLACK_SIGNING_SECRET ?? '';
  const timestamp = req.headers.get('x-slack-request-timestamp') ?? '';
  const slackSignature = req.headers.get('x-slack-signature') ?? '';
  if (Math.abs(Date.now() / 1000 - parseInt(timestamp)) > 300) return false;
  const sigBaseString = `v0:${timestamp}:${body}`;
  const mySignature = `v0=${createHmac('sha256', signingSecret).update(sigBaseString).digest('hex')}`;
  return mySignature === slackSignature;
}

export async function POST(req: NextRequest) {
  const body = await req.text();

  if (!verifySlackSignature(req, body)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = new URLSearchParams(body);
  const payloadStr = params.get('payload');
  if (!payloadStr) return NextResponse.json({ ok: true });

  const payload = JSON.parse(payloadStr);

  if (payload.type !== 'view_submission') return NextResponse.json({ ok: true });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const values = payload.view.state.values;

  if (payload.view.callback_id === 'role_intake') {
    const salaryStr = values.salary_range?.value?.value ?? '';
    const [salaryMin, salaryMax] = salaryStr.split('-').map((s: string) => parseFloat(s.trim())).filter(Boolean);

    await supabase.from('roles').insert({
      title: values.title?.value?.value ?? '',
      role_type: values.role_type?.value?.selected_option?.value ?? 'Active',
      client_name: values.client_name?.value?.value || null,
      headcount: parseInt(values.headcount?.value?.value ?? '1'),
      client_monthly_rate: values.client_monthly_rate?.value?.value ? parseFloat(values.client_monthly_rate.value.value) : null,
      salary_min: salaryMin ?? null,
      salary_max: salaryMax ?? null,
      timezone: values.timezone?.value?.value || null,
      target_regions: (values.target_regions?.value?.selected_options ?? []).map((o: any) => o.value),
      jd_link: values.jd_link?.value?.value || null,
      internal_notes: values.internal_notes?.value?.value || null,
      status: 'open',
      date_opened: new Date().toISOString().split('T')[0],
    });
  }

  if (payload.view.callback_id === 'candidate_endorse') {
    const salaryStr = values.salary_expectation?.value?.value ?? '';
    const [salaryMin, salaryMax] = salaryStr.split('-').map((s: string) => parseFloat(s.trim())).filter(Boolean);

    await supabase.from('candidates').insert({
      name: values.candidate_name?.value?.value ?? '',
      email: values.email?.value?.value || null,
      whatsapp: values.whatsapp?.value?.value || null,
      resume_url: values.resume_url?.value?.value || null,
      loom_video_link: values.loom_video_link?.value?.value || null,
      salary_expectation_min: salaryMin ?? null,
      salary_expectation_max: salaryMax ?? null,
      availability: values.availability?.value?.selected_option?.value ?? 'ASAP',
      endorsement_writeup: values.endorsement_writeup?.value?.value || null,
      red_flags: values.red_flags?.value?.value || null,
      endorsement_stage: 'applied',
      references: [],
    });
  }

  return NextResponse.json({ response_action: 'clear' });
}
