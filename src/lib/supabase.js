import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Variáveis NEXT_PUBLIC_SUPABASE_URL e/ou NEXT_PUBLIC_SUPABASE_ANON_KEY ausentes no .env"
  );
}

/**
 * Cliente para uso no NAVEGADOR (respeita RLS).
 * Usa apenas a chave pública (anon).
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
