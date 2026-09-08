// Pannello "Campagna" del Master: genera/mostra il Codice Campagna e mostra in sola lettura,
// aggiornati in tempo reale, i Personaggi dei giocatori che lo hanno inserito sulla propria
// scheda — con la possibilità di espandere ognuno nella scheda completa. Nessun account: il
// codice è l'unica chiave, condiviso "a fiducia" — va comunicato chiaramente a chi lo legge
// (vedi ADR/CONTEXT sul modello di sicurezza). Il Codice/gli Entries arrivano da App.jsx (unica
// sottoscrizione condivisa anche con l'Incontro, che può aggiungere questi PG come combattenti).
import { useState } from "react";
import { ChevronDown, ChevronLeft, ChevronUp, Skull, Sword, Trash2, Users } from "../icons";
import { C } from "../theme";
import { Frame, GhostButton, GoldButton } from "./primitives";
import { RACES } from "../data/races";
import { CLASSES } from "../data/classes";
import { getCharacterCombatStats } from "../lib/character";
import { CharacterSheetView } from "./CharacterSheetView";
import { supabase } from "../lib/supabaseClient";
import { removeCharacterFromCampaign } from "../lib/campaignSync";

const noop = () => {};

export function CampaignPanel({ code, codeLoaded, entries, onGenerateCode, onBack, onOpenEncounter, onOpenBestiary }) {
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedIds, setExpandedIds] = useState(() => new Set());

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard non disponibile (es. contesto non sicuro): il codice resta comunque visibile a schermo.
    }
  };

  const handleRemove = (characterId) => removeCharacterFromCampaign(code, characterId);

  const toggleExpanded = (characterId) => setExpandedIds((prev) => {
    const next = new Set(prev);
    if (next.has(characterId)) next.delete(characterId); else next.add(characterId);
    return next;
  });

  return (
    <div>
      <GhostButton icon={ChevronLeft} onClick={onBack} style={{ marginBottom: 18 }}>Sezione Master</GhostButton>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: 26, color: C.cream, margin: 0 }}>Campagna</h1>
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.creamMuted, margin: "4px 0 0" }}>
            Vedi in sola lettura i personaggi dei tuoi giocatori, sempre aggiornati.
          </p>
        </div>
        {supabase && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <GhostButton icon={Skull} onClick={onOpenBestiary} style={{ borderColor: C.wineBright, color: C.wineBright }}>
              Bestiario
            </GhostButton>
            <GoldButton icon={Sword} onClick={onOpenEncounter}>Incontro</GoldButton>
          </div>
        )}
      </div>

      {!supabase ? (
        <Frame style={{ textAlign: "center", padding: "3rem 2rem" }}>
          <Users size={28} color={C.gold} style={{ marginBottom: 10 }} />
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 16, color: C.textOnParchment, margin: "0 0 6px" }}>
            Campagna non ancora configurata
          </p>
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textMuted, margin: 0 }}>
            Questa funzione richiede un piccolo servizio esterno gratuito (Supabase) per far comunicare i dispositivi tra loro. Segui la procedura guidata di configurazione, poi questa pagina si attiverà da sola.
          </p>
        </Frame>
      ) : !codeLoaded ? (
        <p style={{ fontFamily: "'Spectral', serif", color: C.creamMuted }}>Caricamento…</p>
      ) : (
        <>
          <Frame style={{ marginBottom: 18 }}>
            {!code ? (
              <>
                <p style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textOnParchment, margin: "0 0 12px" }}>
                  Genera un Codice Campagna e condividilo con i tuoi giocatori: lo inseriranno una volta sulla loro scheda e li vedrai comparire qui.
                </p>
                <GoldButton onClick={onGenerateCode}>Genera codice campagna</GoldButton>
              </>
            ) : (
              <>
                <p style={{ fontFamily: "'Cinzel', serif", fontSize: 11, color: C.textMuted, margin: "0 0 4px" }}>IL TUO CODICE CAMPAGNA</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: 28, letterSpacing: 4, color: C.wineDeep }}>{code}</span>
                  <GhostButton onClick={handleCopy} style={{ borderColor: C.wine, color: C.wineDeep }}>{copied ? "Copiato!" : "Copia"}</GhostButton>
                  {confirmRegenerate ? (
                    <>
                      <GhostButton onClick={() => { onGenerateCode(); setConfirmRegenerate(false); }} style={{ borderColor: C.danger, color: C.danger }}>Conferma nuovo codice</GhostButton>
                      <GhostButton onClick={() => setConfirmRegenerate(false)}>Annulla</GhostButton>
                    </>
                  ) : (
                    <GhostButton onClick={() => setConfirmRegenerate(true)} style={{ borderColor: C.parchmentLine, color: C.textMuted }}>
                      Rigenera
                    </GhostButton>
                  )}
                </div>
                <p style={{ fontFamily: "'Spectral', serif", fontSize: 12, color: C.textMuted, fontStyle: "italic", margin: 0 }}>
                  Chiunque conosca questo codice può far comparire un personaggio nella tua campagna: condividilo solo con i tuoi giocatori. Rigenerarlo scollega i personaggi già collegati (restano salvi sui loro dispositivi).
                </p>
              </>
            )}
          </Frame>

          {code && (
            entries.length === 0 ? (
              <Frame style={{ textAlign: "center", padding: "2.5rem 2rem" }}>
                <p style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textMuted, margin: 0 }}>
                  Nessun personaggio ancora collegato. Appena un giocatore inserisce il codice sulla sua scheda, comparirà qui.
                </p>
              </Frame>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {entries.map((entry) => {
                  const c = entry.data;
                  const race = RACES.find((r) => r.id === c.raceId);
                  const cls = CLASSES.find((cl) => cl.id === c.classId);
                  const stats = cls ? getCharacterCombatStats(c) : null;
                  const expanded = expandedIds.has(entry.character_id);
                  return (
                    <Frame key={entry.character_id} style={{ padding: "1.1rem 1.3rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <button
                          onClick={() => toggleExpanded(entry.character_id)}
                          style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0, textAlign: "left", flex: 1 }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Users size={15} color={C.wine} />
                            <span style={{ fontFamily: "'Cinzel', serif", fontSize: 16, color: C.textOnParchment }}>{c.name || "Senza nome"}</span>
                            {expanded ? <ChevronUp size={14} color={C.textMuted} /> : <ChevronDown size={14} color={C.textMuted} />}
                          </div>
                          <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "4px 0 0" }}>
                            {race?.name || "—"} · {cls ? `${cls.name} (liv. ${c.level || 1})` : "—"}
                          </p>
                          {stats?.maxHp != null && (
                            <p style={{ fontFamily: "'Spectral', serif", fontSize: 12, color: stats.currentHp <= stats.maxHp / 3 ? C.danger : C.textMuted, margin: "2px 0 0" }}>
                              CA {stats.ac} · {stats.currentHp} / {stats.maxHp} PF
                            </p>
                          )}
                        </button>
                        <button onClick={() => handleRemove(entry.character_id)} aria-label="Rimuovi dalla campagna" title="Rimuovi dalla campagna (non tocca il personaggio del giocatore)" style={{ background: "transparent", border: "none", cursor: "pointer", color: C.danger, padding: 4 }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                      {expanded && (
                        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.parchmentLine}` }}>
                          <CharacterSheetView draft={c} setDraft={noop} />
                        </div>
                      )}
                    </Frame>
                  );
                })}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
