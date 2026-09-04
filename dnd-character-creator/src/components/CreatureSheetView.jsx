import { useState } from "react";
import { ChevronLeft, Loader2, Save, Skull } from "../icons";
import { C } from "../theme";
import { Divider, Frame, GhostButton, GoldButton, MetricBox } from "./primitives";
import { HpTracker } from "./hp";
import { ABILITIES } from "../data/core";
import { SPELLS } from "../data/spells";
import { CREATURE_SIZES } from "../data/creatures";
import { fmtMod, mod } from "../lib/format";
import {
  formatSenses, formatSpeed, getCurrentHp, getEffectiveProficiencyBonus, getEffectiveXp,
  getMaxHp, getPassivePerception, getSaveBonus, getSpellAttackBonus, getSpellSaveDC, isCreatureDead,
} from "../lib/creature";

function TraitBlock({ title, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginBottom: 14 }}>
      <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 8px" }}>{title}</h3>
      {items.map((it) => (
        <p key={it.id} style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textOnParchment, margin: "0 0 8px" }}>
          <b style={{ fontFamily: "'Cinzel', serif" }}>{it.name || "Senza nome"}.</b> {it.desc}
        </p>
      ))}
    </div>
  );
}

function statLine(label, value) {
  if (!value) return null;
  return (
    <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textOnParchment, margin: "0 0 4px" }}>
      <b style={{ fontFamily: "'Cinzel', serif", fontSize: 11.5 }}>{label}. </b>{value}
    </p>
  );
}

