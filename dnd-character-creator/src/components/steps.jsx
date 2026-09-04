// Gli step del wizard di creazione: Razza, Classe, Caratteristiche, Background, Equipaggiamento.
// Lo step Incantesimi vive in components/spells.jsx (SpellManager), lo step Riepilogo in
// components/CharacterSheetView.jsx (StepReview, che incorpora la scheda completa).
import { useState, useMemo } from "react";
import { Dices } from "../icons";
import { C } from "../theme";
import { Divider, GhostButton, OptionCard, Pill, ProficiencyChoicePicker } from "./primitives";
import { AsiPicker, FightingStyleSelector } from "./pickers";
import { InventoryManager } from "./inventory";
import { ABILITIES, SKILL_ABILITY, STANDARD_ARRAY } from "../data/core";
import { RACES } from "../data/races";
import { CLASSES, SUBCLASS_CHOICE_LEVEL } from "../data/classes";
import { BACKGROUNDS } from "../data/backgrounds";
import { FEATS } from "../data/feats";
import { mod, fmtMod, ftToM, getPointBuySpent, POINT_BUY_TOTAL, POINT_BUY_COST, rollAbilityScore } from "../lib/format";
import {
  getFeat, toggleProfChoice, getSubclassOptions, getChosenSubclassId, getSubclass,
  hasFightingStyles, getAsiBonus, getRaceBonus, getSelectedBackground, CUSTOM_BACKGROUND_ID,
} from "../lib/character";

// Raggruppa RACES per "famiglia" (es. Nano → Delle Colline / Delle Montagne), nell'ordine in
// cui compaiono in RACES. Le razze senza sottorazze (es. Dragonide) restano famiglie di un solo membro.
export function getRaceFamilies() {
  const families = [];
  RACES.forEach((r) => {
    const famName = r.family || r.name;
    let fam = families.find((f) => f.name === famName);
    if (!fam) { fam = { name: famName, members: [] }; families.push(fam); }
    fam.members.push(r);
  });
  return families;
}

