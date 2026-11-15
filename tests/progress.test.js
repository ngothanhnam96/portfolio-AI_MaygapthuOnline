import test from "node:test";
import assert from "node:assert/strict";
import { CABINETS } from "../src/core/cabinets.js";
import {
  cleanName, cleanProgress, collected, emptyProgress, isUnlocked, recordRound, titleFor, totalStars,
} from "../src/core/progress.js";

const round = (over) => ({ cabinetId: "cho-dem", score: 80, stars: 1, caught: ["meo", "meo", "cun"], ...over });

test("a finished round fills the collection and counts duplicates", () => {
  const { progress, newToys, newBest } = recordRound(emptyProgress(), round());
  assert.deepEqual(progress.collection, { meo: 2, cun: 1 });
  assert.deepEqual(newToys.sort(), ["cun", "meo"]);
  assert.equal(newBest, true);
  const again = recordRound(progress, round({ caught: ["meo", "ga"], score: 40, stars: 0 }));
  assert.deepEqual(again.newToys, ["ga"]);
  assert.equal(again.progress.collection.meo, 3);
  assert.equal(again.newBest, false);
  assert.deepEqual(again.progress.best["cho-dem"], { score: 80, stars: 1 }, "a worse round keeps the best");
});

test("recording never mutates the old progress", () => {
  const before = emptyProgress();
  const frozen = JSON.stringify(before);
  recordRound(before, round());
  assert.equal(JSON.stringify(before), frozen);
});

test("machines unlock in order with one star on the one before", () => {
  let p = emptyProgress();
  assert.equal(isUnlocked(p, 0), true);
  assert.equal(isUnlocked(p, 1), false);
  p = recordRound(p, round({ stars: 0 })).progress;
  assert.equal(isUnlocked(p, 1), false, "playing without a star is not enough");
  p = recordRound(p, round({ stars: 1 })).progress;
  assert.equal(isUnlocked(p, 1), true);
  assert.equal(isUnlocked(p, 2), false);
});

test("titles and totals grow with stars", () => {
  let p = emptyProgress();
  assert.equal(titleFor(p), "Khách Qua Đường");
  for (const c of CABINETS) p = recordRound(p, round({ cabinetId: c.id, stars: 3, caught: [] })).progress;
  assert.equal(totalStars(p), CABINETS.length * 3);
  assert.equal(titleFor(p), "Vua Máy Gắp");
  assert.equal(collected(p), 0);
});

test("whatever storage returns is cleaned into valid progress", () => {
  assert.deepEqual(cleanProgress(null), emptyProgress());
  assert.deepEqual(cleanProgress("garbage"), emptyProgress());
  const p = cleanProgress({
    best: { "cho-dem": { score: 90, stars: 7 }, nope: { score: 1, stars: 1 }, tet: { score: "x", stars: 1 } },
    collection: { meo: 2, fake: 3, cun: -1, ga: 1.5 },
    name: "  Nam   Ngô  ",
  });
  assert.deepEqual(p.best, { "cho-dem": { score: 90, stars: 3 } });
  assert.deepEqual(p.collection, { meo: 2 });
  assert.equal(p.name, "Nam Ngô");
});

test("names are trimmed, squeezed and capped at 16 characters", () => {
  assert.equal(cleanName("   "), "");
  assert.equal(cleanName(undefined), "");
  assert.equal(cleanName("Một cái tên rất rất dài"), "Một cái tên rất ");
});
