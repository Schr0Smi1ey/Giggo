import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight, Building2, Check } from 'lucide-react';
import { clientCompanySchema, clientDetailsSchema } from '../validators/profile.schemas.js';
import { useCompleteOnboarding } from '../services/profile.js';
import { apiErrorMessage } from '../api/client.js';
import { Input } from '../components/Input.jsx';
import { Textarea } from '../components/Textarea.jsx';
import { Select } from '../components/Select.jsx';
import { Button } from '../components/Button.jsx';

const STEPS = ['Company', 'Details'];
const SCHEMAS = [clientCompanySchema, clientDetailsSchema];
const TEAM_SIZES = [
  { value: '1-10', label: '1–10 people' },
  { value: '11-50', label: '11–50 people' },
  { value: '51-200', label: '51–200 people' },
  { value: '201+', label: '201+ people' },
];

const INITIAL = {
  companyName: '',
  industry: '',
  companyDescription: '',
  website: '',
  teamSize: '1-10',
  location: { country: '', city: '' },
};

export default function ClientOnboarding() {
  const navigate = useNavigate();
  const complete = useCompleteOnboarding();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const setLocation = (key, value) => setForm((current) => ({ ...current, location: { ...current.location, [key]: value } }));

  const validateStep = () => {
    const result = SCHEMAS[step].safeParse(form);
    if (result.success) {
      setErrors({});
      return true;
    }
    const nextErrors = {};
    result.error.issues.forEach((issue) => { nextErrors[issue.path.join('.')] = issue.message; });
    setErrors(nextErrors);
    return false;
  };

  const finish = async () => {
    if (!validateStep()) return;
    try {
      await complete.mutateAsync(form);
      toast.success('Company profile published!');
      navigate('/dashboard/profile');
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Could not complete company onboarding'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-2 flex items-center gap-2 text-brand-700">
          <Building2 className="h-5 w-5" />
          <span className="text-sm font-medium">Set up your company profile</span>
        </div>

        <ol className="mb-8 flex items-center gap-2" aria-label="Company onboarding progress">
          {STEPS.map((label, index) => (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold ${index < step ? 'bg-brand-600 text-white' : index === step ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-500' : 'bg-slate-200 text-slate-500'}`}>
                {index < step ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              <span className={`text-sm ${index === step ? 'font-medium text-slate-900' : 'text-slate-500'}`}>{label}</span>
              {index < STEPS.length - 1 && <span className="h-px flex-1 bg-slate-200" />}
            </li>
          ))}
        </ol>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {step === 0 ? (
            <div className="space-y-4">
              <Input label="Company name" value={form.companyName} onChange={(event) => set('companyName', event.target.value)} error={errors.companyName} />
              <Input label="Industry" value={form.industry} onChange={(event) => set('industry', event.target.value)} placeholder="e.g. Software and technology" error={errors.industry} />
              <Textarea label="Company description" rows={6} value={form.companyDescription} onChange={(event) => set('companyDescription', event.target.value)} placeholder="Describe your company, team, and the work you need help with." hint={`${form.companyDescription.length}/5000 (min 50)`} error={errors.companyDescription} />
            </div>
          ) : (
            <div className="space-y-4">
              <Input label="Website" value={form.website} onChange={(event) => set('website', event.target.value)} placeholder="https://example.com" error={errors.website} />
              <Select label="Team size" options={TEAM_SIZES} value={form.teamSize} onChange={(event) => set('teamSize', event.target.value)} error={errors.teamSize} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Country" value={form.location.country} onChange={(event) => setLocation('country', event.target.value)} error={errors['location.country']} />
                <Input label="City" value={form.location.city} onChange={(event) => setLocation('city', event.target.value)} error={errors['location.city']} />
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <Button variant="ghost" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}><ArrowLeft className="h-4 w-4" /> Back</Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => validateStep() && setStep((current) => current + 1)}>Continue <ArrowRight className="h-4 w-4" /></Button>
            ) : (
              <Button onClick={finish} loading={complete.isPending}>Publish company profile <Check className="h-4 w-4" /></Button>
            )}
          </div>
        </div>

        <button onClick={() => navigate('/dashboard')} className="mt-4 w-full text-center text-sm text-slate-400 hover:text-slate-600">Skip for now</button>
      </div>
    </div>
  );
}
