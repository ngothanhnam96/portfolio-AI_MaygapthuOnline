import test from "node:test";
import assert from "node:assert/strict";
import { CABINETS, cabinetById } from "../src/core/cabinets.js";
import {
  AIM_TIME, CLAW, DT, canDrop, createGame, drop, gripChance, restore, setAim, snapshot, step, summary, tipOf,
} from "../src/core/game.js";
import { BOX } from "../src/core/physics.js";
import { BONUS, starsFor } from "../src/core/score.js";
import { toyById } from "../src/core/toys.js";
import { aimAt, autoplay, playDrop } from "./support/bot.js";

const run = (game, seconds) => {
  const events = [];
  for (let i = 0; i < seconds * 60; i++) events.push(...step(game));
  return events;
};

test("a new round has the machine's coins, no score, and the claw aiming at home", () => {
  for (const cab of CABINETS) {
    const g = createGame(cab.id, 5);
    assert.equal(g.coins, cab.coins);
    assert.equal(g.score, 0);
    assert.equal(g.status, "playing");
    assert.equal(g.claw.phase, "aim");
    assert.equal(g.claw.x, CLAW.homeX);
    assert.equal(canDrop(g), true);
  }
});

test("each drop costs one coin, and a second drop mid-cycle is refused", () => {
  const g = createGame("cho-dem", 1);
  assert.equal(drop(g), true);
  assert.equal(g.coins, cabinetById("cho-dem").coins - 1);
  assert.equal(drop(g), false, "cannot drop while the claw is busy");
  assert.equal(g.coins, cabinetById("cho-dem").coins - 1);
});

test("the claw stays inside the rails however long you push", () => {
  const g = createGame("cho-dem", 1);
  setAim(g, { dir: -1 });
  run(g, 3);
  assert.equal(g.claw.x, CLAW.minX);
  setAim(g, { dir: 1 });
  run(g, 4);
  assert.equal(g.claw.x, CLAW.maxX);
});

test("a drag target glides the claw there and holds it", () => {
  const g = createGame("cho-dem", 1);
  aimAt(g, 260);
  assert.ok(Math.abs(tipOf(g.claw).x - 260) < 1);
  assert.equal(g.claw.phase, "aim");
});

test("moving and stopping makes the claw swing, and the swing dies down", () => {
  const g = createGame("cho-dem", 1);
  setAim(g, { dir: 1 });
  run(g, 0.8);
  setAim(g, {});
  run(g, 0.3);
  const peak = Math.abs(g.claw.theta);
  assert.ok(peak > 0.05, `the claw should swing after a stop (θ=${peak})`);
  run(g, 5);
  assert.ok(Math.abs(g.claw.theta) < 0.01, "the swing is damped");
});

test("aiming too long drops the claw automatically", () => {
  const g = createGame("cho-dem", 1);
  const events = run(g, AIM_TIME + 0.1);
  assert.ok(events.some((e) => e.type === "autodrop"));
  assert.equal(g.coins, cabinetById("cho-dem").coins - 1);
});

test("dropping on an empty patch of floor is a miss and wins nothing", () => {
  const g = createGame("cho-dem", 1, { layout: [{ toy: "meo", x: 340 }] });
  aimAt(g, 160);
  const events = playDrop(g);
  assert.ok(events.some((e) => e.type === "miss"));
  assert.equal(g.caught.length, 0);
  assert.equal(g.claw.phase, "aim", "back to aiming for the next coin");
  assert.equal(g.combo, 0);
});

test("a centred drop on a lone toy grips it and carries it to the chute", () => {
  const g = createGame("cho-dem", 3, { layout: [{ toy: "gau", x: 250 }, { toy: "meo", x: 360 }] });
  aimAt(g, 250);
  const events = playDrop(g);
  const grab = events.find((e) => e.type === "grab");
  assert.equal(grab?.toy, "gau");
  assert.ok(grab.chance > 0.8, `centred grab on a bear should be likely (${grab.chance})`);
});

test("grip is best when centred, worse off-centre, worse when covered, worse in a weaker machine", () => {
  const weak = cabinetById("tet");
  const strong = cabinetById("cho-dem");
  const bear = toyById("gau");
  const centred = gripChance(strong, bear, 0);
  assert.ok(gripChance(strong, bear, bear.r * 0.6) < centred);
  assert.ok(gripChance(strong, bear, 0, true) < centred);
  assert.ok(gripChance(weak, bear, 0) < centred);
  assert.ok(gripChance(strong, toyById("ca"), 0) < gripChance(strong, toyById("meo"), 0), "slippery satin carp");
  assert.equal(gripChance(strong, bear, bear.r * 2), gripChance(strong, bear, bear.r), "edge grab floors out, never negative");
  assert.ok(gripChance(strong, toyById("meo"), 0) <= 0.96, "never a sure thing");
});

