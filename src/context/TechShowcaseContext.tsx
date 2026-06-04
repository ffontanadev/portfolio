// Context files conventionally export both a Provider component and a hook —
// disable the react-refresh rule that flags non-component exports.
/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { TechItem } from '@/components/Hero/techCatalog';

interface TechShowcaseValue {
  /** The technology whose logo is currently shown, or null. */
  selected: TechItem | null;
  /** Select a technology — triggers the hero particle-logo mode. */
  select: (tech: TechItem) => void;
  /** Dismiss the showcase and resume the ambient particle loop. */
  clear: () => void;
}

const TechShowcaseContext = createContext<TechShowcaseValue | null>(null);

export function TechShowcaseProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<TechItem | null>(null);

  const select = useCallback((tech: TechItem) => setSelected(tech), []);
  const clear = useCallback(() => setSelected(null), []);

  const value = useMemo<TechShowcaseValue>(
    () => ({ selected, select, clear }),
    [selected, select, clear],
  );

  return (
    <TechShowcaseContext.Provider value={value}>
      {children}
    </TechShowcaseContext.Provider>
  );
}

export function useTechShowcase(): TechShowcaseValue {
  const ctx = useContext(TechShowcaseContext);
  if (!ctx) {
    throw new Error('useTechShowcase must be used within a TechShowcaseProvider');
  }
  return ctx;
}
