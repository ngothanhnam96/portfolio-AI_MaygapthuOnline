import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { esc } from "../src/core/text.js";

test("player text is escaped before it reaches the markup", () => {
  assert.equal(esc(`<img src=x onerror="alert('hi')">&`), "&lt;img src=x onerror=&quot;alert(&#39;hi&#39;)&quot;&gt;&amp;");
  assert.equal(esc("Nam Ngô"), "Nam Ngô");
  assert.equal(esc(null), "");
  assert.equal(esc(42), "42");
});

test("main.js only puts the player's name into HTML through esc()", async () => {
  const src = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
  const uses = [...src.matchAll(/\$\{([^}]*progress\.name[^}]*)\}/g)].map((m) => m[1]);
  assert.ok(uses.length >= 2, "the name is shown on the home and result screens");
  const raw = uses.filter((expr) => !expr.includes("esc("));
  assert.deepEqual(raw, [], "a name is interpolated without esc()");
});
