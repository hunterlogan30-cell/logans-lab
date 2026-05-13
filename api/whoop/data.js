import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function getValidToken() {
  const { data } = await supabase
    .from('whoop_tokens')
    .select('*')
    .eq('id', 1)
    .single();

  if (!data?.access_token) return null;

  // If token is expired, refresh it first
  if (Date.now() > data.expires_at - 60000) {
    await fetch('https://logans-lab.vercel.app/api/whoop/refresh');
    const { data: refreshed } = await supabase
      .from('whoop_tokens')
      .select('access_token')
      .eq('id', 1)
      .single();
    return refreshed?.access_token;
  }

  return data.access_token;
}

export default async function handler(req, res) {
  const token = await getValidToken();

  if (!token) {
    return res.status(401).json({ error: 'Not connected to Whoop' });
  }

  const headers = { Authorization: `Bearer ${token}` };

  // Fetch recovery, sleep, and cycles in parallel
  const [recoveryRes, sleepRes, cycleRes] = await Promise.all([
    fetch('https://api.prod.whoop.com/developer/v1/recovery?limit=1', { headers }),
    fetch('https://api.prod.whoop.com/developer/v1/activity/sleep?limit=1', { headers }),
    fetch('https://api.prod.whoop.com/developer/v1/cycle?limit=7', { headers }),
  ]);

  const [recovery, sleep, cycles] = await Promise.all([
    recoveryRes.json(),
    sleepRes.json(),
    cycleRes.json(),
  ]);

  res.json({ recovery, sleep, cycles });
}