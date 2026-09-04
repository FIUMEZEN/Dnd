// Piccoli picker di "meccaniche di classe" (ASI/talenti, stile di combattimento, metamagia,
// dono del patto, invocazioni occulte, discipline elementali) riusati da più step della
// creazione, dalla scheda personaggio e dal popup di level up.
import { C } from "../theme";
import { Divider, Pill, OptionCard } from "./primitives";
import { ABILITIES } from "../data/core";
import { FEATS } from "../data/feats";
import { METAMAGIC_OPTIONS, PACT_BOONS, WARLOCK_INVOCATIONS, ELEMENTAL_DISCIPLINES } from "../data/spells";
import {
  getUnlockedAsiLevels, getLevelChoiceType, getFeat,
  getAvailableFightingStyles, getFightingStyleCount, getSelectedFightingStyles,
} from "../lib/character";
import { getMetamagicKnownCount, getInvocationsKnownCount, getDisciplinesKnownCount } from "../lib/casting";

export function AsiPicker({ store, updateStore, clsId, classLevel, onlyLevels }) {
  const allAsiLevels = clsId ? getUnlockedAsiLevels(clsId, classLevel) : [];
  const asiLevels = onlyLevels ? allAsiLevels.filter((l) => onlyLevels.includes(l)) : allAsiLevels;
  if (!asiLevels.length) return null;

  const setAsiPick = (level, idx, value) => {
    updateStore((s) => {
      const current = (s.asiChoices && s.asiChoices[level]) || ["", ""];
      const next = [...current];
      next[idx] = value;
      return { asiChoices: { ...s.asiChoices, [level]: next } };
    });
  };

  const setChoiceType = (level, type) => {
    updateStore((s) => ({
      levelChoiceType: { ...s.levelChoiceType, [level]: type },
      asiChoices: { ...s.asiChoices, [level]: ["", ""] },
      featChoices: { ...s.featChoices, [level]: "" },
      featAbilityChoices: { ...s.featAbilityChoices, [level]: "" },
    }));
  };

  const setFeatPick = (level, featId) => {
    updateStore((s) => ({
      featChoices: { ...s.featChoices, [level]: featId },
      featAbilityChoices: { ...s.featAbilityChoices, [level]: "" },
    }));
  };

  const setFeatAbilityPick = (level, key) => {
    updateStore((s) => ({ featAbilityChoices: { ...s.featAbilityChoices, [level]: key } }));
  };

  return (
    <>
      <Divider />
      <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "1.25rem 0 8px" }}>
        Incrementi di Livello (ASI o Talento)
      </h3>
      <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "0 0 12px" }}>
        Per ogni livello sbloccato scegli: due incrementi da +1 a caratteristiche (anche la stessa due volte, per un totale di +2, max 20), oppure un Talento. Alcuni talenti concedono a loro volta +1 a una caratteristica.
      </p>
      {asiLevels.map((lvl) => {
        const type = getLevelChoiceType(store, lvl);
        const picks = (store.asiChoices && store.asiChoices[lvl]) || ["", ""];
        const featId = (store.featChoices && store.featChoices[lvl]) || "";
        const feat = featId ? getFeat(featId) : null;
        const abilityPick = (store.featAbilityChoices && store.featAbilityChoices[lvl]) || "";
        return (
          <div key={lvl} style={{ marginBottom: 14, padding: "0.7rem 0.8rem", border: `1px solid ${C.parchmentLine}`, borderRadius: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: 12.5, color: C.textOnParchment, minWidth: 90 }}>
                Livello {lvl}
              </span>
              <Pill active={type === "asi"} onClick={() => setChoiceType(lvl, "asi")}>Incremento caratteristiche</Pill>
              <Pill active={type === "feat"} onClick={() => setChoiceType(lvl, "feat")}>Talento</Pill>
            </div>

            {type === "asi" ? (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[0, 1].map((idx) => (
                  <select
                    key={idx}
                    value={picks[idx] || ""}
                    onChange={(e) => setAsiPick(lvl, idx, e.target.value)}
                    style={{
                      fontFamily: "'Spectral', serif", fontSize: 13, padding: "0.35rem 0.5rem",
                      borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff",
                    }}
                  >
                    <option value="">Incremento {idx + 1} — scegli</option>
                    {ABILITIES.map((a) => (
                      <option key={a.key} value={a.key}>{a.name} (+1)</option>
                    ))}
                  </select>
                ))}
              </div>
            ) : (
              <div>
                <select
                  value={featId}
                  onChange={(e) => setFeatPick(lvl, e.target.value)}
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
                {feat && (
                  <div style={{ marginBottom: 8 }}>
                    {feat.prerequisite && (
                      <p style={{ fontFamily: "'Spectral', serif", fontSize: 12, fontStyle: "italic", color: C.wine, margin: "0 0 4px" }}>
                        Prerequisito: {feat.prerequisite}
                      </p>
                    )}
                    <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: 0 }}>{feat.desc}</p>
                  </div>
                )}
                {feat && feat.abilityChoice && (
                  <select
                    value={abilityPick}
                    onChange={(e) => setFeatAbilityPick(lvl, e.target.value)}
                    style={{
                      fontFamily: "'Spectral', serif", fontSize: 13, padding: "0.35rem 0.5rem",
                      borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff",
                    }}
                  >
                    <option value="">{feat.abilityChoice.optional ? "Bonus caratteristica (opzionale) — scegli" : "Bonus caratteristica del talento — scegli"}</option>
                    {ABILITIES.filter((a) => feat.abilityChoice.keys.includes(a.key)).map((a) => (
                      <option key={a.key} value={a.key}>{a.name} (+1)</option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

export function FightingStyleSelector({ store, updateStore, clsId, classLevel, label = "Stile di Combattimento" }) {
  const availableStyles = getAvailableFightingStyles(clsId);
  const maxStyles = getFightingStyleCount(clsId, classLevel, store?.subclassId);
  const selectedStyles = getSelectedFightingStyles(store);

  if (maxStyles === 0 || availableStyles.length === 0) return null;

  const toggleStyle = (styleId) => {
    updateStore((s) => {
      const current = s.fightingStyles || [];
      const isSelected = current.includes(styleId);
      if (isSelected) {
        return { fightingStyles: current.filter((id) => id !== styleId) };
      }
      if (current.length >= maxStyles) {
        // Sostituisci l'ultimo selezionato (o il primo) - per semplicità, non facciamo nulla
        return s;
      }
      return { fightingStyles: [...current, styleId] };
    });
  };

  return (
    <div style={{ marginTop: 12, marginBottom: 12 }}>
      <p style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: C.wineDeep, margin: "0 0 8px" }}>
        {label} ({selectedStyles.length}/{maxStyles} scelti)
      </p>
      <p style={{ fontFamily: "'Spectral', serif", fontSize: 12, color: C.textMuted, margin: "0 0 8px" }}>
        Scegli fino a {maxStyles} stile{maxStyles > 1 ? "i" : ""} di combattimento.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "var(--g2)", gap: "0.5rem" }}>
        {availableStyles.map((style) => {
          const isSelected = selectedStyles.includes(style.id);
          const isFull = selectedStyles.length >= maxStyles && !isSelected;
          return (
            <OptionCard
              key={style.id}
              selected={isSelected}
              onClick={() => {
                if (!isFull || isSelected) toggleStyle(style.id);
              }}
              title={style.name}
              subtitle={isSelected ? "✓ Selezionato" : isFull ? "Limite raggiunto" : "Disponibile"}
            >
              <p style={{ fontFamily: "'Spectral', serif", fontSize: 12, color: C.textMuted, margin: 0 }}>
                {style.desc}
              </p>
            </OptionCard>
          );
        })}
      </div>
    </div>
  );
}

export function MetamagicPicker({ store, updateStore, level }) {
  const known = getMetamagicKnownCount(level);
  if (known <= 0) return null;
  const chosen = store.metamagicIds || [];
  const toggle = (id) => updateStore((s) => {
    const list = s.metamagicIds || [];
    if (list.includes(id)) return { metamagicIds: list.filter((x) => x !== id) };
    if (list.length >= known) return {};
    return { metamagicIds: [...list, id] };
  });
  return (
    <>
      <Divider />
      <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 4px" }}>
        Metamagia — scegline {known} ({chosen.length}/{known})
      </h3>
      <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "0 0 10px" }}>
        Modifica un incantesimo lanciato spendendo Punti Stregoneria. Puoi usare una sola opzione di Metamagia per incantesimo, a meno che la descrizione non dica altrimenti.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 10 }}>
        {METAMAGIC_OPTIONS.map((m) => {
          const active = chosen.includes(m.id);
          return (
            <div
              key={m.id}
              onClick={() => toggle(m.id)}
              style={{
                cursor: "pointer", border: `1px solid ${active ? C.wine : C.parchmentLine}`,
                background: active ? "rgba(122,32,40,0.06)" : "transparent",
                borderRadius: 2, padding: "0.5rem 0.7rem",
                opacity: !active && chosen.length >= known ? 0.5 : 1,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: 12.5, color: C.textOnParchment }}>{m.name}</span>
                <span style={{ fontFamily: "'Spectral', serif", fontSize: 11, color: C.wineDeep, whiteSpace: "nowrap" }}>{m.cost}</span>
              </div>
              <p style={{ fontFamily: "'Spectral', serif", fontSize: 12, color: C.textMuted, margin: "4px 0 0" }}>{m.desc}</p>
            </div>
          );
        })}
      </div>
    </>
  );
}

