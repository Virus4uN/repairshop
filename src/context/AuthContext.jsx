import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(() => {
    try {
      const cached = localStorage.getItem('smarthub_user_profile');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id, session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id, session.user);
      } else {
        setUser(null);
        setProfile(null);
        try {
          localStorage.removeItem('smarthub_user_profile');
        } catch (e) {}
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId, authUser = null) => {
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const email = authUser?.email || user?.email || data?.email || '';
      const meta = authUser?.user_metadata || user?.user_metadata || {};
      const cleanEmail = email.toLowerCase().trim();

      // Strict deterministic role resolution
      let resolvedRole = data?.role || meta.role;
      if (cleanEmail === 'sc7348509580@gmail.com') {
        resolvedRole = 'admin';
      } else if (cleanEmail === 'tech@smarthub.com' || cleanEmail.includes('tech@') || resolvedRole === 'technician') {
        resolvedRole = 'technician';
      } else if (resolvedRole === 'admin') {
        resolvedRole = 'admin';
      } else {
        resolvedRole = 'customer';
      }

      const finalProfile = {
        id: userId,
        email: cleanEmail,
        full_name: data?.full_name || meta.full_name || cleanEmail.split('@')[0] || 'User',
        role: resolvedRole,
        phone: data?.phone || meta.phone || '',
      };

      setProfile(finalProfile);
      try {
        localStorage.setItem('smarthub_user_profile', JSON.stringify(finalProfile));
      } catch (e) {}
      return finalProfile;
    } catch (err) {
      console.warn('Profile fetch notice:', err.message);
      const email = authUser?.email || user?.email || '';
      const meta = authUser?.user_metadata || user?.user_metadata || {};
      const cleanEmail = email.toLowerCase().trim();

      let resolvedRole = 'customer';
      if (cleanEmail === 'sc7348509580@gmail.com' || meta.role === 'admin') resolvedRole = 'admin';
      else if (cleanEmail === 'tech@smarthub.com' || cleanEmail.includes('tech@') || meta.role === 'technician') resolvedRole = 'technician';

      const fallbackProfile = {
        id: userId,
        email: cleanEmail,
        full_name: meta.full_name || cleanEmail.split('@')[0] || 'User',
        role: resolvedRole,
        phone: meta.phone || '',
      };
      setProfile(fallbackProfile);
      try {
        localStorage.setItem('smarthub_user_profile', JSON.stringify(fallbackProfile));
      } catch (e) {}
      return fallbackProfile;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async ({ email, password, fullName, phone, address }) => {
    // 1. Try serverless instant registration first (pre-confirms email and avoids SMTP failure)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, phone, address }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          // Immediately sign in with the password!
          const { data: signData, error: signErr } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (!signErr && signData?.user) {
            setUser(signData.user);
            const prof = await fetchProfile(signData.user.id, signData.user);
            return { user: signData.user, profile: prof, instantLogin: true };
          }
          return { user: json.user, instantLogin: false };
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        if (errJson.error && !errJson.error.includes('404') && !errJson.error.includes('Not Found')) {
          throw new Error(errJson.error);
        }
      }
    } catch (e) {
      if (e.message && !e.message.includes('fetch') && !e.message.includes('Failed to fetch')) {
        throw e;
      }
    }

    // 2. Direct Supabase signUp fallback
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone, role: 'customer' },
      },
    });

    if (error) {
      if (error.message?.includes('confirmation email')) {
        throw new Error(
          'Email Confirmation Notice: In Supabase Dashboard > Authentication > Providers > Email, turn OFF "Confirm email" to enable instant registration.'
        );
      }
      throw error;
    }

    // Create user profile if table exists
    if (data.user) {
      try {
        await supabase.from('users').insert({
          id: data.user.id,
          full_name: fullName,
          email,
          phone,
          role: 'customer',
        });

        await supabase.from('customers').insert({
          user_id: data.user.id,
          full_name: fullName,
          email,
          phone,
          address,
        });
      } catch (e) {
        console.warn('Profile table insert warning:', e.message);
      }
    }

    return data;
  };

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    setUser(data.user);
    const prof = await fetchProfile(data.user.id, data.user);
    return { data, profile: prof };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  const updateProfile = async (updates) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user?.id)
        .select()
        .single();

      if (!error && data) {
        setProfile(data);
        return data;
      }
    } catch (e) {
      console.warn('Profile update notice:', e.message);
    }
    const updated = { ...profile, ...updates };
    setProfile(updated);
    return updated;
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    fetchProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
