import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import { installBrowserMocks } from "../mocks/browser";
import { resetNextNavigationMocks } from "../mocks/nextNavigation";

installBrowserMocks();

vi.mock("next-intl", async () => await import("../mocks/nextIntl"));
vi.mock("next/navigation", async () => await import("../mocks/nextNavigation"));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  resetNextNavigationMocks();
});
