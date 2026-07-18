import { vi } from "vitest";

export function installBrowserMocks() {
  Object.defineProperty(globalThis, "IntersectionObserver", {
    writable: true,
    value: class IntersectionObserverMock implements IntersectionObserver {
      readonly root = null;
      readonly rootMargin = "";
      readonly thresholds = [];

      disconnect() {}
      observe() {}
      takeRecords() {
        return [];
      }
      unobserve() {}
    },
  });

  Object.defineProperty(globalThis, "ResizeObserver", {
    writable: true,
    value: class ResizeObserverMock implements ResizeObserver {
      disconnect() {}
      observe() {}
      unobserve() {}
    },
  });

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}
