import { useState } from "react";
import { ChevronLeft, Plus, Skull } from "../icons";
import { C } from "../theme";
import { Frame, GhostButton, GoldButton, Pill } from "./primitives";
import { BESTIARY } from "../data/bestiary";
import { CREATURE_SIZES, CR_OPTIONS } from "../data/creatures";
import { fmtMod } from "../lib/format";
import { getCrProficiencyBonus, getCrXp } from "../lib/creature";

const crSortValue = (cr) => {
  if (!cr.includes("/")) return Number(cr);
  const [num, den] = cr.split("/").map(Number);
  return num / den;
};

// Elenco sfogliabile del Bestiario (mostri SRD tradotti, bundlati offline): filtra per tipo e
// Grado di Sfida, cerca per nome, e clona la voce scelta in una nuova creatura modificabile.
export function Bestiary({ onBack, onUse }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("tutti");
  const [crFilter, setCrFilter] = useState("tutti");

  const types = [...new Set(BESTIARY.map((m) => m.type))].sort((a, b) => a.localeCompare(b, "it"));
  const term = search.trim().toLowerCase();

  const filtered = BESTIARY
    .filter((m) => (typeFilter === "tutti" || m.type === typeFilter))
    .filter((m) => (crFilter === "tutti" || m.cr === crFilter))
    .filter((m) => !term || m.name.toLowerCase().includes(term))
    .sort((a, b) => crSortValue(a.cr) - crSortValue(b.cr) || a.name.localeCompare(b.name, "it"));

  return (
    <div>
      <GhostButton icon={ChevronLeft} onClick={onBack} style={{ marginBottom: 18 }}>Sezione Master</GhostButton>
      <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: 26, color: C.cream, margin: 0 }}>Bestiario</h1>
      <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.creamMuted, margin: "4px 0 1.25rem" }}>
        {BESTIARY.length} creature classiche pronte all'uso. Scegline una come base: verrà clonata in una nuova creatura che potrai modificare liberamente, senza toccare questo catalogo.
      </p>

      <Frame>
        <input
          type="text" placeholder="Cerca una creatura per nome…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%", fontFamily: "'Spectral', serif", fontSize: 13.5, padding: "0.5rem 0.7rem",
            borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff", marginBottom: 14, boxSizing: "border-box",
          }}
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          <Pill active={typeFilter === "tutti"} onClick={() => setTypeFilter("tutti")}>Tutti i tipi</Pill>
          {types.map((t) => <Pill key={t} active={typeFilter === t} onClick={() => setTypeFilter(t)}>{t}</Pill>)}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
          <Pill active={crFilter === "tutti"} onClick={() => setCrFilter("tutti")}>Tutti i GS</Pill>
          {CR_OPTIONS.filter((cr) => BESTIARY.some((m) => m.cr === cr)).map((cr) => (
            <Pill key={cr} active={crFilter === cr} onClick={() => setCrFilter(cr)}>GS {cr}</Pill>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textMuted }}>Nessuna creatura trovata.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "var(--g2)", gap: "0.75rem" }}>
            {filtered.map((m) => {
              const sizeLabel = CREATURE_SIZES.find((s) => s.key === m.size)?.name || m.size;
              return (
                <div key={m.key} style={{ border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0.85rem 1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <Skull size={15} color={C.wine} />
                    <span style={{ fontFamily: "'Cinzel', serif", fontSize: 15, color: C.textOnParchment }}>{m.name}</span>
                  </div>
                  <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "0 0 4px", fontStyle: "italic" }}>
                    {sizeLabel} {m.type}{m.typeTag ? ` (${m.typeTag})` : ""}
                  </p>
                  <p style={{ fontFamily: "'Spectral', serif", fontSize: 12, color: C.textMuted, margin: "0 0 10px" }}>
                    GS {m.cr} ({fmtMod(getCrProficiencyBonus(m.cr))}, {getCrXp(m.cr)} PE) · CA {m.ac} · {m.hp} PF
                  </p>
                  <GoldButton icon={Plus} onClick={() => onUse(m)} style={{ padding: "0.45rem 0.8rem", fontSize: 12.5 }}>
                    Usa come base
                  </GoldButton>
                </div>
              );
            })}
          </div>
        )}
      </Frame>
    </div>
  );
}
