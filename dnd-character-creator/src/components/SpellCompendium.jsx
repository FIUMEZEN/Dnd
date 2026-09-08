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
  const [levelFilter, setLevelFilter] = useState("tutti");
  const [schoolFilter, setSchoolFilter] = useState("tutti");
  const [search, setSearch] = useState("");

  const classesWithSpells = CLASSES.filter((c) => SPELLS.some((s) => s.classes.includes(c.id)));
  // Livelli e scuole disponibili si restringono alla classe scelta, così non si vedono opzioni
  // che per quella classe non esistono (es. scuole precluse, o livelli che non raggiunge).
  const spellsForClass = classFilter === "tutti" ? SPELLS : SPELLS.filter((s) => s.classes.includes(classFilter));
  const levelsAvailable = [...new Set(spellsForClass.map((s) => s.level))].sort((a, b) => a - b);
  const schoolsAvailable = [...new Set(spellsForClass.map((s) => s.school))].filter(Boolean).sort((a, b) => a.localeCompare(b, "it"));
  const setClass = (id) => {
    setClassFilter(id);
    const forClass = id === "tutti" ? SPELLS : SPELLS.filter((s) => s.classes.includes(id));
    if (levelFilter !== "tutti" && !forClass.some((s) => s.level === levelFilter)) setLevelFilter("tutti");
    if (schoolFilter !== "tutti" && !forClass.some((s) => s.school === schoolFilter)) setSchoolFilter("tutti");
  };
  const searchTerm = search.trim().toLowerCase();
  const filtered = SPELLS.filter((s) =>
    (classFilter === "tutti" || s.classes.includes(classFilter)) &&
    (levelFilter === "tutti" || s.level === levelFilter) &&
    (schoolFilter === "tutti" || s.school === schoolFilter) &&
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
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          <Pill active={classFilter === "tutti"} onClick={() => setClass("tutti")}>Tutte le classi</Pill>
          {classesWithSpells.map((c) => (
            <Pill key={c.id} active={classFilter === c.id} onClick={() => setClass(c.id)}>{c.name}</Pill>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          <Pill active={levelFilter === "tutti"} onClick={() => setLevelFilter("tutti")}>Tutti i livelli</Pill>
          {levelsAvailable.map((lvl) => (
            <Pill key={lvl} active={levelFilter === lvl} onClick={() => setLevelFilter(lvl)}>{lvl === 0 ? CANTRIP_LABEL : `${lvl}° livello`}</Pill>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
          <Pill active={schoolFilter === "tutti"} onClick={() => setSchoolFilter("tutti")}>Tutte le scuole</Pill>
          {schoolsAvailable.map((sc) => (
            <Pill key={sc} active={schoolFilter === sc} onClick={() => setSchoolFilter(sc)}>{sc[0].toUpperCase() + sc.slice(1)}</Pill>
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
