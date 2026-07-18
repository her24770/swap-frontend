import { afterEach, describe, expect, it } from "vitest";
import { normalizeImageUrl } from "../../src/lib/imageUrl";

const ORIGINAL_API_URL = process.env.NEXT_PUBLIC_API_URL;

afterEach(() => {
  process.env.NEXT_PUBLIC_API_URL = ORIGINAL_API_URL;
});

describe("normalizeImageUrl", () => {
  it("returns an empty string when the value is empty or only whitespace", () => {
    expect(normalizeImageUrl("")).toBe("");
    expect(normalizeImageUrl("   ")).toBe("");
  });

  it("keeps absolute URLs unchanged after trimming them", () => {
    expect(normalizeImageUrl(" https://cdn.swap.test/image.png ")).toBe(
      "https://cdn.swap.test/image.png"
    );
  });

  it("prefixes relative paths with the configured API URL", () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.swap.test/";

    expect(normalizeImageUrl("/uploads/photo.webp")).toBe(
      "https://api.swap.test/uploads/photo.webp"
    );
    expect(normalizeImageUrl("uploads/photo.webp")).toBe(
      "https://api.swap.test/uploads/photo.webp"
    );
  });
});
