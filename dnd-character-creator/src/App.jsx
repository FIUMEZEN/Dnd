import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Sword, Shield, Wand2, ScrollText, Users, Save, Trash2, Plus,
  ChevronLeft, ChevronRight, Dices, BookOpen, Crown, Feather,
  Backpack, Check, X, Sparkles, Skull, Loader2, Pencil,
} from "./icons";

/* ---------------------------------- TOKENS ---------------------------------- */

const C = {
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
};

const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Spectral:ital,wght@0,400;0,500;0,600;1,400&display=swap');";

/* ---------------------------------- DATA ---------------------------------- */

const ABILITIES = [
  { key: "str", name: "Forza" },
  { key: "dex", name: "Destrezza" },
  { key: "con", name: "Costituzione" },
  { key: "int", name: "Intelligenza" },
  { key: "wis", name: "Saggezza" },
  { key: "cha", name: "Carisma" },
];

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

/* ---------------------------------- COMPETENZE (lingue e strumenti) ---------------------------------- */
// Cataloghi condivisi usati dai selettori di competenza extra (razza/background/sottoclasse):
// lingue standard/esotiche e le principali categorie di strumenti del PHB 2014.
const LANGUAGES = [
  "Comune", "Nanico", "Elfico", "Gigantesco", "Gnomesco", "Goblinoide", "Halfling", "Orchesco",
  "Abissale", "Celestiale", "Draconico", "Infernale", "Primordiale", "Silvano", "Sottocomune",
];
const ARTISAN_TOOLS = [
  "Strumenti da alchimista", "Strumenti da fabbro", "Forniture da birraio", "Strumenti da calzolaio",
  "Utensili da falegname", "Strumenti da cartografo", "Utensili da vasaio", "Strumenti da cuoiaio",
  "Set da gioielliere", "Strumenti da muratore", "Set da pittore", "Strumenti da tessitore",
  "Strumenti da meccanico", "Utensili da vetraio", "Strumenti da falegname navale",
];
const GAMING_SETS = ["Dadi", "Carte da gioco", "Scacchi a Tre Giocatori", "Dragonchess"];
const MUSICAL_INSTRUMENTS = [
  "Cornamusa", "Tamburo", "Corno", "Liuto", "Lira", "Oboe", "Zufolo", "Salterio", "Viola", "Flauto",
];

const RACES = [
  { id: "umano", name: "Umano", family: "Umano", subraceName: "Umano", size: "Medio", speed: 30, dark: false, bonuses: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 }, traits: ["Una lingua aggiuntiva a scelta"], blurb: "Versatile e ambizioso, l'umano si trova in ogni angolo del mondo.", proficiencyChoices: [{ key: "razza-umano-lingua", label: "Lingua aggiuntiva", type: "language", count: 1, options: LANGUAGES }] },
  { id: "nano-colline", name: "Nano delle Colline", family: "Nano", subraceName: "Delle Colline", size: "Medio", speed: 25, dark: true, bonuses: { con: 2, wis: 1 }, traits: ["Resistenza nanica: vantaggio ai TS contro veleno e resistenza ai danni da veleno", "Addestramento nanico al combattimento: competenza con ascia bipenne, ascia, martello leggero, martello da guerra", "Robustezza nanica: +1 PF per livello"], blurb: "Robusto e resistente, con una salute fuori dal comune.", bonusProficiencies: { weapons: ["Ascia bipenne", "Ascia", "Martello leggero", "Martello da guerra"] }, proficiencyChoices: [{ key: "razza-nano-strumenti", label: "Strumenti da artigiano", type: "tool", count: 1, options: ["Strumenti da fabbro", "Forniture da birraio", "Strumenti da muratore"] }] },
  { id: "nano-montagne", name: "Nano delle Montagne", family: "Nano", subraceName: "Delle Montagne", size: "Medio", speed: 25, dark: true, bonuses: { con: 2, str: 2 }, traits: ["Resistenza nanica: vantaggio ai TS contro veleno e resistenza ai danni da veleno", "Addestramento nanico al combattimento: competenza con ascia bipenne, ascia, martello leggero, martello da guerra", "Addestramento nanico alle armature: competenza nelle armature leggere e medie"], blurb: "Un nano temprato dalle fortezze e dalla guerra.", bonusProficiencies: { armor: ["Armatura leggera", "Armatura media"], weapons: ["Ascia bipenne", "Ascia", "Martello leggero", "Martello da guerra"] }, proficiencyChoices: [{ key: "razza-nano-strumenti", label: "Strumenti da artigiano", type: "tool", count: 1, options: ["Strumenti da fabbro", "Forniture da birraio", "Strumenti da muratore"] }] },
  { id: "alto-elfo", name: "Alto Elfo", family: "Elfo", subraceName: "Alto Elfo", size: "Medio", speed: 30, dark: true, bonuses: { dex: 2, int: 1 }, traits: ["Retaggio fatato: vantaggio ai TS contro l'incantamento; la magia non può farti addormentare", "Sensi acuti: competenza in Percezione", "Trance: 4 ore di meditazione equivalgono a 8 ore di sonno", "Trucchetto: un trucchetto dalla lista del mago", "Addestramento alle armi elfiche"], blurb: "Elfo istruito e incline alla magia arcana.", bonusProficiencies: { skills: ["Percezione"], weapons: ["Spade lunghe", "Spade corte", "Archi corti", "Archi lunghi"] } },
  { id: "elfo-boschi", name: "Elfo dei Boschi", family: "Elfo", subraceName: "Dei Boschi", size: "Medio", speed: 35, dark: true, bonuses: { dex: 2, wis: 1 }, traits: ["Retaggio fatato", "Sensi acuti: competenza in Percezione", "Trance", "Addestramento alle armi elfiche", "Maschera della natura: può tentare di nascondersi con copertura naturale leggera"], blurb: "Elfo legato alla foresta e alla vita selvaggia.", bonusProficiencies: { skills: ["Percezione"], weapons: ["Spade lunghe", "Spade corte", "Archi corti", "Archi lunghi"] } },
  { id: "drow", name: "Drow", family: "Elfo", subraceName: "Drow", size: "Medio", speed: 30, dark: true, bonuses: { dex: 2, cha: 1 }, traits: ["Retaggio fatato", "Sensi acuti: competenza in Percezione", "Trance", "Addestramento alle armi drow", "Sensibilità alla luce solare", "Magia drow: Luci danzanti; poi Faerie Fire e Oscurità ai livelli previsti"], blurb: "Elfo del Sottosuolo, dotato di potente magia innata.", bonusProficiencies: { skills: ["Percezione"], weapons: ["Spade corte", "Rapiere", "Balestre a mano"] } },
  { id: "halfling-lightfoot", name: "Halfling Piedelesto", family: "Halfling", subraceName: "Piedelesto", size: "Piccolo", speed: 25, dark: false, bonuses: { dex: 2, cha: 1 }, traits: ["Fortunato: quando ottieni 1 su un d20, puoi ritirare il dado", "Coraggioso: vantaggio ai TS contro la condizione spaventato", "Agilità halfling: puoi muoverti attraverso lo spazio di creature più grandi", "Furtivo per natura: puoi nasconderti dietro una creatura almeno una taglia più grande"], blurb: "Agile e socievole, capace di passare inosservato." },
  { id: "halfling-stout", name: "Halfling Tozzo", family: "Halfling", subraceName: "Tozzo", size: "Piccolo", speed: 25, dark: false, bonuses: { dex: 2, con: 1 }, traits: ["Fortunato", "Coraggioso", "Agilità halfling", "Resilienza tozza: vantaggio ai TS contro veleno e resistenza ai danni da veleno"], blurb: "Un halfling robusto con una sorprendente resistenza." },
  { id: "umano-variante", name: "Umano variante", family: "Umano", subraceName: "Variante", size: "Medio", speed: 30, dark: false, bonuses: {}, traits: ["Regola opzionale del Manuale del Giocatore 2014: richiede il permesso del Master.", "+1 a due caratteristiche diverse", "Competenza in un'abilità a scelta", "Una lingua aggiuntiva a scelta", "Un talento a scelta"], blurb: "Rinuncia ai bonus di caratteristica diffusi dell'umano comune in cambio di un profilo più definito fin dal primo livello: due incrementi mirati, un'abilità in più e un talento.", variant: true, extraAbilityChoice: { count: 2 }, extraSkillChoice: { count: 1 }, extraFeatChoice: true, proficiencyChoices: [{ key: "razza-umano-variante-lingua", label: "Lingua aggiuntiva", type: "language", count: 1, options: LANGUAGES }] },
  { id: "dragonide", name: "Dragonide", family: "Dragonide", subraceName: "Dragonide", size: "Medio", speed: 30, dark: false, bonuses: { str: 2, cha: 1 }, traits: ["Retaggio draconico", "Arma a soffio", "Resistenza ai danni associati al retaggio draconico"], blurb: "Discendente dei draghi, con un soffio elementale e una resistenza innata." },
  { id: "gnomo-foresta", name: "Gnomo della Foresta", family: "Gnomo", subraceName: "Della Foresta", size: "Piccolo", speed: 25, dark: true, bonuses: { int: 2, dex: 1 }, traits: ["Astuzia gnomica: vantaggio ai TS di Intelligenza, Saggezza e Carisma contro la magia", "Illusionista naturale: conosce Illusione Minore", "Parlare con le piccole bestie"], blurb: "Piccolo illusionista in sintonia con il mondo naturale." },
  { id: "gnomo-roccia", name: "Gnomo delle Rocce", family: "Gnomo", subraceName: "Delle Rocce", size: "Piccolo", speed: 25, dark: true, bonuses: { int: 2, con: 1 }, traits: ["Astuzia gnomica", "Conoscenza dell'artigiano: competenza negli strumenti da meccanico", "Congegno da orologiaio"], blurb: "Inventore curioso e ingegnoso, amante dei meccanismi.", bonusProficiencies: { tools: ["Strumenti da meccanico"] } },
  { id: "mezzelfo", name: "Mezzelfo", family: "Mezzelfo", subraceName: "Mezzelfo", size: "Medio", speed: 30, dark: true, bonuses: { cha: 2 }, extraAbilityChoice: { count: 2, exclude: ["cha"] }, extraSkillChoice: { count: 2 }, traits: ["Retaggio fatato", "Versatilità nelle abilità: competenza in due abilità a scelta", "Una lingua aggiuntiva a scelta"], blurb: "Tra due mondi, con un talento naturale per le relazioni e l'adattamento.", proficiencyChoices: [{ key: "razza-mezzelfo-lingua", label: "Lingua aggiuntiva", type: "language", count: 1, options: LANGUAGES }] },
  { id: "mezzorco", name: "Mezzorco", family: "Mezzorco", subraceName: "Mezzorco", size: "Medio", speed: 30, dark: true, bonuses: { str: 2, con: 1 }, traits: ["Scurovisione", "Minaccioso: competenza in Intimidire", "Resistenza implacabile: a 0 PF, invece di cadere a 0, scendi a 1 PF una volta per riposo lungo", "Attacchi selvaggi: un dado di danno aggiuntivo su un critico con arma da mischia"], blurb: "Potente e tenace, con una ferocia difficile da fermare.", bonusProficiencies: { skills: ["Intimidire"] } },
  { id: "tiefling", name: "Tiefling", family: "Tiefling", subraceName: "Tiefling", size: "Medio", speed: 30, dark: true, bonuses: { cha: 2, int: 1 }, traits: ["Resistenza infernale: resistenza al fuoco", "Eredità infernale: Taumaturgia; altri incantesimi ai livelli previsti"], blurb: "Portatore di un'eredità infernale e di una magia innata." },
];

const SKILL_ABILITY = {
  "Acrobazia": "dex", "Addestrare Animali": "wis", "Arcano": "int", "Atletica": "str",
  "Furtività": "dex", "Inganno": "cha", "Indagare": "int", "Intimidire": "cha",
  "Intrattenere": "cha", "Intuizione": "wis", "Medicina": "wis", "Natura": "int", "Percezione": "wis",
  "Persuasione": "cha", "Rapidità di Mano": "dex", "Religione": "int",
  "Sopravvivenza": "wis", "Storia": "int",
};

const CLASSES = [
  {
    id: "barbaro", name: "Barbaro", hitDie: 12, primary: "Forza", saves: ["Forza", "Costituzione"],
    armor: "Armature leggere e medie, scudi", weapons: "Armi semplici e da guerra",
    skillChoices: 2, skillOptions: ["Addestrare Animali", "Atletica", "Intimidire", "Natura", "Percezione", "Sopravvivenza"],
    equipment: ["Un'ascia bipenne oppure un'arma da mischia da guerra", "Due asce da lancio", "Uno zaino da esploratore", "Quattro giavellotti"],
    blurb: "Canalizza una furia primordiale che lo rende inarrestabile in battaglia.",
  },
  {
    id: "bardo", name: "Bardo", hitDie: 8, primary: "Carisma", saves: ["Destrezza", "Carisma"],
    armor: "Armature leggere", weapons: "Armi semplici, spade lunghe, rapiere, spade corte, balestre a mano",
    skillChoices: 3, skillOptions: ["Acrobazia", "Addestrare Animali", "Arcano", "Atletica", "Inganno", "Indagare", "Intimidire", "Intrattenere", "Intuizione", "Medicina", "Natura", "Percezione", "Persuasione", "Religione", "Rapidità di Mano", "Furtività", "Sopravvivenza", "Storia"],
    equipment: ["Una spada corta oppure un'arma semplice", "Uno strumento musicale a scelta", "Uno zaino da intrattenitore", "Un'armatura di cuoio e un pugnale"],
    blurb: "Intreccia musica e magia per ispirare alleati e disarmare nemici.",
  },
  {
    id: "chierico", name: "Chierico", hitDie: 8, primary: "Saggezza", saves: ["Saggezza", "Carisma"],
    armor: "Armature leggere e medie, scudi", weapons: "Armi semplici",
    skillChoices: 2, skillOptions: ["Storia", "Intuizione", "Medicina", "Persuasione", "Religione"],
    equipment: ["Una mazza oppure una spada corta", "Un'armatura a scaglie o di cuoio", "Una balestra leggera con 20 quadrelli oppure un'arma semplice", "Uno zaino da religioso, uno scudo e un simbolo sacro"],
    blurb: "Canalizza il potere divino della propria fede a beneficio dei compagni.",
  },
  {
    id: "druido", name: "Druido", hitDie: 8, primary: "Saggezza", saves: ["Intelligenza", "Saggezza"],
    armor: "Armature leggere e medie non metalliche, scudi non metallici", weapons: "Bastoni, pugnali, dardi, giavellotti, mazze, falcetti, fionde, lance",
    skillChoices: 2, skillOptions: ["Arcano", "Addestrare Animali", "Intuizione", "Medicina", "Natura", "Percezione", "Religione", "Sopravvivenza"],
    equipment: ["Uno scudo di legno oppure un'arma semplice", "Un falcetto oppure un'arma da mischia semplice", "Un'armatura di cuoio, un set da erborista e un focus druidico"],
    blurb: "Custode della natura selvaggia, capace di assumerne le forme.",
  },
  {
    id: "guerriero", name: "Guerriero", hitDie: 10, primary: "Forza o Destrezza", saves: ["Forza", "Costituzione"],
    armor: "Tutte le armature, scudi", weapons: "Armi semplici e da guerra",
    skillChoices: 2, skillOptions: ["Acrobazia", "Addestrare Animali", "Atletica", "Storia", "Intuizione", "Intimidire", "Percezione", "Sopravvivenza"],
    equipment: ["Un'armatura a maglia oppure un'armatura leggera", "Un'arma da mischia da guerra con uno scudo, oppure due armi da mischia da guerra", "Una balestra leggera con 20 quadrelli oppure due asce da lancio", "Uno zaino da esploratore o da dungeon"],
    blurb: "Maestro delle armi e delle tattiche di combattimento in ogni forma.",
  },
  {
    id: "ladro", name: "Ladro", hitDie: 8, primary: "Destrezza", saves: ["Destrezza", "Intelligenza"],
    armor: "Armature leggere", weapons: "Armi semplici, balestre a mano, spade corte, spade lunghe, rapiere",
    skillChoices: 4, skillOptions: ["Acrobazia", "Atletica", "Inganno", "Intuizione", "Intimidire", "Indagare", "Percezione", "Rapidità di Mano", "Furtività", "Persuasione"],
    equipment: ["Una spada corta oppure una spada lunga", "Un arco corto con faretra da 20 frecce oppure una spada corta", "Uno zaino da ladro, un'armatura di cuoio, due pugnali e strumenti da scasso"],
    blurb: "Agile ed elusivo, colpisce nei punti deboli prima di sparire nell'ombra.",
  },
  {
    id: "mago", name: "Mago", hitDie: 6, primary: "Intelligenza", saves: ["Intelligenza", "Saggezza"],
    armor: "Nessuna", weapons: "Pugnali, dardi, fionde, bastoni, balestre leggere",
    skillChoices: 2, skillOptions: ["Arcano", "Storia", "Intuizione", "Indagare", "Medicina", "Religione"],
    equipment: ["Un bastone oppure un pugnale", "Una borsa di componenti oppure un focus arcano", "Uno zaino da studioso e un libro degli incantesimi"],
    blurb: "Studioso dell'arcano, plasma la realtà attraverso la conoscenza magica.",
  },
  {
    id: "monaco", name: "Monaco", hitDie: 8, primary: "Destrezza e Saggezza", saves: ["Forza", "Destrezza"],
    armor: "Nessuna", weapons: "Armi semplici, spade corte",
    skillChoices: 2, skillOptions: ["Acrobazia", "Atletica", "Storia", "Intuizione", "Religione", "Furtività"],
    equipment: ["Una spada corta oppure un'arma semplice", "Dieci dardi oppure uno zaino da esploratore", "Uno zaino da religioso e un set di attrezzi o uno strumento musicale"],
    blurb: "Disciplina corpo e spirito fino a trasformarli in un'arma perfetta.",
  },
  {
    id: "paladino", name: "Paladino", hitDie: 10, primary: "Forza e Carisma", saves: ["Saggezza", "Carisma"],
    armor: "Tutte le armature, scudi", weapons: "Armi semplici e da guerra",
    skillChoices: 2, skillOptions: ["Atletica", "Intuizione", "Intimidire", "Medicina", "Persuasione", "Religione"],
    equipment: ["Un'arma da mischia da guerra con uno scudo, oppure due armi da mischia da guerra", "Cinque giavellotti oppure un'arma da mischia semplice", "Uno zaino da religioso, un'armatura pesante e un simbolo sacro"],
    blurb: "Ha giurato un voto sacro e lo difende con spada e devozione.",
  },
  {
    id: "ranger", name: "Ranger", hitDie: 10, primary: "Destrezza e Saggezza", saves: ["Forza", "Destrezza"],
    armor: "Armature leggere e medie, scudi", weapons: "Armi semplici e da guerra",
    skillChoices: 3, skillOptions: ["Addestrare Animali", "Atletica", "Intuizione", "Indagare", "Natura", "Percezione", "Furtività", "Sopravvivenza"],
    equipment: ["Un'armatura a scaglie o di cuoio", "Due spade corte oppure due armi da mischia semplici", "Uno zaino da esploratore, un arco lungo e una faretra da 20 frecce"],
    blurb: "Cacciatore ed esploratore, legge i segni della natura selvaggia.",
  },
  {
    id: "stregone", name: "Stregone", hitDie: 6, primary: "Carisma", saves: ["Costituzione", "Carisma"],
    armor: "Nessuna", weapons: "Pugnali, dardi, fionde, bastoni, balestre leggere",
    skillChoices: 2, skillOptions: ["Arcano", "Inganno", "Intuizione", "Intimidire", "Persuasione", "Religione"],
    equipment: ["Una balestra leggera con 20 quadrelli oppure un'arma semplice", "Una borsa di componenti oppure un focus arcano", "Uno zaino da studioso e due pugnali"],
    blurb: "La magia scorre nel suo sangue, innata e a tratti incontrollabile.",
  },
  {
    id: "warlock", name: "Warlock", hitDie: 8, primary: "Carisma", saves: ["Saggezza", "Carisma"],
    armor: "Armature leggere", weapons: "Armi semplici",
    skillChoices: 2, skillOptions: ["Arcano", "Inganno", "Storia", "Intimidire", "Indagare", "Natura", "Religione"],
    equipment: ["Una balestra leggera con 20 quadrelli oppure un'arma semplice", "Una borsa di componenti oppure un focus arcano, e uno zaino da studioso", "Un'armatura di cuoio e due pugnali"],
    blurb: "Ha stretto un patto con un'entità di potere immenso e oscuro.",
  },
];

const SUBCLASS_CHOICE_LEVEL = {
  guerriero: 3,
  ladro: 3,
  barbaro: 3,
  monaco: 3,
  mago: 2,
  bardo: 3,
  ranger: 3,
  stregone: 1
};

const SUBCLASS_AVAILABILITY_MESSAGE = {
  mago: "al 2° livello",
  guerriero: "al 3° livello",
  ladro: "al 3° livello",
  barbaro: "al 3° livello",
  monaco: "al 3° livello",
  bardo: "al 3° livello",
  ranger: "al 3° livello",
  stregone: "al 1° livello",
};

// Livelli in cui ogni classe ottiene un Incremento del Punteggio di Caratteristica (5e 2014).
const ASI_LEVELS_BY_CLASS = {
  barbaro: [4, 8, 12, 16, 19],
  bardo: [4, 8, 12, 16, 19],
  chierico: [4, 8, 12, 16, 19],
  druido: [4, 8, 12, 16, 19],
  guerriero: [4, 6, 8, 12, 14, 16, 19],
  ladro: [4, 8, 10, 12, 16, 19],
  mago: [4, 8, 12, 16, 19],
  monaco: [4, 8, 12, 16, 19],
  paladino: [4, 8, 12, 16, 19],
  ranger: [4, 8, 12, 16, 19],
  stregone: [4, 8, 12, 16, 19],
  warlock: [4, 8, 12, 16, 19],
};

/* ---------------------------------- MULTICLASSE ---------------------------------- */
// Requisiti minimi di caratteristica (5e 2014, PHB) per intraprendere il multiclasse.
// "any" indica un requisito soddisfatto se ALMENO UNA delle condizioni elencate è vera.
const MULTICLASS_PREREQS = {
  barbaro: { all: [{ key: "str", score: 13 }] },
  bardo: { all: [{ key: "cha", score: 13 }] },
  chierico: { all: [{ key: "wis", score: 13 }] },
  druido: { all: [{ key: "wis", score: 13 }] },
  guerriero: { any: [{ key: "str", score: 13 }, { key: "dex", score: 13 }] },
  ladro: { all: [{ key: "dex", score: 13 }] },
  mago: { all: [{ key: "int", score: 13 }] },
  monaco: { all: [{ key: "dex", score: 13 }, { key: "wis", score: 13 }] },
  paladino: { all: [{ key: "str", score: 13 }, { key: "cha", score: 13 }] },
  ranger: { all: [{ key: "dex", score: 13 }, { key: "wis", score: 13 }] },
  stregone: { all: [{ key: "cha", score: 13 }] },
  warlock: { all: [{ key: "cha", score: 13 }] },
};

// Competenze parziali ottenute multiclassando in ciascuna classe (5e 2014, PHB).
const MULTICLASS_PROFICIENCIES = {
  barbaro: "Scudi, armi semplici e da guerra.",
  bardo: "Armature leggere, una competenza in un'abilità a scelta.",
  chierico: "Armature leggere e medie, scudi.",
  druido: "Armature leggere e medie non metalliche, scudi non metallici.",
  guerriero: "Armature leggere e medie, scudi, armi semplici e da guerra.",
  ladro: "Armature leggere, una competenza in un'abilità a scelta, strumenti da scasso.",
  mago: "Nessuna competenza aggiuntiva.",
  monaco: "Armi semplici, spade corte.",
  paladino: "Armature leggere e medie, scudi, armi semplici e da guerra.",
  ranger: "Armature leggere, armi semplici e da guerra, una competenza in un'abilità dalla lista del Ranger.",
  stregone: "Nessuna competenza aggiuntiva.",
  warlock: "Armature leggere, armi semplici.",
};

// Classi il cui multiclasse concede una competenza extra in un'abilità (a scelta dalla lista della classe).
const MULTICLASS_BONUS_SKILL_CLASS = ["bardo", "ladro", "ranger"];

function checkMulticlassPrereq(finalScores, clsId) {
  const req = MULTICLASS_PREREQS[clsId];
  if (!req) return { met: true, text: "Nessun requisito." };
  const fmt = (c) => `${ABILITIES.find((a) => a.key === c.key)?.name} ${c.score}+`;
  if (req.all) {
    const met = req.all.every((c) => (finalScores[c.key] || 0) >= c.score);
    return { met, text: req.all.map(fmt).join(" e ") };
  }
  if (req.any) {
    const met = req.any.some((c) => (finalScores[c.key] || 0) >= c.score);
    return { met, text: req.any.map(fmt).join(" o ") };
  }
  return { met: true, text: "Nessun requisito." };
}

function getTotalCharacterLevel(draft) {
  return (draft.level || 1) + (draft.multiclass && draft.multiclass.classId ? (draft.multiclass.level || 1) : 0);
}

function getMulticlassCasterLevelContribution(clsId, level, subclassId) {
  if (!clsId || !level || clsId === "warlock") return 0;
  const caster = getEffectiveCasterInfo(clsId, subclassId);
  if (!caster) return 0;
  if (isThirdCaster(clsId, subclassId)) return Math.floor(level / 3);
  if (caster.halfCaster) return Math.floor(level / 2);
  return level;
}

// Restituisce l'elenco delle "voci di classe" del personaggio (classe primaria + eventuale
// classe secondaria da multiclasse), ciascuna col proprio id, livello e sottoclasse.
function getClassEntries(draft) {
  const entries = [];
  if (draft.classId) entries.push({ classId: draft.classId, level: draft.level || 1, subclassId: getChosenSubclassId(draft, draft.classId), store: draft, isPrimary: true });
  if (draft.multiclass && draft.multiclass.classId) {
    entries.push({ classId: draft.multiclass.classId, level: draft.multiclass.level || 1, subclassId: getChosenSubclassId(draft.multiclass, draft.multiclass.classId), store: draft.multiclass, isPrimary: false });
  }
  return entries;
}

// Slot incantesimo effettivi del personaggio: se ha una sola classe si comporta come
// sempre (tabella della classe); se è multiclassato, combina i livelli da incantatore
// secondo la Tabella Incantatore Multiclasse (5e 2014), tenendo il Patto Magico del
// Warlock sempre separato.
function getEffectiveSpellSlots(draft) {
  const entries = getClassEntries(draft);
  if (entries.length <= 1) {
    const e = entries[0];
    return e ? getSpellSlots(e.classId, e.level, e.subclassId) : [];
  }
  const warlockEntry = entries.find((e) => e.classId === "warlock");
  const others = entries.filter((e) => e.classId !== "warlock");
  const combinedLevel = others.reduce((sum, e) => sum + getMulticlassCasterLevelContribution(e.classId, e.level, e.subclassId), 0);
  let slots = [];
  if (combinedLevel > 0) {
    const lvl = Math.max(1, Math.min(20, combinedLevel));
    const row = FULL_CASTER_SLOTS[lvl - 1];
    slots = row.map((total, i) => ({ level: i + 1, total })).filter((s) => s.total > 0);
  }
  if (warlockEntry) {
    slots = [...slots, ...getSpellSlots("warlock", warlockEntry.level, warlockEntry.subclassId)];
  }
  return slots;
}

// Feature del Circolo della Terra (condivisa tra tutte le voci druido)
const DRUID_CIRCLE_LAND_FEATURES = [
  { level: 2, name: "Recupero Naturale", desc: "Durante un riposo breve, una volta al giorno, puoi recuperare slot incantesimo con livello totale pari a metà del tuo livello da Druido (arrotondato per eccesso), nessuno di 6° livello o superiore." },
  { level: 6, name: "Passo della Natura", desc: "Il terreno difficile creato da piante non ti costa movimento extra; hai vantaggio ai TS contro piante create o manipulate magicamente per ostacolarti." },
  { level: 10, name: "Protezione della Natura", desc: "Sei immune alla condizione avvelenato e alle malattie; non puoi essere affascinato o spaventato da elementali o fate." },
  { level: 14, name: "Rifugio della Natura", desc: "Bestie e piante devono superare un TS di Saggezza (CD = la tua CD degli incantesimi) per attaccarti; se falliscono, devono scegliere un altro bersaglio se possibile." },
];

const SUBCLASSES = {
  guerriero: [
    {
      id: "campione", name: "Campione",
      blurb: "Persegue la perfezione fisica e la potenza bruta in combattimento.",
      features: [
        { level: 3, name: "Critico Migliorato", desc: "I tuoi attacchi con armi vanno a segno in critico anche con un 19 sul dado." },
        { level: 7, name: "Atleta Straordinario", desc: "Aggiungi metà del tuo bonus di competenza (arrotondato per eccesso) a ogni prova di Forza, Destrezza o Costituzione in cui non sei già competente; +mod. caratteristica al salto in lungo con rincorsa." },
        { level: 10, name: "Stile di Combattimento Aggiuntivo", desc: "Impari un secondo Stile di Combattimento." },
        { level: 15, name: "Critico Superiore", desc: "Il tuo raggio di critico si estende ulteriormente: 18-20." },
        { level: 18, name: "Sopravvissuto", desc: "All'inizio di ogni tuo turno, se hai PF pari o inferiori alla metà del massimo (ma non a 0), recuperi 5 + mod. Costituzione PF." },
      ],
    },
    {
      id: "maestro-di-battaglia", name: "Maestro di Battaglia",
      blurb: "Studia l'arte della guerra e usa manovre tattiche per dominare il campo di battaglia.",
      proficiencyChoices: [{ key: "sub-guerriero-maestro-strumenti", label: "Set di strumenti (Studioso di Guerra)", type: "tool", count: 1, options: [...ARTISAN_TOOLS, ...GAMING_SETS, ...MUSICAL_INSTRUMENTS] }],
      features: [
        { level: 3, name: "Superiorità in Combattimento", desc: "Impari 3 manovre tattiche a scelta, alimentate da Dadi Superiorità (d8). Le manovre conosciute salgono a 5 al 7° livello e a 7 al 15°.", resource: true },
        { level: 3, name: "Studioso di Guerra", desc: "Ottieni competenza in un set di strumenti a scelta." },
        { level: 7, name: "Conosci il Tuo Nemico", desc: "Studiando una creatura per un minuto, scopri come le sue capacità si confrontano con le tue." },
        { level: 10, name: "Potenziamento della Superiorità in Combattimento", desc: "Il tuo Dado Superiorità diventa un d10." },
        { level: 15, name: "Instancabile", desc: "Se tiri l'iniziativa e non hai Dadi Superiorità rimasti, ne recuperi automaticamente uno." },
        { level: 18, name: "Potenziamento della Superiorità in Combattimento", desc: "Il tuo Dado Superiorità diventa un d12." },
      ],
    },
    {
      id: "cavaliere-mistico", name: "Cavaliere Mistico",
      blurb: "Fonde la maestria marziale con la magia arcana del Mago.",
      features: [
        { level: 3, name: "Incantesimi da Mago (terzo incantatore, Intelligenza)", desc: "Impari incantesimi dalla lista del Mago (soprattutto Ammaliamento e Evocazione). Slot, trucchetti e incantesimi conosciuti sono calcolati nello step Incantesimi.", thirdCaster: true },
        { level: 3, name: "Legame con l'Arma", desc: "Puoi legarti a un'arma e richiamarla nella tua mano come azione bonus." },
        { level: 7, name: "Magia da Guerra", desc: "Quando usi la tua azione per lanciare un trucchetto, puoi effettuare un attacco con arma come azione bonus." },
        { level: 10, name: "Colpo Ultraterreno", desc: "Quando colpisci una creatura con un attacco con arma, quella creatura ha svantaggio al prossimo TS contro un incantesimo che le lanci entro la fine del tuo prossimo turno." },
        { level: 15, name: "Carica Arcana", desc: "Quando usi Azione Impetuosa, puoi anche teletrasportarti fino a 9 m verso uno spazio libero che puoi vedere, prima o dopo l'azione extra." },
        { level: 18, name: "Magia da Guerra Migliorata", desc: "Ora puoi effettuare l'attacco con arma come azione bonus anche quando usi l'azione per lanciare un incantesimo qualsiasi, non solo un trucchetto." },
      ],
    },
  ],
  ladro: [
    {
      id: "ladro-archetipo", name: "Ladro",
      blurb: "Il classico furfante: agile, silenzioso e sempre pronto a sfruttare un'occasione.",
      features: [
        { level: 3, name: "Mani Rapide", desc: "Puoi usare l'azione bonus concessa da Azione Scaltra per: Rapidità di Mano, disinnescare una trappola/scassinare una serratura, oppure usare un oggetto." },
        { level: 3, name: "Scalatore Provetto", desc: "Arrampicarti non ti costa movimento extra." },
        { level: 9, name: "Furtività Suprema", desc: "Hai vantaggio alle prove di Furtività se ti muovi per non più di metà della tua velocità nello stesso turno." },
        { level: 13, name: "Uso di Congegni Magici", desc: "Puoi usare bacchette, bastoni e altri oggetti magici normalmente riservati ad altre classi." },
        { level: 17, name: "Riflessi da Ladro", desc: "Nel primo round di un combattimento in cui non sei sorpreso, agisci due volte: prendi un turno normale e uno aggiuntivo all'iniziativa -10." },
      ],
    },
    {
      id: "assassino", name: "Assassino",
      blurb: "Colpisce nell'ombra, spesso prima ancora che il bersaglio sappia di essere in pericolo.",
      bonusProficiencies: { tools: ["Kit da travestimento", "Kit da avvelenatore"] },
      features: [
        { level: 3, name: "Competenze dell'Assassino", desc: "Ottieni competenza in Kit da Travestimento e Kit da Avvelenatore." },
        { level: 3, name: "Assassinio", desc: "Hai vantaggio agli attacchi contro creature che non hanno ancora agito in combattimento. Ogni colpo a segno contro un bersaglio sorpreso è un critico automatico." },
        { level: 9, name: "Infiltrazione Impeccabile", desc: "Puoi costruire una falsa identità completa in una settimana." },
        { level: 13, name: "Impostore", desc: "Puoi imitare in modo convincente il modo di parlare, scrivere e comportarsi di un'altra persona." },
        { level: 17, name: "Colpo Mortale", desc: "Contro un bersaglio sorpreso colpito dal tuo Attacco Furtivo, il bersaglio deve superare un TS su Costituzione (CD = CD dei tuoi TS) o subire danno raddoppiato." },
      ],
    },
    {
      id: "furfante-arcano", name: "Furfante Arcano",
      blurb: "Un ladro che intreccia illusioni e ammaliamenti alle proprie abilità furtive.",
      features: [
        { level: 3, name: "Incantesimi da Mago (terzo incantatore, Intelligenza)", desc: "Impari incantesimi dalla lista del Mago (soprattutto Ammaliamento e Illusione). Slot, trucchetti e incantesimi conosciuti sono calcolati nello step Incantesimi.", thirdCaster: true },
        { level: 3, name: "Prestidigitazione della Mano Magica", desc: "Impari il trucchetto Mano Magica; puoi renderla invisibile e comandarla come azione bonus per manipolare oggetti, aprire contenitori, rubare o nascondere oggetti a distanza." },
        { level: 9, name: "Imboscata Magica", desc: "Se sei nascosto da una creatura quando le lanci contro un incantesimo, quella creatura ha svantaggio al tiro salvezza contro l'incantesimo in quel turno." },
        { level: 13, name: "Furfante Versatile", desc: "Puoi usare la tua Mano Magica per darti vantaggio a un attacco contro una creatura entro 1,5 m dalla mano." },
        { level: 17, name: "Ladro di Incantesimi", desc: "Una volta per riposo lungo, quando una creatura lancia un incantesimo che ti bersaglia, puoi usare la reazione per tentare di negarlo (TS di Intelligenza della creatura) e, se riesci, rubarlo per lanciarlo tu stesso entro le successive 8 ore." },
      ],
    },
  ],
  barbaro: [
    {
      id: "berserker", name: "Berserker",
      blurb: "Canalizza l'ira in una furia frenetica, incurante del proprio corpo.",
      features: [
        { level: 3, name: "Furia Frenetica", desc: "Mentre sei in Ira, puoi effettuare un attacco con arma da mischia come azione bonus ogni turno. Quando l'Ira finisce, subisci un livello di sfinimento." },
        { level: 6, name: "Ira Spietata", desc: "Non puoi essere spaventato o affascinato mentre sei in Ira." },
        { level: 10, name: "Presenza Intimidatoria", desc: "Come azione, spaventi una creatura entro 9 m (TS Saggezza CD 8 + bonus di competenza + mod. Carisma)." },
        { level: 14, name: "Vendetta", desc: "Quando subisci danno da una creatura entro 1,5 m, puoi usare la reazione per attaccarla in mischia." },
      ],
    },
    {
      id: "totem-orso", name: "Via del Totem — Spirito dell'Orso",
      blurb: "Si lega allo spirito dell'orso: resistenza e forza bruta senza pari.",
      features: [
        { level: 3, name: "Spirito Totemico (Orso)", desc: "Mentre sei in Ira, hai resistenza a tutti i tipi di danno tranne il danno psichico." },
        { level: 6, name: "Aspetto della Bestia (Orso)", desc: "La tua capacità di trasporto (carico massimo e sollevamento massimo) raddoppia; hai vantaggio alle prove di Forza per spingere, tirare, sollevare o spezzare oggetti." },
        { level: 10, name: "Spirito Custode (Orso)", desc: "Puoi lanciare Comunione con la Natura, ma solo come rituale: una versione spettrale dell'orso appare per aiutarti a interpretare le informazioni ottenute." },
        { level: 14, name: "Fusione Totemica (Orso)", desc: "Mentre sei in Ira, ogni creatura ostile entro 1,5 m da te ha svantaggio ai tiri per colpire contro bersagli diversi da te (o da un altro personaggio con questa stessa feature)." },
      ],
    },
    {
      id: "totem-aquila", name: "Via del Totem — Spirito dell'Aquila",
      blurb: "Si lega allo spirito dell'aquila: velocità e percezione sul campo di battaglia.",
      features: [
        { level: 3, name: "Spirito Totemico (Aquila)", desc: "Mentre sei in Ira e non indossi armatura pesante, le creature hanno svantaggio agli attacchi di opportunità contro di te e puoi Scattare come azione bonus." },
        { level: 6, name: "Aspetto della Bestia (Aquila)", desc: "Vedi fino a 1,5 km senza difficoltà, distinguendo dettagli fini come se guardassi qualcosa entro 30 m; inoltre la scarsa illuminazione non impone svantaggio alle tue prove di Percezione (Saggezza)." },
        { level: 10, name: "Spirito Custode (Aquila)", desc: "Puoi lanciare Comunione con la Natura, ma solo come rituale: una versione spettrale dell'aquila appare per aiutarti a interpretare le informazioni ottenute." },
        { level: 14, name: "Fusione Totemica (Aquila)", desc: "Mentre sei in Ira, ottieni una velocità di volo pari alla tua velocità attuale (funziona solo a scatti: cadi se termini il turno in aria senza nulla che ti sostenga)." },
      ],
    },
    {
      id: "totem-lupo", name: "Via del Totem — Spirito del Lupo",
      blurb: "Si lega allo spirito del lupo: caccia in branco e superiorità tattica.",
      features: [
        { level: 3, name: "Spirito Totemico (Lupo)", desc: "Mentre sei in Ira, i tuoi alleati hanno vantaggio agli attacchi in mischia contro qualsiasi creatura ostile entro 1,5 m da te." },
        { level: 6, name: "Aspetto della Bestia (Lupo)", desc: "Puoi seguire tracce di altre creature anche muovendoti a passo veloce, e muoverti furtivamente anche a passo normale." },
        { level: 10, name: "Spirito Custode (Lupo)", desc: "Puoi lanciare Comunione con la Natura, ma solo come rituale: una versione spettrale del lupo appare per aiutarti a interpretare le informazioni ottenute." },
        { level: 14, name: "Fusione Totemica (Lupo)", desc: "Come azione bonus, quando colpisci con un attacco con arma da mischia una creatura Grande o più piccola, puoi atterrarla prona." },
      ],
    },
  ],
  monaco: [
    {
      id: "mano-aperta", name: "Via della Mano Aperta",
      blurb: "Maestria marziale pura: ogni colpo può essere usato per controllare lo scontro.",
      features: [
        { level: 3, name: "Tecnica della Mano Aperta", desc: "Quando colpisci con Arti Marziali, puoi imporre un effetto (TS Destrezza/Forza, CD 8 + bonus di competenza + mod. Destrezza): il bersaglio cade prone, è spinto di 4,5 m, oppure non può fare reazioni fino al tuo prossimo turno." },
        { level: 6, name: "Guarigione del Corpo", desc: "Come azione, una volta per riposo lungo, recuperi PF pari a 3 × livello di Monaco." },
        { level: 11, name: "Tranquillità", desc: "Al termine di un riposo lungo ottieni l'effetto di Santuario finché non attacchi/lanci un incantesimo ostile o fino al riposo lungo successivo." },
        { level: 17, name: "Palmo Tremante", desc: "Spendendo 3 Punti Ki su un colpo con Arti Marziali, imponi vibrazioni letali; come azione, entro il numero di giorni pari al tuo livello, puoi forzare un TS Costituzione o portare il bersaglio a 0 PF (metà danno se supera il tiro)." },
      ],
    },
    {
      id: "ombra", name: "Via dell'Ombra",
      blurb: "Tecniche furtive che sfruttano l'oscurità come arma.",
      features: [
        { level: 3, name: "Arti dell'Ombra", desc: "Spendendo 2 Punti Ki puoi lanciare Oscurità, Scurovisione, Passo senza Tracce o Silenzio senza componenti materiali; impari il trucchetto Illusione Minore (Saggezza)." },
        { level: 6, name: "Passo Ombra", desc: "In penombra o oscurità, come azione bonus ti teletrasporti fino a 18 m in uno spazio libero che puoi vedere anch'esso in penombra/oscurità, con vantaggio al prossimo attacco prima della fine del turno." },
        { level: 11, name: "Manto d'Ombra", desc: "In penombra o oscurità, puoi usare la tua azione per diventare invisibile (senza costo in Ki), finché non attacchi, lanci un incantesimo o entri in un'area di luce intensa." },
        { level: 17, name: "Opportunista", desc: "Una volta per tuo turno, quando una creatura entro 1,5 m viene colpita da un attacco di qualcun altro, puoi usare la reazione per attaccarla in mischia." },
      ],
    },
    {
      id: "quattro-elementi", name: "Via dei Quattro Elementi",
      blurb: "Piega i Punti Ki alla volontà degli elementi attraverso discipline elementali.",
      features: [
        { level: 3, name: "Discepolo degli Elementi", desc: "Conosci sempre la disciplina Sintonia Elementale (gratuita) e impari 2 ulteriori discipline elementali a scelta tra quelle disponibili. Scegli le tue discipline qui sotto, nella scheda del personaggio.", disciplinePick: true },
        { level: 6, name: "Disciplina Aggiuntiva", desc: "Impari un'altra disciplina elementale a scelta, incluse quelle che richiedono almeno il 6° livello.", disciplinePick: true },
        { level: 11, name: "Disciplina Aggiuntiva", desc: "Impari un'altra disciplina elementale a scelta, incluse quelle che richiedono almeno l'11° livello.", disciplinePick: true },
        { level: 17, name: "Disciplina Aggiuntiva", desc: "Impari un'altra disciplina elementale a scelta, incluse quelle che richiedono il 17° livello.", disciplinePick: true },
      ],
    },
  ],
  mago: [
    {
      id: "evocazione", name: "Scuola di Evocazione",
      blurb: "Plasma energia pura in effetti distruttivi o utili, colpendo con precisione chirurgica.",
      features: [
        { level: 2, name: "Sagomare gli Incantesimi", desc: "Quando lanci un incantesimo di evocazione che danneggia più creature, puoi far automaticamente superare il tiro salvezza (e non subire danno se normalmente ne subirebbero la metà) a un numero di creature a tua scelta pari a 1 + il livello dell'incantesimo." },
        { level: 6, name: "Trucchetto Potente", desc: "Quando una creatura supera il tiro salvezza contro un tuo trucchetto, subisce comunque metà del danno (ma nessun altro effetto)." },
        { level: 10, name: "Evocazione Potenziata", desc: "Aggiungi il tuo modificatore di Intelligenza al danno di un incantesimo di evocazione che infligge danno." },
        { level: 14, name: "Sovraccarico", desc: "Una volta per riposo lungo, puoi infliggere il danno massimo con un incantesimo di evocazione di 5° livello o inferiore; puoi ripetere l'effetto accettando un livello di sfinimento per ogni utilizzo aggiuntivo.", resource: true },
      ],
    },
    {
      id: "abiurazione", name: "Scuola di Abiurazione",
      blurb: "Protegge sé stesso e gli alleati con barriere e magie difensive.",
      features: [
        { level: 2, name: "Baluardo Arcano", desc: "Quando lanci un incantesimo di abiurazione di 1° livello o superiore, crei un baluardo magico con PF pari a 2× il tuo livello da mago + mod. Intelligenza, che assorbe danno al posto tuo finché non si esaurisce; si ricarica lanciando un altro incantesimo di abiurazione." },
        { level: 6, name: "Baluardo Proiettato", desc: "Come reazione, puoi far assorbire al tuo Baluardo Arcano il danno che colpirebbe una creatura che vedi entro 9 m, al posto tuo." },
        { level: 10, name: "Abiurazione Migliorata", desc: "Aggiungi il tuo bonus di competenza a una prova di caratteristica fatta come parte di un incantesimo di dissolvi magia o annulla incantesimo." },
        { level: 14, name: "Resistenza agli Incantesimi", desc: "Vantaggio ai tiri salvezza contro gli incantesimi e resistenza al danno da incantesimi." },
      ],
    },
    {
      id: "illusione", name: "Scuola di Illusione",
      blurb: "Inganna i sensi e la mente altrui con immagini e finzioni sempre più convincenti.",
      features: [
        { level: 2, name: "Illusione Minore Migliorata", desc: "Il trucchetto Illusione Minore può creare sia un suono sia un'immagine contemporaneamente." },
        { level: 6, name: "Illusioni Malleabili", desc: "Come azione, puoi cambiare la natura di un'illusione che hai creato, per tutta la durata dell'incantesimo." },
        { level: 10, name: "Sé Illusorio", desc: "Una volta per riposo breve o lungo, come reazione quando una creatura ti attacca, crei un duplicato illusorio di te stesso: l'attacco fallisce automaticamente.", resource: true },
        { level: 14, name: "Realtà Illusoria", desc: "Una volta per lancio di un incantesimo di illusione di 1° livello o superiore, puoi rendere reale per un minuto un oggetto non magico e inanimato all'interno dell'illusione." },
      ],
    },
    {
      id: "ammaliamento", name: "Scuola di Ammaliamento",
      blurb: "Piega le menti altrui alla propria volontà con sguardi e parole ammalianti.",
      features: [
        { level: 2, name: "Sguardo Ipnotico", desc: "Come azione, il tuo sguardo può affascinare una creatura entro 1,5 m (TS di Saggezza nega); il bersaglio è anche incapacitato finché rimane affascinato. Puoi sostenere l'effetto come azione ogni turno." },
        { level: 6, name: "Fascino Istintivo", desc: "Una volta per riposo lungo, quando una creatura che vedi entro 9 m ti attacca, puoi forzarla a un TS di Saggezza per ridirigere l'attacco verso un'altra creatura a sua scelta (non se stessa).", resource: true },
        { level: 10, name: "Ammaliamento Diviso", desc: "Quando lanci un incantesimo di ammaliamento di 1° livello o superiore che bersaglia una sola creatura, puoi bersagliarne una seconda entro portata." },
        { level: 14, name: "Alterare Ricordi", desc: "Quando affascini una creatura con un incantesimo di ammaliamento, può non accorgersi di esserlo stata; come azione puoi anche tentare di cancellarle fino a 24 ore di ricordi." },
      ],
    },
    {
      id: "divinazione", name: "Scuola di Divinazione",
      blurb: "Scruta il velo del destino per anticipare ciò che deve ancora accadere.",
      features: [
        { level: 2, name: "Presagio", desc: "Dopo un riposo lungo, tira 2d20 e annota i risultati: puoi sostituire un tiro per colpire, una prova di caratteristica o un TS (tuo o di una creatura che vedi) con uno di questi valori, uno alla volta.", resource: true },
        { level: 6, name: "Divinazione Esperta", desc: "Quando lanci un incantesimo di divinazione di 2° livello o superiore usando uno slot, recuperi uno slot di livello inferiore già speso." },
        { level: 10, name: "Il Terzo Occhio", desc: "Come azione, ottieni fino al tuo prossimo riposo uno tra: Scurovisione, Vista Eterea, Maggior Comprensione (linguaggi) o Vedere l'Invisibile." },
        { level: 14, name: "Presagio Superiore", desc: "I dadi di Presagio salgono da due a tre." },
      ],
    },
    {
      id: "necromanzia", name: "Scuola di Necromanzia",
      blurb: "Studia i confini tra vita e morte, spesso al servizio di poteri oscuri.",
      features: [
        { level: 2, name: "Raccolto Cupo", desc: "Una volta per turno, quando uccidi una creatura con un incantesimo di 1° livello o superiore, recuperi PF pari al doppio del livello dell'incantesimo (triplo se di necromanzia); non funziona su costrutti o non morti." },
        { level: 6, name: "Servitori Non Morti", desc: "Animare Morti crea un non morto aggiuntivo; i non morti che crei o animi con i tuoi incantesimi ottengono PF e danno bonus." },
        { level: 10, name: "Assuefatto alla Non Morte", desc: "Resistenza al danno necrotico; i tuoi PF massimi non possono essere ridotti." },
        { level: 14, name: "Comandare i Non Morti", desc: "Come azione, un non morto entro 9 m deve superare un TS di Carisma o passare permanentemente sotto il tuo controllo." },
      ],
    },
    {
      id: "trasmutazione", name: "Scuola di Trasmutazione",
      blurb: "Altera la natura stessa della materia, del corpo e delle sostanze.",
      features: [
        { level: 2, name: "Alchimia Minore", desc: "Come azione, trasformi un oggetto non magico in un'altra sostanza non magica per un periodo di tempo." },
        { level: 6, name: "Pietra del Trasmutatore", desc: "Crei una pietra che concede a chi la porta uno tra: Scurovisione, +3 m di velocità, competenza nei TS su Costituzione, o resistenza a un tipo di danno; puoi cambiare il beneficio dopo un riposo lungo." },
        { level: 10, name: "Mutaforma", desc: "Una volta per riposo breve o lungo, puoi lanciare Polimorfia su te stesso senza consumare uno slot.", resource: true },
        { level: 14, name: "Maestro Trasmutatore", desc: "Distruggendo la Pietra del Trasmutatore puoi: rimuovere una maledizione/malattia/veleno, ringiovanire, riportare in vita senza componenti materiali, oppure trasmutare fino a 5000 mo di una sostanza in un'altra." },
      ],
    },
    {
      id: "conjurazione", name: "Scuola di Conjurazione",
      blurb: "Richiama oggetti, creature e sé stesso da un luogo all'altro con un pensiero.",
      features: [
        { level: 2, name: "Conjurazione Minore", desc: "Come azione, evochi un oggetto inanimato (fino a un cubo di 1,5 m) che hai già visto in precedenza; dura 1 ora." },
        { level: 6, name: "Trasposizione Benigna", desc: "Come azione, ti teletrasporti fino a 9 m in uno spazio libero che puoi vedere, oppure ti scambi di posto con una creatura volontaria che hai evocato con un incantesimo di conjurazione." },
        { level: 10, name: "Conjurazione Focalizzata", desc: "La concentrazione su un incantesimo di conjurazione non può essere interrotta dal danno subito." },
        { level: 14, name: "Evocazioni Durature", desc: "Le creature che evochi con incantesimi di conjurazione ottengono 30 PF temporanei." },
      ],
    },
  ],
  bardo: [
    {
      id: "tradizione", name: "Collegio della Tradizione",
      blurb: "Colleziona storie, segreti e conoscenze da ogni angolo del mondo.",
      features: [
        { level: 3, name: "Competenze Bonus", desc: "Ottieni competenza in 3 abilità a tua scelta." },
        { level: 3, name: "Parole Taglienti", desc: "Come reazione, usi un dado di Ispirazione Bardica per sottrarre il risultato al tiro per colpire, alla prova di caratteristica o al tiro per i danni di una creatura entro 18 m che puoi sentire." },
        { level: 6, name: "Segreti Magici Aggiuntivi", desc: "Impari 2 incantesimi da qualsiasi classe; per te contano come incantesimi da Bardo." },
        { level: 14, name: "Abilità Ineguagliabile", desc: "Puoi aggiungere un dado di Ispirazione Bardica a una tua prova di caratteristica." },
      ],
    },
    {
      id: "valore", name: "Collegio del Valore",
      blurb: "Porta le storie eroiche direttamente sul campo di battaglia, spada in mano.",
      features: [
        { level: 3, name: "Competenze Bonus", desc: "Ottieni competenza con armature medie, scudi e armi da guerra." },
        { level: 3, name: "Ispirazione in Combattimento", desc: "Una creatura che ha un tuo dado di Ispirazione Bardica può usarlo per aggiungerlo a un tiro per i danni con arma, oppure come reazione per aggiungerlo alla propria CA contro un attacco che altrimenti la colpirebbe." },
        { level: 6, name: "Attacco Extra", desc: "Puoi attaccare due volte, invece che una, quando usi l'azione Attacco.", effect: { type: "extraAttack", value: 2 } },
        { level: 14, name: "Magia da Battaglia", desc: "Quando usi la tua azione per lanciare un incantesimo da Bardo, puoi effettuare un attacco con arma come azione bonus." },
      ],
    },
  ],
  ranger: [
    {
      id: "cacciatore", name: "Cacciatore",
      blurb: "Studia le proprie prede e adatta le tattiche alla minaccia da affrontare.",
      features: [
        { level: 3, name: "Preda del Cacciatore", desc: "Scegli una delle seguenti opzioni: Ammazzagiganti (attacco di reazione contro creature Grandi o più grandi che ti mancano in mischia), Sterminatore di Colossi (1d8 di danno extra una volta per turno a un bersaglio non a PF massimi), oppure Spezza-Orda (un attacco extra contro un'altra creatura entro 1,5 m dal bersaglio originale, una volta per turno)." },
        { level: 7, name: "Tattiche Difensive", desc: "Scegli una delle seguenti opzioni: Sfuggi alla Massa (gli attacchi di opportunità contro di te hanno svantaggio), Difesa da Attacchi Multipli (+4 CA contro il secondo attacco e successivi della stessa creatura nello stesso turno), oppure Volontà d'Acciaio (vantaggio ai TS contro la condizione spaventato)." },
        { level: 11, name: "Attacco Multiplo", desc: "Scegli una delle seguenti opzioni: Raffica (attacco a distanza contro ogni creatura entro 3 m da un punto che vedi, nel raggio dell'arma), oppure Attacco Roteante (attacco in mischia contro ogni creatura entro 1,5 m da te)." },
        { level: 15, name: "Difesa Superiore del Cacciatore", desc: "Scegli una delle seguenti opzioni: Elusione (nessun danno con un TS di Destrezza superato, metà se fallito), Resisti alla Marea (rendi un attacco in mischia che ti manca un attacco contro un'altra creatura a tua scelta), oppure Schivata Prodigiosa (dimezzi il danno di un attacco che vedi arrivare)." },
      ],
    },
    {
      id: "maestro-delle-bestie", name: "Maestro delle Bestie",
      blurb: "Combatte fianco a fianco con un compagno animale fedele.",
      features: [
        { level: 3, name: "Compagno del Ranger", desc: "Ottieni un compagno bestiale che combatte al tuo fianco e agisce nel tuo turno secondo i tuoi comandi." },
        { level: 7, name: "Addestramento Eccezionale", desc: "Su tuo comando (senza usare la tua azione), il compagno può Scattare, Disimpegnarsi o Aiutare come azione bonus; i suoi attacchi contano come magici ai fini della resistenza al danno." },
        { level: 11, name: "Furia Bestiale", desc: "Il tuo compagno può effettuare due attacchi quando usa l'azione Attacco." },
        { level: 15, name: "Incantesimi Condivisi", desc: "Quando lanci un incantesimo bersagliando solo te stesso, puoi farlo colpire anche il tuo compagno, se entro 9 m da te." },
      ],
    },
  ],
  stregone: [
    {
      id: "progenie-draconica", name: "Progenie Draconica",
      blurb: "Il sangue di un drago scorre nelle tue vene, donandoti resilienza e poteri elementali.",
      features: [
        { level: 1, name: "Ascendente Draconico", desc: "Scegli un tipo di drago: determina il tipo di danno delle tue future feature draconiche (es. Rosso = fuoco, Blu = fulmine, Verde = veleno, Bianco = freddo, Nero = acido, Oro/Bronzo/Ottone = fuoco, Argento/Rame = freddo/acido)." },
        { level: 1, name: "Resilienza Draconica", desc: "+1 PF massimo per ogni livello da Stregone; senza armatura, la tua CA è pari a 13 + mod. Destrezza.", effect: { type: "draconicResilience" } },
        { level: 6, name: "Affinità Elementale", desc: "Quando lanci un incantesimo che infligge danno del tuo tipo draconico, aggiungi il mod. Carisma a un tiro per i danni; puoi anche spendere 1 Punto Stregoneria per ottenere resistenza a quel tipo di danno per 1 ora." },
        { level: 14, name: "Ali Draconiche", desc: "Come azione bonus, ti spuntano ali draconiche: guadagni una velocità di volo pari alla tua velocità attuale, finché non le dismetti (azione bonus) o indossi armatura non adatta." },
        { level: 18, name: "Presenza Draconica", desc: "Come azione, spendendo 5 Punti Stregoneria, esali un'aura di timore reverenziale o di terrore per 1 minuto (TS di Saggezza per resistere)." },
      ],
    },
    {
      id: "magia-selvaggia", name: "Magia Selvaggia",
      blurb: "Il caos stesso scorre attraverso la tua magia, imprevedibile e incontrollabile.",
      features: [
        { level: 1, name: "Sconvolgimento di Magia Selvaggia", desc: "Ogni volta che lanci un incantesimo da Stregone di 1° livello o superiore, il Master può far scatenare un effetto casuale sulla tabella d100 degli Sconvolgimenti: usa il tiratore qui sotto, nella scheda del personaggio, per generarne uno.", wildMagic: true },
        { level: 1, name: "Maree del Caos", desc: "Una volta per riposo lungo, ottieni vantaggio a un tiro per colpire, una prova di caratteristica o un tiro salvezza; dopo averlo usato, il tuo prossimo incantesimo da Stregone di 1° livello o superiore può scatenare uno Sconvolgimento.", resource: true },
        { level: 6, name: "Piega la Fortuna", desc: "Come reazione, spendendo 2 Punti Stregoneria, aggiungi o sottrai 1d4 al tiro per colpire, alla prova di caratteristica o al TS di una creatura che puoi vedere." },
        { level: 14, name: "Caos Controllato", desc: "Quando scateni uno Sconvolgimento di Magia Selvaggia, tiri due volte sulla tabella e scegli quale dei due effetti applicare." },
        { level: 18, name: "Bombardamento Incantato", desc: "Una volta per turno, quando tiri il massimo su un dado del danno di un tuo incantesimo da Stregone, tira di nuovo quel dado e aggiungilo al danno totale." },
      ],
    },
  ],
  chierico: [
    {
      id: "vita", name: "Dominio della Vita", blurb: "Guaritori per eccellenza, canalizzano energia vitale pura.",
      bonusProficiencies: { armor: ["Armatura pesante"] },
      features: [
        { level: 2, name: "Channel Divinity: Preservare la Vita", desc: "Come azione, ripristini un totale di 5 × il tuo livello da Chierico PF, distribuiti tra le creature entro 9 m come vuoi (nessuna può superare la metà dei PF massimi; non guarisce costrutti o non morti). In alternativa puoi sempre scegliere l'opzione base Scacciare i Non Morti." },
      ]
    },
    {
      id: "luce", name: "Dominio della Luce", blurb: "Portatori di fiamma e luce accecante contro l'oscurità.", features: [
        { level: 2, name: "Channel Divinity: Bagliore dell'Alba", desc: "Come azione, dissolvi ogni oscurità magica entro 9 m; ogni creatura ostile in quel raggio subisce 2d10 + il tuo livello da Chierico danni radiosi (TS di Costituzione dimezza). In alternativa puoi sempre scegliere l'opzione base Scacciare i Non Morti." },
      ]
    },
    {
      id: "guerra", name: "Dominio della Guerra", blurb: "Divinità della battaglia che guidano la lama e lo scudo dei loro fedeli.",
      bonusProficiencies: { armor: ["Armatura pesante"], weapons: ["Armi da guerra"] },
      features: [
        { level: 2, name: "Channel Divinity: Colpo Guidato", desc: "Quando effettui un tiro per colpire, puoi usare Channel Divinity per ottenere +10 al tiro. In alternativa puoi sempre scegliere l'opzione base Scacciare i Non Morti." },
        { level: 6, name: "Channel Divinity: Benedizione del Dio della Guerra", desc: "Come reazione, quando una creatura entro 9 m effettua un tiro per colpire, puoi usare Channel Divinity per darle +10 al tiro." },
      ]
    },
    {
      id: "tempesta", name: "Dominio della Tempesta", blurb: "Servitori delle divinità del cielo, del tuono e del mare in tempesta.",
      bonusProficiencies: { armor: ["Armatura pesante"], weapons: ["Armi da guerra"] },
      features: [
        { level: 2, name: "Channel Divinity: Ira Distruttiva", desc: "Quando tiri i danni per un incantesimo del Dominio della Tempesta o per Percuotere i Tuoni, puoi usare Channel Divinity per massimizzare quei dadi. In alternativa puoi sempre scegliere l'opzione base Scacciare i Non Morti." },
      ]
    },
    {
      id: "natura", name: "Dominio della Natura", blurb: "Custodi del mondo naturale, alleati di bestie e piante.",
      bonusProficiencies: { armor: ["Armatura pesante"] },
      proficiencyChoices: [{ key: "sub-chierico-natura-abilita", label: "Abilità (Discepolo della Natura)", type: "skill", count: 1, options: ["Addestrare Animali", "Natura", "Sopravvivenza"] }],
      features: [
        { level: 2, name: "Channel Divinity: Ammaliare Animali e Piante", desc: "Come azione, ogni bestia o pianta entro 9 m deve superare un TS di Saggezza o essere affascinata da te per 1 minuto (o finché non subisce danno). In alternativa puoi sempre scegliere l'opzione base Scacciare i Non Morti." },
      ]
    },
    {
      id: "conoscenza", name: "Dominio della Conoscenza", blurb: "Depositari di sapere antico e segreti dimenticati.",
      proficiencyChoices: [
        { key: "sub-chierico-conoscenza-abilita", label: "Abilità (Benedizioni della Conoscenza)", type: "skill", count: 2, options: ["Arcano", "Storia", "Natura", "Religione"] },
        { key: "sub-chierico-conoscenza-lingue", label: "Lingue aggiuntive", type: "language", count: 2, options: LANGUAGES },
      ],
      features: [
        { level: 2, name: "Channel Divinity: Sapienza degli Evi", desc: "Come azione, ottieni competenza con un'abilità o strumento a tua scelta per 10 minuti. In alternativa puoi sempre scegliere l'opzione base Scacciare i Non Morti." },
      ]
    },
    {
      id: "inganno", name: "Dominio dell'Inganno", blurb: "Seguaci di divinità ingannatrici, maestri dell'illusione.", features: [
        { level: 2, name: "Channel Divinity: Invocare la Duplicità", desc: "Come azione, crei un'illusione di te stesso in uno spazio libero entro 9 m, che dura 1 minuto; puoi vedere e parlare attraverso di essa e spostarla di 9 m come azione bonus. In alternativa puoi sempre scegliere l'opzione base Scacciare i Non Morti." },
      ]
    },
    {
      id: "morte", name: "Dominio della Morte", blurb: "Custodi oscuri della fine di ogni vita.",
      bonusProficiencies: { weapons: ["Armi da guerra"] },
      features: [
        { level: 2, name: "Channel Divinity: Tocco della Morte", desc: "Quando infliggi danno con un attacco in mischia, puoi usare Channel Divinity per infliggere danno necrotico aggiuntivo pari a 5 + il doppio del tuo livello da Chierico. In alternativa puoi sempre scegliere l'opzione base Scacciare i Non Morti." },
      ]
    },
  ],
  paladino: [
    {
      id: "devozione", name: "Giuramento di Devozione", blurb: "Onore, coraggio e devozione assoluta agli ideali della cavalleria.", features: [
        { level: 3, name: "Channel Divinity: Arma Sacra", desc: "Come azione bonus, per 1 minuto aggiungi il tuo mod. Carisma ai tiri per colpire con un'arma che stai impugnando; l'arma emette luce e diventa magica se non lo è già." },
        { level: 3, name: "Channel Divinity: Bandire il Male e il Bene", desc: "Come azione, ogni aberrazione, celestiale, elementale, fata, demone o non morto entro 9 m che ti veda/senta deve superare un TS di Saggezza o essere bandita (immobilizzata e incapace di agire) per 1 minuto." },
        { level: 7, name: "Aura di Devozione", desc: "Tu e gli alleati entro 3 m (9 m dal 18° livello) non potete essere affascinati finché sei cosciente." },
        { level: 15, name: "Purezza di Spirito", desc: "Sei permanentemente sotto l'effetto dell'incantesimo Protezione dal Male e dal Bene." },
        { level: 20, name: "Aureola Sacra", desc: "Come azione, per 1 minuto emani un'aura di luce sacra: le creature ostili entro 9 m sono accecate e subiscono danno radioso quando finiscono il turno nell'aura o vi entrano; gli alleati ottengono vantaggio ai TS contro incantesimi e altri effetti magici lanciati da creature ostili." },
      ]
    },
    {
      id: "antichi", name: "Giuramento degli Antichi", blurb: "Difensori della luce, della bellezza e della vita contro le tenebre.", features: [
        { level: 3, name: "Channel Divinity: Ira della Natura", desc: "Come azione, viticci spettrali afferrano una creatura entro 3 m: TS di Forza o Destrezza (a tua scelta) o essere trattenuta per 1 minuto (può ripetere il TS a ogni suo turno)." },
        { level: 3, name: "Channel Divinity: Bandire il Senza Fede", desc: "Come azione, ogni fata o demone entro 9 m che ti veda/senta deve superare un TS di Saggezza o essere bandito per 1 minuto." },
        { level: 7, name: "Aura di Salvaguardia", desc: "Tu e gli alleati entro 3 m (9 m dal 18° livello) avete resistenza al danno da incantesimi." },
        { level: 15, name: "Sentinella Immortale", desc: "Una volta per riposo lungo, se il danno ti porterebbe a 0 PF ma non ti uccide all'istante, scendi invece a 1 PF; inoltre non invecchi più." },
        { level: 20, name: "Campione Anziano", desc: "Come azione, per 1 minuto assumi una forma ancestrale: rigeneri PF a ogni tuo turno, i tuoi incantesimi di 5° livello o inferiore costano un'azione in meno da lanciare, e le creature ostili entro 3 m hanno svantaggio ai TS contro i tuoi incantesimi ed effetti da Paladino." },
      ]
    },
    {
      id: "vendetta", name: "Giuramento di Vendetta", blurb: "Punire i colpevoli, a qualunque costo personale.", features: [
        { level: 3, name: "Channel Divinity: Abiurare il Nemico", desc: "Come azione, una creatura entro 18 m che puoi vedere deve superare un TS di Saggezza o essere spaventata per 1 minuto (i non morti/demoni sono anche paralizzati con un 1 naturale sul tiro)." },
        { level: 3, name: "Channel Divinity: Voto di Inimicizia", desc: "Come azione bonus, ottieni vantaggio ai tiri per colpire contro una creatura entro 9 m per 1 minuto." },
        { level: 7, name: "Vendicatore Implacabile", desc: "Quando colpisci con un attacco di opportunità, puoi muoverti fino a metà della tua velocità come parte della stessa reazione." },
        { level: 15, name: "Anima della Vendetta", desc: "Quando una creatura bersaglio del tuo Voto di Inimicizia effettua un attacco, puoi usare la reazione per attaccarla in mischia se è a portata." },
        { level: 20, name: "Angelo Vendicatore", desc: "Come azione, per 1 ora ti spuntano ali (velocità di volo pari alla tua velocità) e irradi un'aura di terrore: le creature ostili entro 9 m che ti vedono devono superare un TS di Saggezza o essere spaventate per 1 minuto." },
      ]
    },
  ],
  warlock: [
    {
      id: "arcifatato", name: "Patto dell'Arcifatato", blurb: "Un patrono fatato ti dona incanto e capacità di fuga.", features: [
        { level: 1, name: "Presenza Fatata", desc: "Come azione, un cono di 9 m o un cerchio di 3 m centrato su di te: ogni creatura al suo interno deve superare un TS di Saggezza o essere affascinata o spaventata (a tua scelta) fino alla fine del tuo prossimo turno. Una volta per riposo breve o lungo.", resource: true },
        { level: 6, name: "Fuga Nebbiosa", desc: "Come reazione quando subisci danno, ti teletrasporti fino a 18 m in uno spazio libero che puoi vedere e diventi invisibile fino all'inizio del tuo prossimo turno. Una volta per riposo breve o lungo.", resource: true },
        { level: 10, name: "Difese Ammalianti", desc: "Sei immune a essere affascinato; quando una creatura tenta di affascinarti, puoi usare la reazione per tentare di affascinarla a tua volta." },
        { level: 14, name: "Delirio Oscuro", desc: "Come azione, affascini o spaventi una creatura entro 18 m in uno stato onirico e illusorio per 1 minuto (TS di Saggezza nega). Una volta per riposo breve o lungo.", resource: true },
      ]
    },
    {
      id: "demone", name: "Patto del Demone", blurb: "Un patrono infernale ti dona resilienza e crudeltà.", features: [
        { level: 1, name: "Benedizione dell'Essere Oscuro", desc: "Quando riduci a 0 PF una creatura ostile, guadagni PF temporanei pari al tuo mod. Carisma + il tuo livello da Warlock (minimo 1)." },
        { level: 6, name: "Fortuna dell'Essere Oscuro", desc: "Puoi aggiungere 1d10 a una prova di caratteristica o a un tiro salvezza che stai per effettuare. Una volta per riposo breve o lungo.", resource: true },
        { level: 10, name: "Resilienza Infernale", desc: "Dopo ogni riposo breve o lungo, scegli un tipo di danno: ottieni resistenza a quel tipo di danno fino al riposo successivo." },
        { level: 14, name: "Scaraventare all'Inferno", desc: "Quando colpisci una creatura con un attacco, puoi bandirla istantaneamente nei Piani Inferiori: subisce 10d10 danni psichici e viene poi rimandata dove si trovava. Una volta per riposo lungo.", resource: true },
      ]
    },
    {
      id: "grande-antico", name: "Patto del Grande Antico", blurb: "Un patrono alieno e incomprensibile ti dona conoscenze proibite.", features: [
        { level: 1, name: "Mente Risvegliata", desc: "Puoi comunicare telepaticamente con qualsiasi creatura entro 9 m che conosca almeno una lingua." },
        { level: 6, name: "Barriera Entropica", desc: "Come reazione quando una creatura entro 3 m effettua un attacco contro di te, imponi svantaggio al tiro; se manca, il tuo prossimo attacco contro di essa ha vantaggio. Una volta per riposo breve o lungo.", resource: true },
        { level: 10, name: "Scudo del Pensiero", desc: "Hai resistenza al danno psichico; quando una creatura legge la tua mente o ti infligge danno psichico, essa subisce lo stesso danno che infliggerebbe a te." },
        { level: 14, name: "Creare Schiavo", desc: "Toccando un umanoide incapacitato, puoi affascinarlo permanentemente e stabilire un legame telepatico con lui." },
      ]
    },
  ],
  druido: [
    { id: "artico", name: "Circolo della Terra — Artico", blurb: "Custode delle terre gelate.", features: DRUID_CIRCLE_LAND_FEATURES },
    { id: "costa", name: "Circolo della Terra — Costa", blurb: "Custode delle rive e delle acque.", features: DRUID_CIRCLE_LAND_FEATURES },
    { id: "deserto", name: "Circolo della Terra — Deserto", blurb: "Custode delle sabbie e delle terre aride.", features: DRUID_CIRCLE_LAND_FEATURES },
    { id: "foresta", name: "Circolo della Terra — Foresta", blurb: "Custode dei boschi e delle radure.", features: DRUID_CIRCLE_LAND_FEATURES },
    { id: "prateria", name: "Circolo della Terra — Prateria", blurb: "Custode delle grandi pianure.", features: DRUID_CIRCLE_LAND_FEATURES },
    { id: "montagna", name: "Circolo della Terra — Montagna", blurb: "Custode delle vette rocciose.", features: DRUID_CIRCLE_LAND_FEATURES },
    { id: "palude", name: "Circolo della Terra — Palude", blurb: "Custode degli acquitrini e delle paludi.", features: DRUID_CIRCLE_LAND_FEATURES },
    { id: "sottosuolo", name: "Circolo della Terra — Sottosuolo", blurb: "Custode delle profondità sotterranee.", features: DRUID_CIRCLE_LAND_FEATURES },
    {
      id: "circolo-luna", name: "Circolo della Luna", blurb: "Guerrieri mutaforma che portano la furia della natura selvaggia in prima persona, in combattimento.", features: [
        { level: 2, name: "Forma Selvaggia in Combattimento", desc: "Puoi assumere Forma Selvaggia come azione bonus invece che come azione; mentre sei trasformato, puoi usare un'azione bonus e spendere uno slot incantesimo per recuperare PF pari a 1d8 per livello dello slot." },
        { level: 2, name: "Forme del Circolo", desc: "Puoi assumere forma di bestie con GS fino a 1 già dal 2° livello (anziché GS 1/4-1/2 della Forma Selvaggia base), a prescindere dal tuo livello da Druido." },
        { level: 6, name: "Colpo Primordiale", desc: "I tuoi attacchi senza armi in Forma Selvaggia sono considerati magici ai fini del superamento di resistenze e immunità al danno." },
        { level: 10, name: "Forma Selvaggia Elementale", desc: "Spendendo due usi di Forma Selvaggia, puoi trasformarti in un elementale d'aria, terra, fuoco o acqua." },
        { level: 14, name: "Mille Forme", desc: "Puoi lanciare Mutare Aspetto a volontà, senza consumare uno slot incantesimo." },
      ]
    },
  ],
};

function getSubclassOptions(clsId) {
  return SUBCLASSES[clsId] || [];
}

function getChosenSubclassId(draft, clsId) {
  if (clsId === "chierico") return draft.domainId;
  if (clsId === "paladino") return draft.oathId;
  if (clsId === "warlock") return draft.patronId;
  if (clsId === "druido") return draft.circleId;
  return draft.subclassId;
}

function getSubclass(clsId, subclassId) {
  return getSubclassOptions(clsId).find((s) => s.id === subclassId) || null;
}

function getUnlockedSubclassFeatures(clsId, subclassId, level) {
  const sub = getSubclass(clsId, subclassId);
  if (!sub) return [];
  return sub.features.filter((f) => f.level <= (level || 1)).sort((a, b) => a.level - b.level);
}

function getCritRange(clsId, subclassId, level) {
  if (clsId === "guerriero" && subclassId === "campione") {
    if ((level || 1) >= 15) return "18-20";
    if ((level || 1) >= 3) return "19-20";
  }
  return "20";
}

function getRageUses(level) {
  const lvl = level || 1;
  if (lvl >= 20) return "Illimitati";
  if (lvl >= 17) return 6;
  if (lvl >= 12) return 5;
  if (lvl >= 6) return 4;
  if (lvl >= 3) return 3;
  return 2;
}

function getKiPoints(level) {
  const lvl = level || 1;
  return lvl >= 2 ? lvl : 0;
}

function getExpertiseCount(clsId, level) {
  const lvl = level || 1;
  if (clsId === "ladro") return lvl >= 6 ? 4 : lvl >= 1 ? 2 : 0;
  if (clsId === "bardo") return lvl >= 10 ? 4 : lvl >= 2 ? 2 : 0;
  return 0;
}

/* ------------------------------- CARATTERISTICHE DI CLASSE (testuali) ------------------------------- */
// Feature base di classe (non di sottoclasse) che non sono già coperte da una risorsa
// tracciabile o da una voce numerica in "Meccaniche di classe": qui compaiono solo a scopo
// di consultazione rapida durante il gioco.
const BASE_CLASS_FEATURES = {
  barbaro: [
    { level: 1, name: "Attacco Sconsiderato", desc: "Quando effettui il tuo primo attacco nel turno, puoi decidere di attaccare in modo sconsiderato: ottieni vantaggio ai tiri per colpire in mischia con Forza, ma gli attacchi contro di te hanno vantaggio fino al tuo turno successivo." },
    { level: 2, name: "Percezione del Pericolo", desc: "Vantaggio ai tiri salvezza su Destrezza contro effetti che puoi vedere, come trappole e incantesimi, a meno che tu non sia accecato, sordo o incapace di agire." },
    { level: 7, name: "Istinto Ferino", desc: "Vantaggio ai tiri di iniziativa; se sei sorpreso e non sei incapacitato, puoi comunque agire nel tuo primo turno, ma devi entrare in Ira prima di fare altro." },
    { level: 9, name: "Critico Brutale", desc: "Puoi tirare un dado di danno extra dell'arma (poi due al 13°, tre al 17°) quando ottieni un colpo critico in mischia." },
    { level: 11, name: "Ira Instancabile", desc: "Se sei ridotto a 0 PF mentre sei in Ira e non muoia sul colpo, puoi effettuare un tiro salvezza su Costituzione (CD 10, +1 per ogni uso precedente da quando hai finito un riposo lungo); se lo superi scendi a 1 PF invece che a 0." },
    { level: 15, name: "Ira Persistente", desc: "La tua Ira non finisce anticipatamente se resti cosciente; termina solo se ti addormenti, cadi privo di sensi o scegli tu di farla finire." },
    { level: 18, name: "Fisico Prodigioso", desc: "Ottieni +4 alla Forza e Costituzione massime; il tuo massimo per queste caratteristiche diventa 24." },
    { level: 20, name: "Campione Primordiale", desc: "Diventi una vera forza della natura: Forza e Costituzione aumentano di 4 (fino a un massimo di 24)." },
  ],
  bardo: [
    { level: 2, name: "Tuttofare", desc: "Aggiungi metà del tuo bonus di competenza (arrotondato per difetto) a ogni prova di caratteristica che già non includa il bonus di competenza." },
    { level: 2, name: "Canto del Riposo", desc: "Durante un riposo breve, tu e fino a 5 alleati che ti sentono recuperate 1d6 PF extra (dado che cresce col livello) se spendete un Dado Vita." },
    { level: 3, name: "Competenza Esperta", desc: "Scegli abilità in cui sei già competente: il tuo bonus di competenza è raddoppiato per le prove con quelle abilità." },
    { level: 20, name: "Ispirazione Superiore", desc: "Se hai esaurito tutti i dadi di Ispirazione Bardica, ne recuperi uno quando tiri l'iniziativa." },
  ],
  chierico: [
    { level: 2, name: "Scacciare i Non Morti", desc: "Come opzione di Channel Divinity, ogni non morto entro 9 m che ti veda o senta deve superare un TS su Saggezza o essere Scacciato per 1 minuto (fugge da te se può)." },
    { level: 10, name: "Intervento Divino", desc: "Puoi implorare la tua divinità per un intervento miracoloso (1/riposo lungo); il DM decide l'effetto in base a tiro percentuale ≤ livello da Chierico." },
  ],
  druido: [
    { level: 18, name: "Corpo Senza Tempo", desc: "L'invecchiamento magico non ti influenza più e non puoi essere invecchiato magicamente." },
    { level: 20, name: "Arcidruido", desc: "Puoi usare la Forma Selvaggia un numero illimitato di volte; ignori inoltre le componenti verbali e somatiche dei tuoi incantesimi da Druido, purché tu non indossi armatura metallica." },
  ],
  guerriero: [
    { level: 9, name: "Indomabile (nota)", desc: "Se rilanci un TS con Indomabile, devi usare il nuovo risultato anche se peggiore." },
  ],
  ladro: [
    { level: 1, name: "Azione Scaltra", desc: "Puoi usare un'azione bonus in ogni tuo turno per Scattare, Disimpegnarti o Nasconderti." },
    { level: 5, name: "Schivata Prodigiosa", desc: "Quando un attaccante che puoi vedere ti colpisce con un attacco, puoi usare la tua reazione per dimezzare il danno subito." },
    { level: 6, name: "Competenza Esperta", desc: "Scegli altre due abilità (o una abilità e i tuoi arnesi da scasso) in cui sei competente: il bonus di competenza è raddoppiato per quelle prove." },
    { level: 7, name: "Elusione", desc: "Quando sei soggetto a un effetto che permette un TS su Destrezza per subire metà danno, non subisci alcun danno se lo superi e solo metà se lo fallisci." },
    { level: 11, name: "Talento Affidabile", desc: "Quando effettui una prova di caratteristica che aggiunge il bonus di competenza, puoi considerare un tiro di 9 o meno sul d20 come se fosse un 10." },
    { level: 14, name: "Percezione Cieca", desc: "Se riesci a sentire, sei consapevole della posizione di creature invisibili o nascoste entro 3 m da te." },
    { level: 15, name: "Mente Sfuggente", desc: "Ottieni competenza nei tiri salvezza su Saggezza." },
    { level: 18, name: "Elusione Suprema", desc: "Se un attacco ti colpirebbe mentre non sei sorpreso, puoi usare la tua reazione per ridurre il danno subito della metà del tuo livello da Ladro (minimo 0)." },
    { level: 20, name: "Colpo di Fortuna", desc: "Una volta per riposo breve o lungo, puoi trasformare un tiro fallito (per colpire, di caratteristica o TS) in un successo, oppure forzare un attaccante a rilanciare un colpo che ti ha ferito." },
  ],
  mago: [
    { level: 1, name: "Recupero Arcano", desc: "Una volta al giorno, durante un riposo breve, puoi recuperare slot incantesimo spesi per un totale di livelli pari a metà del tuo livello da Mago (arrotondato per eccesso); nessuno slot recuperato può essere di 6° livello o superiore." },
    { level: 18, name: "Padronanza degli Incantesimi", desc: "Scegli un incantesimo di 1° e uno di 2° livello dal tuo libro: puoi lanciarli a livello base senza spendere uno slot." },
    { level: 20, name: "Incantesimo Firma", desc: "Scegli due incantesimi di 3° livello dal tuo libro: puoi lanciarli una volta ciascuno gratuitamente per riposo breve, sempre come se usassi uno slot di 3° livello." },
  ],
  monaco: [
    { level: 1, name: "Arti Marziali", desc: "Con armi semplici e spade corte, e senza armi o armatura, puoi usare Destrezza al posto di Forza per colpire e danneggiare; il dado del danno non armato cresce col livello (d4→d10)." },
    { level: 2, name: "Movimento Senza Armatura", desc: "La tua velocità aumenta quando non indossi armatura né usi scudo (+3 m al 2°, valore crescente col livello)." },
    { level: 3, name: "Deviare Proiettili", desc: "Puoi usare la reazione per ridurre il danno di un attacco a distanza con arma di 1d10 + Destrezza + livello da Monaco; se lo riduci a 0 puoi afferrare il proiettile e persino rilanciarlo." },
    { level: 4, name: "Caduta Attutita", desc: "Puoi usare la reazione per ridurre a 0 il danno da caduta." },
    { level: 5, name: "Colpo Stordente", desc: "Quando colpisci una creatura con un attacco in mischia con arma, puoi spendere 1 Punto Ki per costringerla a un TS su Costituzione o essere stordita fino alla fine del tuo prossimo turno." },
    { level: 7, name: "Immobilità Mentale", desc: "Puoi usare un'azione per terminare istantaneamente un effetto su di te che ti rende spaventato o affascinato." },
    { level: 10, name: "Purezza del Corpo", desc: "Sei immune a malattie e veleni." },
    { level: 13, name: "Lingua del Sole e della Luna", desc: "Comprendi tutte le lingue parlate e puoi comunicare con qualunque creatura in grado di comprendere una lingua." },
    { level: 14, name: "Anima di Diamante", desc: "Ottieni competenza in tutti i tiri salvezza; puoi inoltre spendere 1 Punto Ki per riprovare un TS fallito." },
    { level: 15, name: "Corpo Senza Tempo", desc: "Non puoi essere invecchiato magicamente e non hai bisogno di cibo né acqua." },
    { level: 18, name: "Corpo Vuoto", desc: "Puoi spendere 4 Punti Ki per diventare invisibile per 1 minuto; puoi anche spendere 8 Punti Ki per proiettarti astralmente." },
    { level: 20, name: "Io Perfetto", desc: "Se tiri l'iniziativa senza Punti Ki rimasti, ne recuperi 4." },
  ],
  paladino: [
    { level: 6, name: "Aura di Protezione", desc: "Tu e le creature amiche entro 3 m aggiungete il vostro modificatore di Carisma (minimo +1) a ogni tiro salvezza." },
    { level: 10, name: "Aura di Coraggio", desc: "Tu e le creature amiche entro 3 m non potete essere spaventati mentre sei cosciente." },
    { level: 11, name: "Colpo Sacro", desc: "I tuoi attacchi in mischia con arma infliggono danno radioso extra pari al tuo modificatore di Carisma (minimo 1)." },
    { level: 14, name: "Toccare la Purezza", desc: "Come azione, puoi toccare una creatura e porre fine a una malattia o a un veleno che la affligge." },
    { level: 20, name: "Campione Sacro", desc: "Per 1 minuto (1/riposo lungo) ottieni vantaggio ai tiri per colpire in mischia, resistenza a tutti i danni e imponi svantaggio ai TS contro i tuoi incantesimi ai nemici entro 3 m." },
  ],
  ranger: [
    { level: 1, name: "Nemico Prescelto", desc: "Scegli un tipo di favorito: vantaggio nelle prove di Saggezza (Sopravvivenza) per rintracciarlo e nelle prove di Intelligenza per ricordare informazioni su di esso." },
    { level: 1, name: "Esploratore Nato", desc: "Scegli un tipo di terreno favorito: vari benefici mentre viaggi (velocità normale nonostante il terreno, niente essere sorpreso, tracciare al doppio della velocità, ecc.)." },
    { level: 8, name: "Andatura Silenziosa", desc: "Puoi muoverti furtivamente a velocità normale." },
    { level: 10, name: "Nascondersi alla Luce del Sole", desc: "Puoi usare la tua azione per diventare invisibile finché resti immobile, in un ambiente naturale non urbano." },
    { level: 14, name: "Sensi Selvaggi", desc: "Percepisci la posizione di ogni creatura invisibile entro 9 m, purché non sia dietro copertura totale." },
    { level: 18, name: "Sterminatore di Nemici", desc: "Sei incredibilmente veloce contro il tuo Nemico Prescelto: aggiungi il tuo modificatore di Saggezza a un tiro per colpire contro di lui ogni turno." },
  ],
  stregone: [
    { level: 20, name: "Anima di Stregoneria", desc: "Guadagni resistenza ai danni da forza, immunità agli effetti di invecchiamento magico e non hai più bisogno di aria per respirare." },
  ],
  warlock: [
    { level: 1, name: "Magia del Patto", desc: "I tuoi slot incantesimo (Patto Magico) sono sempre dello stesso livello massimo e si recuperano con un riposo breve, invece che lungo." },
    { level: 20, name: "Signore Supremo", desc: "Puoi lanciare un incantesimo di 6°, 7°, 8° o 9° livello (a scelta tra quelli conosciuti tramite Arcano Mistico) senza spendere alcuna risorsa; poi devi finire un riposo lungo prima di poterlo rifare." },
  ],
};
function getBaseClassFeatures(clsId, level) {
  const list = BASE_CLASS_FEATURES[clsId] || [];
  return list.filter((f) => f.level <= (level || 1));
}

function getBaseClassResources(clsId, level, mysticArcanum, chaMod) {
  const resources = [];
  const lvl = level || 1;
  if (clsId === "guerriero") {
    resources.push({ key: "scatto-avanti", name: `Scatto in Avanti (recupera 1d10+${lvl} PF)`, max: 1, resetOn: "short" });
    if (lvl >= 2) {
      resources.push({ key: "azione-impetuosa", name: "Azione Impetuosa (azione extra nel turno)", max: lvl >= 17 ? 2 : 1, resetOn: "short" });
    }
    if (lvl >= 9) {
      resources.push({ key: "indomabile", name: "Indomabile (ripeti un TS fallito)", max: lvl >= 17 ? 3 : lvl >= 13 ? 2 : 1, resetOn: "long" });
    }
  }
  if (clsId === "barbaro") {
    const uses = getRageUses(level);
    resources.push({ key: "ira", name: "Usi dell'Ira", max: uses === "Illimitati" ? null : uses, resetOn: "long" });
  }
  if (clsId === "monaco") {
    const ki = getKiPoints(level);
    if (ki > 0) resources.push({ key: "ki", name: "Punti Ki", max: ki, resetOn: "short" });
  }
  if (clsId === "bardo" && lvl >= 1) {
    const die = getBardicInspirationDie(lvl);
    resources.push({ key: "ispirazione-bardica", name: `Ispirazione Bardica (${die})`, max: Math.max(1, chaMod || 0), resetOn: lvl >= 5 ? "short" : "long" });
  }
  if (clsId === "mago" && lvl >= 1) {
    resources.push({ key: "recupero-arcano", name: `Recupero Arcano (slot per un totale di ${Math.max(1, Math.ceil(lvl / 2))} livelli, max 5°)`, max: 1, resetOn: "long" });
  }
  if (clsId === "ladro" && lvl >= 20) {
    resources.push({ key: "colpo-fortuna", name: "Colpo di Fortuna", max: 1, resetOn: "short" });
  }
  if (clsId === "chierico" && lvl >= 2) {
    const uses = lvl >= 18 ? 3 : lvl >= 6 ? 2 : 1;
    resources.push({ key: "channel-divinity", name: "Channel Divinity", max: uses, resetOn: "short" });
  }
  if (clsId === "paladino" && lvl >= 3) {
    resources.push({ key: "channel-divinity", name: "Channel Divinity", max: 1, resetOn: "short" });
  }
  if (clsId === "paladino" && lvl >= 1) {
    resources.push({ key: "imposizione-mani", name: "Imposizione delle Mani", max: lvl * 5, resetOn: "long", pool: true });
    resources.push({ key: "percezione-divina", name: "Percezione Divina", max: Math.max(0, 1 + (chaMod || 0)), resetOn: "long" });
  }
  if (clsId === "druido" && lvl >= 2) {
    resources.push({ key: "forma-selvaggia", name: "Usi della Forma Selvaggia", max: 2, resetOn: "short" });
  }
  if (clsId === "warlock") {
    getUnlockedArcanumTiers(lvl).forEach((tier) => {
      if (mysticArcanum && mysticArcanum[tier]) {
        resources.push({ key: `arcano-mistico-${tier}`, name: `Arcano Mistico (${tier}° livello)`, max: 1, resetOn: "long" });
      }
    });
  }
  return resources;
}

function getSubclassResources(clsId, subclassId, level) {
  const resources = [];
  const lvl = level || 1;
  if (clsId === "guerriero" && subclassId === "maestro-di-battaglia" && lvl >= 3) {
    const count = lvl >= 15 ? 6 : lvl >= 7 ? 5 : 4;
    const die = lvl >= 18 ? "d12" : lvl >= 10 ? "d10" : "d8";
    resources.push({ key: "dadi-superiorita", name: `Dadi Superiorità (${die})`, max: count, resetOn: "short" });
  }
  if (clsId === "mago" && subclassId === "evocazione" && lvl >= 14) {
    resources.push({ key: "sovraccarico", name: "Sovraccarico (gratuito)", max: 1, resetOn: "long" });
  }
  if (clsId === "mago" && subclassId === "illusione" && lvl >= 10) {
    resources.push({ key: "se-illusorio", name: "Sé Illusorio", max: 1, resetOn: "short" });
  }
  if (clsId === "mago" && subclassId === "divinazione" && lvl >= 2) {
    resources.push({ key: "presagio", name: "Presagio (2d20 da assegnare)", max: lvl >= 14 ? 3 : 2, resetOn: "long" });
  }
  if (clsId === "mago" && subclassId === "ammaliamento" && lvl >= 6) {
    resources.push({ key: "fascino-istintivo", name: "Fascino Istintivo", max: 1, resetOn: "long" });
  }
  if (clsId === "mago" && subclassId === "trasmutazione" && lvl >= 10) {
    resources.push({ key: "mutaforma", name: "Mutaforma (Polimorfia gratuita)", max: 1, resetOn: "short" });
  }
  if (clsId === "stregone" && subclassId === "magia-selvaggia" && lvl >= 1) {
    resources.push({ key: "maree-del-caos", name: "Maree del Caos", max: 1, resetOn: "long" });
  }
  if (clsId === "warlock" && subclassId === "arcifatato") {
    if (lvl >= 1) resources.push({ key: "presenza-fatata", name: "Presenza Fatata", max: 1, resetOn: "short" });
    if (lvl >= 6) resources.push({ key: "fuga-nebbiosa", name: "Fuga Nebbiosa", max: 1, resetOn: "short" });
    if (lvl >= 14) resources.push({ key: "delirio-oscuro", name: "Delirio Oscuro", max: 1, resetOn: "short" });
  }
  if (clsId === "warlock" && subclassId === "demone") {
    if (lvl >= 6) resources.push({ key: "fortuna-essere-oscuro", name: "Fortuna dell'Essere Oscuro", max: 1, resetOn: "short" });
    if (lvl >= 14) resources.push({ key: "scaraventare-inferno", name: "Scaraventare all'Inferno", max: 1, resetOn: "long" });
  }
  if (clsId === "warlock" && subclassId === "grande-antico" && lvl >= 6) {
    resources.push({ key: "barriera-entropica", name: "Barriera Entropica", max: 1, resetOn: "short" });
  }
  return resources;
}

function getAllClassResources(clsId, subclassId, level, mysticArcanum, chaMod) {
  return [...getBaseClassResources(clsId, level, mysticArcanum, chaMod), ...getSubclassResources(clsId, subclassId, level)];
}

const BACKGROUNDS = [
  {
    id: "accolito", name: "Accolito", skills: ["Intuizione", "Religione"], equipment: ["Un simbolo sacro", "Un libro di preghiere", "5 bastoncini d'incenso", "Una veste", "Un set da vestire comune", "Una borsa con 15 mo"], feature: "Rifugio dei Fedeli", featureDesc: "Trova vitto e alloggio gratuiti presso i templi del proprio culto.",
    proficiencyChoices: [{ key: "bg-accolito-lingue", label: "Lingue aggiuntive", type: "language", count: 2, options: LANGUAGES }],
    personalityTraits: ["Cito scritture e parabole per quasi ogni occasione.", "Vedo segni della volontà divina in ogni evento, per quanto piccolo.", "Ho una fede incrollabile e cerco di trasmetterla agli altri.", "Tratto con gentilezza chiunque, a prescindere da come mi tratta."],
    ideals: ["Tradizione: I costumi antichi della mia fede vanno preservati.", "Carità: Aiuto chi ha bisogno, qualunque sia il costo per me.", "Fede: Confido che la mia divinità agisca attraverso di me.", "Conoscenza: I segreti del divino attendono chi li cerca con devozione."],
    bonds: ["Darei la vita per proteggere un membro del mio ordine.", "Cerco di ritrovare un antico testo sacro andato perduto.", "Il mio tempio d'origine è stato distrutto: voglio vederlo ricostruito.", "Devo tutto al sacerdote che mi ha cresciuto."],
    flaws: ["Giudico severamente chi non condivide la mia fede.", "Seguirei un ordine della mia gerarchia anche se lo ritenessi sbagliato.", "Nutro un segreto risentimento verso l'autorità religiosa.", "Sono facilmente manipolato da chi millanta pietà."],
  },
  {
    id: "criminale", name: "Criminale", skills: ["Inganno", "Furtività"], equipment: ["Un piede di porco", "Vestiti scuri comuni con cappuccio", "Una borsa con 15 mo"], feature: "Contatto Criminale", featureDesc: "Ha un referente affidabile nel sottobosco criminale locale.",
    bonusProficiencies: { tools: ["Strumenti da scasso"] },
    proficiencyChoices: [{ key: "bg-criminale-gioco", label: "Set di gioco", type: "tool", count: 1, options: GAMING_SETS }],
    personalityTraits: ["Ho sempre un piano di riserva per quando le cose vanno male.", "Resto calmo, non importa quale sia la situazione: sono abituato a mentire.", "Il pericolo mi eccita.", "Mi fido solo di chi ha già dimostrato di potersi fidare di me."],
    ideals: ["Onore: Non tradisco mai chi lavora con me.", "Libertà: Le catene sono fatte per essere spezzate.", "Avidità: Farò qualunque cosa per un guadagno abbastanza grande.", "Redenzione: C'è speranza di cambiare, per chiunque."],
    bonds: ["Sto pagando un debito che non posso ripagare.", "Qualcuno che amo è ancora impigliato nella mia vecchia vita criminale.", "Mi hanno incastrato per un crimine che non ho commesso e voglio giustizia.", "La mia banda è la mia unica vera famiglia."],
    flaws: ["Se c'è un bottino nelle vicinanze, lo voglio.", "Quando qualcuno mi fa un torto, non lo dimentico né lo perdono.", "Non riesco a resistere a una sfida facile.", "Divento nervoso quando la legge è nei paraggi, anche se sono innocente."],
  },
  {
    id: "eroe-gente", name: "Eroe Popolare", skills: ["Addestrare Animali", "Sopravvivenza"], equipment: ["Un set da artigiano", "Una pala", "Una pentola di ferro", "Vestiti comuni", "Una borsa con 10 mo"], feature: "Ospitalità Rustica", featureDesc: "La gente comune gli offre rifugio e aiuto discreto quando necessario.",
    bonusProficiencies: { other: ["Veicoli terrestri"] },
    proficiencyChoices: [{ key: "bg-eroe-gente-artigiano", label: "Strumenti da artigiano", type: "tool", count: 1, options: ARTISAN_TOOLS }],
    personalityTraits: ["Giudico le persone dalle loro azioni, non dalle loro parole.", "Se qualcuno ha bisogno d'aiuto, non chiedo mai nulla in cambio.", "Sono ingenuo e mi fido troppo facilmente.", "Lavoro sodo perché mi hanno insegnato che è l'unico modo per farcela."],
    ideals: ["Rispetto: La gente comune merita rispetto quanto i nobili.", "Uguaglianza indipendentemente da chi si è o si è nati.", "Libertà: I tiranni non devono opprimere il popolo.", "Destino: Nulla mi accade per caso, tutto ha uno scopo."],
    bonds: ["Un contadino locale mi ha aiutato quando ero nel bisogno: ora è come una famiglia.", "Combatto per chi non può difendersi da solo.", "Il mio villaggio contava su di me e l'ho deluso: voglio rimediare.", "Un tiranno locale mi ha rovinato la vita e voglio vederlo cadere."],
    flaws: ["Il potere delle persone importanti mi intimidisce.", "Non lascerei mai passare l'occasione di fare soldi facili, anche disonestamente.", "Sono più a mio agio con gli animali che con le persone.", "Sono ancora ingenuo riguardo al mondo al di fuori del mio villaggio."],
  },
  {
    id: "nobile", name: "Nobile", skills: ["Storia", "Persuasione"], equipment: ["Vestiti eleganti", "Un anello con sigillo", "Una pergamena di lignaggio", "Una borsa con 25 mo"], feature: "Posizione Privilegiata", featureDesc: "È accolto nell'alta società e ottiene udienze con i nobili locali.",
    proficiencyChoices: [
      { key: "bg-nobile-gioco", label: "Set di gioco", type: "tool", count: 1, options: GAMING_SETS },
      { key: "bg-nobile-lingua", label: "Lingua aggiuntiva", type: "language", count: 1, options: LANGUAGES },
    ],
    personalityTraits: ["Il mio linguaggio raffinato mi fa sembrare colto anche quando non lo sono.", "Sono abituato a farmi ubbidire e mi irrito quando qualcuno mi ignora.", "Ho un debole per il gioco d'azzardo, il vino o entrambi.", "Ricordo sempre nomi e volti, e non dimentico chi mi ha aiutato o insultato."],
    ideals: ["Nobile Obbligo: È mio dovere prendermi cura di chi ha meno di me.", "Ambizione: Voglio ottenere un titolo tutto mio.", "Famiglia: Il sangue viene prima di ogni altra cosa.", "Potere: Se ottengo abbastanza potere, potrò cambiare le cose in meglio."],
    bonds: ["Il mio buon nome vale più della mia vita.", "Devo dimostrare di meritare il mio titolo, non solo di averlo ereditato.", "Difenderei a costo della vita quelli sotto la mia protezione.", "Ho un rivale di lignaggio che disprezza tutto ciò che rappresento."],
    flaws: ["Penso che gli altri esistano per servirmi.", "Il mio orgoglio a volte offusca il mio giudizio.", "Disprezzo chi considero di rango inferiore.", "Farei qualunque cosa per proteggere il buon nome della mia famiglia, anche mentire."],
  },
  {
    id: "saggio", name: "Sapiente", skills: ["Arcano", "Storia"], equipment: ["Una bottiglia d'inchiostro", "Una penna", "Un piccolo coltello", "Una lettera di un collega defunto", "Vestiti comuni", "Una borsa con 10 mo"], feature: "Ricercatore", featureDesc: "Sa dove cercare quasi ogni informazione, anche se non la conosce già.",
    proficiencyChoices: [{ key: "bg-saggio-lingue", label: "Lingue aggiuntive", type: "language", count: 2, options: LANGUAGES }],
    personalityTraits: ["Cito fonti e trattati anche quando nessuno me lo chiede.", "Sono affascinato da un particolare campo di studio, quasi ossessivamente.", "Trovo il modo di ricondurre ogni discussione a un argomento che conosco bene.", "Prendo appunti compulsivamente su qualunque cosa mi circondi."],
    ideals: ["Conoscenza: I segreti del mondo vanno scoperti e custoditi.", "Verità: I fatti contano più di ciò che le persone vogliono sentirsi dire.", "Autoperfezionamento: Lo studio è la via per diventare migliori.", "Bene Superiore: La mia conoscenza deve servire il bene di tutti."],
    bonds: ["Il libro che sto cercando potrebbe portare grande sapienza o grande rovina.", "Devo tutto alla biblioteca o all'accademia che mi ha formato.", "Sto seguendo le tracce di un maestro scomparso.", "Voglio dimostrare una teoria che gli altri studiosi deridono."],
    flaws: ["Cito fonti errate con assoluta sicurezza, senza accorgermene.", "Sono ossessionato da un mistero irrisolto: non riesco a lasciarlo andare.", "Sottovaluto pericoli pratici davanti a un enigma intellettuale.", "Ho poca pazienza per chi non condivide il mio amore per lo studio."],
  },
  {
    id: "soldato", name: "Soldato", skills: ["Atletica", "Intimidire"], equipment: ["L'insegna del proprio grado", "Un trofeo da un nemico caduto", "Un set di dadi", "Vestiti comuni", "Una borsa con 10 mo"], feature: "Grado Militare", featureDesc: "I soldati fedeli al suo ex esercito lo riconoscono e rispettano il grado.",
    bonusProficiencies: { other: ["Veicoli terrestri"] },
    proficiencyChoices: [{ key: "bg-soldato-gioco", label: "Set di gioco", type: "tool", count: 1, options: GAMING_SETS }],
    personalityTraits: ["Affronto i problemi in modo diretto, quasi mai con diplomazia.", "Ho una battuta pronta per stemperare la tensione, anche nei momenti peggiori.", "Sono spietatamente pragmatico sul campo di battaglia.", "Mi metto sempre al servizio di chi è più debole nel gruppo."],
    ideals: ["Grande Bene: I nostri sacrifici sono nulla se avvantaggiano molti.", "Responsabilità: Faccio ciò che mi viene ordinato per il bene della causa.", "Indipendenza: Ho imparato a contare solo su me stesso in guerra.", "Vivere e Lasciar Vivere: Le battaglie inutili non giovano a nessuno."],
    bonds: ["Darei la vita per proteggere i soldati con cui ho servito.", "Il mio equipaggiamento è tutto ciò che mi resta della mia vita precedente.", "Mi manca la guerra: la vita civile mi sembra vuota.", "Un ufficiale mi ha tradito in battaglia e voglio giustizia."],
    flaws: ["Ho incubi ricorrenti legati alla guerra e faccio fatica a dormire.", "Ho un temperamento facile all'ira in situazioni di stress.", "Ho difficoltà a fidarmi di chi non ha mai prestato servizio.", "Bevo troppo per dimenticare ciò che ho visto."],
  },
  {
    id: "marinaio", name: "Marinaio", skills: ["Atletica", "Percezione"], equipment: ["Un bastone", "15 metri di corda di seta", "Un portafortuna", "Vestiti comuni", "Una borsa con 10 mo"], feature: "Contatti nei Porti", featureDesc: "Trova rapidamente informazioni e passaggi nelle città portuali.",
    bonusProficiencies: { tools: ["Strumenti da navigatore"], other: ["Veicoli acquatici"] },
    personalityTraits: ["Il mio linguaggio è colorito, anche in compagnia poco adatta.", "Divento irrequieto se resto a terra troppo a lungo.", "Sono superstizioso riguardo a maree, venti e presagi.", "Racconto storie di mare esagerate ad ogni occasione."],
    ideals: ["Rispetto: L'equipaggio si sostiene a vicenda, o affonda insieme.", "Libertà: Il mare non conosce padroni.", "Maestria: Voglio essere il miglior marinaio che le onde abbiano mai visto.", "Gente: Le persone comuni, non i governanti, fanno la vera differenza."],
    bonds: ["Darei la vita per il mio equipaggio.", "Sto cercando un tesoro leggendario nascosto in mare aperto.", "Devo tornare a saldare un debito d'onore in un porto lontano.", "La mia nave è tutto ciò che mi resta di un tempo felice."],
    flaws: ["Non resisto alla tentazione di un bottino facile.", "Ho scommesso e perso più di quanto potessi permettermi, più di una volta.", "Reagisco in modo eccessivo se qualcuno mette in dubbio il mio coraggio.", "Ho lasciato dei conti in sospeso in troppi porti."],
  },
  {
    id: "ciarlatano", name: "Ciarlatano", skills: ["Inganno", "Rapidità di Mano"], equipment: ["Un set da travestimento", "Strumenti per falsificare documenti", "Vestiti eleganti", "Una borsa con 15 mo"], feature: "Falsa Identità", featureDesc: "Possiede una seconda identità completa di documenti e recapiti.",
    bonusProficiencies: { tools: ["Kit da travestimento", "Kit da falsario"] },
    personalityTraits: ["Riesco a sembrare sincero anche quando sto mentendo spudoratamente.", "Ho una battuta o un aneddoto pronto per ogni situazione sociale.", "Studio gli altri per capire cosa vogliono sentirsi dire.", "Cambio accento e portamento a seconda di chi ho davanti."],
    ideals: ["Indipendenza: Nessuno mi dice come vivere.", "Fascino: Chi non riesce a sedurre una stanza non merita di comandarla.", "Redenzione: Ogni truffatore può, un giorno, diventare onesto.", "Avidità: Punto sempre al guadagno più grande possibile."],
    bonds: ["Una vecchia truffa è andata storta e qualcuno ne ha pagato le conseguenze al posto mio.", "Sto cercando di riscattarmi agli occhi di chi ho tradito.", "Ho un socio in affari poco puliti a cui devo lealtà.", "Un'identità falsa che uso è diventata più reale di quella vera."],
    flaws: ["Non riesco a resistere a un facile raggiro, anche quando è rischioso.", "Le persone che ho truffato in passato potrebbero riconoscermi in qualsiasi momento.", "Sono convinto di essere più furbo di chiunque altro, e questo mi rende avventato.", "Mento anche quando dire la verità sarebbe più semplice."],
  },
  {
    id: "artigiano-gilda", name: "Artigiano di Gilda", skills: ["Intuizione", "Persuasione"], equipment: ["Un set di strumenti da artigiano (a scelta)", "Una lettera di presentazione della gilda", "Un set di vestiti da viaggio", "Una borsa con 15 mo"], feature: "Membro di Gilda", featureDesc: "La sua gilda gli offre vitto, alloggio e sostegno politico nelle città in cui è presente, in cambio del rispetto delle sue regole e di una quota periodica.",
    proficiencyChoices: [
      { key: "bg-artigiano-gilda-artigiano", label: "Strumenti da artigiano", type: "tool", count: 1, options: ARTISAN_TOOLS },
      { key: "bg-artigiano-gilda-lingua", label: "Lingua aggiuntiva", type: "language", count: 1, options: LANGUAGES },
    ],
    personalityTraits: ["Giudico gli altri artigiani dalla qualità del loro lavoro, non dalle loro parole.", "Sono orgoglioso del mio mestiere fino quasi all'arroganza.", "Tratto ogni contratto come sacro.", "Ho un occhio attento per ogni dettaglio, anche il più piccolo."],
    ideals: ["Comunità: È dovere di tutti sostenere la propria gilda.", "Maestria: Il buon lavoro parla da sé.", "Prosperità: Il commercio onesto arricchisce tutti, non solo pochi.", "Ambizione: Voglio arrivare a guidare la mia gilda, un giorno."],
    bonds: ["La mia gilda mi ha dato tutto quello che ho: le devo lealtà.", "Sto cercando di riscattare il buon nome della mia famiglia nel mio mestiere.", "Un rivale di bottega ha rubato una mia idea e voglio giustizia.", "Sto risparmiando per aprire una bottega tutta mia."],
    flaws: ["Sono disposto a piegare le regole della gilda se il guadagno è abbastanza grande.", "Detesto la concorrenza sleale al punto da agire d'impulso.", "Sono ossessionato dal perfezionismo, a scapito della rapidità.", "Mi fido troppo di chi parla la lingua del commercio."],
  },
  {
    id: "eremita", name: "Eremita", skills: ["Medicina", "Religione"], equipment: ["Una cassa di pergamene con appunti di studio", "Una coperta invernale", "Un set di vestiti comuni", "Un kit da erborista", "Una borsa con 5 mo"], feature: "Scoperta", featureDesc: "Il lungo isolamento gli ha rivelato una verità straordinaria, il cui significato e la cui portata sono ancora da comprendere appieno.",
    bonusProficiencies: { tools: ["Kit da erborista"] },
    proficiencyChoices: [{ key: "bg-eremita-lingua", label: "Lingua aggiuntiva", type: "language", count: 1, options: LANGUAGES }],
    personalityTraits: ["Sono a disagio tra la folla e cerco sempre un angolo tranquillo.", "Parlo a voce alta con me stesso per abitudine, dopo anni di solitudine.", "Vedo la saggezza nelle piccole cose che gli altri ignorano.", "Diffido delle istituzioni: preferisco la mia sola compagnia."],
    ideals: ["Verità Interiore: L'illuminazione si trova solo nel silenzio e nella riflessione.", "Grande Bene: La mia scoperta deve essere condivisa, prima o poi, con il mondo.", "Solitudine: Le risposte migliori si trovano lontano dal rumore del mondo.", "Logica: I sentimenti non devono offuscare il ragionamento."],
    bonds: ["Il luogo del mio isolamento è sacro per me e lo difenderei.", "Sto cercando qualcuno degno di ricevere ciò che ho scoperto.", "Un evento del mio passato mi ha spinto a fuggire dal mondo, e ancora mi perseguita.", "Devo la vita a chi mi ha ospitato durante il mio isolamento."],
    flaws: ["Fatico enormemente a fidarmi di sconosciuti.", "La mia scoperta mi ha reso ossessivo: la antepongo a tutto il resto.", "Ho perso familiarità con le usanze sociali del mondo che ho lasciato.", "Sono convinto che la mia visione sia l'unica verità possibile."],
  },
  {
    id: "forestiero", name: "Forestiero", skills: ["Atletica", "Sopravvivenza"], equipment: ["Un bastone da viaggio", "Una trappola da caccia", "Un trofeo di un animale ucciso personalmente", "Un set di vestiti da viaggio", "Una borsa con 10 mo"], feature: "Viandante", featureDesc: "Ricorda con precisione la disposizione del territorio attraversato e può sempre trovare cibo e acqua fresca per sé e fino a cinque compagni, se la zona ne offre.",
    proficiencyChoices: [{ key: "bg-forestiero-strumento", label: "Strumento musicale", type: "tool", count: 1, options: MUSICAL_INSTRUMENTS }],
    personalityTraits: ["Mi sento più a mio agio nella natura selvaggia che tra le mura di una città.", "Parlo poco e vado dritto al punto.", "Osservo ogni ambiente come un potenziale pericolo o una potenziale risorsa.", "Sono leale fino alla fine con chi considero parte del mio branco."],
    ideals: ["Cambiamento: Il mondo naturale è in costante mutamento, e va accettato.", "Onore: Un cacciatore rispetta sempre la preda.", "Comunione: Sono parte della natura, non il suo padrone.", "Vendetta: Chi ha devastato la mia terra pagherà."],
    bonds: ["La mia terra d'origine è stata invasa o distrutta, e voglio riprenderla.", "Sto seguendo le tracce di chi ha ucciso la mia famiglia o il mio clan.", "Proteggo un luogo selvaggio sacro per il mio popolo.", "Un animale guida mi ha risparmiato la vita: gli devo lealtà."],
    flaws: ["Non capisco né rispetto le sottigliezze dell'etichetta cittadina.", "Reagisco con violenza istintiva quando mi sento minacciato.", "Diffido profondamente di chi non ha mai vissuto fuori dalle mura di una città.", "Non so resistere alla tentazione di seguire una traccia, qualunque essa sia."],
  },
  {
    id: "intrattenitore", name: "Intrattenitore", skills: ["Acrobazia", "Intrattenere"], equipment: ["Uno strumento musicale (a scelta)", "Il favore di un ammiratore", "Un set di vestiti da intrattenitore", "Una borsa con 15 mo"], feature: "Seguito Popolare", featureDesc: "Trova sempre un luogo dove esibirsi gratuitamente in cambio di vitto e alloggio modesti, e la gente comune spesso lo protegge dalle autorità.",
    bonusProficiencies: { tools: ["Kit da travestimento"] },
    proficiencyChoices: [{ key: "bg-intrattenitore-strumento", label: "Strumento musicale", type: "tool", count: 1, options: MUSICAL_INSTRUMENTS }],
    personalityTraits: ["Non perdo mai occasione per intrattenere chi mi circonda.", "Ricordo ogni singolo elogio ricevuto, parola per parola.", "Mi annoio facilmente quando non sono al centro dell'attenzione.", "Vivo per il momento in cui il pubblico applaude."],
    ideals: ["Bellezza: Quando eseguo un'opera, creo qualcosa di senza tempo.", "Tradizione: Le storie e le canzoni antiche vanno preservate.", "Creatività: È sempre possibile trovare una soluzione originale.", "Grazia: Nessuna sfida può abbattere chi resta gentile e composto."],
    bonds: ["Il mio strumento (o il mio costume di scena) è il bene più prezioso che ho.", "Sto cercando il pubblico o il palcoscenico che darà senso alla mia carriera.", "Devo tutto alla compagnia che mi ha accolto quando non avevo nulla.", "Un rivale sul palco ha rovinato la mia reputazione, e voglio riscattarmi."],
    flaws: ["Amo troppo la fama, l'oro, il piacere fisico, o tutti e tre.", "Un mecenate potente potrebbe volermi rintracciare per motivi tutt'altro che amichevoli.", "Sono ossessionato dal giudizio del pubblico, anche a mio danno.", "Le voci sul mio conto tendono a crescere fino a diventare leggenda, e non sempre a mio favore."],
  },
  {
    id: "monello", name: "Monello", skills: ["Rapidità di Mano", "Furtività"], equipment: ["Un piccolo coltello", "Una mappa della città in cui è cresciuto", "Un topolino domestico", "Un ricordo dei genitori", "Un set di vestiti comuni", "Una borsa con 10 mo"], feature: "Segreti della Città", featureDesc: "Conosce vicoli, passaggi segreti e scorciatoie di una città: lui e chi lo accompagna possono muoversi al doppio della velocità normale mentre non sono in fretta a vista di tutti.",
    bonusProficiencies: { tools: ["Kit da travestimento", "Strumenti da scasso"] },
    personalityTraits: ["Mi nascondo prima di tutto: guardo e ascolto prima di agire.", "Non mi separo mai da un piccolo oggetto che mi ricorda casa.", "Parlo lo slang di strada e faccio fatica con i modi raffinati.", "Nascondo il cibo per abitudine, non si sa mai."],
    ideals: ["Sopravvivenza: Fai quel che devi fare per andare avanti a domani.", "Popolo: Chi vive per strada deve aiutarsi a vicenda.", "Cambiamento: Il mondo va reso più giusto per chi non ha nulla.", "Aspirazione: Voglio dimostrare di valere più di dove sono nato."],
    bonds: ["Proteggo gli altri bambini di strada che ho lasciato indietro.", "Qualcuno mi ha salvato quando ero solo per strada, e gli devo tutto.", "Sto cercando la persona che ha causato la morte dei miei genitori.", "La mia città, per quanto dura sia stata con me, è comunque casa."],
    flaws: ["Rubo per abitudine, anche quando non ne ho bisogno.", "Non mi fido delle autorità, anche quando agiscono in buona fede.", "Nascondo le mie vere emozioni dietro una battuta o un silenzio.", "Faccio fatica a restare in un posto solo troppo a lungo."],
  },
];

// Aggrega tutte le competenze "bonus" (fisse o a scelta) concesse da razza, background e
// sottoclasse: armature, armi, strumenti, lingue e abilità. Le competenze base della classe
// (armor/weapons in prosa su CLASSES) restano a parte, mostrate come testo esistente.
function getGrantedProficiencies(draft) {
  const race = RACES.find((r) => r.id === draft.raceId);
  const bg = getSelectedBackground(draft);
  const cls = CLASSES.find((c) => c.id === draft.classId);
  const subclass = cls ? getSubclass(cls.id, getChosenSubclassId(draft, cls.id)) : null;
  const profChoices = draft.profChoices || {};

  const skills = new Set(), armor = new Set(), weapons = new Set(), tools = new Set(), languages = new Set(), other = new Set();

  const addBonus = (bonus) => {
    if (!bonus) return;
    (bonus.skills || []).forEach((s) => skills.add(s));
    (bonus.armor || []).forEach((s) => armor.add(s));
    (bonus.weapons || []).forEach((s) => weapons.add(s));
    (bonus.tools || []).forEach((s) => tools.add(s));
    (bonus.languages || []).forEach((s) => languages.add(s));
    (bonus.other || []).forEach((s) => other.add(s));
  };
  const addChoices = (specs) => {
    (specs || []).forEach((spec) => {
      (profChoices[spec.key] || []).forEach((value) => {
        if (spec.type === "skill") skills.add(value);
        else if (spec.type === "language") languages.add(value);
        else if (spec.type === "tool") tools.add(value);
      });
    });
  };

  addBonus(race?.bonusProficiencies);
  addChoices(race?.proficiencyChoices);
  addBonus(bg?.bonusProficiencies);
  addChoices(bg?.proficiencyChoices);
  addBonus(subclass?.bonusProficiencies);
  addChoices(subclass?.proficiencyChoices);

  return {
    skills: [...skills], armor: [...armor], weapons: [...weapons],
    tools: [...tools], languages: [...languages], other: [...other],
  };
}

const CUSTOM_BACKGROUND_ID = "personalizzato";

// Restituisce il background selezionato: uno dei 13 predefiniti, oppure — se il giocatore ha
// scelto "Personalizzato" — un oggetto con la stessa forma costruito dai campi custom del
// draft (regola "Personalizzare un Background", PHB 2014 p.125: 2 competenze a scelta,
// strumenti/lingua, corredo ed equivalente, e un tratto di background inventato con il DM).
function getSelectedBackground(draft) {
  if (draft.backgroundId === CUSTOM_BACKGROUND_ID) {
    return {
      id: CUSTOM_BACKGROUND_ID,
      name: (draft.customBackgroundName || "").trim() || "Personalizzato",
      skills: draft.customBackgroundSkills || [],
      equipment: (draft.customBackgroundEquipment || "").split("\n").map((s) => s.trim()).filter(Boolean),
      toolsLanguages: draft.customBackgroundToolsLanguages || "",
      feature: (draft.customBackgroundFeatureName || "").trim() || "Tratto personalizzato",
      featureDesc: draft.customBackgroundFeatureDesc || "",
      custom: true,
    };
  }
  return BACKGROUNDS.find((b) => b.id === draft.backgroundId) || null;
}

// Errori di validazione specifici del background (predefinito o personalizzato). Usata sia da
// validateCharacter sia per capire se lo step "Background" del wizard è completo.
function getBackgroundValidationErrors(draft) {
  const errors = [];
  if (!draft.backgroundId) {
    errors.push("Seleziona un background.");
    return errors;
  }
  if (draft.backgroundId === CUSTOM_BACKGROUND_ID) {
    if (!(draft.customBackgroundName || "").trim()) errors.push("Dai un nome al tuo background personalizzato.");
    if ((draft.customBackgroundSkills || []).length !== 2) errors.push("Scegli 2 competenze per il background personalizzato.");
    if (!(draft.customBackgroundEquipment || "").trim()) errors.push("Indica il corredo di partenza del background personalizzato.");
    if (!(draft.customBackgroundFeatureName || "").trim() || !(draft.customBackgroundFeatureDesc || "").trim()) {
      errors.push("Descrivi il tratto (nome e testo) del background personalizzato.");
    }
  } else {
    const bg = BACKGROUNDS.find((b) => b.id === draft.backgroundId);
    (bg?.proficiencyChoices || []).forEach((spec) => {
      if (((draft.profChoices && draft.profChoices[spec.key]) || []).length !== spec.count) {
        errors.push(`Scegli ${spec.count} opzioni per "${spec.label}".`);
      }
    });
  }
  return errors;
}

/* ---------------------------------- TALENTI (FEATS) ---------------------------------- */
// Catalogo dei talenti del Manuale del Giocatore 2014. Ogni talento può opzionalmente
// concedere +1 a una caratteristica a scelta tra quelle elencate in `abilityChoice`
// (con eventuale `max`, il punteggio massimo raggiungibile tramite quel talento).
const FEATS = [
  {
    id: "vigile", name: "Vigile", prerequisite: null,
    desc: "Non puoi essere sorpreso mentre sei cosciente. Ottieni +5 all'iniziativa. Le altre creature non ottengono vantaggio sui tiri per colpire contro di te per il solo fatto di essere nascoste alla tua vista."
  },
  {
    id: "atleta", name: "Atleta", abilityChoice: { keys: ["str", "dex"], max: 20 },
    desc: "+1 a Forza o Destrezza (max 20). Alzarti da terra ti costa solo 1,5 m di movimento. Arrampicarti non ti costa movimento extra. Puoi fare una rincorsa di soli 1,5 m prima di un salto in lungo o in alto."
  },
  {
    id: "attore", name: "Attore", abilityChoice: { keys: ["cha"], max: 20 },
    desc: "+1 a Carisma (max 20). Vantaggio alle prove di Inganno e Intrattenere per far credere di essere un'altra persona. Puoi imitare la parlata o i suoni di un'altra creatura che hai sentito per almeno un minuto."
  },
  {
    id: "carica", name: "Carica", prerequisite: null,
    desc: "Dopo aver scattato (azione bonus di Scattare) e mosso almeno 3 m in linea retta, puoi effettuare un attacco con arma o spingere una creatura come azione bonus: +5 danni se colpisci, oppure la creatura viene spinta di 3 m se fallisce un TS di Forza."
  },
  {
    id: "esperto-balestre", name: "Esperto di Balestre", prerequisite: null,
    desc: "Ignori la proprietà Ricarica delle balestre con cui hai competenza. Non subisci svantaggio al tiro per colpire in mischia usando un'arma a distanza. Quando attacchi in mischia con un'arma leggera, puoi usare l'azione bonus per attaccare con una balestra a mano impugnata."
  },
  {
    id: "duellante-difensivo", name: "Duellante Difensivo", prerequisite: "Destrezza 13+",
    desc: "Quando impugni un'arma da mischia con cui hai competenza e vieni colpito da un attacco in mischia, puoi usare la reazione per aggiungere il bonus di competenza alla tua CA per quell'attacco, potenzialmente facendolo mancare."
  },
  {
    id: "combattente-due-armi", name: "Combattente con Due Armi", prerequisite: null,
    desc: "Aggiungi il modificatore di caratteristica al danno dell'attacco secondario in mano leggera. Puoi combattere con due armi anche se non sono leggere (purché non pesanti). Puoi trarre due armi leggere in un solo istante quando normalmente ne trarresti una."
  },
  {
    id: "esploratore-dungeon", name: "Esploratore di Dungeon", prerequisite: null,
    desc: "Vantaggio ai TS per evitare o resistere alle trappole. Vantaggio alle prove di caratteristica per individuare trappole nascoste. Vantaggio ai TS contro trappole magiche e resistenza ai loro danni. Cercare trappole al ritmo normale di viaggio non impone penalità."
  },
  {
    id: "resistente", name: "Resistente", abilityChoice: { keys: ["con"], max: 20 },
    desc: "+1 a Costituzione (max 20). Ogni volta che spendi un Dado Vita per recuperare punti ferita, ottieni un minimo di 2 + il doppio del tuo modificatore di Costituzione. Quando arrivi a 0 PF senza morire, riprendi conoscenza con almeno 1 PF."
  },
  {
    id: "adepto-elementale", name: "Adepto Elementale", prerequisite: "Capacità di lanciare almeno un incantesimo",
    desc: "Scegli un tipo di danno (acido, freddo, fuoco, fulmine o tuono): gli incantesimi di quel tipo ignorano la resistenza al danno del bersaglio, e i tiri di danno relativi non possono ottenere risultati minimi da 1 (contano come 2). Ripetibile per un altro tipo."
  },
  {
    id: "lottatore", name: "Lottatore", abilityChoice: { keys: ["str"], max: 20 },
    desc: "+1 a Forza (max 20). Vantaggio alle prove di Atletica per afferrare una creatura. Se hai già afferrato una creatura, l'attacco in mischia contro un altro bersaglio ha svantaggio a meno che tu non rinunci ad afferrarla."
  },
  {
    id: "maestro-armi-pesanti", name: "Maestro d'Armi Pesanti", prerequisite: "Competenza in armi da mischia pesanti",
    desc: "Colpi critici o uccisioni con arma da mischia ti concedono un'azione bonus per un attacco in mischia aggiuntivo. Puoi accettare -5 al tiro per colpire con un'arma pesante per ottenere +10 ai danni."
  },
  {
    id: "guaritore", name: "Guaritore", prerequisite: null,
    desc: "Con un kit del guaritore puoi stabilizzare una creatura morente senza consumare utilizzi del kit. Sempre con il kit, come azione puoi curare 1d6+4 PF a una creatura (più PF pari ai suoi dadi vita, spendendo un utilizzo), una volta per creatura per riposo breve o lungo."
  },
  {
    id: "armatura-leggera-esperto", name: "Esperto di Armature Leggere", prerequisite: null,
    desc: "Ottieni competenza nelle armature leggere. Se hai già Destrezza 13+ e competenza nelle armature leggere, +1 a Destrezza (max 20).", abilityChoice: { keys: ["dex"], max: 20, optional: true }
  },
  {
    id: "maestro-armatura-pesante", name: "Maestro dell'Armatura Pesante", prerequisite: "Competenza nelle armature pesanti", abilityChoice: { keys: ["str"], max: 20 },
    desc: "+1 a Forza (max 20). Mentre indossi un'armatura pesante, il danno contundente, perforante e tagliente da armi non magiche subito è ridotto di 3."
  },
  {
    id: "comandante-ispiratore", name: "Comandante Ispiratore", prerequisite: "Carisma 13+",
    desc: "Con 10 minuti di discorso motivazionale, fino a sei creature (te incluso) che possono sentirti e capirti ottengono PF temporanei pari al tuo livello + il tuo modificatore di Carisma. Una creatura non può beneficiarne di nuovo finché non fa un riposo breve o lungo."
  },
  {
    id: "mente-acuta", name: "Mente Acuta", abilityChoice: { keys: ["int"], max: 20 },
    desc: "+1 a Intelligenza (max 20). Conosci sempre l'ora esatta senza orologio. Sai sempre quanti giorni mancano al prossimo solstizio, equinozio o novilunio. Ricordi perfettamente qualsiasi cosa vista o udita negli ultimi 30 giorni."
  },
  {
    id: "armatura-leggera", name: "Armatura Leggera (Talento)", prerequisite: "Nessuna competenza nelle armature",
    desc: "Ottieni competenza nelle armature leggere. Nota: questo talento è ridondante se la classe fornisce già tale competenza."
  },
  {
    id: "linguista", name: "Linguista", abilityChoice: { keys: ["int"], max: 20 },
    desc: "+1 a Intelligenza (max 20). Impari a leggere, scrivere e parlare tre lingue a tua scelta. Puoi creare messaggi cifrati che gli altri non possono decodificare senza una chiave magica o una prova di Intelligenza (CD pari a Intelligenza + competenza)."
  },
  {
    id: "fortunato", name: "Fortunato", prerequisite: null,
    desc: "Hai 3 punti fortuna che si ricaricano dopo un riposo lungo. Puoi spenderne 1 per ottenere un d20 aggiuntivo su un tiro per colpire, prova di caratteristica o TS tuo (scegliendo quale dei due usare), oppure per far ritirare a un nemico un attacco appena effettuato contro di te."
  },
  {
    id: "cacciatore-maghi", name: "Cacciatore di Maghi", prerequisite: null,
    desc: "Vantaggio ai TS contro incantesimi lanciati da creature entro 1,5 m. Quando una creatura entro 1,5 m lancia un incantesimo, puoi usare la reazione per attaccarla in mischia. Vantaggio ai TS di Concentrazione."
  },
  {
    id: "iniziato-magia", name: "Iniziato alla Magia", prerequisite: null,
    desc: "Scegli una classe incantatrice: impari un trucchetto e un incantesimo di 1° livello di quella lista (lanciabile una volta al giorno senza slot, poi con slot se disponibili); la caratteristica da incantatore è quella della classe scelta."
  },
  {
    id: "adepto-marziale", name: "Adepto Marziale", prerequisite: null,
    desc: "Impari due manovre di combattimento a scelta tra quelle del Guerriero Cavaliere Ardente e ottieni un Dado Superiorità d6 (si ricarica dopo un riposo breve o lungo) per alimentarle."
  },
  {
    id: "maestro-armatura-media", name: "Maestro dell'Armatura Media", prerequisite: "Competenza nelle armature medie",
    desc: "Indossando un'armatura media, il bonus di Destrezza alla CA può arrivare a +3 anziché +2. Inoltre non subisci svantaggio alle prove di Furtività se indossi un'armatura media."
  },
  {
    id: "mobile", name: "Mobile", prerequisite: null,
    desc: "La tua velocità aumenta di 3 m. Scattare su terreno difficile non ti costa movimento extra. Quando attacchi in mischia un bersaglio, non subisci attacchi di opportunità da esso per il resto del turno, indipendentemente dal colpire o meno."
  },
  {
    id: "armatura-media-esperto", name: "Esperto di Armature Medie", prerequisite: null,
    desc: "Ottieni competenza nelle armature medie e negli scudi. Nota: ridondante se la classe fornisce già tali competenze."
  },
  {
    id: "combattente-cavallo", name: "Combattente a Cavallo", prerequisite: null,
    desc: "Vantaggio ai tiri per colpire contro una creatura più piccola della tua cavalcatura, se entrambe sono coinvolte nel combattimento. Puoi far bersagliare te stesso al posto della cavalcatura. Se la cavalcatura subisce un TS con effetto dimezzato, non subisce alcun danno con un successo."
  },
  {
    id: "osservatore", name: "Osservatore", abilityChoice: { keys: ["int", "wis"], max: 20 },
    desc: "+1 a Intelligenza o Saggezza (max 20). +5 alla percezione passiva. Se puoi vedere le labbra di una creatura mentre parla in una lingua che comprendi, puoi leggerle anche se non riesci a sentire."
  },
  {
    id: "maestro-arma-asta", name: "Maestro d'Arma in Asta", prerequisite: "Competenza con alabarda, lancia, falcione o bastone ferrato",
    desc: "Come azione bonus, puoi colpire con l'estremità opposta dell'arma (1d4 contundente). Mentre impugni una di queste armi, le altre creature che entrano nella tua portata subiscono un attacco di opportunità."
  },
  {
    id: "resiliente", name: "Resiliente", abilityChoice: { keys: ["str", "dex", "con", "int", "wis", "cha"], max: 20 },
    desc: "+1 a una caratteristica a scelta (max 20) e ottieni competenza nei tiri salvezza di quella caratteristica."
  },
  {
    id: "incantatore-rituale", name: "Incantatore Rituale", prerequisite: "Intelligenza o Saggezza 13+",
    desc: "Ottieni un libro dei rituali con due incantesimi rituali a scelta (da mago se hai Int 13+, altrimenti da chierico o druido) e puoi lanciarli come rituali senza prepararli né conoscerli, purché il libro sia in tuo possesso."
  },
  {
    id: "attaccante-selvaggio", name: "Attaccante Selvaggio", prerequisite: null,
    desc: "Quando tiri i dadi danno per un attacco in mischia, puoi tirare i dadi danno due volte e scegliere il totale più alto."
  },
  {
    id: "sentinella", name: "Sentinella", prerequisite: null,
    desc: "Quando colpisci con un attacco di opportunità, la velocità del bersaglio diventa 0 per il resto del turno. Le creature provocano il tuo attacco di opportunità anche se scattano. Quando una creatura entro 1,5 m attacca un bersaglio diverso da te, puoi usare la reazione per attaccarla."
  },
  {
    id: "tiratore-scelto", name: "Tiratore Scelto", prerequisite: "Competenza con armi a distanza",
    desc: "Attaccare a distanza in mischia con nemici a portata non impone svantaggio. Ignori copertura leggera e mezza copertura per il tiro per colpire. Puoi accettare -5 al tiro per colpire con un'arma a distanza per ottenere +10 ai danni."
  },
  {
    id: "maestro-scudo", name: "Maestro dello Scudo", prerequisite: "Competenza con gli scudi",
    desc: "Se attacchi nel tuo turno, puoi usare l'azione bonus per spingere con lo scudo una creatura entro 1,5 m (TS di Forza o cade prona). Puoi aggiungere il bonus dello scudo ai TS di Destrezza contro effetti che colpiscono solo te. Come reazione, puoi ottenere vantaggio a un singolo TS di Destrezza contro un effetto che colpisce anche altri."
  },
  {
    id: "talentuoso", name: "Talentuoso", prerequisite: null,
    desc: "Ottieni competenza in tre abilità o strumenti a tua scelta."
  },
  {
    id: "furtivo", name: "Furtivo", prerequisite: "Destrezza 13+",
    desc: "Puoi tentare di nasconderti quando sei solo leggermente offuscato dal rumore di fondo. Quando sei nascosto e sbagli un tiro per colpire con un attacco a distanza, non riveli la tua posizione. I rumori che fai per cercare di nasconderti sono ridotti (svantaggio alle prove di Percezione altrui basate sull'udito)."
  },
  {
    id: "cecchino-incantatore", name: "Cecchino Incantatore", prerequisite: "Capacità di lanciare almeno un incantesimo",
    desc: "La gittata degli incantesimi bersaglio a distanza raddoppia. I tuoi attacchi con incantesimo ignorano copertura leggera e mezza copertura. Impari un trucchetto a scelta che richieda un tiro per colpire con incantesimo."
  },
  {
    id: "rissaiolo-taverna", name: "Rissaiolo da Taverna", abilityChoice: { keys: ["str", "con"], max: 20 },
    desc: "+1 a Forza o Costituzione (max 20). Competenza con le armi improvvisate. Il tuo pugno chiuso infligge 1d4 contundenti. Quando colpisci con un pugno o un'arma improvvisata, puoi usare l'azione bonus per tentare di afferrare il bersaglio."
  },
  {
    id: "robusto", name: "Robusto", prerequisite: null,
    desc: "I tuoi punti ferita massimi aumentano di 2 per ogni livello di personaggio che possiedi (e continuano ad aumentare a ogni livello futuro)."
  },
  {
    id: "incantatore-guerra", name: "Incantatore da Guerra", prerequisite: "Capacità di lanciare almeno un incantesimo", abilityChoice: { keys: ["int", "wis", "cha"], max: 20 },
    desc: "+1 alla caratteristica da incantatore (max 20). Vantaggio ai TS di Concentrazione quando subisci danno. Puoi eseguire le componenti somatiche di un incantesimo anche con le mani occupate da armi o scudo. Puoi lanciare un incantesimo con componente V/S come reazione per un attacco di opportunità, al posto dell'attacco."
  },
  {
    id: "maestro-armi", name: "Maestro d'Armi", abilityChoice: { keys: ["str", "dex"], max: 20 },
    desc: "+1 a Forza o Destrezza (max 20). Ottieni competenza con quattro armi semplici o da guerra a tua scelta."
  },
];

/* ---------------------------------- STILI DI COMBATTIMENTO ---------------------------------- */
// Stili di Combattimento del PHB 2014
const FIGHTING_STYLES = {
  guerriero: [
    { id: "arcieria", name: "Arcieria", desc: "+2 ai tiri per colpire con armi a distanza.", effects: { attackBonusRanged: 2 } },
    { id: "difesa", name: "Difesa", desc: "+1 alla CA mentre indossi un'armatura.", effects: { acBonus: 1 } },
    { id: "duellante", name: "Duellante", desc: "+2 ai danni con un'arma da mischia impugnata con una mano.", effects: { damageBonusMeleeOneHanded: 2 } },
    { id: "combattimento-due-armi", name: "Combattimento con Due Armi", desc: "Aggiungi il modificatore di caratteristica al danno dell'attacco secondario.", effects: { offhandModifier: true } },
    { id: "protezione", name: "Protezione", desc: "Quando una creatura entro 1,5 m attacca un bersaglio diverso da te, puoi usare la reazione per imporre svantaggio.", effects: { hasReactionProtection: true } },
    { id: "armi-pesanti", name: "Combattimento con Armi Possenti", desc: "Quando tiri 1 o 2 su un dado di danno di un attacco a due mani o versatile, puoi ritirarlo.", effects: { rerollDamage12: true } },
  ],
  paladino: [
    { id: "difesa", name: "Difesa", desc: "+1 alla CA mentre indossi un'armatura.", effects: { acBonus: 1 } },
    { id: "duellante", name: "Duellante", desc: "+2 ai danni con un'arma da mischia impugnata con una mano.", effects: { damageBonusMeleeOneHanded: 2 } },
    { id: "protezione", name: "Protezione", desc: "Quando una creatura entro 1,5 m attacca un bersaglio diverso da te, puoi usare la reazione per imporre svantaggio.", effects: { hasReactionProtection: true } },
    { id: "armi-pesanti", name: "Combattimento con Armi Possenti", desc: "Quando tiri 1 o 2 su un dado di danno di un attacco a due mani o versatile, puoi ritirarlo.", effects: { rerollDamage12: true } },
  ],
  ranger: [
    { id: "arcieria", name: "Arcieria", desc: "+2 ai tiri per colpire con armi a distanza.", effects: { attackBonusRanged: 2 } },
    { id: "difesa", name: "Difesa", desc: "+1 alla CA mentre indossi un'armatura.", effects: { acBonus: 1 } },
    { id: "duellante", name: "Duellante", desc: "+2 ai danni con un'arma da mischia impugnata con una mano.", effects: { damageBonusMeleeOneHanded: 2 } },
    { id: "combattimento-due-armi", name: "Combattimento con Due Armi", desc: "Aggiungi il modificatore di caratteristica al danno dell'attacco secondario.", effects: { offhandModifier: true } },
  ],
};

// Classi che ottengono Stili di Combattimento
const FIGHTING_STYLE_CLASSES = ["guerriero", "paladino", "ranger"];

// Livello in cui ogni classe ottiene lo Stile di Combattimento
const FIGHTING_STYLE_LEVEL = {
  guerriero: 1,
  paladino: 2,
  ranger: 2,
};


function getAvailableFightingStyles(clsId) {
  return FIGHTING_STYLES[clsId] || [];
}

function getFightingStyleCount(clsId, level, subclassId = null) {
  const lvl = Number(level) || 0;
  if (!FIGHTING_STYLE_CLASSES.includes(clsId)) return 0;
  const requiredLevel = FIGHTING_STYLE_LEVEL[clsId] || 99;
  if (lvl < requiredLevel) return 0;
  // In 5e 2014 il Guerriero ottiene un secondo stile al 10° solo se è Campione.
  if (clsId === "guerriero" && subclassId === "campione" && lvl >= 10) return 2;
  return 1;
}

function hasFightingStyles(clsId) {
  return FIGHTING_STYLE_CLASSES.includes(clsId);
}

function getSelectedFightingStyles(store) {
  return Array.isArray(store?.fightingStyles) ? store.fightingStyles : [];
}

function getFightingStyleAcBonus(store, clsId, wearingArmor = true) {
  if (!wearingArmor || !store?.fightingStyles) return 0;
  const styles = FIGHTING_STYLES[clsId] || [];
  return store.fightingStyles.reduce((sum, id) => {
    const style = styles.find((s) => s.id === id);
    return sum + (style?.effects?.acBonus || 0);
  }, 0);
}

function getFightingStyleDamageBonus(store, clsId, isMelee, isOneHanded) {
  if (!store?.fightingStyles) return 0;
  const styles = FIGHTING_STYLES[clsId] || [];
  return store.fightingStyles.reduce((sum, id) => {
    const style = styles.find((s) => s.id === id);
    if (isMelee && isOneHanded && style?.effects?.damageBonusMeleeOneHanded) {
      return sum + style.effects.damageBonusMeleeOneHanded;
    }
    return sum;
  }, 0);
}

function getFightingStyleAttackBonus(store, clsId, isRanged) {
  if (!store?.fightingStyles) return 0;
  const styles = FIGHTING_STYLES[clsId] || [];
  return store.fightingStyles.reduce((sum, id) => {
    const style = styles.find((s) => s.id === id);
    if (isRanged && style?.effects?.attackBonusRanged) {
      return sum + style.effects.attackBonusRanged;
    }
    return sum;
  }, 0);
}

function getFightingStyleGreatWeapon(store) {
  return getSelectedFightingStyles(store).includes("armi-pesanti");
}

function getFightingStyleTwoWeapon(store) {
  return getSelectedFightingStyles(store).includes("combattimento-due-armi");
}

function getFightingStyleProtection(store) {
  return getSelectedFightingStyles(store).includes("protezione");
}

function canUseGreatWeaponStyle(weapon) {
  if (!weapon) return false;
  const isMelee = !weapon.properties?.some(p => p.includes("Munizioni"));
  const isTwoHanded = weapon.hands === "due mani";
  const isVersatile = weapon.properties?.some(p => p.includes("Versatile"));
  // Per le armi versatili, solo se usate a due mani
  // Assumiamo che il giocatore possa scegliere di usare l'arma a due mani
  return isMelee && (isTwoHanded || isVersatile);
}

function getFeat(id) {
  return FEATS.find((f) => f.id === id) || null;
}

const CANTRIPS_STANDARD = [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
const BARDO_CANTRIPS = [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
const STREGONE_CANTRIPS = [4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6];
const WARLOCK_CANTRIPS = [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
const BARDO_KNOWN = [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22];
const STREGONE_KNOWN = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15];
const WARLOCK_KNOWN = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15];
const RANGER_KNOWN = [0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11];
const ZERO_CANTRIPS = Array(20).fill(0);

const FULL_CASTER_SLOTS = [
  [2, 0, 0, 0, 0, 0, 0, 0, 0], [3, 0, 0, 0, 0, 0, 0, 0, 0], [4, 2, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 0, 0, 0, 0, 0, 0, 0], [4, 3, 2, 0, 0, 0, 0, 0, 0], [4, 3, 3, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 1, 0, 0, 0, 0, 0], [4, 3, 3, 2, 0, 0, 0, 0, 0], [4, 3, 3, 3, 1, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 0, 0, 0, 0], [4, 3, 3, 3, 2, 1, 0, 0, 0], [4, 3, 3, 3, 2, 1, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 0, 0], [4, 3, 3, 3, 2, 1, 1, 0, 0], [4, 3, 3, 3, 2, 1, 1, 1, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 0], [4, 3, 3, 3, 2, 1, 1, 1, 1], [4, 3, 3, 3, 3, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 3, 2, 2, 1, 1],
];

const WARLOCK_PACT = [
  { slots: 1, level: 1 }, { slots: 2, level: 1 }, { slots: 2, level: 2 }, { slots: 2, level: 2 },
  { slots: 2, level: 3 }, { slots: 2, level: 3 }, { slots: 2, level: 4 }, { slots: 2, level: 4 },
  { slots: 2, level: 5 }, { slots: 2, level: 5 }, { slots: 3, level: 5 }, { slots: 3, level: 5 },
  { slots: 3, level: 5 }, { slots: 3, level: 5 }, { slots: 3, level: 5 }, { slots: 3, level: 5 },
  { slots: 4, level: 5 }, { slots: 4, level: 5 }, { slots: 4, level: 5 }, { slots: 4, level: 5 },
];

const CASTER_INFO = {
  mago: { ability: "int", type: "spellbook", cantrips: CANTRIPS_STANDARD, label: "Libro degli incantesimi" },
  chierico: { ability: "wis", type: "prepared", cantrips: CANTRIPS_STANDARD, label: "Incantesimi preparati" },
  druido: { ability: "wis", type: "prepared", cantrips: BARDO_CANTRIPS, label: "Incantesimi preparati" },
  bardo: { ability: "cha", type: "known", cantrips: BARDO_CANTRIPS, known: BARDO_KNOWN, label: "Incantesimi conosciuti" },
  stregone: { ability: "cha", type: "known", cantrips: STREGONE_CANTRIPS, known: STREGONE_KNOWN, label: "Incantesimi conosciuti" },
  warlock: { ability: "cha", type: "pact", cantrips: WARLOCK_CANTRIPS, known: WARLOCK_KNOWN, label: "Incantesimi conosciuti" },
  paladino: { ability: "cha", type: "prepared", halfCaster: true, cantrips: ZERO_CANTRIPS, label: "Incantesimi preparati" },
  ranger: { ability: "wis", type: "known", halfCaster: true, cantrips: ZERO_CANTRIPS, known: RANGER_KNOWN, label: "Incantesimi conosciuti" },
};

const THIRD_CASTER_CANTRIPS = [0, 0, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3];
const THIRD_CASTER_KNOWN = [0, 0, 3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 11, 12, 13];
const THIRD_CASTER_SLOTS = [
  [0, 0, 0, 0], [0, 0, 0, 0], [2, 0, 0, 0], [3, 0, 0, 0], [3, 0, 0, 0], [3, 0, 0, 0],
  [4, 2, 0, 0], [4, 2, 0, 0], [4, 2, 0, 0], [4, 2, 0, 0], [4, 2, 2, 0], [4, 2, 2, 0],
  [4, 2, 2, 0], [4, 2, 2, 0], [4, 2, 2, 0], [4, 2, 2, 0], [4, 2, 2, 0], [4, 2, 2, 0],
  [4, 3, 2, 1], [4, 3, 2, 1],
];
const THIRD_CASTER_INFO = { ability: "int", type: "known", cantrips: THIRD_CASTER_CANTRIPS, known: THIRD_CASTER_KNOWN, label: "Terzo incantatore (lista del Mago)" };

function isThirdCaster(clsId, subclassId) {
  return (clsId === "guerriero" && subclassId === "cavaliere-mistico") || (clsId === "ladro" && subclassId === "furfante-arcano");
}

function getEffectiveCasterInfo(clsId, subclassId) {
  if (CASTER_INFO[clsId]) return CASTER_INFO[clsId];
  if (isThirdCaster(clsId, subclassId)) return THIRD_CASTER_INFO;
  return null;
}

const MYSTIC_ARCANUM_UNLOCK_LEVEL = { 6: 11, 7: 13, 8: 15, 9: 17 };
function getUnlockedArcanumTiers(level) {
  return Object.entries(MYSTIC_ARCANUM_UNLOCK_LEVEL)
    .filter(([, unlockLevel]) => (level || 1) >= unlockLevel)
    .map(([tier]) => Number(tier))
    .sort((a, b) => a - b);
}

/* ------------------------------- METAMAGIA (Stregone) ------------------------------- */

const METAMAGIC_OPTIONS = [
  { id: "accorto", name: "Incantesimo Accorto", cost: "1 punto", desc: "Quando lanci un incantesimo che costringe altre creature a un tiro salvezza, puoi proteggere dall'effetto un numero di creature pari al tuo modificatore di Carisma (minimo una)." },
  { id: "distante", name: "Incantesimo Distante", cost: "1 punto", desc: "Puoi raddoppiare la gittata di un incantesimo, oppure trasformare un incantesimo con gittata Contatto in uno con gittata 9 metri." },
  { id: "potenziato", name: "Incantesimo Potenziato", cost: "1 punto", desc: "Quando tiri i dadi per i danni di un incantesimo, puoi ritirare un numero di dadi pari al tuo modificatore di Carisma (minimo uno), tenendo i nuovi risultati." },
  { id: "esteso", name: "Incantesimo Esteso", cost: "1 punto", desc: "Quando lanci un incantesimo con durata di 1 minuto o superiore, puoi raddoppiarne la durata, fino a un massimo di 24 ore." },
  { id: "accelerato", name: "Incantesimo Accelerato", cost: "3 punti", desc: "Quando lanci un incantesimo che costringe una creatura a un tiro salvezza, puoi imporre svantaggio al primo bersaglio in quel tiro salvezza." },
  { id: "rapido", name: "Incantesimo Rapido", cost: "2 punti", desc: "Quando lanci un incantesimo con tempo di lancio di 1 azione, puoi lanciarlo invece come azione bonus." },
  { id: "discreto", name: "Incantesimo Discreto", cost: "1 punto", desc: "Puoi lanciare un incantesimo senza componenti verbali o somatiche e senza che sia rilevabile da magie come Individuazione del Magico." },
  { id: "gemellato", name: "Incantesimo Gemellato", cost: "pari al liv. slot (min. 1)", desc: "Puoi lanciare su un secondo bersaglio un incantesimo che normalmente ha come bersaglio una sola creatura, spendendo punti pari al livello dello slot (1 punto per un trucchetto)." },
];
function getMetamagicKnownCount(level) {
  const lvl = level || 1;
  if (lvl >= 17) return 4;
  if (lvl >= 10) return 3;
  if (lvl >= 3) return 2;
  return 0;
}
function getMetamagic(id) {
  return METAMAGIC_OPTIONS.find((m) => m.id === id) || null;
}

/* ------------------------------- SCONVOLGIMENTO DI MAGIA SELVAGGIA (Stregone) ------------------------------- */
// Tabella d100 (coppie di valori 01-02, 03-04, ... 99-00) per l'effetto casuale che il DM può
// far scatenare quando uno Stregone di Magia Selvaggia lancia un incantesimo di 1° livello o superiore.
const WILD_MAGIC_SURGE_TABLE = [
  "Per il prossimo minuto tiri di nuovo su questa tabella all'inizio di ogni tuo turno, ignorando ulteriori risultati identici a questo.",
  "Per il prossimo minuto vedi le creature invisibili.",
  "Un modron innocuo, alto 30 cm, appare entro 1,5 m e resta per 1 minuto (controllato dal DM), poi svanisce.",
  "Lanci Palla di Fuoco come incantesimo di 3° livello centrato su te stesso.",
  "Lanci Dardo Incantato come incantesimo di 5° livello.",
  "La tua altezza cambia in modo casuale di 1d10 pollici (dispari = ti rimpicciolisci, pari = cresci) per 1d10 minuti.",
  "Lanci Confusione centrata su te stesso.",
  "Per il prossimo minuto recuperi 5 punti ferita all'inizio di ogni tuo turno.",
  "Ti crescono piume su tutto il corpo, che restano finché non starnutisci: a quel punto esplodono via.",
  "Lanci Untuosità centrata su te stesso.",
  "Il prossimo incantesimo che lanci con un tiro salvezza entro il prossimo minuto impone svantaggio ai bersagli su quel tiro.",
  "La tua pelle diventa di un blu vivido per 1d10 giorni; Rimuovi Maledizione pone fine anticipatamente all'effetto.",
  "Ti spunta per 1 minuto un occhio in più sulla fronte: hai vantaggio alle prove di Percezione basate sulla vista.",
  "Per il prossimo minuto, ogni incantesimo con tempo di lancio di 1 azione che lanci può essere lanciato come azione bonus.",
  "Ti teletrasporti fino a 18 m in uno spazio libero a tua scelta che puoi vedere.",
  "Vieni trasportato sul Piano Astrale finché non finisce il tuo prossimo turno, dopo di che riappari dove eri prima (o nello spazio libero più vicino).",
  "Il prossimo incantesimo dannoso che lanci entro il prossimo minuto infligge il danno massimo possibile.",
  "La tua età cambia in modo casuale di 1d10 anni (dispari = ringiovanisci, pari = invecchi).",
  "1d6 flumph innocui appaiono entro 18 m e restano per 1 minuto (controllati dal DM), poi svaniscono.",
  "Recuperi 2d10 punti ferita.",
  "Ti trasformi in una pianta in vaso fino all'inizio del tuo prossimo turno: sei incapacitato e vulnerabile a ogni tipo di danno.",
  "Per il prossimo minuto puoi teletrasportarti fino a 6 m come azione bonus prima di ogni tuo attacco o incantesimo.",
  "Lanci Levitazione su te stesso.",
  "Un unicorno innocuo appare entro 1,5 m e resta per 1 minuto (controllato dal DM), poi svanisce.",
  "Per il prossimo minuto non puoi parlare: ogni volta che provi, ti escono di bocca bolle rosa.",
  "Uno scudo spettrale ti circonda per 1 minuto: +2 CA e immunità a Dardo Incantato.",
  "Sei immune agli effetti dell'alcol per 5d6 giorni.",
  "I tuoi capelli cadono, ma ricrescono entro 24 ore.",
  "Per il prossimo minuto, ogni oggetto infiammabile che tocchi (non indossato o trasportato da altri) prende fuoco.",
  "Recuperi lo slot incantesimo di livello più basso che hai speso.",
  "Per il prossimo minuto devi gridare per parlare.",
  "Lanci Nube di Nebbia centrata su te stesso.",
  "Fino a tre creature a tua scelta entro 9 m subiscono 4d10 danni da fulmine.",
  "Sei spaventato dalla creatura più vicina fino alla fine del tuo prossimo turno.",
  "Ogni creatura entro 9 m da te diventa invisibile per 1 minuto; l'invisibilità termina per chi attacca o lancia un incantesimo.",
  "Ottieni resistenza a tutti i danni per 1 minuto.",
  "Una creatura casuale entro 18 m è avvelenata per 1d4 ore.",
  "Emani una luce intensa in un raggio di 9 m per 1 minuto; ogni creatura entro 1,5 m da te quando l'effetto scatta è accecata per 1 minuto.",
  "Lanci Polimorfia su te stesso; se fallisci il tiro salvezza, ti trasformi in una pecora.",
  "Farfalle illusorie e petali di fiori svolazzano intorno a te in un raggio di 3 m per 1 minuto.",
  "Puoi immediatamente effettuare un'azione aggiuntiva.",
  "Ogni creatura entro 9 m da te subisce 1d10 danni necrotici e tu recuperi punti ferita pari al totale del danno inflitto.",
  "Lanci Immagine Speculare.",
  "Lanci Volare su una creatura casuale entro 18 m.",
  "Diventi invisibile per 1 minuto; gli indumenti e gli oggetti che porti diventano invisibili con te. L'effetto termina se attacchi o lanci un incantesimo.",
  "Se muori entro il prossimo minuto, torni immediatamente in vita come per l'incantesimo Reincarnazione.",
  "La tua taglia aumenta di una categoria per 1 minuto.",
  "Tu e ogni creatura entro 9 m diventate vulnerabili al danno perforante per 1 minuto.",
  "Sei circondato da una tenue musica eterea per 1 minuto.",
  "Recuperi tutti i Punti Stregoneria spesi.",
];
function rollWildMagicSurge() {
  const roll = 1 + Math.floor(Math.random() * 100);
  const index = Math.min(WILD_MAGIC_SURGE_TABLE.length - 1, Math.floor((roll - 1) / 2));
  return { roll, text: WILD_MAGIC_SURGE_TABLE[index] };
}

/* ------------------------------- INVOCAZIONI OCCULTE (Warlock) ------------------------------- */

const WARLOCK_INVOCATIONS = [
  { id: "vista-agonia", name: "Vista d'Agonia", minLevel: 1, desc: "Quando lanci Occhio di Fulmine, aggiungi il tuo modificatore di Carisma al danno inflitto da un raggio che colpisce." },
  { id: "armatura-ombre", name: "Armatura delle Ombre", minLevel: 1, desc: "Puoi lanciare Armatura Magica su te stesso a volontà, senza spendere uno slot incantesimo né componenti materiali." },
  { id: "vista-diavolo", name: "Vista del Diavolo", minLevel: 1, desc: "Vedi normalmente nell'oscurità, sia magica che non magica, fino a 36 metri." },
  { id: "influsso-ammaliante", name: "Influsso Ammaliante", minLevel: 1, desc: "Ottieni competenza nelle abilità Inganno e Persuasione." },
  { id: "occhi-custode", name: "Occhi del Custode delle Rune", minLevel: 1, desc: "Puoi leggere qualunque scrittura." },
  { id: "maschera-volti", name: "Maschera dei Molti Volti", minLevel: 1, desc: "Puoi lanciare Travestimento a volontà, senza spendere uno slot incantesimo." },
  { id: "sguardo-menti", name: "Sguardo delle Due Menti", minLevel: 1, desc: "Come azione, tocchi una creatura consenziente per percepire attraverso i suoi sensi finché non perdi la concentrazione, fino a 1 minuto." },
  { id: "vista-occulta", name: "Vista Occulta", minLevel: 1, desc: "Puoi lanciare Individuazione del Magico a volontà, senza spendere uno slot incantesimo." },
  { id: "respingere-raggio", name: "Raggio Respingente", minLevel: 1, prereq: "Occhio di Fulmine", desc: "Quando colpisci una creatura con Occhio di Fulmine, puoi spingerla fino a 3 metri in linea retta lontano da te." },
  { id: "libro-segreti-antichi", name: "Libro degli Antichi Segreti", minLevel: 1, prereq: "Patto del Tomo", desc: "Puoi iscrivere due incantesimi rituali a scelta nel tuo Grimorio; puoi lanciarli come rituali senza che contino tra i tuoi incantesimi conosciuti." },
  { id: "guardiano-fede", name: "Voce Che Comanda", minLevel: 1, prereq: "Patto della Catena", desc: "Puoi comunicare telepaticamente con il tuo famiglio e percepire attraverso i suoi sensi finché è entro 30 m." },
  { id: "linguaggio-eterno", name: "Lingua del Sole e della Luna", minLevel: 9, desc: "Puoi capire qualunque lingua parlata e ogni creatura in grado di comprendere una lingua capisce ciò che dici." },
  { id: "fascino-ineluttabile", name: "Bevitore di Vita", minLevel: 12, prereq: "Patto della Lama", desc: "Quando colpisci una creatura con l'arma del patto, infliggi danno necrotico extra pari al tuo modificatore di Carisma (minimo 1)." },
  { id: "occhio-vero", name: "Vista Impareggiabile", minLevel: 15, desc: "Puoi lanciare Vera Vista, senza componenti materiali, spendendo uno slot incantesimo." },
];
function getInvocationsKnownCount(level) {
  const lvl = level || 1;
  if (lvl >= 18) return 8;
  if (lvl >= 15) return 7;
  if (lvl >= 12) return 6;
  if (lvl >= 9) return 5;
  if (lvl >= 7) return 4;
  if (lvl >= 5) return 3;
  if (lvl >= 2) return 2;
  return 0;
}
function getInvocation(id) {
  return WARLOCK_INVOCATIONS.find((i) => i.id === id) || null;
}

const PACT_BOONS = [
  { id: "lama", name: "Patto della Lama", desc: "Come azione, puoi far materializzare nella tua mano libera un'arma del patto: sei competente con essa e puoi usarla come focus arcano." },
  { id: "catena", name: "Patto della Catena", desc: "Impari l'incantesimo Trova Famiglio e puoi evocare anche un imp, uno pseudodrago, un folletto alato o un diavoletto d'acqua, oltre alle forme normalmente disponibili." },
  { id: "tomo", name: "Patto del Tomo", desc: "Ricevi un Grimorio delle Ombre contenente tre trucchetti a scelta da una qualsiasi lista di incantesimi delle classi; puoi lanciarli senza componenti materiali e non contano tra i tuoi trucchetti conosciuti." },
];
function getDivineSmiteDice(slotLevel) {
  return Math.min(5, Math.max(2, (slotLevel || 1) + 1));
}

/* ------------------------------- DISCIPLINE ELEMENTALI (Monaco — Via dei Quattro Elementi) ------------------------------- */

const ELEMENTAL_DISCIPLINES = [
  { id: "sintonia-elementale", name: "Sintonia Elementale", kiCost: "Gratis", minLevel: 3, automatic: true, desc: "Come azione, controlli brevemente le forze elementali intorno a te: crei un effetto sensoriale innocuo (una folata di vento, scintille, un sussurro), accendi o spegni una candela/torcia/piccolo fuoco da campo, raffreddi/riscaldi/dai sapore fino a 0,5 kg di materiale inerte per 1 ora, oppure plasmi la terra, il fuoco, l'acqua o l'aria per creare per un istante una piccola immagine." },
  { id: "zanne-serpente-fuoco", name: "Zanne del Serpente di Fuoco", kiCost: "1 (+1 per dado extra)", minLevel: 3, desc: "Subito dopo l'azione Attacco, uno o due dei tuoi attacchi senza armi infliggono danno da fuoco invece che contundente e hanno 3 m di portata in più; se colpisci, infliggi 1d10 danni da fuoco extra (spendendo Ki aggiuntivi puoi aumentare questo danno di 1d10 per ogni punto Ki extra)." },
  { id: "pugno-aria-ininterrotta", name: "Pugno dell'Aria Ininterrotta", kiCost: "2 (+1 per dado extra)", minLevel: 3, desc: "Come azione, in una linea di 9 m x 1,5 m: TS di Forza o 3d10 danni contundenti, spinto di 6 m e prono (metà danno e nessun altro effetto se il TS ha successo); spendendo Ki aggiuntivi il danno aumenta di 1d10 per punto." },
  { id: "sferza-acqua", name: "Sferza d'Acqua", kiCost: "2 (+1 per dado extra)", minLevel: 3, desc: "Come azione, contro una creatura entro 9 m: TS di Destrezza o 3d10 danni contundenti e, a tua scelta, prona oppure tirata fino a 7,5 m verso di te; spendendo Ki aggiuntivi il danno aumenta di 1d10 per punto." },
  { id: "raffica-spiriti-vento", name: "Raffica degli Spiriti del Vento", kiCost: 2, minLevel: 3, desc: "Come azione, in una linea di 18 m: crei un forte vento che spegne fiamme scoperte, disperde nebbia/gas e spinge indietro creature di taglia Grande o inferiore che falliscono un TS di Forza." },
  { id: "pugno-quattro-tuoni", name: "Pugno dei Quattro Tuoni", kiCost: 2, minLevel: 3, desc: "Come azione, in una sfera di 4,5 m centrata su di te: ogni creatura subisce 2d8 danni tonanti (metà con TS di Costituzione superato) ed è spinta di 3 m se il TS fallisce; oggetti non indossati/trasportati nell'area sono spinti di 3 m." },
  { id: "colpo-cinere-strisciante", name: "Colpo Cinereo Strisciante", kiCost: 2, minLevel: 3, desc: "Come azione, in un cono di 4,5 m: TS di Destrezza o 3d6 danni da fuoco (metà se superato); gli oggetti infiammabili non indossati/trasportati nell'area prendono fuoco." },
  { id: "forma-fiume-fluente", name: "Forgia il Fiume in Movimento", kiCost: 1, minLevel: 3, desc: "Come azione, entro 36 m, geli acqua o sciogli ghiaccio in un'area fino a un cubo di 9 m, oppure rimodelli il terreno ghiacciato o acquatico a tuo piacimento per 1 ora." },
  { id: "morsa-vento-nord", name: "Morsa del Vento del Nord", kiCost: 3, minLevel: 6, desc: "Come azione, contro una creatura entro 18 m: TS di Saggezza o è paralizzata per 1 minuto (può ripetere il TS a ogni suo turno)." },
  { id: "gong-della-vetta", name: "Gong della Vetta", kiCost: 3, minLevel: 6, desc: "Come azione, in una sfera di 3 m centrata su un punto entro 18 m: TS di Costituzione o 3d8 danni tonanti e stordita fino alla fine del tuo prossimo turno (metà danno, nessuno stordimento se il TS ha successo)." },
  { id: "fiamme-fenice", name: "Fiamme della Fenice", kiCost: 4, minLevel: 11, desc: "Come azione, in una sfera di 6 m centrata su un punto entro 45 m: TS di Destrezza o 8d6 danni da fuoco (metà se superato)." },
  { id: "posizione-nebbia", name: "Posizione della Nebbia", kiCost: 4, minLevel: 11, desc: "Come azione bonus, ti trasformi in una nube nebbiosa (come l'incantesimo Forma Gassosa) per un massimo di 10 minuti o finché non decidi di terminare l'effetto come azione bonus." },
  { id: "cavalca-vento", name: "Cavalca il Vento", kiCost: 4, minLevel: 11, desc: "Come azione bonus, ottieni una velocità di volo pari a 18 m per fino a 10 minuti." },
  { id: "respiro-inverno", name: "Respiro dell'Inverno", kiCost: 6, minLevel: 17, desc: "Come azione, in un cono di 18 m: TS di Costituzione o 8d8 danni da freddo e velocità dimezzata fino alla fine del tuo prossimo turno (metà danno, nessuna riduzione di velocità se il TS ha successo)." },
  { id: "difesa-montagna-eterna", name: "Difesa della Montagna Eterna", kiCost: 5, minLevel: 17, desc: "Come azione bonus, la tua pelle si indurisce come pietra (come l'incantesimo Pelle di Pietra) per fino a 1 ora o finché non sei incapacitato o termini l'effetto come azione bonus: resistenza a tutto il danno non magico." },
  { id: "fiume-fiamma-vorace", name: "Fiume della Fiamma Vorace", kiCost: 5, minLevel: 17, desc: "Come azione, crei un muro di fuoco lungo fino a 18 m e alto 6 m entro 36 m (o un cerchio di 6 m di diametro): ogni creatura nell'area o che vi entra/attraversa subisce 5d8 danni da fuoco (metà con TS di Destrezza)." },
  { id: "onda-terra-rotolante", name: "Onda di Terra Rotolante", kiCost: 6, minLevel: 17, desc: "Come azione, crei un muro di pietra fino a 9 m x 6 m entro 36 m (o una cupola/sfera di 3 m di raggio), che dura fino a 10 minuti o finché non lo dissolvi come azione." },
];

function getDisciplinesKnownCount(level) {
  const lvl = level || 1;
  if (lvl >= 17) return 5;
  if (lvl >= 11) return 4;
  if (lvl >= 6) return 3;
  if (lvl >= 3) return 2;
  return 0;
}
function getElementalDiscipline(id) {
  return ELEMENTAL_DISCIPLINES.find((d) => d.id === id) || null;
}

const MAX_DATA_SPELL_LEVEL = 9;

function getSpellSlots(clsId, level, subclassId) {
  const lvl = Math.max(1, Math.min(20, level || 1));
  if (isThirdCaster(clsId, subclassId)) {
    const row = THIRD_CASTER_SLOTS[lvl - 1];
    return row.map((total, i) => ({ level: i + 1, total })).filter((s) => s.total > 0);
  }
  if (clsId === "paladino" || clsId === "ranger") {
    if (lvl < 2) return [];
    const eff = Math.ceil(lvl / 2);
    const row = FULL_CASTER_SLOTS[eff - 1].slice(0, 5);
    return row.map((total, i) => ({ level: i + 1, total })).filter((s) => s.total > 0);
  }
  if (CASTER_INFO[clsId] && clsId !== "warlock") {
    const row = FULL_CASTER_SLOTS[lvl - 1];
    return row.map((total, i) => ({ level: i + 1, total })).filter((s) => s.total > 0);
  }
  if (clsId === "warlock") {
    const info = WARLOCK_PACT[lvl - 1];
    return [{ level: info.level, total: info.slots, pact: true }];
  }
  return [];
}

function getMaxSpellLevel(clsId, level, subclassId) {
  const slots = getSpellSlots(clsId, level, subclassId);
  return slots.length ? Math.max(...slots.map((s) => s.level)) : 0;
}

function getSpellsLimit(clsId, caster, level, abilityMod) {
  const lvl = Math.max(1, Math.min(20, level || 1));
  if (caster.type === "prepared") {
    const effLevel = caster.halfCaster ? Math.floor(lvl / 2) : lvl;
    return Math.max(1, abilityMod + effLevel);
  }
  if (caster.type === "spellbook") return 6 + (lvl - 1) * 2;
  return caster.known[lvl - 1];
}

function getTieredSpellIds(source, maxLevelReal) {
  if (!source) return [];
  const ids = [];
  for (let lvl = 1; lvl <= Math.min(maxLevelReal, 5); lvl += 1) {
    (source.spells[lvl] || []).forEach((id) => ids.push(id));
  }
  return ids;
}

function getDomainSpellIds(domainId, maxLevelReal) {
  return getTieredSpellIds(DIVINE_DOMAINS.find((d) => d.id === domainId), maxLevelReal);
}

function getOathSpellIds(oathId, maxLevelReal) {
  return getTieredSpellIds(PALADIN_OATHS.find((o) => o.id === oathId), maxLevelReal);
}

function getPatronSpellIds(patronId, maxLevelReal) {
  return getTieredSpellIds(WARLOCK_PATRONS.find((p) => p.id === patronId), maxLevelReal);
}

function getCircleSpellIds(circleId, maxLevelReal) {
  return getTieredSpellIds(DRUID_CIRCLES.find((c) => c.id === circleId), maxLevelReal);
}

const SCHOOLS = {
  abiurazione: "Abiurazione", ammaliamento: "Ammaliamento", divinazione: "Divinazione",
  evocazione: "Evocazione", illusione: "Illusione", invocazione: "Invocazione",
  necromanzia: "Necromanzia", trasmutazione: "Trasmutazione",
};

const SPELLS = [
  { id: "mano-magica", name: "Mano Magica", level: 0, school: "invocazione", classes: ["mago", "bardo", "stregone", "warlock"], time: "1 azione", range: "9 m", comp: "V, S", duration: "Concentrazione, fino a 1 minuto", desc: "Crea una mano spettrale che sposta o manipola piccoli oggetti a distanza.", crunch: "Nessun danno: la mano può portare fino a 4,5 kg, aprire/chiudere/frugare cose non ancorate, entro 9 m da te." },
  { id: "luce", name: "Luce", level: 0, school: "invocazione", classes: ["mago", "bardo", "stregone"], time: "1 azione", range: "Contatto", comp: "V, M", duration: "1 ora", desc: "Rende un oggetto toccato una fonte di luce brillante per un'ora.", crunch: "Nessun danno: luce intensa in 6 m di raggio (+6 m di luce fioca) per 1 ora." },
  { id: "raggio-di-gelo", name: "Raggio di Gelo", level: 0, school: "invocazione", classes: ["mago", "stregone"], time: "1 azione", range: "18 m", comp: "V, S", duration: "Istantanea", desc: "Un raggio gelido infligge danno freddo e riduce la velocità del bersaglio.", crunch: "1d8 danno freddo (2d8 al 5°, 3d8 all'11°, 4d8 al 17°), tiro per colpire con incantesimi; se colpisce, la velocità del bersaglio è ridotta di 3 m fino al tuo prossimo turno." },
  { id: "dardo-di-fuoco", name: "Dardo di Fuoco", level: 0, school: "invocazione", classes: ["mago", "stregone"], time: "1 azione", range: "36 m", comp: "V, S", duration: "Istantanea", desc: "Scaglia un dardo fiammeggiante che infligge danno da fuoco a distanza.", crunch: "1d10 danno da fuoco (2d10 al 5°, 3d10 all'11°, 4d10 al 17°), tiro per colpire con incantesimi." },
  { id: "illusione-minore", name: "Illusione Minore", level: 0, school: "illusione", classes: ["mago", "bardo", "stregone", "warlock"], time: "1 azione", range: "9 m", comp: "S, M", duration: "1 minuto", desc: "Crea un suono o un'immagine illusoria priva di effetti reali.", crunch: "Nessun danno: crea un suono o un'immagine (non entrambi) entro un cubo di 1,5 m; un'indagine attiva la smaschera." },
  { id: "prestidigitazione", name: "Prestidigitazione", level: 0, school: "trasmutazione", classes: ["mago", "bardo", "stregone", "warlock"], time: "1 azione", range: "3 m", comp: "V, S", duration: "Fino a 1 ora", desc: "Un piccolo trucco magico: pulisce, riscalda, colora o crea un effetto sensoriale minore.", crunch: "Nessun danno: sceglie uno tra vari piccoli effetti sensoriali/pratici, nessuno abbastanza potente da avere impatto in combattimento." },
  { id: "taumaturgia", name: "Taumaturgia", level: 0, school: "invocazione", classes: ["chierico"], time: "1 azione bonus", range: "9 m", comp: "V", duration: "Fino a 1 minuto", desc: "Manifesta un piccolo prodigio divino: voce tonante, porte che sbattono, luci tremolanti.", crunch: "Nessun danno: sceglie uno tra vari piccoli prodigi divini a scopo di intimidazione o effetto scenico." },
  { id: "fiamma-sacra", name: "Fiamma Sacra", level: 0, school: "invocazione", classes: ["chierico"], time: "1 azione", range: "18 m", comp: "V, S", duration: "Istantanea", desc: "Fuoco divino cala su un bersaglio, che non ottiene beneficio dai bonus di copertura.", crunch: "1d8 danno radioso (2d8 al 5°, 3d8 all'11°, 4d8 al 17°); TS Destrezza nega il danno (nessuna metà danno)." },
  { id: "guarigione-in-punto-di-morte", name: "Guarigione in Punto di Morte", level: 0, school: "necromanzia", classes: ["chierico"], time: "1 azione", range: "Contatto", comp: "V, S", duration: "Istantanea", desc: "Stabilizza una creatura morente toccandola, senza curarne i punti ferita.", crunch: "Nessun danno né cura: la creatura toccata a 0 PF diventa stabile." },
  { id: "resistenza", name: "Resistenza", level: 0, school: "abiurazione", classes: ["chierico", "druido"], time: "1 azione", range: "Contatto", comp: "V, S, M", duration: "Concentrazione, fino a 1 minuto", desc: "Concede un piccolo bonus a un tiro salvezza a scelta entro un minuto.", crunch: "Nessun danno: la creatura toccata può aggiungere 1d4 a un TS a sua scelta lanciato entro la durata." },
  { id: "produrre-fiamma", name: "Produrre Fiamma", level: 0, school: "invocazione", classes: ["druido"], time: "1 azione", range: "Personale", comp: "V, S", duration: "10 minuti", desc: "Crea una fiamma in mano che illumina e può essere scagliata come attacco.", crunch: "Se lanciata contro un bersaglio: 1d8 danno da fuoco (2d8 al 5°, 3d8 all'11°, 4d8 al 17°), tiro per colpire con incantesimi a 9 m." },
  { id: "spruzzo-velenoso", name: "Spruzzo Velenoso", level: 0, school: "necromanzia", classes: ["druido"], time: "1 azione", range: "3 m", comp: "V, S", duration: "Istantanea", desc: "Proietta gas nocivo verso un bersaglio vicino, infliggendo danno da veleno.", crunch: "1d12 danno da veleno (2d12 al 5°, 3d12 all'11°, 4d12 al 17°); TS Costituzione nega il danno." },
  { id: "scherno-crudele", name: "Scherno Crudele", level: 0, school: "ammaliamento", classes: ["bardo"], time: "1 azione bonus", range: "18 m", comp: "V", duration: "Istantanea", desc: "Un insulto incantato infligge danno psichico e svantaggia il prossimo attacco del bersaglio.", crunch: "1d4 danno psichico (2d4 al 5°, 3d4 all'11°, 4d4 al 17°) e svantaggio al prossimo attacco entro il suo prossimo turno; TS Saggezza nega entrambi gli effetti." },
  { id: "impulso-occulto", name: "Impulso Occulto", level: 0, school: "invocazione", classes: ["warlock"], time: "1 azione", range: "36 m", comp: "V, S", duration: "Istantanea", desc: "Un raggio di energia spettrale colpisce a distanza, sempre più potente nei livelli alti.", crunch: "1d10 danno di forza per raggio, tiro per colpire con incantesimi; un secondo raggio al 5° livello, un terzo all'11°, un quarto al 17° (ogni raggio può colpire lo stesso bersaglio o bersagli diversi)." },
  { id: "getto-d-acido", name: "Getto d'Acido", level: 0, school: "invocazione", classes: ["mago", "stregone"], time: "1 azione", range: "18 m", comp: "V, S", duration: "Istantanea", desc: "Una bolla d'acido scoppia su uno o due bersagli vicini tra loro, corrodendoli.", crunch: "1d6 danno da acido (2d6 al 5°, 3d6 all'11°, 4d6 al 17°) per bersaglio; TS Destrezza nega il danno." },
  { id: "aiuto", name: "Aiuto", level: 0, school: "divinazione", classes: ["chierico", "druido"], time: "1 azione bonus", range: "Contatto", comp: "V, S", duration: "Concentrazione, fino a 1 minuto", desc: "Concede un piccolo bonus alla prossima prova di caratteristica del bersaglio.", crunch: "Nessun danno: il bersaglio aggiunge 1d4 a una prova di caratteristica a sua scelta lanciata entro la durata." },
  { id: "contatto-gelido", name: "Contatto Gelido", level: 0, school: "necromanzia", classes: ["mago", "stregone", "warlock"], time: "1 azione", range: "36 m", comp: "V, S", duration: "1 turno", desc: "Una mano spettrale gelida infligge danno freddo e impedisce la guarigione del bersaglio.", crunch: "1d8 danno freddo (2d8 al 5°, 3d8 all'11°, 4d8 al 17°), tiro per colpire con incantesimi; il bersaglio non può recuperare PF fino all'inizio del tuo prossimo turno." },
  { id: "choc-elettrico", name: "Choc Elettrico", level: 0, school: "invocazione", classes: ["mago", "stregone"], time: "1 azione", range: "Contatto", comp: "V, S", duration: "Istantanea", desc: "Una scarica elettrica colpisce al tocco e può impedire reazioni al bersaglio.", crunch: "1d8 danno da fulmine (2d8 al 5°, 3d8 all'11°, 4d8 al 17°), tiro per colpire con incantesimi (vantaggio se il bersaglio indossa armatura metallica); se colpisce, il bersaglio non può usare reazioni fino al suo prossimo turno." },
  { id: "riparare", name: "Riparare", level: 0, school: "trasmutazione", classes: ["bardo", "chierico", "druido", "mago"], time: "1 minuto", range: "Contatto", comp: "V, S, M", duration: "Istantanea", desc: "Ripara una singola rottura o strappo in un oggetto toccato.", crunch: "Nessun danno: ripara un singolo danno fisico (non un oggetto distrutto)." },
  { id: "messaggio", name: "Messaggio", level: 0, school: "trasmutazione", classes: ["bardo", "mago", "stregone"], time: "1 azione", range: "36 m", comp: "V, S, M", duration: "1 turno", desc: "Sussurra un breve messaggio a un bersaglio a distanza, che può rispondere sottovoce.", crunch: "Nessun danno: comunicazione a distanza, richiede linea di vista o conoscenza del percorso." },
  { id: "colpo-sicuro", name: "Colpo Sicuro", level: 0, school: "divinazione", classes: ["bardo", "mago", "stregone", "warlock"], time: "1 azione", range: "9 m", comp: "S", duration: "1 turno", desc: "Scruta un bersaglio per ottenere vantaggio sul prossimo attacco contro di esso.", crunch: "Nessun danno diretto: il primo tiro per colpire contro il bersaglio entro il tuo prossimo turno ha vantaggio." },
  { id: "infliggere-ferite", name: "Infliggere Ferite", level: 0, school: "necromanzia", classes: ["chierico", "warlock"], time: "1 azione", range: "36 m", comp: "V, S", duration: "Istantanea", desc: "Un rintocco funebre risuona nella mente di un bersaglio già ferito, infliggendogli danno necrotico.", crunch: "1d8 danno necrotico se il bersaglio ha già subito danno (altrimenti 1d12); dado che sale a 2d8/2d12 al 5°, 3d8/3d12 all'11°, 4d8/4d12 al 17°. TS Saggezza nega il danno." },
  { id: "percezione-naturale", name: "Percezione Naturale", level: 0, school: "trasmutazione", classes: ["druido"], time: "1 azione", range: "9 m", comp: "V, S", duration: "Istantanea", desc: "Un piccolo prodigio della natura: un fiore sboccia, una scintilla accende un ramoscello.", crunch: "Nessun danno: sceglie uno tra vari piccoli prodigi naturali, privi di effetto meccanico in combattimento." },
  { id: "dardo-incantato", name: "Dardo Incantato", level: 1, school: "invocazione", classes: ["mago", "stregone"], time: "1 azione", range: "36 m", comp: "V, S", duration: "Istantanea", desc: "Tre dardi di forza magica colpiscono automaticamente uno o più bersagli.", crunch: "3 dardi da 1d4+1 danno di forza ciascuno, colpiscono sempre (nessun tiro per colpire né TS); +1 dardo per ogni slot superiore al 1°." },
  { id: "scudo", name: "Scudo", level: 1, school: "abiurazione", classes: ["mago", "stregone"], time: "1 reazione", range: "Personale", comp: "V, S", duration: "1 turno", desc: "Reazione istantanea che innalza la Classe Armatura e respinge il Dardo Incantato.", crunch: "Nessun danno: +5 CA fino all'inizio del tuo prossimo turno, incluso contro l'attacco che ha scatenato la reazione; immunità totale al danno di Dardo Incantato." },
  { id: "individuazione-magia", name: "Individuazione della Magia", level: 1, school: "divinazione", classes: ["mago", "chierico", "druido", "bardo"], time: "1 azione", range: "Personale", comp: "V, S", duration: "Concentrazione, fino a 10 minuti", desc: "Percepisce la presenza di magia entro un breve raggio per 10 minuti.", crunch: "Nessun danno: percepisce la presenza di magia entro 9 m, rituale." },
  { id: "sonno", name: "Sonno", level: 1, school: "ammaliamento", classes: ["mago", "bardo", "stregone"], time: "1 azione", range: "27 m", comp: "V, S, M", duration: "1 minuto", desc: "Fa cadere in un sonno magico le creature più deboli in un'area.", crunch: "Nessun danno, nessun TS: 5d8 punti ferita totali di sonno, distribuiti partendo dalla creatura con meno PF attuali nell'area; +2d8 per ogni slot superiore al 1°." },
  { id: "mani-brucianti", name: "Mani Brucianti", level: 1, school: "invocazione", classes: ["mago", "stregone"], time: "1 azione", range: "Cono di 4,5 m", comp: "V, S", duration: "Istantanea", desc: "Un cono di fiamme si propaga dalle mani, infliggendo danno da fuoco.", crunch: "3d6 danno da fuoco; TS Destrezza dimezza. +1d6 per ogni slot superiore al 1°." },
  { id: "armatura-magica", name: "Armatura Magica", level: 1, school: "abiurazione", classes: ["mago", "stregone", "warlock"], time: "1 azione", range: "Contatto", comp: "V, S, M", duration: "8 ore", desc: "Avvolge il bersaglio in una forza protettiva che ne aumenta la Classe Armatura.", crunch: "Nessun danno: CA base diventa 13 + mod. Destrezza, indipendentemente dall'armatura indossata." },
  { id: "cura-ferite", name: "Cura Ferite", level: 1, school: "evocazione", classes: ["chierico", "druido"], time: "1 azione", range: "Contatto", comp: "V, S", duration: "Istantanea", desc: "Toccando una creatura le restituisce punti ferita.", crunch: "Cura 1d8 + mod. caratteristica incantatrice; +1d8 per ogni slot superiore al 1°." },
  { id: "benedizione", name: "Benedizione", level: 1, school: "ammaliamento", classes: ["chierico"], time: "1 azione", range: "9 m", comp: "V, S, M", duration: "Concentrazione, fino a 1 minuto", desc: "Fino a tre creature aggiungono un dado ad attacchi e tiri salvezza.", crunch: "Nessun danno: fino a 3 creature aggiungono 1d4 a ogni tiro per colpire e TS per la durata; +1 bersaglio per ogni slot superiore al 1°." },
  { id: "parola-curativa", name: "Parola Curativa", level: 1, school: "evocazione", classes: ["chierico", "bardo"], time: "1 azione bonus", range: "18 m", comp: "V", duration: "Istantanea", desc: "Cura una creatura a distanza con una sola parola, senza bisogno di toccarla.", crunch: "Cura 1d4 + mod. caratteristica incantatrice; +1d4 per ogni slot superiore al 1°." },
  { id: "scudo-della-fede", name: "Scudo della Fede", level: 1, school: "abiurazione", classes: ["chierico"], time: "1 azione bonus", range: "18 m", comp: "V, S, M", duration: "Concentrazione, fino a 10 minuti", desc: "Un campo scintillante protegge una creatura aumentandone la Classe Armatura.", crunch: "Nessun danno: +2 CA per la durata." },
  { id: "comando", name: "Comando", level: 1, school: "ammaliamento", classes: ["chierico", "warlock"], time: "1 azione", range: "18 m", comp: "V", duration: "1 turno", desc: "Costringe una creatura a obbedire a una singola parola, come Fuggi o Inginocchiati.", crunch: "Nessun danno diretto: TS Saggezza nega; se fallito, il bersaglio obbedisce a una parola singola (Avvicinati, Cadi, Fuggi, Resta o Arrenditi) nel suo turno. +1 bersaglio per ogni slot superiore al 1°." },
  { id: "amicizia-con-gli-animali", name: "Amicizia con gli Animali", level: 1, school: "ammaliamento", classes: ["druido"], time: "1 azione", range: "9 m", comp: "V, S, M", duration: "24 ore", desc: "Convince una bestia della propria buona fede, rendendola non ostile.", crunch: "Nessun danno: TS Saggezza della bestia nega (svantaggio se le mostri cibo); se fallito, la bestia diventa amichevole per la durata." },
  { id: "groviglio-di-rovi", name: "Groviglio di Rovi", level: 1, school: "trasmutazione", classes: ["druido"], time: "1 azione", range: "27 m", comp: "V, S", duration: "Concentrazione, fino a 1 minuto", desc: "Rovi ed erba afferrano le creature in un'area, intrappolandole al suolo.", crunch: "Nessun danno: TS Forza per ogni creatura nell'area (ripetibile come azione); se fallito, resta trattenuta per la durata." },
  { id: "individuazione-veleni", name: "Individuazione di Veleni e Malattie", level: 1, school: "divinazione", classes: ["druido", "chierico"], time: "1 azione", range: "Personale", comp: "V, S, M", duration: "Concentrazione, fino a 10 minuti", desc: "Rivela la presenza di veleni, creature velenose e malattie nelle vicinanze.", crunch: "Nessun danno: rivela veleni, creature velenose e malattie entro 9 m; rituale." },
  { id: "charme-su-persone", name: "Charme su Persone", level: 1, school: "ammaliamento", classes: ["bardo", "stregone", "warlock"], time: "1 azione", range: "9 m", comp: "V, S", duration: "1 ora", desc: "Tenta di convincere un umanoide a considerarlo un amico fidato.", crunch: "Nessun danno: TS Saggezza (vantaggio se in combattimento con te) nega; se fallito, l'umanoide ti considera un amico fidato per la durata. +1 bersaglio per ogni slot superiore al 1°." },
  { id: "identificazione", name: "Identificazione", level: 1, school: "divinazione", classes: ["bardo", "mago"], time: "1 minuto", range: "Contatto", comp: "V, S, M", duration: "Istantanea", desc: "Rivela le proprietà magiche di un oggetto toccato o di un incantesimo su una creatura.", crunch: "Nessun danno: rivela le proprietà magiche di un oggetto o incantesimo attivo su una creatura; rituale." },
  { id: "sussurri-dissonanti", name: "Sussurri Dissonanti", level: 1, school: "ammaliamento", classes: ["bardo"], time: "1 azione", range: "18 m", comp: "V", duration: "Istantanea", desc: "Un verso terribile risuona nella mente del bersaglio, ferendolo e mettendolo in fuga.", crunch: "3d6 danno psichico; TS Saggezza dimezza il danno e annulla la fuga forzata. Se fallito, il bersaglio deve usare la reazione per allontanarsi il più possibile da te. +1d6 per ogni slot superiore al 1°." },
  { id: "occhio-maligno", name: "Occhio Maligno", level: 1, school: "ammaliamento", classes: ["warlock"], time: "1 azione bonus", range: "27 m", comp: "V, S, M", duration: "Concentrazione, fino a 1 ora", desc: "Maledice una creatura, infliggendole danno extra ogni volta che viene colpita.", crunch: "Nessun danno all'atto del lancio: ogni volta che colpisci il bersaglio maledetto con un attacco, infliggi 1d6 danno necrotico aggiuntivo; anche svantaggio alle prove della caratteristica scelta. Durata più lunga con slot superiori (8 ore al 3° livello, 24 ore al 5°)." },
  { id: "fedele-animale", name: "Fedele Animale", level: 1, school: "invocazione", classes: ["mago"], time: "1 ora", range: "Contatto", comp: "V, S, M", duration: "Istantanea", desc: "Evoca uno spirito che assume la forma di un piccolo animale al servizio del lanciatore.", crunch: "Nessun danno: evoca un famiglio con cui puoi comunicare telepaticamente entro 30 m e attraverso i cui sensi puoi percepire come azione; rituale." },
  { id: "assorbire-elementi", name: "Assorbire Elementi", level: 1, school: "abiurazione", classes: ["druido", "mago", "stregone", "ranger"], time: "1 reazione", range: "Personale", comp: "S", duration: "1 turno", desc: "Assorbe parte del danno elementale in arrivo e lo rilascia nel prossimo attacco in mischia.", crunch: "Nessun danno diretto: dà resistenza al tipo di danno subito (acido/freddo/fuoco/fulmine/tuono) per l'attacco scatenante; il tuo prossimo attacco in mischia entro 1 turno aggiunge 1d6 di quel tipo di danno. +1d6 per ogni slot superiore al 1°." },
  { id: "protezione-dal-male-e-dal-bene", name: "Protezione dal Male e dal Bene", level: 1, school: "abiurazione", classes: ["chierico", "mago", "paladino", "warlock"], time: "1 azione", range: "Contatto", comp: "V, S, M", duration: "Concentrazione, fino a 10 minuti", desc: "Protegge una creatura da specifiche categorie di mostri, ostacolandone il controllo e gli attacchi.", crunch: "Nessun danno: contro aberrazioni/celestiali/elementali/fate/demoni/non morti, questi hanno svantaggio ad attaccare il bersaglio e non possono affascinarlo/spaventarlo/possederlo (con TS per liberarsi se già sotto effetto)." },
  { id: "eroismo", name: "Eroismo", level: 1, school: "ammaliamento", classes: ["bardo", "paladino"], time: "1 azione bonus", range: "Contatto", comp: "V, S", duration: "Concentrazione, fino a 1 minuto", desc: "Riempie il bersaglio di coraggio, concedendogli punti ferita temporanei e immunità alla paura.", crunch: "Nessun danno: PF temporanei pari al tuo mod. caratteristica incantatrice all'inizio del lancio e a ogni suo turno per la durata; immune alla paura mentre l'effetto dura. +1 bersaglio per ogni slot superiore al 1°." },
  { id: "invisibilita", name: "Invisibilità", level: 2, school: "illusione", classes: ["mago", "stregone"], time: "1 azione", range: "Contatto", comp: "V, S, M", duration: "Concentrazione, fino a 1 ora", desc: "Rende invisibile la creatura toccata finché non attacca o lancia un incantesimo.", crunch: "Nessun danno: il bersaglio (e ciò che indossa/trasporta) diventa invisibile finché l'incantesimo non termina; attaccare o lanciare un incantesimo NON lo interrompe più (errata 2014: solo la fine della concentrazione lo fa). +1 bersaglio per ogni slot superiore al 2°." },
  { id: "ragnatela", name: "Ragnatela", level: 2, school: "invocazione", classes: ["mago"], time: "1 azione", range: "18 m", comp: "V, S, M", duration: "Concentrazione, fino a 1 ora", desc: "Riempie un'area di ragnatele appiccicose che intrappolano chi vi entra.", crunch: "Nessun danno: TS Destrezza per ogni creatura nell'area (ripetibile come azione); se fallito, resta trattenuta. L'area è terreno difficile e infiammabile." },
  { id: "sospendere-persona", name: "Sospendere Persona", level: 2, school: "ammaliamento", classes: ["chierico", "warlock"], time: "1 azione", range: "18 m", comp: "V, S, M", duration: "Concentrazione, fino a 1 minuto", desc: "Paralizza un umanoide bersaglio se questo fallisce il tiro salvezza sulla Saggezza.", crunch: "Nessun danno: TS Saggezza nega (ripetibile a fine turno); se fallito, il bersaglio è paralizzato per la durata. +1 bersaglio per ogni slot superiore al 2°." },
  { id: "silenzio", name: "Silenzio", level: 2, school: "illusione", classes: ["chierico"], time: "1 azione", range: "36 m", comp: "V, S", duration: "Concentrazione, fino a 10 minuti", desc: "Un'area rimane priva di suoni, bloccando incantesimi con componente verbale.", crunch: "Nessun danno: sfera di 6 m priva di suoni; blocca incantesimi con componente verbale al suo interno." },
  { id: "sfera-fiammeggiante", name: "Sfera Fiammeggiante", level: 2, school: "evocazione", classes: ["druido"], time: "1 azione", range: "18 m", comp: "V, S, M", duration: "Concentrazione, fino a 1 minuto", desc: "Evoca una sfera di fuoco che può essere spinta contro i nemici ogni turno.", crunch: "2d6 danno da fuoco per creatura entro 1,5 m dalla sfera; TS Destrezza dimezza. Come azione bonus la sposti fino a 9 m e ripeti il danno. +1d6 per ogni slot superiore al 2°." },
  { id: "passo-senza-tracce", name: "Passo senza Tracce", level: 2, school: "abiurazione", classes: ["druido"], time: "1 azione", range: "Personale", comp: "V, S", duration: "Concentrazione, fino a 1 ora", desc: "Il gruppo diventa più difficile da seguire e da individuare mentre si muove.", crunch: "Nessun danno: +10 alle prove di Furtività per te e gli alleati entro 9 m per la durata; non lasciate tracce rintracciabili con mezzi non magici." },
  { id: "suggestione", name: "Suggestione", level: 2, school: "ammaliamento", classes: ["bardo", "warlock"], time: "1 azione", range: "9 m", comp: "V, S, M", duration: "Concentrazione, fino a 8 ore", desc: "Suggerisce un corso d'azione plausibile che il bersaglio si sente spinto a seguire.", crunch: "Nessun danno: TS Saggezza nega; se fallito, il bersaglio segue il corso d'azione suggerito finché non è completato o l'incantesimo termina." },
  { id: "individuazione-pensieri", name: "Individuazione dei Pensieri", level: 2, school: "divinazione", classes: ["bardo"], time: "1 azione", range: "Personale", comp: "V, S, M", duration: "Concentrazione, fino a 1 minuto", desc: "Legge la superficie dei pensieri di una creatura vicina.", crunch: "Nessun danno: legge i pensieri superficiali entro 9 m; per sondare più a fondo il bersaglio fa un TS Intelligenza (fallito = accesso a ricordi/emozioni)." },
  { id: "raggio-rovente", name: "Raggio Rovente", level: 2, school: "invocazione", classes: ["stregone"], time: "1 azione", range: "36 m", comp: "V, S", duration: "Istantanea", desc: "Tre raggi di fuoco scattano verso uno o più bersagli entro portata.", crunch: "3 raggi da 2d6 danno da fuoco ciascuno, tiro per colpire con incantesimi per raggio (assegnabili a bersagli diversi). +1 raggio per ogni slot superiore al 2°." },
  { id: "vista-nel-buio", name: "Vista nel Buio", level: 2, school: "trasmutazione", classes: ["warlock"], time: "1 azione", range: "Contatto", comp: "V, S, M", duration: "8 ore", desc: "Concede alla creatura toccata la capacità di vedere nell'oscurità totale.", crunch: "Nessun danno: scurovisione di 18 m per la durata." },
  { id: "levitazione", name: "Levitazione", level: 2, school: "trasmutazione", classes: ["mago", "stregone"], time: "1 azione", range: "18 m", comp: "V, S, M", duration: "Concentrazione, fino a 10 minuti", desc: "Fa levitare verticalmente una creatura o un oggetto, che il lanciatore può spingere o tirare.", crunch: "Nessun danno: TS Costituzione nega se non consenziente; il bersaglio sale/scende fino a 6 m per turno, movimento orizzontale solo se spinto o tirato." },
  { id: "vista-magica", name: "Vista Magica", level: 2, school: "divinazione", classes: ["bardo", "mago", "stregone", "warlock"], time: "1 azione", range: "Contatto", comp: "V, S, M", duration: "Concentrazione, fino a 1 ora", desc: "Il bersaglio può vedere le creature e gli oggetti invisibili come se fossero normalmente visibili.", crunch: "Nessun danno: vede l'invisibile e il Piano Etereo per la durata." },
  { id: "immagine-speculare", name: "Immagine Speculare", level: 2, school: "illusione", classes: ["mago", "stregone", "warlock"], time: "1 azione", range: "Personale", comp: "V, S", duration: "1 minuto", desc: "Crea tre duplicati illusori di se stessi, che possono assorbire gli attacchi in arrivo.", crunch: "Nessun danno: crea 3 duplicati con la tua CA; ogni attacco contro di te tira 1d20, se il risultato eguaglia o supera la CA di un duplicato l'attacco lo colpisce e lo distrugge invece di colpirti." },
  { id: "ripristinare-ferite-minori", name: "Ripristinare Ferite Minori", level: 2, school: "abiurazione", classes: ["bardo", "chierico", "druido", "paladino", "ranger"], time: "1 azione", range: "Contatto", comp: "V, S", duration: "Istantanea", desc: "Elimina una malattia o una condizione debilitante che affligge la creatura toccata.", crunch: "Nessun danno né cura: elimina una malattia o una condizione a scelta tra accecato, sordo, paralizzato o avvelenato che affligge il bersaglio." },
  { id: "potenziare-caratteristica", name: "Potenziare Caratteristica", level: 2, school: "trasmutazione", classes: ["bardo", "chierico", "druido", "stregone"], time: "1 azione", range: "Contatto", comp: "V, S, M", duration: "Concentrazione, fino a 1 ora", desc: "Concede vantaggio alle prove basate su una caratteristica scelta per il bersaglio.", crunch: "Nessun danno: vantaggio alle prove della caratteristica scelta per la durata, con effetto aggiuntivo legato alla caratteristica (es. Costituzione: vantaggio anche ai TS di Costituzione per resistere al veleno). +1 bersaglio per ogni slot superiore al 2°." },
  { id: "passo-spettrale", name: "Passo Spettrale", level: 2, school: "invocazione", classes: ["mago", "stregone", "warlock"], time: "1 azione bonus", range: "Personale", comp: "V", duration: "Istantanea", desc: "Si teletrasporta istantaneamente in un punto visibile entro breve distanza.", crunch: "Nessun danno: teletrasporto fino a 9 m in uno spazio libero visibile, come azione bonus." },
  { id: "palla-di-fuoco", name: "Palla di Fuoco", level: 3, school: "invocazione", classes: ["mago", "stregone"], time: "1 azione", range: "45 m", comp: "V, S, M", duration: "Istantanea", desc: "Un globo di fiamme esplode in un'area, incenerendo tutto ciò che vi si trova.", crunch: "8d6 danno da fuoco, sfera di 6 m di raggio; TS Destrezza dimezza. +1d6 per ogni slot superiore al 3°." },
  { id: "dissolvi-magie", name: "Dissolvi Magie", level: 3, school: "abiurazione", classes: ["mago", "chierico", "bardo"], time: "1 azione", range: "36 m", comp: "V, S", duration: "Istantanea", desc: "Interrompe un incantesimo attivo o una magia su un bersaglio.", crunch: "Nessun danno: interrompe automaticamente un incantesimo di livello pari o inferiore al tuo slot; per livelli superiori serve una prova di caratteristica incantatrice (CD 10 + livello dell'incantesimo)." },
  { id: "luce-del-giorno", name: "Luce del Giorno", level: 3, school: "invocazione", classes: ["chierico"], time: "1 azione", range: "18 m", comp: "V, S", duration: "1 ora", desc: "Crea una sfera di luce solare che disperde l'oscurità magica e non.", crunch: "Nessun danno diretto: sfera di luce intensa di 18 m di raggio; alcune creature (es. non morti sensibili al sole) subiscono effetti aggiuntivi indicati nel loro blocco statistico." },
  { id: "chiamare-fulmine", name: "Chiamare Fulmine", level: 3, school: "invocazione", classes: ["druido"], time: "1 azione", range: "36 m", comp: "V, S", duration: "Concentrazione, fino a 10 minuti", desc: "Richiama una colonna di fulmini dal cielo su un punto scelto, se c'è una nube sopra.", crunch: "3d10 danno da fulmine; TS Destrezza dimezza. Ripetibile ogni turno come azione. +1d10 per ogni slot superiore al 3°." },
  { id: "schema-ipnotico", name: "Schema Ipnotico", level: 3, school: "illusione", classes: ["bardo"], time: "1 azione", range: "36 m", comp: "S, M", duration: "Concentrazione, fino a 1 minuto", desc: "Un vortice di colori affascina le creature in un'area, lasciandole incantate.", crunch: "Nessun danno: TS Saggezza per ogni creatura nel cubo di 9 m; se fallito, resta affascinata (incapacitata, velocità 0) per la durata." },
  { id: "chiaroveggenza", name: "Chiaroveggenza", level: 3, school: "divinazione", classes: ["bardo"], time: "10 minuti", range: "1600 m", comp: "V, S, M", duration: "Concentrazione, fino a 10 minuti", desc: "Crea un sensore invisibile in un luogo noto, tramite cui vedere o udire.", crunch: "Nessun danno: percezione a distanza (vista o udito, a scelta) da un sensore invisibile in un punto noto entro 1600 m." },
  { id: "fulmine", name: "Fulmine", level: 3, school: "invocazione", classes: ["stregone"], time: "1 azione", range: "Linea di 30 m", comp: "V, S, M", duration: "Istantanea", desc: "Una scarica elettrica lineare colpisce tutto ciò che attraversa.", crunch: "8d6 danno da fulmine in una linea di 30 m x 1,5 m; TS Destrezza dimezza. +1d6 per ogni slot superiore al 3°." },
  { id: "contromagia", name: "Contromagia", level: 3, school: "abiurazione", classes: ["mago", "stregone", "warlock"], time: "1 reazione", range: "18 m", comp: "S", duration: "Istantanea", desc: "Interrompe un incantesimo che un'altra creatura sta lanciando.", crunch: "Nessun danno: annulla automaticamente un incantesimo di livello pari o inferiore al tuo slot; per livelli superiori serve una prova di caratteristica incantatrice (CD 10 + livello dell'incantesimo)." },
  { id: "volare", name: "Volare", level: 3, school: "trasmutazione", classes: ["mago", "stregone"], time: "1 azione", range: "Contatto", comp: "V, S, M", duration: "Concentrazione, fino a 10 minuti", desc: "Il bersaglio ottiene una velocità di volo di 18 metri per la durata.", crunch: "Nessun danno: velocità di volo di 18 m per la durata; se l'effetto termina in volo e non plana, cade. +1 bersaglio per ogni slot superiore al 3°." },
  { id: "velocita", name: "Velocità", level: 3, school: "trasmutazione", classes: ["mago", "stregone"], time: "1 azione", range: "9 m", comp: "V, S, M", duration: "Concentrazione, fino a 1 minuto", desc: "Raddoppia la velocità del bersaglio e gli concede un'azione e un bonus alla Classe Armatura.", crunch: "Nessun danno: velocità raddoppiata, +2 CA, vantaggio ai TS di Destrezza e un'azione aggiuntiva (Attacco singolo, Scattare, Disimpegnarsi, Nascondersi o oggetto) per la durata; alla fine, un turno di sfinimento (velocità 0)." },
  { id: "guardiani-spirituali", name: "Guardiani Spirituali", level: 3, school: "invocazione", classes: ["chierico"], time: "1 azione", range: "Personale", comp: "V, S, M", duration: "Concentrazione, fino a 10 minuti", desc: "Spiriti protettivi circondano il lanciatore, rallentando e ferendo i nemici vicini.", crunch: "3d8 danno radioso o necrotico (a tua scelta al lancio) alle creature ostili entro 4,5 m da te che iniziano il turno nell'area o vi entrano; TS Saggezza dimezza e nega il rallentamento (velocità dimezzata). +1d8 per ogni slot superiore al 3°." },
  { id: "tocco-vampirico", name: "Tocco Vampirico", level: 3, school: "necromanzia", classes: ["mago", "stregone", "warlock"], time: "1 azione", range: "Personale", comp: "V, S", duration: "Concentrazione, fino a 1 minuto", desc: "La mano del lanciatore drena energia vitale al tocco, curandolo di metà del danno inflitto.", crunch: "3d6 danno necrotico, tiro per colpire con incantesimi in mischia; recuperi PF pari a metà del danno inflitto. +1d6 per ogni slot superiore al 3°." },
  { id: "invisibilita-superiore", name: "Invisibilità Superiore", level: 4, school: "illusione", classes: ["mago", "stregone"], time: "1 azione", range: "Contatto", comp: "V, S", duration: "Concentrazione, fino a 1 minuto", desc: "Rende invisibile il bersaglio anche mentre attacca o lancia incantesimi.", crunch: "Nessun danno: il bersaglio è invisibile per la durata, anche mentre attacca o lancia incantesimi." },
  { id: "porta-dimensionale", name: "Porta Dimensionale", level: 4, school: "trasmutazione", classes: ["mago", "stregone", "warlock"], time: "1 azione", range: "150 m", comp: "V", duration: "Istantanea", desc: "Il lanciatore e un compagno si teletrasportano istantaneamente in un punto visibile.", crunch: "Nessun danno: teletrasporto fino a 150 m per te e un'altra creatura volontaria che tocchi; se la destinazione è occupata, entrambi subiscono 4d6 danno di forza e finite in uno spazio libero vicino." },
  { id: "liberta-di-movimento", name: "Libertà di Movimento", level: 4, school: "abiurazione", classes: ["chierico", "bardo"], time: "1 azione", range: "Contatto", comp: "V, S, M", duration: "1 ora", desc: "Il bersaglio ignora terreno difficile e non può essere paralizzato o immobilizzato.", crunch: "Nessun danno: il bersaglio ignora terreno difficile, non può essere paralizzato/immobilizzato/trattenuto e la velocità non è ridotta." },
  { id: "profezia", name: "Profezia", level: 4, school: "divinazione", classes: ["chierico"], time: "1 minuto", range: "Personale", comp: "V, S, M", duration: "Concentrazione, fino a 30 minuti", desc: "Rivela frammenti del futuro riguardo a un evento o una decisione imminente.", crunch: "Nessun danno: la tua divinità risponde a una domanda su un evento specifico entro 7 giorni, con un messaggio criptico (immagine, poesia, frase enigmatica)." },
  { id: "controllare-lacqua", name: "Controllare l'Acqua", level: 4, school: "trasmutazione", classes: ["druido"], time: "1 azione", range: "90 m", comp: "V, S, M", duration: "Concentrazione, fino a 10 minuti", desc: "Manipola livello, corrente o direzione di un grande volume d'acqua.", crunch: "Nessun danno diretto: innalza/abbassa il livello dell'acqua, crea onde/correnti o un vortice che può trascinare le creature al suo interno." },
  { id: "polimorfia", name: "Polimorfia", level: 4, school: "trasmutazione", classes: ["druido", "bardo"], time: "1 azione", range: "18 m", comp: "V, S, M", duration: "Concentrazione, fino a 1 ora", desc: "Trasforma una creatura bersaglio nella forma di una bestia.", crunch: "Nessun danno diretto: TS Saggezza nega se non consenziente; se fallito, il bersaglio assume il profilo di una bestia con GS pari o inferiore al suo livello (mantiene PF, INT/SAG/CAR), riprendendo forma normale se portato a 0 PF nella nuova forma." },
  { id: "bando", name: "Bando", level: 4, school: "ammaliamento", classes: ["warlock"], time: "1 azione", range: "18 m", comp: "V, S, M", duration: "Concentrazione, fino a 1 minuto", desc: "Tenta di esiliare una creatura verso un altro piano di esistenza.", crunch: "Nessun danno: TS Carisma nega; se fallito, il bersaglio è bandito in una tasca dimensionale (o rimandato al suo piano d'origine, se estraneo, allo scadere dell'incantesimo)." },
  { id: "muro-di-fuoco", name: "Muro di Fuoco", level: 4, school: "evocazione", classes: ["warlock"], time: "1 azione", range: "36 m", comp: "V, S, M", duration: "Concentrazione, fino a 1 minuto", desc: "Crea un muro di fiamme che infligge danno a chi lo attraversa.", crunch: "5d8 danno da fuoco a chi si trova nel muro al momento dell'evocazione o entra/inizia il turno nell'area; TS Destrezza dimezza. +1d8 per ogni slot superiore al 4°." },
  { id: "occhio-arcano", name: "Occhio Arcano", level: 4, school: "divinazione", classes: ["mago"], time: "1 azione", range: "150 m", comp: "V, S, M", duration: "Concentrazione, fino a 1 ora", desc: "Crea un occhio invisibile e volante che il lanciatore può muovere e usare per vedere.", crunch: "Nessun danno: crea un occhio invisibile volante (velocità 9 m) attraverso cui vedi e senti entro 150 m." },
  { id: "confusione", name: "Confusione", level: 4, school: "ammaliamento", classes: ["bardo", "druido", "mago", "stregone"], time: "1 azione", range: "27 m", comp: "V, S, M", duration: "Concentrazione, fino a 1 minuto", desc: "Le creature in un'area agiscono in modo imprevedibile, incapaci di seguire un piano.", crunch: "Nessun danno diretto: TS Saggezza per ogni creatura nella sfera di 3 m (ripetibile a ogni turno); se fallito, tira su una tabella d100 per determinare l'azione casuale del turno (vagare, non agire, attaccare la creatura più vicina, ecc.)." },
  { id: "tempesta-di-ghiaccio", name: "Tempesta di Ghiaccio", level: 4, school: "invocazione", classes: ["druido", "mago"], time: "1 azione", range: "90 m", comp: "V, S, M", duration: "Istantanea", desc: "Grandine e schegge di ghiaccio flagellano un'area, ferendo tutti al suo interno.", crunch: "2d8 danno contundente + 4d6 danno freddo; TS Destrezza dimezza entrambi. +1d8 danno contundente per ogni slot superiore al 4°." },
  { id: "pelle-di-pietra", name: "Pelle di Pietra", level: 4, school: "abiurazione", classes: ["druido", "mago", "ranger", "stregone"], time: "1 azione", range: "Contatto", comp: "V, S, M", duration: "Concentrazione, fino a 1 ora", desc: "Concede resistenza a tutto il danno non magico da arma alla creatura toccata.", crunch: "Nessun danno: resistenza a tutto il danno contundente/perforante/tagliente non magico per la durata." },
  { id: "guardiano-di-fede", name: "Guardiano di Fede", level: 4, school: "invocazione", classes: ["chierico"], time: "1 azione bonus", range: "9 m", comp: "V", duration: "Concentrazione, fino a 8 ore", desc: "Evoca una sentinella spettrale che colpisce chiunque si avvicini ostilmente.", crunch: "20 danno radioso alla prima creatura ostile che entra nel suo spazio o inizia lì il turno; TS Saggezza nega. Il guardiano svanisce dopo aver inflitto 60 danni totali." },
  { id: "muro-di-forza", name: "Muro di Forza", level: 5, school: "evocazione", classes: ["mago", "stregone"], time: "1 azione", range: "36 m", comp: "V, S, M", duration: "Concentrazione, fino a 10 minuti", desc: "Crea una barriera invisibile e indistruttibile per la durata dell'incantesimo.", crunch: "Nessun danno: muro di forza invisibile e indistruttibile (10 pannelli da 3 m), impenetrabile a tutto tranne Disintegrare e il Piano Etereo." },
  { id: "scrutare", name: "Scrutare", level: 5, school: "divinazione", classes: ["mago", "bardo", "warlock"], time: "10 minuti", range: "Personale", comp: "V, S, M", duration: "Concentrazione, fino a 10 minuti", desc: "Crea un sensore invisibile vicino a una creatura nota, per vederla e udirla.", crunch: "Nessun danno: TS Saggezza del bersaglio (svantaggiato se ostile/diffidente) nega; se fallito, crei un sensore invisibile vicino a lui per vedere e udire." },
  { id: "cura-ferite-di-gruppo", name: "Cura Ferite di Gruppo", level: 5, school: "evocazione", classes: ["chierico"], time: "1 azione", range: "18 m", comp: "V, S", duration: "Istantanea", desc: "Guarisce fino a sei creature scelte entro portata in un solo istante.", crunch: "Cura 3d8 + mod. caratteristica incantatrice, distribuita tra un massimo di 6 creature a tua scelta; +1d8 per ogni slot superiore al 5°." },
  { id: "riportare-in-vita", name: "Riportare in Vita", level: 5, school: "necromanzia", classes: ["chierico"], time: "1 ora", range: "Contatto", comp: "V, S, M", duration: "Istantanea", desc: "Riporta in vita una creatura morta da non più di 10 giorni, a patto che il corpo esista ancora.", crunch: "Nessun danno: riporta in vita con 1 PF una creatura morta da non più di 10 giorni; non ripristina arti perduti né cura la causa della morte." },
  { id: "reincarnazione", name: "Reincarnazione", level: 5, school: "trasmutazione", classes: ["druido"], time: "1 ora", range: "Contatto", comp: "V, S, M", duration: "Istantanea", desc: "Riporta in vita una creatura morta di recente in un nuovo corpo casuale.", crunch: "Nessun danno: riporta in vita una creatura morta da non più di 10 giorni in un corpo nuovo (specie determinata tirando 1d100), con PF pieni." },
  { id: "muro-di-pietra", name: "Muro di Pietra", level: 5, school: "evocazione", classes: ["druido"], time: "1 azione", range: "36 m", comp: "V, S, M", duration: "Concentrazione, fino a 10 minuti", desc: "Crea un muro di pietra non magica di forma e spessore a scelta.", crunch: "Nessun danno: fino a 10 pannelli di pietra da 3 m, forma libera; ogni pannello ha 30 PF e può essere sfondato (CA 15)." },
  { id: "sogno", name: "Sogno", level: 5, school: "illusione", classes: ["bardo"], time: "1 minuto", range: "Speciale", comp: "V, S, M", duration: "8 ore", desc: "Invia un messaggio o un'immagine nei sogni di una creatura nota.", crunch: "Se usato come incubo: 3d6 danno psichico e nessun beneficio dal riposo per il bersaglio; altrimenti nessun danno, solo un messaggio/immagine onirica." },
  { id: "telecinesi", name: "Telecinesi", level: 5, school: "trasmutazione", classes: ["stregone"], time: "1 azione", range: "18 m", comp: "V, S", duration: "Concentrazione, fino a 10 minuti", desc: "Muove o manipola oggetti e creature con la sola forza della mente.", crunch: "Nessun danno diretto: sposta un oggetto/creatura fino a 9 m per turno (TS Forza per creature/oggetti non ancorati non consenzienti) o effettua una prova di Forza (Atletica) contrapposta per lottare con un bersaglio." },
  { id: "contattare-altro-piano", name: "Contattare un Altro Piano", level: 5, school: "divinazione", classes: ["warlock"], time: "1 minuto", range: "Personale", comp: "V", duration: "1 minuto", desc: "Apre la mente a un'entità di un altro piano per porle alcune domande.", crunch: "TS Intelligenza CD 15 o 6d6 danno psichico e sei stordito per 1d10 minuti; se superato, poni fino a 5 domande a un'entità extraplanare (risposte non garantite veritiere)." },
  { id: "immobilizzare-mostro", name: "Immobilizzare Mostro", level: 5, school: "ammaliamento", classes: ["bardo", "mago", "stregone", "warlock"], time: "1 azione", range: "27 m", comp: "V, S, M", duration: "Concentrazione, fino a 1 minuto", desc: "Paralizza qualsiasi creatura, non solo umanoidi, se fallisce il tiro salvezza sulla Saggezza.", crunch: "Nessun danno: TS Saggezza nega (ripetibile a fine turno); se fallito, la creatura (di qualsiasi tipo) è paralizzata per la durata. +1 bersaglio per ogni slot superiore al 5°." },
  { id: "cono-di-freddo", name: "Cono di Freddo", level: 5, school: "invocazione", classes: ["mago", "stregone"], time: "1 azione", range: "Cono di 18 m", comp: "V, S, M", duration: "Istantanea", desc: "Un cono di aria gelida si propaga dalle mani, infliggendo danno freddo a tutti al suo interno.", crunch: "8d8 danno freddo; TS Costituzione dimezza. +1d8 per ogni slot superiore al 5°." },
  { id: "ripristino-superiore", name: "Ripristino Superiore", level: 5, school: "abiurazione", classes: ["bardo", "chierico", "druido"], time: "1 azione", range: "Contatto", comp: "V, S, M", duration: "Istantanea", desc: "Elimina un effetto debilitante duraturo, come una riduzione di caratteristica o una maledizione.", crunch: "Nessun danno né cura: elimina un livello di sfinimento, oppure una riduzione di caratteristica, oppure charme/pietrificazione/maledizione/trasformazione, oppure la riduzione dei PF massimi." },
  { id: "passamuro", name: "Passamuro", level: 5, school: "trasmutazione", classes: ["mago"], time: "1 azione", range: "9 m", comp: "V, S, M", duration: "1 ora", desc: "Crea un passaggio attraverso legno, gesso o pietra, abbastanza ampio da farci passare.", crunch: "Nessun danno: passaggio fino a 1,5 m x 3 m x 6 m di profondità attraverso legno/gesso/pietra, per la durata." },
  { id: "dominare-persona", name: "Dominare Persona", level: 5, school: "ammaliamento", classes: ["bardo", "mago", "stregone"], time: "1 azione", range: "18 m", comp: "V, S", duration: "Concentrazione, fino a 1 minuto", desc: "Tenta di soggiogare la mente di un umanoide, che il lanciatore può poi guidare con la volontà.", crunch: "Nessun danno: TS Saggezza nega (ripetibile ogni volta che il bersaglio subisce danno, e a fine turno se controllato passivamente); se fallito, il bersaglio è affascinato e puoi guidarne le azioni." },
  { id: "vero-vedere", name: "Vero Vedere", level: 6, school: "divinazione", classes: ["warlock"], time: "1 azione", range: "Contatto", comp: "V, S, M", duration: "1 ora", desc: "Concede la capacità di vedere attraverso illusioni, trasformazioni e l'oscurità magica.", crunch: "Nessun danno: vera vista (illusioni, forme trasformate, oscurità magica), scurovisione 36 m e vista sul Piano Etereo per 1 ora." },
  { id: "globo-di-invulnerabilita", name: "Globo di Invulnerabilità", level: 6, school: "abiurazione", classes: ["mago"], time: "1 azione", range: "Personale", comp: "V, S, M", duration: "Concentrazione, fino a 1 minuto", desc: "Una sfera invisibile blocca tutti gli incantesimi di livello 5 o inferiore lanciati dall'esterno.", crunch: "Nessun danno: sfera di 3 m che blocca ogni incantesimo di 5° livello o inferiore lanciato dall'esterno verso l'interno." },
  { id: "guarigione-suprema", name: "Guarigione Suprema", level: 6, school: "evocazione", classes: ["chierico", "druido"], time: "1 azione", range: "18 m", comp: "V, S", duration: "Istantanea", desc: "Cura una quantità ingente di punti ferita ed elimina malattie e la maggior parte delle condizioni.", crunch: "Cura 70 PF + 10 per ogni slot superiore al 6°; elimina anche cecità, sordità e ogni malattia dal bersaglio." },
  { id: "parola-di-richiamo", name: "Parola di Richiamo", level: 6, school: "evocazione", classes: ["chierico"], time: "1 azione", range: "Contatto", comp: "V", duration: "Istantanea", desc: "Teletrasporta il lanciatore e fino a cinque alleati verso un santuario prescelto in precedenza.", crunch: "Nessun danno: teletrasporta te e fino a 5 alleati volontari entro 9 m verso un santuario legato in precedenza." },
  { id: "occhio-malvagio-superiore", name: "Occhio Malvagio Superiore", level: 6, school: "trasmutazione", classes: ["bardo", "mago", "stregone", "warlock"], time: "1 azione", range: "Personale", comp: "V, S, M", duration: "Concentrazione, fino a 1 minuto", desc: "Lo sguardo del lanciatore può accecare, addormentare, paralizzare o avvelenare chi lo incontra.", crunch: "Nessun danno diretto: come azione, fissi una creatura entro 27 m per un effetto a scelta (Ipersonno, Panico Sconvolgente, Malessere Nauseante); TS Costituzione o Saggezza (a seconda dell'effetto) nega." },
  { id: "evocare-i-fatati", name: "Evocare i Fatati", level: 6, school: "invocazione", classes: ["druido", "warlock"], time: "1 azione", range: "18 m", comp: "V, S, M", duration: "Concentrazione, fino a 1 ora", desc: "Richiama uno spirito fatato che assume una forma bestiale o simile a un folletto per combattere al suo fianco.", crunch: "Nessun danno diretto: evoca uno spirito fatato con GS fino a 6 (il suo danno dipende dal profilo scelto), sotto il tuo controllo per la durata." },
  { id: "muro-di-ghiaccio", name: "Muro di Ghiaccio", level: 6, school: "invocazione", classes: ["mago", "stregone"], time: "1 azione", range: "36 m", comp: "V, S, M", duration: "Concentrazione, fino a 10 minuti", desc: "Crea una parete di ghiaccio che può bloccare il passaggio o intrappolare i nemici.", crunch: "10d6 danno freddo a chi si trova nello spazio del muro quando appare; TS Destrezza dimezza. Ogni pannello ha 30 PF (immune al freddo, vulnerabile al fuoco); una volta distrutto un pannello, chi vi era adiacente subisce 2d6 danno freddo (TS Costituzione dimezza)." },
  { id: "disintegrare", name: "Disintegrare", level: 6, school: "trasmutazione", classes: ["mago", "stregone"], time: "1 azione", range: "18 m", comp: "V, S, M", duration: "Istantanea", desc: "Un sottile raggio verdastro disintegra un bersaglio o un grande oggetto non magico, riducendolo in polvere.", crunch: "10d6 + 40 danno di forza; TS Destrezza nega interamente il danno. Se il danno porta il bersaglio a 0 PF, viene disintegrato in polvere. +3d6 per ogni slot superiore al 6°." },
  { id: "vincolo-planare", name: "Vincolo Planare", level: 6, school: "abiurazione", classes: ["chierico", "druido", "mago", "warlock"], time: "1 ora", range: "18 m", comp: "V, S, M", duration: "24 ore", desc: "Costringe una creatura extraplanare a servire il lanciatore per tutta la durata dell'incantesimo.", crunch: "Nessun danno: TS Carisma nega (con svantaggio se hai già ridotto il bersaglio a 0 PF o l'hai catturato); se fallito, la creatura è vincolata a servire per la durata (1 giorno; slot più alti estendono a 10 giorni, 30 giorni o 1 anno)." },
  { id: "catena-di-fulmini", name: "Catena di Fulmini", level: 6, school: "evocazione", classes: ["mago", "stregone"], time: "1 azione", range: "45 m", comp: "V, S, M", duration: "Istantanea", desc: "Un fulmine biforcuto scatta verso il bersaglio principale e fino a tre bersagli secondari vicini.", crunch: "10d8 danno da fulmine per bersaglio (fino a 4 bersagli, ciascuno entro 9 m dal primo); TS Destrezza dimezza per ognuno. +1d8 per ogni slot superiore al 6°." },
  { id: "raggio-di-sole", name: "Raggio di Sole", level: 6, school: "evocazione", classes: ["druido", "mago", "stregone"], time: "1 azione", range: "Personale (linea di 18 m)", comp: "V, S, M", duration: "Concentrazione, fino a 1 minuto", desc: "Un raggio di luce radiosa acceca e brucia ogni creatura lungo la linea, ripetibile nei turni successivi.", crunch: "6d8 danno radioso in una linea di 18 m x 1,5 m; TS Costituzione dimezza il danno e nega l'accecamento fino al tuo prossimo turno. Ripetibile come azione a ogni turno mentre mantieni la concentrazione." },
  { id: "palla-di-fuoco-ritardata", name: "Palla di Fuoco Ritardata", level: 7, school: "invocazione", classes: ["mago", "stregone"], time: "1 azione", range: "45 m", comp: "V, S, M", duration: "Concentrazione, fino a 1 minuto", desc: "Crea una sfera di fuoco che può essere fatta detonare subito o con un ritardo scelto dal lanciatore.", crunch: "12d6 danno da fuoco (+1d6 per ogni turno di ritardo, fino a 6 turni, e +1d6 per ogni slot superiore al 7°); TS Destrezza dimezza. Se toccata prima di esplodere, detona subito." },
  { id: "teletrasporto", name: "Teletrasporto", level: 7, school: "invocazione", classes: ["bardo", "mago", "stregone"], time: "1 azione", range: "3 m", comp: "V", duration: "Istantanea", desc: "Trasporta istantaneamente il lanciatore e fino a otto alleati verso una destinazione nota.", crunch: "Nessun danno: teletrasporta fino a 8 creature verso una destinazione nota; l'affidabilità (da 'fallimento' a 'esatto') dipende da quanto conosci bene il luogo." },
  { id: "prigione-delle-forze", name: "Prigione delle Forze", level: 7, school: "invocazione", classes: ["bardo", "mago", "warlock"], time: "1 azione", range: "27 m", comp: "V, S, M", duration: "Concentrazione, fino a 1 ora", desc: "Intrappola una creatura in una gabbia di forza invisibile e indistruttibile.", crunch: "Nessun danno: TS Carisma nega (svantaggio se il bersaglio è invisibile); se fallito, resta intrappolato in una gabbia di forza indistruttibile di 3 m per la durata." },
  { id: "resurrezione", name: "Resurrezione", level: 7, school: "necromanzia", classes: ["chierico"], time: "1 ora", range: "Contatto", comp: "V, S, M", duration: "Istantanea", desc: "Riporta in vita una creatura morta da non più di un secolo, restituendole un corpo integro e sano.", crunch: "Nessun danno: riporta in vita con PF pieni una creatura morta da non più di 100 anni, guarendo qualsiasi ferita o malattia (non l'invecchiamento)." },
  { id: "piano-astrale", name: "Piano Astrale", level: 7, school: "invocazione", classes: ["chierico", "druido", "mago", "stregone", "warlock"], time: "1 azione", range: "Contatto", comp: "V", duration: "Istantanea", desc: "Trasporta fino a otto creature volontarie verso un altro piano di esistenza a scelta.", crunch: "Nessun danno per un bersaglio consenziente. Contro un bersaglio non consenziente: tiro per colpire con incantesimi in mischia; se colpisce, TS Carisma nega il bando sul piano scelto." },
  { id: "rigenerazione", name: "Rigenerazione", level: 7, school: "trasmutazione", classes: ["bardo", "chierico", "druido"], time: "1 minuto", range: "Contatto", comp: "V, S, M", duration: "1 ora", desc: "Il bersaglio ripristina gradualmente punti ferita ogni turno e ricresce arti perduti nel tempo.", crunch: "Cura 4d8 + 15 PF immediati, poi 1 PF ogni 10 minuti per la durata; arti/organi perduti ricrescono in 2 minuti se il bersaglio resta sopra 0 PF per l'intera durata." },
  { id: "simbolo", name: "Simbolo", level: 7, school: "abiurazione", classes: ["bardo", "chierico", "mago"], time: "1 minuto", range: "Contatto", comp: "V, S, M", duration: "Finché non viene dissolto o attivato", desc: "Iscrive un glifo magico invisibile che scatena un potente effetto quando qualcuno lo attiva.", crunch: "Effetto variabile in base al glifo scelto: es. Morte = 10d10 danno necrotico (TS Costituzione dimezza), altri glifi (Follia, Dolore, Sonno, Paura, Discordia, Stordimento, Scrutare) non infliggono danno diretto ma impongono condizioni." },
  { id: "inversione-di-gravita", name: "Inversione di Gravità", level: 7, school: "trasmutazione", classes: ["druido", "mago", "stregone"], time: "1 azione", range: "30 m", comp: "V, S, M", duration: "Concentrazione, fino a 1 minuto", desc: "Inverte la gravità in un'area cubica: le creature e gli oggetti al suo interno cadono verso l'alto.", crunch: "Nessun danno diretto dall'incantesimo: TS Destrezza per non cadere verso l'alto; quando l'effetto termina o il bersaglio esce dall'area, ricade subendo danno da caduta normale." },
  { id: "dito-della-morte", name: "Dito della Morte", level: 7, school: "necromanzia", classes: ["mago", "stregone", "warlock"], time: "1 azione", range: "18 m", comp: "V, S", duration: "Istantanea", desc: "Un dito puntato scaglia energia necrotica letale contro un singolo bersaglio.", crunch: "7d8 + 30 danno necrotico; TS Costituzione dimezza. Un umanoide ucciso da questo danno risorge al tuo prossimo turno come zombie sotto il tuo controllo permanente." },
  { id: "terremoto", name: "Terremoto", level: 8, school: "evocazione", classes: ["chierico", "druido", "stregone"], time: "1 azione", range: "150 m", comp: "V, S, M", duration: "Concentrazione, fino a 1 minuto", desc: "Il terreno in una vasta area trema violentemente, aprendo crepacci e abbattendo strutture.", crunch: "Nessun danno diretto dal tremore: TS Costituzione o prono per ogni creatura al suolo nell'area (sfera di 30 m). Crepacci opzionali causano danno da caduta; strutture che crollano infliggono 5d6 danno contundente (TS Destrezza dimezza) a chi è nei paraggi." },
  { id: "dominare-mostro", name: "Dominare Mostro", level: 8, school: "ammaliamento", classes: ["bardo", "mago", "stregone", "warlock"], time: "1 azione", range: "18 m", comp: "V, S", duration: "Concentrazione, fino a 1 ora", desc: "Come Dominare Persona, ma efficace su qualsiasi tipo di creatura.", crunch: "Nessun danno: TS Saggezza nega (ripetibile ogni volta che il bersaglio subisce danno); come Dominare Persona ma su qualunque tipo di creatura." },
  { id: "clone", name: "Clone", level: 8, school: "necromanzia", classes: ["mago"], time: "1 ora", range: "Contatto", comp: "V, S, M", duration: "Istantanea", desc: "Cresce un duplicato inerte di una creatura, in cui la sua coscienza si trasferisce se muore.", crunch: "Nessun danno: crea un duplicato inerte (in un contenitore, cresce in 120 giorni) di una creatura; se l'originale muore, la sua anima e i suoi PF pieni si trasferiscono nel clone." },
  { id: "antipatia-simpatia", name: "Antipatia/Simpatia", level: 8, school: "ammaliamento", classes: ["druido", "mago"], time: "1 ora", range: "18 m", comp: "V, S, M", duration: "10 giorni", desc: "Rende un oggetto o un luogo irresistibilmente attraente oppure repellente per un tipo di creatura scelto.", crunch: "Nessun danno: TS Saggezza (ripetibile ogni ora se in Antipatia) per il tipo di creatura scelto; se fallito è respinta/attratta dal bersaglio per la durata." },
  { id: "fulgore-solare", name: "Fulgore Solare", level: 8, school: "evocazione", classes: ["druido", "mago", "stregone"], time: "1 azione", range: "Personale (sfera di 18 m)", comp: "V, S, M", duration: "Istantanea", desc: "Un'esplosione di luce solare acceca e infligge danno radioso a ogni creatura in una vasta area.", crunch: "12d6 danno radioso; TS Costituzione dimezza il danno e nega l'accecamento (fino a 1 minuto, con TS di ripetizione ogni turno)." },
  { id: "ottundere-la-mente", name: "Ottundere la Mente", level: 8, school: "ammaliamento", classes: ["bardo", "druido", "mago", "stregone", "warlock"], time: "1 azione", range: "45 m", comp: "V, S, M", duration: "Istantanea", desc: "Assale la mente di un bersaglio con energia psichica devastante, riducendone drasticamente Intelligenza e Carisma.", crunch: "4d6 danno psichico; TS Intelligenza dimezza il danno e nega l'effetto secondario. Se fallito, Intelligenza e Carisma del bersaglio scendono a 1 finché non viene curato con Guarigione Suprema, Desiderio o simili." },
  { id: "parola-di-potere-stordire", name: "Parola di Potere: Stordire", level: 8, school: "ammaliamento", classes: ["bardo", "mago", "stregone", "warlock"], time: "1 azione", range: "18 m", comp: "V", duration: "Istantanea", desc: "Pronuncia una parola di potere che stordisce istantaneamente un bersaglio con PF sufficientemente bassi.", crunch: "Nessun danno, nessun tiro per colpire né TS: se il bersaglio ha 150 PF o meno è automaticamente stordito (TS Costituzione a fine turno per liberarsi); altrimenti nessun effetto." },
  { id: "labirinto", name: "Labirinto", level: 8, school: "evocazione", classes: ["mago", "warlock"], time: "1 azione", range: "18 m", comp: "V, S, M", duration: "Concentrazione, fino a 10 minuti", desc: "Bandisce un bersaglio in un labirinto extradimensionale da cui deve trovare la via d'uscita.", crunch: "Nessun danno: bandisce il bersaglio in un labirinto extradimensionale; può tentare una prova di Intelligenza CD 20 al termine di ogni suo turno per fuggire (le bestie con Intelligenza 1 o meno fuggono automaticamente al 1° tentativo)." },
  { id: "aura-sacra", name: "Aura Sacra", level: 8, school: "abiurazione", classes: ["chierico"], time: "1 azione", range: "Personale (sfera 9 m)", comp: "V, S, M", duration: "Concentrazione, fino a 1 minuto", desc: "Gli alleati nell'aura ottengono vantaggio ai TS, mentre i nemici che li attaccano in mischia hanno svantaggio; le creature malvagie che colpiscono un alleato possono essere accecate.", crunch: "Nessun danno diretto: vantaggio ai TS per gli alleati nella sfera di 9 m; le creature ostili hanno svantaggio ad attaccarli in mischia. Se una creatura malvagia colpisce in mischia un alleato protetto, deve superare un TS Costituzione o essere accecata per la durata." },
  { id: "campo-antimagia", name: "Campo Antimagia", level: 8, school: "abiurazione", classes: ["chierico", "mago"], time: "1 azione", range: "Personale (sfera 3 m)", comp: "V, S, M", duration: "Concentrazione, fino a 1 ora", desc: "Sopprime ogni magia, incantesimo e oggetto magico all'interno di una sfera che si muove col lanciatore.", crunch: "Nessun danno: sopprime incantesimi, oggetti magici ed effetti magici (incluse evocazioni, che vengono temporaneamente bandite) nella sfera di 3 m che si muove con te." },
  { id: "desiderio", name: "Desiderio", level: 9, school: "invocazione", classes: ["mago", "stregone"], time: "1 azione", range: "Personale", comp: "V", duration: "Istantanea", desc: "L'incantesimo più potente che esista: duplica qualsiasi altro incantesimo di livello 8 o inferiore, o realizza un effetto a scelta del lanciatore.", crunch: "Nessun danno se usato per duplicare un incantesimo. Per effetti più ambiziosi: 1d20 al lancio, con 1 = non potrai mai più lanciare Desiderio, 2-8 = 1d10×10 danno necrotico e sfinimento per lo sforzo." },
  { id: "meteore", name: "Meteore", level: 9, school: "invocazione", classes: ["mago", "stregone"], time: "1 azione", range: "1 km", comp: "V, S", duration: "Istantanea", desc: "Frammenti di roccia fiammeggiante piovono dal cielo su un'area vastissima, devastando tutto.", crunch: "4 meteore, ciascuna sfera di 12 m: 20d6 danno da fuoco + 20d6 danno contundente per sfera; TS Destrezza dimezza. Una creatura toccata da più sfere subisce il danno di ciascuna." },
  { id: "immobilita-temporale", name: "Immobilità Temporale", level: 9, school: "trasmutazione", classes: ["mago", "stregone"], time: "1 azione", range: "Personale", comp: "V", duration: "Istantanea", desc: "Il tempo si ferma per tutti tranne il lanciatore, che agisce liberamente per alcuni turni.", crunch: "Nessun danno diretto: agisci liberamente per 1d4+1 turni consecutivi (azione, azione bonus, movimento ogni turno); l'effetto termina subito se usi un'azione che tocca un'altra creatura o un oggetto indossato/trasportato da altri." },
  { id: "tempesta-divina", name: "Tempesta Divina", level: 9, school: "invocazione", classes: ["druido"], time: "1 azione", range: "Vista", comp: "V, S, M", duration: "Concentrazione, fino a 1 ora", desc: "Scatena una tempesta implacabile su una vasta area, con fulmini, grandine e venti furiosi.", crunch: "Effetto crescente per round in un cilindro di 720 m: tuono (assordati), poi 1d6 danno da acido/turno, poi fino a 5 fulmini da 10d6 danno da fulmine ciascuno (TS Destrezza dimezza), poi vento fortissimo, infine 2d6 danno contundente da grandine (TS Destrezza dimezza)." },
  { id: "portale", name: "Portale", level: 9, school: "invocazione", classes: ["chierico", "mago"], time: "1 azione", range: "18 m", comp: "V, S, M", duration: "Concentrazione, fino a 1 minuto", desc: "Apre un varco circolare verso un luogo preciso su un altro piano di esistenza.", crunch: "Nessun danno: apre un portale bidirezionale verso un luogo specifico su un altro piano per la durata." },
  { id: "resurrezione-vera", name: "Resurrezione Vera", level: 9, school: "necromanzia", classes: ["bardo", "chierico", "druido"], time: "1 ora", range: "Contatto", comp: "V, S, M", duration: "Istantanea", desc: "Riporta in vita chiunque sia morto da non più di duecento anni, anche senza un corpo, creandogliene uno nuovo.", crunch: "Nessun danno: riporta in vita con PF pieni chiunque sia morto da non più di 200 anni, creando un nuovo corpo se necessario e curando ogni malattia o veleno." },
  { id: "cambiaforma", name: "Cambiaforma", level: 9, school: "trasmutazione", classes: ["druido", "mago"], time: "1 azione", range: "Personale", comp: "V, S, M", duration: "Concentrazione, fino a 1 ora", desc: "Il lanciatore assume la forma di qualsiasi creatura conosciuta, ottenendone statistiche e capacità.", crunch: "Nessun danno diretto: assumi il profilo di qualsiasi creatura tu abbia visto (GS pari o inferiore al tuo livello), mantenendo la tua mente; il danno inflitto dipende dalla forma scelta." },
  { id: "mente-impenetrabile", name: "Mente Impenetrabile", level: 9, school: "abiurazione", classes: ["bardo", "mago", "stregone"], time: "1 azione", range: "Contatto", comp: "V, S", duration: "24 ore", desc: "Rende il bersaglio immune a divinazione, controllo mentale e danno psichico per un giorno intero.", crunch: "Nessun danno: immunità a divinazione, lettura/controllo mentale e danno psichico per 24 ore." },
  { id: "prescienza", name: "Prescienza", level: 9, school: "divinazione", classes: ["bardo", "druido", "mago", "warlock"], time: "1 minuto", range: "Contatto", comp: "V, S, M", duration: "8 ore", desc: "Concede al bersaglio una percezione soprannaturale degli eventi imminenti: vantaggio a tiri per colpire, prove e TS, e svantaggio agli attacchi contro di lui.", crunch: "Nessun danno: per la durata il bersaglio ha vantaggio a tiri per colpire, prove e TS, non può essere colto di sorpresa e gli attacchi contro di lui hanno svantaggio." },
  { id: "fuoco-fatato", name: "Fuoco Fatato", level: 1, school: "invocazione", classes: ["bardo", "druido", "ranger"], time: "1 azione", range: "18 m", comp: "V", duration: "Concentrazione, fino a 1 minuto", desc: "Ricopre le creature in un'area di luce fatata, rendendole visibili anche se invisibili.", crunch: "Nessun danno: TS Destrezza per ogni creatura nel cubo di 6 m; se fallito resta delineata (visibile anche se invisibile) e ogni attacco contro di essa ha vantaggio, per la durata." },
  { id: "favore-divino", name: "Favore Divino", level: 1, school: "ammaliamento", classes: ["paladino"], time: "1 azione bonus", range: "Personale", comp: "V", duration: "Concentrazione, fino a 1 minuto", desc: "Le armi del lanciatore risplendono di energia divina, infliggendo danno radioso extra sui prossimi colpi.", crunch: "Nessun danno all'atto del lancio: i tuoi attacchi con arma infliggono +1d4 danno radioso per la durata." },
  { id: "nube-di-nebbia", name: "Nube di Nebbia", level: 1, school: "invocazione", classes: ["druido", "ranger", "mago", "stregone"], time: "1 azione", range: "36 m", comp: "V, S", duration: "Concentrazione, fino a 1 ora", desc: "Riempie un'area di nebbia densa, offuscando la vista di tutti al suo interno.", crunch: "Nessun danno: sfera di 6 m di nebbia che ostacola gravemente la vista per la durata." },
  { id: "onda-tonante", name: "Onda Tonante", level: 1, school: "evocazione", classes: ["bardo", "druido", "mago", "stregone"], time: "1 azione", range: "Personale", comp: "V, S", duration: "Istantanea", desc: "Un'onda d'urto tonante respinge le creature vicine e infligge loro danno.", crunch: "2d8 danno tonante alle creature in un cubo di 4,5 m da te; TS Costituzione dimezza e nega la spinta di 3 m. +1d8 per ogni slot superiore al 1°." },
  { id: "parlare-con-gli-animali", name: "Parlare con gli Animali", level: 1, school: "divinazione", classes: ["bardo", "druido", "ranger"], time: "1 azione", range: "Personale", comp: "V, S", duration: "10 minuti", desc: "Permette di comprendere e comunicare con gli animali per la durata.", crunch: "Nessun danno: comprendi e comunichi con animali per la durata; rituale." },
  { id: "travestimento", name: "Travestimento", level: 1, school: "illusione", classes: ["bardo", "mago", "stregone"], time: "1 azione", range: "Personale", comp: "V, S", duration: "1 ora", desc: "Altera il proprio aspetto illusorio, cambiando volto, altezza e vestiti per la durata.", crunch: "Nessun danno: illusione del tuo aspetto (altezza ±30 cm); un'indagine attiva la smaschera con una prova di Intelligenza contro la tua CD incantesimi." },
  { id: "falsa-vita", name: "Falsa Vita", level: 1, school: "necromanzia", classes: ["mago", "stregone"], time: "1 azione", range: "Personale", comp: "V, S, M", duration: "1 ora", desc: "Avvolge il lanciatore di forza vitale artificiale, concedendogli punti ferita temporanei.", crunch: "Nessun danno: 1d4 + 4 punti ferita temporanei per la durata; +5 PF temporanei per ogni slot superiore al 1°." },
  { id: "raggio-nauseante", name: "Raggio Nauseante", level: 1, school: "necromanzia", classes: ["mago", "stregone"], time: "1 azione", range: "18 m", comp: "V, S, M", duration: "Istantanea", desc: "Un raggio velenoso infligge danno da veleno e può indebolire fisicamente il bersaglio.", crunch: "2d8 danno da veleno, tiro per colpire con incantesimi; se colpisce, TS Costituzione o avvelenato (svantaggio ad attacchi e prove di caratteristica) fino al tuo prossimo turno. +1d8 per ogni slot superiore al 1°." },
  { id: "arma-spirituale", name: "Arma Spirituale", level: 2, school: "evocazione", classes: ["chierico"], time: "1 azione bonus", range: "18 m", comp: "V, S", duration: "1 minuto", desc: "Crea un'arma spettrale che colpisce un bersaglio; può essere richiamata come azione bonus nei turni successivi.", crunch: "1d8 + mod. caratteristica incantatrice danno di forza, tiro per colpire con incantesimi; +1d8 ogni 2 slot superiori al 2° (4°, 6°, ecc.)." },
  { id: "arma-magica", name: "Arma Magica", level: 2, school: "trasmutazione", classes: ["mago", "paladino"], time: "1 azione", range: "Contatto", comp: "V, S, M", duration: "Concentrazione, fino a 1 ora", desc: "Rende magica un'arma non magica, concedendole un bonus ad attacco e danno.", crunch: "Nessun danno diretto: +1 ai tiri per colpire e ai danni dell'arma per la durata (+2 con uno slot di 4°, +3 con uno slot di 6°)." },
  { id: "raffica-di-vento", name: "Raffica di Vento", level: 2, school: "evocazione", classes: ["druido", "mago", "stregone"], time: "1 azione", range: "Personale", comp: "V, S", duration: "Concentrazione, fino a 1 minuto", desc: "Un forte vento spazza via nebbie e disperde gas, spingendo indietro le creature più leggere.", crunch: "Nessun danno: TS Forza in una linea di 18 m; se fallito, la creatura è spinta di 4,5 m lontano da te. Ripetibile come azione a ogni turno." },
  { id: "frantumare", name: "Frantumare", level: 2, school: "evocazione", classes: ["bardo", "mago", "stregone"], time: "1 azione", range: "18 m", comp: "V, S, M", duration: "Istantanea", desc: "Un suono acuto e stridente danneggia le creature in un'area e può incrinare oggetti fragili.", crunch: "3d8 danno tonante nella sfera di 3 m; TS Costituzione dimezza (svantaggio per costrutti e oggetti fatti di metallo o pietra). +1d8 per ogni slot superiore al 2°." },
  { id: "pelle-di-corteccia", name: "Pelle di Corteccia", level: 2, school: "trasmutazione", classes: ["druido", "ranger"], time: "1 azione", range: "Contatto", comp: "V, S, M", duration: "Concentrazione, fino a 1 ora", desc: "La pelle del bersaglio si indurisce come corteccia, aumentando la sua Classe Armatura.", crunch: "Nessun danno: la CA del bersaglio non può essere inferiore a 16 per la durata." },
  { id: "crescita-di-spine", name: "Crescita di Spine", level: 2, school: "trasmutazione", classes: ["druido", "ranger"], time: "1 azione", range: "45 m", comp: "V, S, M", duration: "Concentrazione, fino a 10 minuti", desc: "Il terreno in un'area si ricopre di rovi che rallentano e feriscono chi vi cammina.", crunch: "2d4 danno perforante ogni 1,5 m percorsi nell'area (nessun TS); l'area è anche terreno difficile per la durata." },
  { id: "presagio", name: "Presagio", level: 2, school: "divinazione", classes: ["chierico"], time: "1 minuto", range: "Personale", comp: "V, S, M", duration: "Istantanea", desc: "Rivela, tramite un rituale divinatorio, se un'azione imminente porterà buona o cattiva sorte.", crunch: "Nessun danno: rivela se un'azione pianificata entro 30 minuti porterà buona sorte, cattiva sorte, entrambe o nessuna delle due; rituale." },
  { id: "cecita-sordita", name: "Cecità/Sordità", level: 2, school: "necromanzia", classes: ["bardo", "chierico", "mago", "stregone"], time: "1 azione", range: "9 m", comp: "V", duration: "1 minuto", desc: "Priva un bersaglio della vista o dell'udito per la durata dell'incantesimo.", crunch: "Nessun danno: TS Costituzione nega; se fallito, il bersaglio è accecato o assordato (a tua scelta) per la durata. +1 bersaglio per ogni slot superiore al 2°." },
  { id: "raggio-debilitante", name: "Raggio Debilitante", level: 2, school: "necromanzia", classes: ["mago", "stregone", "warlock"], time: "1 azione", range: "18 m", comp: "V, S", duration: "Concentrazione, fino a 1 minuto", desc: "Un raggio necrotico indebolisce il bersaglio, dimezzando il danno dei suoi attacchi.", crunch: "Nessun danno diretto: tiro per colpire con incantesimi; se colpisce, TS Costituzione a ogni suo turno o gli attacchi con arma del bersaglio infliggono metà danno, per la durata." },
  { id: "faro-di-speranza", name: "Faro di Speranza", level: 3, school: "abiurazione", classes: ["chierico"], time: "1 azione", range: "9 m", comp: "V, S", duration: "Concentrazione, fino a 1 minuto", desc: "Rende immune alla paura e massimizza le cure ricevute da chi si trova nell'area per la durata.", crunch: "Nessun danno: vantaggio ai TS di Saggezza e ai tiri salvezza contro la morte per i bersagli scelti; ogni cura che ricevono usa il valore massimo possibile dei dadi." },
  { id: "ravvivare", name: "Ravvivare", level: 3, school: "necromanzia", classes: ["chierico", "paladino"], time: "1 azione", range: "Contatto", comp: "V, S, M", duration: "Istantanea", desc: "Riporta in vita una creatura morta da non più di un minuto, restituendole un solo punto ferita.", crunch: "Nessun danno: riporta in vita con 1 PF una creatura morta da non più di 1 minuto (non ripristina arti perduti né cura malattie/veleni)." },
  { id: "manto-del-crociato", name: "Manto del Crociato", level: 3, school: "ammaliamento", classes: ["paladino"], time: "1 azione", range: "Personale", comp: "V", duration: "Concentrazione, fino a 1 minuto", desc: "Un'aura di ardore sacro infligge danno radioso extra agli attacchi degli alleati vicini.", crunch: "Nessun danno diretto: tu e gli alleati entro 9 m infliggete +1d4 danno radioso con gli attacchi con arma per la durata." },
  { id: "tempesta-di-neve", name: "Tempesta di Neve", level: 3, school: "invocazione", classes: ["druido", "mago", "stregone"], time: "1 azione", range: "150 m", comp: "V, S, M", duration: "Concentrazione, fino a 1 minuto", desc: "Pioggia gelata e ghiaccio rendono il terreno scivoloso e la visuale offuscata in un'area.", crunch: "Nessun danno: TS Destrezza per chi si muove nell'area o cade prono se fallito; l'area è fortemente offuscata e il terreno diventa scivoloso (difficile) per la durata." },
  { id: "crescita-delle-piante", name: "Crescita delle Piante", level: 3, school: "trasmutazione", classes: ["bardo", "druido", "ranger"], time: "1 azione", range: "45 m", comp: "V, S", duration: "Istantanea", desc: "Fa crescere rigogliosa la vegetazione in una vasta area, trasformandola in terreno difficile.", crunch: "Nessun danno: in modalità 'sovracrescita' rende terreno difficile un'area di 30 m di raggio; in modalità 'arricchimento' rende fertili i raccolti di un'area coltivata per un anno." },
  { id: "muro-di-vento", name: "Muro di Vento", level: 3, school: "evocazione", classes: ["druido", "ranger"], time: "1 azione", range: "36 m", comp: "V, S, M", duration: "Concentrazione, fino a 1 minuto", desc: "Crea una parete di vento fortissimo che devia frecce, gas e piccole creature volanti.", crunch: "Nessun danno fisso: TS Forza per le creature Grandi o inferiori che tentano di attraversare il muro, altrimenti vengono respinte; devia frecce/dardi/gas e impedisce il volo di creature molto piccole." },
  { id: "non-individuazione", name: "Non Individuazione", level: 3, school: "abiurazione", classes: ["bardo", "ranger", "mago"], time: "1 azione", range: "Contatto", comp: "V, S, M", duration: "8 ore", desc: "Nasconde un oggetto o un luogo da ogni forma di divinazione magica.", crunch: "Nessun danno: nasconde il bersaglio (creatura, oggetto o luogo fino a 9 m) da ogni forma di divinazione magica per la durata." },
  { id: "parlare-con-i-morti", name: "Parlare con i Morti", level: 3, school: "necromanzia", classes: ["chierico"], time: "1 azione", range: "3 m", comp: "V, S, M", duration: "10 minuti", desc: "Permette di rivolgere domande a un cadavere, che risponde con la conoscenza che aveva in vita.", crunch: "Nessun danno: il cadavere risponde a un massimo di 5 domande, in modo reticente o mendace se era ostile in vita." },
  { id: "sfarfallio", name: "Sfarfallio", level: 3, school: "trasmutazione", classes: ["mago", "stregone"], time: "1 azione", range: "Personale", comp: "V, S, M", duration: "1 minuto", desc: "Il lanciatore sfarfalla tra il piano materiale e quello etereo, diventando parzialmente intangibile.", crunch: "Nessun danno: a fine di ogni tuo turno tira 1d20, con 11+ passi sul Piano Etereo fino all'inizio del turno successivo, ottenendo resistenza a tutto il danno mentre sei sul Piano Etereo." },
  { id: "animare-morti", name: "Animare Morti", level: 3, school: "necromanzia", classes: ["mago", "chierico"], time: "1 minuto", range: "3 m", comp: "V, S, M", duration: "Istantanea", desc: "Anima ossa o cadaveri, trasformandoli in servitori non morti sotto il controllo del lanciatore.", crunch: "Nessun danno dall'incantesimo in sé: anima fino a 2 non morti (scheletro o zombie) per lancio, che combattono con le proprie statistiche sotto il tuo controllo permanente (finché non li ricrei col rituale ogni 24 ore)." },
  { id: "contrasto-alla-morte", name: "Contrasto alla Morte", level: 4, school: "abiurazione", classes: ["chierico", "paladino"], time: "1 azione", range: "Contatto", comp: "V, S, M", duration: "8 ore", desc: "Protegge il bersaglio dalla morte per punti ferita a zero e dalla riduzione massima dei PF.", crunch: "Nessun danno: la prima volta che il bersaglio scenderebbe a 0 PF entro la durata, resta invece a 1 PF (una sola volta); immune ai dadi vita di sfinimento da PF massimi ridotti." },
  { id: "dominare-bestia", name: "Dominare Bestia", level: 4, school: "ammaliamento", classes: ["druido"], time: "1 azione", range: "18 m", comp: "V, S", duration: "Concentrazione, fino a 1 minuto", desc: "Tenta di soggiogare la mente di una bestia, che il lanciatore può poi guidare con la volontà.", crunch: "Nessun danno: TS Saggezza nega (ripetibile ogni volta che il bersaglio subisce danno); come Dominare Persona ma limitato alle bestie." },
  { id: "viticcio-afferrante", name: "Viticcio Afferrante", level: 4, school: "invocazione", classes: ["druido", "ranger"], time: "1 azione bonus", range: "9 m", comp: "V, S", duration: "Concentrazione, fino a 1 minuto", desc: "Un lungo viticcio scaturisce dal terreno per afferrare e trascinare a sé una creatura.", crunch: "Nessun danno: TS Forza o Destrezza (a tua scelta) nega; se fallito, il bersaglio è trascinato fino a 6 m verso il viticcio e trattenuto." },
  { id: "piaga", name: "Piaga", level: 4, school: "necromanzia", classes: ["druido", "mago", "stregone"], time: "1 azione", range: "9 m", comp: "V, S", duration: "Istantanea", desc: "Fa avvizzire un bersaglio con energia necromantica, infliggendogli un danno grave.", crunch: "8d8 danno necrotico; TS Costituzione dimezza (su piante o vegetali il TS ha svantaggio e il danno non viene dimezzato in caso di successo). +1d8 per ogni slot superiore al 4°." },
  { id: "colpo-di-fiamma", name: "Colpo di Fiamma", level: 5, school: "invocazione", classes: ["chierico"], time: "1 azione", range: "18 m", comp: "V, S, M", duration: "Istantanea", desc: "Una colonna di fuoco divino divampa dal cielo su un punto scelto, incenerendo l'area.", crunch: "4d6 danno da fuoco + 4d6 danno radioso; TS Destrezza dimezza. +1d6 per tipo per ogni slot superiore al 5°." },
  { id: "onda-distruttiva", name: "Onda Distruttiva", level: 5, school: "evocazione", classes: ["paladino"], time: "1 azione", range: "Personale", comp: "V", duration: "Istantanea", desc: "Un'onda di energia sacra o malvagia abbatte le creature vicine, ferendole gravemente.", crunch: "5d6 danno radioso o necrotico (a tua scelta) alle creature ostili entro 9 m; TS Costituzione dimezza il danno e nega la spinta di 3 m e la condizione prona." },
  { id: "piaga-d-insetti", name: "Piaga d'Insetti", level: 5, school: "invocazione", classes: ["druido", "stregone"], time: "1 azione", range: "90 m", comp: "V, S", duration: "Concentrazione, fino a 10 minuti", desc: "Uno sciame di insetti punge tutti coloro che si trovano nell'area colpita.", crunch: "4d10 danno perforante nella sfera di 6 m; TS Costituzione dimezza. +1d10 per ogni slot superiore al 5°." },
  { id: "sapienza-leggendaria", name: "Sapienza Leggendaria", level: 5, school: "divinazione", classes: ["bardo", "chierico", "mago"], time: "1 azione", range: "Personale", comp: "V, S, M", duration: "Istantanea", desc: "Rivela informazioni note riguardo un oggetto, un luogo o una creatura leggendaria.", crunch: "Nessun danno: ottieni una o più informazioni note sull'argomento scelto, veritiere ma non necessariamente complete." },
  { id: "modificare-memoria", name: "Modificare Memoria", level: 5, school: "ammaliamento", classes: ["bardo", "mago"], time: "1 azione", range: "9 m", comp: "V, S", duration: "Concentrazione, fino a 1 minuto", desc: "Altera i ricordi recenti di una creatura affascinata, cancellandoli o sostituendoli.", crunch: "Nessun danno: TS Saggezza nega (svantaggio se già affascinata da te); se fallito, mentre resta affascinata puoi cancellare o alterare fino a un'ora dei suoi ricordi recenti." },
  { id: "sfera-antivita", name: "Sfera Antivita", level: 5, school: "abiurazione", classes: ["druido"], time: "1 azione", range: "Personale", comp: "V, S, M", duration: "Concentrazione, fino a 8 ore", desc: "Crea una barriera invisibile che impedisce a creature e bestie ostili di avvicinarsi.", crunch: "Nessun danno: sfera di 3 m che impedisce a creature/bestie ostili di entrarvi o di attaccare attraverso di essa per la durata." },
  { id: "nube-letale", name: "Nube Letale", level: 5, school: "invocazione", classes: ["mago", "stregone"], time: "1 azione", range: "90 m", comp: "V, S, M", duration: "Concentrazione, fino a 10 minuti", desc: "Una nube di gas venefico giallo-verde si espande, avvelenando chiunque vi resti dentro.", crunch: "5d8 danno da veleno a ogni creatura che inizia il turno nella nube (sfera di 6 m, che si espande e può muoversi di 3 m/turno); TS Costituzione dimezza. +1d8 per ogni slot superiore al 5°." },
  { id: "passo-tra-gli-alberi", name: "Passo tra gli Alberi", level: 5, school: "trasmutazione", classes: ["druido", "ranger"], time: "1 azione", range: "Vista", comp: "V, S", duration: "Concentrazione, fino a 1 ora", desc: "Permette di entrare in un albero e riemergere istantaneamente da un altro entro portata.", crunch: "Nessun danno: come azione, entri in un grosso albero ed esci istantaneamente da un altro entro 150 m, una volta per turno per la durata." },
  { id: "malaugurio", name: "Malaugurio", level: 1, school: "ammaliamento", classes: ["bardo", "chierico"], time: "1 azione", range: "9 m", comp: "V, S, M", duration: "Concentrazione, fino a 1 minuto", desc: "Indebolisce fino a tre nemici, sottraendo una piccola penalità ad attacchi e tiri salvezza.", crunch: "Nessun danno diretto: TS Carisma nega per fino a 3 creature; se fallito, sottraggono 1d4 a ogni tiro per colpire e TS lanciato per la durata." },
  { id: "marchio-del-cacciatore", name: "Marchio del Cacciatore", level: 1, school: "divinazione", classes: ["ranger"], time: "1 azione bonus", range: "27 m", comp: "V", duration: "Concentrazione, fino a 1 ora", desc: "Marchia un bersaglio, infliggendogli danno extra ogni volta che viene colpito e facilitandone il tracciamento.", crunch: "Nessun danno all'atto del lancio: ogni volta che colpisci il bersaglio marchiato con un attacco, infliggi +1d6 danno aggiuntivo; hai anche vantaggio alle prove per rintracciarlo." },
  { id: "colpo-intrappolante", name: "Colpo Intrappolante", level: 1, school: "ammaliamento", classes: ["ranger"], time: "1 azione bonus", range: "Personale", comp: "V", duration: "Concentrazione, fino a 1 minuto", desc: "Il prossimo colpo andato a segno intrappola il bersaglio in viticci che ne impediscono il movimento.", crunch: "Al prossimo colpo con arma entro la durata: 1d6 danno perforante extra e TS Forza o trattenuto; se trattenuto, 1d6 danno perforante extra a ogni suo turno. +1d6 per ogni slot superiore al 1°." },
  { id: "zona-di-verita", name: "Zona di Verità", level: 2, school: "ammaliamento", classes: ["chierico", "paladino"], time: "1 azione", range: "18 m", comp: "V", duration: "10 minuti", desc: "Chi si trova nell'area non può dire consapevolmente il falso per la durata.", crunch: "Nessun danno: TS Carisma per chi entra nella sfera di 4,5 m; se fallito, non può dire consapevolmente il falso per la durata (sa quando è sotto effetto)." },
  { id: "raggio-lunare", name: "Raggio Lunare", level: 2, school: "evocazione", classes: ["druido"], time: "1 azione", range: "36 m", comp: "V, S, M", duration: "Concentrazione, fino a 1 minuto", desc: "Un raggio di luce argentea danneggia le creature che vi entrano o iniziano il turno al suo interno.", crunch: "2d10 danno radioso a chi entra nel cilindro di 1,5 m o inizia lì il turno; TS Costituzione dimezza (i mutaforma hanno svantaggio e sono forzati nella forma originale in caso di fallimento). +1d10 per ogni slot superiore al 2°." },
  { id: "protezione-dalle-energie", name: "Protezione dalle Energie", level: 3, school: "abiurazione", classes: ["druido", "chierico", "mago", "ranger", "stregone"], time: "1 azione", range: "Contatto", comp: "V, S, M", duration: "Concentrazione, fino a 1 ora", desc: "Concede resistenza a un tipo di danno elementale scelto, per la durata.", crunch: "Nessun danno: resistenza al tipo di danno scelto (acido, freddo, fuoco, fulmine o tuono) per la durata." },
  { id: "comunione-con-la-natura", name: "Comunione con la Natura", level: 5, school: "divinazione", classes: ["druido", "ranger"], time: "1 minuto", range: "Personale", comp: "V, S", duration: "Istantanea", desc: "Rivela informazioni sul terreno circostante, come la presenza di acqua, creature o insediamenti.", crunch: "Nessun danno: rivela informazioni sul terreno naturale entro 5 km; rituale." },
  { id: "comunione", name: "Comunione", level: 5, school: "divinazione", classes: ["chierico"], time: "1 minuto", range: "Personale", comp: "V, S", duration: "1 minuto", desc: "Pone fino a tre domande a un'entità divina, ricevendo risposte veritiere a sì o no.", crunch: "Nessun danno: fino a 3 domande con risposta sì/no/incerto da un'entità della tua fede; rituale." },
  { id: "santuario", name: "Santuario", level: 1, school: "abiurazione", classes: ["chierico"], time: "1 azione bonus", range: "9 m", comp: "V, S, M", duration: "1 minuto", desc: "Protegge una creatura: chi la attacca deve prima superare un tiro salvezza, pena il fallimento dell'attacco.", crunch: "Nessun danno: chi tenta di attaccare il bersaglio protetto deve prima superare un TS Saggezza o scegliere un altro bersaglio (l'effetto termina se il protetto attacca o lancia un incantesimo dannoso)." },
  { id: "risata-orrenda-di-tasha", name: "Risata Orrenda di Tasha", level: 1, school: "ammaliamento", classes: ["bardo", "mago", "stregone"], time: "1 azione", range: "9 m", comp: "V, S, M", duration: "Concentrazione, fino a 1 minuto", desc: "Il bersaglio scoppia in una risata incontrollabile, cadendo a terra incapace di agire.", crunch: "Nessun danno: TS Saggezza nega (svantaggio se il bersaglio ha subito danno da poco); se fallito, prono e incapacitato dal ridere per la durata (può ripetere il TS quando subisce danno)." },
  { id: "calma-delle-emozioni", name: "Calma delle Emozioni", level: 2, school: "ammaliamento", classes: ["bardo", "chierico"], time: "1 azione", range: "18 m", comp: "V, S", duration: "Concentrazione, fino a 1 minuto", desc: "Sopprime le emozioni intense in un'area, placando ostilità o eliminando paura e charme.", crunch: "Nessun danno: TS Carisma per fino a 6 creature nella sfera di 6 m; se fallito, non possono attaccarsi a vicenda o subire danno da effetti emotivi (ostilità placata), oppure una creatura scelta è immune a paura e charme per la durata." },
  { id: "immagine-fantasma", name: "Immagine Fantasma", level: 2, school: "illusione", classes: ["bardo", "mago", "stregone", "warlock"], time: "1 azione", range: "18 m", comp: "V, S, M", duration: "Concentrazione, fino a 1 minuto", desc: "Crea un'illusione visiva di un oggetto o una creatura, priva di suoni o altri effetti sensoriali.", crunch: "TS Intelligenza nega la percezione dell'illusione come reale; se ingannata e l'illusione include elementi dannosi, la creatura subisce 1d6 danno psichico all'inizio di ogni suo turno finché resta ingannata o nell'area." },
  { id: "nube-ripugnante", name: "Nube Ripugnante", level: 3, school: "invocazione", classes: ["bardo", "druido", "stregone"], time: "1 azione", range: "27 m", comp: "V, S, M", duration: "Concentrazione, fino a 1 minuto", desc: "Un gas nauseante riempie un'area, causando nausea a chi lo respira.", crunch: "Nessun danno diretto: TS Costituzione per chi è nella sfera di 6 m (ripetibile a ogni turno); se fallito, avvelenato e incapacitato (nausea) finché resta nell'area o non supera il TS." },
  { id: "messaggero", name: "Messaggero", level: 3, school: "divinazione", classes: ["bardo", "chierico", "mago", "stregone", "warlock"], time: "1 azione", range: "Illimitata", comp: "V, S, M", duration: "1 turno", desc: "Invia un breve messaggio a una creatura nota ovunque si trovi, sullo stesso piano o altrove.", crunch: "Nessun danno: messaggio di 25 parole a una creatura nota ovunque si trovi (anche su un altro piano), con risposta immediata di pari lunghezza." },
  { id: "scudo-di-fuoco", name: "Scudo di Fuoco", level: 4, school: "invocazione", classes: ["mago", "stregone"], time: "1 azione bonus", range: "Personale", comp: "V, S, M", duration: "10 minuti", desc: "Avvolge il lanciatore in fiamme protettive che riducono un tipo di danno e ne infliggono ai nemici in mischia.", crunch: "Chi ti colpisce in mischia subisce 2d8 danno da fuoco (Manto Freddo) o da freddo (Manto Caldo), a tua scelta al lancio; ottieni anche resistenza al tipo di danno opposto (freddo o fuoco)." },
  { id: "tentacoli-neri-di-evard", name: "Tentacoli Neri di Evard", level: 4, school: "evocazione", classes: ["mago"], time: "1 azione", range: "27 m", comp: "V, S, M", duration: "Concentrazione, fino a 1 minuto", desc: "Tentacoli scuri emergono dal terreno in un'area, afferrando e schiacciando chi vi si trova.", crunch: "3d6 danno contundente a chi inizia il turno nel cubo di 6 m; TS Forza nega il danno e il trattenimento (chi è già trattenuto subisce comunque il danno)." },
  { id: "sembianza", name: "Sembianza", level: 5, school: "illusione", classes: ["bardo", "mago", "stregone"], time: "1 azione", range: "9 m", comp: "V, S, M", duration: "8 ore", desc: "Altera l'aspetto di più creature volontarie, incluso volto, voce e vestiti, per l'intera durata.", crunch: "Nessun danno: altera l'aspetto (volto, voce, vestiti, altezza entro ±30 cm) di fino a 10 creature volontarie per la durata." },
  { id: "consacrazione", name: "Consacrazione", level: 5, school: "abiurazione", classes: ["chierico", "druido"], time: "24 ore", range: "Contatto", comp: "V, S, M", duration: "Istantanea", desc: "Santifica permanentemente un'area, conferendole effetti magici benefici scelti dal lanciatore.", crunch: "Nessun danno fisso: santifica un'area di 18 m di raggio con un effetto scelto (es. i non morti evocati lì subiscono danno radioso, o gli alleati ottengono un bonus); alcuni effetti opzionali infliggono danno (es. 'ostile' infligge 1d6 danno radioso/necrotico ai nemici che entrano)." },
  { id: "legame-telepatico", name: "Legame Telepatico", level: 5, school: "divinazione", classes: ["bardo", "mago"], time: "1 azione", range: "9 m", comp: "V, S, M", duration: "1 ora", desc: "Crea un legame telepatico tra più creature volontarie, che possono comunicare mentalmente per la durata.", crunch: "Nessun danno: fino a 8 creature volontarie comunicano telepaticamente tra loro senza limiti di distanza (stesso piano) per la durata; rituale." },
  { id: "rallentare", name: "Rallentare", level: 3, school: "trasmutazione", classes: ["mago", "stregone"], time: "1 azione", range: "36 m", comp: "V, S, M", duration: "Concentrazione, fino a 1 minuto", desc: "Rallenta fino a sei creature in un'area, dimezzandone la velocità e penalizzando attacchi e tiri salvezza.", crunch: "Nessun danno: TS Saggezza per fino a 6 creature nel cubo di 12 m (ripetibile a fine turno); se fallito, velocità dimezzata, -2 a CA e TS di Destrezza, niente reazioni e azione o azione bonus (non entrambe) per turno." },
  { id: "respirare-in-acqua", name: "Respirare in Acqua", level: 3, school: "trasmutazione", classes: ["druido", "ranger", "mago", "stregone"], time: "1 azione", range: "9 m", comp: "V, S, M", duration: "24 ore", desc: "Consente a un gruppo di creature di respirare sott'acqua per l'intera durata.", crunch: "Nessun danno: fino a 10 creature volontarie possono respirare sott'acqua per la durata; rituale." },
  { id: "camminare-sulle-acque", name: "Camminare sulle Acque", level: 3, school: "trasmutazione", classes: ["chierico", "druido", "ranger"], time: "1 azione", range: "9 m", comp: "V, S, M", duration: "1 ora", desc: "Permette a un gruppo di creature di camminare sulla superficie di un liquido come fosse terreno solido.", crunch: "Nessun danno: fino a 10 creature volontarie camminano su qualsiasi superficie liquida come fosse terreno solido per la durata; rituale." },
  { id: "evocare-elementale", name: "Evocare Elementale", level: 5, school: "invocazione", classes: ["druido", "mago", "stregone"], time: "1 minuto", range: "27 m", comp: "V, S, M", duration: "Concentrazione, fino a 1 ora", desc: "Evoca uno spirito elementale che assume una forma legata al tipo scelto, per combattere al fianco del lanciatore.", crunch: "Nessun danno dall'incantesimo in sé: evoca un elementale con GS fino a 5 (il danno dei suoi attacchi dipende dal profilo scelto), sotto il tuo controllo per la durata." },
  { id: "offuscamento", name: "Offuscamento", level: 2, school: "illusione", classes: ["mago", "stregone"], time: "1 azione", range: "Personale", comp: "V", duration: "Concentrazione, fino a 1 minuto", desc: "Distorce l'aspetto del lanciatore, conferendo svantaggio agli attacchi in mischia e a distanza contro di lui.", crunch: "Nessun danno: gli attacchi contro di te hanno svantaggio per la durata (nessun effetto se sei accecato o cieco all'esito dell'attacco è irrilevante)." },
  { id: "creare-cibo-e-acqua", name: "Creare Cibo e Acqua", level: 3, school: "invocazione", classes: ["chierico", "paladino"], time: "1 azione", range: "9 m", comp: "V, S", duration: "Istantanea", desc: "Crea cibo e acqua sufficienti a sfamare un piccolo gruppo per un'intera giornata.", crunch: "Nessun danno: crea cibo insapore e acqua sufficienti per 5 creature per 24 ore." },
  { id: "terreno-illusorio", name: "Terreno Illusorio", level: 4, school: "illusione", classes: ["bardo", "druido", "mago", "stregone"], time: "10 minuti", range: "90 m", comp: "V, S, M", duration: "24 ore", desc: "Fa apparire un'ampia area di terreno naturale come un paesaggio completamente diverso da quello reale.", crunch: "Nessun danno: illusione persistente su un cubo di 45 m di terreno naturale (non nasconde creature/oggetti/strutture), rituale." },
  { id: "oscurita", name: "Oscurità", level: 2, school: "invocazione", classes: ["mago", "stregone", "warlock"], time: "1 azione", range: "18 m", comp: "V, M", duration: "Concentrazione, fino a 10 minuti", desc: "Estingue ogni fonte di luce in un'area, creando oscurità magica impenetrabile alla vista normale.", crunch: "Nessun danno: sfera di 4,5 m di oscurità magica, impenetrabile anche alla scurovisione, per la durata." },
  { id: "freccia-acida-di-melf", name: "Freccia Acida di Melf", level: 2, school: "invocazione", classes: ["mago"], time: "1 azione", range: "27 m", comp: "V, S, M", duration: "Istantanea", desc: "Una freccia d'acido colpisce infliggendo danno immediato e continua a corrodere il bersaglio nel turno successivo.", crunch: "4d4 danno da acido immediato (tiro per colpire con incantesimi) + 2d4 alla fine del suo prossimo turno; se manca, solo metà del danno immediato e nessun danno successivo. +1d4 a entrambi i danni per ogni slot superiore al 2°." },
  { id: "localizzare-creatura", name: "Localizzare Creatura", level: 4, school: "divinazione", classes: ["bardo", "chierico", "druido", "paladino", "ranger"], time: "1 azione", range: "Personale", comp: "V, S, M", duration: "Concentrazione, fino a 1 ora", desc: "Rivela la direzione verso una creatura nota o di un tipo specifico entro un ampio raggio.", crunch: "Nessun danno: rivela direzione e distanza verso una creatura nota (o del tipo scelto più vicina) entro 1.000 km, per la durata." },
  { id: "scalare-come-un-ragno", name: "Scalare come un Ragno", level: 2, school: "trasmutazione", classes: ["mago", "stregone", "warlock"], time: "1 azione", range: "Contatto", comp: "V, S, M", duration: "Concentrazione, fino a 1 ora", desc: "Il bersaglio può camminare su superfici verticali e soffitti senza bisogno di arrampicarsi.", crunch: "Nessun danno: il bersaglio può camminare su superfici verticali e soffitti senza prova di scalata, mani libere, per la durata." },
  { id: "fondersi-con-la-pietra", name: "Fondersi con la Pietra", level: 3, school: "trasmutazione", classes: ["chierico", "druido"], time: "1 azione", range: "Contatto", comp: "V, S", duration: "8 ore", desc: "Il lanciatore si fonde con un blocco di pietra, nascondendosi al suo interno per la durata.", crunch: "Nessun danno: ti fondi in un blocco di pietra, indetettabile dall'esterno, per la durata (o finché non esci); rituale." },
  { id: "modellare-la-pietra", name: "Modellare la Pietra", level: 4, school: "trasmutazione", classes: ["chierico", "druido", "mago"], time: "1 azione", range: "Contatto", comp: "V, S, M", duration: "Istantanea", desc: "Modella pietra, terra o simili nella forma desiderata, come se fossero argilla morbida.", crunch: "Nessun danno: rimodella un volume di pietra fino a 1,5 m per lato nella forma desiderata." },
  { id: "forma-gassosa", name: "Forma Gassosa", level: 3, school: "trasmutazione", classes: ["mago", "stregone", "warlock"], time: "1 azione", range: "Contatto", comp: "V, S, M", duration: "Concentrazione, fino a 1 ora", desc: "Trasforma il bersaglio in una nube gassosa, capace di infilarsi in ogni fessura e resistente a molti danni.", crunch: "Nessun danno: il bersaglio diventa una nube gassosa (velocità di volo 3 m, resistenza a danno contundente/perforante/tagliente non magico, incapace di attaccare o manipolare oggetti) per la durata." },

  /* --- Incantesimi aggiuntivi di alto livello (6°-9°), PHB 2014 --- */
  { id: "barriera-di-lame", name: "Barriera di Lame", level: 6, school: "evocazione", classes: ["chierico"], time: "1 azione", range: "27 m", comp: "V, S, M", duration: "Concentrazione, fino a 10 minuti", desc: "Crea un muro fluttuante di lame roteanti che infligge danno tagliente a chiunque lo attraversi.", crunch: "6d10 danno tagliente per chi attraversa il muro o inizia lì il turno; TS Destrezza dimezza." },
  { id: "danno", name: "Danno", level: 6, school: "necromanzia", classes: ["chierico"], time: "1 azione", range: "18 m", comp: "V, S", duration: "Istantanea", desc: "Canalizza energia malvagia che infligge danno necrotico devastante, capace di dimezzare i punti ferita massimi del bersaglio.", crunch: "14d6 danno necrotico (nessun effetto su costrutti/non morti); TS Costituzione dimezza. Se fallito, i PF massimi del bersaglio si riducono di pari quantità fino al prossimo riposo lungo (muore se scendono a 0)." },
  { id: "banchetto-degli-eroi", name: "Banchetto degli Eroi", level: 6, school: "invocazione", classes: ["chierico"], time: "1 ora", range: "9 m", comp: "V, S, M", duration: "Istantanea", desc: "Un banchetto rituale che cura le malattie, immunizza dalla paura e concede saggezza, resistenza e punti ferita bonus ai partecipanti.", crunch: "Nessun danno: chi partecipa guarisce da malattie/veleno, è immune a paura e veleno per 24 ore, +2d10 PF massimi per 24 ore e vantaggio ai TS di Saggezza." },
  { id: "interdizione", name: "Interdizione", level: 6, school: "abiurazione", classes: ["chierico"], time: "10 minuti", range: "Contatto", comp: "V, S, M", duration: "1 anno", desc: "Protegge una vasta area da teletrasporti, evocazioni e dall'ingresso di creature di allineamento scelto.", crunch: "5d10 danno radioso o necrotico (a tua scelta al lancio) al tipo di creatura scelto che entra nell'area o inizia lì il turno; blocca anche teletrasporti ed evocazioni al suo interno." },
  { id: "creare-non-morti", name: "Creare Non Morti", level: 6, school: "necromanzia", classes: ["chierico", "warlock"], time: "1 minuto", range: "3 m", comp: "V, S, M", duration: "Istantanea", desc: "Trasforma fino a tre cadaveri in spettri servili che obbediscono ai comandi del lanciatore.", crunch: "Nessun danno dall'incantesimo in sé: anima fino a 3 ghoul (o 1 spettro/gaunt spettrale ogni 2 slot superiori al 6°), sotto il tuo controllo finché non li ricrei ogni 24 ore." },
  { id: "alleato-planare", name: "Alleato Planare", level: 6, school: "invocazione", classes: ["chierico"], time: "10 minuti", range: "18 m", comp: "V", duration: "Istantanea", desc: "Chiama una creatura da un altro piano per prestare aiuto in cambio di un pagamento negoziato sul posto.", crunch: "Nessun danno: la creatura richiamata presta servizio in cambio di un compenso negoziato (non garantito, dipende dalla sua disposizione)." },
  { id: "camminata-nel-vento", name: "Camminata nel Vento", level: 6, school: "trasmutazione", classes: ["chierico", "druido"], time: "1 minuto", range: "9 m", comp: "V, S, M", duration: "8 ore", desc: "Il lanciatore e i suoi alleati si trasformano in nebbia vaporosa, ottenendo grande velocità di volo.", crunch: "Nessun danno: fino a 10 creature volontarie diventano nebbia gassosa con velocità di volo 90 m per la durata; resistenza a danno da armi non magiche mentre in questa forma." },
  { id: "muro-di-spine", name: "Muro di Spine", level: 6, school: "invocazione", classes: ["druido"], time: "1 azione", range: "36 m", comp: "V, S, M", duration: "Concentrazione, fino a 10 minuti", desc: "Fa crescere una barriera impenetrabile di rovi spinosi che infligge danno a chi tenta di attraversarla.", crunch: "7d8 danno perforante a chi entra nel muro quando appare o forza il passaggio attraverso di esso; TS Destrezza dimezza. +1d8 per ogni slot superiore al 6°." },
  { id: "cerchio-di-morte", name: "Cerchio di Morte", level: 6, school: "necromanzia", classes: ["mago", "stregone", "warlock"], time: "1 azione", range: "45 m", comp: "V, S, M", duration: "Istantanea", desc: "Una sfera di energia negativa esplode, infliggendo ingente danno necrotico a tutte le creature viventi nell'area.", crunch: "8d6 danno necrotico nella sfera di 18 m (nessun effetto su non morti); TS Costituzione dimezza. +2d6 per ogni slot superiore al 6°." },
  { id: "carne-in-pietra", name: "Carne in Pietra", level: 6, school: "trasmutazione", classes: ["mago", "warlock"], time: "1 azione", range: "18 m", comp: "V, S, M", duration: "Concentrazione, fino a 1 minuto", desc: "Trasforma il bersaglio e il suo equipaggiamento in pietra solida, pietrificandolo se fallisce ripetuti tiri salvezza.", crunch: "Nessun danno: TS Costituzione nega (ripetibile a ogni tuo turno); un fallimento causa trattenimento, un secondo fallimento consecutivo causa pietrificazione permanente." },
  { id: "suggestione-di-massa", name: "Suggestione di Massa", level: 6, school: "ammaliamento", classes: ["bardo", "stregone", "warlock"], time: "1 azione", range: "18 m", comp: "V, M", duration: "24 ore", desc: "Come Suggestione, ma influenza fino a dodici creature contemporaneamente con un suggerimento plausibile.", crunch: "Nessun danno: TS Saggezza nega per fino a 12 creature; se fallito, seguono il corso d'azione suggerito finché non è completato o la durata termina." },
  { id: "contingenza", name: "Contingenza", level: 6, school: "invocazione", classes: ["mago"], time: "10 minuti", range: "Personale", comp: "V, S, M", duration: "10 giorni", desc: "Prepara un incantesimo di 5° livello o inferiore che scatta automaticamente al verificarsi di una condizione prestabilita.", crunch: "Nessun danno proprio: lancia gratuitamente su te stesso un incantesimo di 5° livello o inferiore già preparato, quando si verifica il grilletto scelto entro 10 giorni." },
  { id: "sfera-glaciale-di-otiluke", name: "Sfera Glaciale di Otiluke", level: 6, school: "invocazione", classes: ["mago", "stregone"], time: "1 azione", range: "27 m", comp: "V, S, M", duration: "Istantanea", desc: "Scaglia una sfera di ghiaccio che esplode infliggendo danno freddo e intrappolando i sopravvissuti nel ghiaccio.", crunch: "10d6 danno freddo nella sfera di 18 m; TS Costituzione dimezza (se fallito il bersaglio resta anche intrappolato nel ghiaccio). +1d6 per ogni slot superiore al 6°." },

  { id: "parola-divina", name: "Parola Divina", level: 7, school: "invocazione", classes: ["chierico"], time: "1 azione", range: "18 m", comp: "V", duration: "Istantanea", desc: "Pronuncia una parola sacra che acceca, assorda, atterrisce o uccide istantaneamente le creature nemiche in base ai loro punti ferita.", crunch: "Nessun tiro per colpire né TS: l'effetto dipende dai PF attuali del bersaglio — 20 PF o meno: assordato 1 minuto; 30 o meno: assordato e accecato 10 minuti; 40 o meno: accecato, assordato e stordito 1 ora; 50 o meno: morte istantanea. Le creature estranee al piano sono bandite se hanno 40 PF o meno." },
  { id: "tempesta-di-fuoco", name: "Tempesta di Fuoco", level: 7, school: "evocazione", classes: ["chierico", "druido"], time: "1 azione", range: "45 m", comp: "V", duration: "Istantanea", desc: "Fiamme letali erompono dal terreno in un'area vasta, incenerendo vegetazione e creature al suo interno.", crunch: "7d10 danno da fuoco a ogni creatura in una o più aree di 3 m contigue (fino a 10); TS Destrezza dimezza. Puoi escludere le aree occupate dai tuoi alleati." },
  { id: "rifugio-magnifico-di-mordenkainen", name: "Rifugio Magnifico di Mordenkainen", level: 7, school: "invocazione", classes: ["mago"], time: "1 minuto", range: "36 m", comp: "V, S, M", duration: "24 ore", desc: "Crea una dimora extradimensionale lussuosa e sicura, completa di servitori spettrali, accessibile tramite una porta invisibile.", crunch: "Nessun danno: dimora extradimensionale sicura con servitori spettrali per la durata." },
  { id: "simulacro", name: "Simulacro", level: 7, school: "illusione", classes: ["mago"], time: "12 ore", range: "Contatto", comp: "V, S, M", duration: "Istantanea", desc: "Crea un duplicato di ghiaccio e neve di una creatura, fedele ma con la metà dei punti ferita massimi, che obbedisce al lanciatore.", crunch: "Nessun danno dall'incantesimo: crea un duplicato leale con metà dei PF massimi dell'originale, incapace di recuperarli tramite riposo." },
  { id: "sequestro", name: "Sequestro", level: 7, school: "trasmutazione", classes: ["mago"], time: "1 azione", range: "18 m", comp: "V, S, M", duration: "Finché non viene dissolto", desc: "Nasconde il bersaglio in uno stato di animazione sospesa all'interno di una tasca extradimensionale, invisibile e indistruttibile.", crunch: "Nessun danno: TS Costituzione nega se non consenziente; se fallito, il bersaglio sparisce in animazione sospesa finché l'effetto non termina." },
  { id: "evocare-un-celestiale", name: "Evocare un Celestiale", level: 7, school: "invocazione", classes: ["chierico"], time: "1 azione", range: "18 m", comp: "V, S, M", duration: "Concentrazione, fino a 1 ora", desc: "Richiama uno spirito celestiale che assume una forma angelica o animale per assistere il lanciatore in battaglia.", crunch: "Nessun danno dall'incantesimo in sé: evoca un celestiale con GS fino a 4 (il suo danno dipende dal profilo scelto), amichevole verso di te." },

  { id: "barriera-mentale", name: "Barriera Mentale", level: 8, school: "abiurazione", classes: ["bardo", "chierico", "mago"], time: "1 azione", range: "Contatto", comp: "V, S", duration: "24 ore", desc: "Rende il bersaglio immune a ogni forma di divinazione, lettura della mente e controllo mentale per un giorno intero.", crunch: "Nessun danno: immunità a divinazione, lettura/controllo mentale e danno psichico per 24 ore." },
  { id: "demiplano", name: "Demiplano", level: 8, school: "evocazione", classes: ["mago", "warlock"], time: "1 azione", range: "18 m", comp: "S", duration: "1 ora", desc: "Crea una porta che conduce a una stanza vuota in un demipiano, utile come rifugio o prigione temporanea.", crunch: "Nessun danno: crea una porta verso una stanza vuota di 9 m per lato in un demipiano, per la durata." },
  { id: "telepatia", name: "Telepatia", level: 8, school: "invocazione", classes: ["mago"], time: "1 azione", range: "Illimitata", comp: "V, S, M", duration: "24 ore", desc: "Crea un legame telepatico con una creatura conosciuta ovunque si trovi sullo stesso piano, permettendo di comunicare mentalmente.", crunch: "Nessun danno: comunicazione telepatica bidirezionale con una creatura nota sullo stesso piano, senza limiti di distanza, per 24 ore." },
  { id: "intrappolare-lanima", name: "Intrappolare l'Anima", level: 8, school: "ammaliamento", classes: ["mago"], time: "1 azione", range: "18 m", comp: "V, S, M", duration: "Istantanea", desc: "Intrappola l'anima di una creatura morente in un oggetto preparato, da cui può essere liberata solo rompendo l'oggetto.", crunch: "Nessun danno: TS Carisma nega; se fallito, l'anima del bersaglio resta intrappolata nell'oggetto finché non viene liberata o l'oggetto distrutto." },
  { id: "avvizzimento-orrendo", name: "Avvizzimento Orrendo di Abi-Dalzim", level: 8, school: "necromanzia", classes: ["mago", "stregone"], time: "1 azione", range: "36 m", comp: "V, S, M", duration: "Istantanea", desc: "Energia negativa avvizzisce la carne di tutte le creature in un cono, infliggendo danno necrotico devastante.", crunch: "12d8 danno necrotico (nessun effetto su costrutti/non morti); TS Costituzione dimezza." },
  { id: "nube-incendiaria", name: "Nube Incendiaria", level: 8, school: "trasmutazione", classes: ["druido", "mago", "stregone"], time: "1 azione", range: "45 m", comp: "V, M", duration: "Concentrazione, fino a 1 minuto", desc: "Genera una nube fumogena che infligge danno da fuoco ogni turno e può essere spostata a comando.", crunch: "10d8 danno da fuoco a chi è nella sfera di 9 m o vi entra; TS Destrezza dimezza. Ripete il danno a ogni tuo turno mentre mantieni la concentrazione." },

  { id: "proiezione-astrale", name: "Proiezione Astrale", level: 9, school: "necromanzia", classes: ["mago", "warlock"], time: "1 ora", range: "Contatto", comp: "V, S, M", duration: "Finché non viene dissolto", desc: "Proietta il lanciatore e i suoi alleati sul Piano Astrale, lasciando indietro i corpi fisici in trance.", crunch: "Nessun danno: proietta te e fino a 8 alleati volontari sul Piano Astrale (o su un altro piano), lasciando i corpi fisici in trance; se il corpo astrale muore, torni nel corpo con 0 PF." },
  { id: "prigionia", name: "Prigionia", level: 9, school: "ammaliamento", classes: ["mago", "warlock"], time: "1 minuto", range: "9 m", comp: "V, S, M", duration: "Finché non viene dissolto", desc: "Imprigiona una creatura in un sonno eterno, in un vincolo che ne impedisce il movimento, oppure la bandisce in un'altra dimensione.", crunch: "Nessun danno: TS Saggezza nega; se fallito, il bersaglio subisce l'effetto scelto (sepoltura, incatenamento, minimizzazione, prigione onirica o esilio) finché l'incantesimo non viene dissolto." },
  { id: "cura-di-massa", name: "Cura di Massa", level: 9, school: "evocazione", classes: ["chierico"], time: "1 azione", range: "18 m", comp: "V, S", duration: "Istantanea", desc: "Un'ondata di energia curativa risana fino a un'intera compagnia di alleati, ripristinando ingenti quantità di punti ferita.", crunch: "Cura 700 PF totali, distribuiti come vuoi tra un numero qualsiasi di creature entro 18 m; elimina anche cecità, sordità e malattie dai bersagli curati." },
  { id: "parola-di-potere-morte", name: "Parola di Potere: Morte", level: 9, school: "ammaliamento", classes: ["bardo", "mago", "stregone", "warlock"], time: "1 azione", range: "18 m", comp: "V", duration: "Istantanea", desc: "Pronuncia una parola di potere capace di uccidere istantaneamente un bersaglio con punti ferita sufficientemente bassi.", crunch: "Nessun tiro per colpire né TS: se il bersaglio ha 100 PF o meno, muore all'istante; altrimenti nessun effetto." },
  { id: "assurdo", name: "Assurdo", level: 9, school: "ammaliamento", classes: ["mago", "stregone"], time: "1 azione", range: "36 m", comp: "V, S", duration: "Concentrazione, fino a 1 minuto", desc: "Intrappola fino a dieci creature in incubi viventi, infliggendo danno psichico devastante ogni turno.", crunch: "4d10 danno psichico per fino a 10 creature nella sfera di 9 m; TS Saggezza dimezza e nega lo spavento. Se fallito, spaventate e ripetono il danno a ogni turno finché non superano il TS." },
];

const WARLOCK_PATRONS = [
  { id: "arcifatato", name: "Arcifatato", spells: { 1: ["fuoco-fatato", "sonno"], 2: ["calma-delle-emozioni", "immagine-fantasma"], 3: ["sfarfallio", "crescita-delle-piante"], 4: ["dominare-bestia", "invisibilita-superiore"], 5: ["dominare-persona", "sembianza"] } },
  { id: "demone", name: "Demone", spells: { 1: ["mani-brucianti", "comando"], 2: ["cecita-sordita", "raggio-rovente"], 3: ["palla-di-fuoco", "nube-ripugnante"], 4: ["scudo-di-fuoco", "muro-di-fuoco"], 5: ["colpo-di-fiamma", "consacrazione"] } },
  { id: "grande-antico", name: "Grande Antico", spells: { 1: ["sussurri-dissonanti", "risata-orrenda-di-tasha"], 2: ["individuazione-pensieri", "immagine-fantasma"], 3: ["chiaroveggenza", "messaggero"], 4: ["dominare-bestia", "tentacoli-neri-di-evard"], 5: ["dominare-persona", "telecinesi"] } },
];

const DIVINE_DOMAINS = [
  { id: "vita", name: "Vita", spells: { 1: ["benedizione", "cura-ferite"], 2: ["ripristinare-ferite-minori", "arma-spirituale"], 3: ["faro-di-speranza", "ravvivare"], 4: ["contrasto-alla-morte", "guardiano-di-fede"], 5: ["cura-ferite-di-gruppo", "riportare-in-vita"] } },
  { id: "luce", name: "Luce", spells: { 1: ["mani-brucianti", "fuoco-fatato"], 2: ["sfera-fiammeggiante", "raggio-rovente"], 3: ["luce-del-giorno", "palla-di-fuoco"], 4: ["guardiano-di-fede", "muro-di-fuoco"], 5: ["colpo-di-fiamma", "scrutare"] } },
  { id: "guerra", name: "Guerra", spells: { 1: ["favore-divino", "scudo-della-fede"], 2: ["arma-magica", "arma-spirituale"], 3: ["manto-del-crociato", "guardiani-spirituali"], 4: ["liberta-di-movimento", "pelle-di-pietra"], 5: ["colpo-di-fiamma", "immobilizzare-mostro"] } },
  { id: "tempesta", name: "Tempesta", spells: { 1: ["nube-di-nebbia", "onda-tonante"], 2: ["raffica-di-vento", "frantumare"], 3: ["chiamare-fulmine", "tempesta-di-neve"], 4: ["controllare-lacqua", "tempesta-di-ghiaccio"], 5: ["onda-distruttiva", "piaga-d-insetti"] } },
  { id: "natura", name: "Natura", spells: { 1: ["amicizia-con-gli-animali", "parlare-con-gli-animali"], 2: ["pelle-di-corteccia", "crescita-di-spine"], 3: ["crescita-delle-piante", "muro-di-vento"], 4: ["dominare-bestia", "viticcio-afferrante"], 5: ["piaga-d-insetti", "passo-tra-gli-alberi"] } },
  { id: "conoscenza", name: "Conoscenza", spells: { 1: ["comando", "identificazione"], 2: ["presagio", "suggestione"], 3: ["non-individuazione", "parlare-con-i-morti"], 4: ["occhio-arcano", "confusione"], 5: ["sapienza-leggendaria", "scrutare"] } },
  { id: "inganno", name: "Inganno", spells: { 1: ["charme-su-persone", "travestimento"], 2: ["immagine-speculare", "passo-senza-tracce"], 3: ["sfarfallio", "dissolvi-magie"], 4: ["porta-dimensionale", "polimorfia"], 5: ["dominare-persona", "modificare-memoria"] } },
  { id: "morte", name: "Morte", spells: { 1: ["falsa-vita", "raggio-nauseante"], 2: ["cecita-sordita", "raggio-debilitante"], 3: ["animare-morti", "tocco-vampirico"], 4: ["contrasto-alla-morte", "piaga"], 5: ["sfera-antivita", "nube-letale"] } },
];

const PALADIN_OATHS = [
  { id: "devozione", name: "Devozione", spells: { 1: ["protezione-dal-male-e-dal-bene", "santuario"], 2: ["ripristinare-ferite-minori", "zona-di-verita"], 3: ["faro-di-speranza", "dissolvi-magie"], 4: ["liberta-di-movimento", "guardiano-di-fede"], 5: ["comunione", "colpo-di-fiamma"] } },
  { id: "antichi", name: "Antichi", spells: { 1: ["colpo-intrappolante", "parlare-con-gli-animali"], 2: ["raggio-lunare", "passo-spettrale"], 3: ["crescita-delle-piante", "protezione-dalle-energie"], 4: ["tempesta-di-ghiaccio", "pelle-di-pietra"], 5: ["comunione-con-la-natura", "passo-tra-gli-alberi"] } },
  { id: "vendetta", name: "Vendetta", spells: { 1: ["malaugurio", "marchio-del-cacciatore"], 2: ["sospendere-persona", "passo-spettrale"], 3: ["velocita", "protezione-dalle-energie"], 4: ["bando", "porta-dimensionale"], 5: ["immobilizzare-mostro", "scrutare"] } },
];

const DRUID_CIRCLES = [
  { id: "artico", name: "Artico", spells: { 2: ["sospendere-persona", "crescita-di-spine"], 3: ["tempesta-di-neve", "rallentare"], 4: ["liberta-di-movimento", "tempesta-di-ghiaccio"], 5: ["comunione-con-la-natura", "cono-di-freddo"] } },
  { id: "costa", name: "Costa", spells: { 2: ["immagine-speculare", "passo-spettrale"], 3: ["respirare-in-acqua", "camminare-sulle-acque"], 4: ["controllare-lacqua", "liberta-di-movimento"], 5: ["evocare-elementale", "scrutare"] } },
  { id: "deserto", name: "Deserto", spells: { 2: ["offuscamento", "silenzio"], 3: ["creare-cibo-e-acqua", "protezione-dalle-energie"], 4: ["piaga", "terreno-illusorio"], 5: ["piaga-d-insetti", "muro-di-pietra"] } },
  { id: "foresta", name: "Foresta", spells: { 2: ["pelle-di-corteccia", "scalare-come-un-ragno"], 3: ["chiamare-fulmine", "crescita-delle-piante"], 4: ["profezia", "liberta-di-movimento"], 5: ["comunione-con-la-natura", "passo-tra-gli-alberi"] } },
  { id: "prateria", name: "Prateria", spells: { 2: ["invisibilita", "passo-senza-tracce"], 3: ["luce-del-giorno", "velocita"], 4: ["profezia", "liberta-di-movimento"], 5: ["sogno", "piaga-d-insetti"] } },
  { id: "montagna", name: "Montagna", spells: { 2: ["scalare-come-un-ragno", "crescita-di-spine"], 3: ["fulmine", "fondersi-con-la-pietra"], 4: ["modellare-la-pietra", "pelle-di-pietra"], 5: ["passamuro", "muro-di-pietra"] } },
  { id: "palude", name: "Palude", spells: { 2: ["oscurita", "freccia-acida-di-melf"], 3: ["camminare-sulle-acque", "nube-ripugnante"], 4: ["liberta-di-movimento", "localizzare-creatura"], 5: ["piaga-d-insetti", "scrutare"] } },
  { id: "sottosuolo", name: "Sottosuolo", spells: { 2: ["scalare-come-un-ragno", "ragnatela"], 3: ["forma-gassosa", "nube-ripugnante"], 4: ["invisibilita-superiore", "modellare-la-pietra"], 5: ["nube-letale", "piaga-d-insetti"] } },
  { id: "circolo-luna", name: "Circolo della Luna", spells: {} },
];

const EQUIPMENT_CATALOG = [
  { id: "bastone", name: "Bastone", category: "arma", damage: "1d4", damageType: "contundente", hands: "una mano", properties: ["Versatile (1d6)"] },
  { id: "pugnale", name: "Pugnale", category: "arma", damage: "1d4", damageType: "perforante", hands: "una mano", properties: ["Leggera", "Finezza", "Da lancio (6/18 m)"] },
  { id: "ascia-da-lancio", name: "Ascia da Lancio", category: "arma", damage: "1d6", damageType: "tagliente", hands: "una mano", properties: ["Leggera", "Da lancio (6/18 m)"] },
  { id: "giavellotto", name: "Giavellotto", category: "arma", damage: "1d6", damageType: "perforante", hands: "una mano", properties: ["Da lancio (9/36 m)"] },
  { id: "mazza", name: "Mazza", category: "arma", damage: "1d6", damageType: "contundente", hands: "una mano", properties: [] },
  { id: "falcetto", name: "Falcetto", category: "arma", damage: "1d4", damageType: "tagliente", hands: "una mano", properties: ["Leggera"] },
  { id: "lancia", name: "Lancia", category: "arma", damage: "1d6", damageType: "perforante", hands: "una mano", properties: ["Versatile (1d8)", "Da lancio (6/18 m)"] },
  { id: "arco-corto", name: "Arco Corto", category: "arma", damage: "1d6", damageType: "perforante", hands: "due mani", properties: ["Munizioni (24/96 m)"] },
  { id: "balestra-leggera", name: "Balestra Leggera", category: "arma", damage: "1d8", damageType: "perforante", hands: "due mani", properties: ["Munizioni (24/96 m)", "Ricarica"] },
  { id: "fionda", name: "Fionda", category: "arma", damage: "1d4", damageType: "contundente", hands: "una mano", properties: ["Munizioni (9/36 m)"] },
  { id: "spada-corta", name: "Spada Corta", category: "arma", damage: "1d6", damageType: "perforante", hands: "una mano", properties: ["Leggera", "Finezza"] },
  { id: "spada-lunga", name: "Spada Lunga", category: "arma", damage: "1d8", damageType: "tagliente", hands: "una mano", properties: ["Versatile (1d10)"] },
  { id: "rapiera", name: "Rapiera", category: "arma", damage: "1d8", damageType: "perforante", hands: "una mano", properties: ["Finezza"] },
  { id: "ascia-bipenne", name: "Ascia Bipenne", category: "arma", damage: "1d12", damageType: "tagliente", hands: "due mani", properties: ["Pesante"] },
  { id: "spadone", name: "Spadone", category: "arma", damage: "2d6", damageType: "tagliente", hands: "due mani", properties: ["Pesante"] },
  { id: "ascia-da-battaglia", name: "Ascia da Battaglia", category: "arma", damage: "1d8", damageType: "tagliente", hands: "una mano", properties: ["Versatile (1d10)"] },
  { id: "martello-da-guerra", name: "Martello da Guerra", category: "arma", damage: "1d8", damageType: "contundente", hands: "una mano", properties: ["Versatile (1d10)"] },
  { id: "alabarda", name: "Alabarda", category: "arma", damage: "1d10", damageType: "tagliente", hands: "due mani", properties: ["Pesante", "Portata"] },
  { id: "arco-lungo", name: "Arco Lungo", category: "arma", damage: "1d8", damageType: "perforante", hands: "due mani", properties: ["Munizioni (45/180 m)", "Pesante"] },
  { id: "balestra-pesante", name: "Balestra Pesante", category: "arma", damage: "1d10", damageType: "perforante", hands: "due mani", properties: ["Munizioni (30/120 m)", "Pesante", "Ricarica"] },
  { id: "balestra-a-mano", name: "Balestra a Mano", category: "arma", damage: "1d6", damageType: "perforante", hands: "una mano", properties: ["Leggera", "Munizioni (9/36 m)", "Ricarica"] },
  { id: "armatura-imbottita", name: "Armatura Imbottita", category: "armatura", tipo: "leggera", ac: "11 + mod. Destrezza", stealthDisadvantage: true },
  { id: "armatura-di-cuoio", name: "Armatura di Cuoio", category: "armatura", tipo: "leggera", ac: "11 + mod. Destrezza", stealthDisadvantage: false },
  { id: "cuoio-borchiato", name: "Cuoio Borchiato", category: "armatura", tipo: "leggera", ac: "12 + mod. Destrezza", stealthDisadvantage: false },
  { id: "usbergo", name: "Usbergo", category: "armatura", tipo: "media", ac: "13 + mod. Destrezza (max 2)", stealthDisadvantage: false },
  { id: "corazza-a-scaglie", name: "Corazza a Scaglie", category: "armatura", tipo: "media", ac: "14 + mod. Destrezza (max 2)", stealthDisadvantage: true },
  { id: "corazza-rinforzata", name: "Corazza Rinforzata", category: "armatura", tipo: "media", ac: "14 + mod. Destrezza (max 2)", stealthDisadvantage: false },
  { id: "mezza-piastra", name: "Mezza Piastra", category: "armatura", tipo: "media", ac: "15 + mod. Destrezza (max 2)", stealthDisadvantage: true },
  { id: "cotta-di-maglia", name: "Cotta di Maglia", category: "armatura", tipo: "pesante", ac: "14", stealthDisadvantage: true },
  { id: "maglia-di-ferro", name: "Maglia di Ferro", category: "armatura", tipo: "pesante", ac: "16", stealthDisadvantage: true, strengthReq: 13 },
  { id: "corazza-a-piastre-rinforzate", name: "Corazza a Piastre Rinforzate", category: "armatura", tipo: "pesante", ac: "17", stealthDisadvantage: true, strengthReq: 15 },
  { id: "armatura-completa", name: "Armatura Completa", category: "armatura", tipo: "pesante", ac: "18", stealthDisadvantage: true, strengthReq: 15 },
  { id: "scudo", name: "Scudo", category: "scudo", ac: "+2" },
  { id: "zaino", name: "Zaino", category: "oggetto", desc: "Può contenere fino a circa 12 kg di equipaggiamento." },
  { id: "corda-di-canapa", name: "Corda di Canapa (15 m)", category: "oggetto", desc: "Robusta corda utile per arrampicate e legature." },
  { id: "torcia", name: "Torcia", category: "oggetto", desc: "Illumina un raggio di 6 m per circa un'ora, poi si consuma." },
  { id: "lanterna-a-mano", name: "Lanterna a Mano", category: "oggetto", desc: "Illumina un raggio di 9 m; richiede olio per restare accesa." },
  { id: "olio-fiala", name: "Olio (fiala)", category: "oggetto", desc: "Alimenta una lanterna per circa 6 ore, oppure può essere versato e incendiato." },
  { id: "razioni-da-viaggio", name: "Razioni da Viaggio (1 giorno)", category: "oggetto", desc: "Cibo secco sufficiente per una giornata di marcia." },
  { id: "otre-d-acqua", name: "Otre d'Acqua", category: "oggetto", desc: "Contiene circa 1,9 litri d'acqua." },
  { id: "coperta", name: "Coperta", category: "oggetto", desc: "Utile per proteggersi dal freddo durante il riposo." },
  { id: "sacco-a-pelo", name: "Sacco a Pelo", category: "oggetto", desc: "Per dormire comodamente in viaggio." },
  { id: "kit-da-scasso", name: "Kit da Scasso", category: "oggetto", desc: "Strumenti per forzare serrature e disinnescare meccanismi." },
  { id: "kit-del-guaritore", name: "Kit del Guaritore", category: "oggetto", desc: "Dieci utilizzi; stabilizza una creatura morente senza bisogno di un tiro di Medicina." },
  { id: "simbolo-sacro", name: "Simbolo Sacro", category: "oggetto", desc: "Focus per il lancio di incantesimi divini." },
  { id: "focus-arcano", name: "Focus Arcano", category: "oggetto", desc: "Focus per il lancio di incantesimi arcani." },
  { id: "manette", name: "Manette", category: "oggetto", desc: "Immobilizzano i polsi di una creatura catturata." },
  { id: "specchio-d-acciaio", name: "Specchio d'Acciaio", category: "oggetto", desc: "Utile per vedere dietro angoli o riflettere sguardi pericolosi." },
  { id: "palo-di-ferro", name: "Palo di Ferro", category: "oggetto", desc: "Un lungo piede di ferro, utile come leva o per bloccare porte." },
  { id: "pozione-di-cura", name: "Pozione di Cura", category: "oggetto", desc: "Se bevuta, restituisce 2d4+2 punti ferita." },
];

/* ---------------------------------- HELPERS ---------------------------------- */

const mod = (score) => Math.floor((score - 10) / 2);
const fmtMod = (m) => (m >= 0 ? `+${m}` : `${m}`);
// Le velocità di razza sono memorizzate in piedi (com'è nel PHB), ma il resto dell'app esprime
// ogni distanza in metri (gittate di incantesimi e armi): convertiamo qui, alla visualizzazione,
// con la stessa equivalenza usata altrove nel file (1,5 m per ogni 5 ft, cioè un "quadretto").
const ftToM = (ft) => (ft / 5) * 1.5;
const getProficiencyBonus = (level) => Math.floor((Math.max(1, level || 1) - 1) / 4) + 2;
const POINT_BUY_COST = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
const POINT_BUY_TOTAL = 27;
const getPointBuyCost = (score) => POINT_BUY_COST[score] ?? Infinity;
// I punteggi non ancora assegnati sono "" (nessuna caratteristica scelta ancora): li trattiamo
// come costo 0, non come punteggio non valido, altrimenti la spesa totale mostrerebbe Infinity
// finché non si sono compilate tutte e sei le caratteristiche.
const getPointBuySpent = (scores) => Object.values(scores).reduce((sum, v) => sum + (v === "" || v === undefined ? 0 : getPointBuyCost(Number(v))), 0);

function getRaceSelections(draft, race) {
  return { ability: draft.raceAbilityPicks || draft.halfElfPicks || [], skill: draft.raceSkillPicks || [] };
}

function getVersatileDamage(properties) {
  if (!properties || !Array.isArray(properties)) return null;
  const versatileProp = properties.find(p => typeof p === 'string' && p.includes("Versatile"));
  if (!versatileProp) return null;
  const match = versatileProp.match(/\((\d+d\d+)\)/);
  return match ? match[1] : null;
}


/* ---------------------------------- ASI ---------------------------------- */

function getAsiLevels(clsId) {
  return ASI_LEVELS_BY_CLASS[clsId] || [];
}

function getUnlockedAsiLevels(clsId, level) {
  return getAsiLevels(clsId).filter((lvl) => lvl <= (level || 1));
}

function getLevelChoiceType(store, level) {
  // Retrocompatibile: se non specificato, il livello è di tipo "asi" (comportamento storico).
  return (store.levelChoiceType && store.levelChoiceType[level]) || "asi";
}

// Calcola il bonus di caratteristica da ASI/Talenti per UNA classe (store = draft per la
// classe primaria, oppure draft.multiclass per la classe secondaria).
function computeAsiBonusForStore(store, clsId, classLevel) {
  const bonus = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
  getUnlockedAsiLevels(clsId, classLevel).forEach((lvl) => {
    const type = getLevelChoiceType(store, lvl);
    if (type === "asi") {
      const picks = (store.asiChoices && store.asiChoices[lvl]) || [];
      picks.forEach((k) => { if (bonus[k] !== undefined) bonus[k] += 1; });
    } else if (type === "feat") {
      const featId = store.featChoices && store.featChoices[lvl];
      const feat = featId ? getFeat(featId) : null;
      const abilityPick = store.featAbilityChoices && store.featAbilityChoices[lvl];
      if (feat && feat.abilityChoice && abilityPick && bonus[abilityPick] !== undefined) {
        bonus[abilityPick] += 1;
      }
    }
  });
  return bonus;
}

// Bonus di caratteristica totale da ASI/Talenti, sommato su TUTTE le classi del personaggio
// (classe primaria + eventuale classe secondaria da multiclasse), più l'eventuale talento
// bonus concesso dalla razza (es. Umano variante) con la sua scelta di caratteristica.
function getAsiBonus(draft) {
  const total = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
  getClassEntries(draft).forEach(({ classId, level, store }) => {
    const b = computeAsiBonusForStore(store, classId, level);
    Object.keys(total).forEach((k) => { total[k] += b[k]; });
  });
  const raceFeat = draft.raceFeatId ? getFeat(draft.raceFeatId) : null;
  if (raceFeat && raceFeat.abilityChoice && draft.raceFeatAbilityChoice && total[draft.raceFeatAbilityChoice] !== undefined) {
    total[draft.raceFeatAbilityChoice] += 1;
  }
  return total;
}

function computeChosenFeatsForStore(store, clsId, classLevel) {
  return getUnlockedAsiLevels(clsId, classLevel)
    .filter((lvl) => getLevelChoiceType(store, lvl) === "feat")
    .map((lvl) => {
      const featId = store.featChoices && store.featChoices[lvl];
      const feat = featId ? getFeat(featId) : null;
      if (!feat) return null;
      const abilityPick = store.featAbilityChoices && store.featAbilityChoices[lvl];
      return { level: lvl, feat, abilityPick, classId: clsId };
    })
    .filter(Boolean);
}

// Talenti scelti su TUTTE le classi del personaggio, più l'eventuale talento bonus di razza
// (es. Umano variante), che non è legato a nessun livello di classe.
function getChosenFeats(draft) {
  const classFeats = getClassEntries(draft).flatMap(({ classId, level, store }) => computeChosenFeatsForStore(store, classId, level));
  const raceFeat = draft.raceFeatId ? getFeat(draft.raceFeatId) : null;
  if (!raceFeat) return classFeats;
  return [{ level: 1, feat: raceFeat, abilityPick: draft.raceFeatAbilityChoice || null, classId: "razza" }, ...classFeats];
}

/* ---------------------------------- MECCANICHE CALCOLATE ---------------------------------- */

function getAttacksPerAction(clsId, level, subclassId) {
  const lvl = level || 1;
  if (clsId === "guerriero") {
    if (lvl >= 20) return 4;
    if (lvl >= 11) return 3;
    if (lvl >= 5) return 2;
    return 1;
  }
  if (["barbaro", "monaco", "paladino", "ranger"].includes(clsId)) {
    return lvl >= 5 ? 2 : 1;
  }
  if (clsId === "bardo" && subclassId === "valore") {
    return lvl >= 6 ? 2 : 1;
  }
  return 1;
}

function getSneakAttackDice(level) {
  return Math.max(1, Math.ceil((level || 1) / 2));
}

function getBardicInspirationDie(level) {
  const lvl = level || 1;
  if (lvl >= 15) return "d12";
  if (lvl >= 10) return "d10";
  if (lvl >= 5) return "d8";
  return "d6";
}

// Elenco di piccole statistiche di "meccanica di classe" (attacchi extra, attacco furtivo,
// usi dell'ira, ecc.) per una classe/livello/sottoclasse: usato per mostrare queste info sia
// per la classe primaria che per un'eventuale classe secondaria da multiclasse.
function getClassMechanicsList(clsId, level, subclassId) {
  const list = [];
  const atk = getAttacksPerAction(clsId, level, subclassId);
  if (atk > 1) list.push({ key: "attacchi", label: "Attacchi per Azione", value: atk });
  if (clsId === "ladro") list.push({ key: "furtivo", label: "Attacco Furtivo", value: `${getSneakAttackDice(level)}d6` });
  if (clsId === "barbaro") list.push({ key: "ira", label: "Usi dell'Ira", value: getRageUses(level) });
  if (clsId === "bardo") list.push({ key: "ispirazione", label: "Ispirazione Bardica", value: getBardicInspirationDie(level) });
  if (clsId === "monaco" && getKiPoints(level) > 0) list.push({ key: "ki", label: "Punti Ki", value: getKiPoints(level) });
  if (clsId === "barbaro" && subclassId === "totem-aquila" && (level || 1) >= 14) {
    list.push({ key: "volo-ira", label: "Velocità di Volo (in Ira)", value: "pari alla velocità" });
  }
  const critRange = getCritRange(clsId, subclassId, level);
  if (critRange !== "20") list.push({ key: "critico", label: "Raggio di Critico", value: critRange });
  return list;
}

function getHitDieAverage(hitDie) {
  return Math.floor(hitDie / 2) + 1;
}

function computeMaxHp(draft, cls, race, conMod) {
  if (!cls) return null;
  const level = draft.level || 1;
  let hp = cls.hitDie + conMod;
  for (let lvl = 2; lvl <= level; lvl += 1) {
    const entry = draft.hpPerLevel && draft.hpPerLevel[lvl];
    const roll = entry === undefined || entry === "avg" ? getHitDieAverage(cls.hitDie) : (Number(entry) || getHitDieAverage(cls.hitDie));
    hp += roll + conMod;
  }
  if (cls.id === "stregone" && draft.subclassId === "progenie-draconica") hp += level;

  // Multiclasse: aggiungi i dadi vita di TUTTI i livelli della classe secondaria (mai un
  // "livello 1 gratuito" a dado massimo, che spetta solo alla primissima classe presa).
  const mc = draft.multiclass;
  let mcLevel = 0;
  if (mc && mc.classId) {
    const mcCls = CLASSES.find((c) => c.id === mc.classId);
    if (mcCls) {
      mcLevel = mc.level || 1;
      for (let lvl = 1; lvl <= mcLevel; lvl += 1) {
        const entry = mc.hpPerLevel && mc.hpPerLevel[lvl];
        const roll = entry === undefined || entry === "avg" ? getHitDieAverage(mcCls.hitDie) : (Number(entry) || getHitDieAverage(mcCls.hitDie));
        hp += roll + conMod;
      }
      if (mcCls.id === "stregone" && mc.subclassId === "progenie-draconica") hp += mcLevel;
    }
  }
  if (race?.id === "nano-colline") hp += level + mcLevel;
  return hp;
}

function hasDraconicResilienceAc(clsId, subclassId) {
  return clsId === "stregone" && subclassId === "progenie-draconica";
}

function getLevelUpChanges(clsId, subclassId, fromLevel, toLevel) {
  const newAsiLevels = getUnlockedAsiLevels(clsId, toLevel).filter((l) => l > fromLevel);
  const newFeatures = getUnlockedSubclassFeatures(clsId, subclassId, toLevel).filter((f) => f.level > fromLevel);
  const oldSlots = getSpellSlots(clsId, fromLevel, subclassId);
  const newSlots = getSpellSlots(clsId, toLevel, subclassId);
  const slotsChanged = JSON.stringify(oldSlots) !== JSON.stringify(newSlots);
  const oldResources = getAllClassResources(clsId, subclassId, fromLevel);
  const newResources = getAllClassResources(clsId, subclassId, toLevel);
  const resourceChanges = newResources.map((nr) => {
    const or = oldResources.find((r) => r.key === nr.key);
    if (!or) return `${nr.name}: nuova risorsa (${nr.max ?? "illimitati"})`;
    if (or.max !== nr.max) return `${nr.name}: ${or.max ?? "illimitati"} → ${nr.max ?? "illimitati"}`;
    return null;
  }).filter(Boolean);
  const oldCrit = getCritRange(clsId, subclassId, fromLevel);
  const newCrit = getCritRange(clsId, subclassId, toLevel);
  return {
    fromLevel, toLevel, newAsiLevels, newFeatures, slotsChanged, newSlots,
    resourceChanges, critChanged: oldCrit !== newCrit, oldCrit, newCrit,
  };
}

function validateClassLevelChoices(store, clsId, classLevel, className, errors) {
  getUnlockedAsiLevels(clsId, classLevel).forEach((lvl) => {
    const type = getLevelChoiceType(store, lvl);
    if (type === "feat") {
      const featId = store.featChoices && store.featChoices[lvl];
      const feat = featId ? getFeat(featId) : null;
      if (!feat) { errors.push(`Scegli un talento per il livello ${lvl} di ${className}.`); return; }
      if (feat.abilityChoice && !feat.abilityChoice.optional && !(store.featAbilityChoices && store.featAbilityChoices[lvl])) {
        errors.push(`Scegli la caratteristica del talento "${feat.name}" al livello ${lvl} di ${className}.`);
      }
    } else {
      const picks = (store.asiChoices && store.asiChoices[lvl]) || [];
      if (picks.length !== 2 || picks.some((k) => !k)) {
        errors.push(`Scegli entrambi gli incrementi ASI del livello ${lvl} di ${className}.`);
      }
    }
  });
}

function validateCharacter(draft) {
  const errors = [];
  const race = RACES.find((r) => r.id === draft.raceId);
  const cls = CLASSES.find((c) => c.id === draft.classId);

  if (!draft.name?.trim()) errors.push("Inserisci il nome del personaggio.");
  if (!race) errors.push("Seleziona una razza.");
  if (!cls) errors.push("Seleziona una classe.");
  errors.push(...getBackgroundValidationErrors(draft));

  if (draft.abilityMethod === "custom") {
    const values = Object.values(draft.baseScores).map(Number);
    if (values.some((v) => !Number.isInteger(v) || v < 8 || v > 15)) errors.push("Con il Point Buy i punteggi devono essere compresi tra 8 e 15 prima dei bonus razziali.");
    if (getPointBuySpent(draft.baseScores) !== POINT_BUY_TOTAL) errors.push(`Il Point Buy deve spendere esattamente ${POINT_BUY_TOTAL} punti.`);
  }

  if (["array", "roll"].includes(draft.abilityMethod) && Object.values(draft.baseScores).some((v) => v === "" || v === undefined)) {
    errors.push("Assegna tutti e sei i punteggi alle caratteristiche.");
  }

  if (race?.extraAbilityChoice && (draft.raceAbilityPicks || []).length !== race.extraAbilityChoice.count) {
    errors.push(`Scegli ${race.extraAbilityChoice.count} caratteristiche per il bonus razziale.`);
  }

  if (race?.extraSkillChoice && (draft.raceSkillPicks || []).length !== race.extraSkillChoice.count) {
    errors.push(`Scegli ${race.extraSkillChoice.count} abilità razziali.`);
  }

  if (race?.extraFeatChoice) {
    const raceFeat = draft.raceFeatId ? getFeat(draft.raceFeatId) : null;
    if (!raceFeat) errors.push(`Scegli il talento concesso da ${race.name}.`);
    else if (raceFeat.abilityChoice && !raceFeat.abilityChoice.optional && !draft.raceFeatAbilityChoice) {
      errors.push(`Scegli la caratteristica del talento "${raceFeat.name}" concesso da ${race.name}.`);
    }
  }

  if (cls && (draft.classSkills || []).length < cls.skillChoices) {
    errors.push(`Scegli almeno ${cls.skillChoices} competenze di classe per ${cls.name}. Hai selezionato ${draft.classSkills.length} competenze.`);
  }

  if (cls) {
    validateClassLevelChoices(draft, cls.id, draft.level, cls.name, errors);
    const finalScores = computeFinalScores(draft);
    const overCap = ABILITIES.filter((a) => finalScores[a.key] > 20);
    if (overCap.length) {
      errors.push(`Punteggio massimo di 20 superato per: ${overCap.map((a) => a.name).join(", ")}.`);
    }

    const subclassLevel = SUBCLASS_CHOICE_LEVEL[cls.id];
    if (subclassLevel && draft.level >= subclassLevel && SUBCLASSES[cls.id] && !getChosenSubclassId(draft, cls.id)) {
      errors.push(`Scegli una sottoclasse per ${cls.name} (disponibile dal livello ${subclassLevel}).`);
    }

    // Validazione Stili di Combattimento - Classe Primaria
    if (hasFightingStyles(cls.id)) {
      const maxStyles = getFightingStyleCount(cls.id, draft.level, draft.subclassId);
      const selected = getSelectedFightingStyles(draft);
      if (maxStyles > 0 && selected.length < maxStyles) {
        errors.push(`Scegli ${maxStyles} stile${maxStyles > 1 ? "i" : ""} di combattimento per ${cls.name}.`);
      }
    }
  }

  const mc = draft.multiclass;
  if (mc && mc.classId) {
    const mcCls = CLASSES.find((c) => c.id === mc.classId);
    if (mcCls) {
      validateClassLevelChoices(mc, mcCls.id, mc.level, `${mcCls.name} (secondaria)`, errors);

      const subclassLevel = SUBCLASS_CHOICE_LEVEL[mcCls.id];
      if (subclassLevel && mc.level >= subclassLevel && SUBCLASSES[mcCls.id] && !getChosenSubclassId(mc, mcCls.id)) {
        errors.push(`Scegli una sottoclasse per ${mcCls.name} (classe secondaria, disponibile dal livello ${subclassLevel}).`);
      }

      // Validazione Stili di Combattimento - Classe Secondaria
      if (hasFightingStyles(mcCls.id)) {
        const maxStyles = getFightingStyleCount(mcCls.id, mc.level, mc.subclassId);
        const selected = getSelectedFightingStyles(mc);
        if (maxStyles > 0 && selected.length < maxStyles) {
          errors.push(`Scegli ${maxStyles} stile${maxStyles > 1 ? "i" : ""} di combattimento per ${mcCls.name} (classe secondaria).`);
        }
      }
    }

    const totalLevel = getTotalCharacterLevel(draft);
    if (totalLevel > 20) {
      errors.push(`Il livello totale del personaggio (${totalLevel}) supera il massimo di 20.`);
    }
  }

  return errors;
}

const abilityKeyByName = (name) => {
  const found = ABILITIES.find((a) => name && name.includes(a.name));
  return found ? found.key : null;
};

function rollAbilityScore() {
  const rolls = Array.from({ length: 4 }, () => 1 + Math.floor(Math.random() * 6));
  rolls.sort((a, b) => a - b);
  return rolls[1] + rolls[2] + rolls[3];
}

function getRaceBonus(race, picks) {
  const b = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
  if (!race) return b;
  Object.entries(race.bonuses || {}).forEach(([k, v]) => { b[k] += v; });
  (picks || []).forEach((k) => { if (b[k] !== undefined) b[k] += 1; });
  return b;
}

function formatItemStats(item) {
  if (item.category === "arma") {
    const props = item.properties && item.properties.length ? ` · ${item.properties.join(", ")}` : "";
    return `${item.damage} ${item.damageType} · ${item.hands}${props}`;
  }
  if (item.category === "armatura") {
    const parts = [`CA ${item.ac}`, `Armatura ${item.tipo}`];
    if (item.strengthReq) parts.push(`Richiede Forza ${item.strengthReq}`);
    if (item.stealthDisadvantage) parts.push("Svantaggio a Furtività");
    return parts.join(" · ");
  }
  if (item.category === "scudo") return `CA ${item.ac}`;
  return item.desc || "";
}

let uidCounter = 0;
function nextUid() {
  uidCounter += 1;
  return `item_${Date.now()}_${uidCounter}`;
}

function emptyDraft() {
  return {
    id: null,
    name: "",
    raceId: null,
    halfElfPicks: [],
    raceAbilityPicks: [],
    raceSkillPicks: [],
    raceFeatId: null,
    raceFeatAbilityChoice: null,
    profChoices: {},
    classId: null,
    classSkills: [],
    backgroundId: null,
    customBackgroundName: "",
    customBackgroundSkills: [],
    customBackgroundEquipment: "",
    customBackgroundToolsLanguages: "",
    customBackgroundFeatureName: "",
    customBackgroundFeatureDesc: "",
    personalityTrait1: "",
    personalityTrait2: "",
    ideal: "",
    bond: "",
    flaw: "",
    abilityMethod: "array",
    rolledPool: null,
    baseScores: { str: "", dex: "", con: "", int: "", wis: "", cha: "" },
    level: 1,
    domainId: null,
    oathId: null,
    patronId: null,
    circleId: null,
    subclassId: null,
    resourcesUsed: {},
    fightingStyles: [], // Array di ID degli stili scelti
    asiChoices: {},
    levelChoiceType: {},
    featChoices: {},
    featAbilityChoices: {},
    hpPerLevel: {},
    hitDiceSpent: {},
    mysticArcanum: {},
    metamagicIds: [],
    invocationIds: [],
    disciplineIds: [],
    pactBoonId: null,
    multiclass: null,
    currentHp: null,
    tempHp: 0,
    spellsKnown: [],
    slotsUsed: {},
    inventory: [],
    twoHandedWeapons: {}, // ✅ AGGIUNGI QUESTO
    sorceryPointsUsed: 0,

  };
}

function emptyMulticlass(classId) {
  return {
    classId,
    level: 1,
    subclassId: null,
    domainId: null,
    oathId: null,
    patronId: null,
    circleId: null,
    resourcesUsed: {},
    fightingStyles: [],
    asiChoices: {},
    levelChoiceType: {},
    featChoices: {},
    featAbilityChoices: {},
    hpPerLevel: {},
    mysticArcanum: {},
    metamagicIds: [],
    invocationIds: [],
    disciplineIds: [],
    pactBoonId: null,
    bonusSkillPick: null,
  };
}

function computeFinalScores(draft) {
  const race = RACES.find((r) => r.id === draft.raceId);
  const raceBonus = getRaceBonus(race, draft.raceAbilityPicks || draft.halfElfPicks);
  const asiBonus = getAsiBonus(draft);
  const finalScores = {};
  ABILITIES.forEach((a) => {
    const base = draft.baseScores[a.key] === "" || draft.baseScores[a.key] === undefined ? 10 : draft.baseScores[a.key];
    finalScores[a.key] = base + (raceBonus[a.key] || 0) + (asiBonus[a.key] || 0);
  });
  return finalScores;
}

// Quanto manca a UNA classe incantatrice del personaggio per avere davvero finito lo step
// Incantesimi: eventuale sottoclasse-prerequisito (dominio/ordine/patrono/circolo) scelta, e
// trucchetti/incantesimi conosciuti al completo. Rispecchia esattamente i conteggi già
// mostrati in ClassSpellSection, così la spunta non può mai disallinearsi da quel che si vede.
function getCasterSpellStatus(clsId, chosenSubclassId, level, store, draft, finalScores) {
  const caster = getEffectiveCasterInfo(clsId, chosenSubclassId);
  if (!caster) return null;
  const maxLevelReal = getMaxSpellLevel(clsId, level, chosenSubclassId);
  if (maxLevelReal === 0) return { subclassChoiceOk: true, cantripsNeeded: 0, cantripsKnown: 0, spellsNeeded: 0, spellsKnown: 0 };

  const abilityMod = mod(finalScores[caster.ability]);
  const cantripsNeeded = caster.cantrips[Math.min(level, 20) - 1];
  const spellsNeeded = getSpellsLimit(clsId, caster, level, abilityMod);
  const dataMax = Math.min(maxLevelReal, MAX_DATA_SPELL_LEVEL);
  const thirdCaster = isThirdCaster(clsId, chosenSubclassId);
  const spellClassId = thirdCaster ? "mago" : clsId;

  const subclassChoiceOk = clsId === "chierico" ? !!store.domainId
    : clsId === "paladino" ? !!store.oathId
    : clsId === "warlock" ? !!store.patronId
    : clsId === "druido" ? !!store.circleId
    : true;

  const subclassSpellIds = clsId === "chierico" ? getDomainSpellIds(store.domainId, maxLevelReal)
    : clsId === "paladino" ? getOathSpellIds(store.oathId, maxLevelReal)
      : clsId === "druido" ? getCircleSpellIds(store.circleId, maxLevelReal)
        : [];
  const patronSpellIds = clsId === "warlock" && store.patronId ? getPatronSpellIds(store.patronId, maxLevelReal) : [];

  const cantripOptions = SPELLS.filter((s) => s.level === 0 && s.classes.includes(spellClassId));
  const spellOptions = SPELLS.filter((s) => s.level >= 1 && s.level <= dataMax && !subclassSpellIds.includes(s.id) && (s.classes.includes(spellClassId) || patronSpellIds.includes(s.id)));

  const cantripsKnown = draft.spellsKnown.filter((id) => cantripOptions.some((s) => s.id === id)).length;
  const spellsKnown = draft.spellsKnown.filter((id) => spellOptions.some((s) => s.id === id)).length;

  return { subclassChoiceOk, cantripsNeeded, cantripsKnown, spellsNeeded, spellsKnown };
}

const STEPS = [
  { key: "razza", label: "Razza", icon: Users },
  { key: "classe", label: "Classe", icon: Sword },
  { key: "caratteristiche", label: "Caratteristiche", icon: Dices },
  { key: "background", label: "Background", icon: ScrollText },
  { key: "equipaggiamento", label: "Equipaggiamento", icon: Backpack },
  { key: "incantesimi", label: "Incantesimi", icon: Sparkles },
  { key: "riepilogo", label: "Riepilogo", icon: BookOpen },
];

// Lo step ha i requisiti minimi per proseguire (usata per abilitare "Avanti"): solo i campi
// davvero obbligatori, così scelte facoltative (flavour del background, corredo extra) non
// bloccano mai la navigazione.
function isStepComplete(key, draft) {
  const race = RACES.find((r) => r.id === draft.raceId);
  const cls = CLASSES.find((c) => c.id === draft.classId);
  switch (key) {
    case "razza":
      return !!draft.raceId
        && (!race?.extraAbilityChoice || (draft.raceAbilityPicks || []).length === race.extraAbilityChoice.count)
        && (!race?.extraSkillChoice || (draft.raceSkillPicks || []).length === race.extraSkillChoice.count)
        && (!race?.extraFeatChoice || (draft.raceFeatId && (!getFeat(draft.raceFeatId)?.abilityChoice || getFeat(draft.raceFeatId).abilityChoice.optional || draft.raceFeatAbilityChoice)))
        && areProfChoicesSatisfied(race?.proficiencyChoices, draft.profChoices);
    case "classe": {
      const subclass = getSubclass(draft.classId, draft.subclassId);
      return !!draft.classId && (draft.classSkills || []).length === cls?.skillChoices
        && areProfChoicesSatisfied(subclass?.proficiencyChoices, draft.profChoices);
    }
    case "caratteristiche":
      return validateCharacter({ ...draft, name: draft.name || "draft" }).filter((e) => e.includes("Point Buy") || e.includes("punteggi") || e.includes("caratteristiche")).length === 0;
    case "background":
      return getBackgroundValidationErrors(draft).length === 0;
    case "equipaggiamento":
    case "incantesimi":
    case "riepilogo":
      return true;
    default:
      return false;
  }
}

// Spunta ✓ nella barra laterale: più severa di isStepComplete, perché per alcuni step il
// "minimo per proseguire" non è un buon segnale di step davvero rifinito (background scelto
// con un click ma senza personalità, nessun oggetto nel corredo, riepilogo con errori residui).
function isStepFullyComplete(key, draft) {
  switch (key) {
    case "background":
      return isStepComplete("background", draft)
        && !!(draft.personalityTrait1 || "").trim()
        && !!(draft.personalityTrait2 || "").trim()
        && !!(draft.ideal || "").trim()
        && !!(draft.bond || "").trim()
        && !!(draft.flaw || "").trim();
    case "equipaggiamento":
      return (draft.inventory || []).length > 0;
    case "incantesimi": {
      if (!draft.classId) return false;
      const casterEntries = getClassEntries(draft).filter((e) => getEffectiveCasterInfo(e.classId, e.subclassId));
      if (casterEntries.length === 0) return true;
      const finalScores = computeFinalScores(draft);
      return casterEntries.every((e) => {
        const status = getCasterSpellStatus(e.classId, e.subclassId, e.level, e.store, draft, finalScores);
        if (!status) return true;
        const subclass = getSubclass(e.classId, e.subclassId);
        return status.subclassChoiceOk
          && status.cantripsKnown >= status.cantripsNeeded
          && status.spellsKnown >= status.spellsNeeded
          && areProfChoicesSatisfied(subclass?.proficiencyChoices, e.store.profChoices);
      });
    }
    case "riepilogo":
      return validateCharacter(draft).length === 0;
    default:
      return isStepComplete(key, draft);
  }
}

const STORAGE_KEY = "dnd-characters-5e2014-v2";
const RULESET_VERSION = "D&D 5e 2014";

const storageAdapter = {
  async get(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? { value: fallback } : { value: raw };
    } catch (error) {
      console.error("Storage read failed:", error);
      return { value: fallback };
    }
  },
  async set(key, value, fallback) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error("Storage write failed:", error);
      return false;
    }
  },
};


/* ---------------------------------- SMALL UI PIECES ---------------------------------- */

function Frame({ children, style, className = "" }) {
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

function Divider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "1.25rem 0" }}>
      <div style={{ flex: 1, height: 1, background: C.parchmentLine }} />
      <div style={{ width: 6, height: 6, transform: "rotate(45deg)", background: C.gold }} />
      <div style={{ flex: 1, height: 1, background: C.parchmentLine }} />
    </div>
  );
}

function GoldButton({ children, onClick, disabled, style, icon: Icon }) {
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

function GhostButton({ children, onClick, style, icon: Icon }) {
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

function Pill({ children, active, onClick, disabled, title }) {
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

function OptionCard({ selected, onClick, title, subtitle, children }) {
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
function ProficiencyChoicePicker({ spec, selected, onToggle }) {
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

// Aggiorna draft.profChoices[spec.key] con un toggle capped at spec.count, seguendo lo stesso
// pattern "updateStore((s) => partial)" usato altrove (Metamagia, Invocazioni, ecc.).
function areProfChoicesSatisfied(specs, profChoices) {
  return (specs || []).every((spec) => ((profChoices && profChoices[spec.key]) || []).length === spec.count);
}

function toggleProfChoice(updateStore, spec, value) {
  updateStore((s) => {
    const current = (s.profChoices && s.profChoices[spec.key]) || [];
    const has = current.includes(value);
    if (has) return { profChoices: { ...s.profChoices, [spec.key]: current.filter((v) => v !== value) } };
    if (current.length >= spec.count) return {};
    return { profChoices: { ...s.profChoices, [spec.key]: [...current, value] } };
  });
}

/* ---------------------------------- STEP: RACE ---------------------------------- */

// Raggruppa RACES per "famiglia" (es. Nano → Delle Colline / Delle Montagne), nell'ordine in
// cui compaiono in RACES. Le razze senza sottorazze (es. Dragonide) restano famiglie di un solo membro.
function getRaceFamilies() {
  const families = [];
  RACES.forEach((r) => {
    const famName = r.family || r.name;
    let fam = families.find((f) => f.name === famName);
    if (!fam) { fam = { name: famName, members: [] }; families.push(fam); }
    fam.members.push(r);
  });
  return families;
}

function StepRace({ draft, setDraft }) {
  const race = RACES.find((r) => r.id === draft.raceId);
  const families = getRaceFamilies();
  const currentFamilyName = race ? (race.family || race.name) : null;
  // Famiglia "aperta" per la scelta della sottorazza: se l'utente non ha ancora cliccato
  // nulla in questa sessione dello step, resta agganciata alla razza già selezionata (se c'è).
  const [browsingFamily, setBrowsingFamily] = useState(null);
  const activeFamilyName = browsingFamily || currentFamilyName;
  const activeFamily = families.find((f) => f.name === activeFamilyName);

  const selectRace = (r) => setDraft((d) => {
    const profChoices = Object.fromEntries(Object.entries(d.profChoices || {}).filter(([k]) => !k.startsWith("razza-")));
    const fixedSkills = r.bonusProficiencies?.skills || [];
    const classSkills = (d.classSkills || []).filter((s) => !fixedSkills.includes(s));
    return { ...d, raceId: r.id, raceAbilityPicks: [], raceSkillPicks: [], halfElfPicks: [], raceFeatId: null, raceFeatAbilityChoice: null, profChoices, classSkills };
  });
  const raceFeat = draft.raceFeatId ? getFeat(draft.raceFeatId) : null;

  return (
    <div>
      <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: C.textOnParchment, margin: "0 0 4px" }}>Scegli la stirpe</h2>
      <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textMuted, margin: "0 0 1.25rem" }}>
        La razza determina bonus alle caratteristiche, velocità e tratti innati.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "var(--g2)", gap: "0.5rem 1.5rem" }}>
        {families.map((fam) => {
          const single = fam.members.length === 1;
          const repr = single ? fam.members[0] : null;
          const selected = single ? draft.raceId === repr.id : activeFamilyName === fam.name;
          return (
            <OptionCard
              key={fam.name}
              selected={selected}
              onClick={() => { if (single) selectRace(repr); setBrowsingFamily(fam.name); }}
              title={fam.name}
              subtitle={single ? Object.entries(repr.bonuses).map(([k, v]) => `${k.toUpperCase()} +${v}`).join(", ") : `${fam.members.length} sottorazze`}
            >
              <p style={{ fontFamily: "'Spectral', serif", fontStyle: "italic", fontSize: 12.5, color: C.textMuted, margin: 0 }}>
                {single ? repr.blurb : fam.members.map((m) => m.subraceName || m.name).join(" · ")}
              </p>
            </OptionCard>
          );
        })}
      </div>

      {activeFamily && activeFamily.members.length > 1 && (
        <div style={{ marginTop: "1.25rem" }}>
          <Divider />
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: C.wineDeep, margin: "0 0 8px" }}>
            Sottorazza — {activeFamily.name}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "var(--g2)", gap: "0.5rem 1.5rem" }}>
            {activeFamily.members.map((r) => (
              <OptionCard
                key={r.id}
                selected={draft.raceId === r.id}
                onClick={() => selectRace(r)}
                title={r.subraceName || r.name}
                subtitle={Object.entries(r.bonuses).map(([k, v]) => `${k.toUpperCase()} +${v}`).join(", ") || "Nessun bonus di caratteristica fisso"}
              >
                <p style={{ fontFamily: "'Spectral', serif", fontStyle: "italic", fontSize: 12.5, color: C.textMuted, margin: 0 }}>{r.blurb}</p>
              </OptionCard>
            ))}
          </div>
        </div>
      )}

      {race && (
        <div style={{ marginTop: "1.25rem" }}>
          <Divider />
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textOnParchment }}>
            <span><b>Taglia:</b> {race.size}</span>
            <span><b>Velocità:</b> {ftToM(race.speed)} m</span>
            <span><b>Scurovisione:</b> {race.dark ? "Sì (18 m)" : "No"}</span>
          </div>
          <ul style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textOnParchment, marginTop: 10, paddingLeft: 18 }}>
            {race.traits.map((t, i) => <li key={i} style={{ marginBottom: 4 }}>{t}</li>)}
          </ul>

          {race.extraAbilityChoice && (
            <div style={{ marginTop: 10 }}>
              <p style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textOnParchment, marginBottom: 8 }}>
                Scegli {race.extraAbilityChoice.count} caratteristiche a cui assegnare +1.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {ABILITIES.filter((a) => !(race.extraAbilityChoice.exclude || []).includes(a.key)).map((a) => {
                  const picks = draft.raceAbilityPicks || [];
                  const picked = picks.includes(a.key);
                  const disabled = !picked && picks.length >= race.extraAbilityChoice.count;
                  return <Pill key={a.key} active={picked} onClick={() => { if (disabled) return; setDraft((d) => ({ ...d, raceAbilityPicks: picked ? (d.raceAbilityPicks || []).filter((k) => k !== a.key) : [...(d.raceAbilityPicks || []), a.key] })); }}>{a.name}</Pill>;
                })}
              </div>
            </div>
          )}
          {race.extraSkillChoice && (
            <div style={{ marginTop: 10 }}>
              <p style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textOnParchment, marginBottom: 8 }}>
                Scegli {race.extraSkillChoice.count} abilità aggiuntive.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {Object.keys(SKILL_ABILITY).map((skill) => {
                  const picks = draft.raceSkillPicks || []; const picked = picks.includes(skill); const disabled = !picked && picks.length >= race.extraSkillChoice.count;
                  return <Pill key={skill} active={picked} onClick={() => { if (disabled) return; setDraft((d) => ({ ...d, raceSkillPicks: picked ? (d.raceSkillPicks || []).filter((k) => k !== skill) : [...(d.raceSkillPicks || []), skill], classSkills: picked ? d.classSkills : (d.classSkills || []).filter((s) => s !== skill) })); }}>{skill}</Pill>;
                })}
              </div>
            </div>
          )}
          {(race.proficiencyChoices || []).map((spec) => (
            <ProficiencyChoicePicker
              key={spec.key}
              spec={spec}
              selected={(draft.profChoices && draft.profChoices[spec.key]) || []}
              onToggle={(value) => toggleProfChoice((fn) => setDraft((d) => ({ ...d, ...fn(d) })), spec, value)}
            />
          ))}
          {race.extraFeatChoice && (
            <div style={{ marginTop: 10 }}>
              <p style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textOnParchment, marginBottom: 8 }}>
                Scegli un talento (bonus di razza).
              </p>
              <select
                value={draft.raceFeatId || ""}
                onChange={(e) => setDraft((d) => ({ ...d, raceFeatId: e.target.value || null, raceFeatAbilityChoice: null }))}
                style={{
                  width: "100%", maxWidth: 420, fontFamily: "'Spectral', serif", fontSize: 13, padding: "0.4rem 0.5rem",
                  borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff", marginBottom: 8,
                }}
              >
                <option value="">— Scegli un talento —</option>
                {FEATS.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              {raceFeat && (
                <div style={{ marginBottom: 8 }}>
                  {raceFeat.prerequisite && (
                    <p style={{ fontFamily: "'Spectral', serif", fontSize: 12, fontStyle: "italic", color: C.wine, margin: "0 0 4px" }}>
                      Prerequisito: {raceFeat.prerequisite}
                    </p>
                  )}
                  <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: 0 }}>{raceFeat.desc}</p>
                </div>
              )}
              {raceFeat && raceFeat.abilityChoice && (
                <select
                  value={draft.raceFeatAbilityChoice || ""}
                  onChange={(e) => setDraft((d) => ({ ...d, raceFeatAbilityChoice: e.target.value || null }))}
                  style={{
                    fontFamily: "'Spectral', serif", fontSize: 13, padding: "0.35rem 0.5rem",
                    borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff",
                  }}
                >
                  <option value="">{raceFeat.abilityChoice.optional ? "Bonus caratteristica (opzionale) — scegli" : "Bonus caratteristica del talento — scegli"}</option>
                  {ABILITIES.filter((a) => raceFeat.abilityChoice.keys.includes(a.key)).map((a) => (
                    <option key={a.key} value={a.key}>{a.name} (+1)</option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------- STEP: CLASS ---------------------------------- */

function StepClass({ draft, setDraft }) {
  const cls = CLASSES.find((c) => c.id === draft.classId);
  const race = RACES.find((r) => r.id === draft.raceId);
  // Abilità già ottenute dalla razza (competenza fissa o a scelta): non selezionabili di nuovo
  // dalla classe, per evitare di "sprecare" una scelta su una competenza duplicata.
  const raceGrantedSkills = [...(race?.bonusProficiencies?.skills || []), ...(draft.raceSkillPicks || [])];
  const toggleSkill = (skill) => {
    if (raceGrantedSkills.includes(skill)) return;
    setDraft((d) => {
      const has = d.classSkills.includes(skill);
      if (has) return { ...d, classSkills: d.classSkills.filter((s) => s !== skill) };
      if (d.classSkills.length >= cls.skillChoices) return d;
      return { ...d, classSkills: [...d.classSkills, skill] };
    });
  };
  return (
    <div>
      <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: C.textOnParchment, margin: "0 0 4px" }}>Scegli la classe</h2>
      <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textMuted, margin: "0 0 1rem" }}>
        La classe definisce dado vita, competenze e stile di combattimento.
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.25rem" }}>
        <label style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: C.textMuted }}>Livello del personaggio</label>
        <input
          type="range" min={1} max={20} value={draft.level}
          onChange={(e) => setDraft((d) => ({ ...d, level: Number(e.target.value) }))}
          style={{ width: 160 }}
        />
        <span style={{ fontFamily: "'Cinzel', serif", fontSize: 15, color: C.wineDeep, minWidth: 20 }}>{draft.level}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "var(--g2)", gap: "0.5rem 1.5rem" }}>
        {CLASSES.map((c) => (
          <OptionCard
            key={c.id}
            selected={draft.classId === c.id}
            onClick={() => setDraft((d) => ({ ...d, classId: c.id, classSkills: [], asiChoices: {}, levelChoiceType: {}, featChoices: {}, featAbilityChoices: {}, subclassId: null, resourcesUsed: {} }))}
            title={c.name}
            subtitle={`Dado Vita: d${c.hitDie} · ${c.primary}`}
          >
            <p style={{ fontFamily: "'Spectral', serif", fontStyle: "italic", fontSize: 12.5, color: C.textMuted, margin: 0 }}>{c.blurb}</p>
          </OptionCard>
        ))}
      </div>

      {cls && (
        <div style={{ marginTop: "1.25rem" }}>
          <Divider />
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textOnParchment, marginBottom: 12 }}>
            <span><b>Dado vita:</b> d{cls.hitDie}</span>
            <span><b>Tiri salvezza:</b> {cls.saves.join(", ")}</span>
          </div>
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textOnParchment, margin: "0 0 4px" }}>
            <b>Armature:</b> {cls.armor}
          </p>
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textOnParchment, margin: "0 0 14px" }}>
            <b>Armi:</b> {cls.weapons}
          </p>

          <p style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textOnParchment, marginBottom: 8 }}>
            Scegli {cls.skillChoices} competenze ({draft.classSkills.length}/{cls.skillChoices}):
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {cls.skillOptions.map((s) => {
              const grantedByRace = raceGrantedSkills.includes(s);
              return (
                <Pill
                  key={s}
                  active={draft.classSkills.includes(s) || grantedByRace}
                  disabled={grantedByRace}
                  title={grantedByRace ? "Già ottenuta dalla razza" : undefined}
                  onClick={() => toggleSkill(s)}
                >
                  {s}{grantedByRace ? " (razza)" : ""}
                </Pill>
              );
            })}
          </div>

          {/* <-- QUI INSERISCI IL FIGHTING STYLE SELECTOR --> */}
          {cls && hasFightingStyles(cls.id) && (
            <div style={{ marginTop: "1.25rem" }}>
              <Divider />
              <FightingStyleSelector
                store={draft}
                updateStore={(fn) => setDraft((d) => ({ ...d, ...fn(d) }))}
                clsId={cls.id}
                classLevel={draft.level}
                label={`Stile di Combattimento — ${cls.name}`}
              />
            </div>
          )}
        </div>
      )}

      {cls && !["chierico", "paladino", "warlock", "druido"].includes(cls.id) && getSubclassOptions(cls.id).length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <Divider />
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 4px" }}>
            Sottoclasse — {cls.name}
          </h3>
          {draft.level < (SUBCLASS_CHOICE_LEVEL[cls.id] || 3) ? (
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textMuted, margin: 0 }}>
              Disponibile dal livello {SUBCLASS_CHOICE_LEVEL[cls.id] || 3}.
            </p>
          ) : (
            <>
              <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "0 0 10px" }}>
                Scegli la sottoclasse del tuo personaggio.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "var(--g2)", gap: "0.5rem 1rem" }}>
                {getSubclassOptions(cls.id).map((s) => (
                  <OptionCard
                    key={s.id}
                    selected={getChosenSubclassId(draft, cls.id) === s.id}
                    onClick={() => setDraft((d) => {
                      const nextId = d.subclassId === s.id ? null : s.id;
                      const profChoices = Object.fromEntries(Object.entries(d.profChoices || {}).filter(([k]) => !k.startsWith("sub-")));
                      return { ...d, subclassId: nextId, profChoices };
                    })}
                    title={s.name}
                  >
                    <p style={{ fontFamily: "'Spectral', serif", fontStyle: "italic", fontSize: 12.5, color: C.textMuted, margin: 0 }}>{s.blurb}</p>
                  </OptionCard>
                ))}
              </div>
              {(getSubclass(cls.id, draft.subclassId)?.proficiencyChoices || []).map((spec) => (
                <ProficiencyChoicePicker
                  key={spec.key}
                  spec={spec}
                  selected={(draft.profChoices && draft.profChoices[spec.key]) || []}
                  onToggle={(value) => toggleProfChoice((fn) => setDraft((d) => ({ ...d, ...fn(d) })), spec, value)}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------- STEP: ABILITIES ---------------------------------- */

function AsiPicker({ store, updateStore, clsId, classLevel, onlyLevels }) {
  const allAsiLevels = clsId ? getUnlockedAsiLevels(clsId, classLevel) : [];
  const asiLevels = onlyLevels ? allAsiLevels.filter((l) => onlyLevels.includes(l)) : allAsiLevels;
  if (!asiLevels.length) return null;

  const setAsiPick = (level, idx, value) => {
    updateStore((s) => {
      const current = (s.asiChoices && s.asiChoices[level]) || ["", ""];
      const next = [...current];
      next[idx] = value;
      return { asiChoices: { ...s.asiChoices, [level]: next } };
    });
  };

  const setChoiceType = (level, type) => {
    updateStore((s) => ({
      levelChoiceType: { ...s.levelChoiceType, [level]: type },
      asiChoices: { ...s.asiChoices, [level]: ["", ""] },
      featChoices: { ...s.featChoices, [level]: "" },
      featAbilityChoices: { ...s.featAbilityChoices, [level]: "" },
    }));
  };

  const setFeatPick = (level, featId) => {
    updateStore((s) => ({
      featChoices: { ...s.featChoices, [level]: featId },
      featAbilityChoices: { ...s.featAbilityChoices, [level]: "" },
    }));
  };

  const setFeatAbilityPick = (level, key) => {
    updateStore((s) => ({ featAbilityChoices: { ...s.featAbilityChoices, [level]: key } }));
  };

  return (
    <>
      <Divider />
      <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "1.25rem 0 8px" }}>
        Incrementi di Livello (ASI o Talento)
      </h3>
      <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "0 0 12px" }}>
        Per ogni livello sbloccato scegli: due incrementi da +1 a caratteristiche (anche la stessa due volte, per un totale di +2, max 20), oppure un Talento. Alcuni talenti concedono a loro volta +1 a una caratteristica.
      </p>
      {asiLevels.map((lvl) => {
        const type = getLevelChoiceType(store, lvl);
        const picks = (store.asiChoices && store.asiChoices[lvl]) || ["", ""];
        const featId = (store.featChoices && store.featChoices[lvl]) || "";
        const feat = featId ? getFeat(featId) : null;
        const abilityPick = (store.featAbilityChoices && store.featAbilityChoices[lvl]) || "";
        return (
          <div key={lvl} style={{ marginBottom: 14, padding: "0.7rem 0.8rem", border: `1px solid ${C.parchmentLine}`, borderRadius: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: 12.5, color: C.textOnParchment, minWidth: 90 }}>
                Livello {lvl}
              </span>
              <Pill active={type === "asi"} onClick={() => setChoiceType(lvl, "asi")}>Incremento caratteristiche</Pill>
              <Pill active={type === "feat"} onClick={() => setChoiceType(lvl, "feat")}>Talento</Pill>
            </div>

            {type === "asi" ? (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[0, 1].map((idx) => (
                  <select
                    key={idx}
                    value={picks[idx] || ""}
                    onChange={(e) => setAsiPick(lvl, idx, e.target.value)}
                    style={{
                      fontFamily: "'Spectral', serif", fontSize: 13, padding: "0.35rem 0.5rem",
                      borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff",
                    }}
                  >
                    <option value="">Incremento {idx + 1} — scegli</option>
                    {ABILITIES.map((a) => (
                      <option key={a.key} value={a.key}>{a.name} (+1)</option>
                    ))}
                  </select>
                ))}
              </div>
            ) : (
              <div>
                <select
                  value={featId}
                  onChange={(e) => setFeatPick(lvl, e.target.value)}
                  style={{
                    width: "100%", maxWidth: 420, fontFamily: "'Spectral', serif", fontSize: 13, padding: "0.4rem 0.5rem",
                    borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff", marginBottom: 8,
                  }}
                >
                  <option value="">— Scegli un talento —</option>
                  {FEATS.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
                {feat && (
                  <div style={{ marginBottom: 8 }}>
                    {feat.prerequisite && (
                      <p style={{ fontFamily: "'Spectral', serif", fontSize: 12, fontStyle: "italic", color: C.wine, margin: "0 0 4px" }}>
                        Prerequisito: {feat.prerequisite}
                      </p>
                    )}
                    <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: 0 }}>{feat.desc}</p>
                  </div>
                )}
                {feat && feat.abilityChoice && (
                  <select
                    value={abilityPick}
                    onChange={(e) => setFeatAbilityPick(lvl, e.target.value)}
                    style={{
                      fontFamily: "'Spectral', serif", fontSize: 13, padding: "0.35rem 0.5rem",
                      borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff",
                    }}
                  >
                    <option value="">{feat.abilityChoice.optional ? "Bonus caratteristica (opzionale) — scegli" : "Bonus caratteristica del talento — scegli"}</option>
                    {ABILITIES.filter((a) => feat.abilityChoice.keys.includes(a.key)).map((a) => (
                      <option key={a.key} value={a.key}>{a.name} (+1)</option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

function StepAbilities({ draft, setDraft }) {
  const race = RACES.find((r) => r.id === draft.raceId);
  const cls = CLASSES.find((c) => c.id === draft.classId);
  const bonus = useMemo(() => getRaceBonus(race, draft.raceAbilityPicks || draft.halfElfPicks), [race, draft.raceAbilityPicks, draft.halfElfPicks]);
  const asiBonus = useMemo(() => getAsiBonus(draft, draft.classId), [draft.asiChoices, draft.levelChoiceType, draft.featChoices, draft.featAbilityChoices, draft.classId, draft.level, draft.raceFeatId, draft.raceFeatAbilityChoice]);

  const pool = draft.abilityMethod === "array" ? STANDARD_ARRAY : draft.rolledPool;
  const usesPool = draft.abilityMethod === "array" || draft.abilityMethod === "roll";

  const usedValues = Object.values(draft.baseScores).filter((v) => v !== "");
  const availableFor = (currentVal) => {
    if (!pool) return [];
    const counts = {};
    pool.forEach((v) => { counts[v] = (counts[v] || 0) + 1; });
    usedValues.forEach((v) => { if (v !== currentVal) counts[v] = (counts[v] || 0) - 1; });
    return pool.filter((v, i) => pool.indexOf(v) === i).filter((v) => counts[v] > 0 || v === currentVal);
  };

  const setMethod = (method) => {
    setDraft((d) => ({
      ...d,
      abilityMethod: method,
      baseScores: { str: "", dex: "", con: "", int: "", wis: "", cha: "" },
      rolledPool: method === "roll" ? d.rolledPool : null,
    }));
  };

  const rollAll = () => {
    const pool6 = Array.from({ length: 6 }, rollAbilityScore);
    setDraft((d) => ({ ...d, rolledPool: pool6, baseScores: { str: "", dex: "", con: "", int: "", wis: "", cha: "" } }));
  };

  const setBase = (key, value) => {
    setDraft((d) => ({ ...d, baseScores: { ...d.baseScores, [key]: value === "" ? "" : Number(value) } }));
  };

  return (
    <div>
      <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: C.textOnParchment, margin: "0 0 4px" }}>Genera le caratteristiche</h2>
      <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textMuted, margin: "0 0 1.25rem" }}>
        Scegli un metodo, poi assegna i punteggi alle sei caratteristiche.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <Pill active={draft.abilityMethod === "array"} onClick={() => setMethod("array")}>Array standard</Pill>
        <Pill active={draft.abilityMethod === "roll"} onClick={() => setMethod("roll")}>Tiro dei dadi</Pill>
        <Pill active={draft.abilityMethod === "custom"} onClick={() => setMethod("custom")}>Point Buy</Pill>
      </div>
      {draft.abilityMethod === "custom" && (
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: getPointBuySpent(draft.baseScores) === POINT_BUY_TOTAL ? C.forestDeep : C.danger, margin: "0 0 16px" }}>
          Point Buy: {getPointBuySpent(draft.baseScores)}/{POINT_BUY_TOTAL} punti spesi. Punteggi consentiti: 8–15 prima dei bonus razziali.
        </p>
      )}

      {draft.abilityMethod === "roll" && (
        <div style={{ marginBottom: 16 }}>
          <GhostButton icon={Dices} onClick={rollAll} style={{ borderColor: C.wine, color: C.wine }}>
            {draft.rolledPool ? "Tira di nuovo (4d6, scarta il minore)" : "Tira i dadi (4d6, scarta il minore)"}
          </GhostButton>
          {draft.rolledPool && (
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textMuted, marginTop: 8 }}>
              Punteggi ottenuti: {[...draft.rolledPool].sort((a, b) => b - a).join(", ")}
            </p>
          )}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "var(--g3)", gap: "0.9rem" }}>
        {ABILITIES.map((a) => {
          const base = draft.baseScores[a.key];
          const final = (base === "" || base === undefined ? 10 : base) + (bonus[a.key] || 0) + (asiBonus[a.key] || 0);
          const showFinal = base !== "" && base !== undefined;
          return (
            <div key={a.key} style={{ border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0.85rem" }}>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: C.textOnParchment, marginBottom: 6 }}>
                {a.name}
                {bonus[a.key] ? <span style={{ color: C.wine }}> +{bonus[a.key]} razza</span> : null}
                {asiBonus[a.key] ? <span style={{ color: C.forestDeep }}> +{asiBonus[a.key]} ASI</span> : null}
              </div>
              {usesPool ? (
                <select
                  value={base === "" || base === undefined ? "" : base}
                  onChange={(e) => setBase(a.key, e.target.value)}
                  disabled={!pool}
                  style={{
                    width: "100%", fontFamily: "'Spectral', serif", fontSize: 14, padding: "0.4rem",
                    borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff",
                  }}
                >
                  <option value="">—</option>
                  {(pool ? [...pool].sort((x, y) => y - x) : []).map((v, i) => (
                    <option
                      key={i}
                      value={v}
                      disabled={v === base || availableFor(base).indexOf(v) === -1}
                    >
                      {v}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={base === "" || base === undefined ? "" : base}
                  onChange={(e) => setBase(a.key, e.target.value === "" ? "" : Number(e.target.value))}
                  style={{ width: "100%", fontFamily: "'Spectral', serif", fontSize: 14, padding: "0.4rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff" }}
                >
                  <option value="">—</option>
                  {Object.keys(POINT_BUY_COST).map((v) => <option key={v} value={v}>{v} ({POINT_BUY_COST[v]} pt)</option>)}
                </select>
              )}
              {showFinal && (
                <div style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, marginTop: 6 }}>
                  Totale {final} ({fmtMod(mod(final))})
                </div>
              )}
            </div>
          );
        })}
      </div>

      {cls && (
        <AsiPicker
          store={draft}
          updateStore={(fn) => setDraft((d) => ({ ...d, ...fn(d) }))}
          clsId={cls.id}
          classLevel={draft.level}
        />
      )}
    </div>
  );
}

/* ---------------------------------- STEP: BACKGROUND ---------------------------------- */

// Campo di testo libero per un aspetto "flavour" del personaggio (tratto, ideale, legame,
// difetto): il giocatore può scrivere liberamente, oppure cliccare un suggerimento tratto
// dalla tabella del background per riempire il campo con un solo click.
function FlavorField({ label, value, onChange, suggestions }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{ fontFamily: "'Cinzel', serif", fontSize: 12.5, color: C.wineDeep, margin: "0 0 6px" }}>{label}</p>
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        placeholder="Scrivi liberamente, oppure scegli un suggerimento qui sotto…"
        style={{
          width: "100%", fontFamily: "'Spectral', serif", fontSize: 13, padding: "0.5rem 0.6rem",
          borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff", resize: "vertical", boxSizing: "border-box",
        }}
      />
      {suggestions && suggestions.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => onChange(s)}
              title="Usa questo suggerimento"
              style={{
                cursor: "pointer", textAlign: "left", fontFamily: "'Spectral', serif", fontSize: 11.5,
                padding: "0.3rem 0.55rem", borderRadius: 3, border: `1px solid ${C.parchmentLine}`,
                background: "rgba(255,255,255,0.5)", color: C.textMuted, maxWidth: 260,
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StepBackground({ draft, setDraft }) {
  const bg = getSelectedBackground(draft);
  const isCustom = draft.backgroundId === CUSTOM_BACKGROUND_ID;

  const toggleCustomSkill = (skill) => setDraft((d) => {
    const picks = d.customBackgroundSkills || [];
    const picked = picks.includes(skill);
    if (picked) return { ...d, customBackgroundSkills: picks.filter((s) => s !== skill) };
    if (picks.length >= 2) return d;
    return { ...d, customBackgroundSkills: [...picks, skill] };
  });

  const clearBgProfChoices = (d) => Object.fromEntries(Object.entries(d.profChoices || {}).filter(([k]) => !k.startsWith("bg-")));

  return (
    <div>
      <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: C.textOnParchment, margin: "0 0 4px" }}>Scegli il background</h2>
      <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textMuted, margin: "0 0 1.25rem" }}>
        Racconta da dove viene il personaggio prima dell'avventura.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "var(--g2)", gap: "0.5rem 1.5rem" }}>
        {BACKGROUNDS.map((b) => (
          <OptionCard
            key={b.id}
            selected={draft.backgroundId === b.id}
            onClick={() => setDraft((d) => ({ ...d, backgroundId: b.id, profChoices: clearBgProfChoices(d) }))}
            title={b.name}
            subtitle={b.skills.join(", ")}
          />
        ))}
        <OptionCard
          selected={isCustom}
          onClick={() => setDraft((d) => ({ ...d, backgroundId: CUSTOM_BACKGROUND_ID, profChoices: clearBgProfChoices(d) }))}
          title="Personalizzato"
          subtitle="Costruito da zero"
        >
          <p style={{ fontFamily: "'Spectral', serif", fontStyle: "italic", fontSize: 12.5, color: C.textMuted, margin: 0 }}>
            Definisci competenze, corredo e tratto seguendo la regola "Personalizzare un Background" del PHB 2014.
          </p>
        </OptionCard>
      </div>

      {isCustom && (
        <div style={{ marginTop: "1.25rem" }}>
          <Divider />
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: C.wineDeep, margin: "0 0 8px" }}>Background personalizzato</p>

          <input
            type="text" placeholder="Nome del background (es. Cacciatore di Taglie)"
            value={draft.customBackgroundName || ""}
            onChange={(e) => setDraft((d) => ({ ...d, customBackgroundName: e.target.value }))}
            style={{ width: "100%", fontFamily: "'Spectral', serif", fontSize: 13.5, padding: "0.45rem 0.6rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff", marginBottom: 12, boxSizing: "border-box" }}
          />

          <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textOnParchment, marginBottom: 8 }}>
            Scegli 2 competenze ({(draft.customBackgroundSkills || []).length}/2).
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {Object.keys(SKILL_ABILITY).map((skill) => (
              <Pill key={skill} active={(draft.customBackgroundSkills || []).includes(skill)} onClick={() => toggleCustomSkill(skill)}>
                {skill}
              </Pill>
            ))}
          </div>

          <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textOnParchment, marginBottom: 4 }}>
            Corredo di partenza (una voce per riga)
          </p>
          <textarea
            value={draft.customBackgroundEquipment || ""}
            onChange={(e) => setDraft((d) => ({ ...d, customBackgroundEquipment: e.target.value }))}
            rows={3}
            placeholder={"Es.\nUn set di attrezzi da scasso\nUna borsa con 10 mo"}
            style={{ width: "100%", fontFamily: "'Spectral', serif", fontSize: 13, padding: "0.5rem 0.6rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff", marginBottom: 12, resize: "vertical", boxSizing: "border-box" }}
          />

          <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textOnParchment, marginBottom: 4 }}>
            Strumenti o lingua aggiuntivi (opzionale)
          </p>
          <input
            type="text" placeholder="Es. Strumenti da falegname, oppure una lingua a scelta"
            value={draft.customBackgroundToolsLanguages || ""}
            onChange={(e) => setDraft((d) => ({ ...d, customBackgroundToolsLanguages: e.target.value }))}
            style={{ width: "100%", fontFamily: "'Spectral', serif", fontSize: 13, padding: "0.45rem 0.6rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff", marginBottom: 12, boxSizing: "border-box" }}
          />

          <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textOnParchment, marginBottom: 4 }}>
            Tratto di background — nome
          </p>
          <input
            type="text" placeholder="Es. Rete di Informatori"
            value={draft.customBackgroundFeatureName || ""}
            onChange={(e) => setDraft((d) => ({ ...d, customBackgroundFeatureName: e.target.value }))}
            style={{ width: "100%", fontFamily: "'Spectral', serif", fontSize: 13.5, padding: "0.45rem 0.6rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff", marginBottom: 8, boxSizing: "border-box" }}
          />
          <textarea
            value={draft.customBackgroundFeatureDesc || ""}
            onChange={(e) => setDraft((d) => ({ ...d, customBackgroundFeatureDesc: e.target.value }))}
            rows={2}
            placeholder="Cosa concede meccanicamente o narrativamente questo tratto? Concordalo con il Master."
            style={{ width: "100%", fontFamily: "'Spectral', serif", fontSize: 13, padding: "0.5rem 0.6rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff", resize: "vertical", boxSizing: "border-box" }}
          />
        </div>
      )}

      {!isCustom && bg && (
        <div style={{ marginTop: "1.25rem" }}>
          <Divider />
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textOnParchment, margin: "0 0 4px" }}>
            <b>Tratto — {bg.feature}:</b> {bg.featureDesc}
          </p>
          {(bg.proficiencyChoices || []).map((spec) => (
            <ProficiencyChoicePicker
              key={spec.key}
              spec={spec}
              selected={(draft.profChoices && draft.profChoices[spec.key]) || []}
              onToggle={(value) => toggleProfChoice((fn) => setDraft((d) => ({ ...d, ...fn(d) })), spec, value)}
            />
          ))}
        </div>
      )}

      {bg && (
        <div style={{ marginTop: "1.25rem" }}>
          <Divider />
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: C.wineDeep, margin: "0 0 4px" }}>
            Personalità
          </p>
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 12, color: C.textMuted, margin: "0 0 12px" }}>
            Facoltativo, ma dà spessore al personaggio: due tratti della personalità, un ideale, un legame e un difetto.
          </p>
          <FlavorField label="Tratto della personalità 1" value={draft.personalityTrait1} onChange={(v) => setDraft((d) => ({ ...d, personalityTrait1: v }))} suggestions={bg.personalityTraits} />
          <FlavorField label="Tratto della personalità 2" value={draft.personalityTrait2} onChange={(v) => setDraft((d) => ({ ...d, personalityTrait2: v }))} suggestions={bg.personalityTraits} />
          <FlavorField label="Ideale" value={draft.ideal} onChange={(v) => setDraft((d) => ({ ...d, ideal: v }))} suggestions={bg.ideals} />
          <FlavorField label="Legame" value={draft.bond} onChange={(v) => setDraft((d) => ({ ...d, bond: v }))} suggestions={bg.bonds} />
          <FlavorField label="Difetto" value={draft.flaw} onChange={(v) => setDraft((d) => ({ ...d, flaw: v }))} suggestions={bg.flaws} />
        </div>
      )}
    </div>
  );
}

/* ---------------------------------- STEP: EQUIPMENT ---------------------------------- */

const CATALOG_GROUPS = [
  { key: "arma", label: "Armi" },
  { key: "armatura", label: "Armature" },
  { key: "scudo", label: "Scudi" },
  { key: "oggetto", label: "Oggetti" },
];

function InventoryRow({ item, onQtyChange, onRemove, onToggleGrip }) {
  const isVersatile = (item.properties || []).some((p) => p.includes("Versatile"));
  const twoHanded = item.twoHanded || false;

  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
      padding: "0.6rem 0.85rem", border: `1px solid ${C.parchmentLine}`, borderRadius: 2, marginBottom: 6,
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 13.5, color: C.textOnParchment }}>{item.name}</div>
        <div style={{ fontFamily: "'Spectral', serif", fontSize: 12, color: C.textMuted }}>{formatItemStats(item)}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <button onClick={() => onQtyChange(Math.max(1, item.qty - 1))} style={qtyBtnStyle}>−</button>
        <span style={{ fontFamily: "'Spectral', serif", fontSize: 13, minWidth: 18, textAlign: "center" }}>{item.qty}</span>
        <button onClick={() => onQtyChange(item.qty + 1)} style={qtyBtnStyle}>+</button>

        {isVersatile && onToggleGrip && (
          <button
            onClick={onToggleGrip}
            style={{
              background: twoHanded ? C.wine : "transparent",
              color: twoHanded ? C.cream : C.textOnParchment,
              border: `1px solid ${twoHanded ? C.wine : C.parchmentLine}`,
              cursor: "pointer",
              borderRadius: 3,
              padding: "3px 8px",
              fontFamily: "'Spectral', serif",
              fontSize: 11,
              transition: "all 120ms ease",
            }}
          >
            {twoHanded ? "🔴 2 mani" : "🟢 1 mano"}
          </button>
        )}

        {item.category !== "oggetto" && (
          <button
            onClick={item.onToggleEquip}
            style={{
              background: item.equipped ? C.forest : "transparent",
              color: item.equipped ? C.cream : C.forestDeep,
              border: `1px solid ${C.forest}`,
              cursor: "pointer",
              borderRadius: 3,
              padding: "3px 6px",
              fontFamily: "'Spectral', serif",
              fontSize: 11
            }}
          >
            {item.equipped ? "Equipaggiato" : "Equipaggia"}
          </button>
        )}

        <button onClick={onRemove} style={{ background: "transparent", border: "none", cursor: "pointer", color: C.danger, padding: 4, marginLeft: 4 }} aria-label="Rimuovi oggetto">
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

const qtyBtnStyle = {
  width: 22, height: 22, borderRadius: 3, border: `1px solid ${C.parchmentLine}`, background: "#fff",
  cursor: "pointer", fontFamily: "'Spectral', serif", fontSize: 14, lineHeight: 1, display: "flex",
  alignItems: "center", justifyContent: "center", color: C.textOnParchment,
};

function InventoryManager({ draft, setDraft, allowAdd = true }) {
  const [pickCategory, setPickCategory] = useState("arma");
  const [pickId, setPickId] = useState("");
  const [pickQty, setPickQty] = useState(1);
  const [customName, setCustomName] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [customQty, setCustomQty] = useState(1);

  const catalogOptions = EQUIPMENT_CATALOG.filter((i) => i.category === pickCategory);
  const previewItem = catalogOptions.find((i) => i.id === pickId);

  const addFromCatalog = () => {
    if (!previewItem) return;
    setDraft((d) => {
      const alreadyEquippedSameSlot = (previewItem.category === "armatura" || previewItem.category === "scudo")
        && d.inventory.some((it) => it.category === previewItem.category && it.equipped);
      const autoEquip = (previewItem.category === "armatura" || previewItem.category === "scudo") && !alreadyEquippedSameSlot;
      return {
        ...d,
        inventory: [...d.inventory, { ...previewItem, uid: nextUid(), qty: Math.max(1, pickQty), equipped: autoEquip }],
      };
    });
    setPickId("");
    setPickQty(1);
  };

  const addCustom = () => {
    if (!customName.trim()) return;
    setDraft((d) => ({
      ...d,
      inventory: [...d.inventory, {
        uid: nextUid(), id: null, name: customName.trim(), category: "oggetto",
        desc: customDesc.trim() || "Oggetto personalizzato.", qty: Math.max(1, customQty), custom: true,
      }],
    }));
    setCustomName(""); setCustomDesc(""); setCustomQty(1);
  };

  const updateQty = (uid, qty) => {
    setDraft((d) => ({ ...d, inventory: d.inventory.map((it) => (it.uid === uid ? { ...it, qty } : it)) }));
  };

  const removeItem = (uid) => {
    setDraft((d) => ({ ...d, inventory: d.inventory.filter((it) => it.uid !== uid) }));
  };

  const toggleEquip = (uid) => {
    setDraft((d) => ({
      ...d,
      inventory: d.inventory.map((it) => {
        if (it.uid === uid) return { ...it, equipped: !it.equipped };
        const target = d.inventory.find((x) => x.uid === uid);
        if (target && !target.equipped && it.category === target.category && (it.category === "armatura" || it.category === "scudo")) {
          return { ...it, equipped: false };
        }
        return it;
      }),
    }));
  };

  // toggleGrip - Gestisce l'impugnatura delle armi versatili (1 mano / 2 mani)
  const toggleGrip = (uid) => {
    setDraft((d) => ({
      ...d,
      twoHandedWeapons: {
        ...(d.twoHandedWeapons || {}),
        [uid]: !(d.twoHandedWeapons?.[uid] || false)
      }
    }));
  };

  return (
    <div>
      <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 10px" }}>Inventario</h3>

      {draft.inventory.length === 0 ? (
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textMuted, marginBottom: 14 }}>
          Ancora vuoto. Aggiungi qui sotto le armi, le armature e gli oggetti che il personaggio porta con sé o acquista in gioco.
        </p>
      ) : (
        <div style={{ marginBottom: 16 }}>
          {draft.inventory.map((it) => {
            // Determina se l'arma è usata a due mani
            const isTwoHanded = draft.twoHandedWeapons?.[it.uid] || false;

            return (
              <InventoryRow
                key={it.uid}
                item={{
                  ...it,
                  twoHanded: isTwoHanded,
                  onToggleEquip: () => toggleEquip(it.uid)
                }}
                onQtyChange={(q) => updateQty(it.uid, q)}
                onRemove={() => removeItem(it.uid)}
                onToggleGrip={() => toggleGrip(it.uid)}
              />
            );
          })}
        </div>
      )}

      {allowAdd && (
        <>
          <div style={{ border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0.9rem 1rem", marginBottom: 14 }}>
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: C.textMuted, margin: "0 0 8px" }}>Aggiungi dal catalogo</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
              {CATALOG_GROUPS.map((g) => (
                <Pill key={g.key} active={pickCategory === g.key} onClick={() => { setPickCategory(g.key); setPickId(""); }}>
                  {g.label}
                </Pill>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <select
                value={pickId} onChange={(e) => setPickId(e.target.value)}
                style={{ flex: 1, minWidth: 200, fontFamily: "'Spectral', serif", fontSize: 13.5, padding: "0.45rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff" }}
              >
                <option value="">Scegli un oggetto…</option>
                {catalogOptions.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
              <input
                type="number" min={1} value={pickQty}
                onChange={(e) => setPickQty(Math.max(1, Number(e.target.value) || 1))}
                style={{ width: 60, fontFamily: "'Spectral', serif", fontSize: 13.5, padding: "0.45rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff" }}
              />
              <GoldButton icon={Plus} disabled={!previewItem} onClick={addFromCatalog} style={{ padding: "0.5rem 1rem" }}>
                Aggiungi
              </GoldButton>
            </div>
            {previewItem && (
              <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "8px 0 0" }}>
                {formatItemStats(previewItem)}
              </p>
            )}
          </div>

          <div style={{ border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0.9rem 1rem" }}>
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: C.textMuted, margin: "0 0 8px" }}>Aggiungi oggetto personalizzato</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                type="text" placeholder="Nome dell'oggetto" value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                style={{ flex: 1, minWidth: 160, fontFamily: "'Spectral', serif", fontSize: 13.5, padding: "0.45rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff" }}
              />
              <input
                type="text" placeholder="Descrizione (opzionale)" value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                style={{ flex: 2, minWidth: 200, fontFamily: "'Spectral', serif", fontSize: 13.5, padding: "0.45rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff" }}
              />
              <input
                type="number" min={1} value={customQty}
                onChange={(e) => setCustomQty(Math.max(1, Number(e.target.value) || 1))}
                style={{ width: 60, fontFamily: "'Spectral', serif", fontSize: 13.5, padding: "0.45rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff" }}
              />
              <GoldButton icon={Plus} disabled={!customName.trim()} onClick={addCustom} style={{ padding: "0.5rem 1rem" }}>
                Aggiungi
              </GoldButton>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StepEquipment({ draft, setDraft }) {
  const cls = CLASSES.find((c) => c.id === draft.classId);
  const bg = getSelectedBackground(draft);

  return (
    <div>
      <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: C.textOnParchment, margin: "0 0 4px" }}>Equipaggiamento</h2>
      <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textMuted, margin: "0 0 1.25rem" }}>
        Il corredo suggerito alla creazione, e l'inventario che puoi aggiornare in ogni momento — anche durante la partita.
      </p>

      {cls && bg ? (
        <div style={{ display: "grid", gridTemplateColumns: "var(--g2)", gap: "1.5rem", marginBottom: 20 }}>
          <div>
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: C.wineDeep, margin: "0 0 8px" }}>Corredo suggerito da {cls.name}</h3>
            <ul style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, paddingLeft: 18, margin: 0 }}>
              {cls.equipment.map((e, i) => <li key={i} style={{ marginBottom: 4 }}>{e}</li>)}
            </ul>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: C.forestDeep, margin: "0 0 8px" }}>Corredo suggerito da {bg.name}</h3>
            <ul style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, paddingLeft: 18, margin: 0 }}>
              {bg.equipment.map((e, i) => <li key={i} style={{ marginBottom: 4 }}>{e}</li>)}
            </ul>
          </div>
        </div>
      ) : (
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textMuted, marginBottom: 20 }}>
          Completa Classe e Background per vedere anche il corredo suggerito.
        </p>
      )}

      <Divider />

      <InventoryManager draft={draft} setDraft={setDraft} />
    </div>
  );
}

/* ---------------------------------- STEP: SPELLS ---------------------------------- */

function SpellRow({ spell, selected, disabled, onToggle }) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled && !selected}
      style={{
        textAlign: "left", width: "100%", padding: "0.7rem 0.9rem", marginBottom: 6, borderRadius: 2,
        border: `1px solid ${selected ? C.wine : C.parchmentLine}`,
        borderLeft: selected ? `4px solid ${C.wine}` : "4px solid transparent",
        background: selected ? "#f5efdf" : "transparent",
        cursor: disabled && !selected ? "not-allowed" : "pointer",
        opacity: disabled && !selected ? 0.55 : 1,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
        <span style={{ fontFamily: "'Cinzel', serif", fontSize: 13.5, color: selected ? C.wineDeep : C.textOnParchment }}>
          {spell.name} <span style={{ fontFamily: "'Spectral', serif", fontStyle: "italic", fontSize: 11.5, color: C.textMuted }}>— {SCHOOLS[spell.school]}</span>
        </span>
        {selected && <Check size={14} color={C.wine} style={{ flexShrink: 0 }} />}
      </div>
      <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "3px 0 6px" }}>{spell.desc}</p>
      {spell.crunch && (
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 12, color: C.wineDeep, margin: "0 0 6px", fontWeight: 600 }}>
          <b style={{ fontFamily: "'Cinzel', serif", fontWeight: 700 }}>Meccanica:</b> {spell.crunch}
        </p>
      )}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontFamily: "'Spectral', serif", fontSize: 11, color: C.textMuted }}>
        <span><b>Tempo:</b> {spell.time}</span>
        <span><b>Gittata:</b> {spell.range}</span>
        <span><b>Componenti:</b> {spell.comp}</span>
        <span><b>Durata:</b> {spell.duration}</span>
      </div>
    </button>
  );
}

// Chiave usata in slotsUsed per uno slot: gli slot da Patto Magico (Warlock) sono un pool
// SEPARATO da quello normale anche quando condividono lo stesso livello numerico (es. un
// multiclasse Paladino/Warlock con entrambi slot di 2° livello, ma pool distinti).
function slotUsedKey(s) {
  return s.pact ? `pact-${s.level}` : `${s.level}`;
}

function SlotTracker({ slots, slotsUsed, setDraft }) {
  if (!slots.length) return null;
  const nonPact = slots.filter((s) => !s.pact);
  const pact = slots.filter((s) => s.pact);

  const setUsed = (s, count) => {
    setDraft((d) => ({ ...d, slotsUsed: { ...d.slotsUsed, [slotUsedKey(s)]: count } }));
  };
  const restGroup = (group) => {
    setDraft((d) => {
      const next = { ...d.slotsUsed };
      group.forEach((s) => { delete next[slotUsedKey(s)]; });
      return { ...d, slotsUsed: next };
    });
  };

  const renderGroup = (group, label, restLabel) => {
    if (!group.length) return null;
    return (
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: 0 }}>
            {label}
          </h3>
          <GhostButton onClick={() => restGroup(group)} style={{ borderColor: C.forest, color: C.forestDeep, padding: "0.4rem 0.8rem", fontSize: 12 }}>
            {restLabel} — recupera tutti
          </GhostButton>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {group.map((s) => {
            const used = Math.min(slotsUsed[slotUsedKey(s)] || 0, s.total);
            return (
              <div key={slotUsedKey(s)} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: 12.5, color: C.textOnParchment, minWidth: 90 }}>
                  Livello {s.level}
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  {Array.from({ length: s.total }).map((_, i) => {
                    const isUsed = i < used;
                    return (
                      <button
                        key={i}
                        onClick={() => setUsed(s, isUsed ? i : i + 1)}
                        title={isUsed ? "Segna come disponibile" : "Segna come usato"}
                        style={{
                          width: 20, height: 20, borderRadius: "50%", cursor: "pointer",
                          border: `1px solid ${C.wine}`,
                          background: isUsed ? "transparent" : C.wine,
                        }}
                      />
                    );
                  })}
                </div>
                <span style={{ fontFamily: "'Spectral', serif", fontSize: 12, color: C.textMuted }}>
                  {s.total - used}/{s.total} disponibili
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {renderGroup(nonPact, "Slot incantesimo", "Riposo lungo")}
      {renderGroup(pact, "Slot incantesimo (Patto Magico)", "Riposo breve")}
    </>
  );
}

function ResourceTracker({ resource, used, onSetUsed }) {
  const [amount, setAmount] = useState(1);
  if (resource.max == null) {
    return (
      <div style={{ marginBottom: 10 }}>
        <span style={{ fontFamily: "'Cinzel', serif", fontSize: 12.5, color: C.textOnParchment }}>{resource.name}: illimitati</span>
      </div>
    );
  }
  const usedCount = Math.min(used || 0, resource.max);
  const setUsed = (n) => onSetUsed(resource.key, n);

  if (resource.pool) {
    const remaining = resource.max - usedCount;
    return (
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: 12.5, color: C.textOnParchment }}>
            {resource.name}: <b>{remaining}</b> / {resource.max}
          </span>
          <GhostButton onClick={() => setUsed(0)} style={{ borderColor: C.forest, color: C.forestDeep, padding: "0.3rem 0.7rem", fontSize: 11 }}>
            {resource.resetOn === "short" ? "Riposo breve" : "Riposo lungo"} — recupera
          </GhostButton>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="number" min={0} max={remaining} value={amount}
            onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
            style={{ width: 60, fontFamily: "'Spectral', serif", fontSize: 13.5, padding: "0.35rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff" }}
          />
          <GhostButton
            onClick={() => setUsed(Math.min(resource.max, usedCount + Math.min(amount, remaining)))}
            disabled={remaining <= 0 || amount <= 0}
            style={{ borderColor: C.wine, color: C.wineDeep, padding: "0.35rem 0.8rem", fontSize: 12 }}
          >
            Spendi
          </GhostButton>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
        <span style={{ fontFamily: "'Cinzel', serif", fontSize: 12.5, color: C.textOnParchment }}>{resource.name}</span>
        <GhostButton onClick={() => setUsed(0)} style={{ borderColor: C.forest, color: C.forestDeep, padding: "0.3rem 0.7rem", fontSize: 11 }}>
          {resource.resetOn === "short" ? "Riposo breve" : "Riposo lungo"} — recupera
        </GhostButton>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {Array.from({ length: resource.max }).map((_, i) => {
          const isUsed = i < usedCount;
          return (
            <button
              key={i}
              onClick={() => setUsed(isUsed ? i : i + 1)}
              title={isUsed ? "Segna come disponibile" : "Segna come usato"}
              style={{
                width: 18, height: 18, borderRadius: "50%", cursor: "pointer",
                border: `1px solid ${C.forest}`,
                background: isUsed ? "transparent" : C.forest,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function SpellManager({ draft, setDraft, showPlayTools = false }) {
  const [spellSearch, setSpellSearch] = useState("");
  const cls = CLASSES.find((c) => c.id === draft.classId);

  if (!cls) {
    return <p style={{ fontFamily: "'Spectral', serif", color: C.textMuted }}>Completa prima il passo Classe.</p>;
  }

  const entries = getClassEntries(draft);
  const casterEntries = entries.filter((e) => getEffectiveCasterInfo(e.classId, e.subclassId));

  if (casterEntries.length === 0) {
    const canBecomeThirdCaster = entries.some((e) => e.classId === "guerriero" || e.classId === "ladro");
    const names = entries.map((e) => CLASSES.find((c) => c.id === e.classId)?.name).filter(Boolean).join(" / ");
    return (
      <div>
        <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: C.textOnParchment, margin: "0 0 4px" }}>Incantesimi</h2>
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textMuted }}>
          {names} non lancia{entries.length > 1 ? "no" : ""} incantesimi
          {canBecomeThirdCaster ? ", a meno di scegliere la sottoclasse Cavaliere Mistico (Guerriero) o Furfante Arcano (Ladro)." : "."}
        </p>
      </div>
    );
  }

  const slots = getEffectiveSpellSlots(draft);

  return (
    <div>
      <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: C.textOnParchment, margin: "0 0 4px" }}>Incantesimi</h2>

      {casterEntries.length > 1 && (
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textMuted, margin: "0 0 1rem", fontStyle: "italic" }}>
          Personaggio multiclasse: gli slot incantesimo sono un'unica riserva condivisa, calcolata secondo la Tabella dell'Incantatore Multiclasse (5e 2014). Il Patto Magico del Warlock resta invece un pool separato, che si recupera con un riposo breve.
        </p>
      )}

      {showPlayTools ? (
        <SlotTracker slots={slots} slotsUsed={draft.slotsUsed} setDraft={setDraft} />
      ) : (
        slots.length > 0 && (
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textOnParchment, marginBottom: 18 }}>
            <b>Slot incantesimo:</b> {slots.map((s) => `liv. ${s.level} × ${s.total}${s.pact ? " (patto)" : ""}`).join(", ")}
          </p>
        )
      )}

      <Divider />

      <input
        type="text" placeholder="Cerca un incantesimo per nome…" value={spellSearch}
        onChange={(e) => setSpellSearch(e.target.value)}
        style={{
          width: "100%", fontFamily: "'Spectral', serif", fontSize: 13.5, padding: "0.5rem 0.7rem",
          borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff", marginBottom: 18, boxSizing: "border-box",
        }}
      />

      {casterEntries.map((entry) => (
        <ClassSpellSection
          key={entry.classId}
          draft={draft}
          setDraft={setDraft}
          entry={entry}
          showPlayTools={showPlayTools}
          spellSearch={spellSearch}
          multi={casterEntries.length > 1}
        />
      ))}
    </div>
  );
}

// Selettore Metamagia (Stregone), Invocazioni Occulte e Dono del Patto (Warlock): estratti
// come componenti a sé stanti così da poter essere riusati sia nello step Incantesimi
// (ClassSpellSection) sia nel modal di level-up, senza duplicare la logica di scelta.
function MetamagicPicker({ store, updateStore, level }) {
  const known = getMetamagicKnownCount(level);
  if (known <= 0) return null;
  const chosen = store.metamagicIds || [];
  const toggle = (id) => updateStore((s) => {
    const list = s.metamagicIds || [];
    if (list.includes(id)) return { metamagicIds: list.filter((x) => x !== id) };
    if (list.length >= known) return {};
    return { metamagicIds: [...list, id] };
  });
  return (
    <>
      <Divider />
      <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 4px" }}>
        Metamagia — scegline {known} ({chosen.length}/{known})
      </h3>
      <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "0 0 10px" }}>
        Modifica un incantesimo lanciato spendendo Punti Stregoneria. Puoi usare una sola opzione di Metamagia per incantesimo, a meno che la descrizione non dica altrimenti.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 10 }}>
        {METAMAGIC_OPTIONS.map((m) => {
          const active = chosen.includes(m.id);
          return (
            <div
              key={m.id}
              onClick={() => toggle(m.id)}
              style={{
                cursor: "pointer", border: `1px solid ${active ? C.wine : C.parchmentLine}`,
                background: active ? "rgba(122,32,40,0.06)" : "transparent",
                borderRadius: 2, padding: "0.5rem 0.7rem",
                opacity: !active && chosen.length >= known ? 0.5 : 1,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: 12.5, color: C.textOnParchment }}>{m.name}</span>
                <span style={{ fontFamily: "'Spectral', serif", fontSize: 11, color: C.wineDeep, whiteSpace: "nowrap" }}>{m.cost}</span>
              </div>
              <p style={{ fontFamily: "'Spectral', serif", fontSize: 12, color: C.textMuted, margin: "4px 0 0" }}>{m.desc}</p>
            </div>
          );
        })}
      </div>
    </>
  );
}

function PactBoonPicker({ store, updateStore, level }) {
  if ((level || 1) < 3) return null;
  return (
    <>
      <Divider />
      <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 8px" }}>Dono del Patto</h3>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        {PACT_BOONS.map((p) => (
          <Pill key={p.id} active={store.pactBoonId === p.id} onClick={() => updateStore((s) => ({ pactBoonId: s.pactBoonId === p.id ? null : p.id }))}>
            {p.name}
          </Pill>
        ))}
      </div>
      {store.pactBoonId && (
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "0 0 10px", fontStyle: "italic" }}>
          {PACT_BOONS.find((p) => p.id === store.pactBoonId)?.desc}
        </p>
      )}
    </>
  );
}

function InvocationPicker({ store, updateStore, level }) {
  const known = getInvocationsKnownCount(level);
  if (known <= 0) return null;
  const chosen = store.invocationIds || [];
  const toggle = (id) => updateStore((s) => {
    const list = s.invocationIds || [];
    if (list.includes(id)) return { invocationIds: list.filter((x) => x !== id) };
    if (list.length >= known) return {};
    return { invocationIds: [...list, id] };
  });
  const available = WARLOCK_INVOCATIONS.filter((i) => i.minLevel <= (level || 1));
  return (
    <>
      <Divider />
      <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 4px" }}>
        Invocazioni Occulte — scegline {known} ({chosen.length}/{known})
      </h3>
      <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "0 0 10px" }}>
        Alcune invocazioni richiedono un Dono del Patto specifico: verifica il prerequisito indicato prima di sceglierle.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
        {available.map((i) => {
          const active = chosen.includes(i.id);
          return (
            <div
              key={i.id}
              onClick={() => toggle(i.id)}
              style={{
                cursor: "pointer", border: `1px solid ${active ? C.wine : C.parchmentLine}`,
                background: active ? "rgba(122,32,40,0.06)" : "transparent",
                borderRadius: 2, padding: "0.5rem 0.7rem",
                opacity: !active && chosen.length >= known ? 0.5 : 1,
              }}
            >
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: 12.5, color: C.textOnParchment }}>{i.name}</div>
              {i.prereq && (
                <div style={{ fontFamily: "'Spectral', serif", fontSize: 11, color: C.wineDeep, fontStyle: "italic" }}>Richiede: {i.prereq}</div>
              )}
              <p style={{ fontFamily: "'Spectral', serif", fontSize: 12, color: C.textMuted, margin: "4px 0 0" }}>{i.desc}</p>
            </div>
          );
        })}
      </div>
    </>
  );
}

// Sezione incantesimi per UNA classe incantatrice del personaggio (store = draft per la
// classe primaria, oppure draft.multiclass per la classe secondaria da multiclasse).
function ClassSpellSection({ draft, setDraft, entry, showPlayTools, spellSearch, multi }) {
  const cls = CLASSES.find((c) => c.id === entry.classId);
  if (!cls) return null;
  const chosenSubclassId = entry.subclassId;
  const caster = getEffectiveCasterInfo(cls.id, chosenSubclassId);
  if (!caster) return null;
  const store = entry.store;
  const updateStore = entry.isPrimary
    ? (fn) => setDraft((d) => ({ ...d, ...fn(d) }))
    : (fn) => setDraft((d) => ({ ...d, multiclass: { ...d.multiclass, ...fn(d.multiclass) } }));

  const sectionHeader = multi && (
    <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 15, color: C.wineDeep, margin: "0 0 8px", paddingTop: 14, borderTop: `1px solid ${C.parchmentLine}` }}>
      {cls.name} (liv. {entry.level})
    </h3>
  );

  const maxLevelReal = getMaxSpellLevel(cls.id, entry.level, chosenSubclassId);
  if (maxLevelReal === 0) {
    return (
      <div style={{ marginBottom: 18 }}>
        {sectionHeader}
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textMuted }}>
          Al livello {entry.level}, {cls.name} non ha ancora slot di incantesimo.
          {caster.halfCaster ? " Le classi semi-incantatrici come questa ottengono i primi incantesimi al 2° livello." : ""}
          {isThirdCaster(cls.id, chosenSubclassId) ? " I terzi-incantatori ottengono i primi incantesimi al 3° livello." : ""}
        </p>
      </div>
    );
  }

  const finalScores = computeFinalScores(draft);
  const abilityMod = mod(finalScores[caster.ability]);
  const abilityName = ABILITIES.find((a) => a.key === caster.ability).name;
  const cantripsCount = caster.cantrips[Math.min(entry.level, 20) - 1];
  const spellsLimit = getSpellsLimit(cls.id, caster, entry.level, abilityMod);
  const preparedPerDay = caster.type === "spellbook" ? getPreparedPerDay(caster, entry.level, abilityMod) : null;
  const dataMax = Math.min(maxLevelReal, MAX_DATA_SPELL_LEVEL);
  const thirdCaster = isThirdCaster(cls.id, chosenSubclassId);
  const spellClassId = thirdCaster ? "mago" : cls.id;

  const domain = cls.id === "chierico" ? DIVINE_DOMAINS.find((d) => d.id === store.domainId) : null;
  const oath = cls.id === "paladino" ? PALADIN_OATHS.find((o) => o.id === store.oathId) : null;
  const patron = cls.id === "warlock" ? WARLOCK_PATRONS.find((p) => p.id === store.patronId) : null;
  const circle = cls.id === "druido" ? DRUID_CIRCLES.find((c) => c.id === store.circleId) : null;
  const subclassSpellIds = cls.id === "chierico" ? getDomainSpellIds(store.domainId, maxLevelReal)
    : cls.id === "paladino" ? getOathSpellIds(store.oathId, maxLevelReal)
      : cls.id === "druido" ? getCircleSpellIds(store.circleId, maxLevelReal)
        : [];
  const patronSpellIds = patron ? getPatronSpellIds(store.patronId, maxLevelReal) : [];
  const subclassLabel = domain ? `Dominio ${domain.name}` : oath ? `Ordine di ${oath.name}` : circle ? `Circolo — ${circle.name}` : null;

  const cantripOptions = SPELLS.filter((s) => s.level === 0 && s.classes.includes(spellClassId));
  const spellOptions = SPELLS.filter((s) => s.level >= 1 && s.level <= dataMax && !subclassSpellIds.includes(s.id) && (s.classes.includes(spellClassId) || patronSpellIds.includes(s.id)));
  const subclassSpellObjects = subclassSpellIds.map((id) => SPELLS.find((s) => s.id === id)).filter(Boolean);

  const selectedCantrips = draft.spellsKnown.filter((id) => cantripOptions.some((s) => s.id === id));
  const selectedSpells = draft.spellsKnown.filter((id) => spellOptions.some((s) => s.id === id));

  const toggleSpell = (spell, limit, currentCount) => {
    setDraft((d) => {
      const has = d.spellsKnown.includes(spell.id);
      if (has) return { ...d, spellsKnown: d.spellsKnown.filter((id) => id !== spell.id) };
      if (currentCount >= limit) return d;
      return { ...d, spellsKnown: [...d.spellsKnown, spell.id] };
    });
  };

  const byLevel = {};
  const searchTerm = (spellSearch || "").trim().toLowerCase();
  const matchesSearch = (s) => !searchTerm || s.name.toLowerCase().includes(searchTerm);
  spellOptions.filter(matchesSearch).forEach((s) => { (byLevel[s.level] = byLevel[s.level] || []).push(s); });
  const filteredCantripOptions = cantripOptions.filter(matchesSearch);

  return (
    <div style={{ marginBottom: 22 }}>
      {sectionHeader}
      <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textMuted, margin: "0 0 1.25rem" }}>
        {cls.name} lancia gli incantesimi tramite {abilityName} ({fmtMod(abilityMod)}), livello {entry.level}.
      </p>

      {cls.id === "chierico" && (
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: C.textMuted, margin: "0 0 8px" }}>Dominio Divino</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {DIVINE_DOMAINS.map((d) => (
              <Pill key={d.id} active={store.domainId === d.id} onClick={() => updateStore((s) => ({ domainId: s.domainId === d.id ? null : d.id }))}>
                {d.name}
              </Pill>
            ))}
          </div>
          {domain && (
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "8px 0 0", fontStyle: "italic" }}>
              Gli incantesimi di dominio sono sempre preparati gratuitamente e non contano nel numero di {caster.label.toLowerCase()}.
            </p>
          )}
          {(getSubclass("chierico", store.domainId)?.proficiencyChoices || []).map((spec) => (
            <ProficiencyChoicePicker
              key={spec.key}
              spec={spec}
              selected={(store.profChoices && store.profChoices[spec.key]) || []}
              onToggle={(value) => toggleProfChoice(updateStore, spec, value)}
            />
          ))}
        </div>
      )}

      {cls.id === "paladino" && (
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: C.textMuted, margin: "0 0 8px" }}>Ordine Sacro</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {PALADIN_OATHS.map((o) => (
              <Pill key={o.id} active={store.oathId === o.id} onClick={() => updateStore((s) => ({ oathId: s.oathId === o.id ? null : o.id }))}>
                {o.name}
              </Pill>
            ))}
          </div>
          {oath && (
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "8px 0 0", fontStyle: "italic" }}>
              Gli incantesimi dell'ordine sono sempre preparati gratuitamente e non contano nel numero di {caster.label.toLowerCase()}.
            </p>
          )}
        </div>
      )}

      {cls.id === "warlock" && (
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: C.textMuted, margin: "0 0 8px" }}>Patto Ultramondano</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {WARLOCK_PATRONS.map((p) => (
              <Pill key={p.id} active={store.patronId === p.id} onClick={() => updateStore((s) => ({ patronId: s.patronId === p.id ? null : p.id }))}>
                {p.name}
              </Pill>
            ))}
          </div>
          {patron && (
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "8px 0 0", fontStyle: "italic" }}>
              Gli incantesimi del patto non sono gratuiti: si aggiungono semplicemente alla lista da cui puoi scegliere i tuoi {caster.label.toLowerCase()}.
            </p>
          )}
        </div>
      )}

      {cls.id === "druido" && (
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: C.textMuted, margin: "0 0 8px" }}>Sottoclasse — Circolo della Terra o della Luna</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {DRUID_CIRCLES.map((c) => (
              <Pill key={c.id} active={store.circleId === c.id} onClick={() => updateStore((s) => ({ circleId: s.circleId === c.id ? null : c.id }))}>
                {c.name}
              </Pill>
            ))}
          </div>
          {circle && circle.id === "circolo-terra" && (
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "8px 0 0", fontStyle: "italic" }}>
              Gli incantesimi del Circolo della Terra sono sempre preparati gratuitamente e non contano nel numero di {caster.label.toLowerCase()}.
            </p>
          )}
          {circle && circle.id === "circolo-luna" && (
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "8px 0 0", fontStyle: "italic" }}>
              Il Circolo della Luna non concede incantesimi bonus: le sue feature riguardano la Forma Selvaggia in combattimento (vedi il Riepilogo/Scheda di gioco).
            </p>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginBottom: 18 }}>
        <MetricBox label="Livello incantesimi max" value={`${maxLevelReal}°`} />
        {cantripsCount > 0 && <MetricBox label="Trucchetti" value={`${selectedCantrips.length}/${cantripsCount}`} />}
        <MetricBox label={caster.label} value={`${selectedSpells.length}/${spellsLimit}`} />
        {preparedPerDay !== null && <MetricBox label="Preparabili al giorno" value={preparedPerDay} />}
      </div>

      {caster.type === "spellbook" && (
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, marginBottom: 14, fontStyle: "italic" }}>
          Il libro contiene {spellsLimit} incantesimi in tutto, ma ogni giorno se ne possono preparare solo {preparedPerDay} (Intelligenza {fmtMod(abilityMod)} + livello {entry.level}, minimo 1).
        </p>
      )}
      {caster.type === "prepared" && caster.halfCaster && (
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, marginBottom: 14, fontStyle: "italic" }}>
          Come semi-incantatore, prepara Carisma {fmtMod(abilityMod)} + metà livello (arrotondato per difetto), minimo 1.
        </p>
      )}

      {subclassLabel && subclassSpellObjects.length > 0 && (
        <>
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.forestDeep, margin: "0 0 8px" }}>
            Incantesimi del {subclassLabel} — sempre preparati
          </h3>
          {subclassSpellObjects.map((s) => (
            <SpellRow key={s.id} spell={s} selected disabled onToggle={() => { }} />
          ))}
          <Divider />
        </>
      )}

      {thirdCaster && (
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, marginBottom: 14, fontStyle: "italic" }}>
          Come terzo-incantatore, la lista è quella del Mago: {cls.id === "guerriero"
            ? "scegli soprattutto tra Ammaliamento ed Evocazione."
            : "scegli soprattutto tra Ammaliamento e Illusione."} Questa non è imposta come limite rigido dall'app.
        </p>
      )}

      {cls.id === "warlock" && getUnlockedArcanumTiers(entry.level).length > 0 && (
        <>
          <Divider />
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 4px" }}>Arcano Mistico</h3>
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "0 0 10px" }}>
            Un incantesimo fisso per livello, lanciabile una volta per riposo lungo senza consumare uno slot.
          </p>
          {getUnlockedArcanumTiers(entry.level).map((tier) => {
            const options = SPELLS.filter((s) => s.level === tier && s.classes.includes("warlock"));
            return (
              <div key={tier} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: 12.5, color: C.textOnParchment, minWidth: 90 }}>
                  Incantesimo di {tier}° livello
                </span>
                <select
                  value={store.mysticArcanum?.[tier] || ""}
                  onChange={(e) => updateStore((s) => ({ mysticArcanum: { ...s.mysticArcanum, [tier]: e.target.value || null } }))}
                  style={{ fontFamily: "'Spectral', serif", fontSize: 13, padding: "0.35rem 0.5rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff" }}
                >
                  <option value="">Scegli…</option>
                  {options.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {options.length === 0 && (
                  <span style={{ fontFamily: "'Spectral', serif", fontSize: 12, color: C.textMuted, fontStyle: "italic" }}>
                    Nessun incantesimo di {tier}° livello disponibile nel dataset per il Warlock.
                  </span>
                )}
              </div>
            );
          })}
        </>
      )}

      {maxLevelReal > MAX_DATA_SPELL_LEVEL && (
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, marginBottom: 14, fontStyle: "italic" }}>
          A questo livello {cls.name} avrebbe accesso a incantesimi fino al {maxLevelReal}° livello: questa versione dell'app propone incantesimi selezionabili fino al {MAX_DATA_SPELL_LEVEL}°.
        </p>
      )}

      {cls.id === "stregone" && <MetamagicPicker store={store} updateStore={updateStore} level={entry.level} />}

      {cls.id === "warlock" && (
        <>
          <PactBoonPicker store={store} updateStore={updateStore} level={entry.level} />
          <InvocationPicker store={store} updateStore={updateStore} level={entry.level} />
        </>
      )}

      {cls.id === "paladino" && (
        <>
          <Divider />
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 4px" }}>Colpo Divino</h3>
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "0 0 10px" }}>
            Quando colpisci una creatura con un attacco in mischia con arma, puoi spendere uno slot incantesimo per infliggere danno radioso extra al bersaglio. Il danno aumenta di 1d8 se il bersaglio è un non morto o un immondo (massimo 6d8 in quel caso).
          </p>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            {[1, 2, 3, 4, 5].map((lvl) => (
              <MetricBox key={lvl} label={`Slot di ${lvl}° liv.`} value={`${getDivineSmiteDice(lvl)}d8`} />
            ))}
          </div>
        </>
      )}

      <Divider />

      {cantripsCount > 0 && filteredCantripOptions.length > 0 && (
        <>
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 8px" }}>
            Trucchetti — scegline {cantripsCount}
          </h3>
          {filteredCantripOptions.map((s) => (
            <SpellRow
              key={s.id} spell={s} selected={draft.spellsKnown.includes(s.id)}
              disabled={selectedCantrips.length >= cantripsCount}
              onToggle={() => toggleSpell(s, cantripsCount, selectedCantrips.length)}
            />
          ))}
          <Divider />
        </>
      )}

      <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 8px" }}>
        {caster.label} — scegline {spellsLimit} tra i livelli 1–{dataMax}
      </h3>
      {Object.keys(byLevel).length === 0 && searchTerm && (
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textMuted, fontStyle: "italic" }}>
          Nessun incantesimo trovato per "{spellSearch}".
        </p>
      )}
      {Object.keys(byLevel).sort((a, b) => a - b).map((lvl) => (
        <div key={lvl} style={{ marginBottom: 14 }}>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: C.textMuted, margin: "0 0 6px" }}>
            {lvl}° livello
          </p>
          {byLevel[lvl].map((s) => (
            <SpellRow
              key={s.id} spell={s} selected={draft.spellsKnown.includes(s.id)}
              disabled={selectedSpells.length >= spellsLimit}
              onToggle={() => toggleSpell(s, spellsLimit, selectedSpells.length)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}


function getPreparedPerDay(caster, level, abilityMod) {
  const lvl = Math.max(1, Math.min(20, level || 1));
  return Math.max(1, abilityMod + lvl);
}

/* ---------------------------------- STEP: REVIEW ---------------------------------- */

function HpLevelManager({ cls, hpPerLevel, onSetMethod, levels, title = "Gestione PF per livello" }) {
  const avg = getHitDieAverage(cls.hitDie);

  // Funzione per tirare un dado
  const rollHitDie = (sides) => {
    return 1 + Math.floor(Math.random() * sides);
  };

  // Determina lo stato attuale del livello
  const getLevelState = (entry) => {
    if (entry === undefined || entry === "avg") return "avg";
    if (Number.isInteger(entry) && entry > 0) return "rolled";
    return "manual";
  };

  return (
    <div style={{ marginBottom: 18 }}>
      <Divider />
      <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 4px" }}>
        {title}
      </h3>
      <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "0 0 10px" }}>
        Dado vita d{cls.hitDie} (media {avg} + mod. Costituzione per livello). Scegli "Media", "🎲 Tiro" o "Manuale".
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {levels.map((lvl) => {
          const entry = hpPerLevel?.[lvl];
          const state = getLevelState(entry);
          const displayValue = state === "avg" ? avg : (entry || "");

          return (
            <div key={lvl} style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              border: `1px solid ${C.parchmentLine}`,
              borderRadius: 2,
              padding: "0.3rem 0.5rem",
              flexWrap: "wrap",
              background: state !== "avg" ? "rgba(125, 31, 56, 0.04)" : "transparent",
            }}>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: 11.5, color: C.textOnParchment, minWidth: 42 }}>
                Liv. {lvl}
              </span>

              {/* Pulsante Media */}
              <Pill
                active={state === "avg"}
                onClick={() => onSetMethod(lvl, "avg")}
              >
                Media ({avg})
              </Pill>

              {/* Pulsante Tiro */}
              <Pill
                active={state === "rolled"}
                onClick={() => {
                  const roll = rollHitDie(cls.hitDie);
                  onSetMethod(lvl, roll);
                }}
              >
                🎲 Tiro
              </Pill>

              {/* Pulsante Manuale */}
              <Pill
                active={state === "manual"}
                onClick={() => onSetMethod(lvl, state === "manual" ? entry : avg)}
              >
                Manuale
              </Pill>

              {/* Input per il valore manuale o visualizzazione del valore tirato */}
              {state !== "avg" && (
                <input
                  type="number"
                  min={1}
                  max={cls.hitDie}
                  value={displayValue}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (!isNaN(val) && val >= 1 && val <= cls.hitDie) {
                      onSetMethod(lvl, val);
                    }
                  }}
                  style={{
                    width: 44,
                    fontFamily: "'Spectral', serif",
                    fontSize: 12.5,
                    padding: "0.25rem",
                    borderRadius: 2,
                    border: `1px solid ${state === "rolled" ? C.gold : C.parchmentLine}`,
                    background: state === "rolled" ? "rgba(201, 162, 39, 0.08)" : "#fff",
                    color: state === "rolled" ? C.gold : C.textOnParchment,
                  }}
                />
              )}

              {state === "rolled" && (
                <span style={{
                  fontFamily: "'Spectral', serif",
                  fontSize: 11,
                  color: C.gold,
                  marginLeft: 2
                }}>
                  🎲
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HpTracker({ maxHp, draft, setDraft }) {
  const [amount, setAmount] = useState(1);
  const current = draft.currentHp == null ? maxHp : Math.min(draft.currentHp, maxHp);
  const temp = draft.tempHp || 0;

  const applyDamage = () => {
    let dmg = Math.max(0, amount);
    let newTemp = temp;
    if (newTemp > 0) {
      const absorbed = Math.min(newTemp, dmg);
      newTemp -= absorbed;
      dmg -= absorbed;
    }
    const newCurrent = Math.max(0, current - dmg);
    setDraft((d) => ({ ...d, currentHp: newCurrent, tempHp: newTemp }));
  };
  const applyHeal = () => {
    const newCurrent = Math.min(maxHp, current + Math.max(0, amount));
    setDraft((d) => ({ ...d, currentHp: newCurrent }));
  };
  const addTempHp = () => {
    setDraft((d) => ({ ...d, tempHp: Math.max(d.tempHp || 0, Math.max(0, amount)) }));
  };

  return (
    <div style={{ border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0.85rem 1rem", marginBottom: 18 }}>
      <div style={{ marginBottom: 10 }}>
        <span style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: current <= maxHp / 3 ? C.danger : C.textOnParchment }}>
          {current} / {maxHp} PF{temp > 0 ? <span style={{ color: C.forestDeep, fontSize: 14 }}> (+{temp} temp)</span> : null}
        </span>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="number" min={0} value={amount}
          onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
          style={{ width: 60, fontFamily: "'Spectral', serif", fontSize: 13.5, padding: "0.4rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff" }}
        />
        <GhostButton onClick={applyDamage} style={{ borderColor: C.danger, color: C.danger, padding: "0.4rem 0.8rem", fontSize: 12.5 }}>
          Danno
        </GhostButton>
        <GoldButton onClick={applyHeal} style={{ padding: "0.4rem 0.8rem", fontSize: 12.5 }}>
          Cura
        </GoldButton>
        <GhostButton onClick={addTempHp} style={{ borderColor: C.forest, color: C.forestDeep, padding: "0.4rem 0.8rem", fontSize: 12.5 }}>
          + PF Temporanei
        </GhostButton>
      </div>
    </div>
  );
}

// Riserva di Dadi Vita del personaggio: un pool per ciascuna taglia di dado presente tra le
// classi (primaria + eventuale secondaria da multiclasse). Due classi con lo stesso dado
// vita condividono lo stesso pool, come da regole.
function getHitDicePools(draft) {
  const pools = {};
  getClassEntries(draft).forEach((e) => {
    const cls = CLASSES.find((c) => c.id === e.classId);
    if (!cls) return;
    pools[cls.hitDie] = (pools[cls.hitDie] || 0) + (e.level || 1);
  });
  return Object.entries(pools)
    .map(([die, max]) => ({ die: Number(die), max }))
    .sort((a, b) => b.die - a.die);
}

function rollDie(sides) {
  return 1 + Math.floor(Math.random() * sides);
}

// Pannello dei riposi: spesa dei Dadi Vita (riposo breve) e i due pulsanti "Riposo Breve" /
// "Riposo Lungo" che applicano gli effetti CORRETTI e completi previsti dalla 5e 2014.
function RestControls({ draft, setDraft, maxHp, conMod }) {
  const [lastRoll, setLastRoll] = useState(null);
  const [showShortRestModal, setShowShortRestModal] = useState(false);
  const [hdToSpend, setHdToSpend] = useState(0);

  const pools = getHitDicePools(draft);
  const totalHD = pools.reduce((sum, p) => sum + p.max, 0);
  const spentTotal = Object.values(draft.hitDiceSpent || {}).reduce((a, b) => a + b, 0);
  const availableTotal = totalHD - spentTotal;
  const current = draft.currentHp == null ? maxHp : Math.min(draft.currentHp, maxHp);

  // Funzione per tirare un dado
  const rollDie = (sides) => {
    return 1 + Math.floor(Math.random() * sides);
  };

  // Funzione unica per spendere un dado vita
  const spendHitDie = (die) => {
    const spent = (draft.hitDiceSpent && draft.hitDiceSpent[die]) || 0;
    const pool = pools.find((p) => p.die === die);
    if (!pool || spent >= pool.max || current >= maxHp) return;
    const roll = rollDie(die);
    const healed = Math.max(0, roll + conMod);
    setLastRoll({ die, roll, conMod, healed });
    setDraft((d) => {
      const newCurrent = Math.min(maxHp, (d.currentHp == null ? maxHp : d.currentHp) + healed);
      return {
        ...d,
        currentHp: newCurrent,
        hitDiceSpent: { ...d.hitDiceSpent, [die]: ((d.hitDiceSpent && d.hitDiceSpent[die]) || 0) + 1 },
      };
    });
  };

  // Spende tutti i Dadi Vita disponibili
  const spendAllHitDice = () => {
    let healed = 0;
    const newSpent = { ...draft.hitDiceSpent };
    let currentHp = draft.currentHp == null ? maxHp : Math.min(draft.currentHp, maxHp);

    pools.forEach((p) => {
      const spent = newSpent[p.die] || 0;
      const available = p.max - spent;
      for (let i = 0; i < available; i++) {
        if (currentHp >= maxHp) break;
        const roll = rollDie(p.die);
        const healAmount = Math.max(0, roll + conMod);
        healed += healAmount;
        currentHp = Math.min(maxHp, currentHp + healAmount);
        newSpent[p.die] = (newSpent[p.die] || 0) + 1;
      }
    });

    if (healed > 0) {
      setLastRoll({ die: 0, roll: 0, conMod, healed, all: true });
      setDraft((d) => ({
        ...d,
        currentHp: Math.min(maxHp, (d.currentHp || 0) + healed),
        hitDiceSpent: newSpent,
      }));
    }
  };

  // Spende un numero specifico di Dadi Vita (usato nel modal)
  const spendMultipleHitDice = (count) => {
    let remaining = count;
    let healed = 0;
    const newSpent = { ...draft.hitDiceSpent };
    let currentHpNow = draft.currentHp == null ? maxHp : Math.min(draft.currentHp, maxHp);

    pools.forEach((p) => {
      if (remaining <= 0) return;
      const spent = newSpent[p.die] || 0;
      const available = p.max - spent;
      const toUse = Math.min(available, remaining);
      for (let i = 0; i < toUse; i++) {
        if (currentHpNow >= maxHp) break;
        const roll = rollDie(p.die);
        const healAmount = Math.max(0, roll + conMod);
        healed += healAmount;
        currentHpNow = Math.min(maxHp, currentHpNow + healAmount);
        newSpent[p.die] = (newSpent[p.die] || 0) + 1;
        remaining--;
      }
    });

    if (healed > 0) {
      setDraft((d) => ({
        ...d,
        currentHp: Math.min(maxHp, (d.currentHp || 0) + healed),
        hitDiceSpent: newSpent,
      }));
      setLastRoll({ die: 0, roll: 0, conMod, healed, all: true });
    }
  };

  // Riposo Breve (1 ora): recupera risorse "short" e slot del Warlock
  const performShortRest = () => {
    setDraft((d) => {
      // 1. Recupera risorse della classe primaria
      const primaryCls = CLASSES.find((c) => c.id === d.classId);
      const nextResourcesUsed = { ...d.resourcesUsed };
      if (primaryCls) {
        getAllClassResources(primaryCls.id, getChosenSubclassId(d, primaryCls.id), d.level, d.mysticArcanum)
          .filter((r) => r.resetOn === "short")
          .forEach((r) => { delete nextResourcesUsed[r.key]; });
      }

      // 2. Recupera risorse della classe secondaria (multiclasse)
      let nextMulticlass = d.multiclass;
      if (d.multiclass && d.multiclass.classId) {
        const mcCls = CLASSES.find((c) => c.id === d.multiclass.classId);
        const mcResourcesUsed = { ...d.multiclass.resourcesUsed };
        if (mcCls) {
          getAllClassResources(mcCls.id, getChosenSubclassId(d.multiclass, mcCls.id), d.multiclass.level, d.multiclass.mysticArcanum)
            .filter((r) => r.resetOn === "short")
            .forEach((r) => { delete mcResourcesUsed[r.key]; });
        }
        nextMulticlass = { ...d.multiclass, resourcesUsed: mcResourcesUsed };
      }

      // 3. Recupera gli slot del Patto Magico (Warlock)
      const nextSlotsUsed = { ...d.slotsUsed };
      Object.keys(nextSlotsUsed).forEach((k) => { if (k.startsWith("pact-")) delete nextSlotsUsed[k]; });

      return {
        ...d,
        resourcesUsed: nextResourcesUsed,
        multiclass: nextMulticlass,
        slotsUsed: nextSlotsUsed
      };
    });

    // 4. Mostra il modal per i Dadi Vita
    setLastRoll(null);
    if (availableTotal > 0 && current < maxHp) {
      setShowShortRestModal(true);
      setHdToSpend(Math.min(availableTotal, 1)); // Default a 1
    }
  };

  // Riposo Lungo (8 ore)
  const performLongRest = () => {
    setDraft((d) => {
      const next = { ...d, currentHp: maxHp, tempHp: 0, resourcesUsed: {}, slotsUsed: {}, sorceryPointsUsed: 0 };
      if (next.multiclass && next.multiclass.classId) {
        next.multiclass = { ...next.multiclass, resourcesUsed: {} };
      }

      // Recupera metà dei Dadi Vita spesi (arrotondato per difetto, minimo 1)
      const currentPools = getHitDicePools(d);
      const totalDice = currentPools.reduce((sum, p) => sum + p.max, 0);
      let toRecover = Math.max(1, Math.floor(totalDice / 2));
      const nextSpent = { ...(d.hitDiceSpent || {}) };

      currentPools.forEach((p) => {
        if (toRecover <= 0) return;
        const spent = nextSpent[p.die] || 0;
        const recoverHere = Math.min(spent, toRecover);
        nextSpent[p.die] = spent - recoverHere;
        toRecover -= recoverHere;
      });

      next.hitDiceSpent = nextSpent;
      return next;
    });
    setLastRoll(null);
    setShowShortRestModal(false);
  };

  return (
    <div style={{ border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0.85rem 1rem", marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
        <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: 0 }}>Riposi</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <GhostButton
            onClick={performShortRest}
            style={{ borderColor: C.forest, color: C.forestDeep, padding: "0.4rem 0.9rem", fontSize: 12.5 }}
          >
            Riposo Breve (1 ora)
          </GhostButton>
          <GoldButton onClick={performLongRest} style={{ padding: "0.4rem 0.9rem", fontSize: 12.5 }}>
            Riposo Lungo (8 ore)
          </GoldButton>
        </div>
      </div>

      <p style={{ fontFamily: "'Spectral', serif", fontSize: 11.5, color: C.textMuted, margin: "0 0 10px", fontStyle: "italic" }}>
        Breve: recupera risorse "riposo breve" e slot del Patto Magico. Lungo: PF pieni, tutte le risorse, metà Dadi Vita spesi (min. 1).
      </p>

      {totalHD > 0 && (
        <div style={{ marginTop: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: C.textMuted, margin: 0 }}>
              Dadi Vita (mod. Costituzione {fmtMod(conMod)})
            </p>
            {availableTotal > 0 && current < maxHp && (
              <GhostButton
                onClick={spendAllHitDice}
                style={{ borderColor: C.wine, color: C.wineDeep, padding: "0.25rem 0.6rem", fontSize: 11 }}
              >
                Spendi tutti ({availableTotal})
              </GhostButton>
            )}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {pools.map((p) => {
              const spent = (draft.hitDiceSpent && draft.hitDiceSpent[p.die]) || 0;
              const available = p.max - spent;
              return (
                <div key={p.die} style={{ display: "flex", alignItems: "center", gap: 8, border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0.35rem 0.6rem" }}>
                  <span style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textOnParchment }}>
                    d{p.die}: {available}/{p.max}
                  </span>
                  <GhostButton
                    onClick={() => spendHitDie(p.die)}
                    disabled={available <= 0 || current >= maxHp}
                    style={{ borderColor: C.wine, color: C.wineDeep, padding: "0.25rem 0.6rem", fontSize: 11.5 }}
                  >
                    Spendi 1
                  </GhostButton>
                </div>
              );
            })}
          </div>
          {lastRoll && (
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 12, color: C.forestDeep, margin: "8px 0 0" }}>
              {lastRoll.all
                ? `Spesi ${lastRoll.healed > 0 ? 'tutti i Dadi Vita disponibili' : 'nessun Dado Vita'} → recuperati ${lastRoll.healed} PF.`
                : `Tiro: 1d${lastRoll.die} = ${lastRoll.roll} ${fmtMod(lastRoll.conMod)} → recuperati ${lastRoll.healed} PF.`
              }
            </p>
          )}
        </div>
      )}

      {/* Modal per la spesa dei Dadi Vita durante il riposo breve */}
      {showShortRestModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: C.parchment,
            padding: "2rem",
            borderRadius: 4,
            maxWidth: 420,
            width: "90%",
            border: `1px solid ${C.gold}`,
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          }}>
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 18, color: C.wineDeep, margin: "0 0 10px" }}>
              Riposo Breve
            </h3>
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textOnParchment, margin: "0 0 16px" }}>
              Hai completato un riposo breve. Vuoi spendere dei Dadi Vita per recuperare PF?
            </p>

            <div style={{ marginBottom: 16 }}>
              <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textMuted, margin: "0 0 8px" }}>
                Dadi Vita disponibili: <b>{availableTotal}</b>
              </p>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  type="number"
                  min={0}
                  max={availableTotal}
                  value={hdToSpend}
                  onChange={(e) => setHdToSpend(Math.min(availableTotal, Math.max(0, Number(e.target.value) || 0)))}
                  style={{
                    width: 80,
                    fontFamily: "'Spectral', serif",
                    fontSize: 16,
                    padding: "0.5rem",
                    borderRadius: 2,
                    border: `1px solid ${C.parchmentLine}`,
                    background: "#fff",
                  }}
                />
                <span style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textMuted }}>
                  Dadi Vita da spendere
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <GhostButton
                onClick={() => { setShowShortRestModal(false); setHdToSpend(0); }}
                style={{ borderColor: C.parchmentLine, color: C.textMuted }}
              >
                Salta
              </GhostButton>
              {availableTotal > 0 && (
                <GhostButton
                  onClick={() => { spendAllHitDice(); setShowShortRestModal(false); setHdToSpend(0); }}
                  style={{ borderColor: C.forest, color: C.forestDeep }}
                >
                  Spendi tutti
                </GhostButton>
              )}
              <GoldButton
                onClick={() => {
                  spendMultipleHitDice(hdToSpend);
                  setShowShortRestModal(false);
                  setHdToSpend(0);
                }}
                disabled={hdToSpend <= 0}
              >
                Spendi {hdToSpend} HD
              </GoldButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Selettore delle Discipline Elementali (Monaco — Via dei Quattro Elementi). Segue lo stesso
// pattern di Metamagia/Invocazioni Occulte: un numero di discipline "conosciute" cresce col
// livello e il giocatore le sceglie da un elenco filtrato per prerequisito di livello.
function ElementalDisciplinePicker({ store, updateStore, level, title = "Discipline Elementali" }) {
  const known = getDisciplinesKnownCount(level);
  if (known <= 0) return null;
  const chosen = store.disciplineIds || [];
  const toggle = (id) => updateStore((s) => {
    const list = s.disciplineIds || [];
    if (list.includes(id)) return { disciplineIds: list.filter((x) => x !== id) };
    if (list.length >= known) return {};
    return { disciplineIds: [...list, id] };
  });
  const automatic = ELEMENTAL_DISCIPLINES.filter((d) => d.automatic);
  const available = ELEMENTAL_DISCIPLINES.filter((d) => !d.automatic && d.minLevel <= (level || 1));
  return (
    <div style={{ marginBottom: 18 }}>
      <Divider />
      <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 4px" }}>
        {title} — scegline {known} ({chosen.length}/{known})
      </h3>
      <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "0 0 10px" }}>
        Conosci sempre {automatic.map((d) => d.name).join(", ")} (gratuita, non conta nel totale). Le altre discipline costano Punti Ki ogni volta che le usi.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
        {available.map((d) => {
          const active = chosen.includes(d.id);
          return (
            <div
              key={d.id}
              onClick={() => toggle(d.id)}
              style={{
                cursor: "pointer", border: `1px solid ${active ? C.wine : C.parchmentLine}`,
                background: active ? "rgba(122,32,40,0.06)" : "transparent",
                borderRadius: 2, padding: "0.5rem 0.7rem",
                opacity: !active && chosen.length >= known ? 0.5 : 1,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: 12.5, color: C.textOnParchment }}>{d.name}</span>
                <span style={{ fontFamily: "'Spectral', serif", fontSize: 11, color: C.wineDeep, whiteSpace: "nowrap" }}>{d.kiCost} Ki</span>
              </div>
              <p style={{ fontFamily: "'Spectral', serif", fontSize: 12, color: C.textMuted, margin: "4px 0 0" }}>{d.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CharacterSheetView({ draft, setDraft, showPlayTools = false }) {
  const race = RACES.find((r) => r.id === draft.raceId);
  const cls = CLASSES.find((c) => c.id === draft.classId);
  const bg = getSelectedBackground(draft);
  const chosenSubclassId = cls ? getChosenSubclassId(draft, cls.id) : null;

  const mc = draft.multiclass && draft.multiclass.classId ? draft.multiclass : null;
  const mcCls = mc ? CLASSES.find((c) => c.id === mc.classId) : null;
  const mcChosenSubclassId = mcCls ? getChosenSubclassId(mc, mcCls.id) : null;
  const mcSubclass = mcCls ? getSubclass(mcCls.id, mcChosenSubclassId) : null;
  const mcSubclassFeatures = mcCls ? getUnlockedSubclassFeatures(mcCls.id, mcChosenSubclassId, mc.level) : [];
  const mcUpdateStore = (fn) => setDraft((d) => ({ ...d, multiclass: { ...d.multiclass, ...fn(d.multiclass) } }));

  // Stregone, Magia Selvaggia: tira lo Sconvolgimento (2 tiri da scegliere dal 14° livello, Caos Controllato).
  const wildMagicLevel = (cls?.id === "stregone" && chosenSubclassId === "magia-selvaggia") ? draft.level
    : (mcCls?.id === "stregone" && mcChosenSubclassId === "magia-selvaggia") ? mc.level
    : 0;
  const [wildSurgeRolls, setWildSurgeRolls] = useState(null);
  const rollWildSurge = () => {
    const times = wildMagicLevel >= 14 ? 2 : 1;
    setWildSurgeRolls(Array.from({ length: times }, () => rollWildMagicSurge()));
  };

  const totalLevel = getTotalCharacterLevel(draft);
  const raceBonus = useMemo(() => getRaceBonus(race, draft.raceAbilityPicks || draft.halfElfPicks), [race, draft.raceAbilityPicks, draft.halfElfPicks]);
  const asiBonus = useMemo(() => getAsiBonus(draft), [draft.asiChoices, draft.levelChoiceType, draft.featChoices, draft.featAbilityChoices, draft.classId, draft.level, draft.multiclass, draft.raceFeatId, draft.raceFeatAbilityChoice]);
  const finalScores = useMemo(() => computeFinalScores(draft), [draft]);

  const hp = cls ? computeMaxHp(draft, cls, race, mod(finalScores.con)) : null;
  const equippedArmor = draft.inventory.find((it) => it.category === "armatura" && it.equipped);
  const equippedShield = draft.inventory.find((it) => it.category === "scudo" && it.equipped);
  const dexMod = mod(finalScores.dex);
  const hasDraconicResilience = (cls && hasDraconicResilienceAc(cls.id, chosenSubclassId)) || (mcCls && hasDraconicResilienceAc(mcCls.id, mcChosenSubclassId));

  // Calcolo CA con bonus da Stile "Difesa"
  const fightingStyleAcBonus =
    getFightingStyleAcBonus(draft, cls?.id, !!equippedArmor) +
    (mcCls ? getFightingStyleAcBonus(mc, mcCls.id, !!equippedArmor) : 0);

  let ac = 10 + dexMod + fightingStyleAcBonus;
  if (equippedArmor) {
    const base = parseInt(String(equippedArmor.ac), 10) || 10;
    if (equippedArmor.tipo === "pesante") ac = base + fightingStyleAcBonus;
    else if (equippedArmor.tipo === "media") ac = base + Math.min(2, dexMod) + fightingStyleAcBonus;
    else ac = base + dexMod + fightingStyleAcBonus;
  } else if (hasDraconicResilience) {
    ac = 13 + dexMod + fightingStyleAcBonus;
  }
  const shieldBonus = equippedShield ? (parseInt(String(equippedShield.ac).replace("+", ""), 10) || 2) : 0;
  ac += shieldBonus;
  const acSourceLabel = equippedArmor
    ? `${equippedArmor.name}${equippedShield ? " + Scudo" : ""}${fightingStyleAcBonus > 0 ? " + Difesa" : ""}`
    : hasDraconicResilience
      ? `Resilienza Draconica (13 + Destrezza)${equippedShield ? " + Scudo" : ""}${fightingStyleAcBonus > 0 ? " + Difesa" : ""}`
      : equippedShield ? "Solo scudo (senza armatura)" : "Senza armatura (10 + Destrezza)";
  const granted = getGrantedProficiencies(draft);
  const allSkills = [...new Set([...(bg ? bg.skills : []), ...draft.classSkills, ...(draft.raceSkillPicks || []), ...(mc?.bonusSkillPick ? [mc.bonusSkillPick] : []), ...granted.skills])];
  const slots = getEffectiveSpellSlots(draft);
  const prof = getProficiencyBonus(totalLevel);
  const initiative = mod(finalScores.dex);

  const savingThrows = ABILITIES.map((a) => {
    const proficient = !!((cls && cls.saves.some((s) => abilityKeyByName(s) === a.key)) || (mcCls && mcCls.saves.some((s) => abilityKeyByName(s) === a.key)));
    return { ...a, proficient, bonus: mod(finalScores[a.key]) + (proficient ? prof : 0) };
  });

  const expertiseCount = getClassEntries(draft).reduce((sum, e) => sum + getExpertiseCount(e.classId, e.level), 0);
  const expertiseSkills = draft.expertiseSkillIds || [];
  const toggleExpertise = (skillName) => setDraft((d) => {
    const list = d.expertiseSkillIds || [];
    const has = list.includes(skillName);
    if (has) return { ...d, expertiseSkillIds: list.filter((s) => s !== skillName) };
    if (list.length >= expertiseCount) return d;
    return { ...d, expertiseSkillIds: [...list, skillName] };
  });

  const skillsList = Object.entries(SKILL_ABILITY).map(([name, key]) => {
    const proficient = allSkills.includes(name);
    const expert = proficient && expertiseSkills.includes(name);
    return { name, key, proficient, expert, bonus: mod(finalScores[key]) + (proficient ? prof : 0) + (expert ? prof : 0) };
  }).sort((a, b) => a.name.localeCompare(b.name));

  const passivePerception = 10 + (skillsList.find((s) => s.name === "Percezione")?.bonus || 0);

  const weaponAttacks = draft.inventory.filter((it) => it.category === "arma").map((it) => {
    const finesse = (it.properties || []).some((p) => p.includes("Finezza"));
    const ranged = (it.properties || []).some((p) => p.includes("Munizioni"));
    const abilityKey = finesse ? (mod(finalScores.dex) >= mod(finalScores.str) ? "dex" : "str") : ranged ? "dex" : "str";
    const abilityMod = mod(finalScores[abilityKey]);

    // Bonus da Stili di Combattimento (classe primaria + multiclass)
    const styleStores = [draft, ...(draft.multiclass ? [draft.multiclass] : [])];
    const attackStyleBonus = styleStores.reduce((sum, store) => {
      // Determina a quale classe appartiene questo store
      const storeClsId = store === draft ? draft.classId : (store.classId || null);
      return sum + getFightingStyleAttackBonus(store, storeClsId, ranged);
    }, 0);
    const isOneHanded = it.hands === "una mano";
    const isTwoHanded = it.hands === "due mani";
    const isVersatile = (it.properties || []).some((p) => p.includes("Versatile"));
    const isMelee = !ranged;

    const damageStyleBonus = styleStores.reduce(
      (sum, store) => {
        const storeClsId = store === draft ? draft.classId : (store.classId || null);
        return sum + getFightingStyleDamageBonus(store, storeClsId, !ranged, isOneHanded);
      },
      0
    );
    // Check per Armi Pesanti (Great Weapon Fighting)
    const canUseGreatWeapon = isMelee && (isTwoHanded || isVersatile);
    const hasGreatWeapon = styleStores.some((store) => getFightingStyleGreatWeapon(store));
    const greatWeaponActive = hasGreatWeapon && canUseGreatWeapon;

    // Check per Due Armi (Two-Weapon Fighting)
    const hasTwoWeapon = styleStores.some((store) => getFightingStyleTwoWeapon(store));
    // Per l'attacco secondario, assumiamo che se c'è più di un'arma e la proprietà Leggera è presente
    // NOTA: questa è una semplificazione, l'implementazione completa richiederebbe più stato
    const isLight = (it.properties || []).some((p) => p.includes("Leggera"));
    const isOffhand = draft.inventory.filter((i) => i.category === "arma").indexOf(it) > 0;
    const twoWeaponBonus = hasTwoWeapon && isOffhand && isLight ? abilityMod : 0;

    const attackBonus = prof + abilityMod + attackStyleBonus;
    const damageBonus = abilityMod + damageStyleBonus + twoWeaponBonus;

    // Flag per Protezione (reazione)
    const hasProtection = styleStores.some((store) => getFightingStyleProtection(store));

    return {
      ...it,
      abilityKey,
      attackBonus,
      damageMod: damageBonus,
      isMelee,
      isTwoHanded,
      isVersatile,
      greatWeaponActive, // Flag per mostrare che lo stile è attivo
      hasProtection,     // Flag per mostrare che la reazione è disponibile
      hasTwoWeaponFighting: hasTwoWeapon && isOffhand && isLight,
      damageString: `${it.damage}${greatWeaponActive ? ' (ritira 1 e 2)' : ''}`
    };
  });

  const hasProtectionFlag = weaponAttacks.some(w => w.hasProtection);
  const hasTwoWeaponFightingFlag = weaponAttacks.some(w => w.hasTwoWeaponFighting);

  const subclass = cls ? getSubclass(cls.id, chosenSubclassId) : null;
  const subclassFeatures = cls ? getUnlockedSubclassFeatures(cls.id, chosenSubclassId, draft.level) : [];
  const chosenFeats = getChosenFeats(draft);

  // Risorse di classe (primaria + eventuale secondaria)
  const classResourceGroups = [];
  if (cls) {
    const resources = getAllClassResources(cls.id, chosenSubclassId, draft.level, draft.mysticArcanum, mod(finalScores.cha));
    if (resources.length) classResourceGroups.push({ className: cls.name, resources, used: draft.resourcesUsed, onSetUsed: (key, n) => setDraft((d) => ({ ...d, resourcesUsed: { ...d.resourcesUsed, [key]: n } })) });
  }
  if (mcCls) {
    const resources = getAllClassResources(mcCls.id, mcChosenSubclassId, mc.level, mc.mysticArcanum, mod(finalScores.cha));
    if (resources.length) classResourceGroups.push({ className: mcCls.name, resources, used: mc.resourcesUsed, onSetUsed: (key, n) => mcUpdateStore((s) => ({ resourcesUsed: { ...s.resourcesUsed, [key]: n } })) });
  }
  const totalSorcererLevels = getClassEntries(draft)
    .filter(e => e.classId === "stregone")
    .reduce((sum, e) => sum + (e.level || 0), 0);

  if (totalSorcererLevels > 0) {
    classResourceGroups.push({
      className: "Stregone (totale)",
      resources: [{
        key: "sorcery-points",
        name: "Punti Stregoneria",
        max: totalSorcererLevels,
        resetOn: "long",
        pool: true,
      }],
      used: { "sorcery-points": draft.sorceryPointsUsed || 0 },
      onSetUsed: (key, n) => setDraft(d => ({ ...d, sorceryPointsUsed: n })),
    });
  }
  // Meccaniche di classe
  const mechanicsGroups = [];
  if (cls) {
    const list = getClassMechanicsList(cls.id, draft.level, chosenSubclassId);
    if (list.length) mechanicsGroups.push({ className: cls.name, list });
  }
  if (mcCls) {
    const list = getClassMechanicsList(mcCls.id, mc.level, mcChosenSubclassId);
    if (list.length) mechanicsGroups.push({ className: mcCls.name, list });
  }



  // Feature di sottoclasse
  const subclassFeatureGroups = [];
  if (subclass && subclassFeatures.length) subclassFeatureGroups.push({ className: cls.name, subclassName: subclass.name, features: subclassFeatures });
  if (mcSubclass && mcSubclassFeatures.length) subclassFeatureGroups.push({ className: mcCls.name, subclassName: mcSubclass.name, features: mcSubclassFeatures });

  // Classi incantatrici
  const casterEntries = getClassEntries(draft).filter((e) => getEffectiveCasterInfo(e.classId, e.subclassId));
  const casterMetrics = casterEntries.map((e) => {
    const casterInfo = getEffectiveCasterInfo(e.classId, e.subclassId);
    const clsName = CLASSES.find((c) => c.id === e.classId)?.name || e.classId;
    return {
      classId: e.classId, className: clsName,
      dc: 8 + prof + mod(finalScores[casterInfo.ability]),
      attack: prof + mod(finalScores[casterInfo.ability]),
    };
  });
  const allSpellIds = [...new Set([
    ...draft.spellsKnown,
    ...(cls && cls.id === "chierico" ? getDomainSpellIds(draft.domainId, getMaxSpellLevel(cls.id, draft.level, chosenSubclassId)) : []),
    ...(cls && cls.id === "paladino" ? getOathSpellIds(draft.oathId, getMaxSpellLevel(cls.id, draft.level, chosenSubclassId)) : []),
    ...(cls && cls.id === "druido" ? getCircleSpellIds(draft.circleId, getMaxSpellLevel(cls.id, draft.level, chosenSubclassId)) : []),
    ...(mcCls && mcCls.id === "chierico" ? getDomainSpellIds(mc.domainId, getMaxSpellLevel(mcCls.id, mc.level, mcChosenSubclassId)) : []),
    ...(mcCls && mcCls.id === "paladino" ? getOathSpellIds(mc.oathId, getMaxSpellLevel(mcCls.id, mc.level, mcChosenSubclassId)) : []),
    ...(mcCls && mcCls.id === "druido" ? getCircleSpellIds(mc.circleId, getMaxSpellLevel(mcCls.id, mc.level, mcChosenSubclassId)) : []),
  ])];

  const classLabel = cls
    ? mcCls
      ? `${cls.name} ${draft.level}${subclass ? ` (${subclass.name})` : ""} / ${mcCls.name} ${mc.level}${mcSubclass ? ` (${mcSubclass.name})` : ""}`
      : `${cls.name} (liv. ${draft.level})${subclass ? ` — ${subclass.name}` : ""}`
    : "—";

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "var(--g3)", gap: 10, marginBottom: 18 }}>
        <MetricBox label="Razza" value={race ? race.name : "—"} />
        <MetricBox label="Classe" value={classLabel} hint={mcCls ? `Livello personaggio totale: ${totalLevel}` : undefined} />
        <MetricBox label="Background" value={bg ? bg.name : "—"} />
        <MetricBox label="Punti ferita" value={hp ?? "—"} />
        <MetricBox label="Classe Armatura (CA)" value={ac} hint={acSourceLabel} />
        <MetricBox label="Velocità" value={race ? `${ftToM(race.speed)} m` : "—"} />
        <MetricBox label="Bonus di competenza" value={fmtMod(prof)} />
        <MetricBox label="Iniziativa" value={fmtMod(initiative)} />
        <MetricBox label="Percezione passiva" value={passivePerception} />
      </div>

      {bg && (bg.featureDesc || draft.personalityTrait1 || draft.personalityTrait2 || draft.ideal || draft.bond || draft.flaw) && (
        <div style={{ border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0.7rem 0.9rem", marginBottom: 18 }}>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: C.wineDeep, margin: "0 0 4px" }}>
            Background — {bg.name}
          </p>
          {bg.featureDesc && (
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "0 0 8px" }}>
              <b>{bg.feature}:</b> {bg.featureDesc}
            </p>
          )}
          {(draft.personalityTrait1 || draft.personalityTrait2 || draft.ideal || draft.bond || draft.flaw) && (
            <div style={{ display: "grid", gridTemplateColumns: "var(--g2)", gap: "4px 18px", fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textOnParchment }}>
              {draft.personalityTrait1 && <p style={{ margin: 0 }}><b>Tratto:</b> {draft.personalityTrait1}</p>}
              {draft.personalityTrait2 && <p style={{ margin: 0 }}><b>Tratto:</b> {draft.personalityTrait2}</p>}
              {draft.ideal && <p style={{ margin: 0 }}><b>Ideale:</b> {draft.ideal}</p>}
              {draft.bond && <p style={{ margin: 0 }}><b>Legame:</b> {draft.bond}</p>}
              {draft.flaw && <p style={{ margin: 0 }}><b>Difetto:</b> {draft.flaw}</p>}
            </div>
          )}
        </div>
      )}

      {mcCls && (
        <div style={{ border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0.7rem 0.9rem", marginBottom: 18 }}>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: C.wineDeep, margin: "0 0 4px" }}>
            Multiclasse — competenze parziali da {mcCls.name}
          </p>
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: 0 }}>
            {MULTICLASS_PROFICIENCIES[mcCls.id]}
          </p>
          {MULTICLASS_BONUS_SKILL_CLASS.includes(mcCls.id) && (
            <div style={{ marginTop: 8 }}>
              <select
                value={mc.bonusSkillPick || ""}
                onChange={(e) => mcUpdateStore(() => ({ bonusSkillPick: e.target.value || null }))}
                style={{ fontFamily: "'Spectral', serif", fontSize: 13, padding: "0.35rem 0.5rem", borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff" }}
              >
                <option value="">Scegli la competenza bonus da {mcCls.name}…</option>
                {mcCls.skillOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
        </div>
      )}

      {showPlayTools && hp != null && (
        <>
          <HpTracker maxHp={hp} draft={draft} setDraft={setDraft} />
          <RestControls draft={draft} setDraft={setDraft} maxHp={hp} conMod={mod(finalScores.con)} />
        </>
      )}

      <Divider />

      <div style={{ display: "grid", gridTemplateColumns: "var(--g6)", gap: 8, marginBottom: 18 }}>
        {ABILITIES.map((a) => (
          <div key={a.key} style={{ textAlign: "center", border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0.6rem 0.3rem" }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 10.5, color: C.textMuted }}>{a.name.slice(0, 3).toUpperCase()}</div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: C.textOnParchment }}>{finalScores[a.key]}</div>
            <div style={{ fontFamily: "'Spectral', serif", fontSize: 12, color: C.wine }}>{fmtMod(mod(finalScores[a.key]))}</div>
            {(raceBonus[a.key] > 0 || asiBonus[a.key] > 0) && (
              <div style={{ fontFamily: "'Spectral', serif", fontSize: 10, color: C.textMuted, marginTop: 2 }}>
                {raceBonus[a.key] > 0 ? `razza +${raceBonus[a.key]}` : ""}
                {raceBonus[a.key] > 0 && asiBonus[a.key] > 0 ? " · " : ""}
                {asiBonus[a.key] > 0 ? `ASI +${asiBonus[a.key]}` : ""}
              </div>
            )}
          </div>
        ))}
      </div>

      {cls && (
        <AsiPicker
          store={draft}
          updateStore={(fn) => setDraft((d) => ({ ...d, ...fn(d) }))}
          clsId={cls.id}
          classLevel={draft.level}
        />
      )}

      {mcCls && (
        <AsiPicker
          store={mc}
          updateStore={mcUpdateStore}
          clsId={mcCls.id}
          classLevel={mc.level}
        />
      )}

      {/* In gioco (showPlayTools) assegnare i PF del nuovo livello è compito del popup di
          level-up: qui, sulla scheda già salvata, la tabella storica di tutti i livelli è solo
          ingombro. Resta visibile durante la creazione/modifica, dove serve per impostare i PF
          di un personaggio creato direttamente a un livello superiore al 1°. */}
      {!showPlayTools && cls && draft.level >= 2 && (
        <HpLevelManager
          cls={cls}
          hpPerLevel={draft.hpPerLevel}
          onSetMethod={(lvl, val) => setDraft((d) => ({ ...d, hpPerLevel: { ...d.hpPerLevel, [lvl]: val } }))}
          levels={Array.from({ length: draft.level - 1 }, (_, i) => i + 2)}
          title={mcCls ? `Gestione PF per livello — ${cls.name} (primaria)` : "Gestione PF per livello"}
        />
      )}

      {!showPlayTools && mcCls && (
        <HpLevelManager
          cls={mcCls}
          hpPerLevel={mc.hpPerLevel}
          onSetMethod={(lvl, val) => mcUpdateStore((s) => ({ hpPerLevel: { ...s.hpPerLevel, [lvl]: val } }))}
          levels={Array.from({ length: mc.level }, (_, i) => i + 1)}
          title={`Gestione PF per livello — ${mcCls.name} (secondaria)`}
        />
      )}

      {cls && cls.id === "monaco" && chosenSubclassId === "quattro-elementi" && (
        <ElementalDisciplinePicker
          store={draft}
          updateStore={(fn) => setDraft((d) => ({ ...d, ...fn(d) }))}
          level={draft.level}
          title={mcCls ? `Discipline Elementali — ${cls.name} (primaria)` : "Discipline Elementali"}
        />
      )}

      {mcCls && mcCls.id === "monaco" && mcChosenSubclassId === "quattro-elementi" && (
        <ElementalDisciplinePicker
          store={mc}
          updateStore={mcUpdateStore}
          level={mc.level}
          title={`Discipline Elementali — ${mcCls.name} (secondaria)`}
        />
      )}

      {/* MECCANICHE DI CLASSE - CON STILI DI COMBATTIMENTO */}
      {(mechanicsGroups.length > 0 ||
        (cls && hasFightingStyles(cls.id) && getSelectedFightingStyles(draft).length > 0) ||
        (mcCls && hasFightingStyles(mcCls.id) && getSelectedFightingStyles(mc).length > 0)) && (
          <>
            <Divider />
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 8px" }}>Meccaniche di classe</h3>

            {/* Stili di Combattimento - Classe Primaria */}
            {cls && hasFightingStyles(cls.id) && getSelectedFightingStyles(draft).length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <p style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: C.textMuted, margin: "0 0 6px" }}>
                  Stili di Combattimento — {cls.name}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "var(--g3)", gap: 10 }}>
                  {getSelectedFightingStyles(draft).map((styleId) => {
                    const style = getAvailableFightingStyles(cls.id).find((s) => s.id === styleId);
                    if (!style) return null;
                    return (
                      <MetricBox
                        key={style.id}
                        label={style.name}
                        value={style.desc}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stili di Combattimento - Classe Secondaria */}
            {mcCls && hasFightingStyles(mcCls.id) && getSelectedFightingStyles(mc).length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <p style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: C.textMuted, margin: "0 0 6px" }}>
                  Stili di Combattimento — {mcCls.name}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "var(--g3)", gap: 10 }}>
                  {getSelectedFightingStyles(mc).map((styleId) => {
                    const style = getAvailableFightingStyles(mcCls.id).find((s) => s.id === styleId);
                    if (!style) return null;
                    return (
                      <MetricBox
                        key={style.id}
                        label={style.name}
                        value={style.desc}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Meccaniche di classe esistenti */}
            {mechanicsGroups.map((g) => (
              <div key={g.className} style={{ marginBottom: 14 }}>
                {mechanicsGroups.length > 1 && (
                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: C.textMuted, margin: "0 0 6px" }}>{g.className}</p>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "var(--g3)", gap: 10 }}>
                  {g.list.map((m) => <MetricBox key={m.key} label={m.label} value={m.value} />)}
                </div>
              </div>
            ))}
          </>
        )}

      {classResourceGroups.length > 0 && (
        <>
          <Divider />
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 8px" }}>Risorse di classe</h3>
          {classResourceGroups.map((g) => (
            <div key={g.className} style={{ marginBottom: 14 }}>
              {classResourceGroups.length > 1 && (
                <p style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: C.textMuted, margin: "0 0 6px" }}>{g.className}</p>
              )}
              {showPlayTools ? (
                <div style={{ marginBottom: 4 }}>
                  {g.resources.map((r) => (
                    <ResourceTracker key={r.key} resource={r} used={g.used?.[r.key]} onSetUsed={g.onSetUsed} />
                  ))}
                </div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {g.resources.map((r) => (
                    <MetricBox
                      key={r.key} label={r.name}
                      value={r.max == null ? "Illimitati" : r.pool ? `${r.max} punti` : r.max}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
          {/* ✅ INSERISCI QUI I NUOVI BLOCCHI */}
          {hasProtectionFlag && (
            <div style={{ marginBottom: 14, border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0.7rem 0.9rem" }}>
              <h4 style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: C.wineDeep, margin: "0 0 6px" }}>
                🛡️ Protezione - Reazione Disponibile
              </h4>
              <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: 0 }}>
                Quando una creatura entro 1,5 m attacca un bersaglio diverso da te,
                puoi usare la tua reazione per imporre svantaggio al tiro per colpire.
              </p>
            </div>
          )}

          {hasTwoWeaponFightingFlag && (
            <div style={{ marginBottom: 14, border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0.7rem 0.9rem" }}>
              <h4 style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: C.wineDeep, margin: "0 0 6px" }}>
                ⚔️ Combattimento con Due Armi - Attivo
              </h4>
              <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: 0 }}>
                Aggiungi il modificatore di caratteristica al danno dell'attacco secondario.
              </p>
            </div>
          )}
        </>
      )}

      {showPlayTools && wildMagicLevel > 0 && (
        <div style={{ marginBottom: 18, border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0.7rem 0.9rem" }}>
          <h4 style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: C.wineDeep, margin: "0 0 6px" }}>
            🎲 Sconvolgimento di Magia Selvaggia
          </h4>
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "0 0 8px" }}>
            Il Master può far scatenare questo effetto quando lanci un incantesimo da Stregone di 1° livello o superiore.
            {wildMagicLevel >= 14 ? " Grazie a Caos Controllato tiri due volte e scegli l'effetto." : ""}
          </p>
          <GhostButton onClick={rollWildSurge}>Tira sulla tabella (d100)</GhostButton>
          {wildSurgeRolls && (
            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              {wildSurgeRolls.map((r, i) => (
                <div key={i} style={{ border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0.5rem 0.7rem" }}>
                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: C.wine, margin: "0 0 4px" }}>Risultato: {r.roll}</p>
                  <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textOnParchment, margin: 0 }}>{r.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {(() => {
        const baseGroups = [];
        if (cls) {
          const feats = getBaseClassFeatures(cls.id, draft.level);
          if (feats.length) baseGroups.push({ className: cls.name, features: feats });
        }
        if (mcCls) {
          const feats = getBaseClassFeatures(mcCls.id, mc.level);
          if (feats.length) baseGroups.push({ className: mcCls.name, features: feats });
        }
        if (!baseGroups.length) return null;
        return (
          <>
            <Divider />
            {baseGroups.map((g) => (
              <div key={g.className} style={{ marginBottom: 18 }}>
                <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 8px" }}>
                  Caratteristiche di Classe — {g.className}
                </h3>
                {g.features.map((f) => (
                  <div key={f.name} style={{ marginBottom: 10 }}>
                    <p style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: C.textOnParchment, margin: "0 0 2px" }}>
                      {f.name} <span style={{ color: C.textMuted, fontWeight: 400 }}>(liv. {f.level})</span>
                    </p>
                    <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: 0 }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            ))}
          </>
        );
      })()}
      {subclassFeatureGroups.length > 0 && (
        <>
          <Divider />
          {subclassFeatureGroups.map((g) => (
            <div key={g.className} style={{ marginBottom: 18 }}>
              <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 8px" }}>
                Feature di sottoclasse — {g.className}: {g.subclassName}
              </h3>
              {g.features.map((f) => (
                <div key={f.name} style={{ marginBottom: 10 }}>
                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: C.textOnParchment, margin: "0 0 2px" }}>
                    {f.name} <span style={{ color: C.textMuted, fontWeight: 400 }}>(liv. {f.level})</span>
                  </p>
                  <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: 0 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          ))}
        </>
      )}

      {chosenFeats.length > 0 && (
        <>
          <Divider />
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 8px" }}>
            Talenti
          </h3>
          <div style={{ marginBottom: 18 }}>
            {chosenFeats.map(({ level, feat, abilityPick, classId }) => (
              <div key={`${classId}-${level}`} style={{ marginBottom: 10 }}>
                <p style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: C.textOnParchment, margin: "0 0 2px" }}>
                  {feat.name} <span style={{ color: C.textMuted, fontWeight: 400 }}>({classId === "razza" ? "dalla razza" : `liv. ${level}${mcCls ? ` — ${CLASSES.find((c) => c.id === classId)?.name}` : ""}`})</span>
                  {abilityPick && (
                    <span style={{ color: C.forestDeep, fontWeight: 400 }}> — +1 {ABILITIES.find((a) => a.key === abilityPick)?.name}</span>
                  )}
                </p>
                <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: 0 }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <Divider />

      <div style={{ display: "grid", gridTemplateColumns: "var(--g2)", gap: "1.5rem", marginBottom: 18 }}>
        <div>
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 8px" }}>Tiri salvezza</h3>
          {savingThrows.map((s) => (
            <div key={s.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0", borderBottom: `1px solid ${C.parchmentLine}` }}>
              <span style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textOnParchment, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.proficient ? C.wine : "transparent", border: `1px solid ${s.proficient ? C.wine : C.parchmentLine}`, display: "inline-block" }} />
                {s.name}
              </span>
              <span style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.wine }}>{fmtMod(s.bonus)}</span>
            </div>
          ))}
        </div>
        <div>
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 4px" }}>Abilità</h3>
          {expertiseCount > 0 && (
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 11.5, color: C.textMuted, margin: "0 0 6px", fontStyle: "italic" }}>
              Competenza Esperta: {expertiseSkills.length}/{expertiseCount} — clicca la ★ su un'abilità in cui sei già competente
            </p>
          )}
          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            {skillsList.map((s) => (
              <div key={s.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0", borderBottom: `1px solid ${C.parchmentLine}` }}>
                <span style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textOnParchment, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.proficient ? C.wine : "transparent", border: `1px solid ${s.proficient ? C.wine : C.parchmentLine}`, display: "inline-block", flexShrink: 0 }} />
                  {s.name}
                  {expertiseCount > 0 && s.proficient && (
                    <span
                      onClick={() => toggleExpertise(s.name)}
                      title="Competenza Esperta"
                      style={{ cursor: "pointer", color: s.expert ? C.gold : C.parchmentLine, fontSize: 13, lineHeight: 1 }}
                    >
                      ★
                    </span>
                  )}
                </span>
                <span style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.wine }}>{fmtMod(s.bonus)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {weaponAttacks.length > 0 && (
        <>
          <Divider />
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 8px" }}>Attacchi</h3>
          <div style={{ marginBottom: 18 }}>
            {weaponAttacks.map((w) => {
              // I bonus degli Stili di Combattimento sono già inclusi in weaponAttacks.
              const attackBonus = w.attackBonus;
              const damageBonus = w.damageMod;

              return (
                <div key={w.uid} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0.7rem", border: `1px solid ${C.parchmentLine}`, borderRadius: 2, marginBottom: 6 }}>
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: C.textOnParchment }}>{w.name}</span>
                  <span style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted }}>
                    Attacco {fmtMod(attackBonus)} · Danno {w.damage}{fmtMod(damageBonus)} {w.damageType}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      <p style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textOnParchment, marginBottom: 18 }}>
        <b>Competenze nelle abilità:</b> {allSkills.length ? allSkills.join(", ") : "—"}
      </p>

      {cls && (
        <>
          <Divider />
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 8px" }}>Competenze</h3>
          <div style={{ display: "grid", gap: 4, marginBottom: 18 }}>
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textOnParchment, margin: 0 }}>
              <b>Armature:</b> {[cls.armor, ...granted.armor].filter(Boolean).join("; ")}
            </p>
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textOnParchment, margin: 0 }}>
              <b>Armi:</b> {[cls.weapons, ...granted.weapons].filter(Boolean).join("; ")}
            </p>
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textOnParchment, margin: 0 }}>
              <b>Strumenti:</b> {granted.tools.length ? granted.tools.join(", ") : "—"}
            </p>
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textOnParchment, margin: 0 }}>
              <b>Lingue:</b> {granted.languages.length ? granted.languages.join(", ") : "—"}
            </p>
            {granted.other.length > 0 && (
              <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textOnParchment, margin: 0 }}>
                <b>Altro:</b> {granted.other.join(", ")}
              </p>
            )}
          </div>
        </>
      )}

      <Divider />
      <InventoryManager draft={draft} setDraft={setDraft} allowAdd={showPlayTools} />

      {cls && casterEntries.length > 0 && (allSpellIds.length > 0 || slots.length > 0) && (
        <>
          <Divider />
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginBottom: 12 }}>
            {casterMetrics.map((cm) => (
              <React.Fragment key={cm.classId}>
                <MetricBox label={casterMetrics.length > 1 ? `CD incantesimi — ${cm.className}` : "CD tiro salvezza incantesimi"} value={cm.dc} />
                <MetricBox label={casterMetrics.length > 1 ? `Attacco incantesimi — ${cm.className}` : "Bonus di attacco con incantesimi"} value={fmtMod(cm.attack)} />
              </React.Fragment>
            ))}
          </div>
          <SpellManager draft={draft} setDraft={setDraft} showPlayTools={showPlayTools} />
        </>
      )}
    </div>
  );
}

function StepReview({ draft, setDraft, onSave, saving }) {
  const validationErrors = validateCharacter(draft);
  const missing = validationErrors.map((e) => e.replace(/\.$/, ""));

  return (
    <div>
      <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: C.textOnParchment, margin: "0 0 4px" }}>Riepilogo del personaggio</h2>
      <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.textMuted, margin: "0 0 1.25rem" }}>
        Dai un nome al personaggio e salvalo per ritrovarlo in seguito.
      </p>

      <label style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: C.textMuted, display: "block", marginBottom: 6 }}>
        Nome del personaggio
      </label>
      <input
        type="text" value={draft.name} placeholder="Es. Aldric Falco d'Argento"
        onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
        style={{
          width: "100%", fontFamily: "'Cinzel', serif", fontSize: 17, padding: "0.7rem 0.9rem",
          borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fffdf9", marginBottom: 18,
          boxShadow: "inset 0 0 0 1px rgba(125,31,56,0.06)",
        }}
      />

      <CharacterSheetView draft={draft} setDraft={setDraft} />

      {validationErrors.length > 0 && (
        <div style={{ border: `1px solid ${C.danger}`, background: "#f8e9e5", padding: "0.75rem 0.9rem", marginBottom: 14, borderRadius: 2 }}>
          <b style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: C.danger }}>Controlli 5e 2014</b>
          <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.danger }}>{validationErrors.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      )}

      <GoldButton icon={saving ? Loader2 : Save} disabled={missing.length > 0 || saving} onClick={onSave}>
        {saving ? "Salvataggio…" : "Salva personaggio"}
      </GoldButton>
    </div>
  );
}

/* ---------------------------------- FIGHTING STYLE SELECTOR ---------------------------------- */

function FightingStyleSelector({ store, updateStore, clsId, classLevel, label = "Stile di Combattimento" }) {
  const availableStyles = getAvailableFightingStyles(clsId);
  const maxStyles = getFightingStyleCount(clsId, classLevel, store?.subclassId);
  const selectedStyles = getSelectedFightingStyles(store);

  if (maxStyles === 0 || availableStyles.length === 0) return null;

  const toggleStyle = (styleId) => {
    updateStore((s) => {
      const current = s.fightingStyles || [];
      const isSelected = current.includes(styleId);
      if (isSelected) {
        return { fightingStyles: current.filter((id) => id !== styleId) };
      }
      if (current.length >= maxStyles) {
        // Sostituisci l'ultimo selezionato (o il primo) - per semplicità, non facciamo nulla
        return s;
      }
      return { fightingStyles: [...current, styleId] };
    });
  };

  return (
    <div style={{ marginTop: 12, marginBottom: 12 }}>
      <p style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: C.wineDeep, margin: "0 0 8px" }}>
        {label} ({selectedStyles.length}/{maxStyles} scelti)
      </p>
      <p style={{ fontFamily: "'Spectral', serif", fontSize: 12, color: C.textMuted, margin: "0 0 8px" }}>
        Scegli fino a {maxStyles} stile{maxStyles > 1 ? "i" : ""} di combattimento.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "var(--g2)", gap: "0.5rem" }}>
        {availableStyles.map((style) => {
          const isSelected = selectedStyles.includes(style.id);
          const isFull = selectedStyles.length >= maxStyles && !isSelected;
          return (
            <OptionCard
              key={style.id}
              selected={isSelected}
              onClick={() => {
                if (!isFull || isSelected) toggleStyle(style.id);
              }}
              title={style.name}
              subtitle={isSelected ? "✓ Selezionato" : isFull ? "Limite raggiunto" : "Disponibile"}
            >
              <p style={{ fontFamily: "'Spectral', serif", fontSize: 12, color: C.textMuted, margin: 0 }}>
                {style.desc}
              </p>
            </OptionCard>
          );
        })}
      </div>
    </div>
  );
}

function MetricBox({ label, value, hint }) {
  return (
    <div style={{ border: `1px solid ${C.parchmentLine}`, borderRadius: 2, padding: "0.7rem 0.85rem" }}>
      <div style={{ fontFamily: "'Cinzel', serif", fontSize: 10.5, color: C.textMuted, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "'Spectral', serif", fontSize: 15, color: C.textOnParchment }}>{value}</div>
      {hint && <div style={{ fontFamily: "'Spectral', serif", fontSize: 11, color: C.textMuted, marginTop: 2 }}>{hint}</div>}
    </div>
  );
}

/* ---------------------------------- LEVEL UP MODAL ---------------------------------- */
// Riunisce in un unico popup, nell'ordine in cui vanno effettivamente decise, SOLO le scelte
// sbloccate dal nuovo livello (sottoclasse, PF, ASI/Talento, stile di combattimento extra,
// discipline/metamagia/invocazioni/dono del patto se il loro numero è appena aumentato).
// Le variazioni puramente informative (nuove feature testuali, slot, risorse, critico) restano
// in un riepilogo di sola lettura in fondo.
function LevelUpModal({
  clsId, className, fromLevel, toLevel, store, updateStore,
  subclassOptions, chosenSubclassId, onChooseSubclass, changes, onCancel, onConfirm,
}) {
  const cls = CLASSES.find((c) => c.id === clsId);
  // Chierico/Paladino/Warlock/Druido scelgono dominio/giuramento/patrono/circolo altrove
  // (non usano il campo "subclassId" generico): qui li escludiamo per non offrire un
  // selettore che scriverebbe nel campo sbagliato.
  const subclassJustUnlocked = clsId in SUBCLASS_CHOICE_LEVEL && subclassOptions.length > 0 && toLevel === SUBCLASS_CHOICE_LEVEL[clsId] && !chosenSubclassId;
  const styleCountBefore = getFightingStyleCount(clsId, fromLevel, store.subclassId);
  const styleCountAfter = getFightingStyleCount(clsId, toLevel, store.subclassId);
  const showFightingStyle = styleCountAfter > styleCountBefore;
  const showDisciplines = clsId === "monaco" && chosenSubclassId === "quattro-elementi" && getDisciplinesKnownCount(toLevel) > getDisciplinesKnownCount(fromLevel);
  const showMetamagic = clsId === "stregone" && getMetamagicKnownCount(toLevel) > getMetamagicKnownCount(fromLevel);
  const showPactBoon = clsId === "warlock" && toLevel === 3;
  const showInvocations = clsId === "warlock" && getInvocationsKnownCount(toLevel) > getInvocationsKnownCount(fromLevel);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "var(--modal-outer-padding)" }}>
      <div style={{ background: C.parchment, padding: "var(--frame-padding)", borderRadius: 4, maxWidth: "var(--modal-max-width)", width: "100%", maxHeight: "88vh", overflowY: "auto", border: `1px solid ${C.gold}`, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 22, color: C.wineDeep, margin: 0 }}>
            Livello {toLevel}! <span style={{ color: C.textMuted, fontWeight: 400, fontSize: 15 }}>— {className}</span>
          </h2>
          <button onClick={onCancel} aria-label="Annulla il livellamento" title="Annulla il livellamento" style={{ background: "transparent", border: "none", cursor: "pointer", color: C.textMuted, padding: 4 }}>
            <X size={20} />
          </button>
        </div>
        <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textMuted, margin: "0 0 6px" }}>
          Completa qui le scelte sbloccate da questo livello. La ✕ in alto annulla il livellamento (torni al livello {fromLevel} senza modifiche); "Fatto" conferma — potrai comunque rivedere le scelte più in basso nella scheda.
        </p>

        {subclassJustUnlocked && (
          <div style={{ marginTop: 14 }}>
            <Divider />
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 8px" }}>Sottoclasse — {cls?.name}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "var(--g2)", gap: "0.5rem 1rem" }}>
              {subclassOptions.map((s) => (
                <OptionCard key={s.id} selected={chosenSubclassId === s.id} onClick={() => onChooseSubclass(s.id)} title={s.name}>
                  <p style={{ fontFamily: "'Spectral', serif", fontStyle: "italic", fontSize: 12.5, color: C.textMuted, margin: 0 }}>{s.blurb}</p>
                </OptionCard>
              ))}
            </div>
          </div>
        )}

        <HpLevelManager
          cls={cls}
          hpPerLevel={store.hpPerLevel}
          onSetMethod={(lvl, val) => updateStore((s) => ({ hpPerLevel: { ...s.hpPerLevel, [lvl]: val } }))}
          levels={[toLevel]}
          title={`Punti Ferita — Livello ${toLevel}`}
        />

        <AsiPicker store={store} updateStore={updateStore} clsId={clsId} classLevel={toLevel} onlyLevels={[toLevel]} />

        {showFightingStyle && (
          <div style={{ marginTop: 14 }}>
            <Divider />
            <FightingStyleSelector store={store} updateStore={updateStore} clsId={clsId} classLevel={toLevel} label={`Stile di Combattimento — ${cls?.name}`} />
          </div>
        )}

        {showDisciplines && <ElementalDisciplinePicker store={store} updateStore={updateStore} level={toLevel} />}
        {showMetamagic && <MetamagicPicker store={store} updateStore={updateStore} level={toLevel} />}
        {showPactBoon && <PactBoonPicker store={store} updateStore={updateStore} level={toLevel} />}
        {showInvocations && <InvocationPicker store={store} updateStore={updateStore} level={toLevel} />}

        {(changes.newFeatures.length > 0 || (changes.slotsChanged && changes.newSlots.length > 0) || changes.resourceChanges.length > 0 || changes.critChanged) && (
          <div style={{ marginTop: 14 }}>
            <Divider />
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 8px" }}>Altre novità di questo livello</h3>
            <ul style={{ margin: 0, paddingLeft: 18, fontFamily: "'Spectral', serif", fontSize: 13, color: C.textOnParchment }}>
              {changes.newFeatures.map((f) => (
                <li key={f.name} style={{ marginBottom: 4 }}><b>{f.name}</b> — {f.desc}</li>
              ))}
              {changes.slotsChanged && changes.newSlots.length > 0 && (
                <li style={{ marginBottom: 4 }}>Slot incantesimo aggiornati: {changes.newSlots.map((s) => `liv. ${s.level} × ${s.total}`).join(", ")}. Per aggiungere nuovi incantesimi conosciuti usa "Modifica".</li>
              )}
              {changes.resourceChanges.map((rc) => <li key={rc} style={{ marginBottom: 4 }}>{rc}</li>)}
              {changes.critChanged && (
                <li>Raggio di critico: {changes.oldCrit} → {changes.newCrit}.</li>
              )}
            </ul>
          </div>
        )}

        <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end" }}>
          <GoldButton onClick={onConfirm}>Fatto</GoldButton>
        </div>
      </div>
    </div>
  );
}

function PlayerSheet({ character, onBack, onSaveChanges }) {
  const [draft, setDraft] = useState(character);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [levelUpInfo, setLevelUpInfo] = useState(null);
  // Stato del draft (e del flag "modifiche non salvate") subito prima di far scattare il
  // livellamento: se l'utente annulla dal popup (✕), lo ripristiniamo com'era, come se il
  // livellamento non fosse mai avvenuto. Ogni aggiornamento del draft nel resto dell'app usa
  // sempre spread immutabili, quindi tenere un semplice riferimento all'oggetto precedente basta.
  const [levelUpSnapshot, setLevelUpSnapshot] = useState(null);
  const [addingMulticlass, setAddingMulticlass] = useState(false);
  const [confirmRemoveMc, setConfirmRemoveMc] = useState(false);

  const race = RACES.find((r) => r.id === draft.raceId);
  const cls = CLASSES.find((c) => c.id === draft.classId);
  const subclass = cls ? getSubclass(cls.id, getChosenSubclassId(draft, cls.id)) : null;
  const subclassOptions = cls ? getSubclassOptions(cls.id) : [];
  const subclassUnlocked = cls && subclassOptions.length > 0 && draft.level >= (SUBCLASS_CHOICE_LEVEL[cls.id] || 3);

  const mc = draft.multiclass && draft.multiclass.classId ? draft.multiclass : null;
  const mcCls = mc ? CLASSES.find((c) => c.id === mc.classId) : null;
  const mcSubclassOptions = mcCls ? getSubclassOptions(mcCls.id) : [];
  const mcSubclassUnlocked = mcCls && mcSubclassOptions.length > 0 && mc.level >= (SUBCLASS_CHOICE_LEVEL[mcCls.id] || 3);
  const totalLevel = getTotalCharacterLevel(draft);
  const finalScoresNow = computeFinalScores(draft);

  const updateDraft = (updater) => {
    setDirty(true);
    setDraft(updater);
  };
  const mcUpdateStore = (fn) => updateDraft((d) => ({ ...d, multiclass: { ...d.multiclass, ...fn(d.multiclass) } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveChanges(draft);
      setDirty(false);
    } finally {
      setSaving(false);
    }
  };

  const handleLevelUp = () => {
    if (!cls || totalLevel >= 20) return;
    const fromLevel = draft.level;
    const toLevel = fromLevel + 1;
    const changes = getLevelUpChanges(cls.id, getChosenSubclassId(draft, cls.id), fromLevel, toLevel);
    setLevelUpSnapshot({ draft, dirty });
    updateDraft((d) => ({ ...d, level: toLevel }));
    setLevelUpInfo({ target: "primary", changes });
  };

  const handleMulticlassLevelUp = () => {
    if (!mcCls || totalLevel >= 20) return;
    const fromLevel = mc.level;
    const toLevel = fromLevel + 1;
    const changes = getLevelUpChanges(mcCls.id, getChosenSubclassId(mc, mcCls.id), fromLevel, toLevel);
    setLevelUpSnapshot({ draft, dirty });
    updateDraft((d) => ({ ...d, multiclass: { ...d.multiclass, level: toLevel } }));
    setLevelUpInfo({ target: "secondary", changes });
  };

  // ✕ nel popup: annulla il livellamento e ogni scelta fatta al suo interno, come se non
  // avessimo mai cliccato "Sali di livello".
  const cancelLevelUp = () => {
    if (levelUpSnapshot) {
      setDraft(levelUpSnapshot.draft);
      setDirty(levelUpSnapshot.dirty);
    }
    setLevelUpSnapshot(null);
    setLevelUpInfo(null);
  };

  // "Fatto" nel popup: tiene le scelte fatte e chiude, senza toccare lo stato.
  const confirmLevelUp = () => {
    setLevelUpSnapshot(null);
    setLevelUpInfo(null);
  };

  const handleConfirmMulticlass = (classId) => {
    updateDraft((d) => ({ ...d, multiclass: emptyMulticlass(classId) }));
    setAddingMulticlass(false);
  };

  const handleRemoveMulticlass = () => {
    updateDraft((d) => ({ ...d, multiclass: null }));
    setConfirmRemoveMc(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", gap: 12, flexWrap: "wrap" }}>
        <div>
          <GhostButton icon={ChevronLeft} onClick={onBack} style={{ marginBottom: 10 }}>
            I miei personaggi
          </GhostButton>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: 24, color: C.cream, margin: 0 }}>{draft.name || "Personaggio senza nome"}</h1>
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.creamMuted, margin: "4px 0 0" }}>
            {race ? race.name : "—"} · {cls ? `${cls.name} ${draft.level}` : "—"}{subclass ? ` (${subclass.name})` : ""}{mcCls ? ` / ${mcCls.name} ${mc.level}` : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {cls && draft.level < 20 && totalLevel < 20 && (
            <GhostButton icon={ChevronRight} onClick={handleLevelUp} style={{ borderColor: C.gold, color: C.gold, flexDirection: "row-reverse" }}>
              Sali di livello{mcCls ? ` — ${cls.name}` : ""}
            </GhostButton>
          )}
          {mcCls && mc.level < 20 && totalLevel < 20 && (
            <GhostButton icon={ChevronRight} onClick={handleMulticlassLevelUp} style={{ borderColor: C.gold, color: C.gold, flexDirection: "row-reverse" }}>
              Sali di livello — {mcCls.name}
            </GhostButton>
          )}
          <GoldButton icon={saving ? Loader2 : Save} disabled={saving || !dirty} onClick={handleSave}>
            {saving ? "Salvataggio…" : dirty ? "Salva modifiche" : "Nessuna modifica da salvare"}
          </GoldButton>
        </div>
      </div>

      {levelUpInfo && levelUpInfo.target === "primary" && cls && (
        <LevelUpModal
          clsId={cls.id}
          className={cls.name}
          fromLevel={levelUpInfo.changes.fromLevel}
          toLevel={levelUpInfo.changes.toLevel}
          store={draft}
          updateStore={(fn) => updateDraft((d) => ({ ...d, ...fn(d) }))}
          subclassOptions={subclassOptions}
          chosenSubclassId={getChosenSubclassId(draft, cls.id)}
          onChooseSubclass={(id) => updateDraft((d) => ({ ...d, subclassId: id }))}
          changes={levelUpInfo.changes}
          onCancel={cancelLevelUp}
          onConfirm={confirmLevelUp}
        />
      )}
      {levelUpInfo && levelUpInfo.target === "secondary" && mcCls && (
        <LevelUpModal
          clsId={mcCls.id}
          className={mcCls.name}
          fromLevel={levelUpInfo.changes.fromLevel}
          toLevel={levelUpInfo.changes.toLevel}
          store={mc}
          updateStore={mcUpdateStore}
          subclassOptions={mcSubclassOptions}
          chosenSubclassId={getChosenSubclassId(mc, mcCls.id)}
          onChooseSubclass={(id) => mcUpdateStore(() => ({ subclassId: id }))}
          changes={levelUpInfo.changes}
          onCancel={cancelLevelUp}
          onConfirm={confirmLevelUp}
        />
      )}

      {/* Sottoclasse - Classe Primaria */}
      {cls && !["chierico", "paladino", "warlock", "druido"].includes(cls.id) && subclassOptions.length > 0 && (
        <Frame style={{ padding: "0.9rem 1rem", marginBottom: 18 }}>
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 6px" }}>
            Sottoclasse — {cls.name}
          </h3>
          {!subclassUnlocked ? (
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textMuted, margin: 0 }}>
              Disponibile dal livello {SUBCLASS_CHOICE_LEVEL[cls.id] || 3}.
            </p>
          ) : (
            <>
              <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "0 0 10px" }}>
                Scegli la sottoclasse del tuo personaggio per questo livello.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "var(--g2)", gap: "0.5rem 1rem" }}>
                {subclassOptions.map((s) => (
                  <OptionCard
                    key={s.id}
                    selected={getChosenSubclassId(draft, cls.id) === s.id}
                    onClick={() => setDraft((d) => ({ ...d, subclassId: d.subclassId === s.id ? null : s.id }))}
                    title={s.name}
                  >
                    <p style={{ fontFamily: "'Spectral', serif", fontStyle: "italic", fontSize: 12.5, color: C.textMuted, margin: 0 }}>{s.blurb}</p>
                  </OptionCard>
                ))}
              </div>
            </>
          )}
        </Frame>
      )}

      {/* Stili di Combattimento - Classe Primaria */}
      {cls && hasFightingStyles(cls.id) && (
        <Frame style={{ padding: "0.9rem 1rem", marginBottom: 18 }}>
          <FightingStyleSelector
            store={draft}
            updateStore={(fn) => setDraft((d) => ({ ...d, ...fn(d) }))}
            clsId={cls.id}
            classLevel={draft.level}
            label={`Stile di Combattimento — ${cls.name}`}
          />
        </Frame>
      )}

      {/* Sezione Multiclasse */}
      <Frame style={{ padding: "0.9rem 1rem", marginBottom: 18 }}>
        <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 6px" }}>
          Multiclasse
        </h3>

        {!mcCls ? (
          addingMulticlass ? (
            <>
              <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: "0 0 10px" }}>
                Scegli la classe secondaria. I requisiti minimi (5e 2014) sono indicati per riferimento: l'app non blocca la scelta, la decisione finale spetta al tavolo di gioco.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "var(--g2)", gap: "0.5rem 1rem", marginBottom: 10 }}>
                {CLASSES.filter((c) => c.id !== draft.classId).map((c) => {
                  const prereq = checkMulticlassPrereq(finalScoresNow, c.id);
                  return (
                    <OptionCard
                      key={c.id}
                      selected={false}
                      onClick={() => handleConfirmMulticlass(c.id)}
                      title={c.name}
                    >
                      <p style={{ fontFamily: "'Spectral', serif", fontStyle: "italic", fontSize: 12, color: prereq.met ? C.forestDeep : C.wine, margin: 0 }}>
                        Requisito: {prereq.text} {prereq.met ? "✓ soddisfatto" : "✗ non soddisfatto"}
                      </p>
                    </OptionCard>
                  );
                })}
              </div>
              <GhostButton onClick={() => setAddingMulticlass(false)} style={{ borderColor: C.parchmentLine, color: C.textMuted }}>
                Annulla
              </GhostButton>
            </>
          ) : (
            <>
              <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textMuted, margin: "0 0 10px" }}>
                Il personaggio ha una sola classe. Puoi aggiungerne una seconda per multiclassare.
              </p>
              <GoldButton icon={Plus} onClick={() => setAddingMulticlass(true)} style={{ padding: "0.55rem 1rem", fontSize: 13 }}>
                Aggiungi classe secondaria
              </GoldButton>
            </>
          )
        ) : (
          <>
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textOnParchment, margin: "0 0 10px" }}>
              Classe secondaria: <b>{mcCls.name}</b>, livello {mc.level}. Il livello totale del personaggio è {totalLevel}.
            </p>
            {confirmRemoveMc ? (
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.danger }}>
                  Rimuovere la classe secondaria e tutti i progressi ad essa legati (ASI, talenti, risorse, PF)?
                </span>
                <button
                  onClick={handleRemoveMulticlass}
                  style={{ background: C.danger, color: "#fff", border: "none", cursor: "pointer", borderRadius: 3, padding: "4px 8px", fontFamily: "'Spectral', serif", fontSize: 11.5 }}
                >
                  Sì, rimuovi
                </button>
                <button
                  onClick={() => setConfirmRemoveMc(false)}
                  style={{ background: "transparent", border: `1px solid ${C.parchmentLine}`, cursor: "pointer", borderRadius: 3, padding: "4px 8px", fontFamily: "'Spectral', serif", fontSize: 11.5, color: C.textMuted }}
                >
                  Annulla
                </button>
              </div>
            ) : (
              <GhostButton onClick={() => setConfirmRemoveMc(true)} style={{ borderColor: C.danger, color: C.danger, marginBottom: 10 }}>
                Rimuovi classe secondaria
              </GhostButton>
            )}

            {/* Sottoclasse - Classe Secondaria */}
            {!["chierico", "paladino", "warlock", "druido"].includes(mcCls.id) && mcSubclassOptions.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <h4 style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: C.wineDeep, margin: "0 0 6px" }}>
                  Sottoclasse — {mcCls.name}
                </h4>
                {!mcSubclassUnlocked ? (
                  <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: C.textMuted, margin: 0 }}>
                    Disponibile dal livello {SUBCLASS_CHOICE_LEVEL[mcCls.id] || 3}.
                  </p>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "var(--g2)", gap: "0.5rem 1rem" }}>
                    {mcSubclassOptions.map((s) => (
                      <OptionCard
                        key={s.id}
                        selected={getChosenSubclassId(mc, mcCls.id) === s.id}
                        onClick={() => mcUpdateStore((st) => ({ subclassId: st.subclassId === s.id ? null : s.id }))}
                        title={s.name}
                      >
                        <p style={{ fontFamily: "'Spectral', serif", fontStyle: "italic", fontSize: 12.5, color: C.textMuted, margin: 0 }}>{s.blurb}</p>
                      </OptionCard>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Stili di Combattimento - Classe Secondaria */}
            {mcCls && hasFightingStyles(mcCls.id) && (
              <div style={{ marginTop: 12 }}>
                <Divider />
                <FightingStyleSelector
                  store={mc}
                  updateStore={mcUpdateStore}
                  clsId={mcCls.id}
                  classLevel={mc.level}
                  label={`Stile di Combattimento — ${mcCls.name}`}
                />
              </div>
            )}
          </>
        )}
      </Frame>

      {/* Scheda del Personaggio */}
      <Frame>
        <CharacterSheetView draft={draft} setDraft={updateDraft} showPlayTools />
      </Frame>
    </div>
  );
}

/* ---------------------------------- CHARACTER LIST ---------------------------------- */

const CANTRIP_LABEL = "Trucchetti";
function spellLevelLabel(level) {
  return level === 0 ? CANTRIP_LABEL : `Incantesimi di ${level}° livello`;
}

// Compendio consultabile di tutti gli incantesimi del gioco, indipendente da un personaggio:
// chiunque può sfogliarlo dalla Dashboard, filtrando per classe e cercando per nome.
function SpellCompendium({ onBack }) {
  const [classFilter, setClassFilter] = useState("tutti");
  const [search, setSearch] = useState("");

  const classesWithSpells = CLASSES.filter((c) => SPELLS.some((s) => s.classes.includes(c.id)));
  const searchTerm = search.trim().toLowerCase();
  const filtered = SPELLS.filter((s) =>
    (classFilter === "tutti" || s.classes.includes(classFilter)) &&
    (!searchTerm || s.name.toLowerCase().includes(searchTerm))
  );
  const byLevel = {};
  filtered.forEach((s) => { (byLevel[s.level] = byLevel[s.level] || []).push(s); });
  const levels = Object.keys(byLevel).map(Number).sort((a, b) => a - b);
  const sortByName = (a, b) => a.name.localeCompare(b.name, "it");

  return (
    <div>
      <GhostButton icon={ChevronLeft} onClick={onBack} style={{ marginBottom: 18 }}>
        I miei personaggi
      </GhostButton>
      <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: 26, color: C.cream, margin: 0 }}>Compendio degli Incantesimi</h1>
      <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.creamMuted, margin: "4px 0 1.25rem" }}>
        {SPELLS.length} incantesimi del Manuale del Giocatore 2014, con danno, dadi e tiri salvezza. Sfoglia liberamente, senza bisogno di un personaggio.
      </p>

      <Frame>
        <input
          type="text" placeholder="Cerca un incantesimo per nome…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%", fontFamily: "'Spectral', serif", fontSize: 13.5, padding: "0.5rem 0.7rem",
            borderRadius: 2, border: `1px solid ${C.parchmentLine}`, background: "#fff", marginBottom: 14, boxSizing: "border-box",
          }}
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
          <Pill active={classFilter === "tutti"} onClick={() => setClassFilter("tutti")}>Tutte le classi</Pill>
          {classesWithSpells.map((c) => (
            <Pill key={c.id} active={classFilter === c.id} onClick={() => setClassFilter(c.id)}>{c.name}</Pill>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textMuted }}>Nessun incantesimo trovato.</p>
        ) : (
          levels.map((lvl) => (
            <div key={lvl} style={{ marginBottom: 18 }}>
              <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: C.wineDeep, margin: "0 0 8px" }}>
                {spellLevelLabel(lvl)} ({byLevel[lvl].length})
              </h3>
              {[...byLevel[lvl]].sort(sortByName).map((s) => (
                <SpellRow key={s.id} spell={s} selected={false} disabled={false} onToggle={() => {}} />
              ))}
            </div>
          ))
        )}
      </Frame>
    </div>
  );
}

function CharacterList({ characters, loading, onNew, onOpen, onOpenSheet, onDelete, onOpenCompendium }) {
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: 26, color: C.cream, margin: 0 }}>I tuoi personaggi</h1>
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.creamMuted, margin: "4px 0 0" }}>
            Dungeons &amp; Dragons · 5e 2014
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <GhostButton icon={BookOpen} onClick={onOpenCompendium} style={{ borderColor: C.gold, color: C.gold }}>
            Compendio Incantesimi
          </GhostButton>
          <GoldButton icon={Plus} onClick={onNew}>Nuovo personaggio</GoldButton>
        </div>
      </div>

      {loading ? (
        <p style={{ fontFamily: "'Spectral', serif", color: C.creamMuted }}>Caricamento…</p>
      ) : characters.length === 0 ? (
        <Frame style={{ textAlign: "center", padding: "3rem 2rem" }}>
          <Crown size={28} color={C.gold} style={{ marginBottom: 10 }} />
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 16, color: C.textOnParchment, margin: "0 0 6px" }}>
            Nessun eroe ancora forgiato
          </p>
          <p style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, color: C.textMuted, margin: "0 0 18px" }}>
            Crea il tuo primo personaggio per iniziare l'avventura.
          </p>
          <GoldButton icon={Plus} onClick={onNew}>Crea personaggio</GoldButton>
        </Frame>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "var(--g2)", gap: "1rem" }}>
          {characters.map((c) => {
            const race = RACES.find((r) => r.id === c.raceId);
            const cls = CLASSES.find((cl) => cl.id === c.classId);
            const Icon = cls?.id === "mago" || cls?.id === "stregone" || cls?.id === "warlock" ? Wand2 : cls?.id === "chierico" || cls?.id === "paladino" ? Shield : Sword;

            const chosenSubclassId = cls ? getChosenSubclassId(c, cls.id) : null;
            const subclass = cls ? getSubclass(cls.id, chosenSubclassId) : null;
            let maxHp = null, currentHp = null;
            if (cls) {
              const finalScores = computeFinalScores({ ...emptyDraft(), ...c });
              maxHp = computeMaxHp({ ...emptyDraft(), ...c }, cls, race, mod(finalScores.con));
              currentHp = c.currentHp == null ? maxHp : Math.min(c.currentHp, maxHp);
            }
            const isPendingDelete = pendingDeleteId === c.id;

            return (
              <Frame key={c.id} style={{ padding: "1.25rem 1.4rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Icon size={16} color={C.wine} />
                      <span style={{ fontFamily: "'Cinzel', serif", fontSize: 17, color: C.textOnParchment }}>{c.name}</span>
                    </div>
                    <p style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: C.textMuted, margin: "4px 0 0" }}>
                      {race?.name || "—"} · {cls ? `${cls.name} (liv. ${c.level || 1})` : "—"}{subclass ? ` — ${subclass.name}` : ""}
                    </p>
                    {maxHp != null && (
                      <p style={{ fontFamily: "'Spectral', serif", fontSize: 12.5, color: currentHp <= maxHp / 3 ? C.danger : C.textMuted, margin: "2px 0 0" }}>
                        {currentHp} / {maxHp} PF
                      </p>
                    )}
                  </div>
                  {isPendingDelete ? (
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      <button
                        onClick={() => { onDelete(c.id); setPendingDeleteId(null); }}
                        style={{ background: C.danger, color: "#fff", border: "none", cursor: "pointer", borderRadius: 3, padding: "4px 8px", fontFamily: "'Spectral', serif", fontSize: 11.5 }}
                      >
                        Sì, elimina
                      </button>
                      <button
                        onClick={() => setPendingDeleteId(null)}
                        style={{ background: "transparent", border: `1px solid ${C.parchmentLine}`, cursor: "pointer", borderRadius: 3, padding: "4px 8px", fontFamily: "'Spectral', serif", fontSize: 11.5, color: C.textMuted }}
                      >
                        Annulla
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setPendingDeleteId(c.id)} style={{ background: "transparent", border: "none", cursor: "pointer", color: C.danger, padding: 4 }} aria-label="Elimina personaggio">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <GoldButton icon={BookOpen} onClick={() => onOpenSheet(c)} style={{ padding: "0.5rem 0.9rem", fontSize: 13 }}>
                    Apri scheda
                  </GoldButton>
                  <GhostButton icon={Pencil} onClick={() => onOpen(c)} style={{ borderColor: C.wine, color: C.wineDeep, background: "transparent" }}>
                    Modifica
                  </GhostButton>
                </div>
              </Frame>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------- CREATOR ---------------------------------- */

// Una classe (combinata con l'eventuale sottoclasse già scelta) può davvero lanciare
// incantesimi? Prima ancora di scegliere una classe non c'è nulla da mostrare, quindi lo step
// resta nascosto. Guerriero/Ladro dipendono poi dalla sottoclasse (Cavaliere Mistico/Furfante
// Arcano); finché la sottoclasse non è ancora scelta assumiamo di sì, per non far sparire lo
// step prima che l'utente abbia deciso.
function draftCanEverCast(draft) {
  const cls = CLASSES.find((c) => c.id === draft.classId);
  if (!cls) return false;
  if (getEffectiveCasterInfo(cls.id, draft.subclassId)) return true;
  if ((cls.id === "guerriero" || cls.id === "ladro") && !draft.subclassId) return true;
  return false;
}

function Creator({ draft, setDraft, onBack, onSave, saving }) {
  const [step, setStep] = useState(0);
  const visibleSteps = useMemo(
    () => STEPS.filter((s) => s.key !== "incantesimi" || draftCanEverCast(draft)),
    [draft.classId, draft.subclassId]
  );
  const lastStep = visibleSteps.length - 1;
  // Se cambiando classe/sottoclasse lo step "Incantesimi" sparisce, l'indice grezzo può restare
  // fuori dai nuovi limiti (es. si era arrivati al Riepilogo): lo clampiamo qui, in lettura,
  // invece che con un effect che richiamerebbe subito un altro render.
  const clampedStep = Math.min(step, lastStep);
  const currentKey = visibleSteps[clampedStep]?.key;

  const canGoNext = !!currentKey && isStepComplete(currentKey, draft);

  return (
    <div style={{ display: "flex", flexDirection: "var(--creator-flex-dir)", gap: "1.75rem" }}>
      <div style={{ width: "var(--creator-sidebar-width)", flexShrink: 0, padding: "0.8rem 0.7rem", borderRadius: 2, background: "rgba(31, 24, 19, 0.7)", border: `1px solid rgba(224, 193, 101, 0.25)`, boxShadow: "inset 0 0 0 1px rgba(224, 193, 101, 0.08)" }}>
        <GhostButton icon={ChevronLeft} onClick={onBack} style={{ marginBottom: 18, width: "100%", justifyContent: "flex-start" }}>
          I miei personaggi
        </GhostButton>
        <div style={{ display: "flex", flexDirection: "var(--creator-steps-dir)", gap: 4, overflowX: "auto" }}>
          {visibleSteps.map((s, i) => {
            const Icon = s.icon;
            const active = i === clampedStep;
            const done = isStepFullyComplete(s.key, draft);
            return (
              <button
                key={s.key}
                onClick={() => setStep(i)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, textAlign: "left", flexShrink: 0, whiteSpace: "nowrap",
                  padding: "0.7rem 0.75rem", borderRadius: 3, border: `1px solid ${active ? "rgba(224,193,101,0.65)" : "transparent"}`, cursor: "pointer",
                  background: active ? "rgba(201,162,39,0.14)" : done ? "rgba(47,92,72,0.18)" : "transparent",
                  color: active ? C.gold : done ? C.cream : C.creamMuted,
                  boxShadow: active ? `inset 0 0 0 1px rgba(224,193,101,0.2)` : "none",
                }}
              >
                <span style={{
                  width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  border: `1px solid ${active ? C.gold : done ? C.forest : "#5a4f43"}`,
                  background: done ? C.forest : "transparent", fontSize: 11, fontFamily: "'Cinzel', serif", flexShrink: 0,
                }}>
                  {done ? <Check size={12} /> : i + 1}
                </span>
                <span style={{ fontFamily: "'Spectral', serif", fontSize: 13.5, fontWeight: active ? 600 : 500 }}>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 14, padding: "0.7rem 0.9rem", border: `1px solid ${C.goldSoft}`, borderRadius: 2, background: "linear-gradient(180deg, rgba(43, 33, 23, 0.96), rgba(31, 24, 19, 0.98))", boxShadow: `inset 0 0 0 1px rgba(224, 193, 101, 0.22)` }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 11, color: C.goldSoft, letterSpacing: 1.2, textTransform: "uppercase", opacity: 0.96 }}>
            Stato del personaggio
          </div>
          <div style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: C.cream, marginTop: 4, fontWeight: 700, lineHeight: 1.35 }}>
            {draft.name || "Nuovo eroe"} · {visibleSteps[clampedStep]?.label}
          </div>
        </div>
        <Frame>
          {currentKey === "razza" && <StepRace draft={draft} setDraft={setDraft} />}
          {currentKey === "classe" && <StepClass draft={draft} setDraft={setDraft} />}
          {currentKey === "caratteristiche" && <StepAbilities draft={draft} setDraft={setDraft} />}
          {currentKey === "background" && <StepBackground draft={draft} setDraft={setDraft} />}
          {currentKey === "equipaggiamento" && <StepEquipment draft={draft} setDraft={setDraft} />}
          {currentKey === "incantesimi" && <SpellManager draft={draft} setDraft={setDraft} />}
          {currentKey === "riepilogo" && <StepReview draft={draft} setDraft={setDraft} onSave={onSave} saving={saving} />}
        </Frame>

        {clampedStep < lastStep && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
            <GhostButton icon={ChevronLeft} onClick={() => setStep((s) => Math.max(0, Math.min(s, lastStep) - 1))} style={{ visibility: clampedStep === 0 ? "hidden" : "visible" }}>
              Indietro
            </GhostButton>
            <GoldButton icon={ChevronRight} disabled={!canGoNext} onClick={() => setStep((s) => Math.min(lastStep, Math.min(s, lastStep) + 1))} style={{ flexDirection: "row-reverse" }}>
              Avanti
            </GoldButton>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------- APP ---------------------------------- */

export default function App() {
  const [screen, setScreen] = useState("list");
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState(emptyDraft());
  const [sheetCharacter, setSheetCharacter] = useState(null);
  const [toast, setToast] = useState(null);

  const loadCharacters = useCallback(async () => {
    setLoading(true);
    try {
      const res = await storageAdapter.get(STORAGE_KEY, false);
      const list = res && res.value ? JSON.parse(res.value) : [];
      setCharacters(Array.isArray(list) ? list : []);
    } catch (e) {
      setCharacters([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCharacters(); }, [loadCharacters]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const handleNew = () => {
    setDraft(emptyDraft());
    setScreen("create");
  };

  const handleOpen = (c) => {
    setDraft({ ...emptyDraft(), ...c });
    setScreen("create");
  };

  const handleOpenSheet = (c) => {
    setSheetCharacter({ ...emptyDraft(), ...c });
    setScreen("sheet");
  };

  const handleSaveSheetChanges = async (updatedCharacter) => {
    try {
      const next = characters.map((c) => (c.id === updatedCharacter.id ? updatedCharacter : c));
      const result = await storageAdapter.set(STORAGE_KEY, JSON.stringify(next), false);
      if (!result) throw new Error("save failed");
      setCharacters(next);
      setSheetCharacter(updatedCharacter);
      showToast("Modifiche salvate.");
    } catch (e) {
      showToast("Errore durante il salvataggio. Riprova.");
    }
  };

  const handleDelete = async (id) => {
    const next = characters.filter((c) => c.id !== id);
    setCharacters(next);
    try {
      await storageAdapter.set(STORAGE_KEY, JSON.stringify(next), false);
      showToast("Personaggio eliminato.");
    } catch (e) {
      showToast("Non è stato possibile eliminare il personaggio.");
      loadCharacters();
    }
  };

  const handleSave = async () => {
    const errors = validateCharacter(draft);
    if (errors.length) { showToast(errors[0]); return; }
    setSaving(true);
    try {
      const id = draft.id || `char_${Date.now()}`;
      const toSave = { ...draft, id };
      const existingIdx = characters.findIndex((c) => c.id === id);
      const next = existingIdx >= 0
        ? characters.map((c, i) => (i === existingIdx ? toSave : c))
        : [...characters, toSave];
      const result = await storageAdapter.set(STORAGE_KEY, JSON.stringify(next), false);
      if (!result) throw new Error("save failed");
      setCharacters(next);
      setDraft(toSave);
      showToast("Personaggio salvato.");
      setScreen("list");
    } catch (e) {
      showToast("Errore durante il salvataggio. Riprova.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: C.ink, minHeight: "100vh", padding: "var(--app-padding)", fontFamily: "'Spectral', serif" }}>
      <style>{`
        ${FONT_IMPORT}
        * { box-sizing: border-box; }
        html { -webkit-text-size-adjust: 100%; }
        body { overflow-x: hidden; }

        /* Layout responsive SOLO per smartphone (≤640px): tablet e desktop restano invariati.
           Le griglie a colonne fisse e le larghezze fisse dell'app referenziano queste variabili
           invece di valori letterali, così il breakpoint è definito in un unico posto. */
        :root {
          --g2: 1fr 1fr;
          --g3: repeat(3, 1fr);
          --g6: repeat(6, 1fr);
          --creator-flex-dir: row;
          --creator-sidebar-width: 210px;
          --creator-steps-dir: column;
          --app-padding: 2rem;
          --modal-max-width: 720px;
          --modal-outer-padding: 2rem;
          --frame-padding: 1.75rem;
        }
        @media (max-width: 640px) {
          :root {
            --g2: 1fr;
            --g3: 1fr;
            --g6: repeat(2, 1fr);
            --creator-flex-dir: column;
            --creator-sidebar-width: 100%;
            --creator-steps-dir: row;
            --app-padding: 0.85rem;
            --modal-max-width: 100%;
            --modal-outer-padding: 0.6rem;
            --frame-padding: 1.1rem;
          }
        }
        input,
        select {
          color: ${C.textOnParchment};
          background: #fff;
        }
        select option {
          color: ${C.inkDeep};
          background: #fff;
        }
        select option:disabled {
          color: ${C.textMuted};
          background: #f5efe4;
        }
        select option:checked {
          background: ${C.parchment};
          color: ${C.inkDeep};
        }
        input::placeholder {
          color: ${C.textMuted};
          opacity: 1;
        }
        select:focus, input:focus { outline: 2px solid ${C.gold}; outline-offset: 1px; }
        button:focus-visible { outline: 2px solid ${C.gold}; outline-offset: 2px; }
      `}</style>

      {screen === "list" && (
        <CharacterList
          characters={characters}
          loading={loading}
          onNew={handleNew}
          onOpen={handleOpen}
          onOpenSheet={handleOpenSheet}
          onDelete={handleDelete}
          onOpenCompendium={() => setScreen("compendium")}
        />
      )}

      {screen === "compendium" && (
        <SpellCompendium onBack={() => setScreen("list")} />
      )}

      {screen === "create" && (
        <Creator
          draft={draft}
          setDraft={setDraft}
          onBack={() => setScreen("list")}
          onSave={handleSave}
          saving={saving}
        />
      )}

      {screen === "sheet" && sheetCharacter && (
        <PlayerSheet
          character={sheetCharacter}
          onBack={() => setScreen("list")}
          onSaveChanges={handleSaveSheetChanges}
        />
      )}

      {toast && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: C.forestDeep, color: C.cream, padding: "0.7rem 1.4rem", borderRadius: 3,
          border: `1px solid ${C.gold}`, fontFamily: "'Spectral', serif", fontSize: 13.5, zIndex: 50,
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}