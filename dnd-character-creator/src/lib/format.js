import { ABILITIES } from "../data/core";

export const mod = (score) => Math.floor((score - 10) / 2);
export const fmtMod = (m) => (m >= 0 ? `+${m}` : `${m}`);
// Le velocità di razza sono memorizzate in piedi (com'è nel PHB), ma il resto dell'app esprime
// ogni distanza in metri (gittate di incantesimi e armi): convertiamo qui, alla visualizzazione,
// con la stessa equivalenza usata altrove nel file (1,5 m per ogni 5 ft, cioè un "quadretto").
export const ftToM = (ft) => (ft / 5) * 1.5;
export const getProficiencyBonus = (level) => Math.floor((Math.max(1, level || 1) - 1) / 4) + 2;
export const POINT_BUY_COST = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
export const POINT_BUY_TOTAL = 27;
export const getPointBuyCost = (score) => POINT_BUY_COST[score] ?? Infinity;
// I punteggi non ancora assegnati sono "" (nessuna caratteristica scelta ancora): li trattiamo
// come costo 0, non come punteggio non valido, altrimenti la spesa totale mostrerebbe Infinity
// finché non si sono compilate tutte e sei le caratteristiche.
export const getPointBuySpent = (scores) => Object.values(scores).reduce((sum, v) => sum + (v === "" || v === undefined ? 0 : getPointBuyCost(Number(v))), 0);

export const abilityKeyByName = (name) => {
  const found = ABILITIES.find((a) => name && name.includes(a.name));
  return found ? found.key : null;
};

export function rollAbilityScore() {
  const rolls = Array.from({ length: 4 }, () => 1 + Math.floor(Math.random() * 6));
  rolls.sort((a, b) => a - b);
  return rolls[1] + rolls[2] + rolls[3];
}
