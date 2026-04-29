#!/usr/bin/env node
// Preflight: ensures src/routeTree.gen.ts exists. The TanStack Router Vite
// plugin normally regenerates it, but if it's missing at the moment Vite
// resolves src/router.tsx the dev server hard-fails. We write a minimal stub
// (importing from a tiny generator) so the plugin can take over and overwrite
// it on the next file scan.
import { existsSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const routesDir = join(root, "src", "routes");
const target = join(root, "src", "routeTree.gen.ts");
const publicDir = join(root, "public");

if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });

if (existsSync(target)) {
  console.log("[preflight] routeTree.gen.ts present");
  process.exit(0);
}

console.log("[preflight] routeTree.gen.ts missing — generating stub from src/routes/");

function walk(dir, prefix = "") {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) out.push(...walk(join(dir, entry.name), `${prefix}${entry.name}/`));
    else if (/\.tsx?$/.test(entry.name)) out.push(prefix + entry.name.replace(/\.tsx?$/, ""));
  }
  return out;
}

const files = walk(routesDir).filter(f => f !== "__root");

function toRoutePath(file) {
  if (file === "index") return "/";
  return "/" + file.replace(/\./g, "/").replace(/\$/g, "$");
}
function toIdent(file) {
  return file.split(/[./]/).map(p => p.replace(/\$/g, "").replace(/^./, c => c.toUpperCase())).join("") + "Route";
}

const imports = files.map(f => `import { Route as ${toIdent(f)}Import } from './routes/${f}'`).join("\n");
const decls = files.map(f => {
  const p = toRoutePath(f);
  return `const ${toIdent(f)} = ${toIdent(f)}Import.update({ id: '${p}', path: '${p}', getParentRoute: () => rootRouteImport } as any)`;
}).join("\n");
const children = files.map(f => `  ${toIdent(f)}`).join(",\n");

const out = `/* eslint-disable */
// @ts-nocheck
// Auto-generated stub by scripts/ensure-route-tree.mjs.
// The TanStack Router plugin will regenerate this file on the next dev cycle.
import { Route as rootRouteImport } from './routes/__root'
${imports}

${decls}

const rootRouteChildren = {
${children},
}

export const routeTree = rootRouteImport._addFileChildren(rootRouteChildren)._addFileTypes()
`;
writeFileSync(target, out);
console.log(`[preflight] wrote stub with ${files.length} routes`);
