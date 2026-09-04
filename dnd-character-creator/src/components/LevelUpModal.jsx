import { X } from "../icons";
import { C } from "../theme";
import { Divider, GoldButton, OptionCard } from "./primitives";
import { AsiPicker, ElementalDisciplinePicker, FightingStyleSelector, InvocationPicker, MetamagicPicker, PactBoonPicker } from "./pickers";
import { HpLevelManager } from "./hp";
import { CLASSES, SUBCLASS_CHOICE_LEVEL } from "../data/classes";
import { getFightingStyleCount } from "../lib/character";
import { getDisciplinesKnownCount, getInvocationsKnownCount, getMetamagicKnownCount } from "../lib/casting";

/* ---------------------------------- LEVEL UP MODAL ---------------------------------- */
// Riunisce in un unico popup, nell'ordine in cui vanno effettivamente decise, SOLO le scelte
// sbloccate dal nuovo livello (sottoclasse, PF, ASI/Talento, stile di combattimento extra,
// discipline/metamagia/invocazioni/dono del patto se il loro numero è appena aumentato).
// Le variazioni puramente informative (nuove feature testuali, slot, risorse, critico) restano
// in un riepilogo di sola lettura in fondo.
export function LevelUpModal({
  clsId, className, fromLevel, toLevel, store, updateStore,
  subclassOptions, chosenSubclassId, onChooseSubclass, changes, onCancel, onConfirm,
}) {
  const cls = CLASSES.find((c) => c.id === clsId);
  // Chierico/Paladino/Warlock/Druido scelgono dominio/giuramento/patrono/circolo altrove
  // (non usano il campo "subclassId" generico): qui li escludiamo per non offrire un
  // selettore che scriverebbe nel campo sbagliato.
  const subclassJustUnlocked = clsId in SUBCLASS_CHOICE_LEVEL && subclassOptions.length > 0 && toLevel === SUBCLASS_CHOICE_LEVEL[clsId] && !chosenSubclassId;
  const styleCountBefore = getFightingStyleCount(clsId, fromLevel, store.subclassId);
  const styleCountAfter = getFightingStyleCount(clsId, toLevel, store.subclassId);
  const showFightingStyle = styleCountAfter > styleCountBefore;
  const showDisciplines = clsId === "monaco" && chosenSubclassId === "quattro-elementi" && getDisciplinesKnownCount(toLevel) > getDisciplinesKnownCount(fromLevel);
  const showMetamagic = clsId === "stregone" && getMetamagicKnownCount(toLevel) > getMetamagicKnownCount(fromLevel);
  const showPactBoon = clsId === "warlock" && toLevel === 3;
  const showInvocations = clsId === "warlock" && getInvocationsKnownCount(toLevel) > getInvocationsKnownCount(fromLevel);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "var(--modal-outer-padding)" }}>
      <div style={{ background: C.parchment, padding: "var(--frame-padding)", borderRadius: 4, maxWidth: "var(--modal-max-width)", width: "100%", maxHeight: "88vh", overflowY: "auto", border: `1px solid ${C.gold}`, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 22, color: C.wineDeep, margin: 0 }}>
            Livello {toLevel}! <span style={{ color: C.textMuted, fontWeight: 400, fontSize: 15 }}>— {className}</span>
          </h2>
          <button onClick={onCancel} aria-label="Annulla il livellamento" title="Annulla il livellamento" style={{ background: "transparent", border: "none", cursor: "pointer", color: C.textMuted, padding: 4 }}>
            <X size={20} />
          </button>
        </div>
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textMuted, margin: "0 0 6px" }}>
          Completa qui le scelte sbloccate da questo livello. La ✕ in alto annulla il livellamento (torni al livello {fromLevel} senza modifiche); "Fatto" conferma — potrai comunque rivedere le scelte più in basso nella scheda.
        </p>

        {subclassJustUnlocked && (
          <div style={{ marginTop: 14 }}>
            <Divider />
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 8px" }}>Sottoclasse — {cls?.name}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "var(--g2)", gap: "0.5rem 1rem" }}>
              {subclassOptions.map((s) => (
                <OptionCard key={s.id} selected={chosenSubclassId === s.id} onClick={() => onChooseSubclass(s.id)} title={s.name}>
                  <p style={{ fontFamily: "'Spectral', serif", fontStyle: "italic", fontSize: 12.5, color: C.textMuted, margin: 0 }}>{s.blurb}</p>
                </OptionCard>
              ))}
            </div>
          </div>
        )}

        <HpLevelManager
          cls={cls}
          hpPerLevel={store.hpPerLevel}
          onSetMethod={(lvl, val) => updateStore((s) => ({ hpPerLevel: { ...s.hpPerLevel, [lvl]: val } }))}
          levels={[toLevel]}
          title={`Punti Ferita — Livello ${toLevel}`}
        />

        <AsiPicker store={store} updateStore={updateStore} clsId={clsId} classLevel={toLevel} onlyLevels={[toLevel]} />

        {showFightingStyle && (
          <div style={{ marginTop: 14 }}>
            <Divider />
            <FightingStyleSelector store={store} updateStore={updateStore} clsId={clsId} classLevel={toLevel} label={`Stile di Combattimento — ${cls?.name}`} />
          </div>
        )}

        {showDisciplines && <ElementalDisciplinePicker store={store} updateStore={updateStore} level={toLevel} />}
        {showMetamagic && <MetamagicPicker store={store} updateStore={updateStore} level={toLevel} />}
        {showPactBoon && <PactBoonPicker store={store} updateStore={updateStore} level={toLevel} />}
        {showInvocations && <InvocationPicker store={store} updateStore={updateStore} level={toLevel} />}

        {(changes.newFeatures.length > 0 || (changes.slotsChanged && changes.newSlots.length > 0) || changes.resourceChanges.length > 0 || changes.critChanged) && (
          <div style={{ marginTop: 14 }}>
            <Divider />
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 8px" }}>Altre novità di questo livello</h3>
            <ul style={{ margin: 0, paddingLeft: 18, fontFamily: "'Spectral', serif", fontSize: 13, color: C.textOnParchment }}>
              {changes.newFeatures.map((f) => (
                <li key={f.name} style={{ marginBottom: 4 }}><b>{f.name}</b> — {f.desc}</li>
              ))}
              {changes.slotsChanged && changes.newSlots.length > 0 && (
                <li style={{ marginBottom: 4 }}>Slot incantesimo aggiornati: {changes.newSlots.map((s) => `liv. ${s.level} × ${s.total}`).join(", ")}. Per aggiungere nuovi incantesimi conosciuti usa "Modifica".</li>
              )}
              {changes.resourceChanges.map((rc) => <li key={rc} style={{ marginBottom: 4 }}>{rc}</li>)}
              {changes.critChanged && (
                <li>Raggio di critico: {changes.oldCrit} → {changes.newCrit}.</li>
              )}
            </ul>
          </div>
        )}

        <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end" }}>
          <GoldButton onClick={onConfirm}>Fatto</GoldButton>
        </div>
      </div>
    </div>
  );
}
