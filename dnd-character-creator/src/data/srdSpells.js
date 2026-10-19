// Arricchimento degli incantesimi con i dati SRD 5.0 in italiano (incantesimi_srd_it.json).
//
// Gli ID restano quelli dell'app (es. "dardo-di-fuoco"): sono salvati nei personaggi
// (spellsKnown) e usati dalle liste di Dominio/Giuramento/Patrono/Circolo, quindi non possono
// cambiare. L'abbinamento avviene per nome italiano, più qualche alias dove i due nomi
// differiscono. Dal JSON arrivano classi, livello, tempo, gittata, durata, rituale,
// concentrazione, testo completo, livelli superiori e componente materiale; dall'app restano
// il riassunto breve (desc) e la meccanica in una riga (crunch), che il JSON non ha.
// Gli incantesimi non SRD presenti solo nell'app restano invariati.
import SRD from "./incantesimi_srd_it.json";

// ID SRD -> ID app, per i nomi che non coincidono tra le due fonti.
const ALIASES = {
  "dominate-person": "dominare-persona",
  "conjure-celestial": "evocare-un-celestiale",
  "continual-flame": "fiamma-perpetua",
  "acid-arrow": "freccia-acida-di-melf",
  "locate-animals-or-plants": "localizza-animali-piante",
  "protection-from-poison": "protezione-dal-veleno",
  "purify-food-and-water": "purificare-cibo-e-acqua",
  "magnificient-mansion": "rifugio-magnifico-di-mordenkainen",
  "awaken": "risvegliare",
  "freezing-sphere": "sfera-glaciale-di-otiluke",
  "black-tentacles": "tentacoli-neri-di-evard",
};

// Correzioni a errori del JSON, verificati sul Manuale del Giocatore 2014.
const FIXES = {
  bane: { tempo_lancio: "1 azione" },
  "create-undead": { tempo_lancio: "1 minuto" },
  imprisonment: { tempo_lancio: "1 minuto" },
  "power-word-stun": { tempo_lancio: "1 azione" },
  "power-word-kill": { tempo_lancio: "1 azione" },
  augury: { tempo_lancio: "1 minuto" },
  "astral-projection": { tempo_lancio: "1 ora" },
  "water-breathing": { tempo_lancio: "1 azione", rituale: true },
  symbol: { tempo_lancio: "1 minuto" },
  dream: { tempo_lancio: "1 minuto" },
  "meteor-swarm": { descrizione: (d) => d.replace("sfera di 2 metri di raggio", "sfera di 12 metri di raggio") },
};

const norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/[’']/g, "'").replace(/\s+/g, " ").trim();

// "36 metri" -> "36 m", "1,5 chilometri" -> "1,5 km": stesso formato compatto già usato nell'app.
const shortUnits = (s) => (s || "").replace(/\bchilometri\b/g, "km").replace(/\bmetri\b/g, "m");

function applyFixes(raw) {
  const fix = FIXES[raw.id];
  if (!fix) return raw;
  const out = { ...raw };
  Object.entries(fix).forEach(([k, v]) => { out[k] = typeof v === "function" ? v(raw[k]) : v; });
  return out;
}

// Tempo di lancio: le reazioni nel JSON includono l'innesco ("1 reazione, che effettui
// quando..."): lo separiamo, così "1 reazione" resta confrontabile e l'innesco si mostra a parte.
function splitTime(t) {
  const m = /^(1 reazione)\s*,\s*(.+)$/i.exec(t || "");
  return m ? { time: "1 reazione", trigger: m[2].replace(/^che (puoi effettuare|effettui) /i, "") } : { time: t, trigger: null };
}

function compString(c) {
  return [c.V && "V", c.S && "S", c.M && "M"].filter(Boolean).join(", ");
}

function firstSentence(text) {
  const t = (text || "").split("\n")[0];
  const m = /^(.+?[.!?])(\s|$)/.exec(t);
  return m ? m[1] : t;
}

function srdFields(raw) {
  const s = applyFixes(raw);
  const { time, trigger } = splitTime(s.tempo_lancio);
  return {
    level: s.livello,
    school: s.scuola === "negromanzia" ? "necromanzia" : s.scuola, // chiave usata da SCHOOLS
    classes: s.classi,
    time,
    trigger,
    range: shortUnits(s.gittata),
    comp: compString(s.componenti),
    material: s.componenti.materiale || null,
    duration: s.durata,
    ritual: !!s.rituale,
    concentration: !!s.concentrazione,
    fullDesc: s.descrizione,
    higherLevels: s.livelli_superiori || null,
    srdId: s.id,
  };
}

export function mergeSrdSpells(baseSpells) {
  const byName = new Map(baseSpells.map((sp) => [norm(sp.name), sp]));
  const byId = new Map(baseSpells.map((sp) => [sp.id, sp]));
  const merged = new Map(baseSpells.map((sp) => [sp.id, { ...sp }]));
  const added = [];

  SRD.incantesimi.forEach((raw) => {
    const base = (ALIASES[raw.id] && byId.get(ALIASES[raw.id])) || byName.get(norm(raw.nome));
    if (base) {
      merged.set(base.id, { ...merged.get(base.id), ...srdFields(raw) });
    } else {
      // Incantesimo SRD che l'app non aveva: lo aggiungiamo con un riassunto ricavato dal testo.
      added.push({ id: raw.id, name: raw.nome, desc: firstSentence(raw.descrizione), crunch: null, ...srdFields(raw) });
    }
  });

  return [...merged.values(), ...added];
}
