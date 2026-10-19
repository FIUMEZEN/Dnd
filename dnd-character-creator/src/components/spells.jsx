// Gestione degli incantesimi: riga di un incantesimo selezionabile, tracker degli slot e delle
// risorse in gioco, e la sezione completa per-classe (dominio/ordine/patto/circolo, trucchetti,
// incantesimi conosciuti/preparati, Arcano Mistico, Colpo Divino) usata sia in creazione sia
// dal modal di level up.
import { useState } from "react";
import { Check, ChevronDown, ChevronRight } from "../icons";
import { C } from "../theme";
import { Divider, Pill, GhostButton, MetricBox, ProficiencyChoicePicker } from "./primitives";
import { MetamagicPicker, PactBoonPicker, InvocationPicker } from "./pickers";
import { ABILITIES } from "../data/core";
import { CLASSES } from "../data/classes";
import {
  SCHOOLS, SPELLS, MAX_DATA_SPELL_LEVEL, DIVINE_DOMAINS, PALADIN_OATHS, WARLOCK_PATRONS, DRUID_CIRCLES,
} from "../data/spells";
import { mod, fmtMod } from "../lib/format";
import {
  isThirdCaster, getEffectiveCasterInfo, getMaxSpellLevel, getSpellsLimit, getDomainSpellIds,
  getOathSpellIds, getPatronSpellIds, getCircleSpellIds, getUnlockedArcanumTiers, getDivineSmiteDice,
} from "../lib/casting";
import {
  getClassEntries, getEffectiveSpellSlots, getSubclass, toggleProfChoice, computeFinalScores,
} from "../lib/character";

// Concentrazione: dal flag dei dati SRD quando c'è, altrimenti dal testo della durata
// (incantesimi presenti solo nell'app).
export function spellNeedsConcentration(spell) {
  return spell.concentration ?? /^concentrazione/i.test(spell.duration || "");
}

const tagStyle = { fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textOnParchment, border: `1px solid ${C.parchmentLine}`, borderRadius: 6, padding: "0 6px", whiteSpace: "nowrap" };

// Etichette "Conc." / "Rituale": le due informazioni che al tavolo cambiano come si lancia.
function SpellTags({ spell }) {
  return (
    <>
      {spellNeedsConcentration(spell) && <span title="Richiede concentrazione" style={{ ...tagStyle, color: C.wineDeep, borderColor: C.goldSoft }}>Conc.</span>}
      {spell.ritual && <span title="Si può lanciare come rituale (+10 minuti, senza slot)" style={{ ...tagStyle, color: C.forestDeep, borderColor: C.forest }}>Rituale</span>}
    </>
  );
}

// Testo completo dell'incantesimo (SRD): descrizione a paragrafi, "ai livelli superiori",
// innesco delle reazioni, componente materiale e dati di lancio.
export function SpellDetails({ spell }) {
  const paragraphs = (spell.fullDesc || spell.desc || "").split(/\n+/).filter((x) => x.trim());
  const text = { fontFamily: "'Spectral', serif", fontSize: 14, lineHeight: 1.5, color: C.textOnParchment, margin: "0 0 8px" };
  return (
    <div>
      {spell.crunch && (
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.wineDeep, margin: "0 0 8px", fontWeight: 600, padding: "0.35rem 0.55rem", borderRadius: 6, background: "#f8f1e0", border: `1px solid ${C.goldSoft}` }}>
          <b style={{ fontFamily: "'Cinzel', serif" }}>In breve:</b> {spell.crunch}
        </p>
      )}
      {spell.trigger && (
        <p style={{ ...text, fontStyle: "italic", color: C.textMuted }}><b>Reazione</b> {spell.trigger}.</p>
      )}
      {paragraphs.map((t, i) => <p key={i} style={text}>{t}</p>)}
      {spell.higherLevels && (
        <p style={{ ...text, padding: "0.4rem 0.6rem", borderLeft: `3px solid ${C.wine}`, background: "rgba(125,31,56,0.05)" }}>
          <b style={{ fontFamily: "'Cinzel', serif", fontSize: 13 }}>Ai livelli superiori.</b> {spell.higherLevels.replace(/\n+/g, " ")}
        </p>
      )}
      <div style={{ display: "flex", gap: "4px 14px", flexWrap: "wrap", fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted }}>
        <span><b>Scuola:</b> {SCHOOLS[spell.school]}</span>
        <span><b>Tempo:</b> {spell.time}</span>
        <span><b>Gittata:</b> {spell.range}</span>
        <span><b>Componenti:</b> {spell.comp}{spell.material ? ` (${spell.material})` : ""}</span>
        <span><b>Durata:</b> {spell.duration}</span>
      </div>
    </div>
  );
}

