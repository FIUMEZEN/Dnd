export const CLASSES = [
  {
    id: "barbaro", name: "Barbaro", hitDie: 12, primary: "Forza", saves: ["Forza", "Costituzione"],
    armor: "Armature leggere e medie, scudi", weapons: "Armi semplici e da guerra",
    weaponProficiency: { simple: true, martial: true },
    skillChoices: 2, skillOptions: ["Addestrare Animali", "Atletica", "Intimidire", "Natura", "Percezione", "Sopravvivenza"],
    equipment: ["Un'ascia bipenne oppure un'arma da mischia da guerra", "Due asce da lancio", "Uno zaino da esploratore", "Quattro giavellotti"],
    blurb: "Canalizza una furia primordiale che lo rende inarrestabile in battaglia.",
  },
  {
    id: "bardo", name: "Bardo", hitDie: 8, primary: "Carisma", saves: ["Destrezza", "Carisma"],
    armor: "Armature leggere", weapons: "Armi semplici, spade lunghe, rapiere, spade corte, balestre a mano",
    weaponProficiency: { simple: true, specific: ["spada-lunga", "rapiera", "spada-corta", "balestra-a-mano"] },
    skillChoices: 3, skillOptions: ["Acrobazia", "Addestrare Animali", "Arcano", "Atletica", "Inganno", "Indagare", "Intimidire", "Intrattenere", "Intuizione", "Medicina", "Natura", "Percezione", "Persuasione", "Religione", "Rapidità di Mano", "Furtività", "Sopravvivenza", "Storia"],
    equipment: ["Una spada corta oppure un'arma semplice", "Uno strumento musicale a scelta", "Uno zaino da intrattenitore", "Un'armatura di cuoio e un pugnale"],
    blurb: "Intreccia musica e magia per ispirare alleati e disarmare nemici.",
  },
  {
    id: "chierico", name: "Chierico", hitDie: 8, primary: "Saggezza", saves: ["Saggezza", "Carisma"],
    armor: "Armature leggere e medie, scudi", weapons: "Armi semplici",
    weaponProficiency: { simple: true },
    skillChoices: 2, skillOptions: ["Storia", "Intuizione", "Medicina", "Persuasione", "Religione"],
    equipment: ["Una mazza oppure una spada corta", "Un'armatura a scaglie o di cuoio", "Una balestra leggera con 20 quadrelli oppure un'arma semplice", "Uno zaino da religioso, uno scudo e un simbolo sacro"],
    blurb: "Canalizza il potere divino della propria fede a beneficio dei compagni.",
  },
  {
    id: "druido", name: "Druido", hitDie: 8, primary: "Saggezza", saves: ["Intelligenza", "Saggezza"],
    armor: "Armature leggere e medie non metalliche, scudi non metallici", weapons: "Bastoni, pugnali, dardi, giavellotti, mazze, falcetti, fionde, lance",
    weaponProficiency: { specific: ["bastone", "pugnale", "giavellotto", "mazza", "falcetto", "fionda", "lancia"] },
    skillChoices: 2, skillOptions: ["Arcano", "Addestrare Animali", "Intuizione", "Medicina", "Natura", "Percezione", "Religione", "Sopravvivenza"],
    equipment: ["Uno scudo di legno oppure un'arma semplice", "Un falcetto oppure un'arma da mischia semplice", "Un'armatura di cuoio, un set da erborista e un focus druidico"],
    blurb: "Custode della natura selvaggia, capace di assumerne le forme.",
  },
  {
    id: "guerriero", name: "Guerriero", hitDie: 10, primary: "Forza o Destrezza", saves: ["Forza", "Costituzione"],
    armor: "Tutte le armature, scudi", weapons: "Armi semplici e da guerra",
    weaponProficiency: { simple: true, martial: true },
    skillChoices: 2, skillOptions: ["Acrobazia", "Addestrare Animali", "Atletica", "Storia", "Intuizione", "Intimidire", "Percezione", "Sopravvivenza"],
    equipment: ["Un'armatura a maglia oppure un'armatura leggera", "Un'arma da mischia da guerra con uno scudo, oppure due armi da mischia da guerra", "Una balestra leggera con 20 quadrelli oppure due asce da lancio", "Uno zaino da esploratore o da dungeon"],
    blurb: "Maestro delle armi e delle tattiche di combattimento in ogni forma.",
  },
  {
    id: "ladro", name: "Ladro", hitDie: 8, primary: "Destrezza", saves: ["Destrezza", "Intelligenza"],
    armor: "Armature leggere", weapons: "Armi semplici, balestre a mano, spade corte, spade lunghe, rapiere",
    weaponProficiency: { simple: true, specific: ["balestra-a-mano", "spada-corta", "spada-lunga", "rapiera"] },
    skillChoices: 4, skillOptions: ["Acrobazia", "Atletica", "Inganno", "Intuizione", "Intimidire", "Indagare", "Percezione", "Rapidità di Mano", "Furtività", "Persuasione"],
    equipment: ["Una spada corta oppure una spada lunga", "Un arco corto con faretra da 20 frecce oppure una spada corta", "Uno zaino da ladro, un'armatura di cuoio, due pugnali e strumenti da scasso"],
    blurb: "Agile ed elusivo, colpisce nei punti deboli prima di sparire nell'ombra.",
  },
  {
    id: "mago", name: "Mago", hitDie: 6, primary: "Intelligenza", saves: ["Intelligenza", "Saggezza"],
    armor: "Nessuna", weapons: "Pugnali, dardi, fionde, bastoni, balestre leggere",
    weaponProficiency: { specific: ["pugnale", "fionda", "bastone", "balestra-leggera"] },
    skillChoices: 2, skillOptions: ["Arcano", "Storia", "Intuizione", "Indagare", "Medicina", "Religione"],
    equipment: ["Un bastone oppure un pugnale", "Una borsa di componenti oppure un focus arcano", "Uno zaino da studioso e un libro degli incantesimi"],
    blurb: "Studioso dell'arcano, plasma la realtà attraverso la conoscenza magica.",
  },
  {
    id: "monaco", name: "Monaco", hitDie: 8, primary: "Destrezza e Saggezza", saves: ["Forza", "Destrezza"],
    armor: "Nessuna", weapons: "Armi semplici, spade corte",
    weaponProficiency: { simple: true, specific: ["spada-corta"] },
    skillChoices: 2, skillOptions: ["Acrobazia", "Atletica", "Storia", "Intuizione", "Religione", "Furtività"],
    equipment: ["Una spada corta oppure un'arma semplice", "Dieci dardi oppure uno zaino da esploratore", "Uno zaino da religioso e un set di attrezzi o uno strumento musicale"],
    blurb: "Disciplina corpo e spirito fino a trasformarli in un'arma perfetta.",
  },
  {
    id: "paladino", name: "Paladino", hitDie: 10, primary: "Forza e Carisma", saves: ["Saggezza", "Carisma"],
    armor: "Tutte le armature, scudi", weapons: "Armi semplici e da guerra",
    weaponProficiency: { simple: true, martial: true },
    skillChoices: 2, skillOptions: ["Atletica", "Intuizione", "Intimidire", "Medicina", "Persuasione", "Religione"],
    equipment: ["Un'arma da mischia da guerra con uno scudo, oppure due armi da mischia da guerra", "Cinque giavellotti oppure un'arma da mischia semplice", "Uno zaino da religioso, un'armatura pesante e un simbolo sacro"],
    blurb: "Ha giurato un voto sacro e lo difende con spada e devozione.",
  },
  {
    id: "ranger", name: "Ranger", hitDie: 10, primary: "Destrezza e Saggezza", saves: ["Forza", "Destrezza"],
    armor: "Armature leggere e medie, scudi", weapons: "Armi semplici e da guerra",
    weaponProficiency: { simple: true, martial: true },
    skillChoices: 3, skillOptions: ["Addestrare Animali", "Atletica", "Intuizione", "Indagare", "Natura", "Percezione", "Furtività", "Sopravvivenza"],
    equipment: ["Un'armatura a scaglie o di cuoio", "Due spade corte oppure due armi da mischia semplici", "Uno zaino da esploratore, un arco lungo e una faretra da 20 frecce"],
    blurb: "Cacciatore ed esploratore, legge i segni della natura selvaggia.",
  },
  {
    id: "stregone", name: "Stregone", hitDie: 6, primary: "Carisma", saves: ["Costituzione", "Carisma"],
    armor: "Nessuna", weapons: "Pugnali, dardi, fionde, bastoni, balestre leggere",
    weaponProficiency: { specific: ["pugnale", "fionda", "bastone", "balestra-leggera"] },
    skillChoices: 2, skillOptions: ["Arcano", "Inganno", "Intuizione", "Intimidire", "Persuasione", "Religione"],
    equipment: ["Una balestra leggera con 20 quadrelli oppure un'arma semplice", "Una borsa di componenti oppure un focus arcano", "Uno zaino da studioso e due pugnali"],
    blurb: "La magia scorre nel suo sangue, innata e a tratti incontrollabile.",
  },
  {
    id: "warlock", name: "Warlock", hitDie: 8, primary: "Carisma", saves: ["Saggezza", "Carisma"],
    armor: "Armature leggere", weapons: "Armi semplici",
    weaponProficiency: { simple: true },
    skillChoices: 2, skillOptions: ["Arcano", "Inganno", "Storia", "Intimidire", "Indagare", "Natura", "Religione"],
    equipment: ["Una balestra leggera con 20 quadrelli oppure un'arma semplice", "Una borsa di componenti oppure un focus arcano, e uno zaino da studioso", "Un'armatura di cuoio e due pugnali"],
    blurb: "Ha stretto un patto con un'entità di potere immenso e oscuro.",
  },
];

