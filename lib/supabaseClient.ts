// utils/supabaseClient.ts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cnraxjrcvmovlkrhoafd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNucmF4anJjdm1vdmxrcmhvYWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MDcxOTYsImV4cCI6MjA2MTI4MzE5Nn0.1EM0Ok8d9JnrKV8qO1FZzb9kHvPUUaWJPfbr45wn_kI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
