// Mappa nomi (anche plurali) → id del catalogo armi, per riconoscere le armi nominate per esteso
// nelle competenze bonus di razza/sottoclasse (es. "Spade lunghe" deve corrispondere a "spada-lunga").
export const WEAPON_NAME_TO_ID = {
  "bastone": "bastone", "bastoni": "bastone",
  "pugnale": "pugnale", "pugnali": "pugnale",
  "ascia da lancio": "ascia-da-lancio", "asce da lancio": "ascia-da-lancio",
  "giavellotto": "giavellotto", "giavellotti": "giavellotto",
  "mazza": "mazza", "mazze": "mazza",
  "falcetto": "falcetto", "falcetti": "falcetto",
  "lancia": "lancia", "lance": "lancia",
  "arco corto": "arco-corto", "archi corti": "arco-corto",
  "balestra leggera": "balestra-leggera", "balestre leggere": "balestra-leggera",
  "fionda": "fionda", "fionde": "fionda",
  "spada corta": "spada-corta", "spade corte": "spada-corta",
  "spada lunga": "spada-lunga", "spade lunghe": "spada-lunga",
  "rapiera": "rapiera", "rapiere": "rapiera",
  "ascia bipenne": "ascia-bipenne", "asce bipenni": "ascia-bipenne",
  "spadone": "spadone", "spadoni": "spadone",
  "ascia da battaglia": "ascia-da-battaglia", "asce da battaglia": "ascia-da-battaglia",
  "martello da guerra": "martello-da-guerra", "martelli da guerra": "martello-da-guerra",
  "alabarda": "alabarda", "alabarde": "alabarda",
  "arco lungo": "arco-lungo", "archi lunghi": "arco-lungo",
  "balestra pesante": "balestra-pesante", "balestre pesanti": "balestra-pesante",
  "balestra a mano": "balestra-a-mano", "balestre a mano": "balestra-a-mano",
};

