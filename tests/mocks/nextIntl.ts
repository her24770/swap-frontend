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
