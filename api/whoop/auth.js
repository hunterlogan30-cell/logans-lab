export default function handler(req, res) {
  const clientId = process.env.VITE_WHOOP_CLIENT_ID;
  const redirectUri = 'https://logans-lab.vercel.app/api/whoop/callback';

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'read:recovery read:cycles read:sleep read:workout read:profile read:body_measurement',
  });

  res.redirect(`https://api.prod.whoop.com/oauth/oauth2/auth?${params}`);
}