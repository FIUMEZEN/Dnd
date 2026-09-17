// Sincronizzazione dei Personaggi verso la Campagna del Master: ogni Personaggio con un
// campaignCode impostato viene scritto (upsert) nella tabella condivisa Supabase
// "campaign_characters" ad ogni salvataggio locale riuscito; il Master si iscrive in tempo
// reale a quella tabella filtrata per il proprio codice. Nessun account/login: il codice
// campagna è l'unica chiave, condiviso "a fiducia" come il link di un documento.
import { supabase } from "./supabaseClient";
import { CAMPAIGN_CODE_STORAGE_KEY, storageAdapter } from "./storage";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // niente 0/O/1/I, facili da confondere

export function generateCampaignCode(length = 8) {
  let code = "";
  for (let i = 0; i < length; i += 1) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export async function getMyCampaignCode() {
  const res = await storageAdapter.get(CAMPAIGN_CODE_STORAGE_KEY, null);
  return res.value || null;
}
export async function setMyCampaignCode(code) {
  await storageAdapter.set(CAMPAIGN_CODE_STORAGE_KEY, code);
  return code;
}
export async function clearMyCampaignCode() {
  await storageAdapter.set(CAMPAIGN_CODE_STORAGE_KEY, "");
}

// Scrive il Personaggio nella Campagna se ha un codice impostato. Il salvataggio locale (già
// avvenuto quando questa funzione viene chiamata) non deve mai dipendere dalla riuscita del
// sync verso il Master — per questo il chiamante non fa mai await bloccante su questa funzione
// prima di considerare il salvataggio riuscito. Ritorna comunque true/false (o null se non
// applicabile, es. nessun codice impostato) così chi chiama può mostrare un indicatore di stato
// senza far dipendere il salvataggio stesso dall'esito.
export async function syncCharacterToCampaign(character) {
  const code = (character?.campaignCode || "").trim();
  if (!code || !supabase || !character.id) return null;
  try {
    const { error } = await supabase.from("campaign_characters").upsert(
      { campaign_code: code, character_id: character.id, data: character, updated_at: new Date().toISOString() },
      { onConflict: "campaign_code,character_id" }
    );
    if (error) throw error;
    return true;
  } catch (error) {
    console.warn("Sync verso la Campagna non riuscito (il personaggio resta salvato in locale):", error);
    return false;
  }
}

// Rimuove SOLO la riga condivisa di un Personaggio da una Campagna — non tocca mai il
// personaggio locale del giocatore.
export async function removeCharacterFromCampaign(campaignCode, characterId) {
  if (!supabase) return;
  try {
    await supabase.from("campaign_characters").delete().eq("campaign_code", campaignCode).eq("character_id", characterId);
  } catch (error) {
    console.warn("Rimozione dalla Campagna non riuscita:", error);
  }
}

// Iscrive il Master ai Personaggi di una Campagna: chiama onChange(list) subito con lo stato
// attuale, poi ad ogni inserimento/aggiornamento/cancellazione in tempo reale. onStatusChange
// riceve "connecting" | "connected" | "error" — senza, un errore di rete o una disconnessione
// del canale in tempo reale sono indistinguibili da "nessun giocatore ancora collegato" (lista
// vuota in entrambi i casi). Ritorna una funzione per annullare l'iscrizione.
export function subscribeToCampaign(campaignCode, onChange, onStatusChange = () => {}) {
  if (!supabase || !campaignCode) return () => {};

  const fetchAndEmit = async () => {
    const { data, error } = await supabase
      .from("campaign_characters")
      .select("character_id, data, updated_at")
      .eq("campaign_code", campaignCode)
      .order("updated_at", { ascending: false });
    if (error) { onStatusChange("error"); return; }
    onChange(data || []);
  };

  fetchAndEmit();

  const channel = supabase
    .channel(`campaign-${campaignCode}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "campaign_characters", filter: `campaign_code=eq.${campaignCode}` },
      fetchAndEmit
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") onStatusChange("connected");
      else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") onStatusChange("error");
    });

  return () => { supabase.removeChannel(channel); };
}
