import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ojuqqaglqtcfpdprclgm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qdXFxYWdscXRjZnBkcHJjbGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDA1NTk0MSwiZXhwIjoyMTA1NjMxOTQxfQ.9jA0zyP5taqvla8W563_STWNThksgjNtzXLBjXc1xNI';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  // CORS support
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { email, password, fullName, phone, address, role = 'customer', specialization = '' } = body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const userRole = cleanEmail === 'sc7348509580@gmail.com' ? 'admin' : (role === 'technician' ? 'technician' : 'customer');

    // 1. Create confirmed user via Supabase Admin Auth API
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName || cleanEmail.split('@')[0],
        phone: phone || '',
        role: userRole,
        specialization: specialization || '',
      },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const userId = data.user.id;

    // 2. Insert into public.users table
    try {
      await supabaseAdmin.from('users').upsert({
        id: userId,
        full_name: fullName,
        email: cleanEmail,
        phone: phone || '',
        role: userRole,
      });
    } catch (e) {
      console.warn('Error saving to users table:', e.message);
    }

    // 3. Insert into role-specific table
    if (userRole === 'technician') {
      try {
        await supabaseAdmin.from('technicians').insert({
          user_id: userId,
          full_name: fullName,
          email: cleanEmail,
          phone: phone || '',
          specialization: specialization || 'Hardware & Micro-soldering Specialist',
          status: 'active',
        });
      } catch (e) {
        console.warn('Error inserting into technicians table:', e.message);
      }
    } else {
      try {
        await supabaseAdmin.from('customers').insert({
          user_id: userId,
          full_name: fullName,
          email: cleanEmail,
          phone: phone || '',
          address: address || '',
        });
      } catch (e) {
        console.warn('Error inserting into customers table:', e.message);
      }
    }

    return res.status(200).json({
      success: true,
      user: {
        id: userId,
        email: data.user.email,
        full_name: fullName,
        role: userRole,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error during registration' });
  }
}
