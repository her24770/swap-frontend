"use client";

import { createContext, useContext, type ReactNode } from "react";

export type PerfilPerspectivaMode = "consumidor" | "vendedor" | "tutor";

interface PerspectivaInternaContextValue {
  isOwnProfile: boolean;
  activeProfileMode?: PerfilPerspectivaMode;
  canEditCards: boolean;
  canEditProfile: boolean;
  canCreatePublication: boolean;
  canViewConsumerSection: boolean;
  canViewCommentsSection: boolean;
}

const defaultPerspectiva: PerspectivaInternaContextValue = {
  isOwnProfile: false,
  activeProfileMode: undefined,
  canEditCards: false,
  canEditProfile: false,
  canCreatePublication: false,
  canViewConsumerSection: false,
  canViewCommentsSection: false,
};

const PerspectivaInternaContext =
  createContext<PerspectivaInternaContextValue>(defaultPerspectiva);

interface PerspectivaInternaProviderProps {
  isOwnProfile: boolean;
  activeProfileMode?: PerfilPerspectivaMode;
  children: ReactNode;
}

export function PerspectivaInternaProvider({
  isOwnProfile,
  activeProfileMode,
  children,
}: PerspectivaInternaProviderProps) {
  const isEditableProfileMode =
    activeProfileMode === "vendedor" || activeProfileMode === "tutor";

  const value: PerspectivaInternaContextValue = {
    isOwnProfile,
    activeProfileMode,
    canEditCards: isOwnProfile && isEditableProfileMode,
    canEditProfile: isOwnProfile,
    canCreatePublication: isOwnProfile && isEditableProfileMode,
    canViewConsumerSection: isOwnProfile,
    canViewCommentsSection: isOwnProfile,
  };

  return (
    <PerspectivaInternaContext.Provider value={value}>
      {children}
    </PerspectivaInternaContext.Provider>
  );
}

export function usePerspectivaInterna() {
  return useContext(PerspectivaInternaContext);
}
