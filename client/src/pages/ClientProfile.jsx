import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Building2, Save } from 'lucide-react';
import { useMyProfile, useUpdateProfile } from '../services/profile.js';
import { apiErrorMessage } from '../api/client.js';
import { Input } from '../components/Input.jsx';
import { Textarea } from '../components/Textarea.jsx';
import { Select } from '../components/Select.jsx';
import { Button } from '../components/Button.jsx';
import { ProfileCompletion } from '../components/ProfileCompletion.jsx';
import { Skeleton } from '../components/Loaders.jsx';

const TEAM_SIZES = [
  { value: '1-10', label: '1–10 people' }, { value: '11-50', label: '11–50 people' },
  { value: '51-200', label: '51–200 people' }, { value: '201+', label: '201+ people' },
];
const BLANK = { companyName: '', industry: '', companyDescription: '', website: '', teamSize: '1-10', location: { country: '', city: '' } };

function toClientForm(profile) {
  return {
    ...BLANK,
    companyName: profile.companyName || '',
    industry: profile.industry || '',
    companyDescription: profile.companyDescription || '',
    website: profile.website || '',
    teamSize: profile.teamSize || BLANK.teamSize,
    location: { ...BLANK.location, ...profile.location },
  };
}

export default function ClientProfile() {
  const { data: profile, isLoading } = useMyProfile();
  const update = useUpdateProfile();
  const [form, setForm] = useState(BLANK);

  useEffect(() => {
    if (profile) setForm(toClientForm(profile));
  }, [profile]);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const setLocation = (key, value) => setForm((current) => ({ ...current, location: { ...current.location, [key]: value } }));
  const save = async () => {
    try {
      await update.mutateAsync(form);
      toast.success('Company profile saved');
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Could not save company profile'));
    }
  };

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-40" /><Skeleton className="h-64" /></div>;

  return (
    <div className="max-w-3xl pb-16">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-brand-50 text-brand-700"><Building2 className="h-6 w-6" /></div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-slate-900">{form.companyName || 'Your company profile'}</h1>
            <p className="mt-1 text-sm text-slate-500">Complete company details before posting your first job in a later phase.</p>
            <ProfileCompletion value={profile?.completeness || 0} className="mt-3 max-w-xs" />
          </div>
        </div>
      </div>

      <section className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Company details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Company name" value={form.companyName} onChange={(event) => set('companyName', event.target.value)} />
          <Input label="Industry" value={form.industry} onChange={(event) => set('industry', event.target.value)} />
        </div>
        <Textarea label="Company description" rows={6} value={form.companyDescription} onChange={(event) => set('companyDescription', event.target.value)} hint={`${(form.companyDescription || '').length}/5000`} />
        <Input label="Website" value={form.website} onChange={(event) => set('website', event.target.value)} placeholder="https://example.com" />
        <Select label="Team size" options={TEAM_SIZES} value={form.teamSize} onChange={(event) => set('teamSize', event.target.value)} />
      </section>

      <section className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Location</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Country" value={form.location.country} onChange={(event) => setLocation('country', event.target.value)} />
          <Input label="City" value={form.location.city} onChange={(event) => setLocation('city', event.target.value)} />
        </div>
      </section>

      <div className="mt-6 flex justify-end"><Button onClick={save} loading={update.isPending}><Save className="h-4 w-4" /> Save changes</Button></div>
    </div>
  );
}
