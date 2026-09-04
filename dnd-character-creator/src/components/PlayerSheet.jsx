import { useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Save, Plus } from "../icons";
import { C } from "../theme";
import { Frame, Divider, GhostButton, GoldButton, OptionCard } from "./primitives";
import { FightingStyleSelector } from "./pickers";
import { CharacterSheetView } from "./CharacterSheetView";
import { LevelUpModal } from "./LevelUpModal";
import { RACES } from "../data/races";
import { CLASSES, SUBCLASS_CHOICE_LEVEL } from "../data/classes";
import {
  checkMulticlassPrereq, computeFinalScores, emptyMulticlass, getChosenSubclassId,
  getLevelUpChanges, getSubclass, getSubclassOptions, getTotalCharacterLevel, hasFightingStyles,
} from "../lib/character";

export function PlayerSheet({ character, onBack, onSaveChanges }) {
  const [draft, setDraft] = useState(character);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [levelUpInfo, setLevelUpInfo] = useState(null);
  // Stato del draft (e del flag "modifiche non salvate") subito prima di far scattare il
  // livellamento: se l'utente annulla dal popup (✕), lo ripristiniamo com'era, come se il
  // livellamento non fosse mai avvenuto. Ogni aggiornamento del draft nel resto dell'app usa
  // sempre spread immutabili, quindi tenere un semplice riferimento all'oggetto precedente basta.
  const [levelUpSnapshot, setLevelUpSnapshot] = useState(null);
  const [addingMulticlass, setAddingMulticlass] = useState(false);
  const [confirmRemoveMc, setConfirmRemoveMc] = useState(false);

  const race = RACES.find((r) => r.id === draft.raceId);
  const cls = CLASSES.find((c) => c.id === draft.classId);
  const subclass = cls ? getSubclass(cls.id, getChosenSubclassId(draft, cls.id)) : null;
  const subclassOptions = cls ? getSubclassOptions(cls.id) : [];
  const subclassUnlocked = cls && subclassOptions.length > 0 && draft.level >= (SUBCLASS_CHOICE_LEVEL[cls.id] || 3);

  const mc = draft.multiclass && draft.multiclass.classId ? draft.multiclass : null;
  const mcCls = mc ? CLASSES.find((c) => c.id === mc.classId) : null;
  const mcSubclassOptions = mcCls ? getSubclassOptions(mcCls.id) : [];
  const mcSubclassUnlocked = mcCls && mcSubclassOptions.length > 0 && mc.level >= (SUBCLASS_CHOICE_LEVEL[mcCls.id] || 3);
  const totalLevel = getTotalCharacterLevel(draft);
  const finalScoresNow = computeFinalScores(draft);

  const updateDraft = (updater) => {
    setDirty(true);
    setDraft(updater);
  };
  const mcUpdateStore = (fn) => updateDraft((d) => ({ ...d, multiclass: { ...d.multiclass, ...fn(d.multiclass) } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveChanges(draft);
      setDirty(false);
    } finally {
      setSaving(false);
    }
  };

  const handleLevelUp = () => {
    if (!cls || totalLevel >= 20) return;
    const fromLevel = draft.level;
    const toLevel = fromLevel + 1;
    const changes = getLevelUpChanges(cls.id, getChosenSubclassId(draft, cls.id), fromLevel, toLevel);
    setLevelUpSnapshot({ draft, dirty });
    updateDraft((d) => ({ ...d, level: toLevel }));
    setLevelUpInfo({ target: "primary", changes });
  };

  const handleMulticlassLevelUp = () => {
    if (!mcCls || totalLevel >= 20) return;
    const fromLevel = mc.level;
    const toLevel = fromLevel + 1;
    const changes = getLevelUpChanges(mcCls.id, getChosenSubclassId(mc, mcCls.id), fromLevel, toLevel);
    setLevelUpSnapshot({ draft, dirty });
    updateDraft((d) => ({ ...d, multiclass: { ...d.multiclass, level: toLevel } }));
    setLevelUpInfo({ target: "secondary", changes });
  };

  // ✕ nel popup: annulla il livellamento e ogni scelta fatta al suo interno, come se non
  // avessimo mai cliccato "Sali di livello".
  const cancelLevelUp = () => {
    if (levelUpSnapshot) {
      setDraft(levelUpSnapshot.draft);
      setDirty(levelUpSnapshot.dirty);
    }
    setLevelUpSnapshot(null);
    setLevelUpInfo(null);
  };

  // "Fatto" nel popup: tiene le scelte fatte e chiude, senza toccare lo stato.
  const confirmLevelUp = () => {
    setLevelUpSnapshot(null);
    setLevelUpInfo(null);
  };

  const handleConfirmMulticlass = (classId) => {
    updateDraft((d) => ({ ...d, multiclass: emptyMulticlass(classId) }));
    setAddingMulticlass(false);
  };

  const handleRemoveMulticlass = () => {
    updateDraft((d) => ({ ...d, multiclass: null }));
    setConfirmRemoveMc(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", gap: 12, flexWrap: "wrap" }}>
        <div>
          <GhostButton icon={ChevronLeft} onClick={onBack} style={{ marginBottom: 10 }}>
            I miei personaggi
          </GhostButton>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: 24, color: C.cream, margin: 0 }}>{draft.name || "Personaggio senza nome"}</h1>
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.creamMuted, margin: "4px 0 0" }}>
            {race ? race.name : "—"} · {cls ? `${cls.name} ${draft.level}` : "—"}{subclass ? ` (${subclass.name})` : ""}{mcCls ? ` / ${mcCls.name} ${mc.level}` : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {cls && draft.level < 20 && totalLevel < 20 && (
            <GhostButton icon={ChevronRight} onClick={handleLevelUp} style={{ borderColor: C.gold, color: C.gold, flexDirection: "row-reverse" }}>
              Sali di livello{mcCls ? ` — ${cls.name}` : ""}
            </GhostButton>
          )}
          {mcCls && mc.level < 20 && totalLevel < 20 && (
            <GhostButton icon={ChevronRight} onClick={handleMulticlassLevelUp} style={{ borderColor: C.gold, color: C.gold, flexDirection: "row-reverse" }}>
              Sali di livello — {mcCls.name}
            </GhostButton>
          )}
          <GoldButton icon={saving ? Loader2 : Save} disabled={saving || !dirty} onClick={handleSave}>
            {saving ? "Salvataggio…" : dirty ? "Salva modifiche" : "Nessuna modifica da salvare"}
          </GoldButton>
        </div>
      </div>

      {levelUpInfo && levelUpInfo.target === "primary" && cls && (
        <LevelUpModal
          clsId={cls.id}
          className={cls.name}
          fromLevel={levelUpInfo.changes.fromLevel}
          toLevel={levelUpInfo.changes.toLevel}
          store={draft}
          updateStore={(fn) => updateDraft((d) => ({ ...d, ...fn(d) }))}
          subclassOptions={subclassOptions}
          chosenSubclassId={getChosenSubclassId(draft, cls.id)}
          onChooseSubclass={(id) => updateDraft((d) => ({ ...d, subclassId: id }))}
          changes={levelUpInfo.changes}
          onCancel={cancelLevelUp}
          onConfirm={confirmLevelUp}
        />
      )}
      {levelUpInfo && levelUpInfo.target === "secondary" && mcCls && (
        <LevelUpModal
          clsId={mcCls.id}
          className={mcCls.name}
          fromLevel={levelUpInfo.changes.fromLevel}
          toLevel={levelUpInfo.changes.toLevel}
          store={mc}
          updateStore={mcUpdateStore}
          subclassOptions={mcSubclassOptions}
          chosenSubclassId={getChosenSubclassId(mc, mcCls.id)}
          onChooseSubclass={(id) => mcUpdateStore(() => ({ subclassId: id }))}
          changes={levelUpInfo.changes}
          onCancel={cancelLevelUp}
          onConfirm={confirmLevelUp}
        />
      )}

      {/* Sottoclasse - Classe Primaria */}
      {cls && !["chierico", "paladino", "warlock", "druido"].includes(cls.id) && subclassOptions.length > 0 && (
        <Frame style={{ padding: "0.9rem 1rem", marginBottom: 18 }}>
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 6px" }}>
            Sottoclasse — {cls.name}
          </h3>
          {!subclassUnlocked ? (
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textMuted, margin: 0 }}>
              Disponibile dal livello {SUBCLASS_CHOICE_LEVEL[cls.id] || 3}.
            </p>
          ) : (
            <>
              <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "0 0 10px" }}>
                Scegli la sottoclasse del tuo personaggio per questo livello.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "var(--g2)", gap: "0.5rem 1rem" }}>
                {subclassOptions.map((s) => (
                  <OptionCard
                    key={s.id}
                    selected={getChosenSubclassId(draft, cls.id) === s.id}
                    onClick={() => setDraft((d) => ({ ...d, subclassId: d.subclassId === s.id ? null : s.id }))}
                    title={s.name}
                  >
                    <p style={{ fontFamily: "'Spectral', serif", fontStyle: "italic", fontSize: 12.5, color: C.textMuted, margin: 0 }}>{s.blurb}</p>
                  </OptionCard>
                ))}
              </div>
            </>
          )}
        </Frame>
      )}

      {/* Stili di Combattimento - Classe Primaria */}
      {cls && hasFightingStyles(cls.id) && (
        <Frame style={{ padding: "0.9rem 1rem", marginBottom: 18 }}>
          <FightingStyleSelector
            store={draft}
            updateStore={(fn) => setDraft((d) => ({ ...d, ...fn(d) }))}
            clsId={cls.id}
            classLevel={draft.level}
            label={`Stile di Combattimento — ${cls.name}`}
          />
        </Frame>
      )}

      {/* Sezione Multiclasse */}
      <Frame style={{ padding: "0.9rem 1rem", marginBottom: 18 }}>
        <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 6px" }}>
          Multiclasse
        </h3>

        {!mcCls ? (
          addingMulticlass ? (
            <>
              <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "0 0 10px" }}>
                Scegli la classe secondaria. I requisiti minimi (5e 2014) sono indicati per riferimento: l'app non blocca la scelta, la decisione finale spetta al tavolo di gioco.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "var(--g2)", gap: "0.5rem 1rem", marginBottom: 10 }}>
                {CLASSES.filter((c) => c.id !== draft.classId).map((c) => {
                  const prereq = checkMulticlassPrereq(finalScoresNow, c.id);
                  return (
                    <OptionCard
                      key={c.id}
                      selected={false}
                      onClick={() => handleConfirmMulticlass(c.id)}
                      title={c.name}
                    >
                      <p style={{ fontFamily: "'Spectral', serif", fontStyle: "italic", fontSize: 12, color: prereq.met ? C.forestDeep : C.wine, margin: 0 }}>
                        Requisito: {prereq.text} {prereq.met ? "✓ soddisfatto" : "✗ non soddisfatto"}
                      </p>
                    </OptionCard>
                  );
                })}
              </div>
              <GhostButton onClick={() => setAddingMulticlass(false)} style={{ borderColor: C.parchmentLine, color: C.textMuted }}>
                Annulla
              </GhostButton>
            </>
          ) : (
            <>
              <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textMuted, margin: "0 0 10px" }}>
                Il personaggio ha una sola classe. Puoi aggiungerne una seconda per multiclassare.
              </p>
              <GoldButton icon={Plus} onClick={() => setAddingMulticlass(true)} style={{ padding: "0.55rem 1rem", fontSize: 13 }}>
                Aggiungi classe secondaria
              </GoldButton>
            </>
          )
        ) : (
          <>
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textOnParchment, margin: "0 0 10px" }}>
              Classe secondaria: <b>{mcCls.name}</b>, livello {mc.level}. Il livello totale del personaggio è {totalLevel}.
            </p>
            {confirmRemoveMc ? (
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.danger }}>
                  Rimuovere la classe secondaria e tutti i progressi ad essa legati (ASI, talenti, risorse, PF)?
                </span>
                <button
                  onClick={handleRemoveMulticlass}
                  style={{ background: C.danger, color: "#fff", border: "none", cursor: "pointer", borderRadius: 3, padding: "4px 8px", fontFamily: "'Spectral', serif", fontSize: 11.5 }}
                >
                  Sì, rimuovi
                </button>
                <button
                  onClick={() => setConfirmRemoveMc(false)}
                  style={{ background: "transparent", border: `1px solid ${C.parchmentLine}`, cursor: "pointer", borderRadius: 3, padding: "4px 8px", fontFamily: "'Spectral', serif", fontSize: 11.5, color: C.textMuted }}
                >
                  Annulla
                </button>
              </div>
            ) : (
              <GhostButton onClick={() => setConfirmRemoveMc(true)} style={{ borderColor: C.danger, color: C.danger, marginBottom: 10 }}>
                Rimuovi classe secondaria
              </GhostButton>
            )}

            {/* Sottoclasse - Classe Secondaria */}
            {!["chierico", "paladino", "warlock", "druido"].includes(mcCls.id) && mcSubclassOptions.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <h4 style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: C.wineDeep, margin: "0 0 6px" }}>
                  Sottoclasse — {mcCls.name}
                </h4>
                {!mcSubclassUnlocked ? (
                  <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: 0 }}>
                    Disponibile dal livello {SUBCLASS_CHOICE_LEVEL[mcCls.id] || 3}.
                  </p>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "var(--g2)", gap: "0.5rem 1rem" }}>
                    {mcSubclassOptions.map((s) => (
                      <OptionCard
                        key={s.id}
                        selected={getChosenSubclassId(mc, mcCls.id) === s.id}
                        onClick={() => mcUpdateStore((st) => ({ subclassId: st.subclassId === s.id ? null : s.id }))}
                        title={s.name}
                      >
                        <p style={{ fontFamily: "'Spectral', serif", fontStyle: "italic", fontSize: 12.5, color: C.textMuted, margin: 0 }}>{s.blurb}</p>
                      </OptionCard>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Stili di Combattimento - Classe Secondaria */}
            {mcCls && hasFightingStyles(mcCls.id) && (
              <div style={{ marginTop: 12 }}>
                <Divider />
                <FightingStyleSelector
                  store={mc}
                  updateStore={mcUpdateStore}
                  clsId={mcCls.id}
                  classLevel={mc.level}
                  label={`Stile di Combattimento — ${mcCls.name}`}
                />
              </div>
            )}
          </>
        )}
      </Frame>

      {/* Scheda del Personaggio */}
      <Frame>
        <CharacterSheetView draft={draft} setDraft={updateDraft} showPlayTools />
      </Frame>
    </div>
  );
}
