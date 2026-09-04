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
