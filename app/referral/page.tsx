'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function PublicReferralPage() {
  const supabase = createClient();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    contractor_name: '',
    referral_name: '',
    resume_link: '',
    video_intro_link: '',
    whatsapp_number: '',
    role_applying_for: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.contractor_name || !form.referral_name) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('referrals').insert({
        ...form,
        submission_date: new Date().toISOString().split('T')[0],
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message ?? 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Referral Submitted!</h2>
          <p className="text-gray-600">Thank you for your referral. Our team will review it and be in touch.</p>
          <button
            onClick={() => { setSubmitted(false); setForm({ contractor_name: '', referral_name: '', resume_link: '', video_intro_link: '', whatsapp_number: '', role_applying_for: '' }); }}
            className="mt-6 px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium"
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Refer a Candidate</h1>
          <p className="text-gray-500 mt-1 text-sm">Know someone great? Submit them for a referral bonus.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name (Contractor) *</label>
            <input name="contractor_name" value={form.contractor_name} onChange={handleChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition text-sm" placeholder="Your full name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Referral's Name *</label>
            <input name="referral_name" value={form.referral_name} onChange={handleChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition text-sm" placeholder="Full name of person you're referring" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role Applying For</label>
            <input name="role_applying_for" value={form.role_applying_for} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition text-sm" placeholder="e.g. Senior React Developer" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resume / CV Link</label>
            <input name="resume_link" value={form.resume_link} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition text-sm" placeholder="https://drive.google.com/..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loom / Video Intro Link</label>
            <input name="video_intro_link" value={form.video_intro_link} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition text-sm" placeholder="https://loom.com/share/..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
            <input name="whatsapp_number" value={form.whatsapp_number} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition text-sm" placeholder="+1 555 000 0000" />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-3 px-4 rounded-lg transition text-sm"
          >
            {submitting ? 'Submitting...' : 'Submit Referral'}
          </button>
        </form>
      </div>
    </div>
  );
}
