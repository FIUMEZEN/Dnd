export const C = {
  ink: "#1b1613",
  inkDeep: "#130f0d",
  inkPanel: "#241d18",
  parchment: "#efe6d2",
  parchmentDark: "#e1d3ac",
  parchmentLine: "#c9b98d",
  wine: "#7d1f38",
  wineDeep: "#5e1729",
  forest: "#2f5c48",
  forestDeep: "#213f33",
  gold: "#c9a227",
  goldSoft: "#e0c165",
  textOnParchment: "#2b2117",
  textMuted: "#6b5c46",
  cream: "#f1e9d8",
  creamMuted: "#c9bda4",
  danger: "#a4372f",
  // Varianti più chiare di wine/forest/danger, per testo/bordi di bottoni sullo sfondo scuro
  // (C.ink): le versioni "Deep" e quelle base hanno contrasto WCAG troppo basso lì (1.4–2.7:1),
  // anche se sono perfette sulla pergamena chiara. Usare queste due SOLO fuori dai <Frame>.
  wineBright: "#d9705f",
  forestBright: "#57a67c",
};

export const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Spectral:ital,wght@0,400;0,500;0,600;1,400&display=swap');";
