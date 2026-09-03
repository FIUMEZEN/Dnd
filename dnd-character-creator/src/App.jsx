import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Sword, Shield, Wand2, ScrollText, Users, Save, Trash2, Plus,
  ChevronLeft, ChevronRight, Dices, BookOpen, Crown, Feather,
  Backpack, Check, X, Sparkles, Skull, Loader2, Pencil,
} from "./icons";
import { ABILITIES, STANDARD_ARRAY, LANGUAGES, ARTISAN_TOOLS, GAMING_SETS, MUSICAL_INSTRUMENTS, SKILL_ABILITY } from "./data/core";
import { RACES } from "./data/races";
import {
  CLASSES, SUBCLASS_CHOICE_LEVEL, SUBCLASS_AVAILABILITY_MESSAGE, ASI_LEVELS_BY_CLASS,
  MULTICLASS_PREREQS, MULTICLASS_PROFICIENCIES, MULTICLASS_WEAPON_PROFICIENCY, MULTICLASS_BONUS_SKILL_CLASS,
  BASE_CLASS_FEATURES, FIGHTING_STYLES, FIGHTING_STYLE_CLASSES, FIGHTING_STYLE_LEVEL,
} from "./data/classes";
import { SUBCLASSES } from "./data/subclasses";
import { BACKGROUNDS } from "./data/backgrounds";
import { FEATS } from "./data/feats";
import {
  CASTER_INFO, THIRD_CASTER_INFO, THIRD_CASTER_SLOTS, FULL_CASTER_SLOTS, WARLOCK_PACT,
  MYSTIC_ARCANUM_UNLOCK_LEVEL, METAMAGIC_OPTIONS, WILD_MAGIC_SURGE_TABLE, WARLOCK_INVOCATIONS,
  PACT_BOONS, ELEMENTAL_DISCIPLINES, MAX_DATA_SPELL_LEVEL, SCHOOLS, SPELLS,
  WARLOCK_PATRONS, DIVINE_DOMAINS, PALADIN_OATHS, DRUID_CIRCLES,
} from "./data/spells";
import { WEAPON_NAME_TO_ID, EQUIPMENT_CATALOG } from "./data/equipment";

/* ---------------------------------- TOKENS ---------------------------------- */

const C = {
  ink: "#1b1613",
  inkDeep: "#130f0d",
  inkPanel: "#241d18",
  parchment: "#efe6d2",
  parchmentDark: "#e1d3ac",
  parchmentLine: "#c9b98d",
  wine: "#7d1f38",
  wineDeep: "#5e1729",
  forest: "#2f5c48",
  forestDeep: "#213f33",
  gold: "#c9a227",
  goldSoft: "#e0c165",
  textOnParchment: "#2b2117",
  textMuted: "#6b5c46",
  cream: "#f1e9d8",
  creamMuted: "#c9bda4",
  danger: "#a4372f",
};

const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Spectral:ital,wght@0,400;0,500;0,600;1,400&display=swap');";

/* ---------------------------------- DATA ---------------------------------- */


function checkMulticlassPrereq(finalScores, clsId) {
  const req = MULTICLASS_PREREQS[clsId];
  if (!req) return { met: true, text: "Nessun requisito." };
  const fmt = (c) => `${ABILITIES.find((a) => a.key === c.key)?.name} ${c.score}+`;
  if (req.all) {
    const met = req.all.every((c) => (finalScores[c.key] || 0) >= c.score);
    return { met, text: req.all.map(fmt).join(" e ") };
  }
  if (req.any) {
    const met = req.any.some((c) => (finalScores[c.key] || 0) >= c.score);
    return { met, text: req.any.map(fmt).join(" o ") };
  }
  return { met: true, text: "Nessun requisito." };
}

function getTotalCharacterLevel(draft) {
  return (draft.level || 1) + (draft.multiclass && draft.multiclass.classId ? (draft.multiclass.level || 1) : 0);
}

function getMulticlassCasterLevelContribution(clsId, level, subclassId) {
  if (!clsId || !level || clsId === "warlock") return 0;
  const caster = getEffectiveCasterInfo(clsId, subclassId);
  if (!caster) return 0;
  if (isThirdCaster(clsId, subclassId)) return Math.floor(level / 3);
  if (caster.halfCaster) return Math.floor(level / 2);
  return level;
}

// Restituisce l'elenco delle "voci di classe" del personaggio (classe primaria + eventuale
// classe secondaria da multiclasse), ciascuna col proprio id, livello e sottoclasse.
function getClassEntries(draft) {
  const entries = [];
  if (draft.classId) entries.push({ classId: draft.classId, level: draft.level || 1, subclassId: getChosenSubclassId(draft, draft.classId), store: draft, isPrimary: true });
  if (draft.multiclass && draft.multiclass.classId) {
    entries.push({ classId: draft.multiclass.classId, level: draft.multiclass.level || 1, subclassId: getChosenSubclassId(draft.multiclass, draft.multiclass.classId), store: draft.multiclass, isPrimary: false });
  }
  return entries;
}

// Slot incantesimo effettivi del personaggio: se ha una sola classe si comporta come
// sempre (tabella della classe); se è multiclassato, combina i livelli da incantatore
// secondo la Tabella Incantatore Multiclasse (5e 2014), tenendo il Patto Magico del
// Warlock sempre separato.
function getEffectiveSpellSlots(draft) {
  const entries = getClassEntries(draft);
  if (entries.length <= 1) {
    const e = entries[0];
    return e ? getSpellSlots(e.classId, e.level, e.subclassId) : [];
  }
  const warlockEntry = entries.find((e) => e.classId === "warlock");
  const others = entries.filter((e) => e.classId !== "warlock");
  const combinedLevel = others.reduce((sum, e) => sum + getMulticlassCasterLevelContribution(e.classId, e.level, e.subclassId), 0);
  let slots = [];
  if (combinedLevel > 0) {
    const lvl = Math.max(1, Math.min(20, combinedLevel));
    const row = FULL_CASTER_SLOTS[lvl - 1];
    slots = row.map((total, i) => ({ level: i + 1, total })).filter((s) => s.total > 0);
  }
  if (warlockEntry) {
    slots = [...slots, ...getSpellSlots("warlock", warlockEntry.level, warlockEntry.subclassId)];
  }
  return slots;
}


function getSubclassOptions(clsId) {
  return SUBCLASSES[clsId] || [];
}

function getChosenSubclassId(draft, clsId) {
  if (clsId === "chierico") return draft.domainId;
  if (clsId === "paladino") return draft.oathId;
  if (clsId === "warlock") return draft.patronId;
  if (clsId === "druido") return draft.circleId;
  return draft.subclassId;
}

function getSubclass(clsId, subclassId) {
  return getSubclassOptions(clsId).find((s) => s.id === subclassId) || null;
}

function getUnlockedSubclassFeatures(clsId, subclassId, level) {
  const sub = getSubclass(clsId, subclassId);
  if (!sub) return [];
  return sub.features.filter((f) => f.level <= (level || 1)).sort((a, b) => a.level - b.level);
}

function getCritRange(clsId, subclassId, level) {
  if (clsId === "guerriero" && subclassId === "campione") {
    if ((level || 1) >= 15) return "18-20";
    if ((level || 1) >= 3) return "19-20";
  }
  return "20";
}

function getRageUses(level) {
  const lvl = level || 1;
  if (lvl >= 20) return "Illimitati";
  if (lvl >= 17) return 6;
  if (lvl >= 12) return 5;
  if (lvl >= 6) return 4;
  if (lvl >= 3) return 3;
  return 2;
}

function getKiPoints(level) {
  const lvl = level || 1;
  return lvl >= 2 ? lvl : 0;
}

function getExpertiseCount(clsId, level) {
  const lvl = level || 1;
  if (clsId === "ladro") return lvl >= 6 ? 4 : lvl >= 1 ? 2 : 0;
  if (clsId === "bardo") return lvl >= 10 ? 4 : lvl >= 2 ? 2 : 0;
  return 0;
}

/* ------------------------------- CARATTERISTICHE DI CLASSE (testuali) ------------------------------- */
// Feature base di classe (non di sottoclasse) che non sono già coperte da una risorsa
// tracciabile o da una voce numerica in "Meccaniche di classe": qui compaiono solo a scopo
// di consultazione rapida durante il gioco.
function getBaseClassFeatures(clsId, level) {
  const list = BASE_CLASS_FEATURES[clsId] || [];
  return list.filter((f) => f.level <= (level || 1));
}

function getBaseClassResources(clsId, level, mysticArcanum, chaMod) {
  const resources = [];
  const lvl = level || 1;
  if (clsId === "guerriero") {
    resources.push({ key: "scatto-avanti", name: `Scatto in Avanti (recupera 1d10+${lvl} PF)`, max: 1, resetOn: "short" });
    if (lvl >= 2) {
      resources.push({ key: "azione-impetuosa", name: "Azione Impetuosa (azione extra nel turno)", max: lvl >= 17 ? 2 : 1, resetOn: "short" });
    }
    if (lvl >= 9) {
      resources.push({ key: "indomabile", name: "Indomabile (ripeti un TS fallito)", max: lvl >= 17 ? 3 : lvl >= 13 ? 2 : 1, resetOn: "long" });
    }
  }
  if (clsId === "barbaro") {
    const uses = getRageUses(level);
    resources.push({ key: "ira", name: "Usi dell'Ira", max: uses === "Illimitati" ? null : uses, resetOn: "long" });
  }
  if (clsId === "monaco") {
    const ki = getKiPoints(level);
    if (ki > 0) resources.push({ key: "ki", name: "Punti Ki", max: ki, resetOn: "short" });
  }
  if (clsId === "bardo" && lvl >= 1) {
    const die = getBardicInspirationDie(lvl);
    resources.push({ key: "ispirazione-bardica", name: `Ispirazione Bardica (${die})`, max: Math.max(1, chaMod || 0), resetOn: lvl >= 5 ? "short" : "long" });
  }
  if (clsId === "mago" && lvl >= 1) {
    resources.push({ key: "recupero-arcano", name: `Recupero Arcano (slot per un totale di ${Math.max(1, Math.ceil(lvl / 2))} livelli, max 5°)`, max: 1, resetOn: "long" });
  }
  if (clsId === "ladro" && lvl >= 20) {
    resources.push({ key: "colpo-fortuna", name: "Colpo di Fortuna", max: 1, resetOn: "short" });
  }
  if (clsId === "chierico" && lvl >= 2) {
    const uses = lvl >= 18 ? 3 : lvl >= 6 ? 2 : 1;
    resources.push({ key: "channel-divinity", name: "Channel Divinity", max: uses, resetOn: "short" });
  }
  if (clsId === "paladino" && lvl >= 3) {
    resources.push({ key: "channel-divinity", name: "Channel Divinity", max: 1, resetOn: "short" });
  }
  if (clsId === "paladino" && lvl >= 1) {
    resources.push({ key: "imposizione-mani", name: "Imposizione delle Mani", max: lvl * 5, resetOn: "long", pool: true });
    resources.push({ key: "percezione-divina", name: "Percezione Divina", max: Math.max(0, 1 + (chaMod || 0)), resetOn: "long" });
  }
  if (clsId === "druido" && lvl >= 2) {
    resources.push({ key: "forma-selvaggia", name: "Usi della Forma Selvaggia", max: 2, resetOn: "short" });
  }
  if (clsId === "warlock") {
    getUnlockedArcanumTiers(lvl).forEach((tier) => {
      if (mysticArcanum && mysticArcanum[tier]) {
        resources.push({ key: `arcano-mistico-${tier}`, name: `Arcano Mistico (${tier}° livello)`, max: 1, resetOn: "long" });
      }
    });
  }
  return resources;
}

function getSubclassResources(clsId, subclassId, level) {
  const resources = [];
  const lvl = level || 1;
  if (clsId === "guerriero" && subclassId === "maestro-di-battaglia" && lvl >= 3) {
    const count = lvl >= 15 ? 6 : lvl >= 7 ? 5 : 4;
    const die = lvl >= 18 ? "d12" : lvl >= 10 ? "d10" : "d8";
    resources.push({ key: "dadi-superiorita", name: `Dadi Superiorità (${die})`, max: count, resetOn: "short" });
  }
  if (clsId === "mago" && subclassId === "evocazione" && lvl >= 14) {
    resources.push({ key: "sovraccarico", name: "Sovraccarico (gratuito)", max: 1, resetOn: "long" });
  }
  if (clsId === "mago" && subclassId === "illusione" && lvl >= 10) {
    resources.push({ key: "se-illusorio", name: "Sé Illusorio", max: 1, resetOn: "short" });
  }
  if (clsId === "mago" && subclassId === "divinazione" && lvl >= 2) {
    resources.push({ key: "presagio", name: "Presagio (2d20 da assegnare)", max: lvl >= 14 ? 3 : 2, resetOn: "long" });
  }
  if (clsId === "mago" && subclassId === "ammaliamento" && lvl >= 6) {
    resources.push({ key: "fascino-istintivo", name: "Fascino Istintivo", max: 1, resetOn: "long" });
  }
  if (clsId === "mago" && subclassId === "trasmutazione" && lvl >= 10) {
    resources.push({ key: "mutaforma", name: "Mutaforma (Polimorfia gratuita)", max: 1, resetOn: "short" });
  }
  if (clsId === "stregone" && subclassId === "magia-selvaggia" && lvl >= 1) {
    resources.push({ key: "maree-del-caos", name: "Maree del Caos", max: 1, resetOn: "long" });
  }
  if (clsId === "warlock" && subclassId === "arcifatato") {
    if (lvl >= 1) resources.push({ key: "presenza-fatata", name: "Presenza Fatata", max: 1, resetOn: "short" });
    if (lvl >= 6) resources.push({ key: "fuga-nebbiosa", name: "Fuga Nebbiosa", max: 1, resetOn: "short" });
    if (lvl >= 14) resources.push({ key: "delirio-oscuro", name: "Delirio Oscuro", max: 1, resetOn: "short" });
  }
  if (clsId === "warlock" && subclassId === "demone") {
    if (lvl >= 6) resources.push({ key: "fortuna-essere-oscuro", name: "Fortuna dell'Essere Oscuro", max: 1, resetOn: "short" });
    if (lvl >= 14) resources.push({ key: "scaraventare-inferno", name: "Scaraventare all'Inferno", max: 1, resetOn: "long" });
  }
  if (clsId === "warlock" && subclassId === "grande-antico" && lvl >= 6) {
    resources.push({ key: "barriera-entropica", name: "Barriera Entropica", max: 1, resetOn: "short" });
  }
  return resources;
}

function getAllClassResources(clsId, subclassId, level, mysticArcanum, chaMod) {
  return [...getBaseClassResources(clsId, level, mysticArcanum, chaMod), ...getSubclassResources(clsId, subclassId, level)];
}

// Aggrega tutte le competenze "bonus" (fisse o a scelta) concesse da razza, background e
// sottoclasse: armature, armi, strumenti, lingue e abilità. Le competenze base della classe
// (armor/weapons in prosa su CLASSES) restano a parte, mostrate come testo esistente.
function getGrantedProficiencies(draft) {
  const race = RACES.find((r) => r.id === draft.raceId);
  const bg = getSelectedBackground(draft);
  const cls = CLASSES.find((c) => c.id === draft.classId);
  const subclass = cls ? getSubclass(cls.id, getChosenSubclassId(draft, cls.id)) : null;
  const profChoices = draft.profChoices || {};

  const skills = new Set(), armor = new Set(), weapons = new Set(), tools = new Set(), languages = new Set(), other = new Set();

  const addBonus = (bonus) => {
    if (!bonus) return;
    (bonus.skills || []).forEach((s) => skills.add(s));
    (bonus.armor || []).forEach((s) => armor.add(s));
    (bonus.weapons || []).forEach((s) => weapons.add(s));
    (bonus.tools || []).forEach((s) => tools.add(s));
    (bonus.languages || []).forEach((s) => languages.add(s));
    (bonus.other || []).forEach((s) => other.add(s));
  };
  const addChoices = (specs) => {
    (specs || []).forEach((spec) => {
      (profChoices[spec.key] || []).forEach((value) => {
        if (spec.type === "skill") skills.add(value);
        else if (spec.type === "language") languages.add(value);
        else if (spec.type === "tool") tools.add(value);
      });
    });
  };

  addBonus(race?.bonusProficiencies);
  addChoices(race?.proficiencyChoices);
  addBonus(bg?.bonusProficiencies);
  addChoices(bg?.proficiencyChoices);
  addBonus(subclass?.bonusProficiencies);
  addChoices(subclass?.proficiencyChoices);

  return {
    skills: [...skills], armor: [...armor], weapons: [...weapons],
    tools: [...tools], languages: [...languages], other: [...other],
  };
}

// Una competenza bonus testuale (razza/sottoclasse) può coprire un'intera categoria ("Armi da
// guerra" / "Armi semplici") oppure un'arma specifica nominata per esteso.
function bonusGrantsWeapon(bonusWeaponsList, item) {
  return (bonusWeaponsList || []).some((label) => {
    const norm = label.trim().toLowerCase();
    if (norm === "armi da guerra") return item.tier === "guerra";
    if (norm === "armi semplici") return item.tier === "semplice";
    return WEAPON_NAME_TO_ID[norm] === item.id;
  });
}

function classGrantsWeapon(weaponProficiency, item) {
  if (!weaponProficiency) return false;
  if (weaponProficiency.simple && item.tier === "semplice") return true;
  if (weaponProficiency.martial && item.tier === "guerra") return true;
  return (weaponProficiency.specific || []).includes(item.id);
}

// Competenza reale con una data arma, usata per decidere se il bonus di competenza va aggiunto
// al tiro per colpire: combina classe primaria (piena), classe secondaria da multiclasse (ridotta,
// tabella PHB), razza e sottoclasse (mai ridotte dal multiclasse, quindi controllate anche per
// l'eventuale classe secondaria).
function isProficientWithWeapon(draft, item) {
  if (!item || item.category !== "arma") return true;
  const cls = CLASSES.find((c) => c.id === draft.classId);
  if (classGrantsWeapon(cls?.weaponProficiency, item)) return true;

  const race = RACES.find((r) => r.id === draft.raceId);
  if (bonusGrantsWeapon(race?.bonusProficiencies?.weapons, item)) return true;

  const subclass = cls ? getSubclass(cls.id, getChosenSubclassId(draft, cls.id)) : null;
  if (bonusGrantsWeapon(subclass?.bonusProficiencies?.weapons, item)) return true;

  const mc = draft.multiclass && draft.multiclass.classId ? draft.multiclass : null;
  if (mc) {
    if (classGrantsWeapon(MULTICLASS_WEAPON_PROFICIENCY[mc.classId], item)) return true;
    const mcCls = CLASSES.find((c) => c.id === mc.classId);
    const mcSubclass = mcCls ? getSubclass(mcCls.id, getChosenSubclassId(mc, mcCls.id)) : null;
    if (bonusGrantsWeapon(mcSubclass?.bonusProficiencies?.weapons, item)) return true;
  }

  return false;
}

const CUSTOM_BACKGROUND_ID = "personalizzato";

// Restituisce il background selezionato: uno dei 13 predefiniti, oppure — se il giocatore ha
// scelto "Personalizzato" — un oggetto con la stessa forma costruito dai campi custom del
// draft (regola "Personalizzare un Background", PHB 2014 p.125: 2 competenze a scelta,
// strumenti/lingua, corredo ed equivalente, e un tratto di background inventato con il DM).
function getSelectedBackground(draft) {
  if (draft.backgroundId === CUSTOM_BACKGROUND_ID) {
    return {
      id: CUSTOM_BACKGROUND_ID,
      name: (draft.customBackgroundName || "").trim() || "Personalizzato",
      skills: draft.customBackgroundSkills || [],
      equipment: (draft.customBackgroundEquipment || "").split("\n").map((s) => s.trim()).filter(Boolean),
      toolsLanguages: draft.customBackgroundToolsLanguages || "",
      feature: (draft.customBackgroundFeatureName || "").trim() || "Tratto personalizzato",
      featureDesc: draft.customBackgroundFeatureDesc || "",
      custom: true,
    };
  }
  return BACKGROUNDS.find((b) => b.id === draft.backgroundId) || null;
}

// Errori di validazione specifici del background (predefinito o personalizzato). Usata sia da
// validateCharacter sia per capire se lo step "Background" del wizard è completo.
function getBackgroundValidationErrors(draft) {
  const errors = [];
  if (!draft.backgroundId) {
    errors.push("Seleziona un background.");
    return errors;
  }
  if (draft.backgroundId === CUSTOM_BACKGROUND_ID) {
    if (!(draft.customBackgroundName || "").trim()) errors.push("Dai un nome al tuo background personalizzato.");
    if ((draft.customBackgroundSkills || []).length !== 2) errors.push("Scegli 2 competenze per il background personalizzato.");
    if (!(draft.customBackgroundEquipment || "").trim()) errors.push("Indica il corredo di partenza del background personalizzato.");
    if (!(draft.customBackgroundFeatureName || "").trim() || !(draft.customBackgroundFeatureDesc || "").trim()) {
      errors.push("Descrivi il tratto (nome e testo) del background personalizzato.");
    }
  } else {
    const bg = BACKGROUNDS.find((b) => b.id === draft.backgroundId);
    (bg?.proficiencyChoices || []).forEach((spec) => {
      if (((draft.profChoices && draft.profChoices[spec.key]) || []).length !== spec.count) {
        errors.push(`Scegli ${spec.count} opzioni per "${spec.label}".`);
      }
    });
  }
  return errors;
}

