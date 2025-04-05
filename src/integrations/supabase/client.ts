
import { createClient } from '@supabase/supabase-js';

// Supabase project configuration
const supabaseUrl = 'https://xelaffizgghzchdwagjn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbGFmZml6Z2doemNoZHdhZ2puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0ODgwNDMsImV4cCI6MjA1NjA2NDA0M30.j5n_KowPEpO0W0tlzCQHw6uVNyKAxy8ITehzd3sBOjU';

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Re-export for compatibility with existing code
export const supabase = supabaseClient;
