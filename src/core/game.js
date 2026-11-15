// One round at one machine: the claw's state machine, grip resolution, coins and score.
// Everything is plain data (no classes, no DOM), so a round can be saved as JSON, resumed,
// and replayed exactly from the same seed and inputs.
//
// Claw phases: aim → drop → close → lift → carry → release → return → settle → aim …
// A round ends ("over") when the coins run out or the machine is empty.

import { cabinetById, toyList } from "./cabinets.js";
import { BOX, active, makeBody, settled, step as physicsStep, wakeAll } from "./physics.js";
import { between, createRng, next, shuffle } from "./rng.js";
import { clearBonus, scoreDrop, starsFor } from "./score.js";
import { toyById } from "./toys.js";

export const VERSION = 1;
export const DT = 1 / 60;
export const AIM_TIME = 15;

export const CLAW = {
  restLen: 64, // rope length at rest (tip y = gantryY + restLen)
  minX: BOX.divider + 22,
  maxX: BOX.width - 22,
  homeX: BOX.divider + 40,
  speed: 170,
  accel: 900,
  dropSpeed: 240,
  liftSpeed: 170,
  carrySpeed: 140,
  carryAccel: 150,
  closeTime: 0.4,
  releaseTime: 0.45,
  settleMax: 2.5,
  gravity: 1500,
  damping: 1.6,
  reach: 12, // how close the tip must be to a toy's surface to grab it
};

// ---------------------------------------------------------------------------- creating

/**
 * A new round. opts.layout = [{ toy, x }] places those toys on the floor instead of the
 * cabinet's random pile (used by tests and by the "every toy is winnable" check).
 */
export function createGame(cabinetId, seed = 1, opts = {}) {
  const cab = cabinetById(cabinetId);
  const rng = createRng(seed);
  const game = {
    v: VERSION,
    cabinetId,
    seed,
    rng,
    time: 0,
    status: "playing",
    coins: opts.coins ?? cab.coins,
    score: 0,
    combo: 0,
    bestCombo: 0,
    drops: 0,
    caught: [], // [{ toy, points, drop }]
    lines: [], // score lines for the result screen
    pending: [], // toys won during the current drop, scored when it settles
    bodies: [],
    claw: newClaw(),
  };
  if (opts.layout) {
    game.bodies = opts.layout.map(({ toy, x }) => {
      const t = toyById(toy);
      return makeBody(t, x, BOX.floor - t.r);
    });
  } else {
    game.bodies = pile(cab, rng);
  }
  // Let the pile fall and come to rest before the player sees it.
  let calm = 0;
  for (let i = 0; i < 60 * 10 && calm < 45; i++) {
    physicsStep(game.bodies, DT);
    calm = settled(game.bodies, 3) ? calm + 1 : 0;
  }
  for (const b of game.bodies) {
    b.vx = 0;
    b.vy = 0;
    b.px = b.x;
    b.py = b.y;
  }
  return game;
}

function newClaw() {
  return {
    x: CLAW.homeX, vx: 0, len: CLAW.restLen, theta: 0, omega: 0, open: 1,
    phase: "aim", t: 0, aimLeft: AIM_TIME, dir: 0, target: null,
    held: -1, grip: null, liftFrom: 0,
  };
}

function pile(cab, rng) {
  const ids = shuffle(rng, toyList(cab));
  return ids.map((id, i) => {
    const t = toyById(id);
    const x = between(rng, BOX.divider + t.r + 30, BOX.width - t.r - 2);
    const y = BOX.floor - t.r - 20 - i * 46;
    return makeBody(t, x, y);
  });
}

// ---------------------------------------------------------------------------- geometry

function armOf(claw) {
  return 50 + claw.len * 0.2;
}

/** Where the claw's grab point is, after swing. */
export function tipOf(claw) {
  return { x: claw.x + armOf(claw) * Math.sin(claw.theta), y: BOX.gantryY + claw.len };
}

/** How likely the claw is to hold a toy, given how far off-centre it closed. */
export function gripChance(cab, toy, dx, covered = false) {
  const centred = Math.max(0, 1 - Math.abs(dx) / toy.r);
  const weight = 1 / Math.sqrt(toy.mass);
  const chance = cab.power * toy.grip * (0.3 + 0.7 * centred) * (0.75 + 0.25 * weight);
  return Math.min(0.96, Math.max(0, chance * (covered ? 0.55 : 1)));
}

// ---------------------------------------------------------------------------- input

/** Steer during aim: dir = -1, 0 or 1, or target = an x to glide to (drag / tap). */
export function setAim(game, { dir = 0, target = null } = {}) {
  game.claw.dir = Math.sign(dir);
  game.claw.target = target == null ? null : clamp(target, CLAW.minX, CLAW.maxX);
}

export function canDrop(game) {
  return game.status === "playing" && game.claw.phase === "aim" && game.coins > 0;
}

