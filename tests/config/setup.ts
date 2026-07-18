import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import { installBrowserMocks } from "../mocks/browser";
import { resetNextNavigationMocks } from "../mocks/nextNavigation";

installBrowserMocks();

vi.mock("next-intl", async () => await import("../mocks/nextIntl"));
vi.mock("next/navigation", async () => await import("../mocks/nextNavigation"));
vi.mock("next/link", async () => await import("../mocks/nextLink"));

afterEach(async () => {
  cleanup();
  vi.clearAllMocks();
  resetNextNavigationMocks();
  const { resetStores } = await import("../utils/stores");
  resetStores();
});
