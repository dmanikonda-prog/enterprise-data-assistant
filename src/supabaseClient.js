import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iomwnnxxypzuqsvtxdxc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvbXdubnh4eXB6dXFzdnR4ZHhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1OTQxNTAsImV4cCI6MjA4NjE3MDE1MH0.46QWth132Zj3FrISs0o_OTwM_4y1hg7fheUdiGSv30Q'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