/* ---------------------------------- TALENTI (FEATS) ---------------------------------- */
// Catalogo dei talenti del Manuale del Giocatore 2014. Ogni talento può opzionalmente
// concedere +1 a una caratteristica a scelta tra quelle elencate in `abilityChoice`
// (con eventuale `max`, il punteggio massimo raggiungibile tramite quel talento).
/* ---------------------------------- STILI DI COMBATTIMENTO ---------------------------------- */
// Stili di Combattimento del PHB 2014

function getAvailableFightingStyles(clsId) {
  return FIGHTING_STYLES[clsId] || [];
}

function getFightingStyleCount(clsId, level, subclassId = null) {
  const lvl = Number(level) || 0;
  if (!FIGHTING_STYLE_CLASSES.includes(clsId)) return 0;
  const requiredLevel = FIGHTING_STYLE_LEVEL[clsId] || 99;
  if (lvl < requiredLevel) return 0;
  // In 5e 2014 il Guerriero ottiene un secondo stile al 10° solo se è Campione.
  if (clsId === "guerriero" && subclassId === "campione" && lvl >= 10) return 2;
  return 1;
}

function hasFightingStyles(clsId) {
  return FIGHTING_STYLE_CLASSES.includes(clsId);
}

function getSelectedFightingStyles(store) {
  return Array.isArray(store?.fightingStyles) ? store.fightingStyles : [];
}

function getFightingStyleAcBonus(store, clsId, wearingArmor = true) {
  if (!wearingArmor || !store?.fightingStyles) return 0;
  const styles = FIGHTING_STYLES[clsId] || [];
  return store.fightingStyles.reduce((sum, id) => {
    const style = styles.find((s) => s.id === id);
    return sum + (style?.effects?.acBonus || 0);
  }, 0);
}

// `duelingEligible` deve già incorporare TUTTI i requisiti di Duellante (mischia, impugnata
// davvero a una mano — non versatile a due mani — e nessun'altra arma equipaggiata), non solo
// "questa arma è a una mano": il chiamante è responsabile di calcolarlo correttamente.
function getFightingStyleDamageBonus(store, clsId, isMelee, duelingEligible) {
  if (!store?.fightingStyles) return 0;
  const styles = FIGHTING_STYLES[clsId] || [];
  return store.fightingStyles.reduce((sum, id) => {
    const style = styles.find((s) => s.id === id);
    if (isMelee && duelingEligible && style?.effects?.damageBonusMeleeOneHanded) {
      return sum + style.effects.damageBonusMeleeOneHanded;
    }
    return sum;
  }, 0);
}

function getFightingStyleAttackBonus(store, clsId, isRanged) {
  if (!store?.fightingStyles) return 0;
  const styles = FIGHTING_STYLES[clsId] || [];
  return store.fightingStyles.reduce((sum, id) => {
    const style = styles.find((s) => s.id === id);
    if (isRanged && style?.effects?.attackBonusRanged) {
      return sum + style.effects.attackBonusRanged;
    }
    return sum;
  }, 0);
}

function getFightingStyleGreatWeapon(store) {
  return getSelectedFightingStyles(store).includes("armi-pesanti");
}

function getFightingStyleTwoWeapon(store) {
  return getSelectedFightingStyles(store).includes("combattimento-due-armi");
}

function getFightingStyleProtection(store) {
  return getSelectedFightingStyles(store).includes("protezione");
}

function getFeat(id) {
  return FEATS.find((f) => f.id === id) || null;
}

/* ------------------------------- INCANTATORI: FUNZIONI DERIVATE ------------------------------- */
// I dati grezzi (progressioni, tabelle, opzioni) vivono in src/data/spells.js; queste funzioni
// combinano quei dati con lo stato del personaggio (classe, sottoclasse, livello).

function isThirdCaster(clsId, subclassId) {
  return (clsId === "guerriero" && subclassId === "cavaliere-mistico") || (clsId === "ladro" && subclassId === "furfante-arcano");
}

function getEffectiveCasterInfo(clsId, subclassId) {
  if (CASTER_INFO[clsId]) return CASTER_INFO[clsId];
  if (isThirdCaster(clsId, subclassId)) return THIRD_CASTER_INFO;
  return null;
}

function getUnlockedArcanumTiers(level) {
  return Object.entries(MYSTIC_ARCANUM_UNLOCK_LEVEL)
    .filter(([, unlockLevel]) => (level || 1) >= unlockLevel)
    .map(([tier]) => Number(tier))
    .sort((a, b) => a - b);
}

function getMetamagicKnownCount(level) {
  const lvl = level || 1;
  if (lvl >= 17) return 4;
  if (lvl >= 10) return 3;
  if (lvl >= 3) return 2;
  return 0;
}
function getMetamagic(id) {
  return METAMAGIC_OPTIONS.find((m) => m.id === id) || null;
}

function rollWildMagicSurge() {
  const roll = 1 + Math.floor(Math.random() * 100);
  const index = Math.min(WILD_MAGIC_SURGE_TABLE.length - 1, Math.floor((roll - 1) / 2));
  return { roll, text: WILD_MAGIC_SURGE_TABLE[index] };
}

