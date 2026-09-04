import { useRef } from "react";
import { Download, Upload } from "../icons";
import { C } from "../theme";
import { GhostButton } from "./primitives";
import { exportBackup, importBackup } from "../lib/backup";

// Barra sempre visibile in cima all'app: esporta/importa un file .json con tutti i personaggi e
// le creature salvati sul dispositivo, come rete di sicurezza contro una cancellazione dei dati
// del browser (localStorage non sopravvive a un "cancella dati di navigazione").
export function BackupControl({ onImported, onError }) {
  const fileInputRef = useRef(null);

  const handleExport = async () => {
    try {
      await exportBackup();
    } catch (e) {
      onError?.("Esportazione non riuscita. Riprova.");
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const result = await importBackup(file);
      onImported?.(result);
    } catch (err) {
      onError?.(err.message || "Importazione non riuscita.");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
      <GhostButton icon={Download} onClick={handleExport} style={{ borderColor: C.gold, color: C.gold, padding: "0.4rem 0.8rem", fontSize: 12.5 }}>
        Esporta backup
      </GhostButton>
      <GhostButton icon={Upload} onClick={handleImportClick} style={{ borderColor: C.gold, color: C.gold, padding: "0.4rem 0.8rem", fontSize: 12.5 }}>
        Importa backup
      </GhostButton>
      <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleFileChange} style={{ display: "none" }} />
    </div>
  );
}
