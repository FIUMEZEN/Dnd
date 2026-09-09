import { useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Save, X } from "../icons";
import { C } from "../theme";
import { Frame, Divider, GhostButton, GoldButton, OptionCard } from "./primitives";
import { FightingStyleSelector } from "./pickers";
import { CharacterSheetView } from "./CharacterSheetView";
import { LevelUpModal } from "./LevelUpModal";
import { RACES } from "../data/races";
import { CLASSES, SUBCLASS_CHOICE_LEVEL } from "../data/classes";
import {
  checkMulticlassPrereq, computeFinalScores, emptyMulticlass, getChosenSubclassId,
  getFightingStyleCount, getLevelUpChanges, getSubclass, getSubclassOptions, getTotalCharacterLevel, hasFightingStyles,
} from "../lib/character";
import { getDisciplinesKnownCount, getInvocationsKnownCount, getManeuversKnownCount, getMetamagicKnownCount } from "../lib/casting";

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
  // Se il personaggio ha una sola classe, "Sali di livello" chiede prima a quale classe va il
  // nuovo livello (quella attuale o una nuova, per iniziare a multiclassare): è l'unico momento
  // in cui una seconda classe può nascere, in linea con le regole (il multiclasse si sceglie
  // proprio quando si guadagna un livello).
  const [levelUpClassChoice, setLevelUpClassChoice] = useState(false);
  const [confirmRemoveMc, setConfirmRemoveMc] = useState(false);
  // "Torna indietro di un livello": correzione per errori nel livellamento, non fa parte delle
  // regole ufficiali. Richiede conferma perché scarta le scelte fatte all'ultimo livello (PF,
  // ASI/Talento, stile di combattimento extra, e le manovre/discipline/invocazioni/metamagia in
  // eccesso rispetto al nuovo livello più basso).
  const [levelDownTarget, setLevelDownTarget] = useState(null); // null | "primary" | "secondary"

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

  // Punto di ingresso del bottone "Sali di livello": se il personaggio non ha ancora una
  // seconda classe, chiede prima a quale classe assegnare il livello, prima di procedere.
  const startLevelUp = () => {
    if (!cls || totalLevel >= 20) return;
    if (mcCls) {
      handleLevelUp();
      return;
    }
    setLevelUpClassChoice(true);
  };

  const chooseLevelUpCurrentClass = () => {
    setLevelUpClassChoice(false);
    handleLevelUp();
  };

  const chooseLevelUpNewClass = (classId) => {
    setLevelUpClassChoice(false);
    handleConfirmMulticlass(classId);
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
  };

  const handleRemoveMulticlass = () => {
    updateDraft((d) => ({ ...d, multiclass: null }));
    setConfirmRemoveMc(false);
  };

  // Scarta le scelte del livello che si sta togliendo e ritaglia ogni scelta cumulativa
  // (stile di combattimento, manovre, discipline, invocazioni, metamagia) al numero massimo
  // consentito dal nuovo livello più basso, così il personaggio resta sempre in uno stato valido.
  const buildLevelDownUpdate = (classId, store, oldLevel) => {
    const newLevel = oldLevel - 1;
    const asiChoices = { ...store.asiChoices }; delete asiChoices[oldLevel];
    const featChoices = { ...store.featChoices }; delete featChoices[oldLevel];
    const featAbilityChoices = { ...store.featAbilityChoices }; delete featAbilityChoices[oldLevel];
    const levelChoiceType = { ...store.levelChoiceType }; delete levelChoiceType[oldLevel];
    const hpPerLevel = { ...store.hpPerLevel }; delete hpPerLevel[oldLevel];

    const subclassUnlockLevel = SUBCLASS_CHOICE_LEVEL[classId] || 3;
    const clearSubclass = classId in SUBCLASS_CHOICE_LEVEL && newLevel < subclassUnlockLevel;
    const subclassId = clearSubclass ? null : store.subclassId;

    const update = {
      level: newLevel, asiChoices, featChoices, featAbilityChoices, levelChoiceType, hpPerLevel, subclassId,
    };

    const styleCount = getFightingStyleCount(classId, newLevel, subclassId);
    if ((store.fightingStyles || []).length > styleCount) update.fightingStyles = store.fightingStyles.slice(0, styleCount);

    if (classId === "guerriero" && subclassId === "maestro-di-battaglia") {
      const known = getManeuversKnownCount(newLevel);
      if ((store.maneuverIds || []).length > known) update.maneuverIds = store.maneuverIds.slice(0, known);
    }
    if (classId === "monaco" && subclassId === "quattro-elementi") {
      const known = getDisciplinesKnownCount(newLevel);
      if ((store.disciplineIds || []).length > known) update.disciplineIds = store.disciplineIds.slice(0, known);
    }
    if (classId === "stregone") {
      const known = getMetamagicKnownCount(newLevel);
      if ((store.metamagicIds || []).length > known) update.metamagicIds = store.metamagicIds.slice(0, known);
    }
    if (classId === "warlock") {
      const known = getInvocationsKnownCount(newLevel);
      if ((store.invocationIds || []).length > known) update.invocationIds = store.invocationIds.slice(0, known);
      if (newLevel < 3) update.pactBoonId = null;
    }
    return update;
  };

  const confirmLevelDown = () => {
    if (levelDownTarget === "primary" && cls && draft.level > 1) {
      updateDraft((d) => ({ ...d, ...buildLevelDownUpdate(cls.id, d, d.level) }));
    } else if (levelDownTarget === "secondary" && mcCls && mc.level > 1) {
      mcUpdateStore((s) => buildLevelDownUpdate(mcCls.id, s, s.level));
    }
    setLevelDownTarget(null);
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
          {cls && draft.level > 1 && (
            <GhostButton onClick={() => setLevelDownTarget("primary")} style={{ borderColor: C.parchmentLine, color: C.textMuted, fontSize: 12 }}>
              Torna indietro di un livello{mcCls ? ` — ${cls.name}` : ""}
            </GhostButton>
          )}
          {mcCls && mc.level > 1 && (
            <GhostButton onClick={() => setLevelDownTarget("secondary")} style={{ borderColor: C.parchmentLine, color: C.textMuted, fontSize: 12 }}>
              Torna indietro di un livello — {mcCls.name}
            </GhostButton>
          )}
          {cls && draft.level < 20 && totalLevel < 20 && (
            <GhostButton icon={ChevronRight} onClick={startLevelUp} style={{ borderColor: C.gold, color: C.gold, flexDirection: "row-reverse" }}>
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

      {levelUpClassChoice && cls && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "var(--modal-outer-padding)" }}>
          <div style={{ background: C.parchment, padding: "var(--frame-padding)", borderRadius: 4, maxWidth: "var(--modal-max-width)", width: "100%", maxHeight: "88vh", overflowY: "auto", border: `1px solid ${C.gold}`, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
              <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 22, color: C.wineDeep, margin: 0 }}>
                Livello {totalLevel + 1}! <span style={{ color: C.textMuted, fontWeight: 400, fontSize: 15 }}>— a quale classe lo assegni?</span>
              </h2>
              <button onClick={() => setLevelUpClassChoice(false)} aria-label="Annulla" title="Annulla" style={{ background: "transparent", border: "none", cursor: "pointer", color: C.textMuted, padding: 4 }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textMuted, margin: "0 0 12px" }}>
              Puoi proseguire con la classe attuale, oppure iniziare a multiclassare aggiungendo una nuova classe a questo livello.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "var(--g2)", gap: "0.5rem 1rem", marginBottom: 14 }}>
              <OptionCard selected={false} onClick={chooseLevelUpCurrentClass} title={`${cls.name} ${draft.level + 1}`}>
                <p style={{ fontFamily: "'Spectral', serif", fontStyle: "italic", fontSize: 12.5, color: C.textMuted, margin: 0 }}>Continua a salire con la classe attuale.</p>
              </OptionCard>
            </div>
            <Divider />
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "12px 0 6px" }}>
              Oppure inizia a multiclassare
            </h3>
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "0 0 10px" }}>
              I requisiti minimi (5e 2014) sono indicati per riferimento: l'app non blocca la scelta, la decisione finale spetta al tavolo di gioco.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "var(--g2)", gap: "0.5rem 1rem" }}>
              {CLASSES.filter((c) => c.id !== draft.classId).map((c) => {
                const prereq = checkMulticlassPrereq(finalScoresNow, c.id);
                return (
                  <OptionCard key={c.id} selected={false} onClick={() => chooseLevelUpNewClass(c.id)} title={c.name}>
                    <p style={{ fontFamily: "'Spectral', serif", fontStyle: "italic", fontSize: 12, color: prereq.met ? C.forestDeep : C.wine, margin: 0 }}>
                      Requisito: {prereq.text} {prereq.met ? "✓ soddisfatto" : "✗ non soddisfatto"}
                    </p>
                  </OptionCard>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {levelDownTarget && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "var(--modal-outer-padding)" }}>
          <div style={{ background: C.parchment, padding: "var(--frame-padding)", borderRadius: 4, maxWidth: 480, width: "100%", border: `1px solid ${C.danger}`, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 18, color: C.wineDeep, margin: "0 0 8px" }}>
              Tornare al livello {(levelDownTarget === "primary" ? draft.level : mc?.level) - 1}?
            </h2>
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textMuted, margin: "0 0 16px" }}>
              Non è una regola ufficiale: è pensato per correggere un errore nel livellamento. Perderai le scelte fatte all'ultimo livello (Punti Ferita, ASI/Talento, stile di combattimento) e le eventuali manovre, discipline, invocazioni o opzioni di metamagia in eccesso rispetto al nuovo livello.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <GhostButton onClick={() => setLevelDownTarget(null)} style={{ borderColor: C.parchmentLine, color: C.textMuted }}>
                Annulla
              </GhostButton>
              <button
                onClick={confirmLevelDown}
                style={{ background: C.danger, color: "#fff", border: "none", cursor: "pointer", borderRadius: 3, padding: "0.55rem 1rem", fontFamily: "'Spectral', serif", fontSize: 13 }}
              >
                Sì, torna indietro
              </button>
            </div>
          </div>
        </div>
      )}

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
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textMuted, margin: 0 }}>
            Il personaggio ha una sola classe. Per aggiungerne una seconda, usa "Sali di livello" qui sopra: potrai scegliere se il prossimo livello va alla classe attuale o segna l'inizio di una seconda classe.
          </p>
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
