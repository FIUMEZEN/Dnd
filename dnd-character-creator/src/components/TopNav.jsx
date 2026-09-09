// Barra di navigazione persistente per le schermate "hub" (elenco personaggi, compendio,
// sezione master e le sue sotto-schermate): sostituisce i pulsanti di navigazione ripetuti in
// cima a ogni schermata con un punto solo, sempre visibile, con un indicatore animato che
// scivola sulla voce attiva. Non compare nei flussi "a fuoco" (creazione, scheda, incontro),
// dove il pulsante "indietro" della schermata resta la scelta più chiara.
import { C } from "../theme";

const HUB_SCREENS = new Set(["list", "compendium", "master", "bestiary", "campaign"]);
const MASTER_GROUP = new Set(["master", "bestiary", "campaign"]);

const ITEMS = [
  { key: "list", label: "I miei personaggi" },
  { key: "compendium", label: "Compendio" },
  { key: "master", label: "Sezione Master" },
];

export function TopNav({ screen, onNavigate, onOpenCompendium }) {
  if (!HUB_SCREENS.has(screen)) return null;
  const activeKey = MASTER_GROUP.has(screen) ? "master" : screen;

  return (
    <nav
      style={{
        display: "flex", gap: 4, padding: 4,
        background: C.inkPanel, borderRadius: 4, border: `1px solid ${C.parchmentLine}22`,
        width: "fit-content",
      }}
    >
      {ITEMS.map((item) => {
        const active = item.key === activeKey;
        return (
          <button
            key={item.key}
            onClick={() => (item.key === "compendium" ? onOpenCompendium() : onNavigate(item.key))}
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
