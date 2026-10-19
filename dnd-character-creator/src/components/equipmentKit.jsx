// Aggiunta con un click dei corredi suggeriti (classe + background) in StepEquipment: quando una
// riga del corredo offre più alternative (es. "un'ascia bipenne oppure un'arma da mischia da
// guerra"), l'utente sceglie con dei Pill invece di dover cercare gli oggetti a mano nel
// catalogo dell'InventoryManager sottostante.
import { useState } from "react";
import { Check, Plus } from "../icons";
import { C } from "../theme";
import { Pill, GoldButton } from "./primitives";
import { EQUIPMENT_CATALOG, weaponsByCategory, armorsByCategory } from "../data/equipment";
import { nextUid } from "../lib/character";

function categoryOptionsFor(option) {
  return option.isArmor ? armorsByCategory(option.category) : weaponsByCategory(option.category);
}

function resolveKitItems(kit, activeOptions, categoryPicks) {
  const items = [];
  kit.forEach((line, i) => {
    const option = line[activeOptions[i] || 0];
    if (option.parts) {
      option.parts.forEach((p) => items.push({ item: p.item, qty: p.qty || 1 }));
    } else if (option.category) {
      const choices = categoryOptionsFor(option);
      const picked = categoryPicks[i] || choices[0]?.id;
      if (picked) items.push({ item: picked, qty: option.qty || 1 });
      (option.extra || []).forEach((p) => items.push({ item: p.item, qty: p.qty || 1 }));
    }
  });
  return items;
}

function addResolvedItems(setDraft, resolved) {
  setDraft((d) => {
    const inventory = [...d.inventory];
    resolved.forEach(({ item, qty }) => {
      const catalogItem = EQUIPMENT_CATALOG.find((i) => i.id === item);
      if (!catalogItem) return;
      const sameSlotEquipped = (catalogItem.category === "armatura" || catalogItem.category === "scudo")
        && inventory.some((it) => it.category === catalogItem.category && it.equipped);
      const autoEquip = (catalogItem.category === "armatura" || catalogItem.category === "scudo") && !sameSlotEquipped;
      inventory.push({ ...catalogItem, uid: nextUid(), qty, equipped: autoEquip });
    });
    return { ...d, inventory };
  });
}

export function ClassEquipmentKit({ cls, setDraft }) {
  const kit = cls.equipmentKit;
  const [activeOptions, setActiveOptions] = useState(() => kit.map(() => 0));
  const [categoryPicks, setCategoryPicks] = useState({});

  if (!kit) return null;

  const setLineOption = (lineIdx, optIdx) => setActiveOptions((prev) => {
    const next = [...prev];
    next[lineIdx] = optIdx;
    return next;
  });
  const setCategoryPick = (lineIdx, itemId) => setCategoryPicks((prev) => ({ ...prev, [lineIdx]: itemId }));

  const addKit = () => addResolvedItems(setDraft, resolveKitItems(kit, activeOptions, categoryPicks));

  return (
    <div>
      {(() => {
        // Numero progressivo ("Scelta 1, 2...") solo per le righe con qualcosa da decidere.
        const isChoiceLine = kit.map((line, i) => line.length > 1 || !!line[activeOptions[i] || 0].category);
        const choiceNumbers = isChoiceLine.map((c, i) => (c ? isChoiceLine.slice(0, i + 1).filter(Boolean).length : 0));
        return kit.map((line, i) => {
          const activeIdx = activeOptions[i] || 0;
          const activeOption = line[activeIdx];
          const choices = activeOption.category ? categoryOptionsFor(activeOption) : [];
          const isChoice = isChoiceLine[i];
          // Voce fissa: una riga semplice con la spunta, senza nulla da decidere.
          if (!isChoice) {
            return (
              <p key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontFamily: "'Spectral', serif", fontSize: 14, color: C.textOnParchment, margin: "0 0 8px" }}>
                <Check size={14} color={C.forest} style={{ marginTop: 3, flexShrink: 0 }} /> {activeOption.label}
              </p>
            );
          }
          // Scelta (alternative "a oppure b" o "un'arma a scelta"): riquadro numerato ben visibile,
          // invece di una fila di pillole uguale a tutto il resto.
          return (
            <div key={i} style={{ marginBottom: 10, padding: "0.6rem 0.75rem", borderRadius: 8, border: `1px solid ${C.goldSoft}`, borderLeft: `4px solid ${C.wine}`, background: "#fbf5e4" }}>
              <p style={{ fontFamily: "'Cinzel', serif", fontSize: 13.5, fontWeight: 600, color: C.wineDeep, margin: "0 0 6px" }}>
                Scelta {choiceNumbers[i]}{line.length > 1 ? " — una tra queste" : ""}
              </p>
              {line.length > 1 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {line.map((opt, j) => (
                    <Pill key={j} active={activeIdx === j} onClick={() => setLineOption(i, j)}>{opt.label}</Pill>
                  ))}
                </div>
              )}
              {activeOption.category && (
                <label style={{ display: "block", marginTop: line.length > 1 ? 8 : 0 }}>
                  <span style={{ display: "block", fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textMuted, marginBottom: 4 }}>
                    {line.length > 1 ? "Quale, esattamente?" : activeOption.label}
                  </span>
                  <select
                    value={categoryPicks[i] || choices[0]?.id || ""}
                    onChange={(e) => setCategoryPick(i, e.target.value)}
                    style={{
                      width: "100%", maxWidth: 320, fontFamily: "'Spectral', serif", fontSize: 14.5, minHeight: 40,
                      padding: "0.35rem 0.5rem", borderRadius: 6, border: `1px solid ${C.wine}66`, background: "#fff",
                    }}
                  >
                    {choices.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </label>
              )}
            </div>
          );
        });
      })()}
      <GoldButton icon={Plus} onClick={addKit} style={{ padding: "0.5rem 1rem", fontSize: 14, marginTop: 4 }}>
        Aggiungi il corredo di {cls.name}
      </GoldButton>
    </div>
  );
}

export function BackgroundEquipmentKit({ bg, setDraft }) {
  const addKit = () => {
    setDraft((d) => ({
      ...d,
      inventory: [
        ...d.inventory,
        ...bg.equipment.map((name) => ({ uid: nextUid(), id: null, name, category: "oggetto", desc: "", qty: 1, custom: true })),
      ],
    }));
  };
  return (
    <GoldButton icon={Plus} onClick={addKit} style={{ padding: "0.5rem 1rem", fontSize: 14, marginTop: 10 }}>
      Aggiungi il corredo di {bg.name}
    </GoldButton>
  );
}
