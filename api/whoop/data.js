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
  return data?.access_token || null;
}

export default async function handler(req, res) {
  const token = await getValidToken();
  if (!token) return res.status(401).json({ error: 'Not connected to Whoop' });

  const headers = { Authorization: `Bearer ${token}` };

  // Fetch cycles and sleep in parallel
  const [cycleRes, sleepRes] = await Promise.all([
    fetch('https://api.prod.whoop.com/developer/v1/cycle?limit=7', { headers }),
    fetch('https://api.prod.whoop.com/developer/v2/activity/sleep?limit=1', { headers }),
  ]);

  const cycles = await cycleRes.json();
  const sleep = await sleepRes.json();

  // Get recovery for the most recent COMPLETED cycle
  const latestCycleId = cycles.records?.find(c => c.end !== null)?.id;
  let recovery = null;
  if (latestCycleId) {
    const recoveryRes = await fetch(
      `https://api.prod.whoop.com/developer/v1/cycle/${latestCycleId}/recovery`,
      { headers }
    );
    if (recoveryRes.status === 200) {
      recovery = await recoveryRes.json();
    }
  }
  res.json({ cycles, sleep, recovery });
}