export const EQUIPMENT_CATALOG = [
  { id: "bastone", name: "Bastone", category: "arma", tier: "semplice", damage: "1d4", damageType: "contundente", hands: "una mano", properties: ["Versatile (1d6)"] },
  { id: "pugnale", name: "Pugnale", category: "arma", tier: "semplice", damage: "1d4", damageType: "perforante", hands: "una mano", properties: ["Leggera", "Finezza", "Da lancio (6/18 m)"] },
  { id: "ascia-da-lancio", name: "Ascia da Lancio", category: "arma", tier: "semplice", damage: "1d6", damageType: "tagliente", hands: "una mano", properties: ["Leggera", "Da lancio (6/18 m)"] },
  { id: "giavellotto", name: "Giavellotto", category: "arma", tier: "semplice", damage: "1d6", damageType: "perforante", hands: "una mano", properties: ["Da lancio (9/36 m)"] },
  { id: "mazza", name: "Mazza", category: "arma", tier: "semplice", damage: "1d6", damageType: "contundente", hands: "una mano", properties: [] },
  { id: "falcetto", name: "Falcetto", category: "arma", tier: "semplice", damage: "1d4", damageType: "tagliente", hands: "una mano", properties: ["Leggera"] },
  { id: "lancia", name: "Lancia", category: "arma", tier: "semplice", damage: "1d6", damageType: "perforante", hands: "una mano", properties: ["Versatile (1d8)", "Da lancio (6/18 m)"] },
  { id: "dardo", name: "Dardo", category: "arma", tier: "semplice", ranged: true, damage: "1d4", damageType: "perforante", hands: "una mano", properties: ["Finezza", "Da lancio (6/18 m)"] },
  { id: "arco-corto", name: "Arco Corto", category: "arma", tier: "semplice", ranged: true, damage: "1d6", damageType: "perforante", hands: "due mani", properties: ["Munizioni (24/96 m)"] },
  { id: "balestra-leggera", name: "Balestra Leggera", category: "arma", tier: "semplice", ranged: true, damage: "1d8", damageType: "perforante", hands: "due mani", properties: ["Munizioni (24/96 m)", "Ricarica"] },
  { id: "fionda", name: "Fionda", category: "arma", tier: "semplice", ranged: true, damage: "1d4", damageType: "contundente", hands: "una mano", properties: ["Munizioni (9/36 m)"] },
  { id: "spada-corta", name: "Spada Corta", category: "arma", tier: "guerra", damage: "1d6", damageType: "perforante", hands: "una mano", properties: ["Leggera", "Finezza"] },
  { id: "spada-lunga", name: "Spada Lunga", category: "arma", tier: "guerra", damage: "1d8", damageType: "tagliente", hands: "una mano", properties: ["Versatile (1d10)"] },
  { id: "rapiera", name: "Rapiera", category: "arma", tier: "guerra", damage: "1d8", damageType: "perforante", hands: "una mano", properties: ["Finezza"] },
  { id: "ascia-bipenne", name: "Ascia Bipenne", category: "arma", tier: "guerra", damage: "1d12", damageType: "tagliente", hands: "due mani", properties: ["Pesante"] },
  { id: "spadone", name: "Spadone", category: "arma", tier: "guerra", damage: "2d6", damageType: "tagliente", hands: "due mani", properties: ["Pesante"] },
  { id: "ascia-da-battaglia", name: "Ascia da Battaglia", category: "arma", tier: "guerra", damage: "1d8", damageType: "tagliente", hands: "una mano", properties: ["Versatile (1d10)"] },
  { id: "martello-da-guerra", name: "Martello da Guerra", category: "arma", tier: "guerra", damage: "1d8", damageType: "contundente", hands: "una mano", properties: ["Versatile (1d10)"] },
  { id: "alabarda", name: "Alabarda", category: "arma", tier: "guerra", damage: "1d10", damageType: "tagliente", hands: "due mani", properties: ["Pesante", "Portata"] },
  { id: "arco-lungo", name: "Arco Lungo", category: "arma", tier: "guerra", ranged: true, damage: "1d8", damageType: "perforante", hands: "due mani", properties: ["Munizioni (45/180 m)", "Pesante"] },
  { id: "balestra-pesante", name: "Balestra Pesante", category: "arma", tier: "guerra", ranged: true, damage: "1d10", damageType: "perforante", hands: "due mani", properties: ["Munizioni (30/120 m)", "Pesante", "Ricarica"] },
  { id: "balestra-a-mano", name: "Balestra a Mano", category: "arma", tier: "guerra", ranged: true, damage: "1d6", damageType: "perforante", hands: "una mano", properties: ["Leggera", "Munizioni (9/36 m)", "Ricarica"] },
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
  { id: "quadrello", name: "Quadrello da Balestra", category: "oggetto", desc: "Munizione per balestre." },
  { id: "freccia", name: "Freccia", category: "oggetto", desc: "Munizione per archi." },
  { id: "borsa-di-componenti", name: "Borsa di Componenti", category: "oggetto", desc: "Contiene i componenti materiali comuni richiesti dagli incantesimi; sostituisce i componenti privi di costo indicato." },
  { id: "focus-druidico", name: "Focus Druidico", category: "oggetto", desc: "Un ramo di vischio, un bastone di legno intagliato, un cristallo o un oggetto simile, usato per lanciare incantesimi druidici." },
  { id: "set-da-erborista", name: "Set da Erborista", category: "oggetto", desc: "Strumenti per identificare e preparare erbe curative; necessario per creare antidoti e pozioni di cura." },
  { id: "libro-degli-incantesimi", name: "Libro degli Incantesimi", category: "oggetto", desc: "Contiene gli incantesimi conosciuti dal Mago; necessario per prepararli e lanciarli." },
  { id: "strumento-musicale", name: "Strumento Musicale (a scelta)", category: "oggetto", desc: "Uno strumento musicale a scelta tra quelli con cui il personaggio ha competenza." },
  { id: "zaino-da-esploratore", name: "Zaino da Esploratore", category: "oggetto", desc: "Zaino, sacco a pelo, kit da cucina, torcia, 10 giorni di razioni, otre d'acqua e 15 m di corda di canapa." },
  { id: "zaino-da-intrattenitore", name: "Zaino da Intrattenitore", category: "oggetto", desc: "Zaino, sacco a pelo, 2 costumi, 5 candele, 5 giorni di razioni, borraccia e un kit da trucco." },
  { id: "zaino-da-religioso", name: "Zaino da Religioso", category: "oggetto", desc: "Zaino, coperta, 10 candele, acciarino, incensiere, 2 giorni di razioni, otre d'acqua e un blocco d'incenso." },
  { id: "zaino-da-studioso", name: "Zaino da Studioso", category: "oggetto", desc: "Zaino, bottiglia d'inchiostro, penna, pergamena (10 fogli), piccolo coltello, borsa di sabbia e libro di appunti." },
  { id: "zaino-da-ladro", name: "Zaino da Ladro", category: "oggetto", desc: "Zaino, sacco a pelo, kit da cucina, torcia, 5 giorni di razioni, otre d'acqua, 15 m di corda di canapa e una lampada scura." },
  { id: "zaino-da-dungeon", name: "Zaino da Dungeon", category: "oggetto", desc: "Zaino, palo di ferro, martello, 10 picchetti, torcia, acciarino, 10 giorni di razioni, otre d'acqua e 15 m di corda di canapa." },
];

// Filtra il catalogo per la categoria d'arma di un corredo di equipaggiamento (es. "arma
// semplice" o "arma da mischia da guerra" nel testo del PHB): usato dal picker di corredo in
// creazione, quando la scelta è "un'arma qualsiasi di quel tipo" invece di un'arma specifica.
export function weaponsByCategory(category) {
  const weapons = EQUIPMENT_CATALOG.filter((i) => i.category === "arma");
  if (category === "semplice") return weapons.filter((i) => i.tier === "semplice");
  if (category === "semplice-mischia") return weapons.filter((i) => i.tier === "semplice" && !i.ranged);
  if (category === "guerra") return weapons.filter((i) => i.tier === "guerra");
  if (category === "guerra-mischia") return weapons.filter((i) => i.tier === "guerra" && !i.ranged);
  return [];
}

export function armorsByCategory(category) {
  if (category === "leggera") return EQUIPMENT_CATALOG.filter((i) => i.category === "armatura" && i.tipo === "leggera");
  return [];
}
