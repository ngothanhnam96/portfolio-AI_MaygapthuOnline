import test from "node:test";
import assert from "node:assert/strict";
import { BONUS, clearBonus, multiplier, scoreDrop, starsFor } from "../src/core/score.js";
import { RARITY } from "../src/core/toys.js";

test("combo multiplier climbs by half a step and caps at ×3", () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6, 10].map(multiplier), [1, 1, 1.5, 2, 2.5, 3, 3, 3]);
});

test("a drop with no wins scores nothing", () => {
  assert.deepEqual(scoreDrop([], 0), { total: 0, lines: [] });
});

test("toy points follow rarity and the combo", () => {
  const one = scoreDrop([{ toy: "rong", lucky: false }], 1);
  assert.equal(one.total, RARITY.legend.points);
  const third = scoreDrop([{ toy: "meo", lucky: false }], 3);
  assert.equal(third.total, RARITY.common.points * 2);
});

test("lucky and double catches add their bonuses and explain them", () => {
  const r = scoreDrop([{ toy: "meo", lucky: false }, { toy: "ca", lucky: true }], 1);
  assert.equal(r.total, RARITY.common.points + RARITY.rare.points + BONUS.lucky + BONUS.double);
  assert.deepEqual(r.lines.map((l) => l.kind), ["toy", "toy", "lucky", "double"]);
});

test("clear bonus pays for every unused coin", () => {
  assert.equal(clearBonus(0), BONUS.clear);
  assert.equal(clearBonus(3), BONUS.clear + 3 * BONUS.coin);
});

test("stars count the targets reached", () => {
  const t = [50, 120, 190];
  assert.deepEqual([0, 49, 50, 119, 120, 190, 999].map((s) => starsFor(s, t)), [0, 0, 1, 1, 2, 3, 3]);
});
