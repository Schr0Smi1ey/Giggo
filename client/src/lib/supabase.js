import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.local.');
}

export const supabase = createClient(url, publishableKey, {
  auth: {
    // Giggo is a client-only Vite SPA. The implicit flow lets confirmation and
    // recovery links work even when users open email in another browser/device.
    flowType: 'implicit',
    detectSessionInUrl: true,
  },
});
