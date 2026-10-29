import { vi } from "vitest";

export const routerMock = {
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
  replace: vi.fn(),
};

export function usePathname() {
  return "/";
}

export function useRouter() {
  return routerMock;
}

export function useSearchParams() {
  return new URLSearchParams();
}

export function resetNextNavigationMocks() {
  Object.values(routerMock).forEach((mock) => mock.mockReset());
}

export const redirectMock = vi.fn();

/** Mock de `createNavigation` de next-intl para no cargar su módulo real en los tests. */
export function createNavigation() {
  return {
    Link: "a",
    redirect: redirectMock,
    usePathname,
    useRouter,
  };
}