export function CreatureSheetView({ creature, onBack, onSaveChanges }) {
  const [draft, setDraft] = useState(creature);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const updateDraft = (updater) => { setDirty(true); setDraft(updater); };
  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveChanges(draft);
      setDirty(false);
    } finally {
      setSaving(false);
    }
  };

  const maxHp = getMaxHp(draft);
  const current = getCurrentHp(draft);
  const dead = isCreatureDead(draft);
  const sizeLabel = CREATURE_SIZES.find((s) => s.key === draft.size)?.name || draft.size;

  const kill = () => updateDraft((d) => ({ ...d, currentHp: 0 }));
  const revive = () => updateDraft((d) => ({ ...d, currentHp: null, tempHp: 0 }));

  const sc = draft.spellcasting || {};
  const spellGroups = (sc.groups || []).filter((g) => (g.spellIds || []).length || (g.customSpells || []).some((s) => s.trim()));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", gap: 12, flexWrap: "wrap" }}>
        <div>
          <GhostButton icon={ChevronLeft} onClick={onBack} style={{ marginBottom: 10 }}>Sezione Master</GhostButton>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: 24, color: C.cream, margin: 0 }}>
            {draft.name || "Creatura senza nome"}
            {dead && <span style={{ color: C.danger, fontSize: 15, marginLeft: 10 }}>· MORTO</span>}
          </h1>
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.creamMuted, margin: "4px 0 0", fontStyle: "italic" }}>
            {sizeLabel} {draft.type}{draft.typeTag ? ` (${draft.typeTag})` : ""}, {draft.alignment} · GS {draft.cr} ({fmtMod(getEffectiveProficiencyBonus(draft))}, {getEffectiveXp(draft)} PE)
          </p>
        </div>
        <GoldButton icon={saving ? Loader2 : Save} disabled={saving || !dirty} onClick={handleSave}>
          {saving ? "Salvataggio…" : "Salva modifiche"}
        </GoldButton>
      </div>

      <Frame style={{ marginBottom: 16, ...(dead ? { boxShadow: `inset 0 0 0 2px ${C.danger}` } : {}) }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 10 }}>
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: 0 }}>Stato in Combattimento</h3>
          <div style={{ display: "flex", gap: 8 }}>
            {dead ? (
              <GoldButton icon={Skull} onClick={revive} style={{ padding: "0.4rem 0.9rem", fontSize: 12.5 }}>Riporta in vita</GoldButton>
            ) : (
              <GhostButton icon={Skull} onClick={kill} style={{ borderColor: C.danger, color: C.danger, padding: "0.4rem 0.9rem", fontSize: 12.5 }}>Uccidi</GhostButton>
            )}
          </div>
        </div>
        <HpTracker maxHp={maxHp} draft={draft} setDraft={updateDraft} />
        <div style={{ display: "grid", gridTemplateColumns: "var(--g6)", gap: 10 }}>
          <MetricBox label="CA" value={draft.ac} hint={draft.acNote} />
          <MetricBox label="Iniziativa" value={fmtMod(mod(draft.abilities.dex))} />
          <MetricBox label="Velocità" value={formatSpeed(draft.speed)} />
          <MetricBox label="Percezione Passiva" value={getPassivePerception(draft)} />
        </div>
      </Frame>

      <Frame>
        <div style={{ display: "grid", gridTemplateColumns: "var(--g6)", gap: 10, marginBottom: 14 }}>
          {ABILITIES.map((a) => (
            <div key={a.key} style={{ textAlign: "center", border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0.6rem 0.4rem" }}>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: 11, color: C.textMuted, marginBottom: 4 }}>{a.name}</div>
              <div style={{ fontFamily: "'Spectral', serif", fontSize: 15, color: C.textOnParchment }}>
                {draft.abilities[a.key]} ({fmtMod(mod(draft.abilities[a.key]))})
              </div>
              <div style={{ fontFamily: "'Spectral', serif", fontSize: 11.5, color: C.textMuted, marginTop: 2 }}>
                TS {fmtMod(getSaveBonus(draft, a.key))}
              </div>
            </div>
          ))}
        </div>

        {statLine("Abilità", (draft.skills || []).map((s) => `${s.name} ${fmtMod(Number(s.bonus) || 0)}`).join(", "))}
        {statLine("Vulnerabilità ai danni", draft.vulnerabilities)}
        {statLine("Resistenze ai danni", draft.resistances)}
        {statLine("Immunità ai danni", draft.immunities)}
        {statLine("Immunità alle condizioni", draft.conditionImmunities)}
        {statLine("Sensi", formatSenses(draft))}
        {statLine("Linguaggi", draft.languages || "—")}
        {statLine("Dadi Vita", draft.hpFormula)}

        <Divider />

        <TraitBlock title="Tratti" items={draft.traits} />
        <TraitBlock title="Azioni" items={draft.actions} />
        <TraitBlock title="Azioni Bonus" items={draft.bonusActions} />
        <TraitBlock title="Reazioni" items={draft.reactions} />

        {draft.legendaryActionsCount > 0 && (
          <div style={{ marginBottom: 14 }}>
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 8px" }}>
              Azioni Leggendarie ({draft.legendaryActionsCount} per turno)
            </h3>
            {draft.legendaryActionsNote && (
              <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, fontStyle: "italic", margin: "0 0 8px" }}>{draft.legendaryActionsNote}</p>
            )}
            {(draft.legendaryActions || []).map((it) => (
              <p key={it.id} style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textOnParchment, margin: "0 0 8px" }}>
                <b style={{ fontFamily: "'Cinzel', serif" }}>{it.name || "Senza nome"}.</b> {it.desc}
              </p>
            ))}
          </div>
        )}

        <TraitBlock title="Azioni della Tana" items={draft.lairActions} />

        {sc.enabled && (
          <div style={{ marginBottom: 14 }}>
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 8px" }}>Incantatore</h3>
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "0 0 8px" }}>
              CD Tiro Salvezza {getSpellSaveDC(draft)} · Bonus Attacco {fmtMod(getSpellAttackBonus(draft))}
            </p>
            {sc.note && <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textOnParchment, margin: "0 0 8px" }}>{sc.note}</p>}
            {spellGroups.map((g) => {
              const names = [
                ...(g.spellIds || []).map((id) => SPELLS.find((s) => s.id === id)?.name).filter(Boolean),
                ...(g.customSpells || []).filter((s) => s.trim()),
              ];
              return (
                <p key={g.id} style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textOnParchment, margin: "0 0 6px" }}>
                  <b style={{ fontFamily: "'Cinzel', serif" }}>{g.label}: </b>{names.join(", ")}
                </p>
              );
            })}
          </div>
        )}

        {draft.notes && (
          <div>
            <Divider />
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 8px" }}>Note del Master</h3>
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textOnParchment, margin: 0, whiteSpace: "pre-wrap" }}>{draft.notes}</p>
          </div>
        )}
      </Frame>
    </div>
  );
}
