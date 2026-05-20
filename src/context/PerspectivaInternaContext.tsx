"use client";

import { createContext, useContext, type ReactNode } from "react";

export type PerfilPerspectivaMode = "consumidor" | "vendedor" | "tutor";
export type PerfilVista = "interno" | "externo";

interface PerspectivaInternaContextValue {
  isOwnProfile: boolean;
  profileView: PerfilVista;
  activeProfileMode?: PerfilPerspectivaMode;
  canEditCards: boolean;
  canEditProfile: boolean;
  canCreatePublication: boolean;
  canViewConsumerSection: boolean;
  canViewCommentsSection: boolean;
}

const defaultPerspectiva: PerspectivaInternaContextValue = {
  isOwnProfile: false,
  profileView: "externo",
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
  profileView?: PerfilVista;
  activeProfileMode?: PerfilPerspectivaMode;
  children: ReactNode;
}

export function PerspectivaInternaProvider({
  isOwnProfile,
  profileView = isOwnProfile ? "interno" : "externo",
  activeProfileMode,
  children,
}: PerspectivaInternaProviderProps) {
  const isEditableProfileMode =
    activeProfileMode === "vendedor" || activeProfileMode === "tutor";

  const value: PerspectivaInternaContextValue = {
    isOwnProfile,
    profileView,
    activeProfileMode,
    canEditCards: profileView === "interno" && isOwnProfile && isEditableProfileMode,
    canEditProfile: profileView === "interno" && isOwnProfile,
    canCreatePublication: profileView === "interno" && isOwnProfile && isEditableProfileMode,
    canViewConsumerSection: profileView === "interno" && isOwnProfile,
    canViewCommentsSection: profileView === "interno" && isOwnProfile,
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
