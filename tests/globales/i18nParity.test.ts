import { describe, expect, it } from "vitest";
import esMessages from "../../messages/es.json";
import enMessages from "../../messages/en.json";
import frMessages from "../../messages/fr.json";

function getLeafKeys(obj: unknown, prefix = ""): string[] {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    return prefix ? [prefix] : [];
  }

  const entries = Object.entries(obj as Record<string, unknown>);
  return entries.flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return getLeafKeys(value, fullKey);
    }
    return [fullKey];
  });
}

describe("i18n locale parity", () => {
  const esKeys = getLeafKeys(esMessages).sort();
  const enKeys = getLeafKeys(enMessages).sort();
  const frKeys = getLeafKeys(frMessages).sort();

  it("messages/en.json should contain all keys defined in messages/es.json", () => {
    const missingInEn = esKeys.filter((key) => !enKeys.includes(key));
    expect(
      missingInEn,
      `Faltan ${missingInEn.length} claves en messages/en.json:\n${missingInEn.join("\n")}`
    ).toEqual([]);
  });

  it("messages/fr.json should contain all keys defined in messages/es.json", () => {
    const missingInFr = esKeys.filter((key) => !frKeys.includes(key));
    expect(
      missingInFr,
      `Faltan ${missingInFr.length} claves en messages/fr.json:\n${missingInFr.join("\n")}`
    ).toEqual([]);
  });

  it("messages/es.json should contain all keys defined in messages/en.json", () => {
    const extraInEn = enKeys.filter((key) => !esKeys.includes(key));
    expect(
      extraInEn,
      `Existen ${extraInEn.length} claves en messages/en.json que no existen en messages/es.json:\n${extraInEn.join("\n")}`
    ).toEqual([]);
  });

  it("messages/es.json should contain all keys defined in messages/fr.json", () => {
    const extraInFr = frKeys.filter((key) => !esKeys.includes(key));
    expect(
      extraInFr,
      `Existen ${extraInFr.length} claves en messages/fr.json que no existen en messages/es.json:\n${extraInFr.join("\n")}`
    ).toEqual([]);
  });

  it("all three locales (es, en, fr) have the exact same set of translation keys", () => {
    expect(enKeys).toEqual(esKeys);
    expect(frKeys).toEqual(esKeys);
  });
});
