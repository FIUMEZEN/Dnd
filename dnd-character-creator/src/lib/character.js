// Livello di logica del personaggio: combina i dati grezzi (src/data/*) con lo stato del
// draft/personaggio (classe, sottoclasse, livello, scelte del giocatore) per calcolare tutto
// ciò che dipende da quello stato — competenze, PF, ASI, validazione, stato degli step, ecc.
// Le componenti React vivono ancora in App.jsx: questo file non contiene JSX.
import {
  Users, Sword, Dices, ScrollText, Backpack, Sparkles, BookOpen,
} from "../icons";
import { ABILITIES } from "../data/core";
import { RACES } from "../data/races";
import {
  CLASSES, ASI_LEVELS_BY_CLASS, MULTICLASS_PREREQS, MULTICLASS_WEAPON_PROFICIENCY,
  SUBCLASS_CHOICE_LEVEL, BASE_CLASS_FEATURES, FIGHTING_STYLES, FIGHTING_STYLE_CLASSES, FIGHTING_STYLE_LEVEL,
} from "../data/classes";
import { SUBCLASSES } from "../data/subclasses";
import { BACKGROUNDS } from "../data/backgrounds";
import { FEATS } from "../data/feats";
import { FULL_CASTER_SLOTS, MAX_DATA_SPELL_LEVEL, SPELLS } from "../data/spells";
import { WEAPON_NAME_TO_ID } from "../data/equipment";
import { mod, getPointBuySpent, POINT_BUY_TOTAL } from "./format";
import {
  isThirdCaster, getEffectiveCasterInfo, getUnlockedArcanumTiers, getSpellSlots, getMaxSpellLevel,
  getSpellsLimit, getDomainSpellIds, getOathSpellIds, getPatronSpellIds, getCircleSpellIds,
} from "./casting";

