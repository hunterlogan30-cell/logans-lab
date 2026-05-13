import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const url = new URL(req.url, 'https://logans-lab.vercel.app');
  const code = url.searchParams.get('code');

  if (!code) {
   return res.status(400).send('No code provided — url was: ' + req.url + ' query: ' + JSON.stringify(req.query));
  }

  // Exchange code for tokens
  const tokenRes = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
  grant_type: 'authorization_code',
  code,
  client_id: process.env.VITE_WHOOP_CLIENT_ID,
  client_secret: process.env.VITE_WHOOP_CLIENT_SECRET,
  redirect_uri: 'https://logans-lab.vercel.app/api/whoop/callback',
  scope: 'read:recovery read:cycles read:sleep read:workout read:profile read:body_measurement offline',
}),

  const tokens = await tokenRes.json();

  if (!tokens.access_token) {
    return res.status(500).send('Failed to get tokens: ' + JSON.stringify(tokens));
  }

  // Save tokens to Supabase
  await supabase.from('whoop_tokens').update({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: Date.now() + tokens.expires_in * 1000,
    updated_at: new Date().toISOString(),
  }).eq('id', 1);

  // Redirect back to the app
  res.redirect('https://logans-lab.vercel.app');
}