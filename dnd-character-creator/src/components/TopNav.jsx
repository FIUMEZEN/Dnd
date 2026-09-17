// Navigazione persistente per le schermate "hub" (elenco personaggi, compendio, sezione master
// e le sue sotto-schermate): sostituisce i pulsanti di navigazione ripetuti in cima a ogni
// schermata con un punto solo, sempre visibile. Non compare nei flussi "a fuoco" (creazione,
// scheda, incontro), dove il pulsante "indietro" della schermata resta la scelta più chiara.
//
// Due componenti, stessa fonte di verità (HUB_SCREENS/MASTER_GROUP/ITEMS): TopNav è la pillola
// desktop in cima, BottomNav è la barra fissa in fondo mostrata solo su schermi stretti (vedi il
// breakpoint a 640px nel <style> di App.jsx). Quale delle due sia visibile è deciso via CSS in
// App.jsx, non qui: entrambe sono sempre montate.
import { BookOpen, Crown, Users } from "../icons";
import { C } from "../theme";

export const HUB_SCREENS = new Set(["list", "compendium", "master", "bestiary", "campaign"]);
export const MASTER_GROUP = new Set(["master", "bestiary", "campaign"]);

export const ITEMS = [
  { key: "list", label: "I miei personaggi", icon: Users },
  { key: "compendium", label: "Compendio", icon: BookOpen },
  { key: "master", label: "Sezione Master", icon: Crown },
];

function getActiveKey(screen) {
  return MASTER_GROUP.has(screen) ? "master" : screen;
}

function handleItemClick(item, onNavigate, onOpenCompendium) {
  return item.key === "compendium" ? onOpenCompendium() : onNavigate(item.key);
}

export function TopNav({ screen, onNavigate, onOpenCompendium }) {
  if (!HUB_SCREENS.has(screen)) return null;
  const activeKey = getActiveKey(screen);

  return (
    <nav
      className="nav-top"
      style={{
        gap: 4, padding: 4,
        background: C.inkPanel, borderRadius: 4, border: `1px solid ${C.parchmentLine}22`,
        width: "fit-content",
      }}
    >
      {ITEMS.map((item) => {
        const active = item.key === activeKey;
        return (
          <button
            key={item.key}
            onClick={() => handleItemClick(item, onNavigate, onOpenCompendium)}
            style={{
              position: "relative", fontFamily: "'Cinzel', serif", fontSize: 12.5, letterSpacing: 0.3,
              padding: "0.5rem 1.1rem", borderRadius: 3, border: "none", cursor: "pointer",
              background: active ? `linear-gradient(180deg, ${C.wine}, ${C.wineDeep})` : "transparent",
              color: active ? C.cream : C.creamMuted,
              transition: "background 200ms ease, color 200ms ease",
            }}
            onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = C.gold; }}
            onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = C.creamMuted; }}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

// Barra fissa in fondo allo schermo, visibile solo su telefono (CSS in App.jsx): stesse voci e
// stessa logica di attivazione di TopNav, ma icona + etichetta su tre colonne uguali e bottoni
// alti almeno 56px per il pollice. Il padding inferiore extra tiene conto della safe area delle
// PWA installate (home indicator su iOS).
export function BottomNav({ screen, onNavigate, onOpenCompendium }) {
  if (!HUB_SCREENS.has(screen)) return null;
  const activeKey = getActiveKey(screen);

  return (
    <nav
      className="nav-bottom"
      style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 60,
        background: C.inkPanel, borderTop: `1px solid ${C.parchmentLine}33`,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {ITEMS.map((item) => {
        const active = item.key === activeKey;
        const Icon = item.icon;
        return (
          <button
            key={item.key}
            onClick={() => handleItemClick(item, onNavigate, onOpenCompendium)}
            style={{
              flex: 1, minHeight: 56, display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: 3, border: "none", cursor: "pointer",
              background: active ? `linear-gradient(180deg, ${C.wine}, ${C.wineDeep})` : "transparent",
              color: active ? C.cream : C.creamMuted,
            }}
          >
            <Icon size={19} />
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: 0.2 }}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
