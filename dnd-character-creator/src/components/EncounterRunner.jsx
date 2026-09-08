// L'Incontro: un unico tracker di combattimento live che unisce Personaggi e Creature in un
// ordine di iniziativa condiviso, con round/turni, PF/CA (letti dalla stessa fonte della Scheda
// Personaggio e della Scheda Creatura, mai duplicati) e condizioni come semplici etichette
// visive (nessuna automazione meccanica — vedi ADR 0004).
import { useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Dices, Plus, Skull, Sword, Trash2, Users, X } from "../icons";
import { C } from "../theme";
import { Frame, GhostButton, GoldButton, HpBar, MetricBox } from "./primitives";
import { HpTracker, DeathSaveTracker, ConcentrationTracker } from "./hp";
import { CONDITIONS, CR_OPTIONS } from "../data/creatures";
import { BESTIARY } from "../data/bestiary";
import { mod, fmtMod } from "../lib/format";
import { computeFinalScores } from "../lib/character";
import { emptyCreature, instantiateFromBestiary } from "../lib/creature";
import {
  emptyCombatant, rollD20, sortCombatantsByInitiative, getCombatantView,
  getEncounterAssessment, splitXpEvenly,
} from "../lib/encounter";

const crSortValue = (cr) => {
  if (!cr.includes("/")) return Number(cr);
  const [num, den] = cr.split("/").map(Number);
  return num / den;
};
const BESTIARY_SORTED = [...BESTIARY].sort((a, b) => crSortValue(a.cr) - crSortValue(b.cr) || a.name.localeCompare(b.name, "it"));

function CombatantIcon({ refType, size = 15, color }) {
  if (refType === "character" || refType === "campaignCharacter") return <Users size={size} color={color} />;
  if (refType === "creature") return <Skull size={size} color={color} />;
  return <Sword size={size} color={color} />;
}

// Controllo PF compatto per le Creature: danno/cura/PF temporanei, senza concentrazione o tiri
// salvezza contro la morte (i mostri, per default RAW, muoiono semplicemente a 0 PF).
function CreatureCombatHp({ creature, maxHp, onUpdate }) {
  const [amount, setAmount] = useState(1);
  const current = creature.currentHp == null ? maxHp : Math.min(creature.currentHp, maxHp);
  const temp = creature.tempHp || 0;

  const applyDamage = () => {
    let dmg = Math.max(0, amount);
    let newTemp = temp;
    if (newTemp > 0) {
      const absorbed = Math.min(newTemp, dmg);
      newTemp -= absorbed;
      dmg -= absorbed;
    }
    onUpdate({ ...creature, currentHp: Math.max(0, current - dmg), tempHp: newTemp });
  };
  const applyHeal = () => onUpdate({ ...creature, currentHp: Math.min(maxHp, current + Math.max(0, amount)) });
  const addTemp = () => onUpdate({ ...creature, tempHp: Math.max(temp, Math.max(0, amount)) });

  return (
    <div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontFamily: "'Cinzel', serif", fontSize: 17, color: current <= maxHp / 3 ? C.danger : C.textOnParchment }}>
          {current} / {maxHp} PF{temp > 0 ? <span style={{ color: C.forestDeep, fontSize: 13 }}> (+{temp} temp)</span> : null}
        </span>
        <input
          type="number" min={0} value={amount}
          onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
          style={{ width: 56, fontFamily: "'Spectral', serif", fontSize: 13, padding: "0.3rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff" }}
        />
        <GhostButton onClick={applyDamage} style={{ borderColor: C.danger, color: C.danger, padding: "0.3rem 0.7rem", fontSize: 12 }}>Danno</GhostButton>
        <GoldButton onClick={applyHeal} style={{ padding: "0.3rem 0.7rem", fontSize: 12 }}>Cura</GoldButton>
        <GhostButton onClick={addTemp} style={{ borderColor: C.forest, color: C.forestDeep, padding: "0.3rem 0.7rem", fontSize: 12 }}>+ Temp</GhostButton>
      </div>
      <HpBar current={current} max={maxHp} temp={temp} />
    </div>
  );
}

