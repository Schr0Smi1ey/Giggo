export const PAYMENT_PROVIDERS = [
  ['BKASH_SIMULATED', 'bKash'],
  ['NAGAD_SIMULATED', 'Nagad'],
  ['ROCKET_SIMULATED', 'Rocket'],
];

const LABELS = {
  checkout_created: 'Payment initiated',
  processing: 'Payment processing',
  succeeded: 'Successful',
  failed: 'Failed',
  pending: 'Funding required',
  funding_pending: 'Funding in progress',
  funded: 'Escrow funded',
  submitted: 'Awaiting client review',
  approved: 'Approved — ready to release',
  paid: 'Payment released',
  in_progress: 'Work in progress',
  revision_requested: 'Revision requested',
};

export const paymentStatusLabel = (value) => LABELS[value] || String(value || '').replaceAll('_', ' ');
export const providerName = (provider) => String(provider || '').replace('_SIMULATED', '');
