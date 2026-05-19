"use client";

import { createContext, useContext, type ReactNode } from "react";

interface CanEditContextValue {
  canEdit: boolean;
}

const CanEditContext = createContext<CanEditContextValue>({ canEdit: false });

interface CanEditProviderProps {
  canEdit: boolean;
  children: ReactNode;
}

export function CanEditProvider({ canEdit, children }: CanEditProviderProps) {
  return (
    <CanEditContext.Provider value={{ canEdit }}>
      {children}
    </CanEditContext.Provider>
  );
}

export function useCanEdit() {
  return useContext(CanEditContext);
}
