import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { ArrowDownToLine, LockKeyhole, ReceiptText, UnlockKeyhole, WalletCards } from 'lucide-react';
import { VirtualCard, CardStatus, money } from '../components/VirtualCard.jsx';
import { Button } from '../components/Button.jsx';
import { Input } from '../components/Input.jsx';
import { apiErrorMessage } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCardTransactions, useDeveloperEligibility, useFreezeCard, useMyVirtualCard, useReloadCard, useUnfreezeCard } from '../services/virtualCard.js';

const providers = [['BKASH_SIMULATED', 'Bkash'], ['NAGAD_SIMULATED', 'Nagad'], ['ROCKET_SIMULATED', 'Rocket']];
const reloadKey = () => `reload-${crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`}`;

export default function VirtualCardPage() {
  const { hasRole } = useAuth();
  const card = useMyVirtualCard();
  const eligibility = useDeveloperEligibility({ enabled: hasRole('freelancer') });
  const transactions = useCardTransactions();
  const reload = useReloadCard();
  const freeze = useFreezeCard();
  const unfreeze = useUnfreezeCard();
  const [amount, setAmount] = useState('');
  const [provider, setProvider] = useState(providers[0][0]);

  const submit = async (event, outcome = 'success') => {
    event.preventDefault();
    try {
      await reload.mutateAsync({ amount: Number(amount), provider, outcome, idempotencyKey: reloadKey() });
      setAmount('');
      toast.success(outcome === 'success' ? 'Simulated reload completed' : 'Simulated payment failed safely');
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Reload failed'));
    }
  };

  if (card.isLoading) return <div className="p-8 text-sm text-subtle">Loading virtual card...</div>;
  if (card.isError) return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">Card could not be loaded.</div>;

  const current = card.data;
  const remaining = Math.max(0, (current?.activationMinimum || 0) - (current?.balance || 0));
  const roleLabel = hasRole('client') && !hasRole('freelancer') ? 'Client wallet' : 'Developer finances';

  return (
    <div className="mx-auto max-w-6xl pb-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-brand-700 dark:text-brand-300">{roleLabel}</p>
          <h1 className="mt-1 text-3xl font-semibold text-foreground">My Virtual Card</h1>
          <p className="mt-2 max-w-2xl text-sm text-subtle">A premium simulated Giggo marketplace wallet for clients and developers. It is not a bank card.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard/card/transactions"><Button variant="secondary"><ReceiptText className="mr-2 h-4 w-4" />Transactions</Button></Link>
          {current?.status === 'suspended'
            ? <Button onClick={() => unfreeze.mutate()} loading={unfreeze.isPending}><UnlockKeyhole className="mr-2 h-4 w-4" />Unfreeze</Button>
            : <Button variant="secondary" onClick={() => freeze.mutate()} disabled={current?.status !== 'active'} loading={freeze.isPending}><LockKeyhole className="mr-2 h-4 w-4" />Freeze</Button>}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <VirtualCard card={current} />
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="text-sm text-subtle">Current balance</div>
            <WalletCards className="h-5 w-5 text-brand-600 dark:text-brand-300" />
          </div>
          <div className="mt-2 text-3xl font-semibold text-foreground">{money(current?.balance, current?.currency)}</div>
          <div className="mt-4 flex items-center justify-between"><span className="text-sm text-subtle">Status</span><CardStatus status={current?.status} /></div>
          <div className="mt-5 border-t border-border pt-5">
            <div className="flex justify-between gap-4 text-sm"><span className="text-subtle">Activation requirement</span><span className="font-semibold text-foreground">{money(current?.activationMinimum, current?.currency)}</span></div>
            {remaining > 0
              ? <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">{money(remaining, current?.currency)} more required before marketplace work is fully enabled.</p>
              : <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">Your card is active for marketplace activity.</p>}
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-foreground">Recent ledger activity</h2>
          {transactions.isLoading ? <p className="mt-4 text-sm text-subtle">Loading transactions...</p> : transactions.data?.length ? (
            <div className="mt-4 divide-y divide-border">
              {transactions.data.slice(0, 6).map((item) => (
                <div key={item.id || item._id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.description || item.type}</p>
                    <p className="text-xs text-subtle">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">+{money(item.amount, item.currency)}</span>
                </div>
              ))}
            </div>
          ) : <p className="mt-4 text-sm text-subtle">No transactions yet.</p>}
        </section>
        <form onSubmit={submit} className="rounded-2xl border border-brand-100 bg-brand-50/50 p-6 shadow-soft dark:border-brand-900 dark:bg-brand-950/20">
          <h2 className="text-lg font-semibold text-foreground">Reload card</h2>
          <p className="mt-1 text-sm text-subtle">Use a simulated provider. Never enter a PIN or OTP.</p>
          <Input className="mt-4" label="Amount (BDT)" type="number" min="1" value={amount} onChange={(event) => setAmount(event.target.value)} required />
          <label className="mt-4 block text-sm font-medium text-foreground">
            Payment method
            <select className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground" value={provider} onChange={(event) => setProvider(event.target.value)}>
              {providers.map(([value, label]) => <option key={value} value={value}>{label} simulation</option>)}
            </select>
          </label>
          <Button className="mt-5 w-full" type="submit" loading={reload.isPending}><ArrowDownToLine className="mr-2 h-4 w-4" />Simulate successful reload</Button>
          <button type="button" onClick={(event) => submit(event, 'failed')} className="mt-3 w-full text-xs font-medium text-subtle hover:text-red-600">Test failed payment</button>
        </form>
      </div>

      {eligibility.data && (
        <div className="mt-6 rounded-xl border border-border bg-surface p-5 text-sm text-subtle">
          Work eligibility: <strong className={eligibility.data.canApplyForJobs ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}>{eligibility.data.canApplyForJobs ? 'Enabled' : 'Activate card required'}</strong>
        </div>
      )}
    </div>
  );
}
