import { useState } from "react";
import { ChevronLeft, Plus, Save, Trash2, Loader2 } from "../icons";
import { C } from "../theme";
import { Divider, Frame, GhostButton, GoldButton, Pill } from "./primitives";
import { ABILITIES, SKILL_ABILITY } from "../data/core";
import { SPELLS, SCHOOLS } from "../data/spells";
import {
  ALIGNMENTS, CONDITIONS, CREATURE_SIZES, CREATURE_TYPES, CR_OPTIONS, DAMAGE_TYPES, SPELLCASTING_ABILITIES,
} from "../data/creatures";
import { fmtMod, mod } from "../lib/format";
import {
  emptySkillEntry, emptySpellGroup, emptyTraitEntry, formatSenses, formatSpeed,
  getEffectiveProficiencyBonus, getEffectiveXp, getPassivePerception, getSaveBonus,
  getSpellAttackBonus, getSpellSaveDC, getSuggestedSkillBonus, validateCreature,
} from "../lib/creature";

const inputStyle = {
  fontFamily: "'Spectral', serif", fontSize: 13.5, padding: "0.5rem 0.7rem",
  borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff", boxSizing: "border-box", width: "100%",
};
const numberInputStyle = { ...inputStyle, width: 90 };
const labelStyle = {
  fontFamily: "'Cinzel', serif", fontSize: 11, color: C.textMuted, display: "block", marginBottom: 4, letterSpacing: 0.3,
};
const sectionTitleStyle = { fontFamily: "'Cinzel', serif", fontSize: 15, color: C.wineDeep, margin: "0 0 10px" };