// Riga di un incantesimo nelle liste di scelta e nel Compendio: la parte superiore seleziona
// (quando la lista è selezionabile), "Testo completo" apre il testo SRD sotto senza selezionare.
export function SpellRow({ spell, selected, disabled, onToggle, selectable = true }) {
  const [open, setOpen] = useState(false);
  const blocked = disabled && !selected;
  const hasFull = !!(spell.fullDesc || spell.higherLevels);
  return (
    <div
      style={{
        marginBottom: 6, borderRadius: 6,
        border: `1px solid ${selected ? C.wine : C.parchmentLine}`,
        borderLeft: selected ? `4px solid ${C.wine}` : "4px solid transparent",
        background: selected ? "#f5efdf" : "transparent",
        opacity: blocked ? 0.55 : 1,
      }}
    >
      <button
        onClick={selectable ? onToggle : () => setOpen((o) => !o)}
        disabled={selectable && blocked}
        aria-pressed={selectable ? !!selected : undefined}
        aria-expanded={selectable ? undefined : open}
        style={{
          all: "unset", boxSizing: "border-box", display: "block", width: "100%", textAlign: "left",
          padding: "0.7rem 0.9rem 0.5rem", cursor: selectable && blocked ? "not-allowed" : "pointer",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: "4px 10px", alignItems: "baseline", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: 15, color: selected ? C.wineDeep : C.textOnParchment, flex: "1 1 160px", minWidth: 0 }}>
            {spell.name} <span style={{ fontFamily: "'Spectral', serif", fontStyle: "italic", fontSize: 13, color: C.textMuted }}>— {SCHOOLS[spell.school]}</span>
          </span>
          <span style={{ display: "inline-flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
            <SpellTags spell={spell} />
            {selected && <Check size={14} color={C.wine} />}
          </span>
        </div>
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textMuted, margin: "3px 0 6px" }}>{spell.desc}</p>
        {spell.crunch && (
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.wineDeep, margin: "0 0 6px", fontWeight: 600 }}>
            <b style={{ fontFamily: "'Cinzel', serif", fontWeight: 700 }}>Meccanica:</b> {spell.crunch}
          </p>
        )}
        <div style={{ display: "flex", gap: "2px 14px", flexWrap: "wrap", fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted }}>
          <span><b>Tempo:</b> {spell.time}</span>
          <span><b>Gittata:</b> {spell.range}</span>
          <span><b>Componenti:</b> {spell.comp}</span>
          <span><b>Durata:</b> {spell.duration}</span>
        </div>
      </button>
      {hasFull && (
        <div style={{ padding: "0 0.9rem 0.6rem" }}>
          {selectable && (
            <button
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              style={{ all: "unset", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "'Spectral', serif", fontSize: 13, color: C.wine, minHeight: 32 }}
            >
              {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />} {open ? "Chiudi il testo" : "Testo completo"}
            </button>
          )}
          {!selectable && !open && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "'Spectral', serif", fontSize: 13, color: C.wine }}>
              <ChevronRight size={13} /> Tocca per il testo completo
            </span>
          )}
          {open && <div style={{ marginTop: 6, paddingTop: 8, borderTop: `1px solid ${C.parchmentLine}` }}><SpellDetails spell={spell} /></div>}
        </div>
      )}
    </div>
  );
}

// Chiave usata in slotsUsed per uno slot: gli slot da Patto Magico (Warlock) sono un pool
// SEPARATO da quello normale anche quando condividono lo stesso livello numerico (es. un
// multiclasse Paladino/Warlock con entrambi slot di 2° livello, ma pool distinti).
function slotUsedKey(s) {
  return s.pact ? `pact-${s.level}` : `${s.level}`;
}

// Pallini di UN livello di slot (pieno = disponibile): condivisi tra il tracker completo e le
// intestazioni per livello della vista "I miei incantesimi".
function SlotPips({ slot, slotsUsed, setDraft }) {
  const used = Math.min((slotsUsed || {})[slotUsedKey(slot)] || 0, slot.total);
  const setUsed = (count) => setDraft((d) => ({ ...d, slotsUsed: { ...d.slotsUsed, [slotUsedKey(slot)]: count } }));
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      {Array.from({ length: slot.total }).map((_, i) => {
        const isUsed = i < used;
        return (
          <button
            key={i}
            onClick={() => setUsed(isUsed ? i : i + 1)}
            title={isUsed ? "Segna come disponibile" : "Segna come usato"}
            aria-label={`Slot ${slot.pact ? "del patto " : ""}di livello ${slot.level}: ${isUsed ? "usato" : "disponibile"}`}
            style={{
              width: 22, height: 22, borderRadius: "50%", cursor: "pointer", padding: 0,
              border: `1px solid ${C.wine}`,
              background: isUsed ? "transparent" : C.wine,
            }}
          />
        );
      })}
      <span style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textMuted }}>
        {slot.total - used}/{slot.total}{slot.pact ? " patto" : ""}
      </span>
    </span>
  );
}

export function SlotTracker({ slots, slotsUsed, setDraft }) {
  if (!slots.length) return null;
  const nonPact = slots.filter((s) => !s.pact);
  const pact = slots.filter((s) => s.pact);

  const setUsed = (s, count) => {
    setDraft((d) => ({ ...d, slotsUsed: { ...d.slotsUsed, [slotUsedKey(s)]: count } }));
  };
  const restGroup = (group) => {
    setDraft((d) => {
      const next = { ...d.slotsUsed };
      group.forEach((s) => { delete next[slotUsedKey(s)]; });
      return { ...d, slotsUsed: next };
    });
  };

  const renderGroup = (group, label, restLabel) => {
    if (!group.length) return null;
    return (
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 15.5, color: C.wineDeep, margin: 0 }}>
            {label}
          </h3>
          <GhostButton onClick={() => restGroup(group)} style={{ borderColor: C.forest, color: C.forestDeep, padding: "0.4rem 0.8rem", fontSize: 13.5 }}>
            {restLabel} — recupera tutti
          </GhostButton>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {group.map((s) => {
            const used = Math.min(slotsUsed[slotUsedKey(s)] || 0, s.total);
            return (
              <div key={slotUsedKey(s)} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.textOnParchment, minWidth: 90 }}>
                  Livello {s.level}
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  {Array.from({ length: s.total }).map((_, i) => {
                    const isUsed = i < used;
                    return (
                      <button
                        key={i}
                        onClick={() => setUsed(s, isUsed ? i : i + 1)}
                        title={isUsed ? "Segna come disponibile" : "Segna come usato"}
                        style={{
                          width: 20, height: 20, borderRadius: "50%", cursor: "pointer",
                          border: `1px solid ${C.wine}`,
                          background: isUsed ? "transparent" : C.wine,
                        }}
                      />
                    );
                  })}
                </div>
                <span style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textMuted }}>
                  {s.total - used}/{s.total} disponibili
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {renderGroup(nonPact, "Slot incantesimo", "Riposo lungo")}
      {renderGroup(pact, "Slot incantesimo (Patto Magico)", "Riposo breve")}
    </>
  );
}

