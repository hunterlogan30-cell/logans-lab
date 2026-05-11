import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://rwoaigfylrxluapaphca.supabase.co'
const SUPABASE_KEY = 'sb_publishable_VnXlER6ZG7jjX4BA-xzTQQ_gPQuZnWG'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)