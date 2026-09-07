import { useState, useEffect, useCallback } from "react";
import { C, FONT_IMPORT } from "./theme";
import { emptyDraft, validateCharacter } from "./lib/character";
import { emptyCreature, instantiateFromBestiary, validateCreature } from "./lib/creature";
import { emptyEncounter } from "./lib/encounter";
import { STORAGE_KEY, CREATURES_STORAGE_KEY, ENCOUNTER_STORAGE_KEY, storageAdapter } from "./lib/storage";
import { requestPersistentStorage } from "./lib/backup";
import { BackupControl } from "./components/BackupControl";
import { PlayerSheet } from "./components/PlayerSheet";
import { SpellCompendium } from "./components/SpellCompendium";
import { CharacterList } from "./components/CharacterList";
import { Creator } from "./components/Creator";
import { MasterDashboard } from "./components/MasterDashboard";
import { CreatureEditor } from "./components/CreatureEditor";
import { CreatureSheetView } from "./components/CreatureSheetView";
import { Bestiary } from "./components/Bestiary";
import { EncounterRunner } from "./components/EncounterRunner";

/* ---------------------------------- APP ---------------------------------- */

export default function App() {
  const [screen, setScreen] = useState("list");
  const [compendiumFrom, setCompendiumFrom] = useState("list");
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState(emptyDraft());
  const [sheetCharacter, setSheetCharacter] = useState(null);
  const [toast, setToast] = useState(null);

  const [creatures, setCreatures] = useState([]);
  const [creaturesLoading, setCreaturesLoading] = useState(true);
  const [creatureSaving, setCreatureSaving] = useState(false);
  const [creatureDraft, setCreatureDraft] = useState(emptyCreature());
  const [sheetCreature, setSheetCreature] = useState(null);

  const [encounter, setEncounterState] = useState(emptyEncounter());
  const [encounterLoading, setEncounterLoading] = useState(true);

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

  const loadCreatures = useCallback(async () => {
    setCreaturesLoading(true);
    try {
      const res = await storageAdapter.get(CREATURES_STORAGE_KEY, false);
      const list = res && res.value ? JSON.parse(res.value) : [];
      setCreatures(Array.isArray(list) ? list : []);
    } catch (e) {
      setCreatures([]);
    } finally {
      setCreaturesLoading(false);
    }
  }, []);

  const loadEncounter = useCallback(async () => {
    setEncounterLoading(true);
    try {
      const res = await storageAdapter.get(ENCOUNTER_STORAGE_KEY, false);
      const value = res && res.value ? JSON.parse(res.value) : null;
      setEncounterState(value || emptyEncounter());
    } catch (e) {
      setEncounterState(emptyEncounter());
    } finally {
      setEncounterLoading(false);
    }
  }, []);

  useEffect(() => { loadCharacters(); }, [loadCharacters]);
  useEffect(() => { loadCreatures(); }, [loadCreatures]);
  useEffect(() => { loadEncounter(); }, [loadEncounter]);
  useEffect(() => { requestPersistentStorage(); }, []);

  // L'Incontro cambia ad ogni clic in combattimento (danno, iniziativa, turno): si salva da
  // solo appena cambia, invece di richiedere un "Salva" esplicito come la Scheda Personaggio —
  // qui la priorità è non perdere mai lo stato di un combattimento in corso.
  useEffect(() => {
    if (encounterLoading) return;
    storageAdapter.set(ENCOUNTER_STORAGE_KEY, JSON.stringify(encounter), false);
  }, [encounter, encounterLoading]);

  const setEncounter = useCallback((updater) => {
    setEncounterState((prev) => (typeof updater === "function" ? updater(prev) : updater));
  }, []);

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

  const handleNewCreature = () => {
    setCreatureDraft(emptyCreature());
    setScreen("master-edit");
  };

  const handleUseBestiaryEntry = (entry) => {
    setCreatureDraft(instantiateFromBestiary(entry));
    setScreen("master-edit");
  };

  const handleOpenCreature = (cr) => {
    setCreatureDraft({ ...emptyCreature(), ...cr });
    setScreen("master-edit");
  };

  const handleOpenCreatureSheet = (cr) => {
    setSheetCreature({ ...emptyCreature(), ...cr });
    setScreen("master-sheet");
  };

  const handleSaveCreatureSheetChanges = async (updatedCreature) => {
    try {
      const next = creatures.map((c) => (c.id === updatedCreature.id ? updatedCreature : c));
      const result = await storageAdapter.set(CREATURES_STORAGE_KEY, JSON.stringify(next), false);
      if (!result) throw new Error("save failed");
      setCreatures(next);
      setSheetCreature(updatedCreature);
      showToast("Modifiche salvate.");
    } catch (e) {
      showToast("Errore durante il salvataggio. Riprova.");
    }
  };

  const handleDeleteCreature = async (id) => {
    const next = creatures.filter((c) => c.id !== id);
    setCreatures(next);
    try {
      await storageAdapter.set(CREATURES_STORAGE_KEY, JSON.stringify(next), false);
      showToast("Creatura eliminata.");
    } catch (e) {
      showToast("Non è stato possibile eliminare la creatura.");
      loadCreatures();
    }
  };

  const handleSaveCreature = async () => {
    const errors = validateCreature(creatureDraft);
    if (errors.length) { showToast(errors[0]); return; }
    setCreatureSaving(true);
    try {
      const id = creatureDraft.id || `creature_${Date.now()}`;
      const toSave = { ...creatureDraft, id };
      const existingIdx = creatures.findIndex((c) => c.id === id);
      const next = existingIdx >= 0
        ? creatures.map((c, i) => (i === existingIdx ? toSave : c))
        : [...creatures, toSave];
      const result = await storageAdapter.set(CREATURES_STORAGE_KEY, JSON.stringify(next), false);
      if (!result) throw new Error("save failed");
      setCreatures(next);
      setCreatureDraft(toSave);
      showToast("Creatura salvata.");
      setScreen("master");
    } catch (e) {
      showToast("Errore durante il salvataggio. Riprova.");
    } finally {
      setCreatureSaving(false);
    }
  };

  // Aggiornamenti "silenziosi" (nessun toast) usati dall'Incontro: durante un combattimento,
  // PF/Concentrazione/TS contro la Morte cambiano ad ogni clic, e un toast per ognuno sarebbe
  // solo rumore. Scrivono comunque subito su storage, a differenza della Scheda Personaggio
  // (dove le modifiche restano in un draft locale finché non si preme "Salva modifiche").
  const handleUpdateCharacterSilent = async (updatedCharacter) => {
    const next = characters.map((c) => (c.id === updatedCharacter.id ? updatedCharacter : c));
    setCharacters(next);
    try {
      await storageAdapter.set(STORAGE_KEY, JSON.stringify(next), false);
    } catch (e) {
      showToast("Errore durante il salvataggio del personaggio.");
    }
  };
  const handleUpdateCreatureSilent = async (updatedCreature) => {
    const next = creatures.map((c) => (c.id === updatedCreature.id ? updatedCreature : c));
    setCreatures(next);
    try {
      await storageAdapter.set(CREATURES_STORAGE_KEY, JSON.stringify(next), false);
    } catch (e) {
      showToast("Errore durante il salvataggio della creatura.");
    }
  };

  const openCompendium = (from) => {
    setCompendiumFrom(from);
    setScreen("compendium");
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

      <BackupControl
        onImported={({ charactersImported, creaturesImported }) => {
          loadCharacters();
          loadCreatures();
          showToast(`Backup importato: ${charactersImported} personaggi, ${creaturesImported} creature.`);
        }}
        onError={(msg) => showToast(msg)}
      />

      {screen === "list" && (
        <CharacterList
          characters={characters}
          loading={loading}
          onNew={handleNew}
          onOpen={handleOpen}
          onOpenSheet={handleOpenSheet}
          onDelete={handleDelete}
          onOpenCompendium={() => openCompendium("list")}
          onOpenMaster={() => setScreen("master")}
        />
      )}

      {screen === "compendium" && (
        <SpellCompendium onBack={() => setScreen(compendiumFrom)} />
      )}

      {screen === "master" && (
        <MasterDashboard
          creatures={creatures}
          loading={creaturesLoading}
          onBack={() => setScreen("list")}
          onNew={handleNewCreature}
          onOpen={handleOpenCreature}
          onOpenSheet={handleOpenCreatureSheet}
          onDelete={handleDeleteCreature}
          onOpenCompendium={() => openCompendium("master")}
          onOpenBestiary={() => setScreen("bestiary")}
          onOpenEncounter={() => setScreen("encounter")}
        />
      )}

      {screen === "bestiary" && (
        <Bestiary onBack={() => setScreen("master")} onUse={handleUseBestiaryEntry} />
      )}

      {screen === "encounter" && (
        <EncounterRunner
          encounter={encounter}
          setEncounter={setEncounter}
          characters={characters}
          creatures={creatures}
          onUpdateCharacter={handleUpdateCharacterSilent}
          onUpdateCreature={handleUpdateCreatureSilent}
          onBack={() => setScreen("master")}
        />
      )}

      {screen === "master-edit" && (
        <CreatureEditor
          creature={creatureDraft}
          setCreature={setCreatureDraft}
          onBack={() => setScreen("master")}
          onSave={handleSaveCreature}
          saving={creatureSaving}
        />
      )}

      {screen === "master-sheet" && sheetCreature && (
        <CreatureSheetView
          creature={sheetCreature}
          onBack={() => setScreen("master")}
          onSaveChanges={handleSaveCreatureSheetChanges}
        />
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