/** Spend a coin and send the claw down. Returns false if a drop is not allowed now. */
export function drop(game) {
  if (!canDrop(game)) return false;
  const c = game.claw;
  game.coins -= 1;
  game.drops += 1;
  c.phase = "drop";
  c.t = 0;
  c.dir = 0;
  c.target = null;
  return true;
}

// ---------------------------------------------------------------------------- stepping

/** Advance one fixed step. Returns the events of this step for sound and messages. */
export function step(game, dt = DT) {
  const events = [];
  if (game.status !== "playing") return events;
  game.time += dt;
  const cab = cabinetById(game.cabinetId);
  const c = game.claw;
  const vxBefore = c.vx;
  c.t += dt;

  switch (c.phase) {
    case "aim": {
      const want = c.target != null
        ? clamp((c.target - c.x) * 7, -CLAW.speed, CLAW.speed)
        : c.dir * CLAW.speed;
      c.vx = approach(c.vx, want, CLAW.accel * dt);
      moveGantry(c, dt, CLAW.minX, CLAW.maxX);
      c.aimLeft = Math.max(0, c.aimLeft - dt);
      if (c.aimLeft === 0 && game.coins > 0) {
        drop(game);
        events.push({ type: "autodrop" });
      }
      break;
    }
    case "drop": {
      c.len += CLAW.dropSpeed * dt;
      const tip = tipOf(c);
      const touching = game.bodies.some((b) => !b.out && Math.hypot(b.x - tip.x, b.y - tip.y) < b.r + 2 && b.y > tip.y);
      if (touching || tip.y >= BOX.floor - 6) {
        c.phase = "close";
        c.t = 0;
        events.push({ type: "land" });
      }
      break;
    }
    case "close": {
      c.open = Math.max(0, 1 - c.t / CLAW.closeTime);
      if (c.open === 0) {
        events.push(grab(game, cab));
        c.phase = "lift";
        c.t = 0;
        c.liftFrom = c.len;
      }
      break;
    }
    case "lift": {
      c.len = Math.max(CLAW.restLen, c.len - CLAW.liftSpeed * dt);
      if (c.held >= 0 && c.grip && !c.grip.firm && c.liftFrom - c.len >= c.grip.slipAt) {
        events.push(letGo(game, "slip"));
      }
      if (c.len === CLAW.restLen) {
        c.phase = "carry";
        c.t = 0;
      }
      break;
    }
    case "carry": {
      const dist = BOX.chuteX - c.x;
      const want = Math.sign(dist) * Math.min(CLAW.carrySpeed, Math.sqrt(2 * CLAW.carryAccel * Math.abs(dist)));
      c.vx = approach(c.vx, want, CLAW.carryAccel * dt);
      moveGantry(c, dt, BOX.chuteX, CLAW.maxX);
      if (c.held >= 0 && c.grip?.firm && Math.abs(c.theta) > c.grip.limit) {
        events.push(letGo(game, "swing"));
      }
      if (Math.abs(dist) < 1 && Math.abs(c.vx) < 6) {
        c.x = BOX.chuteX;
        c.vx = 0;
        c.phase = "release";
        c.t = 0;
        if (c.held >= 0) {
          game.bodies[c.held].carried = true;
          events.push(letGo(game, "release"));
        }
      }
      break;
    }
    case "release": {
      c.open = Math.min(1, c.t / CLAW.releaseTime);
      if (c.open === 1) {
        c.phase = "return";
        c.t = 0;
      }
      break;
    }
    case "return": {
      const dist = CLAW.homeX - c.x;
      const want = Math.sign(dist) * Math.min(CLAW.carrySpeed, Math.sqrt(2 * CLAW.carryAccel * Math.abs(dist)));
      c.vx = approach(c.vx, want, CLAW.carryAccel * dt);
      moveGantry(c, dt, BOX.chuteX, CLAW.maxX);
      if (Math.abs(dist) < 1 && Math.abs(c.vx) < 6) {
        c.x = CLAW.homeX;
        c.vx = 0;
        c.phase = "settle";
        c.t = 0;
      }
      break;
    }
    case "settle": {
      if (c.t > 0.3 && (settled(game.bodies) || c.t > CLAW.settleMax)) {
        events.push(...finishDrop(game));
      }
      break;
    }
  }

  swing(c, (c.vx - vxBefore) / dt, dt);
  if (c.held >= 0) hang(game.bodies[c.held], c, dt);
  physicsStep(game.bodies, dt);

  for (const b of game.bodies) {
    if (b.out && !b.counted) {
      b.counted = true;
      wakeAll(game.bodies);
      game.pending.push({ toy: b.toy, lucky: !b.carried });
      events.push({ type: "win", toy: b.toy, lucky: !b.carried });
    }
  }
  return events;
}

