// Gestione dell'inventario: riga singola, catalogo per aggiungere armi/armature/oggetti,
// oggetti personalizzati. Usato sia in creazione (StepEquipment) sia in gioco (CharacterSheetView).
import { useState } from "react";
import { Trash2, Plus } from "../icons";
import { C } from "../theme";
import { Pill, GoldButton } from "./primitives";
import { EQUIPMENT_CATALOG } from "../data/equipment";
import { formatItemStats, nextUid } from "../lib/character";

const CATALOG_GROUPS = [
  { key: "arma", label: "Armi" },
  { key: "armatura", label: "Armature" },
  { key: "scudo", label: "Scudi" },
  { key: "oggetto", label: "Oggetti" },
];

const qtyBtnStyle = {
  width: 22, height: 22, borderRadius: 3, border: `1px solid ${C.parchmentLine}`, background: "#fff",
  cursor: "pointer", fontFamily: "'Spectral', serif", fontSize: 14, lineHeight: 1, display: "flex",
  alignItems: "center", justifyContent: "center", color: C.textOnParchment,
};

export function InventoryRow({ item, onQtyChange, onRemove, onToggleGrip }) {
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

export function InventoryManager({ draft, setDraft, allowAdd = true }) {
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