export function checkMulticlassPrereq(finalScores, clsId) {
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

export function getTotalCharacterLevel(draft) {
  return (draft.level || 1) + (draft.multiclass && draft.multiclass.classId ? (draft.multiclass.level || 1) : 0);
}

export function getMulticlassCasterLevelContribution(clsId, level, subclassId) {
  if (!clsId || !level || clsId === "warlock") return 0;
  const caster = getEffectiveCasterInfo(clsId, subclassId);
  if (!caster) return 0;
  if (isThirdCaster(clsId, subclassId)) return Math.floor(level / 3);
  if (caster.halfCaster) return Math.floor(level / 2);
  return level;
}

// Restituisce l'elenco delle "voci di classe" del personaggio (classe primaria + eventuale
// classe secondaria da multiclasse), ciascuna col proprio id, livello e sottoclasse.
export function getClassEntries(draft) {
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
export function getEffectiveSpellSlots(draft) {
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


export function getSubclassOptions(clsId) {
  return SUBCLASSES[clsId] || [];
}

export function getChosenSubclassId(draft, clsId) {
  if (clsId === "chierico") return draft.domainId;
  if (clsId === "paladino") return draft.oathId;
  if (clsId === "warlock") return draft.patronId;
  if (clsId === "druido") return draft.circleId;
  return draft.subclassId;
}

export function getSubclass(clsId, subclassId) {
  return getSubclassOptions(clsId).find((s) => s.id === subclassId) || null;
}

export function getUnlockedSubclassFeatures(clsId, subclassId, level) {
  const sub = getSubclass(clsId, subclassId);
  if (!sub) return [];
  return sub.features.filter((f) => f.level <= (level || 1)).sort((a, b) => a.level - b.level);
}

export function getCritRange(clsId, subclassId, level) {
  if (clsId === "guerriero" && subclassId === "campione") {
    if ((level || 1) >= 15) return "18-20";
    if ((level || 1) >= 3) return "19-20";
  }
  return "20";
}

export function getRageUses(level) {
  const lvl = level || 1;
  if (lvl >= 20) return "Illimitati";
  if (lvl >= 17) return 6;
  if (lvl >= 12) return 5;
  if (lvl >= 6) return 4;
  if (lvl >= 3) return 3;
  return 2;
}

export function getKiPoints(level) {
  const lvl = level || 1;
  return lvl >= 2 ? lvl : 0;
}

export function getExpertiseCount(clsId, level) {
  const lvl = level || 1;
  if (clsId === "ladro") return lvl >= 6 ? 4 : lvl >= 1 ? 2 : 0;
  if (clsId === "bardo") return lvl >= 10 ? 4 : lvl >= 2 ? 2 : 0;
  return 0;
}

/* ------------------------------- CARATTERISTICHE DI CLASSE (testuali) ------------------------------- */
// Feature base di classe (non di sottoclasse) che non sono già coperte da una risorsa
// tracciabile o da una voce numerica in "Meccaniche di classe": qui compaiono solo a scopo
// di consultazione rapida durante il gioco.
export function getBaseClassFeatures(clsId, level) {
  const list = BASE_CLASS_FEATURES[clsId] || [];
  return list.filter((f) => f.level <= (level || 1));
}

export function getBaseClassResources(clsId, level, mysticArcanum, chaMod) {
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

export function getSubclassResources(clsId, subclassId, level) {
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

export function getAllClassResources(clsId, subclassId, level, mysticArcanum, chaMod) {
  return [...getBaseClassResources(clsId, level, mysticArcanum, chaMod), ...getSubclassResources(clsId, subclassId, level)];
}

// Aggrega tutte le competenze "bonus" (fisse o a scelta) concesse da razza, background e
// sottoclasse: armature, armi, strumenti, lingue e abilità. Le competenze base della classe
// (armor/weapons in prosa su CLASSES) restano a parte, mostrate come testo esistente.
export function getGrantedProficiencies(draft) {
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
export function bonusGrantsWeapon(bonusWeaponsList, item) {
  return (bonusWeaponsList || []).some((label) => {
    const norm = label.trim().toLowerCase();
    if (norm === "armi da guerra") return item.tier === "guerra";
    if (norm === "armi semplici") return item.tier === "semplice";
    return WEAPON_NAME_TO_ID[norm] === item.id;
  });
}

export function classGrantsWeapon(weaponProficiency, item) {
  if (!weaponProficiency) return false;
  if (weaponProficiency.simple && item.tier === "semplice") return true;
  if (weaponProficiency.martial && item.tier === "guerra") return true;
  return (weaponProficiency.specific || []).includes(item.id);
}

// Competenza reale con una data arma, usata per decidere se il bonus di competenza va aggiunto
// al tiro per colpire: combina classe primaria (piena), classe secondaria da multiclasse (ridotta,
// tabella PHB), razza e sottoclasse (mai ridotte dal multiclasse, quindi controllate anche per
// l'eventuale classe secondaria).
export function isProficientWithWeapon(draft, item) {
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

export const CUSTOM_BACKGROUND_ID = "personalizzato";

// Restituisce il background selezionato: uno dei 13 predefiniti, oppure — se il giocatore ha
// scelto "Personalizzato" — un oggetto con la stessa forma costruito dai campi custom del
// draft (regola "Personalizzare un Background", PHB 2014 p.125: 2 competenze a scelta,
// strumenti/lingua, corredo ed equivalente, e un tratto di background inventato con il DM).
export function getSelectedBackground(draft) {
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
export function getBackgroundValidationErrors(draft) {
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

/* ---------------------------------- STILI DI COMBATTIMENTO ---------------------------------- */
// Stili di Combattimento del PHB 2014

export function getAvailableFightingStyles(clsId) {
  return FIGHTING_STYLES[clsId] || [];
}

export function getFightingStyleCount(clsId, level, subclassId = null) {
  const lvl = Number(level) || 0;
  if (!FIGHTING_STYLE_CLASSES.includes(clsId)) return 0;
  const requiredLevel = FIGHTING_STYLE_LEVEL[clsId] || 99;
  if (lvl < requiredLevel) return 0;
  // In 5e 2014 il Guerriero ottiene un secondo stile al 10° solo se è Campione.
  if (clsId === "guerriero" && subclassId === "campione" && lvl >= 10) return 2;
  return 1;
}

export function hasFightingStyles(clsId) {
  return FIGHTING_STYLE_CLASSES.includes(clsId);
}

export function getSelectedFightingStyles(store) {
  return Array.isArray(store?.fightingStyles) ? store.fightingStyles : [];
}

export function getFightingStyleAcBonus(store, clsId, wearingArmor = true) {
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
export function getFightingStyleDamageBonus(store, clsId, isMelee, duelingEligible) {
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

export function getFightingStyleAttackBonus(store, clsId, isRanged) {
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

export function getFightingStyleGreatWeapon(store) {
  return getSelectedFightingStyles(store).includes("armi-pesanti");
}

export function getFightingStyleTwoWeapon(store) {
  return getSelectedFightingStyles(store).includes("combattimento-due-armi");
}

export function getFightingStyleProtection(store) {
  return getSelectedFightingStyles(store).includes("protezione");
}

export function getFeat(id) {
  return FEATS.find((f) => f.id === id) || null;
}


/* ---------------------------------- HELPERS ---------------------------------- */

export function getVersatileDamage(properties) {
  if (!properties || !Array.isArray(properties)) return null;
  const versatileProp = properties.find(p => typeof p === 'string' && p.includes("Versatile"));
  if (!versatileProp) return null;
  const match = versatileProp.match(/\((\d+d\d+)\)/);
  return match ? match[1] : null;
}


/* ---------------------------------- ASI ---------------------------------- */

export function getAsiLevels(clsId) {
  return ASI_LEVELS_BY_CLASS[clsId] || [];
}

export function getUnlockedAsiLevels(clsId, level) {
  return getAsiLevels(clsId).filter((lvl) => lvl <= (level || 1));
}

export function getLevelChoiceType(store, level) {
  // Retrocompatibile: se non specificato, il livello è di tipo "asi" (comportamento storico).
  return (store.levelChoiceType && store.levelChoiceType[level]) || "asi";
}

// Calcola il bonus di caratteristica da ASI/Talenti per UNA classe (store = draft per la
// classe primaria, oppure draft.multiclass per la classe secondaria).
export function computeAsiBonusForStore(store, clsId, classLevel) {
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
export function getAsiBonus(draft) {
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

export function computeChosenFeatsForStore(store, clsId, classLevel) {
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
export function getChosenFeats(draft) {
  const classFeats = getClassEntries(draft).flatMap(({ classId, level, store }) => computeChosenFeatsForStore(store, classId, level));
  const raceFeat = draft.raceFeatId ? getFeat(draft.raceFeatId) : null;
  if (!raceFeat) return classFeats;
  return [{ level: 1, feat: raceFeat, abilityPick: draft.raceFeatAbilityChoice || null, classId: "razza" }, ...classFeats];
}

/* ---------------------------------- MECCANICHE CALCOLATE ---------------------------------- */

export function getAttacksPerAction(clsId, level, subclassId) {
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

export function getSneakAttackDice(level) {
  return Math.max(1, Math.ceil((level || 1) / 2));
}

export function getBardicInspirationDie(level) {
  const lvl = level || 1;
  if (lvl >= 15) return "d12";
  if (lvl >= 10) return "d10";
  if (lvl >= 5) return "d8";
  return "d6";
}

// Elenco di piccole statistiche di "meccanica di classe" (attacchi extra, attacco furtivo,
// usi dell'ira, ecc.) per una classe/livello/sottoclasse: usato per mostrare queste info sia
// per la classe primaria che per un'eventuale classe secondaria da multiclasse.
export function getClassMechanicsList(clsId, level, subclassId) {
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

export function getHitDieAverage(hitDie) {
  return Math.floor(hitDie / 2) + 1;
}

export function computeMaxHp(draft, cls, race, conMod) {
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

export function hasDraconicResilienceAc(clsId, subclassId) {
  return clsId === "stregone" && subclassId === "progenie-draconica";
}

export function getLevelUpChanges(clsId, subclassId, fromLevel, toLevel) {
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

export function validateClassLevelChoices(store, clsId, classLevel, className, errors) {
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

export function validateCharacter(draft) {
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

export function getRaceBonus(race, picks) {
  const b = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
  if (!race) return b;
  Object.entries(race.bonuses || {}).forEach(([k, v]) => { b[k] += v; });
  (picks || []).forEach((k) => { if (b[k] !== undefined) b[k] += 1; });
  return b;
}

export function formatItemStats(item) {
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
export function getEffectiveGrip(draft, item) {
  if (item.hands === "due mani") return "due mani";
  const isVersatile = (item.properties || []).some((p) => p.includes("Versatile"));
  if (isVersatile && (draft.twoHandedWeapons || {})[item.uid]) return "due mani";
  return "una mano";
}

let uidCounter = 0;
export function nextUid() {
  uidCounter += 1;
  return `item_${Date.now()}_${uidCounter}`;
}

export function emptyDraft() {
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

export function emptyMulticlass(classId) {
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

export function computeFinalScores(draft) {
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
export function getCasterSpellStatus(clsId, chosenSubclassId, level, store, draft, finalScores) {
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

export const STEPS = [
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
export function isStepComplete(key, draft) {
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
export function isStepFullyComplete(key, draft) {
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

// Il picker "Scegli N opzioni" richiede questi requisiti soddisfatti prima di considerare
// completo uno step (razza/classe/background/incantesimi con proficiencyChoices pendenti).
export function areProfChoicesSatisfied(specs, profChoices) {
  return (specs || []).every((spec) => ((profChoices && profChoices[spec.key]) || []).length === spec.count);
}

// Aggiorna draft.profChoices[spec.key] con un toggle capped at spec.count, seguendo lo stesso
// pattern "updateStore((s) => partial)" usato altrove (Metamagia, Invocazioni, ecc.).
export function toggleProfChoice(updateStore, spec, value) {
  updateStore((s) => {
    const current = (s.profChoices && s.profChoices[spec.key]) || [];
    const has = current.includes(value);
    if (has) return { profChoices: { ...s.profChoices, [spec.key]: current.filter((v) => v !== value) } };
    if (current.length >= spec.count) return {};
    return { profChoices: { ...s.profChoices, [spec.key]: [...current, value] } };
  });
}
