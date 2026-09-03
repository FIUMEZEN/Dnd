import { ARTISAN_TOOLS, GAMING_SETS, MUSICAL_INSTRUMENTS, SKILL_ABILITY, LANGUAGES } from "./core";

// Feature del Circolo della Terra (condivisa tra tutte le voci druido)
export const DRUID_CIRCLE_LAND_FEATURES = [
  { level: 2, name: "Recupero Naturale", desc: "Durante un riposo breve, una volta al giorno, puoi recuperare slot incantesimo con livello totale pari a metà del tuo livello da Druido (arrotondato per eccesso), nessuno di 6° livello o superiore." },
  { level: 6, name: "Passo della Natura", desc: "Il terreno difficile creato da piante non ti costa movimento extra; hai vantaggio ai TS contro piante create o manipulate magicamente per ostacolarti." },
  { level: 10, name: "Protezione della Natura", desc: "Sei immune alla condizione avvelenato e alle malattie; non puoi essere affascinato o spaventato da elementali o fate." },
  { level: 14, name: "Rifugio della Natura", desc: "Bestie e piante devono superare un TS di Saggezza (CD = la tua CD degli incantesimi) per attaccarti; se falliscono, devono scegliere un altro bersaglio se possibile." },
];

export const SUBCLASSES = {
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
      proficiencyChoices: [{ key: "sub-bardo-tradizione-abilita", label: "Abilità (Competenze Bonus)", type: "skill", count: 3, options: Object.keys(SKILL_ABILITY) }],
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
      bonusProficiencies: { armor: ["Armatura media", "Scudi"], weapons: ["Armi da guerra"] },
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
