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

  // If token is not expired, return it
  if (Date.now() < data.expires_at - 60000) {
    return data.access_token;
  }

  // Token expired — refresh it inline
  if (!data.refresh_token) return null;

  const tokenRes = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: data.refresh_token,
      client_id: process.env.VITE_WHOOP_CLIENT_ID,
      client_secret: process.env.VITE_WHOOP_CLIENT_SECRET,
      scope: 'read:recovery read:cycles read:sleep read:workout read:profile read:body_measurement offline',
    }),
  });

  const tokens = await tokenRes.json();
  if (!tokens.access_token) return null;

  await supabase.from('whoop_tokens').update({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: Date.now() + tokens.expires_in * 1000,
    updated_at: new Date().toISOString(),
  }).eq('id', 1);

  return tokens.access_token;
}

export default async function handler(req, res) {
  const token = await getValidToken();

  if (!token) {
    return res.status(401).json({ error: 'Not connected to Whoop' });
  }

  const headers = { Authorization: `Bearer ${token}` };

  const [cycleRes, sleepRes] = await Promise.all([
    fetch('https://api.prod.whoop.com/developer/v1/cycle?limit=7', { headers }),
    fetch('https://api.prod.whoop.com/developer/v2/activity/sleep?limit=7', { headers }),
  ]);

  const cycles = await cycleRes.json();
  const sleep = await sleepRes.json();

  const completedCycle = cycles.records?.find(c => c.end !== null);
  let recovery = null;
  if (completedCycle) {
    const recoveryRes = await fetch(
      `https://api.prod.whoop.com/developer/v1/cycle/${completedCycle.id}/recovery`,
      { headers }
    );
    if (recoveryRes.status === 200) {
      recovery = await recoveryRes.json();
    }
  }

  res.json({ cycles, sleep, recovery });
}