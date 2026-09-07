// Logica dell'Incontro (Sezione Master): un unico incontro attivo che unisce Personaggi e
// Creature in un ordine di iniziativa condiviso. Le statistiche di combattimento (PF, CA) non
// sono duplicate qui: per i Personaggi arrivano da getCharacterCombatStats (stessa fonte della
// Scheda Personaggio), per le Creature dai loro helper in creature.js — un Combattente
// "character"/"creature" è solo un riferimento + iniziativa + condizioni di questo Incontro.
import { nextUid, getCharacterCombatStats, getTotalCharacterLevel } from "./character";
import { getMaxHp, getCurrentHp, isCreatureDead, getEffectiveXp } from "./creature";
import { mod } from "./format";
import { XP_THRESHOLDS_BY_LEVEL, ENCOUNTER_MULTIPLIERS } from "../data/creatures";

export function emptyEncounter() {
  return { id: null, name: "", round: 1, activeId: null, combatants: [] };
}

// refType: "character" | "creature" | "custom" (un combattente ad-hoc senza scheda, es. una
// guardia generica creata al volo, con solo nome/CA/PF).
export function emptyCombatant(refType, refId = null, name = "") {
  return {
    id: nextUid(),
    refType,
    refId,
    name,
    initiative: null,
    conditions: [],
    customMaxHp: 10,
    customCurrentHp: 10,
    customAc: 10,
  };
}

export function rollD20() {
  return 1 + Math.floor(Math.random() * 20);
}

export function sortCombatantsByInitiative(combatants) {
  return [...combatants].sort((a, b) => {
    const ai = a.initiative == null ? -Infinity : a.initiative;
    const bi = b.initiative == null ? -Infinity : b.initiative;
    return bi - ai;
  });
}

function missingView(combatant, label) {
  return { name: combatant.name || label, ac: null, maxHp: null, currentHp: null, tempHp: 0, dexMod: 0, isDead: false, source: null, missing: true };
}

// Risolve un Combattente nelle statistiche da mostrare/usare in gioco, leggendole sempre dalla
// scheda/creatura di origine (mai una copia): un danno inflitto qui aggiorna la stessa scheda
// che il giocatore vede altrove, e viceversa.
export function getCombatantView(combatant, characters, creatures) {
  if (combatant.refType === "character") {
    const source = characters.find((c) => c.id === combatant.refId);
    if (!source) return missingView(combatant, "Personaggio non trovato");
    const stats = getCharacterCombatStats(source);
    return {
      name: combatant.name || source.name || "Personaggio",
      ac: stats.ac,
      maxHp: stats.maxHp,
      currentHp: stats.currentHp,
      tempHp: stats.tempHp,
      dexMod: stats.dexMod,
      isDead: stats.maxHp != null && (stats.currentHp ?? stats.maxHp) <= 0,
      source,
    };
  }
  if (combatant.refType === "creature") {
    const source = creatures.find((c) => c.id === combatant.refId);
    if (!source) return missingView(combatant, "Creatura non trovata");
    return {
      name: combatant.name || source.name || "Creatura",
      ac: source.ac,
      maxHp: getMaxHp(source),
      currentHp: getCurrentHp(source),
      tempHp: source.tempHp || 0,
      dexMod: mod(source.abilities?.dex ?? 10),
      isDead: isCreatureDead(source),
      source,
    };
  }
  const max = Number(combatant.customMaxHp) || 0;
  const current = combatant.customCurrentHp == null ? max : Math.min(combatant.customCurrentHp, max);
  return {
    name: combatant.name || "Combattente",
    ac: combatant.customAc,
    maxHp: max,
    currentHp: current,
    tempHp: 0,
    dexMod: 0,
    isDead: current <= 0,
    source: null,
  };
}

function getCharacterSources(combatants, characters) {
  return combatants
    .filter((c) => c.refType === "character")
    .map((c) => characters.find((ch) => ch.id === c.refId))
    .filter(Boolean);
}
function getCreatureSources(combatants, creatures) {
  return combatants
    .filter((c) => c.refType === "creature")
    .map((c) => creatures.find((cr) => cr.id === c.refId))
    .filter(Boolean);
}

// Somma le soglie di PE (Facile/Medio/Difficile/Mortale) di ogni Personaggio al suo livello
// totale attuale (DMG 2014, "Soglie di PE per personaggio").
export function getPartyXpThresholds(characterSources) {
  const totals = { easy: 0, medium: 0, hard: 0, deadly: 0 };
  characterSources.forEach((draft) => {
    const level = Math.max(1, Math.min(20, getTotalCharacterLevel(draft) || 1));
    const t = XP_THRESHOLDS_BY_LEVEL[level];
    totals.easy += t.easy;
    totals.medium += t.medium;
    totals.hard += t.hard;
    totals.deadly += t.deadly;
  });
  return totals;
}

export function getMonsterXpTotal(creatureSources) {
  return creatureSources.reduce((sum, cr) => sum + getEffectiveXp(cr), 0);
}

// Moltiplicatore DMG per numero di mostri, corretto di una riga se il gruppo è più piccolo (< 3,
// un grado più pericoloso) o più grande (≥ 6, un grado più clemente) del normale.
export function getEncounterMultiplier(monsterCount, partySize) {
  if (monsterCount <= 0) return 1;
  let idx = ENCOUNTER_MULTIPLIERS.findIndex((tier) => monsterCount <= tier.max);
  if (idx === -1) idx = ENCOUNTER_MULTIPLIERS.length - 1;
  if (partySize > 0 && partySize < 3) idx = Math.min(idx + 1, ENCOUNTER_MULTIPLIERS.length - 1);
  else if (partySize >= 6) idx = Math.max(idx - 1, 0);
  return ENCOUNTER_MULTIPLIERS[idx].mult;
}

export function getEncounterDifficulty(adjustedXp, thresholds) {
  if (adjustedXp >= thresholds.deadly) return "Mortale";
  if (adjustedXp >= thresholds.hard) return "Difficile";
  if (adjustedXp >= thresholds.medium) return "Medio";
  if (adjustedXp >= thresholds.easy) return "Facile";
  return "Sotto la soglia Facile";
}

// Bilanciamento dell'Incontro (DMG 2014): confronta il PE totale dei mostri presenti (corretto
// dal moltiplicatore per il loro numero) con le soglie del gruppo di Personaggi presenti.
export function getEncounterAssessment(combatants, characters, creatures) {
  const characterSources = getCharacterSources(combatants, characters);
  const creatureSources = getCreatureSources(combatants, creatures);

  const thresholds = getPartyXpThresholds(characterSources);
  const rawXp = getMonsterXpTotal(creatureSources);
  const multiplier = getEncounterMultiplier(creatureSources.length, characterSources.length);
  const adjustedXp = Math.round(rawXp * multiplier);
  const difficulty = characterSources.length > 0 ? getEncounterDifficulty(adjustedXp, thresholds) : null;

  return { thresholds, rawXp, multiplier, adjustedXp, difficulty, partySize: characterSources.length, monsterCount: creatureSources.length };
}

// Divide un totale di PE tra N Personaggi il più equamente possibile; il resto della divisione
// va ai primi della lista, così la somma delle quote torna sempre esatta al totale.
export function splitXpEvenly(total, count) {
  if (count <= 0) return [];
  const base = Math.floor(total / count);
  const remainder = total - base * count;
  return Array.from({ length: count }, (_, i) => base + (i < remainder ? 1 : 0));
}