function moveGantry(c, dt, min, max) {
  c.x += c.vx * dt;
  if (c.x < min) { c.x = min; c.vx = 0; }
  if (c.x > max) { c.x = max; c.vx = 0; }
}

// A damped pendulum driven by the gantry's acceleration.
function swing(c, accel, dt) {
  const L = armOf(c);
  const alpha = -(CLAW.gravity / L) * Math.sin(c.theta) - (accel / L) * Math.cos(c.theta) - CLAW.damping * c.omega;
  c.omega += alpha * dt;
  c.theta += c.omega * dt;
}

function hang(body, c, dt) {
  const tip = tipOf(c);
  const off = body.r * 0.55;
  const x = tip.x + Math.sin(c.theta) * off;
  const y = tip.y + Math.cos(c.theta) * off;
  body.vx = (x - body.x) / dt;
  body.vy = (y - body.y) / dt;
  body.x = x;
  body.y = y;
  body.px = x;
  body.py = y;
}

function grab(game, cab) {
  const c = game.claw;
  const tip = tipOf(c);
  let best = -1;
  let bestDx = Infinity;
  game.bodies.forEach((b, i) => {
    if (b.out) return;
    const dx = b.x - tip.x;
    const dy = b.y - tip.y;
    if (Math.hypot(dx, dy) < b.r + CLAW.reach && dy > -b.r * 0.3 && Math.abs(dx) < bestDx) {
      best = i;
      bestDx = Math.abs(dx);
    }
  });
  if (best < 0) return { type: "miss" };
  const body = game.bodies[best];
  const toy = toyById(body.toy);
  const covered = game.bodies.some((o, j) => j !== best && !o.out
    && Math.abs(o.x - body.x) < body.r * 0.9 && o.y < body.y - body.r * 0.6);
  const chance = gripChance(cab, toy, body.x - tip.x, covered);
  const u = next(game.rng);
  c.held = best;
  body.held = true;
  wakeAll(game.bodies);
  if (u < chance) {
    c.grip = { firm: true, limit: 0.14 + 0.5 * (1 - u / Math.max(chance, 1e-6)) };
  } else {
    c.grip = { firm: false, slipAt: 8 + next(game.rng) * 130 };
  }
  return { type: "grab", toy: body.toy, chance, firm: c.grip.firm };
}

function letGo(game, why) {
  const c = game.claw;
  const body = game.bodies[c.held];
  body.held = false;
  c.held = -1;
  wakeAll(game.bodies);
  c.grip = null;
  if (why !== "release") c.open = Math.max(c.open, 0.35);
  return { type: why === "release" ? "release" : "slip", toy: body.toy, why };
}

function finishDrop(game) {
  const events = [];
  const c = game.claw;
  const wins = game.pending;
  game.pending = [];
  game.combo = wins.length ? game.combo + 1 : 0;
  game.bestCombo = Math.max(game.bestCombo, game.combo);
  const result = scoreDrop(wins, game.combo || 1);
  game.score += result.total;
  for (const line of result.lines) {
    game.lines.push({ ...line, drop: game.drops });
    if (line.kind === "toy") game.caught.push({ toy: line.toy, points: line.points, drop: game.drops });
  }
  events.push({ type: "score", wins, total: result.total, combo: game.combo });

  const left = active(game.bodies).length;
  if (left === 0) {
    const bonus = clearBonus(game.coins);
    game.score += bonus;
    game.lines.push({ kind: "clear", points: bonus, drop: game.drops });
    game.status = "over";
    events.push({ type: "over", reason: "clear" });
  } else if (game.coins === 0) {
    game.status = "over";
    events.push({ type: "over", reason: "coins" });
  } else {
    c.phase = "aim";
    c.t = 0;
    c.aimLeft = AIM_TIME;
  }
  c.open = 1;
  return events;
}

// ---------------------------------------------------------------------------- results

export function summary(game) {
  const cab = cabinetById(game.cabinetId);
  const stars = starsFor(game.score, cab.targets);
  return {
    cabinetId: game.cabinetId,
    score: game.score,
    stars,
    caught: game.caught.map((c) => c.toy),
    drops: game.drops,
    bestCombo: game.bestCombo,
    cleared: active(game.bodies).length === 0,
    lines: game.lines,
  };
}

// ---------------------------------------------------------------------------- saving

export function snapshot(game) {
  return JSON.stringify(game);
}

/** Restore a saved round, or null if the save is broken or from another version. */
export function restore(json) {
  try {
    const game = JSON.parse(json);
    if (!game || game.v !== VERSION || game.status !== "playing") return null;
    cabinetById(game.cabinetId);
    if (!Array.isArray(game.bodies) || !game.claw || typeof game.rng?.s !== "number") return null;
    return game;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------- helpers

function approach(value, target, maxDelta) {
  if (value < target) return Math.min(target, value + maxDelta);
  return Math.max(target, value - maxDelta);
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}
