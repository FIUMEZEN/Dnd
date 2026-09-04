import {
  CASTER_INFO, THIRD_CASTER_INFO, THIRD_CASTER_SLOTS, FULL_CASTER_SLOTS, WARLOCK_PACT,
  MYSTIC_ARCANUM_UNLOCK_LEVEL, METAMAGIC_OPTIONS, WILD_MAGIC_SURGE_TABLE, WARLOCK_INVOCATIONS,
  ELEMENTAL_DISCIPLINES, DIVINE_DOMAINS, PALADIN_OATHS, WARLOCK_PATRONS, DRUID_CIRCLES,
} from "../data/spells";

export function isThirdCaster(clsId, subclassId) {
  return (clsId === "guerriero" && subclassId === "cavaliere-mistico") || (clsId === "ladro" && subclassId === "furfante-arcano");
}

export function getEffectiveCasterInfo(clsId, subclassId) {
  if (CASTER_INFO[clsId]) return CASTER_INFO[clsId];
  if (isThirdCaster(clsId, subclassId)) return THIRD_CASTER_INFO;
  return null;
}

export function getUnlockedArcanumTiers(level) {
  return Object.entries(MYSTIC_ARCANUM_UNLOCK_LEVEL)
    .filter(([, unlockLevel]) => (level || 1) >= unlockLevel)
    .map(([tier]) => Number(tier))
    .sort((a, b) => a - b);
}

export function getMetamagicKnownCount(level) {
  const lvl = level || 1;
  if (lvl >= 17) return 4;
  if (lvl >= 10) return 3;
  if (lvl >= 3) return 2;
  return 0;
}
export function getMetamagic(id) {
  return METAMAGIC_OPTIONS.find((m) => m.id === id) || null;
}

export function rollWildMagicSurge() {
  const roll = 1 + Math.floor(Math.random() * 100);
  const index = Math.min(WILD_MAGIC_SURGE_TABLE.length - 1, Math.floor((roll - 1) / 2));
  return { roll, text: WILD_MAGIC_SURGE_TABLE[index] };
}

export function getInvocationsKnownCount(level) {
  const lvl = level || 1;
  if (lvl >= 18) return 8;
  if (lvl >= 15) return 7;
  if (lvl >= 12) return 6;
  if (lvl >= 9) return 5;
  if (lvl >= 7) return 4;
  if (lvl >= 5) return 3;
  if (lvl >= 2) return 2;
  return 0;
}
export function getInvocation(id) {
  return WARLOCK_INVOCATIONS.find((i) => i.id === id) || null;
}

export function getDivineSmiteDice(slotLevel) {
  return Math.min(5, Math.max(2, (slotLevel || 1) + 1));
}

export function getDisciplinesKnownCount(level) {
  const lvl = level || 1;
  if (lvl >= 17) return 5;
  if (lvl >= 11) return 4;
  if (lvl >= 6) return 3;
  if (lvl >= 3) return 2;
  return 0;
}
export function getElementalDiscipline(id) {
  return ELEMENTAL_DISCIPLINES.find((d) => d.id === id) || null;
}

export function getSpellSlots(clsId, level, subclassId) {
  const lvl = Math.max(1, Math.min(20, level || 1));
  if (isThirdCaster(clsId, subclassId)) {
    const row = THIRD_CASTER_SLOTS[lvl - 1];
    return row.map((total, i) => ({ level: i + 1, total })).filter((s) => s.total > 0);
  }
  if (clsId === "paladino" || clsId === "ranger") {
    if (lvl < 2) return [];
    const eff = Math.ceil(lvl / 2);
    const row = FULL_CASTER_SLOTS[eff - 1].slice(0, 5);
    return row.map((total, i) => ({ level: i + 1, total })).filter((s) => s.total > 0);
  }
  if (CASTER_INFO[clsId] && clsId !== "warlock") {
    const row = FULL_CASTER_SLOTS[lvl - 1];
    return row.map((total, i) => ({ level: i + 1, total })).filter((s) => s.total > 0);
  }
  if (clsId === "warlock") {
    const info = WARLOCK_PACT[lvl - 1];
    return [{ level: info.level, total: info.slots, pact: true }];
  }
  return [];
}

export function getMaxSpellLevel(clsId, level, subclassId) {
  const slots = getSpellSlots(clsId, level, subclassId);
  return slots.length ? Math.max(...slots.map((s) => s.level)) : 0;
}

export function getSpellsLimit(clsId, caster, level, abilityMod) {
  const lvl = Math.max(1, Math.min(20, level || 1));
  if (caster.type === "prepared") {
    const effLevel = caster.halfCaster ? Math.floor(lvl / 2) : lvl;
    return Math.max(1, abilityMod + effLevel);
  }
  if (caster.type === "spellbook") return 6 + (lvl - 1) * 2;
  return caster.known[lvl - 1];
}

export function getTieredSpellIds(source, maxLevelReal) {
  if (!source) return [];
  const ids = [];
  for (let lvl = 1; lvl <= Math.min(maxLevelReal, 5); lvl += 1) {
    (source.spells[lvl] || []).forEach((id) => ids.push(id));
  }
  return ids;
}

export function getDomainSpellIds(domainId, maxLevelReal) {
  return getTieredSpellIds(DIVINE_DOMAINS.find((d) => d.id === domainId), maxLevelReal);
}

export function getOathSpellIds(oathId, maxLevelReal) {
  return getTieredSpellIds(PALADIN_OATHS.find((o) => o.id === oathId), maxLevelReal);
}

export function getPatronSpellIds(patronId, maxLevelReal) {
  return getTieredSpellIds(WARLOCK_PATRONS.find((p) => p.id === patronId), maxLevelReal);
}

export function getCircleSpellIds(circleId, maxLevelReal) {
  return getTieredSpellIds(DRUID_CIRCLES.find((c) => c.id === circleId), maxLevelReal);
}
