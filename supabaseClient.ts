import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://qqznlvcexvgdqfmeiznw.supabase.co"
const supabaseKey = "sb_secret_UQgyCaBIqf37gxh5CWliZQ_9ZyfiHUj"

export const supabase = createClient(supabaseUrl, supabaseKey)
