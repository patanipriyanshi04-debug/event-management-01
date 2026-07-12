// Supabase Configuration
// Replace these with your actual Supabase URL and Anon Key
const SUPABASE_URL = "https://okzujpzexmigdgeszhgv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_H86cAbZb-FzRBx7I6hpi9A_pziMTUul";

if (SUPABASE_URL === "YOUR_SUPABASE_URL" || SUPABASE_ANON_KEY === "YOUR_SUPABASE_ANON_KEY") {
    console.warn("Supabase credentials are not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in supabase-client.js.");
}

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
