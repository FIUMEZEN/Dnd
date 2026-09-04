import { mod, fmtMod } from "./format";
import { nextUid } from "./character";
import { CR_TABLE } from "../data/creatures";

export function emptyCreature() {
  return {
    id: null,
    name: "",
    size: "media",
    type: "Umanoide",
    typeTag: "",
    alignment: "Non allineato",
    ac: 10,
    acNote: "",
    hp: 10,
    hpFormula: "",
    currentHp: null,
    tempHp: 0,
    speed: { camminare: 9, volare: 0, nuotare: 0, scavare: 0, scalare: 0, volareStazionario: false },
    abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    saveProficiencies: [],
    saveOverrides: {},
    skills: [],
    vulnerabilities: "",
    resistances: "",
    immunities: "",
    conditionImmunities: "",
    senses: { darkvision: 0, blindsight: 0, tremorsense: 0, truesight: 0, passivePerceptionOverride: null },
    languages: "",
    cr: "1",
    xpOverride: null,
    proficiencyBonusOverride: null,
    traits: [],
    actions: [],
    bonusActions: [],
    reactions: [],
    legendaryActionsCount: 0,
    legendaryActionsNote: "",
    legendaryActions: [],
    lairActions: [],
    spellcasting: {
      enabled: false,
      ability: "int",
      saveDCOverride: null,
      attackBonusOverride: null,
      note: "",
      groups: [],
    },
    notes: "",
  };
}

export function emptyTraitEntry() {
  return { id: nextUid(), name: "", desc: "" };
}

export function emptySkillEntry() {
  return { id: nextUid(), name: "", bonus: 0 };
}

export function emptySpellGroup() {
  return { id: nextUid(), label: "A volontà", spellIds: [], customSpells: [] };
}

export function getCrProficiencyBonus(cr) {
  return CR_TABLE[cr]?.pb ?? 2;
}
export function getCrXp(cr) {
  return CR_TABLE[cr]?.xp ?? 0;
}
export function getEffectiveProficiencyBonus(creature) {
  return creature.proficiencyBonusOverride ?? getCrProficiencyBonus(creature.cr);
}
export function getEffectiveXp(creature) {
  return creature.xpOverride ?? getCrXp(creature.cr);
}

export function getSaveBonus(creature, key) {
  const override = creature.saveOverrides?.[key];
  if (override !== undefined && override !== null && override !== "") return Number(override);
  const proficient = (creature.saveProficiencies || []).includes(key);
  return mod(creature.abilities[key]) + (proficient ? getEffectiveProficiencyBonus(creature) : 0);
}

export function getSuggestedSkillBonus(creature, abilityKey, { expertise = false } = {}) {
  const pb = getEffectiveProficiencyBonus(creature);
  return mod(creature.abilities[abilityKey]) + pb * (expertise ? 2 : 1);
}

export function getMaxHp(creature) {
  return Number(creature.hp) || 0;
}
export function getCurrentHp(creature) {
  const max = getMaxHp(creature);
  return creature.currentHp == null ? max : Math.min(creature.currentHp, max);
}
export function isCreatureDead(creature) {
  return getCurrentHp(creature) <= 0;
}

export function getPassivePerception(creature) {
  const override = creature.senses?.passivePerceptionOverride;
  if (override !== undefined && override !== null && override !== "") return Number(override);
  const perceptionSkill = (creature.skills || []).find((s) => s.name === "Percezione");
  const perceptionBonus = perceptionSkill ? Number(perceptionSkill.bonus) || 0 : mod(creature.abilities.wis);
  return 10 + perceptionBonus;
}

export function formatSpeed(speed) {
  if (!speed) return "—";
  const parts = [`${speed.camminare || 0} m`];
  if (speed.volare > 0) parts.push(`volare ${speed.volare} m${speed.volareStazionario ? " (in stazionario)" : ""}`);
  if (speed.nuotare > 0) parts.push(`nuotare ${speed.nuotare} m`);
  if (speed.scavare > 0) parts.push(`scavare ${speed.scavare} m`);
  if (speed.scalare > 0) parts.push(`scalare ${speed.scalare} m`);
  return parts.join(", ");
}

export function formatSenses(creature) {
  const s = creature.senses || {};
  const parts = [];
  if (s.darkvision > 0) parts.push(`scurovisione ${s.darkvision} m`);
  if (s.blindsight > 0) parts.push(`vista cieca ${s.blindsight} m`);
  if (s.tremorsense > 0) parts.push(`percezione tremore ${s.tremorsense} m`);
  if (s.truesight > 0) parts.push(`vista pura ${s.truesight} m`);
  parts.push(`percezione passiva ${getPassivePerception(creature)}`);
  return parts.join(", ");
}

export function getSpellSaveDC(creature) {
  const sc = creature.spellcasting || {};
  if (sc.saveDCOverride !== undefined && sc.saveDCOverride !== null && sc.saveDCOverride !== "") return Number(sc.saveDCOverride);
  return 8 + getEffectiveProficiencyBonus(creature) + mod(creature.abilities[sc.ability || "int"]);
}
export function getSpellAttackBonus(creature) {
  const sc = creature.spellcasting || {};
  if (sc.attackBonusOverride !== undefined && sc.attackBonusOverride !== null && sc.attackBonusOverride !== "") return Number(sc.attackBonusOverride);
  return getEffectiveProficiencyBonus(creature) + mod(creature.abilities[sc.ability || "int"]);
}

export function formatAbilityLine(creature, key) {
  const score = creature.abilities[key];
  return `${score} (${fmtMod(mod(score))})`;
}

export function validateCreature(creature) {
  const errors = [];
  if (!creature.name?.trim()) errors.push("Inserisci il nome della creatura.");
  if (creature.ac === "" || creature.ac === null || Number.isNaN(Number(creature.ac))) errors.push("Inserisci la Classe Armatura.");
  if (creature.hp === "" || creature.hp === null || Number.isNaN(Number(creature.hp))) errors.push("Inserisci i Punti Ferita.");
  const badAbility = ["str", "dex", "con", "int", "wis", "cha"].find((k) => {
    const v = Number(creature.abilities[k]);
    return !Number.isInteger(v) || v < 1 || v > 30;
  });
  if (badAbility) errors.push("Le caratteristiche devono essere punteggi interi tra 1 e 30.");
  return errors;
}