function Field({ label, children, style }) {
  return (
    <div style={style}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

// Editor generico per liste ripetibili "nome + descrizione": Tratti, Azioni, Azioni Bonus,
// Reazioni, Azioni Leggendarie, Azioni della Tana condividono tutte la stessa forma.
function TraitListEditor({ items, onChange, addLabel, namePlaceholder }) {
  const update = (id, patch) => onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const remove = (id) => onChange(items.filter((it) => it.id !== id));
  const add = () => onChange([...items, emptyTraitEntry()]);
  return (
    <div>
      {items.map((it) => (
        <div key={it.id} style={{ border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0.75rem 0.9rem", marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
            <input
              type="text" value={it.name} placeholder={namePlaceholder}
              onChange={(e) => update(it.id, { name: e.target.value })}
              style={{ ...inputStyle, fontFamily: "'Cinzel', serif", fontWeight: 600 }}
            />
            <button onClick={() => remove(it.id)} aria-label="Rimuovi" style={{ background: "transparent", border: "none", cursor: "pointer", color: C.danger, padding: 4, flexShrink: 0 }}>
              <Trash2 size={15} />
            </button>
          </div>
          <textarea
            value={it.desc} placeholder="Descrizione ed effetto…" rows={2}
            onChange={(e) => update(it.id, { desc: e.target.value })}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>
      ))}
      <GhostButton icon={Plus} onClick={add} style={{ borderColor: C.wine, color: C.wineDeep }}>{addLabel}</GhostButton>
    </div>
  );
}

function SkillsEditor({ creature, onChange }) {
  const skills = creature.skills || [];
  const update = (id, patch) => onChange(skills.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const remove = (id) => onChange(skills.filter((s) => s.id !== id));
  const add = () => {
    const entry = emptySkillEntry();
    const firstFree = Object.keys(SKILL_ABILITY).find((n) => !skills.some((s) => s.name === n)) || Object.keys(SKILL_ABILITY)[0];
    entry.name = firstFree;
    entry.bonus = getSuggestedSkillBonus(creature, SKILL_ABILITY[firstFree]);
    onChange([...skills, entry]);
  };
  return (
    <div>
      {skills.map((s) => (
        <div key={s.id} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
          <select
            value={s.name}
            onChange={(e) => update(s.id, { name: e.target.value, bonus: getSuggestedSkillBonus(creature, SKILL_ABILITY[e.target.value]) })}
            style={{ ...inputStyle, flex: 1 }}
          >
            {Object.keys(SKILL_ABILITY).map((n) => <option key={n} value={n}>{n} ({SKILL_ABILITY[n]})</option>)}
          </select>
          <input
            type="number" value={s.bonus}
            onChange={(e) => update(s.id, { bonus: e.target.value === "" ? "" : Number(e.target.value) })}
            style={numberInputStyle}
          />
          <button onClick={() => remove(s.id)} aria-label="Rimuovi abilità" style={{ background: "transparent", border: "none", cursor: "pointer", color: C.danger, padding: 4, flexShrink: 0 }}>
            <Trash2 size={15} />
          </button>
        </div>
      ))}
      <GhostButton icon={Plus} onClick={add} style={{ borderColor: C.wine, color: C.wineDeep }}>Aggiungi abilità</GhostButton>
    </div>
  );
}

// Ricerca+selezione compatta sul catalogo incantesimi del compendio: usata dentro un gruppo di
// incantesimi della creatura, così il Master può sempre consultare/scegliere incantesimi senza
// lasciare la scheda che sta creando.
function SpellPickerInline({ group, onChange }) {
  const [search, setSearch] = useState("");
  const term = search.trim().toLowerCase();
  const matches = term ? SPELLS.filter((s) => s.name.toLowerCase().includes(term)).slice(0, 30) : [];
  const selectedSpells = (group.spellIds || []).map((id) => SPELLS.find((s) => s.id === id)).filter(Boolean);

  const toggleSpell = (id) => {
    const has = (group.spellIds || []).includes(id);
    onChange({ spellIds: has ? group.spellIds.filter((x) => x !== id) : [...(group.spellIds || []), id] });
  };
  const addCustom = () => onChange({ customSpells: [...(group.customSpells || []), ""] });
  const updateCustom = (i, val) => {
    const next = [...(group.customSpells || [])];
    next[i] = val;
    onChange({ customSpells: next });
  };
  const removeCustom = (i) => onChange({ customSpells: (group.customSpells || []).filter((_, idx) => idx !== i) });

  return (
    <div>
      {(selectedSpells.length > 0 || (group.customSpells || []).length > 0) && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          {selectedSpells.map((s) => (
            <Pill key={s.id} active onClick={() => toggleSpell(s.id)} title="Clicca per rimuovere">
              {s.name} ✕
            </Pill>
          ))}
        </div>
      )}
      {(group.customSpells || []).map((val, i) => (
        <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
          <input
            type="text" value={val} placeholder="Incantesimo non presente nel compendio…"
            onChange={(e) => updateCustom(i, e.target.value)}
            style={inputStyle}
          />
          <button onClick={() => removeCustom(i)} aria-label="Rimuovi" style={{ background: "transparent", border: "none", cursor: "pointer", color: C.danger, padding: 4 }}>
            <Trash2 size={15} />
          </button>
        </div>
      ))}
      <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
        <input
          type="text" value={search} placeholder="Cerca nel compendio incantesimi per nome…"
          onChange={(e) => setSearch(e.target.value)}
          style={inputStyle}
        />
        <GhostButton onClick={addCustom} style={{ flexShrink: 0, fontSize: 12, padding: "0.5rem 0.7rem" }}>+ libero</GhostButton>
      </div>
      {term && (
        matches.length === 0 ? (
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: 0 }}>Nessun incantesimo trovato.</p>
        ) : (
          <div style={{ maxHeight: 180, overflowY: "auto", border: `1px solid ${C.parchmentLine}`, borderRadius: 2 }}>
            {matches.map((s) => {
              const picked = (group.spellIds || []).includes(s.id);
              return (
                <button
                  key={s.id} onClick={() => toggleSpell(s.id)}
                  style={{
                    display: "block", width: "100%", textAlign: "left", padding: "0.45rem 0.7rem",
                    background: picked ? "#f5efdf" : "transparent", border: "none", borderBottom: `1px solid ${C.parchmentLine}`,
                    cursor: "pointer", fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textOnParchment,
                  }}
                >
                  {picked ? "✓ " : ""}{s.name} <span style={{ color: C.textMuted, fontStyle: "italic" }}>— liv. {s.level} · {SCHOOLS[s.school]}</span>
                </button>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}

function SpellcastingEditor({ creature, onChange }) {
  const sc = creature.spellcasting;
  const patch = (p) => onChange({ ...sc, ...p });
  const groups = sc.groups || [];
  const updateGroup = (id, patch2) => patch({ groups: groups.map((g) => (g.id === id ? { ...g, ...patch2 } : g)) });
  const removeGroup = (id) => patch({ groups: groups.filter((g) => g.id !== id) });
  const addGroup = () => patch({ groups: [...groups, emptySpellGroup()] });

  return (
    <div>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textOnParchment, marginBottom: 12, cursor: "pointer" }}>
        <input type="checkbox" checked={sc.enabled} onChange={(e) => patch({ enabled: e.target.checked })} />
        Questa creatura lancia incantesimi
      </label>

      {sc.enabled && (
        <>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
            <Field label="Caratteristica" style={{ width: 160 }}>
              <select value={sc.ability} onChange={(e) => patch({ ability: e.target.value })} style={inputStyle}>
                {SPELLCASTING_ABILITIES.map((k) => (
                  <option key={k} value={k}>{ABILITIES.find((a) => a.key === k)?.name}</option>
                ))}
              </select>
            </Field>
            <Field label={`CD Tiro Salvezza (suggerito ${getSpellSaveDC({ ...creature, spellcasting: { ...sc, saveDCOverride: null } })})`} style={{ width: 160 }}>
              <input
                type="number" value={sc.saveDCOverride ?? ""} placeholder="auto"
                onChange={(e) => patch({ saveDCOverride: e.target.value === "" ? null : Number(e.target.value) })}
                style={numberInputStyle}
              />
            </Field>
            <Field label={`Bonus Attacco (suggerito ${fmtMod(getSpellAttackBonus({ ...creature, spellcasting: { ...sc, attackBonusOverride: null } }))})`} style={{ width: 160 }}>
              <input
                type="number" value={sc.attackBonusOverride ?? ""} placeholder="auto"
                onChange={(e) => patch({ attackBonusOverride: e.target.value === "" ? null : Number(e.target.value) })}
                style={numberInputStyle}
              />
            </Field>
          </div>
          <Field label="Testo introduttivo (facoltativo)" style={{ marginBottom: 14 }}>
            <textarea
              value={sc.note} rows={2} placeholder='Es. "La creatura lancia uno dei seguenti incantesimi, usando la Saggezza come caratteristica da incantatore…"'
              onChange={(e) => patch({ note: e.target.value })}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </Field>

          {groups.map((g) => (
            <div key={g.id} style={{ border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0.75rem 0.9rem", marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <input
                  type="text" value={g.label} placeholder='Es. "A volontà", "3/giorno ciascuno"'
                  onChange={(e) => updateGroup(g.id, { label: e.target.value })}
                  style={{ ...inputStyle, fontFamily: "'Cinzel', serif", fontWeight: 600 }}
                />
                <button onClick={() => removeGroup(g.id)} aria-label="Rimuovi gruppo" style={{ background: "transparent", border: "none", cursor: "pointer", color: C.danger, padding: 4, flexShrink: 0 }}>
                  <Trash2 size={15} />
                </button>
              </div>
              <SpellPickerInline group={g} onChange={(p) => updateGroup(g.id, p)} />
            </div>
          ))}
          <GhostButton icon={Plus} onClick={addGroup} style={{ borderColor: C.wine, color: C.wineDeep }}>Aggiungi gruppo di incantesimi</GhostButton>
        </>
      )}
    </div>
  );
}

export function CreatureEditor({ creature, setCreature, onBack, onSave, saving }) {
  const update = (patch) => setCreature((c) => ({ ...c, ...patch }));
  const updateAbility = (key, val) => setCreature((c) => ({ ...c, abilities: { ...c.abilities, [key]: val === "" ? "" : Number(val) } }));
  const updateSpeed = (key, val) => setCreature((c) => ({ ...c, speed: { ...c.speed, [key]: key === "volareStazionario" ? val : (val === "" ? "" : Number(val)) } }));
  const updateSenses = (key, val) => setCreature((c) => ({ ...c, senses: { ...c.senses, [key]: val === "" ? (key === "passivePerceptionOverride" ? null : 0) : Number(val) } }));
  const toggleSaveProf = (key) => setCreature((c) => ({
    ...c,
    saveProficiencies: c.saveProficiencies.includes(key) ? c.saveProficiencies.filter((k) => k !== key) : [...c.saveProficiencies, key],
  }));
  const appendTag = (field, tag) => setCreature((c) => ({ ...c, [field]: c[field] ? `${c[field]}, ${tag}` : tag }));

  const errors = validateCreature(creature);

  return (
    <div>
      <GhostButton icon={ChevronLeft} onClick={onBack} style={{ marginBottom: 18 }}>Torna alla sezione Master</GhostButton>

      <Frame>
        <Field label="Nome della creatura" style={{ marginBottom: 14 }}>
          <input
            type="text" value={creature.name} placeholder="Es. Predone delle Nebbie"
            onChange={(e) => update({ name: e.target.value })}
            style={{ ...inputStyle, fontFamily: "'Cinzel', serif", fontSize: 18 }}
          />
        </Field>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 4 }}>
          <Field label="Taglia" style={{ width: 150 }}>
            <select value={creature.size} onChange={(e) => update({ size: e.target.value })} style={inputStyle}>
              {CREATURE_SIZES.map((s) => <option key={s.key} value={s.key}>{s.name}</option>)}
            </select>
          </Field>
          <Field label="Tipo" style={{ width: 170 }}>
            <select value={creature.type} onChange={(e) => update({ type: e.target.value })} style={inputStyle}>
              {CREATURE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Sottotipo (facoltativo)" style={{ width: 170 }}>
            <input type="text" value={creature.typeTag} placeholder="es. umano, demoniaco" onChange={(e) => update({ typeTag: e.target.value })} style={inputStyle} />
          </Field>
          <Field label="Allineamento" style={{ width: 190 }}>
            <select value={creature.alignment} onChange={(e) => update({ alignment: e.target.value })} style={inputStyle}>
              {ALIGNMENTS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </Field>
          <Field label="Grado di Sfida" style={{ width: 130 }}>
            <select value={creature.cr} onChange={(e) => update({ cr: e.target.value })} style={inputStyle}>
              {CR_OPTIONS.map((cr) => <option key={cr} value={cr}>{cr}</option>)}
            </select>
          </Field>
        </div>
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 12, color: C.textMuted, margin: "6px 0 0" }}>
          Bonus di competenza {fmtMod(getEffectiveProficiencyBonus(creature))} · {getEffectiveXp(creature)} PE
          {" · "}
          <label style={{ cursor: "pointer" }}>
            Sovrascrivi bonus:
            <input
              type="number" value={creature.proficiencyBonusOverride ?? ""} placeholder="auto"
              onChange={(e) => update({ proficiencyBonusOverride: e.target.value === "" ? null : Number(e.target.value) })}
              style={{ ...numberInputStyle, width: 60, marginLeft: 6, display: "inline-block" }}
            />
          </label>
        </p>
      </Frame>

      <Frame style={{ marginTop: 16 }}>
        <h3 style={sectionTitleStyle}>Difesa</h3>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 14 }}>
          <Field label="Classe Armatura" style={{ width: 110 }}>
            <input type="number" value={creature.ac} onChange={(e) => update({ ac: e.target.value === "" ? "" : Number(e.target.value) })} style={numberInputStyle} />
          </Field>
          <Field label="Fonte CA (facoltativo)" style={{ width: 200 }}>
            <input type="text" value={creature.acNote} placeholder="es. armatura naturale" onChange={(e) => update({ acNote: e.target.value })} style={inputStyle} />
          </Field>
          <Field label="Punti Ferita" style={{ width: 110 }}>
            <input type="number" value={creature.hp} onChange={(e) => update({ hp: e.target.value === "" ? "" : Number(e.target.value) })} style={numberInputStyle} />
          </Field>
          <Field label="Dadi Vita (facoltativo)" style={{ width: 150 }}>
            <input type="text" value={creature.hpFormula} placeholder="es. 8d8 + 16" onChange={(e) => update({ hpFormula: e.target.value })} style={inputStyle} />
          </Field>
        </div>
        <p style={labelStyle}>Velocità (in metri)</p>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 4 }}>
          <Field label="Camminare" style={{ width: 100 }}>
            <input type="number" value={creature.speed.camminare} onChange={(e) => updateSpeed("camminare", e.target.value)} style={numberInputStyle} />
          </Field>
          <Field label="Volare" style={{ width: 100 }}>
            <input type="number" value={creature.speed.volare} onChange={(e) => updateSpeed("volare", e.target.value)} style={numberInputStyle} />
          </Field>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, marginBottom: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={creature.speed.volareStazionario} onChange={(e) => updateSpeed("volareStazionario", e.target.checked)} />
            in stazionario
          </label>
          <Field label="Nuotare" style={{ width: 100 }}>
            <input type="number" value={creature.speed.nuotare} onChange={(e) => updateSpeed("nuotare", e.target.value)} style={numberInputStyle} />
          </Field>
          <Field label="Scavare" style={{ width: 100 }}>
            <input type="number" value={creature.speed.scavare} onChange={(e) => updateSpeed("scavare", e.target.value)} style={numberInputStyle} />
          </Field>
          <Field label="Scalare" style={{ width: 100 }}>
            <input type="number" value={creature.speed.scalare} onChange={(e) => updateSpeed("scalare", e.target.value)} style={numberInputStyle} />
          </Field>
        </div>
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 12, color: C.textMuted, margin: "8px 0 0" }}>Anteprima: {formatSpeed(creature.speed)}</p>
      </Frame>

      <Frame style={{ marginTop: 16 }}>
        <h3 style={sectionTitleStyle}>Caratteristiche e Tiri Salvezza</h3>
        <div style={{ display: "grid", gridTemplateColumns: "var(--g6)", gap: 10, marginBottom: 14 }}>
          {ABILITIES.map((a) => (
            <div key={a.key} style={{ textAlign: "center", border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0.6rem 0.4rem" }}>
              <div style={labelStyle}>{a.name}</div>
              <input
                type="number" value={creature.abilities[a.key]}
                onChange={(e) => updateAbility(a.key, e.target.value)}
                style={{ ...inputStyle, textAlign: "center", marginBottom: 4 }}
              />
              <div style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted }}>
                {fmtMod(mod(Number(creature.abilities[a.key]) || 0))}
              </div>
            </div>
          ))}
        </div>
        <p style={labelStyle}>Competenza nei Tiri Salvezza (clicca per attivare/disattivare)</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          {ABILITIES.map((a) => (
            <Pill key={a.key} active={creature.saveProficiencies.includes(a.key)} onClick={() => toggleSaveProf(a.key)}>
              {a.name} {fmtMod(getSaveBonus(creature, a.key))}
            </Pill>
          ))}
        </div>
      </Frame>

      <Frame style={{ marginTop: 16 }}>
        <h3 style={sectionTitleStyle}>Abilità</h3>
        <SkillsEditor creature={creature} onChange={(skills) => update({ skills })} />
      </Frame>

      <Frame style={{ marginTop: 16 }}>
        <h3 style={sectionTitleStyle}>Resistenze, Immunità e Sensi</h3>
        <div style={{ display: "grid", gridTemplateColumns: "var(--g2)", gap: 14, marginBottom: 14 }}>
          <Field label="Vulnerabilità ai danni">
            <input type="text" value={creature.vulnerabilities} onChange={(e) => update({ vulnerabilities: e.target.value })} style={inputStyle} />
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
              {DAMAGE_TYPES.map((d) => <Pill key={d} onClick={() => appendTag("vulnerabilities", d)}>{d}</Pill>)}
            </div>
          </Field>
          <Field label="Resistenze ai danni">
            <input type="text" value={creature.resistances} onChange={(e) => update({ resistances: e.target.value })} style={inputStyle} />
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
              {DAMAGE_TYPES.map((d) => <Pill key={d} onClick={() => appendTag("resistances", d)}>{d}</Pill>)}
            </div>
          </Field>
          <Field label="Immunità ai danni">
            <input type="text" value={creature.immunities} onChange={(e) => update({ immunities: e.target.value })} style={inputStyle} />
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
              {DAMAGE_TYPES.map((d) => <Pill key={d} onClick={() => appendTag("immunities", d)}>{d}</Pill>)}
            </div>
          </Field>
          <Field label="Immunità alle condizioni">
            <input type="text" value={creature.conditionImmunities} onChange={(e) => update({ conditionImmunities: e.target.value })} style={inputStyle} />
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
              {CONDITIONS.map((d) => <Pill key={d} onClick={() => appendTag("conditionImmunities", d)}>{d}</Pill>)}
            </div>
          </Field>
        </div>
        <Divider />
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 10 }}>
          <Field label="Scurovisione (m)" style={{ width: 130 }}>
            <input type="number" value={creature.senses.darkvision} onChange={(e) => updateSenses("darkvision", e.target.value)} style={numberInputStyle} />
          </Field>
          <Field label="Vista Cieca (m)" style={{ width: 130 }}>
            <input type="number" value={creature.senses.blindsight} onChange={(e) => updateSenses("blindsight", e.target.value)} style={numberInputStyle} />
          </Field>
          <Field label="Percezione Tremore (m)" style={{ width: 130 }}>
            <input type="number" value={creature.senses.tremorsense} onChange={(e) => updateSenses("tremorsense", e.target.value)} style={numberInputStyle} />
          </Field>
          <Field label="Vista Pura (m)" style={{ width: 130 }}>
            <input type="number" value={creature.senses.truesight} onChange={(e) => updateSenses("truesight", e.target.value)} style={numberInputStyle} />
          </Field>
          <Field label={`Percezione Passiva (suggerita ${getPassivePerception({ ...creature, senses: { ...creature.senses, passivePerceptionOverride: null } })})`} style={{ width: 160 }}>
            <input
              type="number" value={creature.senses.passivePerceptionOverride ?? ""} placeholder="auto"
              onChange={(e) => updateSenses("passivePerceptionOverride", e.target.value)}
              style={numberInputStyle}
            />
          </Field>
        </div>
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 12, color: C.textMuted, margin: "0 0 14px" }}>Anteprima: {formatSenses(creature)}</p>
        <Field label="Linguaggi">
          <input type="text" value={creature.languages} placeholder="es. Comune, Draconico (non può parlare)" onChange={(e) => update({ languages: e.target.value })} style={inputStyle} />
        </Field>
      </Frame>

      <Frame style={{ marginTop: 16 }}>
        <h3 style={sectionTitleStyle}>Tratti</h3>
        <TraitListEditor items={creature.traits} onChange={(traits) => update({ traits })} addLabel="Aggiungi tratto" namePlaceholder="es. Aggressivo" />
      </Frame>

      <Frame style={{ marginTop: 16 }}>
        <h3 style={sectionTitleStyle}>Azioni</h3>
        <TraitListEditor items={creature.actions} onChange={(actions) => update({ actions })} addLabel="Aggiungi azione" namePlaceholder="es. Morso" />
      </Frame>

      <Frame style={{ marginTop: 16 }}>
        <h3 style={sectionTitleStyle}>Azioni Bonus</h3>
        <TraitListEditor items={creature.bonusActions} onChange={(bonusActions) => update({ bonusActions })} addLabel="Aggiungi azione bonus" namePlaceholder="es. Scatto" />
      </Frame>

      <Frame style={{ marginTop: 16 }}>
        <h3 style={sectionTitleStyle}>Reazioni</h3>
        <TraitListEditor items={creature.reactions} onChange={(reactions) => update({ reactions })} addLabel="Aggiungi reazione" namePlaceholder="es. Parata" />
      </Frame>

      <Frame style={{ marginTop: 16 }}>
        <h3 style={sectionTitleStyle}>Azioni Leggendarie</h3>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-end", marginBottom: 12, flexWrap: "wrap" }}>
          <Field label="Numero per turno" style={{ width: 150 }}>
            <input type="number" min="0" value={creature.legendaryActionsCount} onChange={(e) => update({ legendaryActionsCount: Number(e.target.value) || 0 })} style={numberInputStyle} />
          </Field>
        </div>
        {creature.legendaryActionsCount > 0 && (
          <>
            <Field label="Testo introduttivo (facoltativo)" style={{ marginBottom: 12 }}>
              <textarea
                value={creature.legendaryActionsNote} rows={2}
                placeholder="es. La creatura può eseguire 3 azioni leggendarie, scegliendo tra le opzioni seguenti…"
                onChange={(e) => update({ legendaryActionsNote: e.target.value })}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </Field>
            <TraitListEditor items={creature.legendaryActions} onChange={(legendaryActions) => update({ legendaryActions })} addLabel="Aggiungi azione leggendaria" namePlaceholder="es. Attacco" />
          </>
        )}
      </Frame>

      <Frame style={{ marginTop: 16 }}>
        <h3 style={sectionTitleStyle}>Azioni della Tana</h3>
        <TraitListEditor items={creature.lairActions} onChange={(lairActions) => update({ lairActions })} addLabel="Aggiungi azione della tana" namePlaceholder="es. Il terreno trema" />
      </Frame>

      <Frame style={{ marginTop: 16 }}>
        <h3 style={sectionTitleStyle}>Incantesimi</h3>
        <SpellcastingEditor creature={creature} onChange={(spellcasting) => update({ spellcasting })} />
      </Frame>

      <Frame style={{ marginTop: 16 }}>
        <h3 style={sectionTitleStyle}>Note del Master</h3>
        <textarea
          value={creature.notes} rows={3} placeholder="Appunti privati su tattiche, agganci di trama, varianti…"
          onChange={(e) => update({ notes: e.target.value })}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </Frame>

      {errors.length > 0 && (
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.danger, marginTop: 14 }}>{errors[0]}</p>
      )}
      <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <GoldButton icon={saving ? Loader2 : Save} disabled={saving} onClick={onSave}>
          {saving ? "Salvataggio…" : "Salva creatura"}
        </GoldButton>
      </div>
    </div>
  );
}
