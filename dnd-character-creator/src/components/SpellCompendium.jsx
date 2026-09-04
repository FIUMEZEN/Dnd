import { useState } from "react";
import { ChevronLeft } from "../icons";
import { C } from "../theme";
import { Frame, GhostButton, Pill } from "./primitives";
import { SpellRow } from "./spells";
import { CLASSES } from "../data/classes";
import { SPELLS } from "../data/spells";

export const CANTRIP_LABEL = "Trucchetti";
export function spellLevelLabel(level) {
  return level === 0 ? CANTRIP_LABEL : `Incantesimi di ${level}° livello`;
}

// Compendio consultabile di tutti gli incantesimi del gioco, indipendente da un personaggio:
// chiunque può sfogliarlo dalla Dashboard, filtrando per classe e cercando per nome.
export function SpellCompendium({ onBack }) {
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
