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

  const cycleRes = await fetch('https://api.prod.whoop.com/developer/v1/cycle?limit=7', { headers });
  const cycles = await cycleRes.json();

  res.json({ cycles });
}