export function PactBoonPicker({ store, updateStore, level }) {
  if ((level || 1) < 3) return null;
  return (
    <>
      <Divider />
      <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 8px" }}>Dono del Patto</h3>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        {PACT_BOONS.map((p) => (
          <Pill key={p.id} active={store.pactBoonId === p.id} onClick={() => updateStore((s) => ({ pactBoonId: s.pactBoonId === p.id ? null : p.id }))}>
            {p.name}
          </Pill>
        ))}
      </div>
      {store.pactBoonId && (
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "0 0 10px", fontStyle: "italic" }}>
          {PACT_BOONS.find((p) => p.id === store.pactBoonId)?.desc}
        </p>
      )}
    </>
  );
}

export function InvocationPicker({ store, updateStore, level }) {
  const known = getInvocationsKnownCount(level);
  if (known <= 0) return null;
  const chosen = store.invocationIds || [];
  const toggle = (id) => updateStore((s) => {
    const list = s.invocationIds || [];
    if (list.includes(id)) return { invocationIds: list.filter((x) => x !== id) };
    if (list.length >= known) return {};
    return { invocationIds: [...list, id] };
  });
  const available = WARLOCK_INVOCATIONS.filter((i) => i.minLevel <= (level || 1));
  return (
    <>
      <Divider />
      <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 4px" }}>
        Invocazioni Occulte — scegline {known} ({chosen.length}/{known})
      </h3>
      <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "0 0 10px" }}>
        Alcune invocazioni richiedono un Dono del Patto specifico: verifica il prerequisito indicato prima di sceglierle.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
        {available.map((i) => {
          const active = chosen.includes(i.id);
          return (
            <div
              key={i.id}
              onClick={() => toggle(i.id)}
              style={{
                cursor: "pointer", border: `1px solid ${active ? C.wine : C.parchmentLine}`,
                background: active ? "rgba(122,32,40,0.06)" : "transparent",
                borderRadius: 2, padding: "0.5rem 0.7rem",
                opacity: !active && chosen.length >= known ? 0.5 : 1,
              }}
            >
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: 12.5, color: C.textOnParchment }}>{i.name}</div>
              {i.prereq && (
                <div style={{ fontFamily: "'Spectral', serif", fontSize: 11, color: C.wineDeep, fontStyle: "italic" }}>Richiede: {i.prereq}</div>
              )}
              <p style={{ fontFamily: "'Spectral', serif", fontSize: 12, color: C.textMuted, margin: "4px 0 0" }}>{i.desc}</p>
            </div>
          );
        })}
      </div>
    </>
  );
}

