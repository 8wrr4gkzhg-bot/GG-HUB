import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://fuuyaqhgxamcdjsxinrm.supabase.co";
const supabaseAnonKey = "sb_publishable_iBn1abZGp1jdtL6wtU5Qwg_i1Y3chOZ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);