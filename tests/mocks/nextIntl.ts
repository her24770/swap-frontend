export function useLocale() {
  return "es";
}

export function useTranslations() {
  return (key: string) => key;
}

export function useFormatter() {
  return {
    relativeTime: (date: Date) => date.toISOString(),
  };
}

export function useNow() {
  return new Date("2026-01-01T00:00:00.000Z");
}