export function ResourceTracker({ resource, used, onSetUsed }) {
  const [amount, setAmount] = useState(1);
  if (resource.max == null) {
    return (
      <div style={{ marginBottom: 10 }}>
        <span style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.textOnParchment }}>{resource.name}: illimitati</span>
      </div>
    );
  }
  const usedCount = Math.min(used || 0, resource.max);
  const setUsed = (n) => onSetUsed(resource.key, n);

  if (resource.pool) {
    const remaining = resource.max - usedCount;
    return (
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.textOnParchment }}>
            {resource.name}: <b>{remaining}</b> / {resource.max}
          </span>
          <GhostButton onClick={() => setUsed(0)} style={{ borderColor: C.forest, color: C.forestDeep, padding: "0.3rem 0.7rem", fontSize: 12.5 }}>
            {resource.resetOn === "short" ? "Riposo breve" : "Riposo lungo"} — recupera
          </GhostButton>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="number" min={0} max={remaining} value={amount}
            onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
            style={{ width: 60, fontFamily: "'Spectral', serif", fontSize: 15, padding: "0.35rem", borderRadius: 6, border: `1px solid ${C.parchmentLine}`, background: "#fff" }}
          />
          <GhostButton
            onClick={() => setUsed(Math.min(resource.max, usedCount + Math.min(amount, remaining)))}
            disabled={remaining <= 0 || amount <= 0}
            style={{ borderColor: C.wine, color: C.wineDeep, padding: "0.35rem 0.8rem", fontSize: 13.5 }}
          >
            Spendi
          </GhostButton>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
        <span style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.textOnParchment }}>{resource.name}</span>
        <GhostButton onClick={() => setUsed(0)} style={{ borderColor: C.forest, color: C.forestDeep, padding: "0.3rem 0.7rem", fontSize: 12.5 }}>
          {resource.resetOn === "short" ? "Riposo breve" : "Riposo lungo"} — recupera
        </GhostButton>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {Array.from({ length: resource.max }).map((_, i) => {
          // I pallini si consumano da destra verso sinistra: quelli già spesi restano a destra,
          // quelli ancora disponibili a sinistra.
          const isUsed = i >= resource.max - usedCount;
          return (
            <button
              key={i}
              onClick={() => setUsed(isUsed ? resource.max - i - 1 : resource.max - i)}
              title={isUsed ? "Segna come disponibile" : "Segna come usato"}
              style={{
                width: 18, height: 18, borderRadius: "50%", cursor: "pointer",
                border: `1px solid ${C.forest}`,
                background: isUsed ? "transparent" : C.forest,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

// Scheda compatta di un incantesimo per la consultazione in gioco: una riga con nome e dati
// essenziali (tempo, gittata, concentrazione); il testo completo si apre con un tocco.
function SpellCard({ spell, note }) {
  const [open, setOpen] = useState(false);
  const chip = tagStyle;
  return (
    <div style={{ border: `1px solid ${C.parchmentLine}`, borderRadius: 6, marginBottom: 6, background: open ? "#f8f1e0" : "transparent" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{ all: "unset", boxSizing: "border-box", width: "100%", cursor: "pointer", padding: "0.55rem 0.7rem", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "4px 8px", minHeight: 44 }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'Cinzel', serif", fontSize: 14.5, color: C.textOnParchment, flex: "1 1 150px", minWidth: 0 }}>
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <span style={{ minWidth: 0 }}>{spell.name}</span>
        </span>
        <span style={{ display: "flex", gap: 5, flexWrap: "wrap", marginLeft: "auto" }}>
          <SpellTags spell={spell} />
          {note && <span style={{ ...chip, color: C.forestDeep, borderColor: C.forest }}>{note}</span>}
          <span style={chip}>{spell.time}</span>
          <span style={chip}>{spell.range}</span>
        </span>
      </button>
      {open && (
        <div style={{ padding: "0 0.8rem 0.7rem" }}>
          <SpellDetails spell={spell} />
        </div>
      )}
    </div>
  );
}

// Vista in gioco "I miei incantesimi": solo ciò che il personaggio conosce/prepara (più quelli
// sempre preparati della sottoclasse e l'Arcano Mistico), raggruppati per livello, con gli slot
// di quel livello direttamente sull'intestazione — come le schede di D&D Beyond / Fight Club 5e.
function MySpellsView({ draft, setDraft, casterEntries, slots, spellSearch }) {
  const free = new Map(); // id -> etichetta ("Sempre preparato", "Arcano Mistico")
  casterEntries.forEach((e) => {
    const store = e.store;
    const maxLvl = getMaxSpellLevel(e.classId, e.level, e.subclassId);
    const ids = e.classId === "chierico" ? getDomainSpellIds(store.domainId, maxLvl)
      : e.classId === "paladino" ? getOathSpellIds(store.oathId, maxLvl)
        : e.classId === "druido" ? getCircleSpellIds(store.circleId, maxLvl)
          : [];
    ids.forEach((id) => free.set(id, "Sempre preparato"));
    if (e.classId === "warlock") Object.values(store.mysticArcanum || {}).filter(Boolean).forEach((id) => free.set(id, "Arcano Mistico"));
  });
  const ids = [...new Set([...(draft.spellsKnown || []), ...free.keys()])];
  const term = spellSearch.trim().toLowerCase();
  const spells = ids.map((id) => SPELLS.find((sp) => sp.id === id)).filter(Boolean)
    .filter((sp) => !term || sp.name.toLowerCase().includes(term))
    .sort((a, b) => a.name.localeCompare(b.name, "it"));

  const levels = new Set(spells.map((sp) => sp.level));
  slots.forEach((sl) => levels.add(sl.level));
  const sortedLevels = [...levels].sort((a, b) => a - b);

  const restGroup = (pact) => setDraft((d) => {
    const next = { ...d.slotsUsed };
    slots.filter((sl) => !!sl.pact === pact).forEach((sl) => { delete next[slotUsedKey(sl)]; });
    return { ...d, slotsUsed: next };
  });

  if (!spells.length && !slots.length) {
    return (
      <p style={{ fontFamily: "'Spectral', serif", fontSize: 14.5, color: C.textMuted, fontStyle: "italic" }}>
        {term ? `Nessun tuo incantesimo corrisponde a "${spellSearch}".` : "Non hai ancora scelto incantesimi: usa \"Scegli incantesimi\" qui sopra."}
      </p>
    );
  }

  return (
    <div>
      {slots.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {slots.some((sl) => !sl.pact) && (
            <GhostButton onClick={() => restGroup(false)} style={{ borderColor: C.forest, color: C.forestDeep, padding: "0.4rem 0.8rem", fontSize: 13.5 }}>
              Riposo lungo — recupera gli slot
            </GhostButton>
          )}
          {slots.some((sl) => sl.pact) && (
            <GhostButton onClick={() => restGroup(true)} style={{ borderColor: C.forest, color: C.forestDeep, padding: "0.4rem 0.8rem", fontSize: 13.5 }}>
              Riposo breve — recupera il Patto
            </GhostButton>
          )}
        </div>
      )}
      {sortedLevels.map((lvl) => {
        const list = spells.filter((sp) => sp.level === lvl);
        const levelSlots = slots.filter((sl) => sl.level === lvl);
        if (term && !list.length) return null;
        return (
          <div key={lvl} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px 12px", padding: "0 0 6px", marginBottom: 6, borderBottom: `1px solid ${C.parchmentLine}` }}>
              <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 15, color: C.wineDeep, margin: 0 }}>
                {lvl === 0 ? "Trucchetti" : `${lvl}° livello`}
              </h3>
              {levelSlots.length > 0 && (
                <span style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {levelSlots.map((sl) => <SlotPips key={slotUsedKey(sl)} slot={sl} slotsUsed={draft.slotsUsed} setDraft={setDraft} />)}
                </span>
              )}
            </div>
            {list.length === 0 ? (
              <p style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textMuted, fontStyle: "italic", margin: 0 }}>
                Nessun incantesimo di questo livello: gli slot servono a lanciare a livello superiore quelli più bassi.
              </p>
            ) : list.map((sp) => <SpellCard key={sp.id} spell={sp} note={free.get(sp.id)} />)}
          </div>
        );
      })}
    </div>
  );
}

export function SpellManager({ draft, setDraft, showPlayTools = false }) {
  const [spellSearch, setSpellSearch] = useState("");
  // In gioco si parte dalla consultazione ("I miei"); la scelta/modifica degli incantesimi
  // (la lista completa della classe) resta a un tocco, in "Scegli incantesimi".
  const [view, setView] = useState("mine");
  const cls = CLASSES.find((c) => c.id === draft.classId);

  if (!cls) {
    return <p style={{ fontFamily: "'Spectral', serif", color: C.textMuted }}>Completa prima il passo Classe.</p>;
  }

  const entries = getClassEntries(draft);
  const casterEntries = entries.filter((e) => getEffectiveCasterInfo(e.classId, e.subclassId));

  if (casterEntries.length === 0) {
    const canBecomeThirdCaster = entries.some((e) => e.classId === "guerriero" || e.classId === "ladro");
    const names = entries.map((e) => CLASSES.find((c) => c.id === e.classId)?.name).filter(Boolean).join(" / ");
    return (
      <div>
        <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: C.textOnParchment, margin: "0 0 4px" }}>Incantesimi</h2>
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 15.5, color: C.textMuted }}>
          {names} non lancia{entries.length > 1 ? "no" : ""} incantesimi
          {canBecomeThirdCaster ? ", a meno di scegliere la sottoclasse Cavaliere Mistico (Guerriero) o Furfante Arcano (Ladro)." : "."}
        </p>
      </div>
    );
  }

  const slots = getEffectiveSpellSlots(draft);

  return (
    <div>
      <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: C.textOnParchment, margin: "0 0 4px" }}>Incantesimi</h2>

      {casterEntries.length > 1 && (
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 14.5, color: C.textMuted, margin: "0 0 1rem", fontStyle: "italic" }}>
          Personaggio multiclasse: gli slot incantesimo sono un'unica riserva condivisa, calcolata secondo la Tabella dell'Incantatore Multiclasse (5e 2014). Il Patto Magico del Warlock resta invece un pool separato, che si recupera con un riposo breve.
        </p>
      )}

      {showPlayTools && (
        <div role="tablist" style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "8px 0 14px" }}>
          <Pill active={view === "mine"} onClick={() => setView("mine")}>I miei incantesimi</Pill>
          <Pill active={view === "choose"} onClick={() => setView("choose")}>Scegli incantesimi</Pill>
        </div>
      )}

      {showPlayTools ? (
        view === "choose" && <SlotTracker slots={slots} slotsUsed={draft.slotsUsed} setDraft={setDraft} />
      ) : (
        slots.length > 0 && (
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 15, color: C.textOnParchment, marginBottom: 18 }}>
            <b>Slot incantesimo:</b> {slots.map((s) => `liv. ${s.level} × ${s.total}${s.pact ? " (patto)" : ""}`).join(", ")}
          </p>
        )
      )}

      <Divider />

      <input
        type="text" placeholder="Cerca un incantesimo per nome…" value={spellSearch}
        onChange={(e) => setSpellSearch(e.target.value)}
        style={{
          width: "100%", fontFamily: "'Spectral', serif", fontSize: 15, padding: "0.5rem 0.7rem",
          borderRadius: 6, border: `1px solid ${C.parchmentLine}`, background: "#fff", marginBottom: 18, boxSizing: "border-box",
        }}
      />

      {showPlayTools && view === "mine" ? (
        <MySpellsView draft={draft} setDraft={setDraft} casterEntries={casterEntries} slots={slots} spellSearch={spellSearch} />
      ) : casterEntries.map((entry) => (
        <ClassSpellSection
          key={entry.classId}
          draft={draft}
          setDraft={setDraft}
          entry={entry}
          showPlayTools={showPlayTools}
          spellSearch={spellSearch}
          multi={casterEntries.length > 1}
        />
      ))}
    </div>
  );
}

