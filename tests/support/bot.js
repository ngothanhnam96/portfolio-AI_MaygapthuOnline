// A simple player for tests: glide over a toy, wait for the swing to calm down, drop, and
// step until the claw is back in aim (or the round ends).

import { CLAW, canDrop, drop, setAim, step, tipOf } from "../../src/core/game.js";

const MAX_STEPS = 60 * 40;

/** Move the claw over x and wait until it hangs still. Returns the events seen. */
export function aimAt(game, x) {
  const events = [];
  setAim(game, { target: x });
  for (let i = 0; i < MAX_STEPS; i++) {
    const c = game.claw;
    if (Math.abs(tipOf(c).x - Math.min(CLAW.maxX, Math.max(CLAW.minX, x))) < 0.6
      && Math.abs(c.vx) < 0.5 && Math.abs(c.theta) < 0.004 && Math.abs(c.omega) < 0.02) break;
    events.push(...step(game));
    if (game.claw.phase !== "aim") break;
  }
  setAim(game, {});
  return events;
}

/** Drop now and run the whole cycle. Returns all events. */
export function playDrop(game) {
  const events = [];
  if (!drop(game)) return events;
  for (let i = 0; i < MAX_STEPS; i++) {
    events.push(...step(game));
    if (game.status !== "playing" || game.claw.phase === "aim") break;
  }
  return events;
}

/** Pick the easiest toy: uncovered, closest to the chute. */
export function easiest(game) {
  const free = game.bodies.filter((b) => !b.out);
  const uncovered = free.filter((b) => !free.some((o) => o !== b
    && Math.abs(o.x - b.x) < b.r * 0.9 && o.y < b.y - b.r * 0.6));
  const pool = uncovered.length ? uncovered : free;
  return pool.sort((a, b) => a.x - b.x)[0];
}

/** Play a whole round with the bot. */
export function autoplay(game) {
  const events = [];
  while (game.status === "playing" && canDrop(game)) {
    const target = easiest(game);
    events.push(...aimAt(game, target.x));
    events.push(...playDrop(game));
  }
  return events;
}