export const SUBCLASS_CHOICE_LEVEL = {
  guerriero: 3,
  ladro: 3,
  barbaro: 3,
  monaco: 3,
  mago: 2,
  bardo: 3,
  ranger: 3,
  stregone: 1
};

export const SUBCLASS_AVAILABILITY_MESSAGE = {
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
export const ASI_LEVELS_BY_CLASS = {
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
export const MULTICLASS_PREREQS = {
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
export const MULTICLASS_PROFICIENCIES = {
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

// Versione strutturata (solo armi) della tabella sopra, usata per calcolare davvero il bonus di
// competenza sui tiri per colpire quando la classe è quella secondaria da multiclasse: a
// differenza della classe primaria, il multiclasse concede competenze ridotte (PHB 2014, "Tabella
// Competenze Multiclasse"). null = nessuna competenza con le armi concessa dal multiclasse.
export const MULTICLASS_WEAPON_PROFICIENCY = {
  barbaro: { simple: true, martial: true },
  bardo: null,
  chierico: null,
  druido: null,
  guerriero: { simple: true, martial: true },
  ladro: null,
  mago: null,
  monaco: { simple: true, specific: ["spada-corta"] },
  paladino: { simple: true, martial: true },
  ranger: { simple: true, martial: true },
  stregone: null,
  warlock: { simple: true },
};

// Classi il cui multiclasse concede una competenza extra in un'abilità (a scelta dalla lista della classe).
export const MULTICLASS_BONUS_SKILL_CLASS = ["bardo", "ladro", "ranger"];

export const BASE_CLASS_FEATURES = {
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

export const FIGHTING_STYLES = {
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
export const FIGHTING_STYLE_CLASSES = ["guerriero", "paladino", "ranger"];

// Livello in cui ogni classe ottiene lo Stile di Combattimento
export const FIGHTING_STYLE_LEVEL = {
  guerriero: 1,
  paladino: 2,
  ranger: 2,
};
