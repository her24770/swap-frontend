import { routing } from './routing';

/**
 * Removes the locale prefix from a pathname.
 * Examples:
 * - "/es/login" -> "/login"
 * - "/en" -> "/"
 */
export function stripLocalePrefix(pathname: string): string {
  const parts = pathname.split('/');
  const maybeLocale = parts[1];

  if (maybeLocale && routing.locales.includes(maybeLocale as any)) {
    const rest = parts.slice(2).join('/');
    return rest ? `/${rest}` : '/';
  }

  return pathname;
}