export function StepRace({ draft, setDraft }) {
  const race = RACES.find((r) => r.id === draft.raceId);
  const families = getRaceFamilies();
  const currentFamilyName = race ? (race.family || race.name) : null;
  // Famiglia "aperta" per la scelta della sottorazza: se l'utente non ha ancora cliccato
  // nulla in questa sessione dello step, resta agganciata alla razza già selezionata (se c'è).
  const [browsingFamily, setBrowsingFamily] = useState(null);
  const activeFamilyName = browsingFamily || currentFamilyName;
  const activeFamily = families.find((f) => f.name === activeFamilyName);

  const selectRace = (r) => setDraft((d) => {
    const profChoices = Object.fromEntries(Object.entries(d.profChoices || {}).filter(([k]) => !k.startsWith("razza-")));
    const fixedSkills = r.bonusProficiencies?.skills || [];
    const classSkills = (d.classSkills || []).filter((s) => !fixedSkills.includes(s));
    return { ...d, raceId: r.id, raceAbilityPicks: [], raceSkillPicks: [], halfElfPicks: [], raceFeatId: null, raceFeatAbilityChoice: null, profChoices, classSkills };
  });
  const raceFeat = draft.raceFeatId ? getFeat(draft.raceFeatId) : null;

  return (
    <div>
      <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: C.textOnParchment, margin: "0 0 4px" }}>Scegli la stirpe</h2>
      <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textMuted, margin: "0 0 1.25rem" }}>
        La razza determina bonus alle caratteristiche, velocità e tratti innati.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "var(--g2)", gap: "0.5rem 1.5rem" }}>
        {families.map((fam) => {
          const single = fam.members.length === 1;
          const repr = single ? fam.members[0] : null;
          const selected = single ? draft.raceId === repr.id : activeFamilyName === fam.name;
          return (
            <OptionCard
              key={fam.name}
              selected={selected}
              onClick={() => { if (single) selectRace(repr); setBrowsingFamily(fam.name); }}
              title={fam.name}
              subtitle={single ? Object.entries(repr.bonuses).map(([k, v]) => `${k.toUpperCase()} +${v}`).join(", ") : `${fam.members.length} sottorazze`}
            >
              <p style={{ fontFamily: "'Spectral', serif", fontStyle: "italic", fontSize: 12.5, color: C.textMuted, margin: 0 }}>
                {single ? repr.blurb : fam.members.map((m) => m.subraceName || m.name).join(" · ")}
              </p>
            </OptionCard>
          );
        })}
      </div>

      {activeFamily && activeFamily.members.length > 1 && (
        <div style={{ marginTop: "1.25rem" }}>
          <Divider />
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: C.wineDeep, margin: "0 0 8px" }}>
            Sottorazza — {activeFamily.name}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "var(--g2)", gap: "0.5rem 1.5rem" }}>
            {activeFamily.members.map((r) => (
              <OptionCard
                key={r.id}
                selected={draft.raceId === r.id}
                onClick={() => selectRace(r)}
                title={r.subraceName || r.name}
                subtitle={Object.entries(r.bonuses).map(([k, v]) => `${k.toUpperCase()} +${v}`).join(", ") || "Nessun bonus di caratteristica fisso"}
              >
                <p style={{ fontFamily: "'Spectral', serif", fontStyle: "italic", fontSize: 12.5, color: C.textMuted, margin: 0 }}>{r.blurb}</p>
              </OptionCard>
            ))}
          </div>
        </div>
      )}

      {race && (
        <div style={{ marginTop: "1.25rem" }}>
          <Divider />
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textOnParchment }}>
            <span><b>Taglia:</b> {race.size}</span>
            <span><b>Velocità:</b> {ftToM(race.speed)} m</span>
            <span><b>Scurovisione:</b> {race.dark ? "Sì (18 m)" : "No"}</span>
          </div>
          <ul style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textOnParchment, marginTop: 10, paddingLeft: 18 }}>
            {race.traits.map((t, i) => <li key={i} style={{ marginBottom: 4 }}>{t}</li>)}
          </ul>

          {race.extraAbilityChoice && (
            <div style={{ marginTop: 10 }}>
              <p style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textOnParchment, marginBottom: 8 }}>
                Scegli {race.extraAbilityChoice.count} caratteristiche a cui assegnare +1.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {ABILITIES.filter((a) => !(race.extraAbilityChoice.exclude || []).includes(a.key)).map((a) => {
                  const picks = draft.raceAbilityPicks || [];
                  const picked = picks.includes(a.key);
                  const disabled = !picked && picks.length >= race.extraAbilityChoice.count;
                  return <Pill key={a.key} active={picked} onClick={() => { if (disabled) return; setDraft((d) => ({ ...d, raceAbilityPicks: picked ? (d.raceAbilityPicks || []).filter((k) => k !== a.key) : [...(d.raceAbilityPicks || []), a.key] })); }}>{a.name}</Pill>;
                })}
              </div>
            </div>
          )}
          {race.extraSkillChoice && (
            <div style={{ marginTop: 10 }}>
              <p style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textOnParchment, marginBottom: 8 }}>
                Scegli {race.extraSkillChoice.count} abilità aggiuntive.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {Object.keys(SKILL_ABILITY).map((skill) => {
                  const picks = draft.raceSkillPicks || []; const picked = picks.includes(skill); const disabled = !picked && picks.length >= race.extraSkillChoice.count;
                  return <Pill key={skill} active={picked} onClick={() => { if (disabled) return; setDraft((d) => ({ ...d, raceSkillPicks: picked ? (d.raceSkillPicks || []).filter((k) => k !== skill) : [...(d.raceSkillPicks || []), skill], classSkills: picked ? d.classSkills : (d.classSkills || []).filter((s) => s !== skill) })); }}>{skill}</Pill>;
                })}
              </div>
            </div>
          )}
          {(race.proficiencyChoices || []).map((spec) => (
            <ProficiencyChoicePicker
              key={spec.key}
              spec={spec}
              selected={(draft.profChoices && draft.profChoices[spec.key]) || []}
              onToggle={(value) => toggleProfChoice((fn) => setDraft((d) => ({ ...d, ...fn(d) })), spec, value)}
            />
          ))}
          {race.extraFeatChoice && (
            <div style={{ marginTop: 10 }}>
              <p style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textOnParchment, marginBottom: 8 }}>
                Scegli un talento (bonus di razza).
              </p>
              <select
                value={draft.raceFeatId || ""}
                onChange={(e) => setDraft((d) => ({ ...d, raceFeatId: e.target.value || null, raceFeatAbilityChoice: null }))}
                style={{
                  width: "100%", maxWidth: 420, fontFamily: "'Spectral', serif", fontSize: 13, padding: "0.4rem 0.5rem",
                  borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff", marginBottom: 8,
                }}
              >
                <option value="">— Scegli un talento —</option>
                {FEATS.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              {raceFeat && (
                <div style={{ marginBottom: 8 }}>
                  {raceFeat.prerequisite && (
                    <p style={{ fontFamily: "'Spectral', serif", fontSize: 12, fontStyle: "italic", color: C.wine, margin: "0 0 4px" }}>
                      Prerequisito: {raceFeat.prerequisite}
                    </p>
                  )}
                  <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: 0 }}>{raceFeat.desc}</p>
                </div>
              )}
              {raceFeat && raceFeat.abilityChoice && (
                <select
                  value={draft.raceFeatAbilityChoice || ""}
                  onChange={(e) => setDraft((d) => ({ ...d, raceFeatAbilityChoice: e.target.value || null }))}
                  style={{
                    fontFamily: "'Spectral', serif", fontSize: 13, padding: "0.35rem 0.5rem",
                    borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff",
                  }}
                >
                  <option value="">{raceFeat.abilityChoice.optional ? "Bonus caratteristica (opzionale) — scegli" : "Bonus caratteristica del talento — scegli"}</option>
                  {ABILITIES.filter((a) => raceFeat.abilityChoice.keys.includes(a.key)).map((a) => (
                    <option key={a.key} value={a.key}>{a.name} (+1)</option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------- STEP: CLASS ---------------------------------- */

export function StepClass({ draft, setDraft }) {
  const cls = CLASSES.find((c) => c.id === draft.classId);
  const race = RACES.find((r) => r.id === draft.raceId);
  // Abilità già ottenute dalla razza (competenza fissa o a scelta): non selezionabili di nuovo
  // dalla classe, per evitare di "sprecare" una scelta su una competenza duplicata.
  const raceGrantedSkills = [...(race?.bonusProficiencies?.skills || []), ...(draft.raceSkillPicks || [])];
  const toggleSkill = (skill) => {
    if (raceGrantedSkills.includes(skill)) return;
    setDraft((d) => {
      const has = d.classSkills.includes(skill);
      if (has) return { ...d, classSkills: d.classSkills.filter((s) => s !== skill) };
      if (d.classSkills.length >= cls.skillChoices) return d;
      return { ...d, classSkills: [...d.classSkills, skill] };
    });
  };
  return (
    <div>
      <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: C.textOnParchment, margin: "0 0 4px" }}>Scegli la classe</h2>
      <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textMuted, margin: "0 0 1rem" }}>
        La classe definisce dado vita, competenze e stile di combattimento.
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.25rem" }}>
        <label style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: C.textMuted }}>Livello del personaggio</label>
        <input
          type="range" min={1} max={20} value={draft.level}
          onChange={(e) => setDraft((d) => ({ ...d, level: Number(e.target.value) }))}
          style={{ width: 160 }}
        />
        <span style={{ fontFamily: "'Cinzel', serif", fontSize: 15, color: C.wineDeep, minWidth: 20 }}>{draft.level}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "var(--g2)", gap: "0.5rem 1.5rem" }}>
        {CLASSES.map((c) => (
          <OptionCard
            key={c.id}
            selected={draft.classId === c.id}
            onClick={() => setDraft((d) => ({ ...d, classId: c.id, classSkills: [], asiChoices: {}, levelChoiceType: {}, featChoices: {}, featAbilityChoices: {}, subclassId: null, resourcesUsed: {} }))}
            title={c.name}
            subtitle={`Dado Vita: d${c.hitDie} · ${c.primary}`}
          >
            <p style={{ fontFamily: "'Spectral', serif", fontStyle: "italic", fontSize: 12.5, color: C.textMuted, margin: 0 }}>{c.blurb}</p>
          </OptionCard>
        ))}
      </div>

      {cls && (
        <div style={{ marginTop: "1.25rem" }}>
          <Divider />
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textOnParchment, marginBottom: 12 }}>
            <span><b>Dado vita:</b> d{cls.hitDie}</span>
            <span><b>Tiri salvezza:</b> {cls.saves.join(", ")}</span>
          </div>
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textOnParchment, margin: "0 0 4px" }}>
            <b>Armature:</b> {cls.armor}
          </p>
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textOnParchment, margin: "0 0 14px" }}>
            <b>Armi:</b> {cls.weapons}
          </p>

          <p style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textOnParchment, marginBottom: 8 }}>
            Scegli {cls.skillChoices} competenze ({draft.classSkills.length}/{cls.skillChoices}):
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {cls.skillOptions.map((s) => {
              const grantedByRace = raceGrantedSkills.includes(s);
              return (
                <Pill
                  key={s}
                  active={draft.classSkills.includes(s) || grantedByRace}
                  disabled={grantedByRace}
                  title={grantedByRace ? "Già ottenuta dalla razza" : undefined}
                  onClick={() => toggleSkill(s)}
                >
                  {s}{grantedByRace ? " (razza)" : ""}
                </Pill>
              );
            })}
          </div>

          {/* <-- QUI INSERISCI IL FIGHTING STYLE SELECTOR --> */}
          {cls && hasFightingStyles(cls.id) && (
            <div style={{ marginTop: "1.25rem" }}>
              <Divider />
              <FightingStyleSelector
                store={draft}
                updateStore={(fn) => setDraft((d) => ({ ...d, ...fn(d) }))}
                clsId={cls.id}
                classLevel={draft.level}
                label={`Stile di Combattimento — ${cls.name}`}
              />
            </div>
          )}
        </div>
      )}

      {cls && !["chierico", "paladino", "warlock", "druido"].includes(cls.id) && getSubclassOptions(cls.id).length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <Divider />
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 4px" }}>
            Sottoclasse — {cls.name}
          </h3>
          {draft.level < (SUBCLASS_CHOICE_LEVEL[cls.id] || 3) ? (
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textMuted, margin: 0 }}>
              Disponibile dal livello {SUBCLASS_CHOICE_LEVEL[cls.id] || 3}.
            </p>
          ) : (
            <>
              <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "0 0 10px" }}>
                Scegli la sottoclasse del tuo personaggio.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "var(--g2)", gap: "0.5rem 1rem" }}>
                {getSubclassOptions(cls.id).map((s) => (
                  <OptionCard
                    key={s.id}
                    selected={getChosenSubclassId(draft, cls.id) === s.id}
                    onClick={() => setDraft((d) => {
                      const nextId = d.subclassId === s.id ? null : s.id;
                      const profChoices = Object.fromEntries(Object.entries(d.profChoices || {}).filter(([k]) => !k.startsWith("sub-")));
                      return { ...d, subclassId: nextId, profChoices };
                    })}
                    title={s.name}
                  >
                    <p style={{ fontFamily: "'Spectral', serif", fontStyle: "italic", fontSize: 12.5, color: C.textMuted, margin: 0 }}>{s.blurb}</p>
                  </OptionCard>
                ))}
              </div>
              {(getSubclass(cls.id, draft.subclassId)?.proficiencyChoices || []).map((spec) => (
                <ProficiencyChoicePicker
                  key={spec.key}
                  spec={spec}
                  selected={(draft.profChoices && draft.profChoices[spec.key]) || []}
                  onToggle={(value) => toggleProfChoice((fn) => setDraft((d) => ({ ...d, ...fn(d) })), spec, value)}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------- STEP: ABILITIES ---------------------------------- */

export function StepAbilities({ draft, setDraft }) {
  const race = RACES.find((r) => r.id === draft.raceId);
  const cls = CLASSES.find((c) => c.id === draft.classId);
  const bonus = useMemo(() => getRaceBonus(race, draft.raceAbilityPicks || draft.halfElfPicks), [race, draft.raceAbilityPicks, draft.halfElfPicks]);
  const asiBonus = useMemo(() => getAsiBonus(draft, draft.classId), [draft.asiChoices, draft.levelChoiceType, draft.featChoices, draft.featAbilityChoices, draft.classId, draft.level, draft.raceFeatId, draft.raceFeatAbilityChoice]);

  const pool = draft.abilityMethod === "array" ? STANDARD_ARRAY : draft.rolledPool;
  const usesPool = draft.abilityMethod === "array" || draft.abilityMethod === "roll";

  const usedValues = Object.values(draft.baseScores).filter((v) => v !== "");
  const availableFor = (currentVal) => {
    if (!pool) return [];
    const counts = {};
    pool.forEach((v) => { counts[v] = (counts[v] || 0) + 1; });
    usedValues.forEach((v) => { if (v !== currentVal) counts[v] = (counts[v] || 0) - 1; });
    return pool.filter((v, i) => pool.indexOf(v) === i).filter((v) => counts[v] > 0 || v === currentVal);
  };

  const setMethod = (method) => {
    setDraft((d) => ({
      ...d,
      abilityMethod: method,
      baseScores: { str: "", dex: "", con: "", int: "", wis: "", cha: "" },
      rolledPool: method === "roll" ? d.rolledPool : null,
    }));
  };

  const rollAll = () => {
    const pool6 = Array.from({ length: 6 }, rollAbilityScore);
    setDraft((d) => ({ ...d, rolledPool: pool6, baseScores: { str: "", dex: "", con: "", int: "", wis: "", cha: "" } }));
  };

  const setBase = (key, value) => {
    setDraft((d) => ({ ...d, baseScores: { ...d.baseScores, [key]: value === "" ? "" : Number(value) } }));
  };

  return (
    <div>
      <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: C.textOnParchment, margin: "0 0 4px" }}>Genera le caratteristiche</h2>
      <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textMuted, margin: "0 0 1.25rem" }}>
        Scegli un metodo, poi assegna i punteggi alle sei caratteristiche.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <Pill active={draft.abilityMethod === "array"} onClick={() => setMethod("array")}>Array standard</Pill>
        <Pill active={draft.abilityMethod === "roll"} onClick={() => setMethod("roll")}>Tiro dei dadi</Pill>
        <Pill active={draft.abilityMethod === "custom"} onClick={() => setMethod("custom")}>Point Buy</Pill>
      </div>
      {draft.abilityMethod === "custom" && (
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: getPointBuySpent(draft.baseScores) === POINT_BUY_TOTAL ? C.forestDeep : C.danger, margin: "0 0 16px" }}>
          Point Buy: {getPointBuySpent(draft.baseScores)}/{POINT_BUY_TOTAL} punti spesi. Punteggi consentiti: 8–15 prima dei bonus razziali.
        </p>
      )}

      {draft.abilityMethod === "roll" && (
        <div style={{ marginBottom: 16 }}>
          <GhostButton icon={Dices} onClick={rollAll} style={{ borderColor: C.wine, color: C.wine }}>
            {draft.rolledPool ? "Tira di nuovo (4d6, scarta il minore)" : "Tira i dadi (4d6, scarta il minore)"}
          </GhostButton>
          {draft.rolledPool && (
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textMuted, marginTop: 8 }}>
              Punteggi ottenuti: {[...draft.rolledPool].sort((a, b) => b - a).join(", ")}
            </p>
          )}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "var(--g3)", gap: "0.9rem" }}>
        {ABILITIES.map((a) => {
          const base = draft.baseScores[a.key];
          const final = (base === "" || base === undefined ? 10 : base) + (bonus[a.key] || 0) + (asiBonus[a.key] || 0);
          const showFinal = base !== "" && base !== undefined;
          return (
            <div key={a.key} style={{ border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0.85rem" }}>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: C.textOnParchment, marginBottom: 6 }}>
                {a.name}
                {bonus[a.key] ? <span style={{ color: C.wine }}> +{bonus[a.key]} razza</span> : null}
                {asiBonus[a.key] ? <span style={{ color: C.forestDeep }}> +{asiBonus[a.key]} ASI</span> : null}
              </div>
              {usesPool ? (
                <select
                  value={base === "" || base === undefined ? "" : base}
                  onChange={(e) => setBase(a.key, e.target.value)}
                  disabled={!pool}
                  style={{
                    width: "100%", fontFamily: "'Spectral', serif", fontSize: 14, padding: "0.4rem",
                    borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff",
                  }}
                >
                  <option value="">—</option>
                  {(pool ? [...pool].sort((x, y) => y - x) : []).map((v, i) => (
                    <option
                      key={i}
                      value={v}
                      disabled={v === base || availableFor(base).indexOf(v) === -1}
                    >
                      {v}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={base === "" || base === undefined ? "" : base}
                  onChange={(e) => setBase(a.key, e.target.value === "" ? "" : Number(e.target.value))}
                  style={{ width: "100%", fontFamily: "'Spectral', serif", fontSize: 14, padding: "0.4rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff" }}
                >
                  <option value="">—</option>
                  {Object.keys(POINT_BUY_COST).map((v) => <option key={v} value={v}>{v} ({POINT_BUY_COST[v]} pt)</option>)}
                </select>
              )}
              {showFinal && (
                <div style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, marginTop: 6 }}>
                  Totale {final} ({fmtMod(mod(final))})
                </div>
              )}
            </div>
          );
        })}
      </div>

      {cls && (
        <AsiPicker
          store={draft}
          updateStore={(fn) => setDraft((d) => ({ ...d, ...fn(d) }))}
          clsId={cls.id}
          classLevel={draft.level}
        />
      )}
    </div>
  );
}

/* ---------------------------------- STEP: BACKGROUND ---------------------------------- */

// Campo di testo libero per un aspetto "flavour" del personaggio (tratto, ideale, legame,
// difetto): il giocatore può scrivere liberamente, oppure cliccare un suggerimento tratto
// dalla tabella del background per riempire il campo con un solo click.
export function FlavorField({ label, value, onChange, suggestions }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{ fontFamily: "'Cinzel', serif", fontSize: 12.5, color: C.wineDeep, margin: "0 0 6px" }}>{label}</p>
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        placeholder="Scrivi liberamente, oppure scegli un suggerimento qui sotto…"
        style={{
          width: "100%", fontFamily: "'Spectral', serif", fontSize: 13, padding: "0.5rem 0.6rem",
          borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff", resize: "vertical", boxSizing: "border-box",
        }}
      />
      {suggestions && suggestions.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => onChange(s)}
              title="Usa questo suggerimento"
              style={{
                cursor: "pointer", textAlign: "left", fontFamily: "'Spectral', serif", fontSize: 11.5,
                padding: "0.3rem 0.55rem", borderRadius: 3, border: `1px solid ${C.parchmentLine}`,
                background: "rgba(255,255,255,0.5)", color: C.textMuted, maxWidth: 260,
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function StepBackground({ draft, setDraft }) {
  const bg = getSelectedBackground(draft);
  const isCustom = draft.backgroundId === CUSTOM_BACKGROUND_ID;

  const toggleCustomSkill = (skill) => setDraft((d) => {
    const picks = d.customBackgroundSkills || [];
    const picked = picks.includes(skill);
    if (picked) return { ...d, customBackgroundSkills: picks.filter((s) => s !== skill) };
    if (picks.length >= 2) return d;
    return { ...d, customBackgroundSkills: [...picks, skill] };
  });

  const clearBgProfChoices = (d) => Object.fromEntries(Object.entries(d.profChoices || {}).filter(([k]) => !k.startsWith("bg-")));

  return (
    <div>
      <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: C.textOnParchment, margin: "0 0 4px" }}>Scegli il background</h2>
      <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textMuted, margin: "0 0 1.25rem" }}>
        Racconta da dove viene il personaggio prima dell'avventura.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "var(--g2)", gap: "0.5rem 1.5rem" }}>
        {BACKGROUNDS.map((b) => (
          <OptionCard
            key={b.id}
            selected={draft.backgroundId === b.id}
            onClick={() => setDraft((d) => ({ ...d, backgroundId: b.id, profChoices: clearBgProfChoices(d) }))}
            title={b.name}
            subtitle={b.skills.join(", ")}
          />
        ))}
        <OptionCard
          selected={isCustom}
          onClick={() => setDraft((d) => ({ ...d, backgroundId: CUSTOM_BACKGROUND_ID, profChoices: clearBgProfChoices(d) }))}
          title="Personalizzato"
          subtitle="Costruito da zero"
        >
          <p style={{ fontFamily: "'Spectral', serif", fontStyle: "italic", fontSize: 12.5, color: C.textMuted, margin: 0 }}>
            Definisci competenze, corredo e tratto seguendo la regola "Personalizzare un Background" del PHB 2014.
          </p>
        </OptionCard>
      </div>

      {isCustom && (
        <div style={{ marginTop: "1.25rem" }}>
          <Divider />
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: C.wineDeep, margin: "0 0 8px" }}>Background personalizzato</p>

          <input
            type="text" placeholder="Nome del background (es. Cacciatore di Taglie)"
            value={draft.customBackgroundName || ""}
            onChange={(e) => setDraft((d) => ({ ...d, customBackgroundName: e.target.value }))}
            style={{ width: "100%", fontFamily: "'Spectral', serif", fontSize: 13.5, padding: "0.45rem 0.6rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff", marginBottom: 12, boxSizing: "border-box" }}
          />

          <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textOnParchment, marginBottom: 8 }}>
            Scegli 2 competenze ({(draft.customBackgroundSkills || []).length}/2).
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {Object.keys(SKILL_ABILITY).map((skill) => (
              <Pill key={skill} active={(draft.customBackgroundSkills || []).includes(skill)} onClick={() => toggleCustomSkill(skill)}>
                {skill}
              </Pill>
            ))}
          </div>

          <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textOnParchment, marginBottom: 4 }}>
            Corredo di partenza (una voce per riga)
          </p>
          <textarea
            value={draft.customBackgroundEquipment || ""}
            onChange={(e) => setDraft((d) => ({ ...d, customBackgroundEquipment: e.target.value }))}
            rows={3}
            placeholder={"Es.\nUn set di attrezzi da scasso\nUna borsa con 10 mo"}
            style={{ width: "100%", fontFamily: "'Spectral', serif", fontSize: 13, padding: "0.5rem 0.6rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff", marginBottom: 12, resize: "vertical", boxSizing: "border-box" }}
          />

          <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textOnParchment, marginBottom: 4 }}>
            Strumenti o lingua aggiuntivi (opzionale)
          </p>
          <input
            type="text" placeholder="Es. Strumenti da falegname, oppure una lingua a scelta"
            value={draft.customBackgroundToolsLanguages || ""}
            onChange={(e) => setDraft((d) => ({ ...d, customBackgroundToolsLanguages: e.target.value }))}
            style={{ width: "100%", fontFamily: "'Spectral', serif", fontSize: 13, padding: "0.45rem 0.6rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff", marginBottom: 12, boxSizing: "border-box" }}
          />

          <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textOnParchment, marginBottom: 4 }}>
            Tratto di background — nome
          </p>
          <input
            type="text" placeholder="Es. Rete di Informatori"
            value={draft.customBackgroundFeatureName || ""}
            onChange={(e) => setDraft((d) => ({ ...d, customBackgroundFeatureName: e.target.value }))}
            style={{ width: "100%", fontFamily: "'Spectral', serif", fontSize: 13.5, padding: "0.45rem 0.6rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff", marginBottom: 8, boxSizing: "border-box" }}
          />
          <textarea
            value={draft.customBackgroundFeatureDesc || ""}
            onChange={(e) => setDraft((d) => ({ ...d, customBackgroundFeatureDesc: e.target.value }))}
            rows={2}
            placeholder="Cosa concede meccanicamente o narrativamente questo tratto? Concordalo con il Master."
            style={{ width: "100%", fontFamily: "'Spectral', serif", fontSize: 13, padding: "0.5rem 0.6rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff", resize: "vertical", boxSizing: "border-box" }}
          />
        </div>
      )}

      {!isCustom && bg && (
        <div style={{ marginTop: "1.25rem" }}>
          <Divider />
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textOnParchment, margin: "0 0 4px" }}>
            <b>Tratto — {bg.feature}:</b> {bg.featureDesc}
          </p>
          {(bg.proficiencyChoices || []).map((spec) => (
            <ProficiencyChoicePicker
              key={spec.key}
              spec={spec}
              selected={(draft.profChoices && draft.profChoices[spec.key]) || []}
              onToggle={(value) => toggleProfChoice((fn) => setDraft((d) => ({ ...d, ...fn(d) })), spec, value)}
            />
          ))}
        </div>
      )}

      {bg && (
        <div style={{ marginTop: "1.25rem" }}>
          <Divider />
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: C.wineDeep, margin: "0 0 4px" }}>
            Personalità
          </p>
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 12, color: C.textMuted, margin: "0 0 12px" }}>
            Facoltativo, ma dà spessore al personaggio: due tratti della personalità, un ideale, un legame e un difetto.
          </p>
          <FlavorField label="Tratto della personalità 1" value={draft.personalityTrait1} onChange={(v) => setDraft((d) => ({ ...d, personalityTrait1: v }))} suggestions={bg.personalityTraits} />
          <FlavorField label="Tratto della personalità 2" value={draft.personalityTrait2} onChange={(v) => setDraft((d) => ({ ...d, personalityTrait2: v }))} suggestions={bg.personalityTraits} />
          <FlavorField label="Ideale" value={draft.ideal} onChange={(v) => setDraft((d) => ({ ...d, ideal: v }))} suggestions={bg.ideals} />
          <FlavorField label="Legame" value={draft.bond} onChange={(v) => setDraft((d) => ({ ...d, bond: v }))} suggestions={bg.bonds} />
          <FlavorField label="Difetto" value={draft.flaw} onChange={(v) => setDraft((d) => ({ ...d, flaw: v }))} suggestions={bg.flaws} />
        </div>
      )}
    </div>
  );
}

