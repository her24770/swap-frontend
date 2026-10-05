import { describe, expect, it } from "vitest";
import { useTranslations } from "next-intl";
import { render, screen } from "../utils/render";

function TranslationProbe() {
  const t = useTranslations("common.search");

  return <span>{t("placeholder")}</span>;
}

describe("test environment", () => {
  it("loads jest-dom matchers and shared next-intl mocks", () => {
    render(<TranslationProbe />);

    expect(screen.getByText("placeholder")).toBeInTheDocument();
  });

  it("installs shared browser API mocks", () => {
    expect(window.matchMedia("(min-width: 768px)").matches).toBe(false);
    expect(globalThis.IntersectionObserver).toBeDefined();
    expect(globalThis.ResizeObserver).toBeDefined();
  });
});
