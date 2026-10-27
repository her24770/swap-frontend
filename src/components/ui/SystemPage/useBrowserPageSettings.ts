"use client";

import { useSyncExternalStore } from "react";
import type { Locale } from "./globalCopy";

const subscribe = () => () => {};
const serverLocale = (): Locale => "es";
const currentLocale = (): Locale => {
  const segment = window.location.pathname.split("/")[1];
  return segment === "en" || segment === "fr" ? segment : "es";
};
const serverTheme = () => "light";
const currentTheme = () => {
  try {
    return window.localStorage.getItem("theme") === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
};

export function useBrowserPageSettings() {
  const locale = useSyncExternalStore(subscribe, currentLocale, serverLocale);
  const theme = useSyncExternalStore(subscribe, currentTheme, serverTheme);
  return { locale, theme };
}
