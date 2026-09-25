import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ojuqqaglqtcfpdprclgm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qdXFxYWdscXRjZnBkcHJjbGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDA1NTk0MSwiZXhwIjoyMTA1NjMxOTQxfQ.9jA0zyP5taqvla8W563_STWNThksgjNtzXLBjXc1xNI';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

globalThis.__SMARTHUB_OTPS__ = globalThis.__SMARTHUB_OTPS__ || new Map();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { email, otp } = body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const stored = globalThis.__SMARTHUB_OTPS__.get(cleanEmail);

    // Verify OTP
    if (!stored || stored.otp !== String(otp).trim() || Date.now() > stored.expiresAt) {
      return res.status(400).json({ error: 'Invalid or expired OTP. Please request a new code.' });
    }

    // OTP is valid! Remove after use
    globalThis.__SMARTHUB_OTPS__.delete(cleanEmail);

    // 1. Ensure user exists in Supabase
    let userId = null;
    let userRole = cleanEmail === 'sc7348509580@gmail.com' ? 'admin' : (cleanEmail.includes('tech') ? 'technician' : 'customer');

    const { data: usersList } = await supabaseAdmin.auth.admin.listUsers();
    const existing = usersList?.users?.find((u) => u.email?.toLowerCase() === cleanEmail);

    if (existing) {
      userId = existing.id;
      userRole = existing.user_metadata?.role || userRole;
    } else {
      // Create confirmed user
      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        email_confirm: true,
        user_metadata: {
          full_name: cleanEmail.split('@')[0],
          role: userRole,
        },
      });
      if (createErr) throw createErr;
      userId = created.user.id;
    }

    // 2. Generate a sign-in magic link or session
    const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: cleanEmail,
    });

    return res.status(200).json({
      success: true,
      user: {
        id: userId,
        email: cleanEmail,
        role: userRole,
      },
      magicLink: linkData?.properties?.action_link || null,
      hashedToken: linkData?.properties?.hashed_token || null,
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    return res.status(500).json({ error: err.message || 'OTP verification failed' });
  }
}