test("a toy that tumbles into the chute on its own is a lucky win and pays the bonus", () => {
  const g = createGame("cho-dem", 1, { layout: [{ toy: "meo", x: 340 }, { toy: "cun", x: 200 }] });
  const b = g.bodies[0];
  Object.assign(b, { x: BOX.chuteX, y: 300, px: BOX.chuteX, py: 300, sleep: false });
  const events = [...aimAt(g, 130), ...playDrop(g)];
  const win = events.find((e) => e.type === "win");
  assert.equal(win?.lucky, true);
  assert.ok(g.lines.some((l) => l.kind === "lucky" && l.points === BONUS.lucky));
  assert.equal(g.score, 10 + BONUS.lucky);
});

test("two toys in one drop pay the double-catch bonus", () => {
  const g = createGame("cho-dem", 1, { layout: [{ toy: "meo", x: 340 }, { toy: "cun", x: 300 }, { toy: "ga", x: 200 }] });
  for (const b of g.bodies.slice(0, 2)) Object.assign(b, { x: BOX.chuteX, px: BOX.chuteX, sleep: false });
  g.bodies[0].y = g.bodies[0].py = 200;
  g.bodies[1].y = g.bodies[1].py = 300;
  aimAt(g, 130);
  playDrop(g);
  assert.ok(g.lines.some((l) => l.kind === "double" && l.points === BONUS.double));
  assert.equal(g.caught.length, 2);
});

test("the round ends when the coins run out", () => {
  const g = createGame("cho-dem", 1, { coins: 2, layout: [{ toy: "meo", x: 340 }] });
  aimAt(g, 150);
  playDrop(g);
  assert.equal(g.status, "playing");
  aimAt(g, 150);
  const events = playDrop(g);
  assert.equal(g.status, "over");
  assert.ok(events.some((e) => e.type === "over" && e.reason === "coins"));
  assert.equal(canDrop(g), false);
  assert.deepEqual(step(g), [], "nothing moves after the round is over");
});

test("emptying the machine ends the round with the clear bonus and coin refund", () => {
  // Find a seed where the bot clears a one-toy machine, then check the bonus maths.
  for (let seed = 1; seed < 40; seed++) {
    const g = createGame("cho-dem", seed, { layout: [{ toy: "meo", x: 250 }] });
    aimAt(g, 250);
    const events = playDrop(g);
    if (g.status !== "over") continue;
    assert.ok(events.some((e) => e.type === "over" && e.reason === "clear"));
    const clear = g.lines.find((l) => l.kind === "clear");
    assert.equal(clear.points, BONUS.clear + BONUS.coin * g.coins);
    assert.equal(summary(g).cleared, true);
    return;
  }
  assert.fail("no seed cleared a single centred cat in 40 tries");
});

test("the score always equals the sum of its explained lines", () => {
  for (const cab of CABINETS) {
    for (const seed of [1, 2, 3]) {
      const g = createGame(cab.id, seed);
      autoplay(g);
      assert.equal(g.status, "over");
      assert.equal(g.score, g.lines.reduce((s, l) => s + l.points, 0), `${cab.id}/${seed}`);
      const sum = summary(g);
      assert.equal(sum.stars, starsFor(g.score, cab.targets));
      assert.equal(sum.caught.length, g.bodies.filter((b) => b.out).length);
    }
  }
});

test("replaying the same seed and inputs gives the same round, step for step", () => {
  const a = createGame("trung-thu", 77);
  const b = createGame("trung-thu", 77);
  autoplay(a);
  autoplay(b);
  assert.equal(snapshot(a), snapshot(b));
});

test("a saved round resumes exactly where it was, mid-swing and mid-carry", () => {
  const g = createGame("tiem-game", 9);
  aimAt(g, 240);
  drop(g);
  run(g, 2.2); // somewhere in the lift / carry
  const saved = snapshot(g);
  const resumed = restore(saved);
  assert.ok(resumed);
  run(g, 6);
  run(resumed, 6);
  assert.equal(snapshot(resumed), snapshot(g));
});

test("broken, foreign or finished saves are refused", () => {
  assert.equal(restore("not json"), null);
  assert.equal(restore(JSON.stringify({ v: 99 })), null);
  assert.equal(restore(JSON.stringify({ ...createGame("cho-dem", 1), cabinetId: "nope" })), null);
  const over = createGame("cho-dem", 1, { coins: 1, layout: [{ toy: "meo", x: 340 }] });
  aimAt(over, 150);
  playDrop(over);
  assert.equal(restore(snapshot(over)), null);
});

test("DT is a 60 Hz fixed step", () => {
  assert.equal(DT, 1 / 60);
});
