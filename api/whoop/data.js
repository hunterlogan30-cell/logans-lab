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

  const headers = { 
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  try {
    const [recoveryRes, sleepRes, cycleRes] = await Promise.all([
  fetch('https://api.prod.whoop.com/developer/v1/recovery?limit=1', { headers }),
  fetch('https://api.prod.whoop.com/developer/v1/sleep?limit=1', { headers }),
  fetch('https://api.prod.whoop.com/developer/v1/cycle?limit=7', { headers }),
]);

    // Log status codes to debug
    console.log('recovery status:', recoveryRes.status);
    console.log('sleep status:', sleepRes.status);
    console.log('cycle status:', cycleRes.status);

    const recoveryText = await recoveryRes.text();
    const sleepText = await sleepRes.text();
    const cycleText = await cycleRes.text();

    console.log('recovery body:', recoveryText);
    console.log('sleep body:', sleepText);
    console.log('cycle body:', cycleText);

    res.json({
      recovery: JSON.parse(recoveryText),
      sleep: JSON.parse(sleepText),
      cycles: JSON.parse(cycleText),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}