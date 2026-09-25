import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId, authUser = null) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        const email = authUser?.email || user?.email;
        const meta = authUser?.user_metadata || user?.user_metadata || {};
        const isAdmin = email?.toLowerCase() === 'sc7348509580@gmail.com' || meta.role === 'admin';
        const role = isAdmin ? 'admin' : (meta.role || 'customer');
        const fallbackProfile = {
          id: userId,
          email: email,
          full_name: meta.full_name || email?.split('@')[0] || 'User',
          role: role,
          phone: meta.phone || ''
        };
        setProfile(fallbackProfile);
        return fallbackProfile;
      }
      setProfile(data);
      return data;
    } catch (err) {
      console.warn('Profile fetch notice:', err.message);
      const email = authUser?.email || user?.email;
      const meta = authUser?.user_metadata || user?.user_metadata || {};
      const isAdmin = email?.toLowerCase() === 'sc7348509580@gmail.com' || meta.role === 'admin';
      const role = isAdmin ? 'admin' : (meta.role || 'customer');
      const fallbackProfile = {
        id: userId,
        email: email,
        full_name: meta.full_name || email?.split('@')[0] || 'User',
        role: role,
        phone: meta.phone || ''
      };
      setProfile(fallbackProfile);
      return fallbackProfile;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async ({ email, password, fullName, phone, address }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone, role: 'customer' },
      },
    });

    if (error) throw error;

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

        // Create customer record
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
