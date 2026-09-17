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

function BeastCard({ beast, locked, lockReason }) {
  const [open, setOpen] = useState(false);
  const sizeLabel = CREATURE_SIZES.find((s) => s.key === beast.size)?.name || beast.size;
  return (
    <div style={{ border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0.6rem 0.8rem", marginBottom: 8, opacity: locked ? 0.65 : 1 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          all: "unset", cursor: "pointer", display: "flex", justifyContent: "space-between",
          alignItems: "center", width: "100%", boxSizing: "border-box", gap: 10,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'Cinzel', serif", fontSize: 15, color: C.textOnParchment }}>
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />} {beast.name}
        </span>
        <span style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textMuted, textAlign: "right" }}>
          GS {beast.cr} · CA {beast.ac} · {beast.hp} PF · {formatSpeed(beast.speed)}
          {lockReason && <><br />{lockReason}</>}
        </span>
      </button>
      {open && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.parchmentLine}` }}>
          <p style={{ fontFamily: "'Spectral', serif", fontStyle: "italic", fontSize: 13.5, color: C.textMuted, margin: "0 0 8px" }}>
            {sizeLabel} {beast.type}, {beast.alignment}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6, marginBottom: 8 }}>
            {ABILITIES.map((a) => (
              <div key={a.key} style={{ textAlign: "center", border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0.3rem 0.2rem" }}>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: 11.5, color: C.textMuted }}>{a.name}</div>
                <div style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textOnParchment }}>
                  {beast.abilities[a.key]} ({fmtMod(mod(beast.abilities[a.key]))})
                </div>
              </div>
            ))}
          </div>
          {(beast.skills || []).length > 0 && (
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textOnParchment, margin: "0 0 4px" }}>
              <b style={{ fontFamily: "'Cinzel', serif", fontSize: 12.5 }}>Abilità. </b>
              {beast.skills.map((s) => `${s.name} ${fmtMod(Number(s.bonus) || 0)}`).join(", ")}
            </p>
          )}
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textOnParchment, margin: "0 0 4px" }}>
            <b style={{ fontFamily: "'Cinzel', serif", fontSize: 12.5 }}>Sensi. </b>{formatSenses(beast)}
          </p>
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textOnParchment, margin: "0 0 8px" }}>
            <b style={{ fontFamily: "'Cinzel', serif", fontSize: 12.5 }}>Linguaggi. </b>{beast.languages || "—"}
          </p>
          {(beast.traits || []).map((t, i) => (
            <p key={`t${i}`} style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textOnParchment, margin: "0 0 6px" }}>
              <b style={{ fontFamily: "'Cinzel', serif" }}>{t.name}.</b> {t.desc}
            </p>
          ))}
          {(beast.actions || []).map((a, i) => (
            <p key={`a${i}`} style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textOnParchment, margin: "0 0 6px" }}>
              <b style={{ fontFamily: "'Cinzel', serif" }}>{a.name}.</b> {a.desc}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// Perché una bestia non è (ancora) assumibile con Forma Selvaggia, per il messaggio sotto la
// scheda: aiuta a capire se serve solo aspettare un livello o se manca nuoto/volo.
function lockReasonFor(beast, info, everMaxCrValue) {
  const needsFly = beast.speed?.volare > 0;
  const needsSwim = beast.speed?.nuotare > 0;
  if (crValue(beast.cr) > everMaxCrValue) return null; // mai raggiungibile: gestita a parte
  if (crValue(beast.cr) > crValue(info.maxCr)) return "Richiede un livello da Druido più alto";
  if (needsFly && !info.canFly) return "Richiede velocità di volo (Druido 8+)";
  if (needsSwim && !info.canSwim) return "Richiede velocità di nuoto (Druido 4+)";
  return "Non ancora disponibile";
}

export function WildShapeForms({ clsId, circleId, level, title }) {
  const info = getWildShapeInfo(clsId, circleId, level);
  if (!info) return null;
  const maxCrValue = crValue(info.maxCr);
  // Il tetto di GS che la Forma Selvaggia può mai raggiungere, a qualunque livello e Circolo
  // (PHB 2014): usiamo il livello 8 come proiezione, che dà sempre il GS, il nuoto e il volo massimi.
  const everInfo = getWildShapeInfo(clsId, circleId, 8);
  const everMaxCrValue = crValue(everInfo.maxCr);

  const beasts = BESTIARY
    .filter((m) => m.type === "Bestia")
    .sort((a, b) => crValue(a.cr) - crValue(b.cr) || a.name.localeCompare(b.name, "it"));

  const available = beasts.filter(
    (m) => crValue(m.cr) <= maxCrValue && (info.canFly || !(m.speed?.volare > 0)) && (info.canSwim || !(m.speed?.nuotare > 0))
  );
  const availableKeys = new Set(available.map((m) => m.key));
  const future = beasts.filter((m) => !availableKeys.has(m.key) && crValue(m.cr) <= everMaxCrValue);
  const neverReachable = beasts.filter((m) => crValue(m.cr) > everMaxCrValue);

  return (
    <div style={{ marginBottom: 18 }}>
      <Divider />
      <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 15.5, color: C.wineDeep, margin: "0 0 4px" }}>
        {title || "Forma Selvaggia — forme disponibili"}
      </h3>
      <p style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textMuted, margin: "0 0 10px" }}>
        Bestie con Grado di Sfida (GS) fino a {info.maxCr} già viste dal personaggio{!info.canSwim ? ", senza velocità di nuoto" : ""}{!info.canFly ? ", senza velocità di volo" : ""}. Clicca su una forma per vederne le statistiche complete.
      </p>
      {available.length === 0 ? (
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textMuted, fontStyle: "italic" }}>
          Nessuna bestia nel catalogo dell'app soddisfa questi limiti: il Master può comunque concederne altre, purché coerenti con le regole.
        </p>
      ) : (
        available.map((b) => <BeastCard key={b.key} beast={b} />)
      )}

      {future.length > 0 && (
        <>
          <h4 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "14px 0 4px" }}>
            Sbloccabili più avanti
          </h4>
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textMuted, margin: "0 0 8px" }}>
            Bestie che questo Druido potrà assumere salendo di livello (o cambiando Circolo), ma non ancora.
          </p>
          {future.map((b) => (
            <BeastCard key={b.key} beast={b} locked lockReason={lockReasonFor(b, info, everMaxCrValue)} />
          ))}
        </>
      )}

      {neverReachable.length > 0 && (
        <>
          <h4 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "14px 0 4px" }}>
            Mai raggiungibili con Forma Selvaggia
          </h4>
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textMuted, margin: "0 0 8px" }}>
            Esistono nel catalogo (utili al Master, es. per Evoca Animali o creature evocate), ma superano il GS massimo che la Forma Selvaggia può mai raggiungere (GS {everInfo.maxCr}), a qualsiasi livello.
          </p>
          {neverReachable.map((b) => (
            <BeastCard key={b.key} beast={b} locked lockReason={`GS ${b.cr} — oltre il tetto di ${everInfo.maxCr}`} />
          ))}
        </>
      )}
    </div>
  );
}
