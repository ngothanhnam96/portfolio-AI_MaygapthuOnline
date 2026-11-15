import test from "node:test";
import assert from "node:assert/strict";
import { CABINETS, toyList } from "../src/core/cabinets.js";
import { DT, createGame, step } from "../src/core/game.js";
import { BOX, makeBody, step as physicsStep } from "../src/core/physics.js";
import { toyById } from "../src/core/toys.js";

const SEEDS = [1, 2, 3, 7, 42, 99, 2026];

function maxOverlap(bodies) {
  let worst = 0;
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i];
      const b = bodies[j];
      worst = Math.max(worst, a.r + b.r - Math.hypot(a.x - b.x, a.y - b.y));
    }
  }
  return worst;
}

test("every machine starts with its whole pile at rest on the play side", () => {
  for (const cab of CABINETS) {
    for (const seed of SEEDS) {
      const g = createGame(cab.id, seed);
      assert.equal(g.bodies.length, toyList(cab).length, `${cab.id}/${seed}: toy count`);
      for (const b of g.bodies) {
        assert.equal(b.out, false, `${cab.id}/${seed}: ${b.toy} fell into the chute at the start`);
        // A big toy may lean over the glass edge (tempting!) but its centre is on the play side.
        assert.ok(b.x > BOX.divider, `${cab.id}/${seed}: ${b.toy} is over the chute`);
        assert.ok(b.x + b.r <= BOX.width + 0.5, `${cab.id}/${seed}: ${b.toy} is through the right wall`);
        assert.ok(b.y + b.r <= BOX.floor + 0.5, `${cab.id}/${seed}: ${b.toy} is under the floor`);
        assert.ok(b.y - b.r > BOX.gantryY + 80, `${cab.id}/${seed}: the pile reaches the claw's rail`);
      }
      assert.ok(maxOverlap(g.bodies) < 2.5, `${cab.id}/${seed}: toys sink into each other`);
    }
  }
});

test("a settled pile stays put: no creeping or toppling while nobody plays", () => {
  for (const cab of CABINETS) {
    for (const seed of SEEDS) {
      const g = createGame(cab.id, seed);
      const before = g.bodies.map((b) => [b.x, b.y]);
      for (let i = 0; i < 60 * 10; i++) {
        g.claw.aimLeft = 15; // keep aiming, never auto-drop
        step(g);
      }
      g.bodies.forEach((b, i) => {
        const moved = Math.hypot(b.x - before[i][0], b.y - before[i][1]);
        assert.ok(moved < 0.5, `${cab.id}/${seed}: ${b.toy} drifted ${moved.toFixed(2)} px`);
      });
    }
  }
});

test("the same seed builds exactly the same pile; another seed builds a different one", () => {
  const a = createGame("tet", 123);
  const b = createGame("tet", 123);
  const c = createGame("tet", 124);
  assert.deepEqual(a.bodies, b.bodies);
  assert.notDeepEqual(a.bodies.map((x) => x.x), c.bodies.map((x) => x.x));
});

test("a toy dropped over the chute falls through and is marked out", () => {
  const toy = toyById("meo");
  const bodies = [makeBody(toy, BOX.chuteX, 200)];
  for (let i = 0; i < 120 && !bodies[0].out; i++) physicsStep(bodies, DT);
  assert.equal(bodies[0].out, true);
});

test("the glass divider stops a toy rolling along the floor into the chute", () => {
  const toy = toyById("cun");
  const b = makeBody(toy, BOX.divider + 60, BOX.floor - toy.r);
  b.vx = -400;
  const bodies = [b];
  for (let i = 0; i < 180; i++) physicsStep(bodies, DT);
  assert.equal(b.out, false);
  assert.ok(b.x - b.r >= BOX.divider - 0.5, "the toy stays on the play side");
});

test("a toy that falls on the divider's top edge tips to one side instead of sticking", () => {
  const toy = toyById("ga");
  const b = makeBody(toy, BOX.divider - 3, 200);
  const bodies = [b];
  for (let i = 0; i < 400 && !b.out; i++) physicsStep(bodies, DT);
  assert.ok(b.out || b.y + b.r > BOX.floor - 1, "the toy ended in the chute or on the floor");
});
