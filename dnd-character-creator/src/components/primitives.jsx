// Piccoli componenti UI riutilizzati in tutta l'app: contenitori, bottoni, pillole di scelta,
// card selezionabili. Nessuno di questi ha stato proprio oltre eventuali hover locali.
import { C } from "../theme";

export function Frame({ children, style, className = "" }) {
  return (
    <div
      className={className}
      style={{
        background: "linear-gradient(180deg, #f5ebd2 0%, #efe4c6 100%)",
        border: `1px solid ${C.parchmentLine}`,
        boxShadow: `inset 0 0 0 4px rgba(255,255,255,0.32), inset 0 0 0 5px ${C.parchmentLine}, 0 18px 28px rgba(19,15,13,0.16)`,
        borderRadius: 2,
        padding: "var(--frame-padding)",
        position: "relative",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Divider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "1.25rem 0" }}>
      <div style={{ flex: 1, height: 1, background: C.parchmentLine }} />
      <div style={{ width: 6, height: 6, transform: "rotate(45deg)", background: C.gold }} />
      <div style={{ flex: 1, height: 1, background: C.parchmentLine }} />
    </div>
  );
}

export function GoldButton({ children, onClick, disabled, style, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: "'Cinzel', serif",
        fontSize: 13,
        letterSpacing: 0.5,
        fontWeight: 600,
        color: disabled ? C.creamMuted : C.cream,
        background: disabled ? "#4a4038" : `linear-gradient(180deg, ${C.wine}, ${C.wineDeep})`,
        border: `1px solid ${disabled ? "#5a5148" : C.gold}`,
        borderRadius: 3,
        padding: "0.65rem 1.4rem",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        transition: "transform 120ms ease, filter 120ms ease",
        ...style,
      }}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = "scale(0.97)"; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {Icon && <Icon size={15} />}
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, style, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "'Spectral', serif",
        fontSize: 13.5,
        color: C.cream,
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${C.goldSoft}`,
        borderRadius: 3,
        padding: "0.6rem 1.1rem",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        opacity: 0.96,
        transition: "all 120ms ease",
        ...style,
      }}
    >
      {Icon && <Icon size={14} />}
      {children}
    </button>
  );
}

export function Pill({ children, active, onClick, disabled, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        fontFamily: "'Spectral', serif",
        fontSize: 13,
        padding: "0.5rem 0.85rem",
        borderRadius: 3,
        border: `1px solid ${active ? C.wine : C.parchmentLine}`,
        background: active ? "linear-gradient(180deg, #7d1f38 0%, #5e1729 100%)" : "rgba(255,255,255,0.2)",
        color: active ? C.cream : C.textOnParchment,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 120ms ease",
        boxShadow: active ? `0 0 0 1px rgba(224,193,101,0.3) inset` : "none",
        opacity: disabled ? 0.45 : 1,
      }}
    >
      {children}
    </button>
  );
}

export function OptionCard({ selected, onClick, title, subtitle, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left",
        width: "100%",
        background: selected ? "#f8f1e0" : "transparent",
        border: `1px solid ${selected ? C.wine : C.parchmentLine}`,
        borderLeft: selected ? `4px solid ${C.wine}` : `4px solid transparent`,
        borderRadius: 2,
        padding: "0.9rem 1.1rem",
        cursor: "pointer",
        display: "block",
        marginBottom: 10,
        transition: "all 120ms ease",
        boxShadow: selected ? `0 0 0 1px ${C.goldSoft} inset` : "none",
        transform: selected ? "translateY(-1px)" : "translateY(0)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = selected ? `0 0 0 1px ${C.goldSoft} inset` : `0 0 0 1px ${C.parchmentLine} inset`; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = selected ? `0 0 0 1px ${C.goldSoft} inset` : "none"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontFamily: "'Cinzel', serif", fontSize: 15, fontWeight: 600, color: selected ? C.wineDeep : C.textOnParchment }}>
          {title}
        </span>
        {subtitle && <span style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted }}>{subtitle}</span>}
      </div>
      {children && <div style={{ marginTop: 6 }}>{children}</div>}
    </button>
  );
}

// Picker generico "pill capped at count" per le proficiencyChoices (lingue/strumenti/abilità
// a scelta) definite su razze, background e sottoclassi. `selected` è l'array già scelto per
// questa `spec` (spec.key); `onToggle` riceve il singolo valore cliccato.
export function ProficiencyChoicePicker({ spec, selected, onToggle }) {
  return (
    <div style={{ marginTop: 10 }}>
      <p style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textOnParchment, marginBottom: 8 }}>
        {spec.label} ({selected.length}/{spec.count}):
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {spec.options.map((opt) => {
          const picked = selected.includes(opt);
          const disabled = !picked && selected.length >= spec.count;
          return (
            <Pill key={opt} active={picked} onClick={() => { if (disabled) return; onToggle(opt); }}>
              {opt}
            </Pill>
          );
        })}
      </div>
    </div>
  );
}

export function MetricBox({ label, value, hint }) {
  return (
    <div style={{ border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0.7rem 0.85rem" }}>
      <div style={{ fontFamily: "'Cinzel', serif", fontSize: 10.5, color: C.textMuted, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "'Spectral', serif", fontSize: 15, color: C.textOnParchment }}>{value}</div>
      {hint && <div style={{ fontFamily: "'Spectral', serif", fontSize: 11, color: C.textMuted, marginTop: 2 }}>{hint}</div>}
    </div>
  );
}
