import React from 'react';

const baseProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

function Icon({ children, size = 16, ...props }) {
  return (
    <svg
      {...baseProps}
      width={size}
      height={size}
      {...props}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        color: 'inherit',
        opacity: 0.96,
        ...props.style,
      }}
    >
      {children}
    </svg>
  );
}

export const Sword = (props) => (
  <Icon {...props}><path d="M7 4h10l-2 4 5 5-3 3-5-5-4 2-1-9Zm-2 14h12M9 20l2-6" /></Icon>
);
export const Shield = (props) => (
  <Icon {...props}><path d="M12 3l7 3v6c0 4.2-2.9 7.4-7 9-4.1-1.6-7-4.8-7-9V6l7-3Z" /><path d="M9 12l2 2 4-4" /></Icon>
);
export const Wand2 = (props) => (
  <Icon {...props}><path d="M14 4l6 6-4 4-6-6 4-4Zm-6 6 6 6M6 18l-2 2 2 2 2-2-2-2Z" /></Icon>
);
export const ScrollText = (props) => (
  <Icon {...props}><path d="M6 4h10a2 2 0 0 1 2 2v12H8a2 2 0 0 0-2 2V4Zm0 0v14" /><path d="M8 8h8M8 12h6" /></Icon>
);
export const Users = (props) => (
  <Icon {...props}><path d="M16 19v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1" /><circle cx="10" cy="7" r="3" /><path d="M20 19v-1a4 4 0 0 0-3-3.87M16 4.13a4 4 0 0 1 0 7.75" /></Icon>
);
export const Save = (props) => (
  <Icon {...props}><path d="M5 4h10l4 4v12H5V4Z" /><path d="M9 4v5h6V4M9 18h6" /></Icon>
);
export const Trash2 = (props) => (
  <Icon {...props}><path d="M4 7h16M8 7V4h8v3M6 7l1 11h10l1-11" /><path d="M10 11v5M14 11v5" /></Icon>
);
export const Plus = (props) => (
  <Icon {...props}><path d="M12 5v14M5 12h14" /></Icon>
);
export const ChevronLeft = (props) => (
  <Icon {...props}><path d="m15 18-6-6 6-6" /></Icon>
);
export const ChevronRight = (props) => (
  <Icon {...props}><path d="m9 18 6-6-6-6" /></Icon>
);
export const Dices = (props) => (
  <Icon {...props}><rect x="4" y="5" width="16" height="14" rx="2" /><path d="M9 9h.01M15 9h.01M9 15h.01M15 15h.01" /><path d="m8 18 8-12" /></Icon>
);
export const BookOpen = (props) => (
  <Icon {...props}><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H20v15H6.5A2.5 2.5 0 0 0 4 21.5V6.5Z" /><path d="M4 6.5V19M20 4v15" /></Icon>
);
export const Crown = (props) => (
  <Icon {...props}><path d="m4 18 2-10 5 5 3-8 3 8 5-5 2 10H4Z" /><path d="M7 18v2h10v-2" /></Icon>
);
export const Feather = (props) => (
  <Icon {...props}><path d="M5 14c8-8 12-8 15-8-1 5-1 9-7 15-6 0-8-2-8-7Z" /><path d="M8 16c1 1 4 2 6 1" /></Icon>
);
export const Backpack = (props) => (
  <Icon {...props}><path d="M8 7V6a4 4 0 1 1 8 0v1" /><path d="M5 8h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" /><path d="M9 12h6" /></Icon>
);
export const Check = (props) => (
  <Icon {...props}><path d="m5 12 4 4 10-10" /></Icon>
);
export const X = (props) => (
  <Icon {...props}><path d="m6 6 12 12M18 6 6 18" /></Icon>
);
export const Sparkles = (props) => (
  <Icon {...props}><path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Zm6 12 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3ZM6 15l.8 2.2L9 18l-2.2.8L6 21l-.8-2.2L3 18l2.2-.8L6 15Z" /></Icon>
);
export const Skull = (props) => (
  <Icon {...props}><path d="M9 17c1 .8 2.2 1 3 1s2-.2 3-1" /><circle cx="9" cy="10" r="1.5" /><circle cx="15" cy="10" r="1.5" /><path d="M5 12a7 7 0 1 1 14 0v4a2 2 0 0 1-2 2h-1l-1 2H9l-1-2H7a2 2 0 0 1-2-2v-4Z" /></Icon>
);
export const Loader2 = (props) => (
  <Icon {...props}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /><circle cx="12" cy="12" r="3" /></Icon>
);
export const Pencil = (props) => (
  <Icon {...props}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" /></Icon>
);

export default {
  Sword,
  Shield,
  Wand2,
  ScrollText,
  Users,
  Save,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Dices,
  BookOpen,
  Crown,
  Feather,
  Backpack,
  Check,
  X,
  Sparkles,
  Skull,
  Loader2,
  Pencil,
};
