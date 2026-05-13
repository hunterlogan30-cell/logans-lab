import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const { data: tokenData } = await supabase
    .from('whoop_tokens')
    .select('*')
    .eq('id', 1)
    .single();

  if (!tokenData?.access_token) {
    return res.status(401).json({ error: 'No token' });
  }

  const token = tokenData.access_token;
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch cycles and sleep in parallel
  const [cycleRes, sleepRes] = await Promise.all([
    fetch('https://api.prod.whoop.com/developer/v1/cycle?limit=7', { headers }),
    fetch('https://api.prod.whoop.com/developer/v2/activity/sleep?limit=1', { headers }),
  ]);

  const cycles = await cycleRes.json();
  const sleep = await sleepRes.json();

  // Get recovery from most recent COMPLETED cycle (end !== null)
  const completedCycle = cycles.records?.find(c => c.end !== null);
  let recovery = null;
  if (completedCycle) {
    const recoveryRes = await fetch(
      `https://api.prod.whoop.com/developer/v1/cycle/${completedCycle.id}/recovery`,
      { headers }
    );
    const recoveryText = await recoveryRes.text();
    console.log('recovery status:', recoveryRes.status, 'id:', completedCycle.id, 'body:', recoveryText);
    if (recoveryRes.status === 200) {
      recovery = JSON.parse(recoveryText);
    }
  }

  res.json({ cycles, sleep, recovery });
}