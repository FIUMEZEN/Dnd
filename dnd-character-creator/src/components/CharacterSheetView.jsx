// La scheda completa del personaggio (CharacterSheetView) e lo step "Riepilogo" che la
// racchiude in fase di creazione (StepReview). È il componente più corposo dell'app: aggrega
// competenze, tiri salvezza, abilità, attacchi, incantesimi, PF e riposi in un'unica vista,
// riusata sia in creazione sia in gioco (PlayerSheet) tramite la prop showPlayTools.
import React, { useState, useMemo } from "react";
import { Save, Loader2 } from "../icons";
import { C } from "../theme";
import { Divider, GhostButton, GoldButton, MetricBox } from "./primitives";
import { AsiPicker, ElementalDisciplinePicker } from "./pickers";
import { InventoryManager } from "./inventory";
import { HpLevelManager, HpTracker, RestControls } from "./hp";
import { SpellManager, ResourceTracker } from "./spells";
import { ABILITIES, SKILL_ABILITY } from "../data/core";
import { RACES } from "../data/races";
import { CLASSES, MULTICLASS_PROFICIENCIES, MULTICLASS_BONUS_SKILL_CLASS } from "../data/classes";
import { mod, fmtMod, ftToM, getProficiencyBonus, abilityKeyByName } from "../lib/format";
import { getCircleSpellIds, getDomainSpellIds, getOathSpellIds, getMaxSpellLevel, getEffectiveCasterInfo, rollWildMagicSurge } from "../lib/casting";
import {
  computeFinalScores, computeMaxHp, getAllClassResources, getAsiBonus, getAvailableFightingStyles,
  getBaseClassFeatures, getChosenFeats, getChosenSubclassId, getClassEntries, getClassMechanicsList,
  getEffectiveGrip, getEffectiveSpellSlots, getExpertiseCount, getFightingStyleAcBonus,
  getFightingStyleAttackBonus, getFightingStyleDamageBonus, getFightingStyleGreatWeapon,
  getFightingStyleProtection, getFightingStyleTwoWeapon, getGrantedProficiencies, getRaceBonus,
  getSelectedBackground, getSelectedFightingStyles, getSubclass, getTotalCharacterLevel, getUnlockedSubclassFeatures,
  getVersatileDamage, hasDraconicResilienceAc, hasFightingStyles, isProficientWithWeapon, validateCharacter,
} from "../lib/character";

export function CharacterSheetView({ draft, setDraft, showPlayTools = false }) {
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

export function StepReview({ draft, setDraft, onSave, saving }) {
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
