export const FEATS = [
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
