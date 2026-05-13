import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // Get token
  const { data: tokenData, error: tokenError } = await supabase
    .from('whoop_tokens')
    .select('*')
    .eq('id', 1)
    .single();

  if (tokenError || !tokenData?.access_token) {
    return res.status(401).json({ error: 'No token', tokenError, tokenData });
  }

  const token = tokenData.access_token;
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch all three in parallel
  const [cycleRes, sleepRes, recoveryRes] = await Promise.all([
    fetch('https://api.prod.whoop.com/developer/v1/cycle?limit=7', { headers }),
    fetch('https://api.prod.whoop.com/developer/v2/activity/sleep?limit=1', { headers }),
    fetch('https://api.prod.whoop.com/developer/v1/recovery?limit=1', { headers }),
  ]);

  const [cycles, sleep, recovery] = await Promise.all([
    cycleRes.json(),
    sleepRes.json(),
    recoveryRes.text(),
  ]);

  res.json({
    cycles,
    sleep,
    recoveryRaw: recovery,
    recoveryStatus: recoveryRes.status,
  });
}