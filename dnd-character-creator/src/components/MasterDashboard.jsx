import { useState } from "react";
import { BookOpen, ChevronLeft, Pencil, Plus, Skull, Trash2 } from "../icons";
import { C } from "../theme";
import { Frame, GhostButton, GoldButton } from "./primitives";
import { CREATURE_SIZES } from "../data/creatures";
import { fmtMod } from "../lib/format";
import { getCurrentHp, getEffectiveProficiencyBonus, getMaxHp, isCreatureDead } from "../lib/creature";

export function MasterDashboard({ creatures, loading, onBack, onNew, onOpen, onOpenSheet, onDelete, onOpenCompendium }) {
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  return (
    <div>
      <GhostButton icon={ChevronLeft} onClick={onBack} style={{ marginBottom: 18 }}>I miei personaggi</GhostButton>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: 26, color: C.cream, margin: 0 }}>Sezione Master</h1>
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.creamMuted, margin: "4px 0 0" }}>
            Crea e conserva creature custom per le tue sessioni.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <GhostButton icon={BookOpen} onClick={onOpenCompendium} style={{ borderColor: C.gold, color: C.gold }}>
            Compendio Incantesimi
          </GhostButton>
          <GoldButton icon={Plus} onClick={onNew}>Nuova creatura</GoldButton>
        </div>
      </div>

      {loading ? (
        <p style={{ fontFamily: "'Spectral', serif", color: C.creamMuted }}>Caricamento…</p>
      ) : creatures.length === 0 ? (
        <Frame style={{ textAlign: "center", padding: "3rem 2rem" }}>
          <Skull size={28} color={C.gold} style={{ marginBottom: 10 }} />
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 16, color: C.textOnParchment, margin: "0 0 6px" }}>
            Nessuna creatura ancora forgiata
          </p>
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textMuted, margin: "0 0 18px" }}>
            Crea la tua prima creatura custom per popolare le tue avventure.
          </p>
          <GoldButton icon={Plus} onClick={onNew}>Crea creatura</GoldButton>
        </Frame>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "var(--g2)", gap: "1rem" }}>
          {creatures.map((cr) => {
            const sizeLabel = CREATURE_SIZES.find((s) => s.key === cr.size)?.name || cr.size;
            const isPendingDelete = pendingDeleteId === cr.id;
            return (
              <Frame key={cr.id} style={{ padding: "1.25rem 1.4rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Skull size={16} color={C.wine} />
                      <span style={{ fontFamily: "'Cinzel', serif", fontSize: 17, color: C.textOnParchment }}>{cr.name || "Creatura senza nome"}</span>
                    </div>
                    <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textMuted, margin: "4px 0 0" }}>
                      {sizeLabel} {cr.type}{cr.typeTag ? ` (${cr.typeTag})` : ""} · GS {cr.cr} ({fmtMod(getEffectiveProficiencyBonus(cr))})
                    </p>
                    <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: isCreatureDead(cr) ? C.danger : C.textMuted, margin: "2px 0 0" }}>
                      CA {cr.ac} · {getCurrentHp(cr)} / {getMaxHp(cr)} PF{isCreatureDead(cr) ? " · MORTO" : ""}
                    </p>
                  </div>
                  {isPendingDelete ? (
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      <button
                        onClick={() => { onDelete(cr.id); setPendingDeleteId(null); }}
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
                    <button onClick={() => setPendingDeleteId(cr.id)} style={{ background: "transparent", border: "none", cursor: "pointer", color: C.danger, padding: 4 }} aria-label="Elimina creatura">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <GoldButton icon={Skull} onClick={() => onOpenSheet(cr)} style={{ padding: "0.5rem 0.9rem", fontSize: 13 }}>
                    Scheda da Combattimento
                  </GoldButton>
                  <GhostButton icon={Pencil} onClick={() => onOpen(cr)} style={{ borderColor: C.wine, color: C.wineDeep, background: "transparent" }}>
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
