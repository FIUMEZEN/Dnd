import React from 'react';

// Creiamo un componente vuoto riutilizzabile
const EmptyIcon = (props) => (
  <span style={{ display: 'inline-block', width: '1em', height: '1em' }} {...props} />
);

// Esportiamo esattamente le icone che il tuo codice sta cercando
export const Sword = EmptyIcon;
export const Shield = EmptyIcon;
export const Wand2 = EmptyIcon;
export const ScrollText = EmptyIcon;
export const Users = EmptyIcon;
export const Save = EmptyIcon;
export const Trash2 = EmptyIcon;
export const Plus = EmptyIcon;
export const ChevronLeft = EmptyIcon;
export const ChevronRight = EmptyIcon;
export const Dices = EmptyIcon;
export const BookOpen = EmptyIcon;
export const Crown = EmptyIcon;
export const Feather = EmptyIcon;
export const Backpack = EmptyIcon; // 👈 Questo risolverà l'errore specifico
export const Check = EmptyIcon;
export const X = EmptyIcon;
export const Sparkles = EmptyIcon;
export const Skull = EmptyIcon;
export const Loader2 = EmptyIcon;
export const Pencil = EmptyIcon;

// Esportazione di default di sicurezza
export default EmptyIcon;
