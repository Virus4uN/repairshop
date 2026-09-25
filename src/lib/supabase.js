import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || 'https://ojuqqaglqtcfpdprclgm.supabase.co';
const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qdXFxYWdscXRjZnBkcHJjbGdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwNTU5NDEsImV4cCI6MjEwNTYzMTk0MX0.vp5Lj2r7fqcCgebDOSvjBanTi7Qysl66wtFxjZfKeGA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
