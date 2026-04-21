import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://txqbjgwasygbpplvxulz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4cWJqZ3dhc3lnYnBwbHZ4dWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NTg4NjUsImV4cCI6MjA5MjMzNDg2NX0.8AvuUn1mYbWEcU4cdEcJEbYKR2bTclMORUKU9vbqrSM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);