function getInvocationsKnownCount(level) {
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
function getInvocation(id) {
  return WARLOCK_INVOCATIONS.find((i) => i.id === id) || null;
}

function getDivineSmiteDice(slotLevel) {
  return Math.min(5, Math.max(2, (slotLevel || 1) + 1));
}

function getDisciplinesKnownCount(level) {
  const lvl = level || 1;
  if (lvl >= 17) return 5;
  if (lvl >= 11) return 4;
  if (lvl >= 6) return 3;
  if (lvl >= 3) return 2;
  return 0;
}
function getElementalDiscipline(id) {
  return ELEMENTAL_DISCIPLINES.find((d) => d.id === id) || null;
}

function getSpellSlots(clsId, level, subclassId) {
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

function getMaxSpellLevel(clsId, level, subclassId) {
  const slots = getSpellSlots(clsId, level, subclassId);
  return slots.length ? Math.max(...slots.map((s) => s.level)) : 0;
}

function getSpellsLimit(clsId, caster, level, abilityMod) {
  const lvl = Math.max(1, Math.min(20, level || 1));
  if (caster.type === "prepared") {
    const effLevel = caster.halfCaster ? Math.floor(lvl / 2) : lvl;
    return Math.max(1, abilityMod + effLevel);
  }
  if (caster.type === "spellbook") return 6 + (lvl - 1) * 2;
  return caster.known[lvl - 1];
}

function getTieredSpellIds(source, maxLevelReal) {
  if (!source) return [];
  const ids = [];
  for (let lvl = 1; lvl <= Math.min(maxLevelReal, 5); lvl += 1) {
    (source.spells[lvl] || []).forEach((id) => ids.push(id));
  }
  return ids;
}

function getDomainSpellIds(domainId, maxLevelReal) {
  return getTieredSpellIds(DIVINE_DOMAINS.find((d) => d.id === domainId), maxLevelReal);
}

function getOathSpellIds(oathId, maxLevelReal) {
  return getTieredSpellIds(PALADIN_OATHS.find((o) => o.id === oathId), maxLevelReal);
}

function getPatronSpellIds(patronId, maxLevelReal) {
  return getTieredSpellIds(WARLOCK_PATRONS.find((p) => p.id === patronId), maxLevelReal);
}

function getCircleSpellIds(circleId, maxLevelReal) {
  return getTieredSpellIds(DRUID_CIRCLES.find((c) => c.id === circleId), maxLevelReal);
}


/* ---------------------------------- HELPERS ---------------------------------- */

const mod = (score) => Math.floor((score - 10) / 2);
const fmtMod = (m) => (m >= 0 ? `+${m}` : `${m}`);
// Le velocità di razza sono memorizzate in piedi (com'è nel PHB), ma il resto dell'app esprime
// ogni distanza in metri (gittate di incantesimi e armi): convertiamo qui, alla visualizzazione,
// con la stessa equivalenza usata altrove nel file (1,5 m per ogni 5 ft, cioè un "quadretto").
const ftToM = (ft) => (ft / 5) * 1.5;
const getProficiencyBonus = (level) => Math.floor((Math.max(1, level || 1) - 1) / 4) + 2;
const POINT_BUY_COST = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
const POINT_BUY_TOTAL = 27;
const getPointBuyCost = (score) => POINT_BUY_COST[score] ?? Infinity;
// I punteggi non ancora assegnati sono "" (nessuna caratteristica scelta ancora): li trattiamo
// come costo 0, non come punteggio non valido, altrimenti la spesa totale mostrerebbe Infinity
// finché non si sono compilate tutte e sei le caratteristiche.
const getPointBuySpent = (scores) => Object.values(scores).reduce((sum, v) => sum + (v === "" || v === undefined ? 0 : getPointBuyCost(Number(v))), 0);

function getRaceSelections(draft, race) {
  return { ability: draft.raceAbilityPicks || draft.halfElfPicks || [], skill: draft.raceSkillPicks || [] };
}

function getVersatileDamage(properties) {
  if (!properties || !Array.isArray(properties)) return null;
  const versatileProp = properties.find(p => typeof p === 'string' && p.includes("Versatile"));
  if (!versatileProp) return null;
  const match = versatileProp.match(/\((\d+d\d+)\)/);
  return match ? match[1] : null;
}


/* ---------------------------------- ASI ---------------------------------- */

function getAsiLevels(clsId) {
  return ASI_LEVELS_BY_CLASS[clsId] || [];
}

function getUnlockedAsiLevels(clsId, level) {
  return getAsiLevels(clsId).filter((lvl) => lvl <= (level || 1));
}

function getLevelChoiceType(store, level) {
  // Retrocompatibile: se non specificato, il livello è di tipo "asi" (comportamento storico).
  return (store.levelChoiceType && store.levelChoiceType[level]) || "asi";
}

// Calcola il bonus di caratteristica da ASI/Talenti per UNA classe (store = draft per la
// classe primaria, oppure draft.multiclass per la classe secondaria).
function computeAsiBonusForStore(store, clsId, classLevel) {
  const bonus = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
  getUnlockedAsiLevels(clsId, classLevel).forEach((lvl) => {
    const type = getLevelChoiceType(store, lvl);
    if (type === "asi") {
      const picks = (store.asiChoices && store.asiChoices[lvl]) || [];
      picks.forEach((k) => { if (bonus[k] !== undefined) bonus[k] += 1; });
    } else if (type === "feat") {
      const featId = store.featChoices && store.featChoices[lvl];
      const feat = featId ? getFeat(featId) : null;
      const abilityPick = store.featAbilityChoices && store.featAbilityChoices[lvl];
      if (feat && feat.abilityChoice && abilityPick && bonus[abilityPick] !== undefined) {
        bonus[abilityPick] += 1;
      }
    }
  });
  return bonus;
}

// Bonus di caratteristica totale da ASI/Talenti, sommato su TUTTE le classi del personaggio
// (classe primaria + eventuale classe secondaria da multiclasse), più l'eventuale talento
// bonus concesso dalla razza (es. Umano variante) con la sua scelta di caratteristica.
function getAsiBonus(draft) {
  const total = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
  getClassEntries(draft).forEach(({ classId, level, store }) => {
    const b = computeAsiBonusForStore(store, classId, level);
    Object.keys(total).forEach((k) => { total[k] += b[k]; });
  });
  const raceFeat = draft.raceFeatId ? getFeat(draft.raceFeatId) : null;
  if (raceFeat && raceFeat.abilityChoice && draft.raceFeatAbilityChoice && total[draft.raceFeatAbilityChoice] !== undefined) {
    total[draft.raceFeatAbilityChoice] += 1;
  }
  return total;
}

function computeChosenFeatsForStore(store, clsId, classLevel) {
  return getUnlockedAsiLevels(clsId, classLevel)
    .filter((lvl) => getLevelChoiceType(store, lvl) === "feat")
    .map((lvl) => {
      const featId = store.featChoices && store.featChoices[lvl];
      const feat = featId ? getFeat(featId) : null;
      if (!feat) return null;
      const abilityPick = store.featAbilityChoices && store.featAbilityChoices[lvl];
      return { level: lvl, feat, abilityPick, classId: clsId };
    })
    .filter(Boolean);
}

// Talenti scelti su TUTTE le classi del personaggio, più l'eventuale talento bonus di razza
// (es. Umano variante), che non è legato a nessun livello di classe.
function getChosenFeats(draft) {
  const classFeats = getClassEntries(draft).flatMap(({ classId, level, store }) => computeChosenFeatsForStore(store, classId, level));
  const raceFeat = draft.raceFeatId ? getFeat(draft.raceFeatId) : null;
  if (!raceFeat) return classFeats;
  return [{ level: 1, feat: raceFeat, abilityPick: draft.raceFeatAbilityChoice || null, classId: "razza" }, ...classFeats];
}

/* ---------------------------------- MECCANICHE CALCOLATE ---------------------------------- */

function getAttacksPerAction(clsId, level, subclassId) {
  const lvl = level || 1;
  if (clsId === "guerriero") {
    if (lvl >= 20) return 4;
    if (lvl >= 11) return 3;
    if (lvl >= 5) return 2;
    return 1;
  }
  if (["barbaro", "monaco", "paladino", "ranger"].includes(clsId)) {
    return lvl >= 5 ? 2 : 1;
  }
  if (clsId === "bardo" && subclassId === "valore") {
    return lvl >= 6 ? 2 : 1;
  }
  return 1;
}

function getSneakAttackDice(level) {
  return Math.max(1, Math.ceil((level || 1) / 2));
}

function getBardicInspirationDie(level) {
  const lvl = level || 1;
  if (lvl >= 15) return "d12";
  if (lvl >= 10) return "d10";
  if (lvl >= 5) return "d8";
  return "d6";
}

// Elenco di piccole statistiche di "meccanica di classe" (attacchi extra, attacco furtivo,
// usi dell'ira, ecc.) per una classe/livello/sottoclasse: usato per mostrare queste info sia
// per la classe primaria che per un'eventuale classe secondaria da multiclasse.
function getClassMechanicsList(clsId, level, subclassId) {
  const list = [];
  const atk = getAttacksPerAction(clsId, level, subclassId);
  if (atk > 1) list.push({ key: "attacchi", label: "Attacchi per Azione", value: atk });
  if (clsId === "ladro") list.push({ key: "furtivo", label: "Attacco Furtivo", value: `${getSneakAttackDice(level)}d6` });
  if (clsId === "barbaro") list.push({ key: "ira", label: "Usi dell'Ira", value: getRageUses(level) });
  if (clsId === "bardo") list.push({ key: "ispirazione", label: "Ispirazione Bardica", value: getBardicInspirationDie(level) });
  if (clsId === "monaco" && getKiPoints(level) > 0) list.push({ key: "ki", label: "Punti Ki", value: getKiPoints(level) });
  if (clsId === "barbaro" && subclassId === "totem-aquila" && (level || 1) >= 14) {
    list.push({ key: "volo-ira", label: "Velocità di Volo (in Ira)", value: "pari alla velocità" });
  }
  const critRange = getCritRange(clsId, subclassId, level);
  if (critRange !== "20") list.push({ key: "critico", label: "Raggio di Critico", value: critRange });
  return list;
}

function getHitDieAverage(hitDie) {
  return Math.floor(hitDie / 2) + 1;
}

function computeMaxHp(draft, cls, race, conMod) {
  if (!cls) return null;
  const level = draft.level || 1;
  let hp = cls.hitDie + conMod;
  for (let lvl = 2; lvl <= level; lvl += 1) {
    const entry = draft.hpPerLevel && draft.hpPerLevel[lvl];
    const roll = entry === undefined || entry === "avg" ? getHitDieAverage(cls.hitDie) : (Number(entry) || getHitDieAverage(cls.hitDie));
    hp += roll + conMod;
  }
  if (cls.id === "stregone" && draft.subclassId === "progenie-draconica") hp += level;

  // Multiclasse: aggiungi i dadi vita di TUTTI i livelli della classe secondaria (mai un
  // "livello 1 gratuito" a dado massimo, che spetta solo alla primissima classe presa).
  const mc = draft.multiclass;
  let mcLevel = 0;
  if (mc && mc.classId) {
    const mcCls = CLASSES.find((c) => c.id === mc.classId);
    if (mcCls) {
      mcLevel = mc.level || 1;
      for (let lvl = 1; lvl <= mcLevel; lvl += 1) {
        const entry = mc.hpPerLevel && mc.hpPerLevel[lvl];
        const roll = entry === undefined || entry === "avg" ? getHitDieAverage(mcCls.hitDie) : (Number(entry) || getHitDieAverage(mcCls.hitDie));
        hp += roll + conMod;
      }
      if (mcCls.id === "stregone" && mc.subclassId === "progenie-draconica") hp += mcLevel;
    }
  }
  if (race?.id === "nano-colline") hp += level + mcLevel;
  return hp;
}

function hasDraconicResilienceAc(clsId, subclassId) {
  return clsId === "stregone" && subclassId === "progenie-draconica";
}

function getLevelUpChanges(clsId, subclassId, fromLevel, toLevel) {
  const newAsiLevels = getUnlockedAsiLevels(clsId, toLevel).filter((l) => l > fromLevel);
  const newFeatures = getUnlockedSubclassFeatures(clsId, subclassId, toLevel).filter((f) => f.level > fromLevel);
  const oldSlots = getSpellSlots(clsId, fromLevel, subclassId);
  const newSlots = getSpellSlots(clsId, toLevel, subclassId);
  const slotsChanged = JSON.stringify(oldSlots) !== JSON.stringify(newSlots);
  const oldResources = getAllClassResources(clsId, subclassId, fromLevel);
  const newResources = getAllClassResources(clsId, subclassId, toLevel);
  const resourceChanges = newResources.map((nr) => {
    const or = oldResources.find((r) => r.key === nr.key);
    if (!or) return `${nr.name}: nuova risorsa (${nr.max ?? "illimitati"})`;
    if (or.max !== nr.max) return `${nr.name}: ${or.max ?? "illimitati"} → ${nr.max ?? "illimitati"}`;
    return null;
  }).filter(Boolean);
  const oldCrit = getCritRange(clsId, subclassId, fromLevel);
  const newCrit = getCritRange(clsId, subclassId, toLevel);
  return {
    fromLevel, toLevel, newAsiLevels, newFeatures, slotsChanged, newSlots,
    resourceChanges, critChanged: oldCrit !== newCrit, oldCrit, newCrit,
  };
}

function validateClassLevelChoices(store, clsId, classLevel, className, errors) {
  getUnlockedAsiLevels(clsId, classLevel).forEach((lvl) => {
    const type = getLevelChoiceType(store, lvl);
    if (type === "feat") {
      const featId = store.featChoices && store.featChoices[lvl];
      const feat = featId ? getFeat(featId) : null;
      if (!feat) { errors.push(`Scegli un talento per il livello ${lvl} di ${className}.`); return; }
      if (feat.abilityChoice && !feat.abilityChoice.optional && !(store.featAbilityChoices && store.featAbilityChoices[lvl])) {
        errors.push(`Scegli la caratteristica del talento "${feat.name}" al livello ${lvl} di ${className}.`);
      }
    } else {
      const picks = (store.asiChoices && store.asiChoices[lvl]) || [];
      if (picks.length !== 2 || picks.some((k) => !k)) {
        errors.push(`Scegli entrambi gli incrementi ASI del livello ${lvl} di ${className}.`);
      }
    }
  });
}

function validateCharacter(draft) {
  const errors = [];
  const race = RACES.find((r) => r.id === draft.raceId);
  const cls = CLASSES.find((c) => c.id === draft.classId);

  if (!draft.name?.trim()) errors.push("Inserisci il nome del personaggio.");
  if (!race) errors.push("Seleziona una razza.");
  if (!cls) errors.push("Seleziona una classe.");
  errors.push(...getBackgroundValidationErrors(draft));

  if (draft.abilityMethod === "custom") {
    const values = Object.values(draft.baseScores).map(Number);
    if (values.some((v) => !Number.isInteger(v) || v < 8 || v > 15)) errors.push("Con il Point Buy i punteggi devono essere compresi tra 8 e 15 prima dei bonus razziali.");
    if (getPointBuySpent(draft.baseScores) !== POINT_BUY_TOTAL) errors.push(`Il Point Buy deve spendere esattamente ${POINT_BUY_TOTAL} punti.`);
  }

  if (["array", "roll"].includes(draft.abilityMethod) && Object.values(draft.baseScores).some((v) => v === "" || v === undefined)) {
    errors.push("Assegna tutti e sei i punteggi alle caratteristiche.");
  }

  if (race?.extraAbilityChoice && (draft.raceAbilityPicks || []).length !== race.extraAbilityChoice.count) {
    errors.push(`Scegli ${race.extraAbilityChoice.count} caratteristiche per il bonus razziale.`);
  }

  if (race?.extraSkillChoice && (draft.raceSkillPicks || []).length !== race.extraSkillChoice.count) {
    errors.push(`Scegli ${race.extraSkillChoice.count} abilità razziali.`);
  }

  if (race?.extraFeatChoice) {
    const raceFeat = draft.raceFeatId ? getFeat(draft.raceFeatId) : null;
    if (!raceFeat) errors.push(`Scegli il talento concesso da ${race.name}.`);
    else if (raceFeat.abilityChoice && !raceFeat.abilityChoice.optional && !draft.raceFeatAbilityChoice) {
      errors.push(`Scegli la caratteristica del talento "${raceFeat.name}" concesso da ${race.name}.`);
    }
  }

  if (cls && (draft.classSkills || []).length < cls.skillChoices) {
    errors.push(`Scegli almeno ${cls.skillChoices} competenze di classe per ${cls.name}. Hai selezionato ${draft.classSkills.length} competenze.`);
  }

  if (cls) {
    validateClassLevelChoices(draft, cls.id, draft.level, cls.name, errors);
    const finalScores = computeFinalScores(draft);
    const overCap = ABILITIES.filter((a) => finalScores[a.key] > 20);
    if (overCap.length) {
      errors.push(`Punteggio massimo di 20 superato per: ${overCap.map((a) => a.name).join(", ")}.`);
    }

    const subclassLevel = SUBCLASS_CHOICE_LEVEL[cls.id];
    if (subclassLevel && draft.level >= subclassLevel && SUBCLASSES[cls.id] && !getChosenSubclassId(draft, cls.id)) {
      errors.push(`Scegli una sottoclasse per ${cls.name} (disponibile dal livello ${subclassLevel}).`);
    }

    // Validazione Stili di Combattimento - Classe Primaria
    if (hasFightingStyles(cls.id)) {
      const maxStyles = getFightingStyleCount(cls.id, draft.level, draft.subclassId);
      const selected = getSelectedFightingStyles(draft);
      if (maxStyles > 0 && selected.length < maxStyles) {
        errors.push(`Scegli ${maxStyles} stile${maxStyles > 1 ? "i" : ""} di combattimento per ${cls.name}.`);
      }
    }
  }

  const mc = draft.multiclass;
  if (mc && mc.classId) {
    const mcCls = CLASSES.find((c) => c.id === mc.classId);
    if (mcCls) {
      validateClassLevelChoices(mc, mcCls.id, mc.level, `${mcCls.name} (secondaria)`, errors);

      const subclassLevel = SUBCLASS_CHOICE_LEVEL[mcCls.id];
      if (subclassLevel && mc.level >= subclassLevel && SUBCLASSES[mcCls.id] && !getChosenSubclassId(mc, mcCls.id)) {
        errors.push(`Scegli una sottoclasse per ${mcCls.name} (classe secondaria, disponibile dal livello ${subclassLevel}).`);
      }

      // Validazione Stili di Combattimento - Classe Secondaria
      if (hasFightingStyles(mcCls.id)) {
        const maxStyles = getFightingStyleCount(mcCls.id, mc.level, mc.subclassId);
        const selected = getSelectedFightingStyles(mc);
        if (maxStyles > 0 && selected.length < maxStyles) {
          errors.push(`Scegli ${maxStyles} stile${maxStyles > 1 ? "i" : ""} di combattimento per ${mcCls.name} (classe secondaria).`);
        }
      }
    }

    const totalLevel = getTotalCharacterLevel(draft);
    if (totalLevel > 20) {
      errors.push(`Il livello totale del personaggio (${totalLevel}) supera il massimo di 20.`);
    }
  }

  return errors;
}

const abilityKeyByName = (name) => {
  const found = ABILITIES.find((a) => name && name.includes(a.name));
  return found ? found.key : null;
};

function rollAbilityScore() {
  const rolls = Array.from({ length: 4 }, () => 1 + Math.floor(Math.random() * 6));
  rolls.sort((a, b) => a - b);
  return rolls[1] + rolls[2] + rolls[3];
}

function getRaceBonus(race, picks) {
  const b = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
  if (!race) return b;
  Object.entries(race.bonuses || {}).forEach(([k, v]) => { b[k] += v; });
  (picks || []).forEach((k) => { if (b[k] !== undefined) b[k] += 1; });
  return b;
}

function formatItemStats(item) {
  if (item.category === "arma") {
    const props = item.properties && item.properties.length ? ` · ${item.properties.join(", ")}` : "";
    return `${item.damage} ${item.damageType} · ${item.hands}${props}`;
  }
  if (item.category === "armatura") {
    const parts = [`CA ${item.ac}`, `Armatura ${item.tipo}`];
    if (item.strengthReq) parts.push(`Richiede Forza ${item.strengthReq}`);
    if (item.stealthDisadvantage) parts.push("Svantaggio a Furtività");
    return parts.join(" · ");
  }
  if (item.category === "scudo") return `CA ${item.ac}`;
  return item.desc || "";
}

// Impugnatura effettiva di un'arma: le armi a due mani sono sempre a due mani, quelle versatili
// dipendono dal toggle scelto dal giocatore nell'Inventario (draft.twoHandedWeapons), tutte le
// altre sono sempre a una mano.
function getEffectiveGrip(draft, item) {
  if (item.hands === "due mani") return "due mani";
  const isVersatile = (item.properties || []).some((p) => p.includes("Versatile"));
  if (isVersatile && (draft.twoHandedWeapons || {})[item.uid]) return "due mani";
  return "una mano";
}

let uidCounter = 0;
function nextUid() {
  uidCounter += 1;
  return `item_${Date.now()}_${uidCounter}`;
}

function emptyDraft() {
  return {
    id: null,
    name: "",
    raceId: null,
    halfElfPicks: [],
    raceAbilityPicks: [],
    raceSkillPicks: [],
    raceFeatId: null,
    raceFeatAbilityChoice: null,
    profChoices: {},
    classId: null,
    classSkills: [],
    backgroundId: null,
    customBackgroundName: "",
    customBackgroundSkills: [],
    customBackgroundEquipment: "",
    customBackgroundToolsLanguages: "",
    customBackgroundFeatureName: "",
    customBackgroundFeatureDesc: "",
    personalityTrait1: "",
    personalityTrait2: "",
    ideal: "",
    bond: "",
    flaw: "",
    abilityMethod: "array",
    rolledPool: null,
    baseScores: { str: "", dex: "", con: "", int: "", wis: "", cha: "" },
    level: 1,
    domainId: null,
    oathId: null,
    patronId: null,
    circleId: null,
    subclassId: null,
    resourcesUsed: {},
    fightingStyles: [], // Array di ID degli stili scelti
    asiChoices: {},
    levelChoiceType: {},
    featChoices: {},
    featAbilityChoices: {},
    hpPerLevel: {},
    hitDiceSpent: {},
    mysticArcanum: {},
    metamagicIds: [],
    invocationIds: [],
    disciplineIds: [],
    pactBoonId: null,
    multiclass: null,
    currentHp: null,
    tempHp: 0,
    spellsKnown: [],
    slotsUsed: {},
    inventory: [],
    twoHandedWeapons: {}, // ✅ AGGIUNGI QUESTO
    sorceryPointsUsed: 0,

  };
}

function emptyMulticlass(classId) {
  return {
    classId,
    level: 1,
    subclassId: null,
    domainId: null,
    oathId: null,
    patronId: null,
    circleId: null,
    resourcesUsed: {},
    fightingStyles: [],
    asiChoices: {},
    levelChoiceType: {},
    featChoices: {},
    featAbilityChoices: {},
    hpPerLevel: {},
    mysticArcanum: {},
    metamagicIds: [],
    invocationIds: [],
    disciplineIds: [],
    pactBoonId: null,
    bonusSkillPick: null,
  };
}

function computeFinalScores(draft) {
  const race = RACES.find((r) => r.id === draft.raceId);
  const raceBonus = getRaceBonus(race, draft.raceAbilityPicks || draft.halfElfPicks);
  const asiBonus = getAsiBonus(draft);
  const finalScores = {};
  ABILITIES.forEach((a) => {
    const base = draft.baseScores[a.key] === "" || draft.baseScores[a.key] === undefined ? 10 : draft.baseScores[a.key];
    finalScores[a.key] = base + (raceBonus[a.key] || 0) + (asiBonus[a.key] || 0);
  });
  return finalScores;
}

// Quanto manca a UNA classe incantatrice del personaggio per avere davvero finito lo step
// Incantesimi: eventuale sottoclasse-prerequisito (dominio/ordine/patrono/circolo) scelta, e
// trucchetti/incantesimi conosciuti al completo. Rispecchia esattamente i conteggi già
// mostrati in ClassSpellSection, così la spunta non può mai disallinearsi da quel che si vede.
function getCasterSpellStatus(clsId, chosenSubclassId, level, store, draft, finalScores) {
  const caster = getEffectiveCasterInfo(clsId, chosenSubclassId);
  if (!caster) return null;
  const maxLevelReal = getMaxSpellLevel(clsId, level, chosenSubclassId);
  if (maxLevelReal === 0) return { subclassChoiceOk: true, cantripsNeeded: 0, cantripsKnown: 0, spellsNeeded: 0, spellsKnown: 0 };

  const abilityMod = mod(finalScores[caster.ability]);
  const cantripsNeeded = caster.cantrips[Math.min(level, 20) - 1];
  const spellsNeeded = getSpellsLimit(clsId, caster, level, abilityMod);
  const dataMax = Math.min(maxLevelReal, MAX_DATA_SPELL_LEVEL);
  const thirdCaster = isThirdCaster(clsId, chosenSubclassId);
  const spellClassId = thirdCaster ? "mago" : clsId;

  const subclassChoiceOk = clsId === "chierico" ? !!store.domainId
    : clsId === "paladino" ? !!store.oathId
    : clsId === "warlock" ? !!store.patronId
    : clsId === "druido" ? !!store.circleId
    : true;

  const subclassSpellIds = clsId === "chierico" ? getDomainSpellIds(store.domainId, maxLevelReal)
    : clsId === "paladino" ? getOathSpellIds(store.oathId, maxLevelReal)
      : clsId === "druido" ? getCircleSpellIds(store.circleId, maxLevelReal)
        : [];
  const patronSpellIds = clsId === "warlock" && store.patronId ? getPatronSpellIds(store.patronId, maxLevelReal) : [];

  const cantripOptions = SPELLS.filter((s) => s.level === 0 && s.classes.includes(spellClassId));
  const spellOptions = SPELLS.filter((s) => s.level >= 1 && s.level <= dataMax && !subclassSpellIds.includes(s.id) && (s.classes.includes(spellClassId) || patronSpellIds.includes(s.id)));

  const cantripsKnown = draft.spellsKnown.filter((id) => cantripOptions.some((s) => s.id === id)).length;
  const spellsKnown = draft.spellsKnown.filter((id) => spellOptions.some((s) => s.id === id)).length;

  return { subclassChoiceOk, cantripsNeeded, cantripsKnown, spellsNeeded, spellsKnown };
}

const STEPS = [
  { key: "razza", label: "Razza", icon: Users },
  { key: "classe", label: "Classe", icon: Sword },
  { key: "caratteristiche", label: "Caratteristiche", icon: Dices },
  { key: "background", label: "Background", icon: ScrollText },
  { key: "equipaggiamento", label: "Equipaggiamento", icon: Backpack },
  { key: "incantesimi", label: "Incantesimi", icon: Sparkles },
  { key: "riepilogo", label: "Riepilogo", icon: BookOpen },
];

// Lo step ha i requisiti minimi per proseguire (usata per abilitare "Avanti"): solo i campi
// davvero obbligatori, così scelte facoltative (flavour del background, corredo extra) non
// bloccano mai la navigazione.
function isStepComplete(key, draft) {
  const race = RACES.find((r) => r.id === draft.raceId);
  const cls = CLASSES.find((c) => c.id === draft.classId);
  switch (key) {
    case "razza":
      return !!draft.raceId
        && (!race?.extraAbilityChoice || (draft.raceAbilityPicks || []).length === race.extraAbilityChoice.count)
        && (!race?.extraSkillChoice || (draft.raceSkillPicks || []).length === race.extraSkillChoice.count)
        && (!race?.extraFeatChoice || (draft.raceFeatId && (!getFeat(draft.raceFeatId)?.abilityChoice || getFeat(draft.raceFeatId).abilityChoice.optional || draft.raceFeatAbilityChoice)))
        && areProfChoicesSatisfied(race?.proficiencyChoices, draft.profChoices);
    case "classe": {
      const subclass = getSubclass(draft.classId, draft.subclassId);
      return !!draft.classId && (draft.classSkills || []).length === cls?.skillChoices
        && areProfChoicesSatisfied(subclass?.proficiencyChoices, draft.profChoices);
    }
    case "caratteristiche":
      return validateCharacter({ ...draft, name: draft.name || "draft" }).filter((e) => e.includes("Point Buy") || e.includes("punteggi") || e.includes("caratteristiche")).length === 0;
    case "background":
      return getBackgroundValidationErrors(draft).length === 0;
    case "equipaggiamento":
    case "incantesimi":
    case "riepilogo":
      return true;
    default:
      return false;
  }
}

// Spunta ✓ nella barra laterale: più severa di isStepComplete, perché per alcuni step il
// "minimo per proseguire" non è un buon segnale di step davvero rifinito (background scelto
// con un click ma senza personalità, nessun oggetto nel corredo, riepilogo con errori residui).
function isStepFullyComplete(key, draft) {
  switch (key) {
    case "background":
      return isStepComplete("background", draft)
        && !!(draft.personalityTrait1 || "").trim()
        && !!(draft.personalityTrait2 || "").trim()
        && !!(draft.ideal || "").trim()
        && !!(draft.bond || "").trim()
        && !!(draft.flaw || "").trim();
    case "equipaggiamento":
      return (draft.inventory || []).length > 0;
    case "incantesimi": {
      if (!draft.classId) return false;
      const casterEntries = getClassEntries(draft).filter((e) => getEffectiveCasterInfo(e.classId, e.subclassId));
      if (casterEntries.length === 0) return true;
      const finalScores = computeFinalScores(draft);
      return casterEntries.every((e) => {
        const status = getCasterSpellStatus(e.classId, e.subclassId, e.level, e.store, draft, finalScores);
        if (!status) return true;
        const subclass = getSubclass(e.classId, e.subclassId);
        return status.subclassChoiceOk
          && status.cantripsKnown >= status.cantripsNeeded
          && status.spellsKnown >= status.spellsNeeded
          && areProfChoicesSatisfied(subclass?.proficiencyChoices, e.store.profChoices);
      });
    }
    case "riepilogo":
      return validateCharacter(draft).length === 0;
    default:
      return isStepComplete(key, draft);
  }
}

const STORAGE_KEY = "dnd-characters-5e2014-v2";
const RULESET_VERSION = "D&D 5e 2014";

const storageAdapter = {
  async get(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? { value: fallback } : { value: raw };
    } catch (error) {
      console.error("Storage read failed:", error);
      return { value: fallback };
    }
  },
  async set(key, value, fallback) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error("Storage write failed:", error);
      return false;
    }
  },
};


/* ---------------------------------- SMALL UI PIECES ---------------------------------- */

function Frame({ children, style, className = "" }) {
  return (
    <div
      className={className}
      style={{
        background: "linear-gradient(180deg, #f5ebd2 0%, #efe4c6 100%)",
        border: `1px solid ${C.parchmentLine}`,
        boxShadow: `inset 0 0 0 4px rgba(255,255,255,0.32), inset 0 0 0 5px ${C.parchmentLine}, 0 18px 28px rgba(19,15,13,0.16)`,
        borderRadius: 2,
        padding: "var(--frame-padding)",
        position: "relative",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Divider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "1.25rem 0" }}>
      <div style={{ flex: 1, height: 1, background: C.parchmentLine }} />
      <div style={{ width: 6, height: 6, transform: "rotate(45deg)", background: C.gold }} />
      <div style={{ flex: 1, height: 1, background: C.parchmentLine }} />
    </div>
  );
}

function GoldButton({ children, onClick, disabled, style, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: "'Cinzel', serif",
        fontSize: 13,
        letterSpacing: 0.5,
        fontWeight: 600,
        color: disabled ? C.creamMuted : C.cream,
        background: disabled ? "#4a4038" : `linear-gradient(180deg, ${C.wine}, ${C.wineDeep})`,
        border: `1px solid ${disabled ? "#5a5148" : C.gold}`,
        borderRadius: 3,
        padding: "0.65rem 1.4rem",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        transition: "transform 120ms ease, filter 120ms ease",
        ...style,
      }}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = "scale(0.97)"; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {Icon && <Icon size={15} />}
      {children}
    </button>
  );
}