// Controllo PF per un Combattente ad-hoc (senza scheda/statblock): i PF vivono direttamente
// sulla voce dell'Incontro.
function CustomCombatHp({ combatant, onChange }) {
  const max = Number(combatant.customMaxHp) || 0;
  const current = combatant.customCurrentHp == null ? max : Math.min(combatant.customCurrentHp, max);
  return (
    <div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <label style={{ display: "flex", gap: 6, alignItems: "center", fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted }}>
          CA
          <input
            type="number" value={combatant.customAc}
            onChange={(e) => onChange({ ...combatant, customAc: Number(e.target.value) || 0 })}
            style={{ width: 48, fontFamily: "'Spectral', serif", fontSize: 13, padding: "0.3rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff" }}
          />
        </label>
        <label style={{ display: "flex", gap: 6, alignItems: "center", fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted }}>
          PF
          <input
            type="number" value={current}
            onChange={(e) => onChange({ ...combatant, customCurrentHp: Math.max(0, Number(e.target.value) || 0) })}
            style={{ width: 56, fontFamily: "'Spectral', serif", fontSize: 13, padding: "0.3rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff" }}
          />
          /
          <input
            type="number" value={max}
            onChange={(e) => onChange({ ...combatant, customMaxHp: Math.max(0, Number(e.target.value) || 0) })}
            style={{ width: 56, fontFamily: "'Spectral', serif", fontSize: 13, padding: "0.3rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff" }}
          />
        </label>
      </div>
      <HpBar current={current} max={max} />
    </div>
  );
}

function ConditionTags({ conditions, onChange }) {
  const [picking, setPicking] = useState(false);
  const [custom, setCustom] = useState("");
  const remove = (label) => onChange(conditions.filter((c) => c !== label));
  const add = (label) => {
    const clean = (label || "").trim();
    if (!clean || conditions.includes(clean)) return;
    onChange([...conditions, clean]);
  };

  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
      {conditions.map((cond) => (
        <span
          key={cond}
          onClick={() => remove(cond)}
          title="Clic per rimuovere"
          style={{
            fontFamily: "'Spectral', serif", fontSize: 11.5, padding: "0.2rem 0.55rem", borderRadius: 10,
            background: "rgba(125, 31, 56, 0.12)", color: C.wineDeep, border: `1px solid ${C.wine}`, cursor: "pointer",
          }}
        >
          {cond} ✕
        </span>
      ))}
      {picking ? (
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <select
            defaultValue=""
            onChange={(e) => { add(e.target.value); setPicking(false); }}
            style={{ fontFamily: "'Spectral', serif", fontSize: 12, padding: "0.25rem 0.4rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff" }}
          >
            <option value="" disabled>Scegli condizione…</option>
            {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            type="text" placeholder="…o libera" value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && custom.trim()) { add(custom); setCustom(""); setPicking(false); } }}
            style={{ width: 100, fontFamily: "'Spectral', serif", fontSize: 12, padding: "0.25rem 0.4rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff" }}
          />
          <GhostButton onClick={() => setPicking(false)} style={{ padding: "0.2rem 0.5rem", fontSize: 11 }}>Fatto</GhostButton>
        </div>
      ) : (
        <GhostButton onClick={() => setPicking(true)} icon={Plus} style={{ padding: "0.2rem 0.55rem", fontSize: 11, borderColor: C.parchmentLine, color: C.textMuted }}>
          Condizione
        </GhostButton>
      )}
    </div>
  );
}

