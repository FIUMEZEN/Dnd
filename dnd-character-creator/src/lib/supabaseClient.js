// Client Supabase per la sincronizzazione dei personaggi verso la Campagna del Master (vedi
// campaignSync.js). Se le variabili d'ambiente non sono configurate (progetto Supabase non
// ancora creato), esporta null: il resto dell'app deve trattare questo come "funzionalità non
// disponibile", mai come un errore — il salvataggio locale non dipende mai da questo client.
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
