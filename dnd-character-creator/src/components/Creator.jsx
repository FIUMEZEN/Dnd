import { useState, useMemo } from "react";
import { Check, ChevronLeft, ChevronRight } from "../icons";
import { C } from "../theme";
import { Frame, GhostButton, GoldButton } from "./primitives";
import { SpellManager } from "./spells";
import { StepRace, StepClass, StepAbilities, StepBackground, StepEquipment } from "./steps";
import { StepReview } from "./CharacterSheetView";
import { CLASSES } from "../data/classes";
import { getEffectiveCasterInfo } from "../lib/casting";
import { isStepComplete, isStepFullyComplete, STEPS } from "../lib/character";

/* ---------------------------------- CREATOR ---------------------------------- */

// Una classe (combinata con l'eventuale sottoclasse già scelta) può davvero lanciare
// incantesimi? Prima ancora di scegliere una classe non c'è nulla da mostrare, quindi lo step
// resta nascosto. Guerriero/Ladro dipendono poi dalla sottoclasse (Cavaliere Mistico/Furfante
// Arcano); finché la sottoclasse non è ancora scelta assumiamo di sì, per non far sparire lo
// step prima che l'utente abbia deciso.
export function draftCanEverCast(draft) {
  const cls = CLASSES.find((c) => c.id === draft.classId);
  if (!cls) return false;
  if (getEffectiveCasterInfo(cls.id, draft.subclassId)) return true;
  if ((cls.id === "guerriero" || cls.id === "ladro") && !draft.subclassId) return true;
  return false;
}

export function Creator({ draft, setDraft, onBack, onSave, saving }) {
  const [step, setStep] = useState(0);
  const visibleSteps = useMemo(
    () => STEPS.filter((s) => s.key !== "incantesimi" || draftCanEverCast(draft)),
    [draft.classId, draft.subclassId]
  );
  const lastStep = visibleSteps.length - 1;
  // Se cambiando classe/sottoclasse lo step "Incantesimi" sparisce, l'indice grezzo può restare
  // fuori dai nuovi limiti (es. si era arrivati al Riepilogo): lo clampiamo qui, in lettura,
  // invece che con un effect che richiamerebbe subito un altro render.
  const clampedStep = Math.min(step, lastStep);
  const currentKey = visibleSteps[clampedStep]?.key;

  const canGoNext = !!currentKey && isStepComplete(currentKey, draft);

  return (
    <div style={{ display: "flex", flexDirection: "var(--creator-flex-dir)", gap: "1.75rem" }}>
      <div style={{ width: "var(--creator-sidebar-width)", flexShrink: 0, padding: "0.8rem 0.7rem", borderRadius: 2, background: "rgba(31, 24, 19, 0.7)", border: `1px solid rgba(224, 193, 101, 0.25)`, boxShadow: "inset 0 0 0 1px rgba(224, 193, 101, 0.08)" }}>
        <GhostButton icon={ChevronLeft} onClick={onBack} style={{ marginBottom: 18, width: "100%", justifyContent: "flex-start" }}>
          I miei personaggi
        </GhostButton>
        <div style={{ display: "flex", flexDirection: "var(--creator-steps-dir)", gap: 4, overflowX: "auto" }}>
          {visibleSteps.map((s, i) => {
            const Icon = s.icon;
            const active = i === clampedStep;
            const done = isStepFullyComplete(s.key, draft);
            return (
              <button
                key={s.key}
                onClick={() => setStep(i)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, textAlign: "left", flexShrink: 0, whiteSpace: "nowrap",
                  padding: "0.7rem 0.75rem", borderRadius: 3, border: `1px solid ${active ? "rgba(224,193,101,0.65)" : "transparent"}`, cursor: "pointer",
                  background: active ? "rgba(201,162,39,0.14)" : done ? "rgba(47,92,72,0.18)" : "transparent",
                  color: active ? C.gold : done ? C.cream : C.creamMuted,
                  boxShadow: active ? `inset 0 0 0 1px rgba(224,193,101,0.2)` : "none",
                }}
              >
                <span style={{
                  width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  border: `1px solid ${active ? C.gold : done ? C.forest : "#5a4f43"}`,
                  background: done ? C.forest : "transparent", fontSize: 11, fontFamily: "'Cinzel', serif", flexShrink: 0,
                }}>
                  {done ? <Check size={12} /> : i + 1}
                </span>
                <span style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, fontWeight: active ? 600 : 500 }}>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 14, padding: "0.7rem 0.9rem", border: `1px solid ${C.goldSoft}`, borderRadius: 2, background: "linear-gradient(180deg, rgba(43, 33, 23, 0.96), rgba(31, 24, 19, 0.98))", boxShadow: `inset 0 0 0 1px rgba(224, 193, 101, 0.22)` }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 11, color: C.goldSoft, letterSpacing: 1.2, textTransform: "uppercase", opacity: 0.96 }}>
            Stato del personaggio
          </div>
          <div style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.cream, marginTop: 4, fontWeight: 700, lineHeight: 1.35 }}>
            {draft.name || "Nuovo eroe"} · {visibleSteps[clampedStep]?.label}
          </div>
        </div>
        <Frame>
          {currentKey === "razza" && <StepRace draft={draft} setDraft={setDraft} />}
          {currentKey === "classe" && <StepClass draft={draft} setDraft={setDraft} />}
          {currentKey === "caratteristiche" && <StepAbilities draft={draft} setDraft={setDraft} />}
          {currentKey === "background" && <StepBackground draft={draft} setDraft={setDraft} />}
          {currentKey === "equipaggiamento" && <StepEquipment draft={draft} setDraft={setDraft} />}
          {currentKey === "incantesimi" && <SpellManager draft={draft} setDraft={setDraft} />}
          {currentKey === "riepilogo" && <StepReview draft={draft} setDraft={setDraft} onSave={onSave} saving={saving} />}
        </Frame>

        {clampedStep < lastStep && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
            <GhostButton icon={ChevronLeft} onClick={() => setStep((s) => Math.max(0, Math.min(s, lastStep) - 1))} style={{ visibility: clampedStep === 0 ? "hidden" : "visible" }}>
              Indietro
            </GhostButton>
            <GoldButton icon={ChevronRight} disabled={!canGoNext} onClick={() => setStep((s) => Math.min(lastStep, Math.min(s, lastStep) + 1))} style={{ flexDirection: "row-reverse" }}>
              Avanti
            </GoldButton>
          </div>
        )}
      </div>
    </div>
  );
}
