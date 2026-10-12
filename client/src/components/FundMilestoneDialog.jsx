import { useEffect, useRef, useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { apiErrorMessage } from '../api/client.js';
import { useFundMilestone } from '../services/payments.js';
import { PAYMENT_PROVIDERS } from '../utils/payments.js';
import { Button } from './Button.jsx';
import { money } from './VirtualCard.jsx';

// The idempotency key is kept per milestone so a retry after a lost response reuses the same payment.
const keyFor = (milestoneId) => {
  const storageKey = `giggo:payment-key:${milestoneId}`;
  const stored = sessionStorage.getItem(storageKey);
  if (stored) return { storageKey, key: stored };
  const key = crypto.randomUUID();
  sessionStorage.setItem(storageKey, key);
  return { storageKey, key };
};

export function FundMilestoneDialog({ milestone, projectTitle, freelancerName, currency, onClose }) {
  const navigate = useNavigate();
  const fund = useFundMilestone();
  const lock = useRef(false);
  const [provider, setProvider] = useState(PAYMENT_PROVIDERS[0][0]);
  const [outcome, setOutcome] = useState('success');
  const [{ storageKey, key }] = useState(() => keyFor(milestone._id));

  useEffect(() => {
    const close = (event) => { if (event.key === 'Escape' && !fund.isPending) onClose(); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [fund.isPending, onClose]);

  const submit = (event) => {
    event.preventDefault();
    if (lock.current) return;
    lock.current = true;
    fund.mutate({ milestoneId: milestone._id, provider, outcome, idempotencyKey: key }, {
      onSuccess: ({ payment }) => {
        sessionStorage.removeItem(storageKey);
        toast.success('Payment started');
        onClose();
        navigate(`/dashboard/payments/${payment._id}`);
      },
      onError: (error) => toast.error(apiErrorMessage(error, 'Could not start the payment')),
      onSettled: () => { lock.current = false; },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
      <form onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="fund-dialog-title" className="max-h-[90vh] w-full max-w-lg space-y-5 overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-brand-600" /><h2 id="fund-dialog-title" className="font-semibold text-slate-900">Fund milestone</h2></div>
          <button type="button" onClick={onClose} disabled={fund.isPending} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Close payment dialog"><X className="h-5 w-5" /></button>
        </div>
        <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">Simulation only. No real money, PIN, OTP or card details are required.</p>
        <dl className="space-y-2 text-sm">
          <div><dt className="text-slate-500">Project</dt><dd className="font-medium text-slate-800">{projectTitle}</dd></div>
          <div><dt className="text-slate-500">Freelancer</dt><dd className="font-medium text-slate-800">{freelancerName}</dd></div>
          <div><dt className="text-slate-500">Milestone</dt><dd className="font-medium text-slate-800">{milestone.title}</dd></div>
        </dl>
        <fieldset disabled={fund.isPending}>
          <legend className="mb-2 text-sm font-semibold text-slate-800">Payment method</legend>
          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_PROVIDERS.map(([value, label]) => (
              <label key={value} className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm ${provider === value ? 'border-brand-600 bg-brand-50' : 'border-slate-200'}`}>
                <input type="radio" name="provider" value={value} checked={provider === value} onChange={(event) => setProvider(event.target.value)} />{label}
              </label>
            ))}
          </div>
        </fieldset>
        {import.meta.env.DEV && (
          <label className="block text-sm text-slate-700">Simulation result
            <select className="ml-2 rounded border border-slate-300 p-1.5" value={outcome} disabled={fund.isPending} onChange={(event) => setOutcome(event.target.value)}>
              <option value="success">Success</option>
              <option value="failed">Provider failure</option>
            </select>
          </label>
        )}
        <div className="flex justify-between border-t border-slate-200 pt-4 text-sm"><span>Total to escrow</span><strong>{money(milestone.amount, currency)}</strong></div>
        <p className="text-xs text-slate-500">Funds stay in escrow until you review, approve and release the milestone. The platform fee is deducted from the freelancer payout.</p>
        {fund.isError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{apiErrorMessage(fund.error)} We have not confirmed the result. Retrying uses the same payment key.</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={fund.isPending}>Cancel</Button>
          <Button type="submit" loading={fund.isPending}>{`Pay ${money(milestone.amount, currency)}`}</Button>
        </div>
      </form>
    </div>
  );
}