/* ---------------------------------- STEP: EQUIPMENT ---------------------------------- */

export function StepEquipment({ draft, setDraft }) {
  const cls = CLASSES.find((c) => c.id === draft.classId);
  const bg = getSelectedBackground(draft);

  return (
    <div>
      <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: C.textOnParchment, margin: "0 0 4px" }}>Equipaggiamento</h2>
      <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textMuted, margin: "0 0 1.25rem" }}>
        Il corredo suggerito alla creazione, e l'inventario che puoi aggiornare in ogni momento — anche durante la partita.
      </p>

      {cls && bg ? (
        <div style={{ display: "grid", gridTemplateColumns: "var(--g2)", gap: "1.5rem", marginBottom: 20 }}>
          <div>
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: C.wineDeep, margin: "0 0 8px" }}>Corredo suggerito da {cls.name}</h3>
            <ul style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, paddingLeft: 18, margin: 0 }}>
              {cls.equipment.map((e, i) => <li key={i} style={{ marginBottom: 4 }}>{e}</li>)}
            </ul>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: C.forestDeep, margin: "0 0 8px" }}>Corredo suggerito da {bg.name}</h3>
            <ul style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, paddingLeft: 18, margin: 0 }}>
              {bg.equipment.map((e, i) => <li key={i} style={{ marginBottom: 4 }}>{e}</li>)}
            </ul>
          </div>
        </div>
      ) : (
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textMuted, marginBottom: 20 }}>
          Completa Classe e Background per vedere anche il corredo suggerito.
        </p>
      )}

      <Divider />

      <InventoryManager draft={draft} setDraft={setDraft} />
    </div>
  );
}
