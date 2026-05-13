import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // Get current refresh token from Supabase
  const { data, error } = await supabase
    .from('whoop_tokens')
    .select('*')
    .eq('id', 1)
    .single();

  if (error || !data?.refresh_token) {
    return res.status(400).json({ error: 'No refresh token found' });
  }

  // Exchange refresh token for new access token
  const tokenRes = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: data.refresh_token,
      client_id: process.env.VITE_WHOOP_CLIENT_ID,
      client_secret: process.env.VITE_WHOOP_CLIENT_SECRET,
    }),
  });

  const tokens = await tokenRes.json();

  if (!tokens.access_token) {
    return res.status(500).json({ error: 'Failed to refresh', details: tokens });
  }

  // Save new tokens
  await supabase.from('whoop_tokens').update({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: Date.now() + tokens.expires_in * 1000,
    updated_at: new Date().toISOString(),
  }).eq('id', 1);

  res.json({ success: true });
}