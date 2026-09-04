import { useState } from "react";
import { BookOpen, Crown, Pencil, Plus, Shield, Sword, Trash2, Wand2 } from "../icons";
import { C } from "../theme";
import { Frame, GhostButton, GoldButton } from "./primitives";
import { RACES } from "../data/races";
import { CLASSES } from "../data/classes";
import { mod } from "../lib/format";
import { computeFinalScores, computeMaxHp, emptyDraft, getChosenSubclassId, getSubclass } from "../lib/character";

export function CharacterList({ characters, loading, onNew, onOpen, onOpenSheet, onDelete, onOpenCompendium }) {
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: 26, color: C.cream, margin: 0 }}>I tuoi personaggi</h1>
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.creamMuted, margin: "4px 0 0" }}>
            Dungeons &amp; Dragons · 5e 2014
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <GhostButton icon={BookOpen} onClick={onOpenCompendium} style={{ borderColor: C.gold, color: C.gold }}>
            Compendio Incantesimi
          </GhostButton>
          <GoldButton icon={Plus} onClick={onNew}>Nuovo personaggio</GoldButton>
        </div>
      </div>

      {loading ? (
        <p style={{ fontFamily: "'Spectral', serif", color: C.creamMuted }}>Caricamento…</p>
      ) : characters.length === 0 ? (
        <Frame style={{ textAlign: "center", padding: "3rem 2rem" }}>
          <Crown size={28} color={C.gold} style={{ marginBottom: 10 }} />
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 16, color: C.textOnParchment, margin: "0 0 6px" }}>
            Nessun eroe ancora forgiato
          </p>
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textMuted, margin: "0 0 18px" }}>
            Crea il tuo primo personaggio per iniziare l'avventura.
          </p>
          <GoldButton icon={Plus} onClick={onNew}>Crea personaggio</GoldButton>
        </Frame>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "var(--g2)", gap: "1rem" }}>
          {characters.map((c) => {
            const race = RACES.find((r) => r.id === c.raceId);
            const cls = CLASSES.find((cl) => cl.id === c.classId);
            const Icon = cls?.id === "mago" || cls?.id === "stregone" || cls?.id === "warlock" ? Wand2 : cls?.id === "chierico" || cls?.id === "paladino" ? Shield : Sword;

            const chosenSubclassId = cls ? getChosenSubclassId(c, cls.id) : null;
            const subclass = cls ? getSubclass(cls.id, chosenSubclassId) : null;
            let maxHp = null, currentHp = null;
            if (cls) {
              const finalScores = computeFinalScores({ ...emptyDraft(), ...c });
              maxHp = computeMaxHp({ ...emptyDraft(), ...c }, cls, race, mod(finalScores.con));
              currentHp = c.currentHp == null ? maxHp : Math.min(c.currentHp, maxHp);
            }
            const isPendingDelete = pendingDeleteId === c.id;

            return (
              <Frame key={c.id} style={{ padding: "1.25rem 1.4rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Icon size={16} color={C.wine} />
                      <span style={{ fontFamily: "'Cinzel', serif", fontSize: 17, color: C.textOnParchment }}>{c.name}</span>
                    </div>
                    <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textMuted, margin: "4px 0 0" }}>
                      {race?.name || "—"} · {cls ? `${cls.name} (liv. ${c.level || 1})` : "—"}{subclass ? ` — ${subclass.name}` : ""}
                    </p>
                    {maxHp != null && (
                      <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: currentHp <= maxHp / 3 ? C.danger : C.textMuted, margin: "2px 0 0" }}>
                        {currentHp} / {maxHp} PF
                      </p>
                    )}
                  </div>
                  {isPendingDelete ? (
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      <button
                        onClick={() => { onDelete(c.id); setPendingDeleteId(null); }}
                        style={{ background: C.danger, color: "#fff", border: "none", cursor: "pointer", borderRadius: 3, padding: "4px 8px", fontFamily: "'Spectral', serif", fontSize: 11.5 }}
                      >
                        Sì, elimina
                      </button>
                      <button
                        onClick={() => setPendingDeleteId(null)}
                        style={{ background: "transparent", border: `1px solid ${C.parchmentLine}`, cursor: "pointer", borderRadius: 3, padding: "4px 8px", fontFamily: "'Spectral', serif", fontSize: 11.5, color: C.textMuted }}
                      >
                        Annulla
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setPendingDeleteId(c.id)} style={{ background: "transparent", border: "none", cursor: "pointer", color: C.danger, padding: 4 }} aria-label="Elimina personaggio">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <GoldButton icon={BookOpen} onClick={() => onOpenSheet(c)} style={{ padding: "0.5rem 0.9rem", fontSize: 13 }}>
                    Apri scheda
                  </GoldButton>
                  <GhostButton icon={Pencil} onClick={() => onOpen(c)} style={{ borderColor: C.wine, color: C.wineDeep, background: "transparent" }}>
                    Modifica
                  </GhostButton>
                </div>
              </Frame>
            );
          })}
        </div>
      )}
    </div>
  );
}
