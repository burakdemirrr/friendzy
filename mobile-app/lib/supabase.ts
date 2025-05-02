import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://viavadoctixmdtnidxoy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpYXZhZG9jdGl4bWR0bmlkeG95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMTI5NTksImV4cCI6MjA2MTY4ODk1OX0.5zBeqZ3x44LTloPyJXsLe8Q7nN55d6lkkLVn6_CBRJk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 