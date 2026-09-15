// Elenco, in sola lettura, delle bestie in cui un Druido può trasformarsi con Forma Selvaggia al
// suo livello attuale (filtrate per Grado di Sfida e per i limiti di volo/nuoto), con le
// statistiche complete di ognuna. Non salva nulla: è solo un riferimento rapido durante la
// creazione o in gioco, pescato dallo stesso catalogo del Bestiario del Master.
import { useState } from "react";
import { ChevronDown, ChevronRight } from "../icons";
import { C } from "../theme";
import { Divider } from "./primitives";
import { ABILITIES } from "../data/core";
import { BESTIARY } from "../data/bestiary";
import { CREATURE_SIZES } from "../data/creatures";
import { fmtMod, mod } from "../lib/format";
import { formatSenses, formatSpeed } from "../lib/creature";
import { getWildShapeInfo } from "../lib/character";

const crValue = (cr) => {
  if (!cr.includes("/")) return Number(cr);
  const [num, den] = cr.split("/").map(Number);
  return num / den;
};

function BeastCard({ beast }) {
  const [open, setOpen] = useState(false);
  const sizeLabel = CREATURE_SIZES.find((s) => s.key === beast.size)?.name || beast.size;
  return (
    <div style={{ border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0.6rem 0.8rem", marginBottom: 8 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          all: "unset", cursor: "pointer", display: "flex", justifyContent: "space-between",
          alignItems: "center", width: "100%", boxSizing: "border-box", gap: 10,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'Cinzel', serif", fontSize: 13.5, color: C.textOnParchment }}>
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />} {beast.name}
        </span>
        <span style={{ fontFamily: "'Spectral', serif", fontSize: 12, color: C.textMuted, whiteSpace: "nowrap" }}>
          GS {beast.cr} · CA {beast.ac} · {beast.hp} PF · {formatSpeed(beast.speed)}
        </span>
      </button>
      {open && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.parchmentLine}` }}>
          <p style={{ fontFamily: "'Spectral', serif", fontStyle: "italic", fontSize: 12, color: C.textMuted, margin: "0 0 8px" }}>
            {sizeLabel} {beast.type}, {beast.alignment}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6, marginBottom: 8 }}>
            {ABILITIES.map((a) => (
              <div key={a.key} style={{ textAlign: "center", border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0.3rem 0.2rem" }}>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: 10, color: C.textMuted }}>{a.name}</div>
                <div style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textOnParchment }}>
                  {beast.abilities[a.key]} ({fmtMod(mod(beast.abilities[a.key]))})
                </div>
              </div>
            ))}
          </div>
          {(beast.skills || []).length > 0 && (
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textOnParchment, margin: "0 0 4px" }}>
              <b style={{ fontFamily: "'Cinzel', serif", fontSize: 11 }}>Abilità. </b>
              {beast.skills.map((s) => `${s.name} ${fmtMod(Number(s.bonus) || 0)}`).join(", ")}
            </p>
          )}
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textOnParchment, margin: "0 0 4px" }}>
            <b style={{ fontFamily: "'Cinzel', serif", fontSize: 11 }}>Sensi. </b>{formatSenses(beast)}
          </p>
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textOnParchment, margin: "0 0 8px" }}>
            <b style={{ fontFamily: "'Cinzel', serif", fontSize: 11 }}>Linguaggi. </b>{beast.languages || "—"}
          </p>
          {(beast.traits || []).map((t, i) => (
            <p key={`t${i}`} style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textOnParchment, margin: "0 0 6px" }}>
              <b style={{ fontFamily: "'Cinzel', serif" }}>{t.name}.</b> {t.desc}
            </p>
          ))}
          {(beast.actions || []).map((a, i) => (
            <p key={`a${i}`} style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textOnParchment, margin: "0 0 6px" }}>
              <b style={{ fontFamily: "'Cinzel', serif" }}>{a.name}.</b> {a.desc}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export function WildShapeForms({ clsId, circleId, level, title }) {
  const info = getWildShapeInfo(clsId, circleId, level);
  if (!info) return null;
  const maxCrValue = crValue(info.maxCr);
  const available = BESTIARY
    .filter((m) => m.type === "Bestia")
    .filter((m) => crValue(m.cr) <= maxCrValue)
    .filter((m) => info.canFly || !(m.speed?.volare > 0))
    .filter((m) => info.canSwim || !(m.speed?.nuotare > 0))
    .sort((a, b) => crValue(a.cr) - crValue(b.cr) || a.name.localeCompare(b.name, "it"));

  return (
    <div style={{ marginBottom: 18 }}>
      <Divider />
      <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 4px" }}>
        {title || "Forma Selvaggia — forme disponibili"}
      </h3>
      <p style={{ fontFamily: "'Spectral', serif", fontSize: 12, color: C.textMuted, margin: "0 0 10px" }}>
        Bestie con Grado di Sfida (GS) fino a {info.maxCr} già viste dal personaggio{!info.canSwim ? ", senza velocità di nuoto" : ""}{!info.canFly ? ", senza velocità di volo" : ""}. Clicca su una forma per vederne le statistiche complete.
      </p>
      {available.length === 0 ? (
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, fontStyle: "italic" }}>
          Nessuna bestia nel catalogo dell'app soddisfa questi limiti: il Master può comunque concederne altre, purché coerenti con le regole.
        </p>
      ) : (
        available.map((b) => <BeastCard key={b.key} beast={b} />)
      )}
    </div>
  );
}
