import { vi } from "vitest";

export function installBrowserMocks() {
  const storage = (() => {
    let values: Record<string, string> = {};

    return {
      getItem: vi.fn((key: string) => values[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        values[key] = String(value);
      }),
      removeItem: vi.fn((key: string) => {
        delete values[key];
      }),
      clear: vi.fn(() => {
        values = {};
      }),
      key: vi.fn((index: number) => Object.keys(values)[index] ?? null),
      get length() {
        return Object.keys(values).length;
      },
    };
  })();

  Object.defineProperty(globalThis, "localStorage", {
    writable: true,
    value: storage,
  });

  Object.defineProperty(window, "localStorage", {
    writable: true,
    value: storage,
  });

  Object.defineProperty(globalThis, "requestAnimationFrame", {
    writable: true,
    value: (callback: FrameRequestCallback) => window.setTimeout(() => callback(Date.now()), 0),
  });

  Object.defineProperty(globalThis, "cancelAnimationFrame", {
    writable: true,
    value: (handle: number) => window.clearTimeout(handle),
  });

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

  Object.defineProperty(HTMLElement.prototype, "scrollBy", {
    writable: true,
    value: vi.fn(),
  });

  Object.defineProperty(HTMLElement.prototype, "scrollTo", {
    writable: true,
    value: vi.fn(),
  });

  // jsdom no implementa <dialog>.showModal()/close() (ver https://github.com/jsdom/jsdom/issues/3294),
  // asi que sin este polyfill el atributo "open" nunca se setea y Testing Library
  // trata el dialog como oculto, aunque el componente lo renderice correctamente.
  if (typeof HTMLDialogElement !== "undefined") {
    Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
      writable: true,
      value: function showModal(this: HTMLDialogElement) {
        this.setAttribute("open", "");
      },
    });

    Object.defineProperty(HTMLDialogElement.prototype, "close", {
      writable: true,
      value: function close(this: HTMLDialogElement) {
        this.removeAttribute("open");
        this.dispatchEvent(new Event("close"));
      },
    });
  }
}
