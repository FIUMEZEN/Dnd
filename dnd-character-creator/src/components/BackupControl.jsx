import { useRef, useState } from "react";
import { Download, Upload } from "../icons";
import { C } from "../theme";
import { GhostButton, GoldButton } from "./primitives";
import { RACES } from "../data/races";
import { CLASSES } from "../data/classes";
import { CREATURE_SIZES } from "../data/creatures";
import { exportBackup, importBackup } from "../lib/backup";

// Riga selezionabile del picker: nome + sottotitolo (razza/classe o taglia/tipo), con checkbox.
function PickerRow({ checked, onToggle, title, subtitle }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.5rem 0.6rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, cursor: "pointer", background: checked ? "rgba(125, 31, 56, 0.05)" : "transparent" }}>
      <input type="checkbox" checked={checked} onChange={onToggle} style={{ width: 16, height: 16, flexShrink: 0 }} />
      <div>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: C.textOnParchment }}>{title}</div>
        {subtitle && <div style={{ fontFamily: "'Spectral', serif", fontSize: 11.5, color: C.textMuted }}>{subtitle}</div>}
      </div>
    </label>
  );
}

function PickerSection({ title, items, selected, onToggleOne, onToggleAll }) {
  if (items.length === 0) return null;
  const allSelected = items.every((it) => selected.has(it.id));
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: C.wineDeep, margin: 0 }}>{title} ({selected.size}/{items.length})</h3>
        <GhostButton onClick={() => onToggleAll(!allSelected)} style={{ padding: "0.25rem 0.6rem", fontSize: 11, borderColor: C.parchmentLine }}>
          {allSelected ? "Deseleziona tutti" : "Seleziona tutti"}
        </GhostButton>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 220, overflowY: "auto" }}>
        {items.map((it) => (
          <PickerRow key={it.id} checked={selected.has(it.id)} onToggle={() => onToggleOne(it.id)} title={it.title} subtitle={it.subtitle} />
        ))}
      </div>
    </div>
  );
}

// Modal per scegliere cosa includere nel backup: di default tutto è selezionato (equivale
// all'export completo di prima), ma si può deselezionare fino a restare con un solo elemento —
// utile per passare a un amico un singolo personaggio senza portarsi dietro l'intero roster.
function ExportPicker({ characters, creatures, onClose, onExport }) {
  const [selectedChars, setSelectedChars] = useState(() => new Set(characters.map((c) => c.id)));
  const [selectedCreatures, setSelectedCreatures] = useState(() => new Set(creatures.map((c) => c.id)));

  const charItems = characters.map((c) => {
    const race = RACES.find((r) => r.id === c.raceId);
    const cls = CLASSES.find((cl) => cl.id === c.classId);
    return { id: c.id, title: c.name || "Senza nome", subtitle: `${race?.name || "—"} · ${cls ? `${cls.name} (liv. ${c.level || 1})` : "—"}` };
  });
  const creatureItems = creatures.map((cr) => {
    const sizeLabel = CREATURE_SIZES.find((s) => s.key === cr.size)?.name || cr.size;
    return { id: cr.id, title: cr.name || "Senza nome", subtitle: `${sizeLabel} ${cr.type}${cr.typeTag ? ` (${cr.typeTag})` : ""} · GS ${cr.cr}` };
  });

  const toggleOne = (setFn) => (id) => setFn((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const toggleAll = (items, setFn) => (selectAll) => setFn(selectAll ? new Set(items.map((it) => it.id)) : new Set());

  const total = selectedChars.size + selectedCreatures.size;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
      <div style={{ background: C.parchment, padding: "1.75rem", borderRadius: 4, maxWidth: 480, width: "100%", border: `1px solid ${C.gold}`, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
        <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 18, color: C.wineDeep, margin: "0 0 6px" }}>Cosa vuoi esportare?</h3>
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "0 0 16px" }}>
          Tutto è selezionato di default. Deseleziona quello che non vuoi includere — utile per condividere un singolo personaggio senza il resto del roster.
        </p>

        <PickerSection title="Personaggi" items={charItems} selected={selectedChars} onToggleOne={toggleOne(setSelectedChars)} onToggleAll={toggleAll(charItems, setSelectedChars)} />
        <PickerSection title="Creature" items={creatureItems} selected={selectedCreatures} onToggleOne={toggleOne(setSelectedCreatures)} onToggleAll={toggleAll(creatureItems, setSelectedCreatures)} />

        {charItems.length === 0 && creatureItems.length === 0 && (
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textMuted }}>Non c'è ancora nulla da esportare.</p>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <GhostButton onClick={onClose} style={{ borderColor: C.parchmentLine, color: C.textMuted }}>Annulla</GhostButton>
          <GoldButton
            icon={Download}
            disabled={total === 0}
            onClick={() => onExport([...selectedChars], [...selectedCreatures])}
          >
            Esporta {total > 0 ? `(${total})` : ""}
          </GoldButton>
        </div>
      </div>
    </div>
  );
}

// Barra sempre visibile in cima all'app: esporta/importa un file .json con personaggi e creature
// salvati sul dispositivo, come rete di sicurezza contro una cancellazione dei dati del browser
// (localStorage non sopravvive a un "cancella dati di navigazione") e per condividerli con altri.
export function BackupControl({ characters = [], creatures = [], onImported, onError }) {
  const fileInputRef = useRef(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleExport = async (characterIds, creatureIds) => {
    setPickerOpen(false);
    try {
      await exportBackup({ characterIds, creatureIds });
    } catch (e) {
      onError?.("Esportazione non riuscita. Riprova.");
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const result = await importBackup(file);
      onImported?.(result);
    } catch (err) {
      onError?.(err.message || "Importazione non riuscita.");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
      <GhostButton icon={Download} onClick={() => setPickerOpen(true)} style={{ borderColor: C.gold, color: C.gold, padding: "0.4rem 0.8rem", fontSize: 12.5 }}>
        Esporta backup
      </GhostButton>
      <GhostButton icon={Upload} onClick={handleImportClick} style={{ borderColor: C.gold, color: C.gold, padding: "0.4rem 0.8rem", fontSize: 12.5 }}>
        Importa backup
      </GhostButton>
      <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleFileChange} style={{ display: "none" }} />

      {pickerOpen && (
        <ExportPicker
          characters={characters}
          creatures={creatures}
          onClose={() => setPickerOpen(false)}
          onExport={handleExport}
        />
      )}
    </div>
  );
}
