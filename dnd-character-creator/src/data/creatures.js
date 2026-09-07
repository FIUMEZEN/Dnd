/* ---------------------------------- DATI CREATURE (SEZIONE MASTER) ---------------------------------- */
// Cataloghi statici usati dall'editor di creature custom: taglie, tipi, allineamenti, tipi di
// danno/condizioni per resistenze-immunità, e la tabella Grado di Sfida → PE/Bonus di competenza
// (DMG 2014), identica per qualunque creatura indipendentemente da razza/classe del PG.

export const CREATURE_SIZES = [
  { key: "minuscola", name: "Minuscola" },
  { key: "piccola", name: "Piccola" },
  { key: "media", name: "Media" },
  { key: "grande", name: "Grande" },
  { key: "enorme", name: "Enorme" },
  { key: "mastodontica", name: "Mastodontica" },
];

export const CREATURE_TYPES = [
  "Aberrazione", "Bestia", "Celestiale", "Costrutto", "Drago", "Elementale",
  "Fatato", "Gigante", "Melma", "Mostruosità", "Non Morto", "Pianta", "Umanoide",
];

export const ALIGNMENTS = [
  "Legale buono", "Neutrale buono", "Caotico buono",
  "Legale neutrale", "Neutrale", "Caotico neutrale",
  "Legale malvagio", "Neutrale malvagio", "Caotico malvagio",
  "Non allineato", "Qualsiasi allineamento",
];

export const DAMAGE_TYPES = [
  "Acido", "Contundente", "Elettricità", "Forza", "Freddo", "Fuoco",
  "Necrotico", "Perforante", "Psichico", "Radioso", "Tagliente", "Veleno",
];

export const CONDITIONS = [
  "Accecato", "Affascinato", "Assordato", "Esausto", "Impaurito", "Afferrato",
  "Incapacitato", "Invisibile", "Paralizzato", "Pietrificato", "Avvelenato",
  "Prono", "Trattenuto", "Stordito", "Privo di sensi",
];

export const SPELLCASTING_ABILITIES = ["int", "wis", "cha"];

// PE e Bonus di competenza per Grado di Sfida (DMG 2014, tabella standard).
export const CR_TABLE = {
  "0": { xp: 10, pb: 2 }, "1/8": { xp: 25, pb: 2 }, "1/4": { xp: 50, pb: 2 }, "1/2": { xp: 100, pb: 2 },
  "1": { xp: 200, pb: 2 }, "2": { xp: 450, pb: 2 }, "3": { xp: 700, pb: 2 }, "4": { xp: 1100, pb: 2 },
  "5": { xp: 1800, pb: 3 }, "6": { xp: 2300, pb: 3 }, "7": { xp: 2900, pb: 3 }, "8": { xp: 3900, pb: 3 },
  "9": { xp: 5000, pb: 4 }, "10": { xp: 5900, pb: 4 }, "11": { xp: 7200, pb: 4 }, "12": { xp: 8400, pb: 4 },
  "13": { xp: 10000, pb: 5 }, "14": { xp: 11500, pb: 5 }, "15": { xp: 13000, pb: 5 }, "16": { xp: 15000, pb: 5 },
  "17": { xp: 18000, pb: 6 }, "18": { xp: 20000, pb: 6 }, "19": { xp: 22000, pb: 6 }, "20": { xp: 25000, pb: 6 },
  "21": { xp: 33000, pb: 7 }, "22": { xp: 41000, pb: 7 }, "23": { xp: 50000, pb: 7 }, "24": { xp: 62000, pb: 7 },
  "25": { xp: 75000, pb: 8 }, "26": { xp: 90000, pb: 8 }, "27": { xp: 105000, pb: 8 }, "28": { xp: 120000, pb: 8 },
  "29": { xp: 135000, pb: 9 }, "30": { xp: 155000, pb: 9 },
};
export const CR_OPTIONS = Object.keys(CR_TABLE);

// Soglie di PE per livello del personaggio (DMG 2014, tabella "Soglie di PE per personaggio"):
// quanta esperienza "vale" un Incontro Facile/Medio/Difficile/Mortale per UN personaggio di quel
// livello. Usata dall'Encounter Builder sommando le soglie di tutti i Personaggi nell'Incontro.
export const XP_THRESHOLDS_BY_LEVEL = {
  1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
  2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
  3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
  4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
  5: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
  6: { easy: 300, medium: 600, hard: 900, deadly: 1400 },
  7: { easy: 350, medium: 750, hard: 1100, deadly: 1700 },
  8: { easy: 450, medium: 900, hard: 1400, deadly: 2100 },
  9: { easy: 550, medium: 1100, hard: 1600, deadly: 2400 },
  10: { easy: 600, medium: 1200, hard: 1900, deadly: 2800 },
  11: { easy: 800, medium: 1600, hard: 2400, deadly: 3600 },
  12: { easy: 1000, medium: 2000, hard: 3000, deadly: 4500 },
  13: { easy: 1100, medium: 2200, hard: 3400, deadly: 5100 },
  14: { easy: 1250, medium: 2500, hard: 3800, deadly: 5700 },
  15: { easy: 1400, medium: 2800, hard: 4300, deadly: 6400 },
  16: { easy: 1600, medium: 3200, hard: 4800, deadly: 7200 },
  17: { easy: 2000, medium: 3900, hard: 5900, deadly: 8800 },
  18: { easy: 2100, medium: 4200, hard: 6300, deadly: 9500 },
  19: { easy: 2400, medium: 4900, hard: 7300, deadly: 10900 },
  20: { easy: 2800, medium: 5700, hard: 8500, deadly: 12700 },
};

// Moltiplicatore per il numero di mostri nell'Incontro (DMG 2014, tabella "Moltiplicatori PE
// degli incontri multipli"): più nemici agiscono in un round, più l'incontro è pericoloso a
// parità di PE totali.
export const ENCOUNTER_MULTIPLIERS = [
  { max: 1, mult: 1 },
  { max: 2, mult: 1.5 },
  { max: 6, mult: 2 },
  { max: 10, mult: 2.5 },
  { max: 14, mult: 3 },
  { max: Infinity, mult: 4 },
];