// Sezione incantesimi per UNA classe incantatrice del personaggio (store = draft per la
// classe primaria, oppure draft.multiclass per la classe secondaria da multiclasse).
export function ClassSpellSection({ draft, setDraft, entry, showPlayTools, spellSearch, multi }) {
  const cls = CLASSES.find((c) => c.id === entry.classId);
  if (!cls) return null;
  const chosenSubclassId = entry.subclassId;
  const caster = getEffectiveCasterInfo(cls.id, chosenSubclassId);
  if (!caster) return null;
  const store = entry.store;
  // Nella scheda di gioco la sottoclasse si sceglie (e si cambia) da Panoramica: qui, una volta
  // scelta, resta in sola lettura, così un tap accidentale non la azzera più.
  const lockSubclass = showPlayTools;
  const updateStore = entry.isPrimary
    ? (fn) => setDraft((d) => ({ ...d, ...fn(d) }))
    : (fn) => setDraft((d) => ({ ...d, multiclass: { ...d.multiclass, ...fn(d.multiclass) } }));

  const sectionHeader = multi && (
    <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 15, color: C.wineDeep, margin: "0 0 8px", paddingTop: 14, borderTop: `1px solid ${C.parchmentLine}` }}>
      {cls.name} (liv. {entry.level})
    </h3>
  );

  const maxLevelReal = getMaxSpellLevel(cls.id, entry.level, chosenSubclassId);
  if (maxLevelReal === 0) {
    return (
      <div style={{ marginBottom: 18 }}>
        {sectionHeader}
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 15.5, color: C.textMuted }}>
          Al livello {entry.level}, {cls.name} non ha ancora slot di incantesimo.
          {caster.halfCaster ? " Le classi semi-incantatrici come questa ottengono i primi incantesimi al 2° livello." : ""}
          {isThirdCaster(cls.id, chosenSubclassId) ? " I terzi-incantatori ottengono i primi incantesimi al 3° livello." : ""}
        </p>
      </div>
    );
  }

  const finalScores = computeFinalScores(draft);
  const abilityMod = mod(finalScores[caster.ability]);
  const abilityName = ABILITIES.find((a) => a.key === caster.ability).name;
  // Circolo della Terra (Druido): trucchetto bonus dal 2° livello, oltre al normale progresso di classe.
  const isLandCircleDruid = cls.id === "druido" && entry.level >= 2 && chosenSubclassId && chosenSubclassId !== "circolo-luna";
  const cantripsCount = caster.cantrips[Math.min(entry.level, 20) - 1] + (isLandCircleDruid ? 1 : 0);
  const spellsLimit = getSpellsLimit(cls.id, caster, entry.level, abilityMod);
  const preparedPerDay = caster.type === "spellbook" ? getPreparedPerDay(caster, entry.level, abilityMod) : null;
  const dataMax = Math.min(maxLevelReal, MAX_DATA_SPELL_LEVEL);
  const thirdCaster = isThirdCaster(cls.id, chosenSubclassId);
  const spellClassId = thirdCaster ? "mago" : cls.id;

  const domain = cls.id === "chierico" ? DIVINE_DOMAINS.find((d) => d.id === store.domainId) : null;
  const oath = cls.id === "paladino" ? PALADIN_OATHS.find((o) => o.id === store.oathId) : null;
  const patron = cls.id === "warlock" ? WARLOCK_PATRONS.find((p) => p.id === store.patronId) : null;
  const circle = cls.id === "druido" ? DRUID_CIRCLES.find((c) => c.id === store.circleId) : null;
  const subclassSpellIds = cls.id === "chierico" ? getDomainSpellIds(store.domainId, maxLevelReal)
    : cls.id === "paladino" ? getOathSpellIds(store.oathId, maxLevelReal)
      : cls.id === "druido" ? getCircleSpellIds(store.circleId, maxLevelReal)
        : [];
  const patronSpellIds = patron ? getPatronSpellIds(store.patronId, maxLevelReal) : [];
  const subclassLabel = domain ? `Dominio ${domain.name}` : oath ? `Ordine di ${oath.name}` : circle ? `Circolo — ${circle.name}` : null;

  const cantripOptions = SPELLS.filter((s) => s.level === 0 && s.classes.includes(spellClassId));
  const spellOptions = SPELLS.filter((s) => s.level >= 1 && s.level <= dataMax && !subclassSpellIds.includes(s.id) && (s.classes.includes(spellClassId) || patronSpellIds.includes(s.id)));
  const subclassSpellObjects = subclassSpellIds.map((id) => SPELLS.find((s) => s.id === id)).filter(Boolean);

  // Incantesimi conosciuti che nessuna classe del personaggio ha più in lista (es. scelti quando
  // le liste di classe dell'app erano sbagliate, prima dell'allineamento con l'SRD): restano nel
  // personaggio e si mostrano a parte, una sola volta (nella sezione della classe primaria),
  // così si possono vedere e togliere invece di sparire in silenzio dai conteggi.
  const orphanSpells = entry.isPrimary ? draft.spellsKnown
    .map((id) => SPELLS.find((sp) => sp.id === id)).filter(Boolean)
    .filter((sp) => !getClassEntries(draft).some((e) => {
      const cid = isThirdCaster(e.classId, e.subclassId) ? "mago" : e.classId;
      if (sp.classes.includes(cid)) return true;
      if (e.classId === "warlock") return getPatronSpellIds(e.store.patronId, 9).includes(sp.id);
      return false;
    })) : [];

  const selectedCantrips = draft.spellsKnown.filter((id) => cantripOptions.some((s) => s.id === id));
  const selectedSpells = draft.spellsKnown.filter((id) => spellOptions.some((s) => s.id === id));

  const toggleSpell = (spell, limit, currentCount) => {
    setDraft((d) => {
      const has = d.spellsKnown.includes(spell.id);
      if (has) return { ...d, spellsKnown: d.spellsKnown.filter((id) => id !== spell.id) };
      if (currentCount >= limit) return d;
      return { ...d, spellsKnown: [...d.spellsKnown, spell.id] };
    });
  };

  const byLevel = {};
  const searchTerm = (spellSearch || "").trim().toLowerCase();
  const matchesSearch = (s) => !searchTerm || s.name.toLowerCase().includes(searchTerm);
  spellOptions.filter(matchesSearch).forEach((s) => { (byLevel[s.level] = byLevel[s.level] || []).push(s); });
  const filteredCantripOptions = cantripOptions.filter(matchesSearch);

  return (
    <div style={{ marginBottom: 22 }}>
      {sectionHeader}
      <p style={{ fontFamily: "'Spectral', serif", fontSize: 15.5, color: C.textMuted, margin: "0 0 1.25rem" }}>
        {cls.name} lancia gli incantesimi tramite {abilityName} ({fmtMod(abilityMod)}), livello {entry.level}.
      </p>

      {cls.id === "chierico" && (
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 13.5, color: C.textMuted, margin: "0 0 8px" }}>Dominio Divino</p>
          {lockSubclass && store.domainId ? (
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 14.5, color: C.textOnParchment, margin: 0 }}>
              <b>{DIVINE_DOMAINS.find((x) => x.id === store.domainId)?.name}</b>
              <span style={{ color: C.textMuted, fontStyle: "italic" }}> — si cambia dalla scheda Panoramica.</span>
            </p>
          ) : (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {DIVINE_DOMAINS.map((d) => (
              <Pill key={d.id} active={store.domainId === d.id} onClick={() => updateStore(() => ({ domainId: d.id }))}>
                {d.name}
              </Pill>
            ))}
          </div>
          )}
          {domain && (
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textMuted, margin: "8px 0 0", fontStyle: "italic" }}>
              Gli incantesimi di dominio sono sempre preparati gratuitamente e non contano nel numero di {caster.label.toLowerCase()}.
            </p>
          )}
          {(getSubclass("chierico", store.domainId)?.proficiencyChoices || []).map((spec) => (
            <ProficiencyChoicePicker
              key={spec.key}
              spec={spec}
              selected={(store.profChoices && store.profChoices[spec.key]) || []}
              onToggle={(value) => toggleProfChoice(updateStore, spec, value)}
            />
          ))}
        </div>
      )}

      {cls.id === "paladino" && (
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 13.5, color: C.textMuted, margin: "0 0 8px" }}>Ordine Sacro</p>
          {lockSubclass && store.oathId ? (
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 14.5, color: C.textOnParchment, margin: 0 }}>
              <b>{PALADIN_OATHS.find((x) => x.id === store.oathId)?.name}</b>
              <span style={{ color: C.textMuted, fontStyle: "italic" }}> — si cambia dalla scheda Panoramica.</span>
            </p>
          ) : (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {PALADIN_OATHS.map((o) => (
              <Pill key={o.id} active={store.oathId === o.id} onClick={() => updateStore(() => ({ oathId: o.id }))}>
                {o.name}
              </Pill>
            ))}
          </div>
          )}
          {oath && (
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textMuted, margin: "8px 0 0", fontStyle: "italic" }}>
              Gli incantesimi dell'ordine sono sempre preparati gratuitamente e non contano nel numero di {caster.label.toLowerCase()}.
            </p>
          )}
        </div>
      )}

      {cls.id === "warlock" && (
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 13.5, color: C.textMuted, margin: "0 0 8px" }}>Patto Ultramondano</p>
          {lockSubclass && store.patronId ? (
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 14.5, color: C.textOnParchment, margin: 0 }}>
              <b>{WARLOCK_PATRONS.find((x) => x.id === store.patronId)?.name}</b>
              <span style={{ color: C.textMuted, fontStyle: "italic" }}> — si cambia dalla scheda Panoramica.</span>
            </p>
          ) : (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {WARLOCK_PATRONS.map((p) => (
              <Pill key={p.id} active={store.patronId === p.id} onClick={() => updateStore(() => ({ patronId: p.id }))}>
                {p.name}
              </Pill>
            ))}
          </div>
          )}
          {patron && (
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textMuted, margin: "8px 0 0", fontStyle: "italic" }}>
              Gli incantesimi del patto non sono gratuiti: si aggiungono semplicemente alla lista da cui puoi scegliere i tuoi {caster.label.toLowerCase()}.
            </p>
          )}
        </div>
      )}

      {cls.id === "druido" && (
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 13.5, color: C.textMuted, margin: "0 0 8px" }}>Sottoclasse — Circolo della Terra o della Luna</p>
          {lockSubclass && store.circleId ? (
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 14.5, color: C.textOnParchment, margin: 0 }}>
              <b>{DRUID_CIRCLES.find((x) => x.id === store.circleId)?.name}</b>
              <span style={{ color: C.textMuted, fontStyle: "italic" }}> — si cambia dalla scheda Panoramica.</span>
            </p>
          ) : (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {DRUID_CIRCLES.map((c) => (
              <Pill key={c.id} active={store.circleId === c.id} onClick={() => updateStore(() => ({ circleId: c.id }))}>
                {c.name}
              </Pill>
            ))}
          </div>
          )}
          {circle && circle.id !== "circolo-luna" && (
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textMuted, margin: "8px 0 0", fontStyle: "italic" }}>
              Gli incantesimi del Circolo della Terra sono sempre preparati gratuitamente e non contano nel numero di {caster.label.toLowerCase()}.
            </p>
          )}
          {circle && circle.id === "circolo-luna" && (
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textMuted, margin: "8px 0 0", fontStyle: "italic" }}>
              Il Circolo della Luna non concede incantesimi bonus: le sue feature riguardano la Forma Selvaggia in combattimento (vedi il Riepilogo/Scheda di gioco).
            </p>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginBottom: 18 }}>
        <MetricBox label="Livello incantesimi max" value={`${maxLevelReal}°`} />
        {cantripsCount > 0 && <MetricBox label="Trucchetti" value={`${selectedCantrips.length}/${cantripsCount}`} />}
        <MetricBox label={caster.label} value={`${selectedSpells.length}/${spellsLimit}`} />
        {preparedPerDay !== null && <MetricBox label="Preparabili al giorno" value={preparedPerDay} />}
      </div>

      {caster.type === "spellbook" && (
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textMuted, marginBottom: 14, fontStyle: "italic" }}>
          Il libro contiene {spellsLimit} incantesimi in tutto, ma ogni giorno se ne possono preparare solo {preparedPerDay} (Intelligenza {fmtMod(abilityMod)} + livello {entry.level}, minimo 1).
        </p>
      )}
      {caster.type === "prepared" && caster.halfCaster && (
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textMuted, marginBottom: 14, fontStyle: "italic" }}>
          Come semi-incantatore, prepara Carisma {fmtMod(abilityMod)} + metà livello (arrotondato per difetto), minimo 1.
        </p>
      )}

      {subclassLabel && subclassSpellObjects.length > 0 && (
        <>
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 15.5, color: C.forestDeep, margin: "0 0 8px" }}>
            Incantesimi del {subclassLabel} — sempre preparati
          </h3>
          {subclassSpellObjects.map((s) => (
            <SpellRow key={s.id} spell={s} selected disabled onToggle={() => { }} />
          ))}
          <Divider />
        </>
      )}

      {thirdCaster && (
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textMuted, marginBottom: 14, fontStyle: "italic" }}>
          Come terzo-incantatore, la lista è quella del Mago: {cls.id === "guerriero"
            ? "scegli soprattutto tra Ammaliamento ed Evocazione."
            : "scegli soprattutto tra Ammaliamento e Illusione."} Questa non è imposta come limite rigido dall'app.
        </p>
      )}

      {cls.id === "warlock" && getUnlockedArcanumTiers(entry.level).length > 0 && (
        <>
          <Divider />
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 15.5, color: C.wineDeep, margin: "0 0 4px" }}>Arcano Mistico</h3>
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textMuted, margin: "0 0 10px" }}>
            Un incantesimo fisso per livello, lanciabile una volta per riposo lungo senza consumare uno slot.
          </p>
          {getUnlockedArcanumTiers(entry.level).map((tier) => {
            const options = SPELLS.filter((s) => s.level === tier && s.classes.includes("warlock"));
            return (
              <div key={tier} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.textOnParchment, minWidth: 90 }}>
                  Incantesimo di {tier}° livello
                </span>
                <select
                  value={store.mysticArcanum?.[tier] || ""}
                  onChange={(e) => updateStore((s) => ({ mysticArcanum: { ...s.mysticArcanum, [tier]: e.target.value || null } }))}
                  style={{ fontFamily: "'Spectral', serif", fontSize: 14.5, padding: "0.35rem 0.5rem", borderRadius: 6, border: `1px solid ${C.parchmentLine}`, background: "#fff" }}
                >
                  <option value="">Scegli…</option>
                  {options.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {options.length === 0 && (
                  <span style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textMuted, fontStyle: "italic" }}>
                    Nessun incantesimo di {tier}° livello disponibile nel dataset per il Warlock.
                  </span>
                )}
              </div>
            );
          })}
        </>
      )}

      {maxLevelReal > MAX_DATA_SPELL_LEVEL && (
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textMuted, marginBottom: 14, fontStyle: "italic" }}>
          A questo livello {cls.name} avrebbe accesso a incantesimi fino al {maxLevelReal}° livello: questa versione dell'app propone incantesimi selezionabili fino al {MAX_DATA_SPELL_LEVEL}°.
        </p>
      )}

      {cls.id === "stregone" && <MetamagicPicker store={store} updateStore={updateStore} level={entry.level} />}

      {cls.id === "warlock" && (
        <>
          <PactBoonPicker store={store} updateStore={updateStore} level={entry.level} />
          <InvocationPicker store={store} updateStore={updateStore} level={entry.level} />
        </>
      )}

      {cls.id === "paladino" && (
        <>
          <Divider />
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 15.5, color: C.wineDeep, margin: "0 0 4px" }}>Colpo Divino</h3>
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textMuted, margin: "0 0 10px" }}>
            Quando colpisci una creatura con un attacco in mischia con arma, puoi spendere uno slot incantesimo per infliggere danno radioso extra al bersaglio. Il danno aumenta di 1d8 se il bersaglio è un non morto o un immondo (massimo 6d8 in quel caso).
          </p>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            {[1, 2, 3, 4, 5].map((lvl) => (
              <MetricBox key={lvl} label={`Slot di ${lvl}° liv.`} value={`${getDivineSmiteDice(lvl)}d8`} />
            ))}
          </div>
        </>
      )}

      <Divider />

      {orphanSpells.length > 0 && (
        <div style={{ border: `1px solid ${C.danger}66`, borderLeft: `5px solid ${C.danger}`, background: "#fbf1ea", borderRadius: 8, padding: "0.7rem 0.8rem", marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 15, color: C.wineDeep, margin: "0 0 4px" }}>Fuori dalla lista di classe</h3>
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textMuted, margin: "0 0 10px" }}>
            Le liste degli incantesimi per classe ora seguono quelle ufficiali: questi incantesimi, scelti in precedenza, non appartengono alle classi del personaggio. Puoi tenerli d'accordo con il Master, oppure toccarli per toglierli e scegliere al loro posto.
          </p>
          {orphanSpells.map((sp) => (
            <SpellRow key={sp.id} spell={sp} selected disabled={false} onToggle={() => setDraft((d) => ({ ...d, spellsKnown: d.spellsKnown.filter((id) => id !== sp.id) }))} />
          ))}
        </div>
      )}

      {cantripsCount > 0 && filteredCantripOptions.length > 0 && (
        <>
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 15.5, color: C.wineDeep, margin: "0 0 8px" }}>
            Trucchetti — scegline {cantripsCount}
          </h3>
          {filteredCantripOptions.map((s) => (
            <SpellRow
              key={s.id} spell={s} selected={draft.spellsKnown.includes(s.id)}
              disabled={selectedCantrips.length >= cantripsCount}
              onToggle={() => toggleSpell(s, cantripsCount, selectedCantrips.length)}
            />
          ))}
          <Divider />
        </>
      )}

      <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 15.5, color: C.wineDeep, margin: "0 0 8px" }}>
        {caster.label} — scegline {spellsLimit} tra i livelli 1–{dataMax}
      </h3>
      {Object.keys(byLevel).length === 0 && searchTerm && (
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 14.5, color: C.textMuted, fontStyle: "italic" }}>
          Nessun incantesimo trovato per "{spellSearch}".
        </p>
      )}
      {Object.keys(byLevel).sort((a, b) => a - b).map((lvl) => (
        <div key={lvl} style={{ marginBottom: 14 }}>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 13.5, color: C.textMuted, margin: "0 0 6px" }}>
            {lvl}° livello
          </p>
          {byLevel[lvl].map((s) => (
            <SpellRow
              key={s.id} spell={s} selected={draft.spellsKnown.includes(s.id)}
              disabled={selectedSpells.length >= spellsLimit}
              onToggle={() => toggleSpell(s, spellsLimit, selectedSpells.length)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function getPreparedPerDay(caster, level, abilityMod) {
  const lvl = Math.max(1, Math.min(20, level || 1));
  return Math.max(1, abilityMod + lvl);
}