export function ElementalDisciplinePicker({ store, updateStore, level, title = "Discipline Elementali" }) {
  const known = getDisciplinesKnownCount(level);
  if (known <= 0) return null;
  const chosen = store.disciplineIds || [];
  const toggle = (id) => updateStore((s) => {
    const list = s.disciplineIds || [];
    if (list.includes(id)) return { disciplineIds: list.filter((x) => x !== id) };
    if (list.length >= known) return {};
    return { disciplineIds: [...list, id] };
  });
  const automatic = ELEMENTAL_DISCIPLINES.filter((d) => d.automatic);
  const available = ELEMENTAL_DISCIPLINES.filter((d) => !d.automatic && d.minLevel <= (level || 1));
  return (
    <div style={{ marginBottom: 18 }}>
      <Divider />
      <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 4px" }}>
        {title} — scegline {known} ({chosen.length}/{known})
      </h3>
      <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "0 0 10px" }}>
        Conosci sempre {automatic.map((d) => d.name).join(", ")} (gratuita, non conta nel totale). Le altre discipline costano Punti Ki ogni volta che le usi.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
        {available.map((d) => {
          const active = chosen.includes(d.id);
          return (
            <div
              key={d.id}
              onClick={() => toggle(d.id)}
              style={{
                cursor: "pointer", border: `1px solid ${active ? C.wine : C.parchmentLine}`,
                background: active ? "rgba(122,32,40,0.06)" : "transparent",
                borderRadius: 2, padding: "0.5rem 0.7rem",
                opacity: !active && chosen.length >= known ? 0.5 : 1,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: 12.5, color: C.textOnParchment }}>{d.name}</span>
                <span style={{ fontFamily: "'Spectral', serif", fontSize: 11, color: C.wineDeep, whiteSpace: "nowrap" }}>{d.kiCost} Ki</span>
              </div>
              <p style={{ fontFamily: "'Spectral', serif", fontSize: 12, color: C.textMuted, margin: "4px 0 0" }}>{d.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
