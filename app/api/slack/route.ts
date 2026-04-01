import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

function verifySlackSignature(req: NextRequest, body: string): boolean {
  const signingSecret = process.env.SLACK_SIGNING_SECRET ?? '';
  const timestamp = req.headers.get('x-slack-request-timestamp') ?? '';
  const slackSignature = req.headers.get('x-slack-signature') ?? '';

  // Prevent replay attacks
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
  const command = params.get('command');
  const triggerId = params.get('trigger_id');
  const botToken = process.env.SLACK_BOT_TOKEN;

  if (!botToken) {
    return NextResponse.json({ text: 'Slack bot token not configured.' });
  }

  if (command === '/role') {
    await openRoleModal(triggerId!, botToken);
  } else if (command === '/endorse') {
    await openEndorseModal(triggerId!, botToken);
  }

  return NextResponse.json({ response_type: 'ephemeral', text: 'Opening modal...' });
}

async function openRoleModal(triggerId: string, token: string) {
  const modal = {
    type: 'modal',
    callback_id: 'role_intake',
    title: { type: 'plain_text', text: 'New Role Intake' },
    submit: { type: 'plain_text', text: 'Submit' },
    close: { type: 'plain_text', text: 'Cancel' },
    blocks: [
      {
        type: 'input',
        block_id: 'title',
        label: { type: 'plain_text', text: 'Role Title' },
        element: { type: 'plain_text_input', action_id: 'value', placeholder: { type: 'plain_text', text: 'e.g. Senior React Developer' } },
      },
      {
        type: 'input',
        block_id: 'role_type',
        label: { type: 'plain_text', text: 'Role Type' },
        element: {
          type: 'static_select',
          action_id: 'value',
          options: ['Active', 'Inquiry', 'Replacement', 'Internal'].map((t) => ({
            text: { type: 'plain_text', text: t },
            value: t,
          })),
        },
      },
      {
        type: 'input',
        block_id: 'client_name',
        label: { type: 'plain_text', text: 'Client Name' },
        element: { type: 'plain_text_input', action_id: 'value' },
        optional: true,
      },
      {
        type: 'input',
        block_id: 'headcount',
        label: { type: 'plain_text', text: 'Headcount' },
        element: { type: 'plain_text_input', action_id: 'value', initial_value: '1' },
      },
      {
        type: 'input',
        block_id: 'client_monthly_rate',
        label: { type: 'plain_text', text: 'Client Monthly Rate ($)' },
        element: { type: 'plain_text_input', action_id: 'value' },
        optional: true,
      },
      {
        type: 'input',
        block_id: 'salary_range',
        label: { type: 'plain_text', text: 'Salary Range (Min - Max)' },
        element: { type: 'plain_text_input', action_id: 'value', placeholder: { type: 'plain_text', text: 'e.g. 3000 - 5000' } },
        optional: true,
      },
      {
        type: 'input',
        block_id: 'timezone',
        label: { type: 'plain_text', text: 'Timezone' },
        element: { type: 'plain_text_input', action_id: 'value', placeholder: { type: 'plain_text', text: 'e.g. US/Eastern' } },
        optional: true,
      },
      {
        type: 'input',
        block_id: 'target_regions',
        label: { type: 'plain_text', text: 'Target Regions' },
        element: {
          type: 'multi_static_select',
          action_id: 'value',
          options: ['Philippines', 'Latin America', 'Nigeria', 'Sri Lanka', 'South Africa'].map((r) => ({
            text: { type: 'plain_text', text: r },
            value: r,
          })),
        },
        optional: true,
      },
      {
        type: 'input',
        block_id: 'jd_link',
        label: { type: 'plain_text', text: 'JD Link' },
        element: { type: 'plain_text_input', action_id: 'value', placeholder: { type: 'plain_text', text: 'https://' } },
        optional: true,
      },
      {
        type: 'input',
        block_id: 'internal_notes',
        label: { type: 'plain_text', text: 'Internal Notes' },
        element: { type: 'plain_text_input', action_id: 'value', multiline: true },
        optional: true,
      },
    ],
  };

  await fetch('https://slack.com/api/views.open', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ trigger_id: triggerId, view: modal }),
  });
}

async function openEndorseModal(triggerId: string, token: string) {
  const modal = {
    type: 'modal',
    callback_id: 'candidate_endorse',
    title: { type: 'plain_text', text: 'Endorse Candidate' },
    submit: { type: 'plain_text', text: 'Submit' },
    close: { type: 'plain_text', text: 'Cancel' },
    blocks: [
      {
        type: 'input',
        block_id: 'candidate_name',
        label: { type: 'plain_text', text: 'Candidate Name' },
        element: { type: 'plain_text_input', action_id: 'value' },
      },
      {
        type: 'input',
        block_id: 'email',
        label: { type: 'plain_text', text: 'Email' },
        element: { type: 'plain_text_input', action_id: 'value' },
        optional: true,
      },
      {
        type: 'input',
        block_id: 'whatsapp',
        label: { type: 'plain_text', text: 'WhatsApp' },
        element: { type: 'plain_text_input', action_id: 'value' },
        optional: true,
      },
      {
        type: 'input',
        block_id: 'role_title',
        label: { type: 'plain_text', text: 'Role Title' },
        element: { type: 'plain_text_input', action_id: 'value' },
        optional: true,
      },
      {
        type: 'input',
        block_id: 'resume_url',
        label: { type: 'plain_text', text: 'Resume URL' },
        element: { type: 'plain_text_input', action_id: 'value', placeholder: { type: 'plain_text', text: 'https://' } },
        optional: true,
      },
      {
        type: 'input',
        block_id: 'loom_video_link',
        label: { type: 'plain_text', text: 'Loom / Video Link' },
        element: { type: 'plain_text_input', action_id: 'value', placeholder: { type: 'plain_text', text: 'https://loom.com/...' } },
        optional: true,
      },
      {
        type: 'input',
        block_id: 'salary_expectation',
        label: { type: 'plain_text', text: 'Salary Expectation (Min - Max)' },
        element: { type: 'plain_text_input', action_id: 'value', placeholder: { type: 'plain_text', text: 'e.g. 3000 - 5000' } },
        optional: true,
      },
      {
        type: 'input',
        block_id: 'availability',
        label: { type: 'plain_text', text: 'Availability' },
        element: {
          type: 'static_select',
          action_id: 'value',
          options: ['ASAP', '1 Week', '2 Weeks', '1 Month', 'Other'].map((a) => ({
            text: { type: 'plain_text', text: a },
            value: a,
          })),
          initial_option: { text: { type: 'plain_text', text: 'ASAP' }, value: 'ASAP' },
        },
      },
      {
        type: 'input',
        block_id: 'endorsement_writeup',
        label: { type: 'plain_text', text: 'Endorsement Write-up' },
        element: { type: 'plain_text_input', action_id: 'value', multiline: true },
        optional: true,
      },
      {
        type: 'input',
        block_id: 'red_flags',
        label: { type: 'plain_text', text: 'Red Flags' },
        element: { type: 'plain_text_input', action_id: 'value', multiline: true },
        optional: true,
      },
      {
        type: 'input',
        block_id: 'reviewer',
        label: { type: 'plain_text', text: 'Reviewer Name / Slack User' },
        element: { type: 'plain_text_input', action_id: 'value' },
        optional: true,
      },
    ],
  };

  await fetch('https://slack.com/api/views.open', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ trigger_id: triggerId, view: modal }),
  });
}
