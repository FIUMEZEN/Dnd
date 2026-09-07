import { CREATURES_STORAGE_KEY, STORAGE_KEY, storageAdapter } from "./storage";

const BACKUP_VERSION = 1;

// Chiede al browser di NON eliminare i dati del sito sotto pressione di spazio (best-effort:
// alcuni browser lo concedono automaticamente, altri no, e nessuno lo garantisce contro un
// "cancella dati di navigazione" manuale — per quello serve comunque il backup su file).
export function requestPersistentStorage() {
  try {
    navigator.storage?.persist?.();
  } catch {
    // Ignorato: è solo un tentativo "if possible", mai bloccante.
  }
}

// Scarica un file .json con i personaggi e le creature salvati sul dispositivo: un backup che
// sopravvive a una cancellazione dei dati del browser, perché non è "dati del sito" ma un file
// vero e proprio sul disco. Senza filtri esporta tutto; passando characterIds/creatureIds
// esporta solo le voci con quegli id (singolo elemento o una selezione qualsiasi).
export async function exportBackup({ characterIds, creatureIds } = {}) {
  const charactersRes = await storageAdapter.get(STORAGE_KEY, "[]");
  const creaturesRes = await storageAdapter.get(CREATURES_STORAGE_KEY, "[]");
  let characters = JSON.parse(charactersRes.value || "[]");
  let creatures = JSON.parse(creaturesRes.value || "[]");
  if (characterIds) characters = characters.filter((c) => characterIds.includes(c.id));
  if (creatureIds) creatures = creatures.filter((c) => creatureIds.includes(c.id));
  const payload = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    characters,
    creatures,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `dnd-backup-${payload.exportedAt.slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return payload;
}

function mergeById(existing, incoming) {
  const byId = new Map(existing.map((item) => [item.id, item]));
  incoming.forEach((item) => { if (item && item.id) byId.set(item.id, item); });
  return [...byId.values()];
}

// Importa un file di backup UNENDOLO ai dati già presenti: le voci del file con lo stesso id
// sovrascrivono quelle locali (utile per ripristinare una versione più recente), tutte le altre
// restano intatte. Non cancella mai nulla "a sorpresa".
export async function importBackup(file) {
  const text = await file.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error("Il file non è un backup valido (JSON non leggibile).");
  }
  if (!payload || (!Array.isArray(payload.characters) && !Array.isArray(payload.creatures))) {
    throw new Error("Il file non contiene un backup riconoscibile.");
  }

  const importedCharacters = Array.isArray(payload.characters) ? payload.characters : [];
  const importedCreatures = Array.isArray(payload.creatures) ? payload.creatures : [];

  const currentCharactersRes = await storageAdapter.get(STORAGE_KEY, "[]");
  const currentCreaturesRes = await storageAdapter.get(CREATURES_STORAGE_KEY, "[]");
  const mergedCharacters = mergeById(JSON.parse(currentCharactersRes.value || "[]"), importedCharacters);
  const mergedCreatures = mergeById(JSON.parse(currentCreaturesRes.value || "[]"), importedCreatures);

  await storageAdapter.set(STORAGE_KEY, JSON.stringify(mergedCharacters), "[]");
  await storageAdapter.set(CREATURES_STORAGE_KEY, JSON.stringify(mergedCreatures), "[]");

  return { charactersImported: importedCharacters.length, creaturesImported: importedCreatures.length };
}
