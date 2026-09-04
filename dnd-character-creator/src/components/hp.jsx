// Gestione dei Punti Ferita: assegnazione PF per livello in creazione (HpLevelManager),
// tracker danno/cura/PF temporanei in gioco (HpTracker), pannello dei riposi con spesa dei
// Dadi Vita (RestControls).
import { useState } from "react";
import { C } from "../theme";
import { Divider, Pill, GhostButton, GoldButton } from "./primitives";
import { CLASSES } from "../data/classes";
import { fmtMod } from "../lib/format";
import { getHitDieAverage, getClassEntries, getAllClassResources, getChosenSubclassId } from "../lib/character";

export function HpLevelManager({ cls, hpPerLevel, onSetMethod, levels, title = "Gestione PF per livello" }) {
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

export function HpTracker({ maxHp, draft, setDraft }) {
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

// Pannello dei riposi: spesa dei Dadi Vita (riposo breve) e i due pulsanti "Riposo Breve" /
// "Riposo Lungo" che applicano gli effetti CORRETTI e completi previsti dalla 5e 2014.
export function RestControls({ draft, setDraft, maxHp, conMod }) {
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
