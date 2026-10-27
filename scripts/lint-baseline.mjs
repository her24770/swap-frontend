import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ESLint } from "eslint";

const root = fileURLToPath(new URL("../", import.meta.url));
const baselinePath = fileURLToPath(new URL("./lint-baseline.json", import.meta.url));
const eslint = new ESLint({ cwd: root });
const results = await eslint.lintFiles(".");
const current = new Map();
let warnings = 0;

for (const result of results) {
  if (!result.messages.length) continue;
  const file = path.relative(root, result.filePath).replaceAll(path.sep, "/");
  const lines = readFileSync(result.filePath, "utf8").split(/\r?\n/);
  for (const message of result.messages) {
    if (message.severity !== 2) {
      warnings++;
      continue;
    }
    // El texto de la línea mantiene estable la deuda cuando solo cambian
    // números de línea, y detecta errores nuevos del mismo tipo en el archivo.
    const source = lines[message.line - 1]?.trim() ?? "";
    const key = JSON.stringify([file, message.ruleId, source]);
    current.set(key, (current.get(key) ?? 0) + 1);
  }
}

const sorted = Object.fromEntries([...current].sort(([a], [b]) => a.localeCompare(b)));
if (process.argv.includes("--write-baseline")) {
  writeFileSync(baselinePath, `${JSON.stringify(sorted, null, 2)}\n`);
  console.log(`Línea base actualizada: ${[...current.values()].reduce((a, b) => a + b, 0)} errores heredados.`);
  process.exit(0);
}

const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
const nuevos = [...current].flatMap(([key, count]) => {
  const diferencia = count - (baseline[key] ?? 0);
  return diferencia > 0 ? [{ key: JSON.parse(key), count: diferencia }] : [];
});
const heredados = [...current].reduce((total, [key, count]) => total + Math.min(count, baseline[key] ?? 0), 0);
console.log(`ESLint: ${heredados} errores heredados, ${warnings} advertencias, ${nuevos.reduce((a, b) => a + b.count, 0)} errores nuevos.`);
for (const { key: [file, rule, source], count } of nuevos) {
  console.error(`${file}: ${rule} (${count}) — ${source}`);
}
if (nuevos.length) process.exitCode = 1;
