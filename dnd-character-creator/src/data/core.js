/* ---------------------------------- DATA ---------------------------------- */

export const ABILITIES = [
  { key: "str", name: "Forza" },
  { key: "dex", name: "Destrezza" },
  { key: "con", name: "Costituzione" },
  { key: "int", name: "Intelligenza" },
  { key: "wis", name: "Saggezza" },
  { key: "cha", name: "Carisma" },
];

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

/* ---------------------------------- COMPETENZE (lingue e strumenti) ---------------------------------- */
// Cataloghi condivisi usati dai selettori di competenza extra (razza/background/sottoclasse):
// lingue standard/esotiche e le principali categorie di strumenti del PHB 2014.
export const LANGUAGES = [
  "Comune", "Nanico", "Elfico", "Gigantesco", "Gnomesco", "Goblinoide", "Halfling", "Orchesco",
  "Abissale", "Celestiale", "Draconico", "Infernale", "Primordiale", "Silvano", "Sottocomune",
];
export const ARTISAN_TOOLS = [
  "Strumenti da alchimista", "Strumenti da fabbro", "Forniture da birraio", "Strumenti da calzolaio",
  "Utensili da falegname", "Strumenti da cartografo", "Utensili da vasaio", "Strumenti da cuoiaio",
  "Set da gioielliere", "Strumenti da muratore", "Set da pittore", "Strumenti da tessitore",
  "Strumenti da meccanico", "Utensili da vetraio", "Strumenti da falegname navale",
];
export const GAMING_SETS = ["Dadi", "Carte da gioco", "Scacchi a Tre Giocatori", "Dragonchess"];
export const MUSICAL_INSTRUMENTS = [
  "Cornamusa", "Tamburo", "Corno", "Liuto", "Lira", "Oboe", "Zufolo", "Salterio", "Viola", "Flauto",
];

export const SKILL_ABILITY = {
  "Acrobazia": "dex", "Addestrare Animali": "wis", "Arcano": "int", "Atletica": "str",
  "Furtività": "dex", "Inganno": "cha", "Indagare": "int", "Intimidire": "cha",
  "Intrattenere": "cha", "Intuizione": "wis", "Medicina": "wis", "Natura": "int", "Percezione": "wis",
  "Persuasione": "cha", "Rapidità di Mano": "dex", "Religione": "int",
  "Sopravvivenza": "wis", "Storia": "int",
};
