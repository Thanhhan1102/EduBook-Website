module.exports = function handler(_request, response) {
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    response.status(503).json({ error: 'Supabase is not configured.' });
    return;
  }

  response.setHeader('Cache-Control', 'no-store');
  response.status(200).json({
    url: 'https://jhhpygtddakqcdjthuxq.supabase.co',
    publishableKey,
    authRedirectUrl: process.env.EDUBOOK_AUTH_REDIRECT_URL || 'https://edubook-iuh.vercel.app/login.html'
  });
};