export function EncounterRunner({ encounter, setEncounter, characters, creatures, campaignEntries = [], onUpdateCharacter, onUpdateCreature, onCreateCreature, onBack }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [addCreatureId, setAddCreatureId] = useState("");
  const [addCampaignId, setAddCampaignId] = useState("");
  const [addBestiaryKey, setAddBestiaryKey] = useState("");
  const [quickName, setQuickName] = useState("");
  const [quickCr, setQuickCr] = useState("1");
  const [quickAc, setQuickAc] = useState(12);
  const [quickHp, setQuickHp] = useState(10);
  const [customName, setCustomName] = useState("");
  const [customAc, setCustomAc] = useState(10);
  const [customHp, setCustomHp] = useState(10);
  const [xpOverrides, setXpOverrides] = useState({});
  const [expandedDeadIds, setExpandedDeadIds] = useState(() => new Set());

  const combatants = encounter.combatants || [];
  const usedCreatureIds = new Set(combatants.filter((c) => c.refType === "creature").map((c) => c.refId));
  const usedCampaignIds = new Set(combatants.filter((c) => c.refType === "campaignCharacter").map((c) => c.refId));
  const availableCreatures = creatures.filter((c) => !usedCreatureIds.has(c.id));
  const availableCampaignEntries = campaignEntries.filter((e) => !usedCampaignIds.has(e.character_id));
  const sorted = sortCombatantsByInitiative(combatants);
  const assessment = getEncounterAssessment(combatants, characters, creatures, campaignEntries);
  const characterCombatants = combatants
    .filter((c) => c.refType === "character")
    .map((c) => ({ combatant: c, source: characters.find((ch) => ch.id === c.refId) }))
    .filter((x) => x.source);
  const autoShares = splitXpEvenly(assessment.rawXp, characterCombatants.length);

  const updateCombatant = (id, patch) => {
    setEncounter((e) => ({
      ...e,
      combatants: e.combatants.map((c) => (c.id === id ? { ...c, ...(typeof patch === "function" ? patch(c) : patch) } : c)),
    }));
  };
  const removeCombatant = (id) => {
    setEncounter((e) => ({
      ...e,
      activeId: e.activeId === id ? null : e.activeId,
      combatants: e.combatants.filter((c) => c.id !== id),
    }));
  };

  const addCombatant = (combatant) => setEncounter((e) => ({ ...e, combatants: [...e.combatants, combatant] }));

  const addCreature = () => {
    const source = creatures.find((c) => c.id === addCreatureId);
    if (!source) return;
    addCombatant(emptyCombatant("creature", source.id, source.name));
    setAddCreatureId("");
  };
  const addCampaignCharacter = () => {
    const entry = campaignEntries.find((e) => e.character_id === addCampaignId);
    if (!entry) return;
    addCombatant(emptyCombatant("campaignCharacter", entry.character_id, entry.data?.name));
    setAddCampaignId("");
  };
  // Dal Bestiario direttamente nell'Incontro: clona la voce SRD in una Creatura vera e propria
  // (stessa conversione usata dal pulsante "Usa come base" in Sezione Master → Bestiario),
  // la salva subito nella libreria del Master e la aggiunge come combattente — senza il giro
  // Bestiario → Editor → Salva → torna all'Incontro.
  const addFromBestiary = () => {
    const entry = BESTIARY.find((m) => m.key === addBestiaryKey);
    if (!entry) return;
    const created = onCreateCreature(instantiateFromBestiary(entry));
    addCombatant(emptyCombatant("creature", created.id, created.name));
    setAddBestiaryKey("");
  };
  // Mostro veloce: crea al volo una Creatura vera (non solo un combattente ad-hoc) con un GS,
  // così conta subito nel Bilanciamento dell'Incontro — a differenza del "Combattente ad-hoc"
  // qui sotto, pensato per comparse/ostacoli che non devono influenzare il calcolo dei PE.
  const addQuickMonster = () => {
    if (!quickName.trim()) return;
    const created = onCreateCreature({
      ...emptyCreature(),
      name: quickName.trim(),
      cr: quickCr,
      ac: Number(quickAc) || 10,
      hp: Number(quickHp) || 1,
    });
    addCombatant(emptyCombatant("creature", created.id, created.name));
    setQuickName(""); setQuickCr("1"); setQuickAc(12); setQuickHp(10);
  };
  const addCustom = () => {
    if (!customName.trim()) return;
    const c = emptyCombatant("custom", null, customName.trim());
    c.customAc = Number(customAc) || 10;
    c.customMaxHp = Number(customHp) || 10;
    c.customCurrentHp = c.customMaxHp;
    addCombatant(c);
    setCustomName(""); setCustomAc(10); setCustomHp(10);
  };

  const rollInitiativeFor = (combatant) => {
    const view = getCombatantView(combatant, characters, creatures, campaignEntries);
    const roll = rollD20();
    updateCombatant(combatant.id, { initiative: roll + view.dexMod });
  };
  const rollAllInitiative = () => {
    setEncounter((e) => ({
      ...e,
      combatants: e.combatants.map((c) => {
        const view = getCombatantView(c, characters, creatures, campaignEntries);
        return { ...c, initiative: rollD20() + view.dexMod };
      }),
    }));
  };

  const advanceTurn = () => {
    if (sorted.length === 0) return;
    const idx = sorted.findIndex((c) => c.id === encounter.activeId);
    const nextIdx = idx === -1 ? 0 : (idx + 1) % sorted.length;
    const wrapped = idx !== -1 && nextIdx === 0;
    setEncounter((e) => ({ ...e, activeId: sorted[nextIdx].id, round: wrapped ? (e.round || 1) + 1 : (e.round || 1) }));
  };

  const resetEncounter = () => {
    setEncounter({ id: encounter.id, name: "", round: 1, activeId: null, combatants: [] });
    setConfirmReset(false);
  };

  // Assegna PE: informativo (non determina il level up, sempre manuale — vedi ADR sull'XP) e
  // diviso in automatico tra i PG presenti, ma modificabile per singolo PG prima di confermare.
  const assignXp = () => {
    characterCombatants.forEach(({ source }, i) => {
      const amount = xpOverrides[source.id] ?? autoShares[i] ?? 0;
      if (amount) onUpdateCharacter({ ...source, xp: (source.xp || 0) + amount });
    });
    setXpOverrides({});
  };

  return (
    <div>
      <GhostButton icon={ChevronLeft} onClick={onBack} style={{ marginBottom: 18 }}>Campagna</GhostButton>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: 26, color: C.cream, margin: 0 }}>Incontro</h1>
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.creamMuted, margin: "4px 0 0" }}>
            Round {encounter.round || 1} · {combatants.length} combattenti
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text" placeholder="Nome dell'incontro (opzionale)" value={encounter.name || ""}
            onChange={(e) => setEncounter((en) => ({ ...en, name: e.target.value }))}
            style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, padding: "0.5rem 0.7rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff", minWidth: 200 }}
          />
          <GoldButton icon={Dices} onClick={rollAllInitiative} disabled={combatants.length === 0}>Tira tutte le iniziative</GoldButton>
          <GoldButton icon={ChevronRight} onClick={advanceTurn} disabled={combatants.length === 0}>Turno successivo</GoldButton>
          {confirmReset ? (
            <>
              <GhostButton onClick={resetEncounter} style={{ borderColor: C.wineBright, color: C.wineBright }}>Conferma reset</GhostButton>
              <GhostButton onClick={() => setConfirmReset(false)}>Annulla</GhostButton>
            </>
          ) : (
            <GhostButton icon={Trash2} onClick={() => setConfirmReset(true)} style={{ borderColor: C.wineBright, color: C.wineBright }}>Nuovo Incontro</GhostButton>
          )}
        </div>
      </div>

      {(assessment.partySize > 0 || assessment.monsterCount > 0) && (
        <Frame style={{ marginBottom: 18 }}>
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 10px" }}>Bilanciamento dell'Incontro</h3>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: assessment.difficulty ? 10 : 0 }}>
            <MetricBox label="PE mostri" value={assessment.rawXp} hint={`× ${assessment.multiplier} (${assessment.monsterCount} mostri) = ${assessment.adjustedXp}`} />
            <MetricBox label="Soglia Facile" value={assessment.thresholds.easy} />
            <MetricBox label="Soglia Media" value={assessment.thresholds.medium} />
            <MetricBox label="Soglia Difficile" value={assessment.thresholds.hard} />
            <MetricBox label="Soglia Mortale" value={assessment.thresholds.deadly} />
          </div>
          {assessment.difficulty && (
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: assessment.difficulty === "Mortale" ? C.danger : C.wineDeep, margin: 0 }}>
              Incontro: {assessment.difficulty} (per {assessment.partySize} PG)
            </p>
          )}
        </Frame>
      )}

      {characterCombatants.length > 0 && (
        <Frame style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: 0 }}>
              Assegna PE — {assessment.rawXp} totali dai mostri presenti
            </h3>
            <GoldButton onClick={assignXp} disabled={assessment.rawXp === 0}>Assegna</GoldButton>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {characterCombatants.map(({ source }, i) => (
              <label key={source.id} style={{ display: "flex", gap: 8, alignItems: "center", fontFamily: "'Spectral', serif", fontSize: 13, color: C.textOnParchment }}>
                {source.name || "PG"} ({source.xp || 0} PE attuali)
                <input
                  type="number"
                  value={xpOverrides[source.id] ?? autoShares[i] ?? 0}
                  onChange={(e) => setXpOverrides((prev) => ({ ...prev, [source.id]: Number(e.target.value) || 0 }))}
                  style={{ width: 70, fontFamily: "'Spectral', serif", fontSize: 13, padding: "0.3rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff" }}
                />
              </label>
            ))}
          </div>
        </Frame>
      )}

      <Frame style={{ marginBottom: 18 }}>
        <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 10px" }}>Aggiungi combattenti</h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
          <select
            value={addCreatureId} onChange={(e) => setAddCreatureId(e.target.value)}
            style={{ fontFamily: "'Spectral', serif", fontSize: 13, padding: "0.4rem 0.6rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff" }}
          >
            <option value="">Scegli una Creatura…</option>
            {availableCreatures.map((c) => <option key={c.id} value={c.id}>{c.name || "Senza nome"}</option>)}
          </select>
          <GhostButton icon={Plus} onClick={addCreature} disabled={!addCreatureId} style={{ borderColor: C.wine, color: C.wineDeep }}>Aggiungi Creatura</GhostButton>

          {campaignEntries.length > 0 && (
            <>
              <select
                value={addCampaignId} onChange={(e) => setAddCampaignId(e.target.value)}
                style={{ fontFamily: "'Spectral', serif", fontSize: 13, padding: "0.4rem 0.6rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff" }}
              >
                <option value="">Scegli un PG dalla Campagna…</option>
                {availableCampaignEntries.map((e) => <option key={e.character_id} value={e.character_id}>{e.data?.name || "Senza nome"}</option>)}
              </select>
              <GhostButton icon={Plus} onClick={addCampaignCharacter} disabled={!addCampaignId} style={{ borderColor: C.forest, color: C.forestDeep }}>Aggiungi da Campagna</GhostButton>
            </>
          )}

          <select
            value={addBestiaryKey} onChange={(e) => setAddBestiaryKey(e.target.value)}
            style={{ fontFamily: "'Spectral', serif", fontSize: 13, padding: "0.4rem 0.6rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff", maxWidth: 220 }}
          >
            <option value="">Scegli dal Bestiario…</option>
            {BESTIARY_SORTED.map((m) => <option key={m.key} value={m.key}>{m.name} (GS {m.cr})</option>)}
          </select>
          <GhostButton icon={Plus} onClick={addFromBestiary} disabled={!addBestiaryKey} style={{ borderColor: C.wine, color: C.wineDeep }}>
            Aggiungi dal Bestiario
          </GhostButton>
        </div>

        <p style={{ fontFamily: "'Spectral', serif", fontSize: 12, color: C.textMuted, fontStyle: "italic", margin: "2px 0 10px" }}>
          "Dal Bestiario" e "Mostro veloce" creano una vera Creatura (finisce anche nella tua libreria in Sezione Master e conta nel Bilanciamento PE); il "Combattente ad-hoc" qui sotto resta solo in questo Incontro e non ha un GS.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
          <input
            type="text" placeholder="Mostro veloce (nome)" value={quickName}
            onChange={(e) => setQuickName(e.target.value)}
            style={{ fontFamily: "'Spectral', serif", fontSize: 13, padding: "0.4rem 0.6rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff" }}
          />
          <label style={{ display: "flex", gap: 6, alignItems: "center", fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted }}>
            GS
            <select value={quickCr} onChange={(e) => setQuickCr(e.target.value)} style={{ fontFamily: "'Spectral', serif", fontSize: 13, padding: "0.35rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff" }}>
              {CR_OPTIONS.map((cr) => <option key={cr} value={cr}>{cr}</option>)}
            </select>
          </label>
          <label style={{ display: "flex", gap: 6, alignItems: "center", fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted }}>
            CA
            <input type="number" value={quickAc} onChange={(e) => setQuickAc(e.target.value)} style={{ width: 50, fontFamily: "'Spectral', serif", fontSize: 13, padding: "0.35rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff" }} />
          </label>
          <label style={{ display: "flex", gap: 6, alignItems: "center", fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted }}>
            PF
            <input type="number" value={quickHp} onChange={(e) => setQuickHp(e.target.value)} style={{ width: 56, fontFamily: "'Spectral', serif", fontSize: 13, padding: "0.35rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff" }} />
          </label>
          <GhostButton icon={Plus} onClick={addQuickMonster} disabled={!quickName.trim()} style={{ borderColor: C.wine, color: C.wineDeep }}>Aggiungi mostro</GhostButton>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text" placeholder="Combattente ad-hoc (nome)" value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            style={{ fontFamily: "'Spectral', serif", fontSize: 13, padding: "0.4rem 0.6rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff" }}
          />
          <label style={{ display: "flex", gap: 6, alignItems: "center", fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted }}>
            CA
            <input type="number" value={customAc} onChange={(e) => setCustomAc(e.target.value)} style={{ width: 50, fontFamily: "'Spectral', serif", fontSize: 13, padding: "0.35rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff" }} />
          </label>
          <label style={{ display: "flex", gap: 6, alignItems: "center", fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted }}>
            PF
            <input type="number" value={customHp} onChange={(e) => setCustomHp(e.target.value)} style={{ width: 56, fontFamily: "'Spectral', serif", fontSize: 13, padding: "0.35rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff" }} />
          </label>
          <GhostButton icon={Plus} onClick={addCustom} disabled={!customName.trim()} style={{ borderColor: C.wine, color: C.wineDeep }}>Aggiungi</GhostButton>
        </div>
      </Frame>

      {sorted.length === 0 ? (
        <Frame style={{ textAlign: "center", padding: "3rem 2rem" }}>
          <Sword size={28} color={C.gold} style={{ marginBottom: 10 }} />
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 16, color: C.textOnParchment, margin: 0 }}>Nessun combattente nell'Incontro</p>
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textMuted, margin: "6px 0 0" }}>
            Aggiungi PG dalla Campagna, Creature o combattenti ad-hoc qui sopra per iniziare.
          </p>
        </Frame>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sorted.map((combatant) => {
            const view = getCombatantView(combatant, characters, creatures, campaignEntries);
            const isActive = combatant.id === encounter.activeId;
            const isLocalPg = combatant.refType === "character" && view.source;
            const isCampaignPg = combatant.refType === "campaignCharacter" && view.source;
            const conMod = (isLocalPg || isCampaignPg) ? mod(computeFinalScores(view.source).con) : 0;
            const setCharDraft = (updater) => {
              const next = typeof updater === "function" ? updater(view.source) : updater;
              onUpdateCharacter(next);
            };
            // PG di Campagna: PF/Concentrazione/TS Morte sono un overlay SOLO locale sul
            // combattente (mai scritti sul personaggio sincronizzato né rimandati al giocatore —
            // vedi ADR sulla Campagna). Riusa HpTracker/ConcentrationTracker/DeathSaveTracker
            // senza modificarli, passando un "draft virtuale" costruito dallo snapshot + overlay.
            const campaignDraft = isCampaignPg ? {
              ...view.source,
              currentHp: combatant.campaignCurrentHp,
              tempHp: combatant.campaignTempHp || 0,
              concentration: combatant.campaignConcentration,
              deathSaves: combatant.campaignDeathSaves,
            } : null;
            const setCampaignDraft = (updater) => {
              const next = typeof updater === "function" ? updater(campaignDraft) : updater;
              updateCombatant(combatant.id, {
                campaignCurrentHp: next.currentHp,
                campaignTempHp: next.tempHp,
                campaignConcentration: next.concentration,
                campaignDeathSaves: next.deathSaves,
              });
            };

            // I mostri/combattenti ad-hoc "morti" (0 PF, RAW) si comprimono di default per
            // ridurre lo scrolling con molti nemici — i PG restano sempre espansi perché a 0 PF
            // servono i Tiri Salvezza contro la Morte, non la semplice rimozione dalla vista.
            const collapsible = view.isDead && (combatant.refType === "creature" || combatant.refType === "custom");
            const collapsed = collapsible && !expandedDeadIds.has(combatant.id);
            const toggleDeadExpanded = () => setExpandedDeadIds((prev) => {
              const next = new Set(prev);
              if (next.has(combatant.id)) next.delete(combatant.id); else next.add(combatant.id);
              return next;
            });

            return (
              <Frame key={combatant.id} style={{ padding: collapsed ? "0.6rem 1.25rem" : "1rem 1.25rem", border: isActive ? `2px solid ${C.gold}` : undefined, opacity: collapsed ? 0.7 : 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: collapsed ? 0 : 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <CombatantIcon refType={combatant.refType} color={C.wine} />
                    {isActive && (
                      <span style={{ fontFamily: "'Cinzel', serif", fontSize: 11, color: C.inkDeep, background: C.gold, borderRadius: 10, padding: "0.15rem 0.5rem", letterSpacing: 0.5 }}>
                        ▶ TURNO
                      </span>
                    )}
                    <span style={{ fontFamily: "'Cinzel', serif", fontSize: 16, color: view.isDead ? C.danger : C.textOnParchment }}>
                      {view.name}{view.isDead ? " · MORTO" : ""}{view.missing ? " (mancante)" : ""}
                    </span>
                    {view.ac != null && !collapsed && (
                      <span style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted }}>CA {view.ac}</span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {collapsible && (
                      <GhostButton onClick={toggleDeadExpanded} style={{ padding: "0.3rem 0.5rem", fontSize: 12, borderColor: C.parchmentLine, color: C.textMuted }}>
                        {collapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
                      </GhostButton>
                    )}
                    {!collapsed && (
                      <>
                        <label style={{ display: "flex", gap: 6, alignItems: "center", fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted }}>
                          Iniziativa
                          <input
                            type="number" value={combatant.initiative ?? ""}
                            onChange={(e) => updateCombatant(combatant.id, { initiative: e.target.value === "" ? null : Number(e.target.value) })}
                            style={{ width: 52, fontFamily: "'Cinzel', serif", fontSize: 14, padding: "0.3rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff", textAlign: "center" }}
                          />
                        </label>
                        <GhostButton onClick={() => rollInitiativeFor(combatant)} style={{ padding: "0.3rem 0.5rem", fontSize: 12, borderColor: C.parchmentLine }}>
                          🎲{view.dexMod ? ` ${fmtMod(view.dexMod)}` : ""}
                        </GhostButton>
                      </>
                    )}
                    <button onClick={() => removeCombatant(combatant.id)} aria-label="Rimuovi dall'Incontro" style={{ background: "transparent", border: "none", cursor: "pointer", color: C.danger, padding: 4 }}>
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {collapsed && (
                  <p style={{ fontFamily: "'Spectral', serif", fontSize: 12, color: C.textMuted, margin: "4px 0 0" }}>
                    0 / {view.maxHp} PF
                  </p>
                )}

                {!collapsed && (
                <div style={{ marginBottom: 10 }}>
                  <ConditionTags conditions={combatant.conditions || []} onChange={(next) => updateCombatant(combatant.id, { conditions: next })} />
                </div>
                )}

                {!collapsed && isLocalPg && (
                  <>
                    <HpTracker maxHp={view.maxHp} draft={view.source} setDraft={setCharDraft} conMod={conMod} />
                    <DeathSaveTracker draft={view.source} setDraft={setCharDraft} maxHp={view.maxHp} />
                    <ConcentrationTracker draft={view.source} setDraft={setCharDraft} />
                  </>
                )}
                {!collapsed && isCampaignPg && (
                  <>
                    <p style={{ fontFamily: "'Spectral', serif", fontSize: 11, color: C.textMuted, fontStyle: "italic", margin: "0 0 6px" }}>
                      PG di Campagna: i PF qui sotto sono solo per te, non toccano la scheda del giocatore.
                    </p>
                    <HpTracker maxHp={view.maxHp} draft={campaignDraft} setDraft={setCampaignDraft} conMod={conMod} />
                    <DeathSaveTracker draft={campaignDraft} setDraft={setCampaignDraft} maxHp={view.maxHp} />
                    <ConcentrationTracker draft={campaignDraft} setDraft={setCampaignDraft} />
                  </>
                )}
                {!collapsed && combatant.refType === "creature" && view.source && (
                  <CreatureCombatHp creature={view.source} maxHp={view.maxHp} onUpdate={onUpdateCreature} />
                )}
                {!collapsed && combatant.refType === "custom" && (
                  <CustomCombatHp combatant={combatant} onChange={(next) => updateCombatant(combatant.id, next)} />
                )}
                {!collapsed && view.missing && (
                  <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.danger, margin: 0 }}>
                    La scheda originale non è più disponibile (probabilmente eliminata). Rimuovi questo combattente dall'Incontro.
                  </p>
                )}
              </Frame>
            );
          })}
        </div>
      )}
    </div>
  );
}
