import test from "node:test";
import assert from "node:assert/strict";
import { CABINETS, toyList } from "../src/core/cabinets.js";
import { RARITY, TOYS, toyById } from "../src/core/toys.js";
import { cabinetBack, cabinetFront, clawSvg, sharedDefs, toyIcon, toySymbol } from "../src/ui/art.js";
import { assertWellFormed, idsIn } from "./support/svg.js";

function refsIn(svg) {
  return [
    ...[...svg.matchAll(/url\(#([^)]+)\)/g)].map((m) => m[1]),
    ...[...svg.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]),
  ];
}

test("every toy is a well-formed symbol with its own prefixed ids", () => {
  for (const toy of TOYS) {
    const svg = toySymbol(toy);
    assertWellFormed(svg, assert, toy.id);
    assert.match(svg, new RegExp(`^<symbol id="gt-toy-${toy.id}"`));
    for (const id of idsIn(svg)) assert.ok(id.startsWith("gt-"), `${toy.id}: id ${id} is not prefixed`);
  }
});

test("the shared defs have unique ids and every url(#…) in a toy points into them", () => {
  const defs = sharedDefs();
  assertWellFormed(defs, assert, "defs");
  const ids = idsIn(defs);
  assert.equal(new Set(ids).size, ids.length, "duplicate ids");
  for (const ref of refsIn(defs)) assert.ok(ids.includes(ref), `missing #${ref}`);
  for (const toy of TOYS) {
    const icon = toyIcon(toy, { hidden: true });
    assertWellFormed(icon, assert, `${toy.id} icon`);
    for (const ref of refsIn(icon)) assert.ok(ids.includes(ref), `${toy.id} icon: missing #${ref}`);
  }
});

test("every machine draws well-formed, and all its references resolve", () => {
  const claw = clawSvg();
  for (const cab of CABINETS) {
    const svg = `${cabinetBack(cab)}${claw}${cabinetFront(cab)}`;
    assertWellFormed(svg, assert, cab.id);
    const ids = idsIn(svg);
    assert.equal(new Set(ids).size, ids.length, `${cab.id}: duplicate ids`);
    for (const ref of refsIn(svg)) assert.ok(ids.includes(ref), `${cab.id}: missing #${ref}`);
    assert.ok(svg.includes(cab.name.toUpperCase()), `${cab.id}: marquee shows the machine name`);
  }
});

test("the claw has the parts the stage animates", () => {
  const ids = idsIn(clawSvg());
  for (const id of ["gt-claw", "gt-rope", "gt-carriage", "gt-head", "gt-finger-l", "gt-finger-r"]) {
    assert.ok(ids.includes(id), `missing ${id}`);
  }
});

test("the toy catalogue is consistent", () => {
  const ids = TOYS.map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate toy ids");
  for (const toy of TOYS) {
    assert.ok(RARITY[toy.rarity], `${toy.id}: unknown rarity`);
    assert.ok(toy.r >= 15 && toy.r <= 30, `${toy.id}: radius ${toy.r}`);
    assert.ok(toy.grip > 0 && toy.grip <= 1, `${toy.id}: grip`);
    assert.ok(toy.name && toy.blurb, `${toy.id}: name and blurb`);
  }
  for (const rarity of Object.keys(RARITY)) {
    assert.ok(TOYS.some((t) => t.rarity === rarity), `no ${rarity} toy`);
  }
});

test("every machine holds known toys, and every toy lives in at least one machine", () => {
  const everywhere = new Set();
  for (const cab of CABINETS) {
    for (const id of toyList(cab)) {
      toyById(id);
      everywhere.add(id);
    }
    assert.equal(cab.targets.length, 3);
    assert.deepEqual([...cab.targets].sort((a, b) => a - b), cab.targets, `${cab.id}: targets ascend`);
  }
  for (const toy of TOYS) assert.ok(everywhere.has(toy.id), `${toy.id} is in no machine`);
});