function GhostButton({ children, onClick, style, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "'Spectral', serif",
        fontSize: 13.5,
        color: C.cream,
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${C.goldSoft}`,
        borderRadius: 3,
        padding: "0.6rem 1.1rem",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        opacity: 0.96,
        transition: "all 120ms ease",
        ...style,
      }}
    >
      {Icon && <Icon size={14} />}
      {children}
    </button>
  );
}

function Pill({ children, active, onClick, disabled, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        fontFamily: "'Spectral', serif",
        fontSize: 13,
        padding: "0.5rem 0.85rem",
        borderRadius: 3,
        border: `1px solid ${active ? C.wine : C.parchmentLine}`,
        background: active ? "linear-gradient(180deg, #7d1f38 0%, #5e1729 100%)" : "rgba(255,255,255,0.2)",
        color: active ? C.cream : C.textOnParchment,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 120ms ease",
        boxShadow: active ? `0 0 0 1px rgba(224,193,101,0.3) inset` : "none",
        opacity: disabled ? 0.45 : 1,
      }}
    >
      {children}
    </button>
  );
}

function OptionCard({ selected, onClick, title, subtitle, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left",
        width: "100%",
        background: selected ? "#f8f1e0" : "transparent",
        border: `1px solid ${selected ? C.wine : C.parchmentLine}`,
        borderLeft: selected ? `4px solid ${C.wine}` : `4px solid transparent`,
        borderRadius: 2,
        padding: "0.9rem 1.1rem",
        cursor: "pointer",
        display: "block",
        marginBottom: 10,
        transition: "all 120ms ease",
        boxShadow: selected ? `0 0 0 1px ${C.goldSoft} inset` : "none",
        transform: selected ? "translateY(-1px)" : "translateY(0)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = selected ? `0 0 0 1px ${C.goldSoft} inset` : `0 0 0 1px ${C.parchmentLine} inset`; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = selected ? `0 0 0 1px ${C.goldSoft} inset` : "none"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontFamily: "'Cinzel', serif", fontSize: 15, fontWeight: 600, color: selected ? C.wineDeep : C.textOnParchment }}>
          {title}
        </span>
        {subtitle && <span style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted }}>{subtitle}</span>}
      </div>
      {children && <div style={{ marginTop: 6 }}>{children}</div>}
    </button>
  );
}

// Picker generico "pill capped at count" per le proficiencyChoices (lingue/strumenti/abilità
// a scelta) definite su razze, background e sottoclassi. `selected` è l'array già scelto per
// questa `spec` (spec.key); `onToggle` riceve il singolo valore cliccato.
function ProficiencyChoicePicker({ spec, selected, onToggle }) {
  return (
    <div style={{ marginTop: 10 }}>
      <p style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textOnParchment, marginBottom: 8 }}>
        {spec.label} ({selected.length}/{spec.count}):
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {spec.options.map((opt) => {
          const picked = selected.includes(opt);
          const disabled = !picked && selected.length >= spec.count;
          return (
            <Pill key={opt} active={picked} onClick={() => { if (disabled) return; onToggle(opt); }}>
              {opt}
            </Pill>
          );
        })}
      </div>
    </div>
  );
}

// Aggiorna draft.profChoices[spec.key] con un toggle capped at spec.count, seguendo lo stesso
// pattern "updateStore((s) => partial)" usato altrove (Metamagia, Invocazioni, ecc.).
function areProfChoicesSatisfied(specs, profChoices) {
  return (specs || []).every((spec) => ((profChoices && profChoices[spec.key]) || []).length === spec.count);
}

function toggleProfChoice(updateStore, spec, value) {
  updateStore((s) => {
    const current = (s.profChoices && s.profChoices[spec.key]) || [];
    const has = current.includes(value);
    if (has) return { profChoices: { ...s.profChoices, [spec.key]: current.filter((v) => v !== value) } };
    if (current.length >= spec.count) return {};
    return { profChoices: { ...s.profChoices, [spec.key]: [...current, value] } };
  });
}

/* ---------------------------------- STEP: RACE ---------------------------------- */

// Raggruppa RACES per "famiglia" (es. Nano → Delle Colline / Delle Montagne), nell'ordine in
// cui compaiono in RACES. Le razze senza sottorazze (es. Dragonide) restano famiglie di un solo membro.
function getRaceFamilies() {
  const families = [];
  RACES.forEach((r) => {
    const famName = r.family || r.name;
    let fam = families.find((f) => f.name === famName);
    if (!fam) { fam = { name: famName, members: [] }; families.push(fam); }
    fam.members.push(r);
  });
  return families;
}

function StepRace({ draft, setDraft }) {
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

function StepClass({ draft, setDraft }) {
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

function AsiPicker({ store, updateStore, clsId, classLevel, onlyLevels }) {
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

function StepAbilities({ draft, setDraft }) {
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
function FlavorField({ label, value, onChange, suggestions }) {
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

function StepBackground({ draft, setDraft }) {
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

const CATALOG_GROUPS = [
  { key: "arma", label: "Armi" },
  { key: "armatura", label: "Armature" },
  { key: "scudo", label: "Scudi" },
  { key: "oggetto", label: "Oggetti" },
];

function InventoryRow({ item, onQtyChange, onRemove, onToggleGrip }) {
  const isVersatile = (item.properties || []).some((p) => p.includes("Versatile"));
  const twoHanded = item.twoHanded || false;

  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
      padding: "0.6rem 0.85rem", border: `1px solid ${C.parchmentLine}`, borderRadius: 2, marginBottom: 6,
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 13.5, color: C.textOnParchment }}>{item.name}</div>
        <div style={{ fontFamily: "'Spectral', serif", fontSize: 12, color: C.textMuted }}>{formatItemStats(item)}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <button onClick={() => onQtyChange(Math.max(1, item.qty - 1))} style={qtyBtnStyle}>−</button>
        <span style={{ fontFamily: "'Spectral', serif", fontSize: 13, minWidth: 18, textAlign: "center" }}>{item.qty}</span>
        <button onClick={() => onQtyChange(item.qty + 1)} style={qtyBtnStyle}>+</button>

        {isVersatile && onToggleGrip && (
          <button
            onClick={onToggleGrip}
            style={{
              background: twoHanded ? C.wine : "transparent",
              color: twoHanded ? C.cream : C.textOnParchment,
              border: `1px solid ${twoHanded ? C.wine : C.parchmentLine}`,
              cursor: "pointer",
              borderRadius: 3,
              padding: "3px 8px",
              fontFamily: "'Spectral', serif",
              fontSize: 11,
              transition: "all 120ms ease",
            }}
          >
            {twoHanded ? "🔴 2 mani" : "🟢 1 mano"}
          </button>
        )}

        {item.category !== "oggetto" && (
          <button
            onClick={item.onToggleEquip}
            style={{
              background: item.equipped ? C.forest : "transparent",
              color: item.equipped ? C.cream : C.forestDeep,
              border: `1px solid ${C.forest}`,
              cursor: "pointer",
              borderRadius: 3,
              padding: "3px 6px",
              fontFamily: "'Spectral', serif",
              fontSize: 11
            }}
          >
            {item.equipped ? "Equipaggiato" : "Equipaggia"}
          </button>
        )}

        <button onClick={onRemove} style={{ background: "transparent", border: "none", cursor: "pointer", color: C.danger, padding: 4, marginLeft: 4 }} aria-label="Rimuovi oggetto">
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

const qtyBtnStyle = {
  width: 22, height: 22, borderRadius: 3, border: `1px solid ${C.parchmentLine}`, background: "#fff",
  cursor: "pointer", fontFamily: "'Spectral', serif", fontSize: 14, lineHeight: 1, display: "flex",
  alignItems: "center", justifyContent: "center", color: C.textOnParchment,
};

function InventoryManager({ draft, setDraft, allowAdd = true }) {
  const [pickCategory, setPickCategory] = useState("arma");
  const [pickId, setPickId] = useState("");
  const [pickQty, setPickQty] = useState(1);
  const [customName, setCustomName] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [customQty, setCustomQty] = useState(1);

  const catalogOptions = EQUIPMENT_CATALOG.filter((i) => i.category === pickCategory);
  const previewItem = catalogOptions.find((i) => i.id === pickId);

  const addFromCatalog = () => {
    if (!previewItem) return;
    setDraft((d) => {
      const alreadyEquippedSameSlot = (previewItem.category === "armatura" || previewItem.category === "scudo")
        && d.inventory.some((it) => it.category === previewItem.category && it.equipped);
      const autoEquip = (previewItem.category === "armatura" || previewItem.category === "scudo") && !alreadyEquippedSameSlot;
      return {
        ...d,
        inventory: [...d.inventory, { ...previewItem, uid: nextUid(), qty: Math.max(1, pickQty), equipped: autoEquip }],
      };
    });
    setPickId("");
    setPickQty(1);
  };

  const addCustom = () => {
    if (!customName.trim()) return;
    setDraft((d) => ({
      ...d,
      inventory: [...d.inventory, {
        uid: nextUid(), id: null, name: customName.trim(), category: "oggetto",
        desc: customDesc.trim() || "Oggetto personalizzato.", qty: Math.max(1, customQty), custom: true,
      }],
    }));
    setCustomName(""); setCustomDesc(""); setCustomQty(1);
  };

  const updateQty = (uid, qty) => {
    setDraft((d) => ({ ...d, inventory: d.inventory.map((it) => (it.uid === uid ? { ...it, qty } : it)) }));
  };

  const removeItem = (uid) => {
    setDraft((d) => ({ ...d, inventory: d.inventory.filter((it) => it.uid !== uid) }));
  };

  const toggleEquip = (uid) => {
    setDraft((d) => ({
      ...d,
      inventory: d.inventory.map((it) => {
        if (it.uid === uid) return { ...it, equipped: !it.equipped };
        const target = d.inventory.find((x) => x.uid === uid);
        if (target && !target.equipped && it.category === target.category && (it.category === "armatura" || it.category === "scudo")) {
          return { ...it, equipped: false };
        }
        return it;
      }),
    }));
  };

  // toggleGrip - Gestisce l'impugnatura delle armi versatili (1 mano / 2 mani)
  const toggleGrip = (uid) => {
    setDraft((d) => ({
      ...d,
      twoHandedWeapons: {
        ...(d.twoHandedWeapons || {}),
        [uid]: !(d.twoHandedWeapons?.[uid] || false)
      }
    }));
  };

  return (
    <div>
      <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 10px" }}>Inventario</h3>

      {draft.inventory.length === 0 ? (
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textMuted, marginBottom: 14 }}>
          Ancora vuoto. Aggiungi qui sotto le armi, le armature e gli oggetti che il personaggio porta con sé o acquista in gioco.
        </p>
      ) : (
        <div style={{ marginBottom: 16 }}>
          {draft.inventory.map((it) => {
            // Determina se l'arma è usata a due mani
            const isTwoHanded = draft.twoHandedWeapons?.[it.uid] || false;

            return (
              <InventoryRow
                key={it.uid}
                item={{
                  ...it,
                  twoHanded: isTwoHanded,
                  onToggleEquip: () => toggleEquip(it.uid)
                }}
                onQtyChange={(q) => updateQty(it.uid, q)}
                onRemove={() => removeItem(it.uid)}
                onToggleGrip={() => toggleGrip(it.uid)}
              />
            );
          })}
        </div>
      )}

      {allowAdd && (
        <>
          <div style={{ border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0.9rem 1rem", marginBottom: 14 }}>
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: C.textMuted, margin: "0 0 8px" }}>Aggiungi dal catalogo</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
              {CATALOG_GROUPS.map((g) => (
                <Pill key={g.key} active={pickCategory === g.key} onClick={() => { setPickCategory(g.key); setPickId(""); }}>
                  {g.label}
                </Pill>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <select
                value={pickId} onChange={(e) => setPickId(e.target.value)}
                style={{ flex: 1, minWidth: 200, fontFamily: "'Spectral', serif", fontSize: 13.5, padding: "0.45rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff" }}
              >
                <option value="">Scegli un oggetto…</option>
                {catalogOptions.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
              <input
                type="number" min={1} value={pickQty}
                onChange={(e) => setPickQty(Math.max(1, Number(e.target.value) || 1))}
                style={{ width: 60, fontFamily: "'Spectral', serif", fontSize: 13.5, padding: "0.45rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff" }}
              />
              <GoldButton icon={Plus} disabled={!previewItem} onClick={addFromCatalog} style={{ padding: "0.5rem 1rem" }}>
                Aggiungi
              </GoldButton>
            </div>
            {previewItem && (
              <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "8px 0 0" }}>
                {formatItemStats(previewItem)}
              </p>
            )}
          </div>

          <div style={{ border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0.9rem 1rem" }}>
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: C.textMuted, margin: "0 0 8px" }}>Aggiungi oggetto personalizzato</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                type="text" placeholder="Nome dell'oggetto" value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                style={{ flex: 1, minWidth: 160, fontFamily: "'Spectral', serif", fontSize: 13.5, padding: "0.45rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff" }}
              />
              <input
                type="text" placeholder="Descrizione (opzionale)" value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                style={{ flex: 2, minWidth: 200, fontFamily: "'Spectral', serif", fontSize: 13.5, padding: "0.45rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff" }}
              />
              <input
                type="number" min={1} value={customQty}
                onChange={(e) => setCustomQty(Math.max(1, Number(e.target.value) || 1))}
                style={{ width: 60, fontFamily: "'Spectral', serif", fontSize: 13.5, padding: "0.45rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff" }}
              />
              <GoldButton icon={Plus} disabled={!customName.trim()} onClick={addCustom} style={{ padding: "0.5rem 1rem" }}>
                Aggiungi
              </GoldButton>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StepEquipment({ draft, setDraft }) {
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

/* ---------------------------------- STEP: SPELLS ---------------------------------- */

function SpellRow({ spell, selected, disabled, onToggle }) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled && !selected}
      style={{
        textAlign: "left", width: "100%", padding: "0.7rem 0.9rem", marginBottom: 6, borderRadius: 2,
        border: `1px solid ${selected ? C.wine : C.parchmentLine}`,
        borderLeft: selected ? `4px solid ${C.wine}` : "4px solid transparent",
        background: selected ? "#f5efdf" : "transparent",
        cursor: disabled && !selected ? "not-allowed" : "pointer",
        opacity: disabled && !selected ? 0.55 : 1,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
        <span style={{ fontFamily: "'Cinzel', serif", fontSize: 13.5, color: selected ? C.wineDeep : C.textOnParchment }}>
          {spell.name} <span style={{ fontFamily: "'Spectral', serif", fontStyle: "italic", fontSize: 11.5, color: C.textMuted }}>— {SCHOOLS[spell.school]}</span>
        </span>
        {selected && <Check size={14} color={C.wine} style={{ flexShrink: 0 }} />}
      </div>
      <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "3px 0 6px" }}>{spell.desc}</p>
      {spell.crunch && (
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 12, color: C.wineDeep, margin: "0 0 6px", fontWeight: 600 }}>
          <b style={{ fontFamily: "'Cinzel', serif", fontWeight: 700 }}>Meccanica:</b> {spell.crunch}
        </p>
      )}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontFamily: "'Spectral', serif", fontSize: 11, color: C.textMuted }}>
        <span><b>Tempo:</b> {spell.time}</span>
        <span><b>Gittata:</b> {spell.range}</span>
        <span><b>Componenti:</b> {spell.comp}</span>
        <span><b>Durata:</b> {spell.duration}</span>
      </div>
    </button>
  );
}

// Chiave usata in slotsUsed per uno slot: gli slot da Patto Magico (Warlock) sono un pool
// SEPARATO da quello normale anche quando condividono lo stesso livello numerico (es. un
// multiclasse Paladino/Warlock con entrambi slot di 2° livello, ma pool distinti).
function slotUsedKey(s) {
  return s.pact ? `pact-${s.level}` : `${s.level}`;
}

function SlotTracker({ slots, slotsUsed, setDraft }) {
  if (!slots.length) return null;
  const nonPact = slots.filter((s) => !s.pact);
  const pact = slots.filter((s) => s.pact);

  const setUsed = (s, count) => {
    setDraft((d) => ({ ...d, slotsUsed: { ...d.slotsUsed, [slotUsedKey(s)]: count } }));
  };
  const restGroup = (group) => {
    setDraft((d) => {
      const next = { ...d.slotsUsed };
      group.forEach((s) => { delete next[slotUsedKey(s)]; });
      return { ...d, slotsUsed: next };
    });
  };

  const renderGroup = (group, label, restLabel) => {
    if (!group.length) return null;
    return (
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: 0 }}>
            {label}
          </h3>
          <GhostButton onClick={() => restGroup(group)} style={{ borderColor: C.forest, color: C.forestDeep, padding: "0.4rem 0.8rem", fontSize: 12 }}>
            {restLabel} — recupera tutti
          </GhostButton>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {group.map((s) => {
            const used = Math.min(slotsUsed[slotUsedKey(s)] || 0, s.total);
            return (
              <div key={slotUsedKey(s)} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: 12.5, color: C.textOnParchment, minWidth: 90 }}>
                  Livello {s.level}
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  {Array.from({ length: s.total }).map((_, i) => {
                    const isUsed = i < used;
                    return (
                      <button
                        key={i}
                        onClick={() => setUsed(s, isUsed ? i : i + 1)}
                        title={isUsed ? "Segna come disponibile" : "Segna come usato"}
                        style={{
                          width: 20, height: 20, borderRadius: "50%", cursor: "pointer",
                          border: `1px solid ${C.wine}`,
                          background: isUsed ? "transparent" : C.wine,
                        }}
                      />
                    );
                  })}
                </div>
                <span style={{ fontFamily: "'Spectral', serif", fontSize: 12, color: C.textMuted }}>
                  {s.total - used}/{s.total} disponibili
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {renderGroup(nonPact, "Slot incantesimo", "Riposo lungo")}
      {renderGroup(pact, "Slot incantesimo (Patto Magico)", "Riposo breve")}
    </>
  );
}

function ResourceTracker({ resource, used, onSetUsed }) {
  const [amount, setAmount] = useState(1);
  if (resource.max == null) {
    return (
      <div style={{ marginBottom: 10 }}>
        <span style={{ fontFamily: "'Cinzel', serif", fontSize: 12.5, color: C.textOnParchment }}>{resource.name}: illimitati</span>
      </div>
    );
  }
  const usedCount = Math.min(used || 0, resource.max);
  const setUsed = (n) => onSetUsed(resource.key, n);

  if (resource.pool) {
    const remaining = resource.max - usedCount;
    return (
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: 12.5, color: C.textOnParchment }}>
            {resource.name}: <b>{remaining}</b> / {resource.max}
          </span>
          <GhostButton onClick={() => setUsed(0)} style={{ borderColor: C.forest, color: C.forestDeep, padding: "0.3rem 0.7rem", fontSize: 11 }}>
            {resource.resetOn === "short" ? "Riposo breve" : "Riposo lungo"} — recupera
          </GhostButton>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="number" min={0} max={remaining} value={amount}
            onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
            style={{ width: 60, fontFamily: "'Spectral', serif", fontSize: 13.5, padding: "0.35rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff" }}
          />
          <GhostButton
            onClick={() => setUsed(Math.min(resource.max, usedCount + Math.min(amount, remaining)))}
            disabled={remaining <= 0 || amount <= 0}
            style={{ borderColor: C.wine, color: C.wineDeep, padding: "0.35rem 0.8rem", fontSize: 12 }}
          >
            Spendi
          </GhostButton>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
        <span style={{ fontFamily: "'Cinzel', serif", fontSize: 12.5, color: C.textOnParchment }}>{resource.name}</span>
        <GhostButton onClick={() => setUsed(0)} style={{ borderColor: C.forest, color: C.forestDeep, padding: "0.3rem 0.7rem", fontSize: 11 }}>
          {resource.resetOn === "short" ? "Riposo breve" : "Riposo lungo"} — recupera
        </GhostButton>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {Array.from({ length: resource.max }).map((_, i) => {
          const isUsed = i < usedCount;
          return (
            <button
              key={i}
              onClick={() => setUsed(isUsed ? i : i + 1)}
              title={isUsed ? "Segna come disponibile" : "Segna come usato"}
              style={{
                width: 18, height: 18, borderRadius: "50%", cursor: "pointer",
                border: `1px solid ${C.forest}`,
                background: isUsed ? "transparent" : C.forest,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function SpellManager({ draft, setDraft, showPlayTools = false }) {
  const [spellSearch, setSpellSearch] = useState("");
  const cls = CLASSES.find((c) => c.id === draft.classId);

  if (!cls) {
    return <p style={{ fontFamily: "'Spectral', serif", color: C.textMuted }}>Completa prima il passo Classe.</p>;
  }

  const entries = getClassEntries(draft);
  const casterEntries = entries.filter((e) => getEffectiveCasterInfo(e.classId, e.subclassId));

  if (casterEntries.length === 0) {
    const canBecomeThirdCaster = entries.some((e) => e.classId === "guerriero" || e.classId === "ladro");
    const names = entries.map((e) => CLASSES.find((c) => c.id === e.classId)?.name).filter(Boolean).join(" / ");
    return (
      <div>
        <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: C.textOnParchment, margin: "0 0 4px" }}>Incantesimi</h2>
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textMuted }}>
          {names} non lancia{entries.length > 1 ? "no" : ""} incantesimi
          {canBecomeThirdCaster ? ", a meno di scegliere la sottoclasse Cavaliere Mistico (Guerriero) o Furfante Arcano (Ladro)." : "."}
        </p>
      </div>
    );
  }

  const slots = getEffectiveSpellSlots(draft);

  return (
    <div>
      <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: C.textOnParchment, margin: "0 0 4px" }}>Incantesimi</h2>

      {casterEntries.length > 1 && (
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textMuted, margin: "0 0 1rem", fontStyle: "italic" }}>
          Personaggio multiclasse: gli slot incantesimo sono un'unica riserva condivisa, calcolata secondo la Tabella dell'Incantatore Multiclasse (5e 2014). Il Patto Magico del Warlock resta invece un pool separato, che si recupera con un riposo breve.
        </p>
      )}

      {showPlayTools ? (
        <SlotTracker slots={slots} slotsUsed={draft.slotsUsed} setDraft={setDraft} />
      ) : (
        slots.length > 0 && (
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textOnParchment, marginBottom: 18 }}>
            <b>Slot incantesimo:</b> {slots.map((s) => `liv. ${s.level} × ${s.total}${s.pact ? " (patto)" : ""}`).join(", ")}
          </p>
        )
      )}

      <Divider />

      <input
        type="text" placeholder="Cerca un incantesimo per nome…" value={spellSearch}
        onChange={(e) => setSpellSearch(e.target.value)}
        style={{
          width: "100%", fontFamily: "'Spectral', serif", fontSize: 13.5, padding: "0.5rem 0.7rem",
          borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff", marginBottom: 18, boxSizing: "border-box",
        }}
      />

      {casterEntries.map((entry) => (
        <ClassSpellSection
          key={entry.classId}
          draft={draft}
          setDraft={setDraft}
          entry={entry}
          showPlayTools={showPlayTools}
          spellSearch={spellSearch}
          multi={casterEntries.length > 1}
        />
      ))}
    </div>
  );
}

// Selettore Metamagia (Stregone), Invocazioni Occulte e Dono del Patto (Warlock): estratti
// come componenti a sé stanti così da poter essere riusati sia nello step Incantesimi
// (ClassSpellSection) sia nel modal di level-up, senza duplicare la logica di scelta.
function MetamagicPicker({ store, updateStore, level }) {
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

function PactBoonPicker({ store, updateStore, level }) {
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

function InvocationPicker({ store, updateStore, level }) {
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

// Sezione incantesimi per UNA classe incantatrice del personaggio (store = draft per la
// classe primaria, oppure draft.multiclass per la classe secondaria da multiclasse).
function ClassSpellSection({ draft, setDraft, entry, showPlayTools, spellSearch, multi }) {
  const cls = CLASSES.find((c) => c.id === entry.classId);
  if (!cls) return null;
  const chosenSubclassId = entry.subclassId;
  const caster = getEffectiveCasterInfo(cls.id, chosenSubclassId);
  if (!caster) return null;
  const store = entry.store;
  const updateStore = entry.isPrimary
    ? (fn) => setDraft((d) => ({ ...d, ...fn(d) }))
    : (fn) => setDraft((d) => ({ ...d, multiclass: { ...d.multiclass, ...fn(d.multiclass) } }));

  const sectionHeader = multi && (
    <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 15, color: C.wineDeep, margin: "0 0 8px", paddingTop: 14, borderTop: `1px solid ${C.parchmentLine}` }}>
      {cls.name} (liv. {entry.level})
    </h3>
  );

  const maxLevelReal = getMaxSpellLevel(cls.id, entry.level, chosenSubclassId);
  if (maxLevelReal === 0) {
    return (
      <div style={{ marginBottom: 18 }}>
        {sectionHeader}
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textMuted }}>
          Al livello {entry.level}, {cls.name} non ha ancora slot di incantesimo.
          {caster.halfCaster ? " Le classi semi-incantatrici come questa ottengono i primi incantesimi al 2° livello." : ""}
          {isThirdCaster(cls.id, chosenSubclassId) ? " I terzi-incantatori ottengono i primi incantesimi al 3° livello." : ""}
        </p>
      </div>
    );
  }

  const finalScores = computeFinalScores(draft);
  const abilityMod = mod(finalScores[caster.ability]);
  const abilityName = ABILITIES.find((a) => a.key === caster.ability).name;
  const cantripsCount = caster.cantrips[Math.min(entry.level, 20) - 1];
  const spellsLimit = getSpellsLimit(cls.id, caster, entry.level, abilityMod);
  const preparedPerDay = caster.type === "spellbook" ? getPreparedPerDay(caster, entry.level, abilityMod) : null;
  const dataMax = Math.min(maxLevelReal, MAX_DATA_SPELL_LEVEL);
  const thirdCaster = isThirdCaster(cls.id, chosenSubclassId);
  const spellClassId = thirdCaster ? "mago" : cls.id;

  const domain = cls.id === "chierico" ? DIVINE_DOMAINS.find((d) => d.id === store.domainId) : null;
  const oath = cls.id === "paladino" ? PALADIN_OATHS.find((o) => o.id === store.oathId) : null;
  const patron = cls.id === "warlock" ? WARLOCK_PATRONS.find((p) => p.id === store.patronId) : null;
  const circle = cls.id === "druido" ? DRUID_CIRCLES.find((c) => c.id === store.circleId) : null;
  const subclassSpellIds = cls.id === "chierico" ? getDomainSpellIds(store.domainId, maxLevelReal)
    : cls.id === "paladino" ? getOathSpellIds(store.oathId, maxLevelReal)
      : cls.id === "druido" ? getCircleSpellIds(store.circleId, maxLevelReal)
        : [];
  const patronSpellIds = patron ? getPatronSpellIds(store.patronId, maxLevelReal) : [];
  const subclassLabel = domain ? `Dominio ${domain.name}` : oath ? `Ordine di ${oath.name}` : circle ? `Circolo — ${circle.name}` : null;

  const cantripOptions = SPELLS.filter((s) => s.level === 0 && s.classes.includes(spellClassId));
  const spellOptions = SPELLS.filter((s) => s.level >= 1 && s.level <= dataMax && !subclassSpellIds.includes(s.id) && (s.classes.includes(spellClassId) || patronSpellIds.includes(s.id)));
  const subclassSpellObjects = subclassSpellIds.map((id) => SPELLS.find((s) => s.id === id)).filter(Boolean);

  const selectedCantrips = draft.spellsKnown.filter((id) => cantripOptions.some((s) => s.id === id));
  const selectedSpells = draft.spellsKnown.filter((id) => spellOptions.some((s) => s.id === id));

  const toggleSpell = (spell, limit, currentCount) => {
    setDraft((d) => {
      const has = d.spellsKnown.includes(spell.id);
      if (has) return { ...d, spellsKnown: d.spellsKnown.filter((id) => id !== spell.id) };
      if (currentCount >= limit) return d;
      return { ...d, spellsKnown: [...d.spellsKnown, spell.id] };
    });
  };

  const byLevel = {};
  const searchTerm = (spellSearch || "").trim().toLowerCase();
  const matchesSearch = (s) => !searchTerm || s.name.toLowerCase().includes(searchTerm);
  spellOptions.filter(matchesSearch).forEach((s) => { (byLevel[s.level] = byLevel[s.level] || []).push(s); });
  const filteredCantripOptions = cantripOptions.filter(matchesSearch);

  return (
    <div style={{ marginBottom: 22 }}>
      {sectionHeader}
      <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textMuted, margin: "0 0 1.25rem" }}>
        {cls.name} lancia gli incantesimi tramite {abilityName} ({fmtMod(abilityMod)}), livello {entry.level}.
      </p>

      {cls.id === "chierico" && (
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: C.textMuted, margin: "0 0 8px" }}>Dominio Divino</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {DIVINE_DOMAINS.map((d) => (
              <Pill key={d.id} active={store.domainId === d.id} onClick={() => updateStore((s) => ({ domainId: s.domainId === d.id ? null : d.id }))}>
                {d.name}
              </Pill>
            ))}
          </div>
          {domain && (
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "8px 0 0", fontStyle: "italic" }}>
              Gli incantesimi di dominio sono sempre preparati gratuitamente e non contano nel numero di {caster.label.toLowerCase()}.
            </p>
          )}
          {(getSubclass("chierico", store.domainId)?.proficiencyChoices || []).map((spec) => (
            <ProficiencyChoicePicker
              key={spec.key}
              spec={spec}
              selected={(store.profChoices && store.profChoices[spec.key]) || []}
              onToggle={(value) => toggleProfChoice(updateStore, spec, value)}
            />
          ))}
        </div>
      )}

      {cls.id === "paladino" && (
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: C.textMuted, margin: "0 0 8px" }}>Ordine Sacro</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {PALADIN_OATHS.map((o) => (
              <Pill key={o.id} active={store.oathId === o.id} onClick={() => updateStore((s) => ({ oathId: s.oathId === o.id ? null : o.id }))}>
                {o.name}
              </Pill>
            ))}
          </div>
          {oath && (
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "8px 0 0", fontStyle: "italic" }}>
              Gli incantesimi dell'ordine sono sempre preparati gratuitamente e non contano nel numero di {caster.label.toLowerCase()}.
            </p>
          )}
        </div>
      )}

      {cls.id === "warlock" && (
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: C.textMuted, margin: "0 0 8px" }}>Patto Ultramondano</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {WARLOCK_PATRONS.map((p) => (
              <Pill key={p.id} active={store.patronId === p.id} onClick={() => updateStore((s) => ({ patronId: s.patronId === p.id ? null : p.id }))}>
                {p.name}
              </Pill>
            ))}
          </div>
          {patron && (
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "8px 0 0", fontStyle: "italic" }}>
              Gli incantesimi del patto non sono gratuiti: si aggiungono semplicemente alla lista da cui puoi scegliere i tuoi {caster.label.toLowerCase()}.
            </p>
          )}
        </div>
      )}

      {cls.id === "druido" && (
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: C.textMuted, margin: "0 0 8px" }}>Sottoclasse — Circolo della Terra o della Luna</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {DRUID_CIRCLES.map((c) => (
              <Pill key={c.id} active={store.circleId === c.id} onClick={() => updateStore((s) => ({ circleId: s.circleId === c.id ? null : c.id }))}>
                {c.name}
              </Pill>
            ))}
          </div>
          {circle && circle.id === "circolo-terra" && (
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "8px 0 0", fontStyle: "italic" }}>
              Gli incantesimi del Circolo della Terra sono sempre preparati gratuitamente e non contano nel numero di {caster.label.toLowerCase()}.
            </p>
          )}
          {circle && circle.id === "circolo-luna" && (
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "8px 0 0", fontStyle: "italic" }}>
              Il Circolo della Luna non concede incantesimi bonus: le sue feature riguardano la Forma Selvaggia in combattimento (vedi il Riepilogo/Scheda di gioco).
            </p>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginBottom: 18 }}>
        <MetricBox label="Livello incantesimi max" value={`${maxLevelReal}°`} />
        {cantripsCount > 0 && <MetricBox label="Trucchetti" value={`${selectedCantrips.length}/${cantripsCount}`} />}
        <MetricBox label={caster.label} value={`${selectedSpells.length}/${spellsLimit}`} />
        {preparedPerDay !== null && <MetricBox label="Preparabili al giorno" value={preparedPerDay} />}
      </div>

      {caster.type === "spellbook" && (
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, marginBottom: 14, fontStyle: "italic" }}>
          Il libro contiene {spellsLimit} incantesimi in tutto, ma ogni giorno se ne possono preparare solo {preparedPerDay} (Intelligenza {fmtMod(abilityMod)} + livello {entry.level}, minimo 1).
        </p>
      )}
      {caster.type === "prepared" && caster.halfCaster && (
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, marginBottom: 14, fontStyle: "italic" }}>
          Come semi-incantatore, prepara Carisma {fmtMod(abilityMod)} + metà livello (arrotondato per difetto), minimo 1.
        </p>
      )}

      {subclassLabel && subclassSpellObjects.length > 0 && (
        <>
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.forestDeep, margin: "0 0 8px" }}>
            Incantesimi del {subclassLabel} — sempre preparati
          </h3>
          {subclassSpellObjects.map((s) => (
            <SpellRow key={s.id} spell={s} selected disabled onToggle={() => { }} />
          ))}
          <Divider />
        </>
      )}

      {thirdCaster && (
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, marginBottom: 14, fontStyle: "italic" }}>
          Come terzo-incantatore, la lista è quella del Mago: {cls.id === "guerriero"
            ? "scegli soprattutto tra Ammaliamento ed Evocazione."
            : "scegli soprattutto tra Ammaliamento e Illusione."} Questa non è imposta come limite rigido dall'app.
        </p>
      )}

      {cls.id === "warlock" && getUnlockedArcanumTiers(entry.level).length > 0 && (
        <>
          <Divider />
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 4px" }}>Arcano Mistico</h3>
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "0 0 10px" }}>
            Un incantesimo fisso per livello, lanciabile una volta per riposo lungo senza consumare uno slot.
          </p>
          {getUnlockedArcanumTiers(entry.level).map((tier) => {
            const options = SPELLS.filter((s) => s.level === tier && s.classes.includes("warlock"));
            return (
              <div key={tier} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: 12.5, color: C.textOnParchment, minWidth: 90 }}>
                  Incantesimo di {tier}° livello
                </span>
                <select
                  value={store.mysticArcanum?.[tier] || ""}
                  onChange={(e) => updateStore((s) => ({ mysticArcanum: { ...s.mysticArcanum, [tier]: e.target.value || null } }))}
                  style={{ fontFamily: "'Spectral', serif", fontSize: 13, padding: "0.35rem 0.5rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff" }}
                >
                  <option value="">Scegli…</option>
                  {options.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {options.length === 0 && (
                  <span style={{ fontFamily: "'Spectral', serif", fontSize: 12, color: C.textMuted, fontStyle: "italic" }}>
                    Nessun incantesimo di {tier}° livello disponibile nel dataset per il Warlock.
                  </span>
                )}
              </div>
            );
          })}
        </>
      )}

      {maxLevelReal > MAX_DATA_SPELL_LEVEL && (
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, marginBottom: 14, fontStyle: "italic" }}>
          A questo livello {cls.name} avrebbe accesso a incantesimi fino al {maxLevelReal}° livello: questa versione dell'app propone incantesimi selezionabili fino al {MAX_DATA_SPELL_LEVEL}°.
        </p>
      )}

      {cls.id === "stregone" && <MetamagicPicker store={store} updateStore={updateStore} level={entry.level} />}

      {cls.id === "warlock" && (
        <>
          <PactBoonPicker store={store} updateStore={updateStore} level={entry.level} />
          <InvocationPicker store={store} updateStore={updateStore} level={entry.level} />
        </>
      )}

      {cls.id === "paladino" && (
        <>
          <Divider />
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 4px" }}>Colpo Divino</h3>
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "0 0 10px" }}>
            Quando colpisci una creatura con un attacco in mischia con arma, puoi spendere uno slot incantesimo per infliggere danno radioso extra al bersaglio. Il danno aumenta di 1d8 se il bersaglio è un non morto o un immondo (massimo 6d8 in quel caso).
          </p>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            {[1, 2, 3, 4, 5].map((lvl) => (
              <MetricBox key={lvl} label={`Slot di ${lvl}° liv.`} value={`${getDivineSmiteDice(lvl)}d8`} />
            ))}
          </div>
        </>
      )}

      <Divider />

      {cantripsCount > 0 && filteredCantripOptions.length > 0 && (
        <>
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 8px" }}>
            Trucchetti — scegline {cantripsCount}
          </h3>
          {filteredCantripOptions.map((s) => (
            <SpellRow
              key={s.id} spell={s} selected={draft.spellsKnown.includes(s.id)}
              disabled={selectedCantrips.length >= cantripsCount}
              onToggle={() => toggleSpell(s, cantripsCount, selectedCantrips.length)}
            />
          ))}
          <Divider />
        </>
      )}

      <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 8px" }}>
        {caster.label} — scegline {spellsLimit} tra i livelli 1–{dataMax}
      </h3>
      {Object.keys(byLevel).length === 0 && searchTerm && (
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textMuted, fontStyle: "italic" }}>
          Nessun incantesimo trovato per "{spellSearch}".
        </p>
      )}
      {Object.keys(byLevel).sort((a, b) => a - b).map((lvl) => (
        <div key={lvl} style={{ marginBottom: 14 }}>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: C.textMuted, margin: "0 0 6px" }}>
            {lvl}° livello
          </p>
          {byLevel[lvl].map((s) => (
            <SpellRow
              key={s.id} spell={s} selected={draft.spellsKnown.includes(s.id)}
              disabled={selectedSpells.length >= spellsLimit}
              onToggle={() => toggleSpell(s, spellsLimit, selectedSpells.length)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}


function getPreparedPerDay(caster, level, abilityMod) {
  const lvl = Math.max(1, Math.min(20, level || 1));
  return Math.max(1, abilityMod + lvl);
}

/* ---------------------------------- STEP: REVIEW ---------------------------------- */

function HpLevelManager({ cls, hpPerLevel, onSetMethod, levels, title = "Gestione PF per livello" }) {
  const avg = getHitDieAverage(cls.hitDie);

  // Funzione per tirare un dado
  const rollHitDie = (sides) => {
    return 1 + Math.floor(Math.random() * sides);
  };

  // Determina lo stato attuale del livello
  const getLevelState = (entry) => {
    if (entry === undefined || entry === "avg") return "avg";
    if (Number.isInteger(entry) && entry > 0) return "rolled";
    return "manual";
  };

  return (
    <div style={{ marginBottom: 18 }}>
      <Divider />
      <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 4px" }}>
        {title}
      </h3>
      <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "0 0 10px" }}>
        Dado vita d{cls.hitDie} (media {avg} + mod. Costituzione per livello). Scegli "Media", "🎲 Tiro" o "Manuale".
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {levels.map((lvl) => {
          const entry = hpPerLevel?.[lvl];
          const state = getLevelState(entry);
          const displayValue = state === "avg" ? avg : (entry || "");

          return (
            <div key={lvl} style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              border: `1px solid ${C.parchmentLine}`,
              borderRadius: 2,
              padding: "0.3rem 0.5rem",
              flexWrap: "wrap",
              background: state !== "avg" ? "rgba(125, 31, 56, 0.04)" : "transparent",
            }}>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: 11.5, color: C.textOnParchment, minWidth: 42 }}>
                Liv. {lvl}
              </span>

              {/* Pulsante Media */}
              <Pill
                active={state === "avg"}
                onClick={() => onSetMethod(lvl, "avg")}
              >
                Media ({avg})
              </Pill>

              {/* Pulsante Tiro */}
              <Pill
                active={state === "rolled"}
                onClick={() => {
                  const roll = rollHitDie(cls.hitDie);
                  onSetMethod(lvl, roll);
                }}
              >
                🎲 Tiro
              </Pill>

              {/* Pulsante Manuale */}
              <Pill
                active={state === "manual"}
                onClick={() => onSetMethod(lvl, state === "manual" ? entry : avg)}
              >
                Manuale
              </Pill>

              {/* Input per il valore manuale o visualizzazione del valore tirato */}
              {state !== "avg" && (
                <input
                  type="number"
                  min={1}
                  max={cls.hitDie}
                  value={displayValue}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (!isNaN(val) && val >= 1 && val <= cls.hitDie) {
                      onSetMethod(lvl, val);
                    }
                  }}
                  style={{
                    width: 44,
                    fontFamily: "'Spectral', serif",
                    fontSize: 12.5,
                    padding: "0.25rem",
                    borderRadius: 2,
                    border: `1px solid ${state === "rolled" ? C.gold : C.parchmentLine}`,
                    background: state === "rolled" ? "rgba(201, 162, 39, 0.08)" : "#fff",
                    color: state === "rolled" ? C.gold : C.textOnParchment,
                  }}
                />
              )}

              {state === "rolled" && (
                <span style={{
                  fontFamily: "'Spectral', serif",
                  fontSize: 11,
                  color: C.gold,
                  marginLeft: 2
                }}>
                  🎲
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HpTracker({ maxHp, draft, setDraft }) {
  const [amount, setAmount] = useState(1);
  const current = draft.currentHp == null ? maxHp : Math.min(draft.currentHp, maxHp);
  const temp = draft.tempHp || 0;

  const applyDamage = () => {
    let dmg = Math.max(0, amount);
    let newTemp = temp;
    if (newTemp > 0) {
      const absorbed = Math.min(newTemp, dmg);
      newTemp -= absorbed;
      dmg -= absorbed;
    }
    const newCurrent = Math.max(0, current - dmg);
    setDraft((d) => ({ ...d, currentHp: newCurrent, tempHp: newTemp }));
  };
  const applyHeal = () => {
    const newCurrent = Math.min(maxHp, current + Math.max(0, amount));
    setDraft((d) => ({ ...d, currentHp: newCurrent }));
  };
  const addTempHp = () => {
    setDraft((d) => ({ ...d, tempHp: Math.max(d.tempHp || 0, Math.max(0, amount)) }));
  };

  return (
    <div style={{ border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0.85rem 1rem", marginBottom: 18 }}>
      <div style={{ marginBottom: 10 }}>
        <span style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: current <= maxHp / 3 ? C.danger : C.textOnParchment }}>
          {current} / {maxHp} PF{temp > 0 ? <span style={{ color: C.forestDeep, fontSize: 14 }}> (+{temp} temp)</span> : null}
        </span>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="number" min={0} value={amount}
          onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
          style={{ width: 60, fontFamily: "'Spectral', serif", fontSize: 13.5, padding: "0.4rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff" }}
        />
        <GhostButton onClick={applyDamage} style={{ borderColor: C.danger, color: C.danger, padding: "0.4rem 0.8rem", fontSize: 12.5 }}>
          Danno
        </GhostButton>
        <GoldButton onClick={applyHeal} style={{ padding: "0.4rem 0.8rem", fontSize: 12.5 }}>
          Cura
        </GoldButton>
        <GhostButton onClick={addTempHp} style={{ borderColor: C.forest, color: C.forestDeep, padding: "0.4rem 0.8rem", fontSize: 12.5 }}>
          + PF Temporanei
        </GhostButton>
      </div>
    </div>
  );
}

// Riserva di Dadi Vita del personaggio: un pool per ciascuna taglia di dado presente tra le
// classi (primaria + eventuale secondaria da multiclasse). Due classi con lo stesso dado
// vita condividono lo stesso pool, come da regole.
function getHitDicePools(draft) {
  const pools = {};
  getClassEntries(draft).forEach((e) => {
    const cls = CLASSES.find((c) => c.id === e.classId);
    if (!cls) return;
    pools[cls.hitDie] = (pools[cls.hitDie] || 0) + (e.level || 1);
  });
  return Object.entries(pools)
    .map(([die, max]) => ({ die: Number(die), max }))
    .sort((a, b) => b.die - a.die);
}

function rollDie(sides) {
  return 1 + Math.floor(Math.random() * sides);
}

// Pannello dei riposi: spesa dei Dadi Vita (riposo breve) e i due pulsanti "Riposo Breve" /
// "Riposo Lungo" che applicano gli effetti CORRETTI e completi previsti dalla 5e 2014.
function RestControls({ draft, setDraft, maxHp, conMod }) {
  const [lastRoll, setLastRoll] = useState(null);
  const [showShortRestModal, setShowShortRestModal] = useState(false);
  const [hdToSpend, setHdToSpend] = useState(0);

  const pools = getHitDicePools(draft);
  const totalHD = pools.reduce((sum, p) => sum + p.max, 0);
  const spentTotal = Object.values(draft.hitDiceSpent || {}).reduce((a, b) => a + b, 0);
  const availableTotal = totalHD - spentTotal;
  const current = draft.currentHp == null ? maxHp : Math.min(draft.currentHp, maxHp);

  // Funzione per tirare un dado
  const rollDie = (sides) => {
    return 1 + Math.floor(Math.random() * sides);
  };

  // Funzione unica per spendere un dado vita
  const spendHitDie = (die) => {
    const spent = (draft.hitDiceSpent && draft.hitDiceSpent[die]) || 0;
    const pool = pools.find((p) => p.die === die);
    if (!pool || spent >= pool.max || current >= maxHp) return;
    const roll = rollDie(die);
    const healed = Math.max(0, roll + conMod);
    setLastRoll({ die, roll, conMod, healed });
    setDraft((d) => {
      const newCurrent = Math.min(maxHp, (d.currentHp == null ? maxHp : d.currentHp) + healed);
      return {
        ...d,
        currentHp: newCurrent,
        hitDiceSpent: { ...d.hitDiceSpent, [die]: ((d.hitDiceSpent && d.hitDiceSpent[die]) || 0) + 1 },
      };
    });
  };

  // Spende tutti i Dadi Vita disponibili
  const spendAllHitDice = () => {
    let healed = 0;
    const newSpent = { ...draft.hitDiceSpent };
    let currentHp = draft.currentHp == null ? maxHp : Math.min(draft.currentHp, maxHp);

    pools.forEach((p) => {
      const spent = newSpent[p.die] || 0;
      const available = p.max - spent;
      for (let i = 0; i < available; i++) {
        if (currentHp >= maxHp) break;
        const roll = rollDie(p.die);
        const healAmount = Math.max(0, roll + conMod);
        healed += healAmount;
        currentHp = Math.min(maxHp, currentHp + healAmount);
        newSpent[p.die] = (newSpent[p.die] || 0) + 1;
      }
    });

    if (healed > 0) {
      setLastRoll({ die: 0, roll: 0, conMod, healed, all: true });
      setDraft((d) => ({
        ...d,
        currentHp: Math.min(maxHp, (d.currentHp || 0) + healed),
        hitDiceSpent: newSpent,
      }));
    }
  };

  // Spende un numero specifico di Dadi Vita (usato nel modal)
  const spendMultipleHitDice = (count) => {
    let remaining = count;
    let healed = 0;
    const newSpent = { ...draft.hitDiceSpent };
    let currentHpNow = draft.currentHp == null ? maxHp : Math.min(draft.currentHp, maxHp);

    pools.forEach((p) => {
      if (remaining <= 0) return;
      const spent = newSpent[p.die] || 0;
      const available = p.max - spent;
      const toUse = Math.min(available, remaining);
      for (let i = 0; i < toUse; i++) {
        if (currentHpNow >= maxHp) break;
        const roll = rollDie(p.die);
        const healAmount = Math.max(0, roll + conMod);
        healed += healAmount;
        currentHpNow = Math.min(maxHp, currentHpNow + healAmount);
        newSpent[p.die] = (newSpent[p.die] || 0) + 1;
        remaining--;
      }
    });

    if (healed > 0) {
      setDraft((d) => ({
        ...d,
        currentHp: Math.min(maxHp, (d.currentHp || 0) + healed),
        hitDiceSpent: newSpent,
      }));
      setLastRoll({ die: 0, roll: 0, conMod, healed, all: true });
    }
  };

  // Riposo Breve (1 ora): recupera risorse "short" e slot del Warlock
  const performShortRest = () => {
    setDraft((d) => {
      // 1. Recupera risorse della classe primaria
      const primaryCls = CLASSES.find((c) => c.id === d.classId);
      const nextResourcesUsed = { ...d.resourcesUsed };
      if (primaryCls) {
        getAllClassResources(primaryCls.id, getChosenSubclassId(d, primaryCls.id), d.level, d.mysticArcanum)
          .filter((r) => r.resetOn === "short")
          .forEach((r) => { delete nextResourcesUsed[r.key]; });
      }

      // 2. Recupera risorse della classe secondaria (multiclasse)
      let nextMulticlass = d.multiclass;
      if (d.multiclass && d.multiclass.classId) {
        const mcCls = CLASSES.find((c) => c.id === d.multiclass.classId);
        const mcResourcesUsed = { ...d.multiclass.resourcesUsed };
        if (mcCls) {
          getAllClassResources(mcCls.id, getChosenSubclassId(d.multiclass, mcCls.id), d.multiclass.level, d.multiclass.mysticArcanum)
            .filter((r) => r.resetOn === "short")
            .forEach((r) => { delete mcResourcesUsed[r.key]; });
        }
        nextMulticlass = { ...d.multiclass, resourcesUsed: mcResourcesUsed };
      }

      // 3. Recupera gli slot del Patto Magico (Warlock)
      const nextSlotsUsed = { ...d.slotsUsed };
      Object.keys(nextSlotsUsed).forEach((k) => { if (k.startsWith("pact-")) delete nextSlotsUsed[k]; });

      return {
        ...d,
        resourcesUsed: nextResourcesUsed,
        multiclass: nextMulticlass,
        slotsUsed: nextSlotsUsed
      };
    });

    // 4. Mostra il modal per i Dadi Vita
    setLastRoll(null);
    if (availableTotal > 0 && current < maxHp) {
      setShowShortRestModal(true);
      setHdToSpend(Math.min(availableTotal, 1)); // Default a 1
    }
  };

  // Riposo Lungo (8 ore)
  const performLongRest = () => {
    setDraft((d) => {
      const next = { ...d, currentHp: maxHp, tempHp: 0, resourcesUsed: {}, slotsUsed: {}, sorceryPointsUsed: 0 };
      if (next.multiclass && next.multiclass.classId) {
        next.multiclass = { ...next.multiclass, resourcesUsed: {} };
      }

      // Recupera metà dei Dadi Vita spesi (arrotondato per difetto, minimo 1)
      const currentPools = getHitDicePools(d);
      const totalDice = currentPools.reduce((sum, p) => sum + p.max, 0);
      let toRecover = Math.max(1, Math.floor(totalDice / 2));
      const nextSpent = { ...(d.hitDiceSpent || {}) };

      currentPools.forEach((p) => {
        if (toRecover <= 0) return;
        const spent = nextSpent[p.die] || 0;
        const recoverHere = Math.min(spent, toRecover);
        nextSpent[p.die] = spent - recoverHere;
        toRecover -= recoverHere;
      });

      next.hitDiceSpent = nextSpent;
      return next;
    });
    setLastRoll(null);
    setShowShortRestModal(false);
  };

  return (
    <div style={{ border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0.85rem 1rem", marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
        <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: 0 }}>Riposi</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <GhostButton
            onClick={performShortRest}
            style={{ borderColor: C.forest, color: C.forestDeep, padding: "0.4rem 0.9rem", fontSize: 12.5 }}
          >
            Riposo Breve (1 ora)
          </GhostButton>
          <GoldButton onClick={performLongRest} style={{ padding: "0.4rem 0.9rem", fontSize: 12.5 }}>
            Riposo Lungo (8 ore)
          </GoldButton>
        </div>
      </div>

      <p style={{ fontFamily: "'Spectral', serif", fontSize: 11.5, color: C.textMuted, margin: "0 0 10px", fontStyle: "italic" }}>
        Breve: recupera risorse "riposo breve" e slot del Patto Magico. Lungo: PF pieni, tutte le risorse, metà Dadi Vita spesi (min. 1).
      </p>

      {totalHD > 0 && (
        <div style={{ marginTop: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: C.textMuted, margin: 0 }}>
              Dadi Vita (mod. Costituzione {fmtMod(conMod)})
            </p>
            {availableTotal > 0 && current < maxHp && (
              <GhostButton
                onClick={spendAllHitDice}
                style={{ borderColor: C.wine, color: C.wineDeep, padding: "0.25rem 0.6rem", fontSize: 11 }}
              >
                Spendi tutti ({availableTotal})
              </GhostButton>
            )}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {pools.map((p) => {
              const spent = (draft.hitDiceSpent && draft.hitDiceSpent[p.die]) || 0;
              const available = p.max - spent;
              return (
                <div key={p.die} style={{ display: "flex", alignItems: "center", gap: 8, border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0.35rem 0.6rem" }}>
                  <span style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textOnParchment }}>
                    d{p.die}: {available}/{p.max}
                  </span>
                  <GhostButton
                    onClick={() => spendHitDie(p.die)}
                    disabled={available <= 0 || current >= maxHp}
                    style={{ borderColor: C.wine, color: C.wineDeep, padding: "0.25rem 0.6rem", fontSize: 11.5 }}
                  >
                    Spendi 1
                  </GhostButton>
                </div>
              );
            })}
          </div>
          {lastRoll && (
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 12, color: C.forestDeep, margin: "8px 0 0" }}>
              {lastRoll.all
                ? `Spesi ${lastRoll.healed > 0 ? 'tutti i Dadi Vita disponibili' : 'nessun Dado Vita'} → recuperati ${lastRoll.healed} PF.`
                : `Tiro: 1d${lastRoll.die} = ${lastRoll.roll} ${fmtMod(lastRoll.conMod)} → recuperati ${lastRoll.healed} PF.`
              }
            </p>
          )}
        </div>
      )}

      {/* Modal per la spesa dei Dadi Vita durante il riposo breve */}
      {showShortRestModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: C.parchment,
            padding: "2rem",
            borderRadius: 4,
            maxWidth: 420,
            width: "90%",
            border: `1px solid ${C.gold}`,
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          }}>
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 18, color: C.wineDeep, margin: "0 0 10px" }}>
              Riposo Breve
            </h3>
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textOnParchment, margin: "0 0 16px" }}>
              Hai completato un riposo breve. Vuoi spendere dei Dadi Vita per recuperare PF?
            </p>

            <div style={{ marginBottom: 16 }}>
              <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textMuted, margin: "0 0 8px" }}>
                Dadi Vita disponibili: <b>{availableTotal}</b>
              </p>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  type="number"
                  min={0}
                  max={availableTotal}
                  value={hdToSpend}
                  onChange={(e) => setHdToSpend(Math.min(availableTotal, Math.max(0, Number(e.target.value) || 0)))}
                  style={{
                    width: 80,
                    fontFamily: "'Spectral', serif",
                    fontSize: 16,
                    padding: "0.5rem",
                    borderRadius: 2,
                    border: `1px solid ${C.parchmentLine}`,
                    background: "#fff",
                  }}
                />
                <span style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textMuted }}>
                  Dadi Vita da spendere
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <GhostButton
                onClick={() => { setShowShortRestModal(false); setHdToSpend(0); }}
                style={{ borderColor: C.parchmentLine, color: C.textMuted }}
              >
                Salta
              </GhostButton>
              {availableTotal > 0 && (
                <GhostButton
                  onClick={() => { spendAllHitDice(); setShowShortRestModal(false); setHdToSpend(0); }}
                  style={{ borderColor: C.forest, color: C.forestDeep }}
                >
                  Spendi tutti
                </GhostButton>
              )}
              <GoldButton
                onClick={() => {
                  spendMultipleHitDice(hdToSpend);
                  setShowShortRestModal(false);
                  setHdToSpend(0);
                }}
                disabled={hdToSpend <= 0}
              >
                Spendi {hdToSpend} HD
              </GoldButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Selettore delle Discipline Elementali (Monaco — Via dei Quattro Elementi). Segue lo stesso
// pattern di Metamagia/Invocazioni Occulte: un numero di discipline "conosciute" cresce col
// livello e il giocatore le sceglie da un elenco filtrato per prerequisito di livello.
function ElementalDisciplinePicker({ store, updateStore, level, title = "Discipline Elementali" }) {
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

function CharacterSheetView({ draft, setDraft, showPlayTools = false }) {
  const race = RACES.find((r) => r.id === draft.raceId);
  const cls = CLASSES.find((c) => c.id === draft.classId);
  const bg = getSelectedBackground(draft);
  const chosenSubclassId = cls ? getChosenSubclassId(draft, cls.id) : null;

  const mc = draft.multiclass && draft.multiclass.classId ? draft.multiclass : null;
  const mcCls = mc ? CLASSES.find((c) => c.id === mc.classId) : null;
  const mcChosenSubclassId = mcCls ? getChosenSubclassId(mc, mcCls.id) : null;
  const mcSubclass = mcCls ? getSubclass(mcCls.id, mcChosenSubclassId) : null;
  const mcSubclassFeatures = mcCls ? getUnlockedSubclassFeatures(mcCls.id, mcChosenSubclassId, mc.level) : [];
  const mcUpdateStore = (fn) => setDraft((d) => ({ ...d, multiclass: { ...d.multiclass, ...fn(d.multiclass) } }));

  // Stregone, Magia Selvaggia: tira lo Sconvolgimento (2 tiri da scegliere dal 14° livello, Caos Controllato).
  const wildMagicLevel = (cls?.id === "stregone" && chosenSubclassId === "magia-selvaggia") ? draft.level
    : (mcCls?.id === "stregone" && mcChosenSubclassId === "magia-selvaggia") ? mc.level
    : 0;
  const [wildSurgeRolls, setWildSurgeRolls] = useState(null);
  const rollWildSurge = () => {
    const times = wildMagicLevel >= 14 ? 2 : 1;
    setWildSurgeRolls(Array.from({ length: times }, () => rollWildMagicSurge()));
  };

  const totalLevel = getTotalCharacterLevel(draft);
  const raceBonus = useMemo(() => getRaceBonus(race, draft.raceAbilityPicks || draft.halfElfPicks), [race, draft.raceAbilityPicks, draft.halfElfPicks]);
  const asiBonus = useMemo(() => getAsiBonus(draft), [draft.asiChoices, draft.levelChoiceType, draft.featChoices, draft.featAbilityChoices, draft.classId, draft.level, draft.multiclass, draft.raceFeatId, draft.raceFeatAbilityChoice]);
  const finalScores = useMemo(() => computeFinalScores(draft), [draft]);

  const hp = cls ? computeMaxHp(draft, cls, race, mod(finalScores.con)) : null;
  const equippedArmor = draft.inventory.find((it) => it.category === "armatura" && it.equipped);
  const equippedShield = draft.inventory.find((it) => it.category === "scudo" && it.equipped);
  const dexMod = mod(finalScores.dex);
  const hasDraconicResilience = (cls && hasDraconicResilienceAc(cls.id, chosenSubclassId)) || (mcCls && hasDraconicResilienceAc(mcCls.id, mcChosenSubclassId));

  // Calcolo CA con bonus da Stile "Difesa"
  const fightingStyleAcBonus =
    getFightingStyleAcBonus(draft, cls?.id, !!equippedArmor) +
    (mcCls ? getFightingStyleAcBonus(mc, mcCls.id, !!equippedArmor) : 0);

  let ac = 10 + dexMod + fightingStyleAcBonus;
  if (equippedArmor) {
    const base = parseInt(String(equippedArmor.ac), 10) || 10;
    if (equippedArmor.tipo === "pesante") ac = base + fightingStyleAcBonus;
    else if (equippedArmor.tipo === "media") ac = base + Math.min(2, dexMod) + fightingStyleAcBonus;
    else ac = base + dexMod + fightingStyleAcBonus;
  } else if (hasDraconicResilience) {
    ac = 13 + dexMod + fightingStyleAcBonus;
  }
  const shieldBonus = equippedShield ? (parseInt(String(equippedShield.ac).replace("+", ""), 10) || 2) : 0;
  ac += shieldBonus;
  const acSourceLabel = equippedArmor
    ? `${equippedArmor.name}${equippedShield ? " + Scudo" : ""}${fightingStyleAcBonus > 0 ? " + Difesa" : ""}`
    : hasDraconicResilience
      ? `Resilienza Draconica (13 + Destrezza)${equippedShield ? " + Scudo" : ""}${fightingStyleAcBonus > 0 ? " + Difesa" : ""}`
      : equippedShield ? "Solo scudo (senza armatura)" : "Senza armatura (10 + Destrezza)";
  const granted = getGrantedProficiencies(draft);
  const allSkills = [...new Set([...(bg ? bg.skills : []), ...draft.classSkills, ...(draft.raceSkillPicks || []), ...(mc?.bonusSkillPick ? [mc.bonusSkillPick] : []), ...granted.skills])];
  const slots = getEffectiveSpellSlots(draft);
  const prof = getProficiencyBonus(totalLevel);
  const initiative = mod(finalScores.dex);

  const savingThrows = ABILITIES.map((a) => {
    const proficient = !!((cls && cls.saves.some((s) => abilityKeyByName(s) === a.key)) || (mcCls && mcCls.saves.some((s) => abilityKeyByName(s) === a.key)));
    return { ...a, proficient, bonus: mod(finalScores[a.key]) + (proficient ? prof : 0) };
  });

  const expertiseCount = getClassEntries(draft).reduce((sum, e) => sum + getExpertiseCount(e.classId, e.level), 0);
  const expertiseSkills = draft.expertiseSkillIds || [];
  const toggleExpertise = (skillName) => setDraft((d) => {
    const list = d.expertiseSkillIds || [];
    const has = list.includes(skillName);
    if (has) return { ...d, expertiseSkillIds: list.filter((s) => s !== skillName) };
    if (list.length >= expertiseCount) return d;
    return { ...d, expertiseSkillIds: [...list, skillName] };
  });

  const skillsList = Object.entries(SKILL_ABILITY).map(([name, key]) => {
    const proficient = allSkills.includes(name);
    const expert = proficient && expertiseSkills.includes(name);
    return { name, key, proficient, expert, bonus: mod(finalScores[key]) + (proficient ? prof : 0) + (expert ? prof : 0) };
  }).sort((a, b) => a.name.localeCompare(b.name));

  const passivePerception = 10 + (skillsList.find((s) => s.name === "Percezione")?.bonus || 0);

  // Le armi effettivamente "impugnate" sono solo quelle equipaggiate: gli stili di combattimento
  // (Duellante, Combattimento con Due Armi, Armi Possenti) dipendono da COSA hai in mano in quel
  // momento, non da ogni arma posseduta nello zaino. La coppia principale/secondaria per il
  // Combattimento con Due Armi è la prima e la seconda arma equipaggiata a una mano (impugnatura
  // effettiva, non il campo statico del catalogo), ed entrambe devono essere Leggere.
  const equippedWeapons = draft.inventory.filter((i) => i.category === "arma" && i.equipped);
  const equippedOneHanded = equippedWeapons.filter((w) => getEffectiveGrip(draft, w) === "una mano");
  const mainHand = equippedOneHanded[0] || null;
  const offHand = equippedOneHanded[1] || null;
  const isLightWeapon = (w) => (w.properties || []).some((p) => p.includes("Leggera"));
  const validTwoWeaponPair = !!(mainHand && offHand && isLightWeapon(mainHand) && isLightWeapon(offHand));

  const weaponAttacks = draft.inventory.filter((it) => it.category === "arma").map((it) => {
    const finesse = (it.properties || []).some((p) => p.includes("Finezza"));
    const ranged = (it.properties || []).some((p) => p.includes("Munizioni"));
    const abilityKey = finesse ? (mod(finalScores.dex) >= mod(finalScores.str) ? "dex" : "str") : ranged ? "dex" : "str";
    const abilityMod = mod(finalScores[abilityKey]);

    // Bonus da Stili di Combattimento (classe primaria + multiclass) — solo se l'arma è equipaggiata.
    const styleStores = [draft, ...(draft.multiclass ? [draft.multiclass] : [])];
    const attackStyleBonus = it.equipped ? styleStores.reduce((sum, store) => {
      // Determina a quale classe appartiene questo store
      const storeClsId = store === draft ? draft.classId : (store.classId || null);
      return sum + getFightingStyleAttackBonus(store, storeClsId, ranged);
    }, 0) : 0;
    const effectiveGrip = getEffectiveGrip(draft, it);
    const isTwoHanded = effectiveGrip === "due mani";
    const isVersatile = (it.properties || []).some((p) => p.includes("Versatile"));
    const isMelee = !ranged;

    // Duellante: solo l'unica arma equipaggiata, impugnata davvero a una mano.
    const duelingEligible = it.equipped && isMelee && effectiveGrip === "una mano" && equippedWeapons.length === 1;
    const damageStyleBonus = styleStores.reduce(
      (sum, store) => {
        const storeClsId = store === draft ? draft.classId : (store.classId || null);
        return sum + getFightingStyleDamageBonus(store, storeClsId, isMelee, duelingEligible);
      },
      0
    );
    // Armi Possenti: solo se l'arma è davvero impugnata a due mani (fissa, o versatile col toggle attivo).
    const canUseGreatWeapon = it.equipped && isMelee && isTwoHanded;
    const hasGreatWeapon = styleStores.some((store) => getFightingStyleGreatWeapon(store));
    const greatWeaponActive = hasGreatWeapon && canUseGreatWeapon;

    // Combattimento con Due Armi: bonus solo sull'arma secondaria della coppia equipaggiata valida.
    const hasTwoWeapon = styleStores.some((store) => getFightingStyleTwoWeapon(store));
    const isOffhandOfPair = validTwoWeaponPair && it.equipped && it.uid === offHand.uid;
    const twoWeaponBonus = hasTwoWeapon && isOffhandOfPair ? abilityMod : 0;

    const proficient = isProficientWithWeapon(draft, it);
    const attackBonus = (proficient ? prof : 0) + abilityMod + attackStyleBonus;
    const damageBonus = abilityMod + damageStyleBonus + twoWeaponBonus;
    const effectiveDamage = isTwoHanded ? (getVersatileDamage(it.properties) || it.damage) : it.damage;

    return {
      ...it,
      abilityKey,
      attackBonus,
      proficient,
      damageMod: damageBonus,
      damage: effectiveDamage,
      isMelee,
      isTwoHanded,
      isVersatile,
      greatWeaponActive, // Flag per mostrare che lo stile è attivo
      hasTwoWeaponFighting: hasTwoWeapon && isOffhandOfPair,
      damageString: `${effectiveDamage}${greatWeaponActive ? ' (ritira 1 e 2)' : ''}`
    };
  });

  // Protezione richiede di impugnare uno scudo (PHB 2014): la reazione non è disponibile solo
  // perché lo stile è stato scelto, serve anche uno scudo equipaggiato.
  const topStyleStores = [draft, ...(draft.multiclass ? [draft.multiclass] : [])];
  const hasProtectionFlag = !!equippedShield && topStyleStores.some((store) => getFightingStyleProtection(store));
  const hasTwoWeaponFightingFlag = weaponAttacks.some(w => w.hasTwoWeaponFighting);

  const subclass = cls ? getSubclass(cls.id, chosenSubclassId) : null;
  const subclassFeatures = cls ? getUnlockedSubclassFeatures(cls.id, chosenSubclassId, draft.level) : [];
  const chosenFeats = getChosenFeats(draft);

  // Risorse di classe (primaria + eventuale secondaria)
  const classResourceGroups = [];
  if (cls) {
    const resources = getAllClassResources(cls.id, chosenSubclassId, draft.level, draft.mysticArcanum, mod(finalScores.cha));
    if (resources.length) classResourceGroups.push({ className: cls.name, resources, used: draft.resourcesUsed, onSetUsed: (key, n) => setDraft((d) => ({ ...d, resourcesUsed: { ...d.resourcesUsed, [key]: n } })) });
  }
  if (mcCls) {
    const resources = getAllClassResources(mcCls.id, mcChosenSubclassId, mc.level, mc.mysticArcanum, mod(finalScores.cha));
    if (resources.length) classResourceGroups.push({ className: mcCls.name, resources, used: mc.resourcesUsed, onSetUsed: (key, n) => mcUpdateStore((s) => ({ resourcesUsed: { ...s.resourcesUsed, [key]: n } })) });
  }
  const totalSorcererLevels = getClassEntries(draft)
    .filter(e => e.classId === "stregone")
    .reduce((sum, e) => sum + (e.level || 0), 0);

  if (totalSorcererLevels > 0) {
    classResourceGroups.push({
      className: "Stregone (totale)",
      resources: [{
        key: "sorcery-points",
        name: "Punti Stregoneria",
        max: totalSorcererLevels,
        resetOn: "long",
        pool: true,
      }],
      used: { "sorcery-points": draft.sorceryPointsUsed || 0 },
      onSetUsed: (key, n) => setDraft(d => ({ ...d, sorceryPointsUsed: n })),
    });
  }
  // Meccaniche di classe
  const mechanicsGroups = [];
  if (cls) {
    const list = getClassMechanicsList(cls.id, draft.level, chosenSubclassId);
    if (list.length) mechanicsGroups.push({ className: cls.name, list });
  }
  if (mcCls) {
    const list = getClassMechanicsList(mcCls.id, mc.level, mcChosenSubclassId);
    if (list.length) mechanicsGroups.push({ className: mcCls.name, list });
  }



  // Feature di sottoclasse
  const subclassFeatureGroups = [];
  if (subclass && subclassFeatures.length) subclassFeatureGroups.push({ className: cls.name, subclassName: subclass.name, features: subclassFeatures });
  if (mcSubclass && mcSubclassFeatures.length) subclassFeatureGroups.push({ className: mcCls.name, subclassName: mcSubclass.name, features: mcSubclassFeatures });

  // Classi incantatrici
  const casterEntries = getClassEntries(draft).filter((e) => getEffectiveCasterInfo(e.classId, e.subclassId));
  const casterMetrics = casterEntries.map((e) => {
    const casterInfo = getEffectiveCasterInfo(e.classId, e.subclassId);
    const clsName = CLASSES.find((c) => c.id === e.classId)?.name || e.classId;
    return {
      classId: e.classId, className: clsName,
      dc: 8 + prof + mod(finalScores[casterInfo.ability]),
      attack: prof + mod(finalScores[casterInfo.ability]),
    };
  });
  const allSpellIds = [...new Set([
    ...draft.spellsKnown,
    ...(cls && cls.id === "chierico" ? getDomainSpellIds(draft.domainId, getMaxSpellLevel(cls.id, draft.level, chosenSubclassId)) : []),
    ...(cls && cls.id === "paladino" ? getOathSpellIds(draft.oathId, getMaxSpellLevel(cls.id, draft.level, chosenSubclassId)) : []),
    ...(cls && cls.id === "druido" ? getCircleSpellIds(draft.circleId, getMaxSpellLevel(cls.id, draft.level, chosenSubclassId)) : []),
    ...(mcCls && mcCls.id === "chierico" ? getDomainSpellIds(mc.domainId, getMaxSpellLevel(mcCls.id, mc.level, mcChosenSubclassId)) : []),
    ...(mcCls && mcCls.id === "paladino" ? getOathSpellIds(mc.oathId, getMaxSpellLevel(mcCls.id, mc.level, mcChosenSubclassId)) : []),
    ...(mcCls && mcCls.id === "druido" ? getCircleSpellIds(mc.circleId, getMaxSpellLevel(mcCls.id, mc.level, mcChosenSubclassId)) : []),
  ])];

  const classLabel = cls
    ? mcCls
      ? `${cls.name} ${draft.level}${subclass ? ` (${subclass.name})` : ""} / ${mcCls.name} ${mc.level}${mcSubclass ? ` (${mcSubclass.name})` : ""}`
      : `${cls.name} (liv. ${draft.level})${subclass ? ` — ${subclass.name}` : ""}`
    : "—";

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "var(--g3)", gap: 10, marginBottom: 18 }}>
        <MetricBox label="Razza" value={race ? race.name : "—"} />
        <MetricBox label="Classe" value={classLabel} hint={mcCls ? `Livello personaggio totale: ${totalLevel}` : undefined} />
        <MetricBox label="Background" value={bg ? bg.name : "—"} />
        <MetricBox label="Punti ferita" value={hp ?? "—"} />
        <MetricBox label="Classe Armatura (CA)" value={ac} hint={acSourceLabel} />
        <MetricBox label="Velocità" value={race ? `${ftToM(race.speed)} m` : "—"} />
        <MetricBox label="Bonus di competenza" value={fmtMod(prof)} />
        <MetricBox label="Iniziativa" value={fmtMod(initiative)} />
        <MetricBox label="Percezione passiva" value={passivePerception} />
      </div>

      {bg && (bg.featureDesc || draft.personalityTrait1 || draft.personalityTrait2 || draft.ideal || draft.bond || draft.flaw) && (
        <div style={{ border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0.7rem 0.9rem", marginBottom: 18 }}>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: C.wineDeep, margin: "0 0 4px" }}>
            Background — {bg.name}
          </p>
          {bg.featureDesc && (
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "0 0 8px" }}>
              <b>{bg.feature}:</b> {bg.featureDesc}
            </p>
          )}
          {(draft.personalityTrait1 || draft.personalityTrait2 || draft.ideal || draft.bond || draft.flaw) && (
            <div style={{ display: "grid", gridTemplateColumns: "var(--g2)", gap: "4px 18px", fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textOnParchment }}>
              {draft.personalityTrait1 && <p style={{ margin: 0 }}><b>Tratto:</b> {draft.personalityTrait1}</p>}
              {draft.personalityTrait2 && <p style={{ margin: 0 }}><b>Tratto:</b> {draft.personalityTrait2}</p>}
              {draft.ideal && <p style={{ margin: 0 }}><b>Ideale:</b> {draft.ideal}</p>}
              {draft.bond && <p style={{ margin: 0 }}><b>Legame:</b> {draft.bond}</p>}
              {draft.flaw && <p style={{ margin: 0 }}><b>Difetto:</b> {draft.flaw}</p>}
            </div>
          )}
        </div>
      )}

      {mcCls && (
        <div style={{ border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0.7rem 0.9rem", marginBottom: 18 }}>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: C.wineDeep, margin: "0 0 4px" }}>
            Multiclasse — competenze parziali da {mcCls.name}
          </p>
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: 0 }}>
            {MULTICLASS_PROFICIENCIES[mcCls.id]}
          </p>
          {MULTICLASS_BONUS_SKILL_CLASS.includes(mcCls.id) && (
            <div style={{ marginTop: 8 }}>
              <select
                value={mc.bonusSkillPick || ""}
                onChange={(e) => mcUpdateStore(() => ({ bonusSkillPick: e.target.value || null }))}
                style={{ fontFamily: "'Spectral', serif", fontSize: 13, padding: "0.35rem 0.5rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff" }}
              >
                <option value="">Scegli la competenza bonus da {mcCls.name}…</option>
                {mcCls.skillOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
        </div>
      )}

      {showPlayTools && hp != null && (
        <>
          <HpTracker maxHp={hp} draft={draft} setDraft={setDraft} />
          <RestControls draft={draft} setDraft={setDraft} maxHp={hp} conMod={mod(finalScores.con)} />
        </>
      )}

      <Divider />

      <div style={{ display: "grid", gridTemplateColumns: "var(--g6)", gap: 8, marginBottom: 18 }}>
        {ABILITIES.map((a) => (
          <div key={a.key} style={{ textAlign: "center", border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0.6rem 0.3rem" }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 10.5, color: C.textMuted }}>{a.name.slice(0, 3).toUpperCase()}</div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: C.textOnParchment }}>{finalScores[a.key]}</div>
            <div style={{ fontFamily: "'Spectral', serif", fontSize: 12, color: C.wine }}>{fmtMod(mod(finalScores[a.key]))}</div>
            {(raceBonus[a.key] > 0 || asiBonus[a.key] > 0) && (
              <div style={{ fontFamily: "'Spectral', serif", fontSize: 10, color: C.textMuted, marginTop: 2 }}>
                {raceBonus[a.key] > 0 ? `razza +${raceBonus[a.key]}` : ""}
                {raceBonus[a.key] > 0 && asiBonus[a.key] > 0 ? " · " : ""}
                {asiBonus[a.key] > 0 ? `ASI +${asiBonus[a.key]}` : ""}
              </div>
            )}
          </div>
        ))}
      </div>

      {cls && (
        <AsiPicker
          store={draft}
          updateStore={(fn) => setDraft((d) => ({ ...d, ...fn(d) }))}
          clsId={cls.id}
          classLevel={draft.level}
        />
      )}

      {mcCls && (
        <AsiPicker
          store={mc}
          updateStore={mcUpdateStore}
          clsId={mcCls.id}
          classLevel={mc.level}
        />
      )}

      {/* In gioco (showPlayTools) assegnare i PF del nuovo livello è compito del popup di
          level-up: qui, sulla scheda già salvata, la tabella storica di tutti i livelli è solo
          ingombro. Resta visibile durante la creazione/modifica, dove serve per impostare i PF
          di un personaggio creato direttamente a un livello superiore al 1°. */}
      {!showPlayTools && cls && draft.level >= 2 && (
        <HpLevelManager
          cls={cls}
          hpPerLevel={draft.hpPerLevel}
          onSetMethod={(lvl, val) => setDraft((d) => ({ ...d, hpPerLevel: { ...d.hpPerLevel, [lvl]: val } }))}
          levels={Array.from({ length: draft.level - 1 }, (_, i) => i + 2)}
          title={mcCls ? `Gestione PF per livello — ${cls.name} (primaria)` : "Gestione PF per livello"}
        />
      )}

      {!showPlayTools && mcCls && (
        <HpLevelManager
          cls={mcCls}
          hpPerLevel={mc.hpPerLevel}
          onSetMethod={(lvl, val) => mcUpdateStore((s) => ({ hpPerLevel: { ...s.hpPerLevel, [lvl]: val } }))}
          levels={Array.from({ length: mc.level }, (_, i) => i + 1)}
          title={`Gestione PF per livello — ${mcCls.name} (secondaria)`}
        />
      )}

      {cls && cls.id === "monaco" && chosenSubclassId === "quattro-elementi" && (
        <ElementalDisciplinePicker
          store={draft}
          updateStore={(fn) => setDraft((d) => ({ ...d, ...fn(d) }))}
          level={draft.level}
          title={mcCls ? `Discipline Elementali — ${cls.name} (primaria)` : "Discipline Elementali"}
        />
      )}

      {mcCls && mcCls.id === "monaco" && mcChosenSubclassId === "quattro-elementi" && (
        <ElementalDisciplinePicker
          store={mc}
          updateStore={mcUpdateStore}
          level={mc.level}
          title={`Discipline Elementali — ${mcCls.name} (secondaria)`}
        />
      )}

      {/* MECCANICHE DI CLASSE - CON STILI DI COMBATTIMENTO */}
      {(mechanicsGroups.length > 0 ||
        (cls && hasFightingStyles(cls.id) && getSelectedFightingStyles(draft).length > 0) ||
        (mcCls && hasFightingStyles(mcCls.id) && getSelectedFightingStyles(mc).length > 0)) && (
          <>
            <Divider />
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 8px" }}>Meccaniche di classe</h3>

            {/* Stili di Combattimento - Classe Primaria */}
            {cls && hasFightingStyles(cls.id) && getSelectedFightingStyles(draft).length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <p style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: C.textMuted, margin: "0 0 6px" }}>
                  Stili di Combattimento — {cls.name}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "var(--g3)", gap: 10 }}>
                  {getSelectedFightingStyles(draft).map((styleId) => {
                    const style = getAvailableFightingStyles(cls.id).find((s) => s.id === styleId);
                    if (!style) return null;
                    return (
                      <MetricBox
                        key={style.id}
                        label={style.name}
                        value={style.desc}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stili di Combattimento - Classe Secondaria */}
            {mcCls && hasFightingStyles(mcCls.id) && getSelectedFightingStyles(mc).length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <p style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: C.textMuted, margin: "0 0 6px" }}>
                  Stili di Combattimento — {mcCls.name}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "var(--g3)", gap: 10 }}>
                  {getSelectedFightingStyles(mc).map((styleId) => {
                    const style = getAvailableFightingStyles(mcCls.id).find((s) => s.id === styleId);
                    if (!style) return null;
                    return (
                      <MetricBox
                        key={style.id}
                        label={style.name}
                        value={style.desc}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Meccaniche di classe esistenti */}
            {mechanicsGroups.map((g) => (
              <div key={g.className} style={{ marginBottom: 14 }}>
                {mechanicsGroups.length > 1 && (
                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: C.textMuted, margin: "0 0 6px" }}>{g.className}</p>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "var(--g3)", gap: 10 }}>
                  {g.list.map((m) => <MetricBox key={m.key} label={m.label} value={m.value} />)}
                </div>
              </div>
            ))}
          </>
        )}

      {classResourceGroups.length > 0 && (
        <>
          <Divider />
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 8px" }}>Risorse di classe</h3>
          {classResourceGroups.map((g) => (
            <div key={g.className} style={{ marginBottom: 14 }}>
              {classResourceGroups.length > 1 && (
                <p style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: C.textMuted, margin: "0 0 6px" }}>{g.className}</p>
              )}
              {showPlayTools ? (
                <div style={{ marginBottom: 4 }}>
                  {g.resources.map((r) => (
                    <ResourceTracker key={r.key} resource={r} used={g.used?.[r.key]} onSetUsed={g.onSetUsed} />
                  ))}
                </div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {g.resources.map((r) => (
                    <MetricBox
                      key={r.key} label={r.name}
                      value={r.max == null ? "Illimitati" : r.pool ? `${r.max} punti` : r.max}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
          {/* ✅ INSERISCI QUI I NUOVI BLOCCHI */}
          {hasProtectionFlag && (
            <div style={{ marginBottom: 14, border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0.7rem 0.9rem" }}>
              <h4 style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: C.wineDeep, margin: "0 0 6px" }}>
                🛡️ Protezione - Reazione Disponibile
              </h4>
              <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: 0 }}>
                Quando una creatura entro 1,5 m attacca un bersaglio diverso da te,
                puoi usare la tua reazione per imporre svantaggio al tiro per colpire.
              </p>
            </div>
          )}

          {hasTwoWeaponFightingFlag && (
            <div style={{ marginBottom: 14, border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0.7rem 0.9rem" }}>
              <h4 style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: C.wineDeep, margin: "0 0 6px" }}>
                ⚔️ Combattimento con Due Armi - Attivo
              </h4>
              <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: 0 }}>
                Aggiungi il modificatore di caratteristica al danno dell'attacco secondario.
              </p>
            </div>
          )}
        </>
      )}

      {showPlayTools && wildMagicLevel > 0 && (
        <div style={{ marginBottom: 18, border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0.7rem 0.9rem" }}>
          <h4 style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: C.wineDeep, margin: "0 0 6px" }}>
            🎲 Sconvolgimento di Magia Selvaggia
          </h4>
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "0 0 8px" }}>
            Il Master può far scatenare questo effetto quando lanci un incantesimo da Stregone di 1° livello o superiore.
            {wildMagicLevel >= 14 ? " Grazie a Caos Controllato tiri due volte e scegli l'effetto." : ""}
          </p>
          <GhostButton onClick={rollWildSurge}>Tira sulla tabella (d100)</GhostButton>
          {wildSurgeRolls && (
            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              {wildSurgeRolls.map((r, i) => (
                <div key={i} style={{ border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0.5rem 0.7rem" }}>
                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: C.wine, margin: "0 0 4px" }}>Risultato: {r.roll}</p>
                  <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textOnParchment, margin: 0 }}>{r.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {(() => {
        const baseGroups = [];
        if (cls) {
          const feats = getBaseClassFeatures(cls.id, draft.level);
          if (feats.length) baseGroups.push({ className: cls.name, features: feats });
        }
        if (mcCls) {
          const feats = getBaseClassFeatures(mcCls.id, mc.level);
          if (feats.length) baseGroups.push({ className: mcCls.name, features: feats });
        }
        if (!baseGroups.length) return null;
        return (
          <>
            <Divider />
            {baseGroups.map((g) => (
              <div key={g.className} style={{ marginBottom: 18 }}>
                <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 8px" }}>
                  Caratteristiche di Classe — {g.className}
                </h3>
                {g.features.map((f) => (
                  <div key={f.name} style={{ marginBottom: 10 }}>
                    <p style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: C.textOnParchment, margin: "0 0 2px" }}>
                      {f.name} <span style={{ color: C.textMuted, fontWeight: 400 }}>(liv. {f.level})</span>
                    </p>
                    <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: 0 }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            ))}
          </>
        );
      })()}
      {subclassFeatureGroups.length > 0 && (
        <>
          <Divider />
          {subclassFeatureGroups.map((g) => (
            <div key={g.className} style={{ marginBottom: 18 }}>
              <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 8px" }}>
                Feature di sottoclasse — {g.className}: {g.subclassName}
              </h3>
              {g.features.map((f) => (
                <div key={f.name} style={{ marginBottom: 10 }}>
                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: C.textOnParchment, margin: "0 0 2px" }}>
                    {f.name} <span style={{ color: C.textMuted, fontWeight: 400 }}>(liv. {f.level})</span>
                  </p>
                  <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: 0 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          ))}
        </>
      )}

      {chosenFeats.length > 0 && (
        <>
          <Divider />
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 8px" }}>
            Talenti
          </h3>
          <div style={{ marginBottom: 18 }}>
            {chosenFeats.map(({ level, feat, abilityPick, classId }) => (
              <div key={`${classId}-${level}`} style={{ marginBottom: 10 }}>
                <p style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: C.textOnParchment, margin: "0 0 2px" }}>
                  {feat.name} <span style={{ color: C.textMuted, fontWeight: 400 }}>({classId === "razza" ? "dalla razza" : `liv. ${level}${mcCls ? ` — ${CLASSES.find((c) => c.id === classId)?.name}` : ""}`})</span>
                  {abilityPick && (
                    <span style={{ color: C.forestDeep, fontWeight: 400 }}> — +1 {ABILITIES.find((a) => a.key === abilityPick)?.name}</span>
                  )}
                </p>
                <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: 0 }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <Divider />

      <div style={{ display: "grid", gridTemplateColumns: "var(--g2)", gap: "1.5rem", marginBottom: 18 }}>
        <div>
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 8px" }}>Tiri salvezza</h3>
          {savingThrows.map((s) => (
            <div key={s.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0", borderBottom: `1px solid ${C.parchmentLine}` }}>
              <span style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textOnParchment, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.proficient ? C.wine : "transparent", border: `1px solid ${s.proficient ? C.wine : C.parchmentLine}`, display: "inline-block" }} />
                {s.name}
              </span>
              <span style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.wine }}>{fmtMod(s.bonus)}</span>
            </div>
          ))}
        </div>
        <div>
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 4px" }}>Abilità</h3>
          {expertiseCount > 0 && (
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 11.5, color: C.textMuted, margin: "0 0 6px", fontStyle: "italic" }}>
              Competenza Esperta: {expertiseSkills.length}/{expertiseCount} — clicca la ★ su un'abilità in cui sei già competente
            </p>
          )}
          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            {skillsList.map((s) => (
              <div key={s.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0", borderBottom: `1px solid ${C.parchmentLine}` }}>
                <span style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textOnParchment, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.proficient ? C.wine : "transparent", border: `1px solid ${s.proficient ? C.wine : C.parchmentLine}`, display: "inline-block", flexShrink: 0 }} />
                  {s.name}
                  {expertiseCount > 0 && s.proficient && (
                    <span
                      onClick={() => toggleExpertise(s.name)}
                      title="Competenza Esperta"
                      style={{ cursor: "pointer", color: s.expert ? C.gold : C.parchmentLine, fontSize: 13, lineHeight: 1 }}
                    >
                      ★
                    </span>
                  )}
                </span>
                <span style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.wine }}>{fmtMod(s.bonus)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {weaponAttacks.length > 0 && (
        <>
          <Divider />
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 8px" }}>Attacchi</h3>
          <div style={{ marginBottom: 18 }}>
            {weaponAttacks.map((w) => {
              // I bonus degli Stili di Combattimento sono già inclusi in weaponAttacks.
              const attackBonus = w.attackBonus;
              const damageBonus = w.damageMod;

              return (
                <div key={w.uid} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0.7rem", border: `1px solid ${w.proficient ? C.parchmentLine : C.wine}`, borderRadius: 2, marginBottom: 6 }}>
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: C.textOnParchment, display: "flex", alignItems: "center", gap: 6 }}>
                    {w.name}
                    {!w.proficient && (
                      <span title="Nessuna competenza con questa arma: il bonus di competenza non è incluso nel tiro per colpire" style={{ fontFamily: "'Spectral', serif", fontStyle: "italic", fontSize: 11, color: C.wine, border: `1px solid ${C.wine}`, borderRadius: 2, padding: "0 4px" }}>
                        non competente
                      </span>
                    )}
                    {!w.equipped && (
                      <span title="Non equipaggiata: gli Stili di Combattimento (Duellante, Due Armi, Armi Possenti) si applicano solo alle armi equipaggiate" style={{ fontFamily: "'Spectral', serif", fontStyle: "italic", fontSize: 11, color: C.textMuted, border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0 4px" }}>
                        non equipaggiata
                      </span>
                    )}
                  </span>
                  <span style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted }}>
                    Attacco {fmtMod(attackBonus)} · Danno {w.damageString}{fmtMod(damageBonus)} {w.damageType}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      <p style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textOnParchment, marginBottom: 18 }}>
        <b>Competenze nelle abilità:</b> {allSkills.length ? allSkills.join(", ") : "—"}
      </p>

      {cls && (
        <>
          <Divider />
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 8px" }}>Competenze</h3>
          <div style={{ display: "grid", gap: 4, marginBottom: 18 }}>
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textOnParchment, margin: 0 }}>
              <b>Armature:</b> {[cls.armor, ...granted.armor].filter(Boolean).join("; ")}
            </p>
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textOnParchment, margin: 0 }}>
              <b>Armi:</b> {[cls.weapons, ...granted.weapons].filter(Boolean).join("; ")}
            </p>
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textOnParchment, margin: 0 }}>
              <b>Strumenti:</b> {granted.tools.length ? granted.tools.join(", ") : "—"}
            </p>
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textOnParchment, margin: 0 }}>
              <b>Lingue:</b> {granted.languages.length ? granted.languages.join(", ") : "—"}
            </p>
            {granted.other.length > 0 && (
              <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textOnParchment, margin: 0 }}>
                <b>Altro:</b> {granted.other.join(", ")}
              </p>
            )}
          </div>
        </>
      )}

      <Divider />
      <InventoryManager draft={draft} setDraft={setDraft} allowAdd={showPlayTools} />

      {cls && casterEntries.length > 0 && (allSpellIds.length > 0 || slots.length > 0) && (
        <>
          <Divider />
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginBottom: 12 }}>
            {casterMetrics.map((cm) => (
              <React.Fragment key={cm.classId}>
                <MetricBox label={casterMetrics.length > 1 ? `CD incantesimi — ${cm.className}` : "CD tiro salvezza incantesimi"} value={cm.dc} />
                <MetricBox label={casterMetrics.length > 1 ? `Attacco incantesimi — ${cm.className}` : "Bonus di attacco con incantesimi"} value={fmtMod(cm.attack)} />
              </React.Fragment>
            ))}
          </div>
          <SpellManager draft={draft} setDraft={setDraft} showPlayTools={showPlayTools} />
        </>
      )}
    </div>
  );
}

function StepReview({ draft, setDraft, onSave, saving }) {
  const validationErrors = validateCharacter(draft);
  const missing = validationErrors.map((e) => e.replace(/\.$/, ""));

  return (
    <div>
      <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: C.textOnParchment, margin: "0 0 4px" }}>Riepilogo del personaggio</h2>
      <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textMuted, margin: "0 0 1.25rem" }}>
        Dai un nome al personaggio e salvalo per ritrovarlo in seguito.
      </p>

      <label style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: C.textMuted, display: "block", marginBottom: 6 }}>
        Nome del personaggio
      </label>
      <input
        type="text" value={draft.name} placeholder="Es. Aldric Falco d'Argento"
        onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
        style={{
          width: "100%", fontFamily: "'Cinzel', serif", fontSize: 17, padding: "0.7rem 0.9rem",
          borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fffdf9", marginBottom: 18,
          boxShadow: "inset 0 0 0 1px rgba(125,31,56,0.06)",
        }}
      />

      <CharacterSheetView draft={draft} setDraft={setDraft} />

      {validationErrors.length > 0 && (
        <div style={{ border: `1px solid ${C.danger}`, background: "#f8e9e5", padding: "0.75rem 0.9rem", marginBottom: 14, borderRadius: 2 }}>
          <b style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: C.danger }}>Controlli 5e 2014</b>
          <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.danger }}>{validationErrors.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      )}

      <GoldButton icon={saving ? Loader2 : Save} disabled={missing.length > 0 || saving} onClick={onSave}>
        {saving ? "Salvataggio…" : "Salva personaggio"}
      </GoldButton>
    </div>
  );
}

/* ---------------------------------- FIGHTING STYLE SELECTOR ---------------------------------- */

function FightingStyleSelector({ store, updateStore, clsId, classLevel, label = "Stile di Combattimento" }) {
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

function MetricBox({ label, value, hint }) {
  return (
    <div style={{ border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0.7rem 0.85rem" }}>
      <div style={{ fontFamily: "'Cinzel', serif", fontSize: 10.5, color: C.textMuted, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "'Spectral', serif", fontSize: 15, color: C.textOnParchment }}>{value}</div>
      {hint && <div style={{ fontFamily: "'Spectral', serif", fontSize: 11, color: C.textMuted, marginTop: 2 }}>{hint}</div>}
    </div>
  );
}

/* ---------------------------------- LEVEL UP MODAL ---------------------------------- */
// Riunisce in un unico popup, nell'ordine in cui vanno effettivamente decise, SOLO le scelte
// sbloccate dal nuovo livello (sottoclasse, PF, ASI/Talento, stile di combattimento extra,
// discipline/metamagia/invocazioni/dono del patto se il loro numero è appena aumentato).
// Le variazioni puramente informative (nuove feature testuali, slot, risorse, critico) restano
// in un riepilogo di sola lettura in fondo.
function LevelUpModal({
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

function PlayerSheet({ character, onBack, onSaveChanges }) {
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

/* ---------------------------------- CHARACTER LIST ---------------------------------- */

const CANTRIP_LABEL = "Trucchetti";
function spellLevelLabel(level) {
  return level === 0 ? CANTRIP_LABEL : `Incantesimi di ${level}° livello`;
}

// Compendio consultabile di tutti gli incantesimi del gioco, indipendente da un personaggio:
// chiunque può sfogliarlo dalla Dashboard, filtrando per classe e cercando per nome.
function SpellCompendium({ onBack }) {
  const [classFilter, setClassFilter] = useState("tutti");
  const [search, setSearch] = useState("");

  const classesWithSpells = CLASSES.filter((c) => SPELLS.some((s) => s.classes.includes(c.id)));
  const searchTerm = search.trim().toLowerCase();
  const filtered = SPELLS.filter((s) =>
    (classFilter === "tutti" || s.classes.includes(classFilter)) &&
    (!searchTerm || s.name.toLowerCase().includes(searchTerm))
  );
  const byLevel = {};
  filtered.forEach((s) => { (byLevel[s.level] = byLevel[s.level] || []).push(s); });
  const levels = Object.keys(byLevel).map(Number).sort((a, b) => a - b);
  const sortByName = (a, b) => a.name.localeCompare(b.name, "it");

  return (
    <div>
      <GhostButton icon={ChevronLeft} onClick={onBack} style={{ marginBottom: 18 }}>
        I miei personaggi
      </GhostButton>
      <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: 26, color: C.cream, margin: 0 }}>Compendio degli Incantesimi</h1>
      <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.creamMuted, margin: "4px 0 1.25rem" }}>
        {SPELLS.length} incantesimi del Manuale del Giocatore 2014, con danno, dadi e tiri salvezza. Sfoglia liberamente, senza bisogno di un personaggio.
      </p>

      <Frame>
        <input
          type="text" placeholder="Cerca un incantesimo per nome…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%", fontFamily: "'Spectral', serif", fontSize: 13.5, padding: "0.5rem 0.7rem",
            borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff", marginBottom: 14, boxSizing: "border-box",
          }}
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
          <Pill active={classFilter === "tutti"} onClick={() => setClassFilter("tutti")}>Tutte le classi</Pill>
          {classesWithSpells.map((c) => (
            <Pill key={c.id} active={classFilter === c.id} onClick={() => setClassFilter(c.id)}>{c.name}</Pill>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textMuted }}>Nessun incantesimo trovato.</p>
        ) : (
          levels.map((lvl) => (
            <div key={lvl} style={{ marginBottom: 18 }}>
              <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 8px" }}>
                {spellLevelLabel(lvl)} ({byLevel[lvl].length})
              </h3>
              {[...byLevel[lvl]].sort(sortByName).map((s) => (
                <SpellRow key={s.id} spell={s} selected={false} disabled={false} onToggle={() => {}} />
              ))}
            </div>
          ))
        )}
      </Frame>
    </div>
  );
}

function CharacterList({ characters, loading, onNew, onOpen, onOpenSheet, onDelete, onOpenCompendium }) {
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: 26, color: C.cream, margin: 0 }}>I tuoi personaggi</h1>
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.creamMuted, margin: "4px 0 0" }}>
            Dungeons &amp; Dragons · 5e 2014
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <GhostButton icon={BookOpen} onClick={onOpenCompendium} style={{ borderColor: C.gold, color: C.gold }}>
            Compendio Incantesimi
          </GhostButton>
          <GoldButton icon={Plus} onClick={onNew}>Nuovo personaggio</GoldButton>
        </div>
      </div>

      {loading ? (
        <p style={{ fontFamily: "'Spectral', serif", color: C.creamMuted }}>Caricamento…</p>
      ) : characters.length === 0 ? (
        <Frame style={{ textAlign: "center", padding: "3rem 2rem" }}>
          <Crown size={28} color={C.gold} style={{ marginBottom: 10 }} />
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 16, color: C.textOnParchment, margin: "0 0 6px" }}>
            Nessun eroe ancora forgiato
          </p>
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textMuted, margin: "0 0 18px" }}>
            Crea il tuo primo personaggio per iniziare l'avventura.
          </p>
          <GoldButton icon={Plus} onClick={onNew}>Crea personaggio</GoldButton>
        </Frame>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "var(--g2)", gap: "1rem" }}>
          {characters.map((c) => {
            const race = RACES.find((r) => r.id === c.raceId);
            const cls = CLASSES.find((cl) => cl.id === c.classId);
            const Icon = cls?.id === "mago" || cls?.id === "stregone" || cls?.id === "warlock" ? Wand2 : cls?.id === "chierico" || cls?.id === "paladino" ? Shield : Sword;

            const chosenSubclassId = cls ? getChosenSubclassId(c, cls.id) : null;
            const subclass = cls ? getSubclass(cls.id, chosenSubclassId) : null;
            let maxHp = null, currentHp = null;
            if (cls) {
              const finalScores = computeFinalScores({ ...emptyDraft(), ...c });
              maxHp = computeMaxHp({ ...emptyDraft(), ...c }, cls, race, mod(finalScores.con));
              currentHp = c.currentHp == null ? maxHp : Math.min(c.currentHp, maxHp);
            }
            const isPendingDelete = pendingDeleteId === c.id;

            return (
              <Frame key={c.id} style={{ padding: "1.25rem 1.4rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Icon size={16} color={C.wine} />
                      <span style={{ fontFamily: "'Cinzel', serif", fontSize: 17, color: C.textOnParchment }}>{c.name}</span>
                    </div>
                    <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textMuted, margin: "4px 0 0" }}>
                      {race?.name || "—"} · {cls ? `${cls.name} (liv. ${c.level || 1})` : "—"}{subclass ? ` — ${subclass.name}` : ""}
                    </p>
                    {maxHp != null && (
                      <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: currentHp <= maxHp / 3 ? C.danger : C.textMuted, margin: "2px 0 0" }}>
                        {currentHp} / {maxHp} PF
                      </p>
                    )}
                  </div>
                  {isPendingDelete ? (
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      <button
                        onClick={() => { onDelete(c.id); setPendingDeleteId(null); }}
                        style={{ background: C.danger, color: "#fff", border: "none", cursor: "pointer", borderRadius: 3, padding: "4px 8px", fontFamily: "'Spectral', serif", fontSize: 11.5 }}
                      >
                        Sì, elimina
                      </button>
                      <button
                        onClick={() => setPendingDeleteId(null)}
                        style={{ background: "transparent", border: `1px solid ${C.parchmentLine}`, cursor: "pointer", borderRadius: 3, padding: "4px 8px", fontFamily: "'Spectral', serif", fontSize: 11.5, color: C.textMuted }}
                      >
                        Annulla
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setPendingDeleteId(c.id)} style={{ background: "transparent", border: "none", cursor: "pointer", color: C.danger, padding: 4 }} aria-label="Elimina personaggio">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <GoldButton icon={BookOpen} onClick={() => onOpenSheet(c)} style={{ padding: "0.5rem 0.9rem", fontSize: 13 }}>
                    Apri scheda
                  </GoldButton>
                  <GhostButton icon={Pencil} onClick={() => onOpen(c)} style={{ borderColor: C.wine, color: C.wineDeep, background: "transparent" }}>
                    Modifica
                  </GhostButton>
                </div>
              </Frame>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------- CREATOR ---------------------------------- */

// Una classe (combinata con l'eventuale sottoclasse già scelta) può davvero lanciare
// incantesimi? Prima ancora di scegliere una classe non c'è nulla da mostrare, quindi lo step
// resta nascosto. Guerriero/Ladro dipendono poi dalla sottoclasse (Cavaliere Mistico/Furfante
// Arcano); finché la sottoclasse non è ancora scelta assumiamo di sì, per non far sparire lo
// step prima che l'utente abbia deciso.
function draftCanEverCast(draft) {
  const cls = CLASSES.find((c) => c.id === draft.classId);
  if (!cls) return false;
  if (getEffectiveCasterInfo(cls.id, draft.subclassId)) return true;
  if ((cls.id === "guerriero" || cls.id === "ladro") && !draft.subclassId) return true;
  return false;
}

function Creator({ draft, setDraft, onBack, onSave, saving }) {
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

/* ---------------------------------- APP ---------------------------------- */

export default function App() {
  const [screen, setScreen] = useState("list");
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState(emptyDraft());
  const [sheetCharacter, setSheetCharacter] = useState(null);
  const [toast, setToast] = useState(null);

  const loadCharacters = useCallback(async () => {
    setLoading(true);
    try {
      const res = await storageAdapter.get(STORAGE_KEY, false);
      const list = res && res.value ? JSON.parse(res.value) : [];
      setCharacters(Array.isArray(list) ? list : []);
    } catch (e) {
      setCharacters([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCharacters(); }, [loadCharacters]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const handleNew = () => {
    setDraft(emptyDraft());
    setScreen("create");
  };

  const handleOpen = (c) => {
    setDraft({ ...emptyDraft(), ...c });
    setScreen("create");
  };

  const handleOpenSheet = (c) => {
    setSheetCharacter({ ...emptyDraft(), ...c });
    setScreen("sheet");
  };

  const handleSaveSheetChanges = async (updatedCharacter) => {
    try {
      const next = characters.map((c) => (c.id === updatedCharacter.id ? updatedCharacter : c));
      const result = await storageAdapter.set(STORAGE_KEY, JSON.stringify(next), false);
      if (!result) throw new Error("save failed");
      setCharacters(next);
      setSheetCharacter(updatedCharacter);
      showToast("Modifiche salvate.");
    } catch (e) {
      showToast("Errore durante il salvataggio. Riprova.");
    }
  };

  const handleDelete = async (id) => {
    const next = characters.filter((c) => c.id !== id);
    setCharacters(next);
    try {
      await storageAdapter.set(STORAGE_KEY, JSON.stringify(next), false);
      showToast("Personaggio eliminato.");
    } catch (e) {
      showToast("Non è stato possibile eliminare il personaggio.");
      loadCharacters();
    }
  };

  const handleSave = async () => {
    const errors = validateCharacter(draft);
    if (errors.length) { showToast(errors[0]); return; }
    setSaving(true);
    try {
      const id = draft.id || `char_${Date.now()}`;
      const toSave = { ...draft, id };
      const existingIdx = characters.findIndex((c) => c.id === id);
      const next = existingIdx >= 0
        ? characters.map((c, i) => (i === existingIdx ? toSave : c))
        : [...characters, toSave];
      const result = await storageAdapter.set(STORAGE_KEY, JSON.stringify(next), false);
      if (!result) throw new Error("save failed");
      setCharacters(next);
      setDraft(toSave);
      showToast("Personaggio salvato.");
      setScreen("list");
    } catch (e) {
      showToast("Errore durante il salvataggio. Riprova.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: C.ink, minHeight: "100vh", padding: "var(--app-padding)", fontFamily: "'Spectral', serif" }}>
      <style>{`
        ${FONT_IMPORT}
        * { box-sizing: border-box; }
        html { -webkit-text-size-adjust: 100%; }
        body { overflow-x: hidden; }

        /* Layout responsive SOLO per smartphone (≤640px): tablet e desktop restano invariati.
           Le griglie a colonne fisse e le larghezze fisse dell'app referenziano queste variabili
           invece di valori letterali, così il breakpoint è definito in un unico posto. */
        :root {
          --g2: 1fr 1fr;
          --g3: repeat(3, 1fr);
          --g6: repeat(6, 1fr);
          --creator-flex-dir: row;
          --creator-sidebar-width: 210px;
          --creator-steps-dir: column;
          --app-padding: 2rem;
          --modal-max-width: 720px;
          --modal-outer-padding: 2rem;
          --frame-padding: 1.75rem;
        }
        @media (max-width: 640px) {
          :root {
            --g2: 1fr;
            --g3: 1fr;
            --g6: repeat(2, 1fr);
            --creator-flex-dir: column;
            --creator-sidebar-width: 100%;
            --creator-steps-dir: row;
            --app-padding: 0.85rem;
            --modal-max-width: 100%;
            --modal-outer-padding: 0.6rem;
            --frame-padding: 1.1rem;
          }
        }
        input,
        select {
          color: ${C.textOnParchment};
          background: #fff;
        }
        select option {
          color: ${C.inkDeep};
          background: #fff;
        }
        select option:disabled {
          color: ${C.textMuted};
          background: #f5efe4;
        }
        select option:checked {
          background: ${C.parchment};
          color: ${C.inkDeep};
        }
        input::placeholder {
          color: ${C.textMuted};
          opacity: 1;
        }
        select:focus, input:focus { outline: 2px solid ${C.gold}; outline-offset: 1px; }
        button:focus-visible { outline: 2px solid ${C.gold}; outline-offset: 2px; }
      `}</style>

      {screen === "list" && (
        <CharacterList
          characters={characters}
          loading={loading}
          onNew={handleNew}
          onOpen={handleOpen}
          onOpenSheet={handleOpenSheet}
          onDelete={handleDelete}
          onOpenCompendium={() => setScreen("compendium")}
        />
      )}

      {screen === "compendium" && (
        <SpellCompendium onBack={() => setScreen("list")} />
      )}

      {screen === "create" && (
        <Creator
          draft={draft}
          setDraft={setDraft}
          onBack={() => setScreen("list")}
          onSave={handleSave}
          saving={saving}
        />
      )}

      {screen === "sheet" && sheetCharacter && (
        <PlayerSheet
          character={sheetCharacter}
          onBack={() => setScreen("list")}
          onSaveChanges={handleSaveSheetChanges}
        />
      )}

      {toast && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: C.forestDeep, color: C.cream, padding: "0.7rem 1.4rem", borderRadius: 3,
          border: `1px solid ${C.gold}`, fontFamily: "'Spectral', serif", fontSize: 13.5, zIndex: 50,
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}