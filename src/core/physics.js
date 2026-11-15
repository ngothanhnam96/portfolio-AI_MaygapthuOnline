// A tiny deterministic 2D physics step for round plush toys: gravity, circle–circle contact,
// the cabinet walls and the glass divider of the prize chute. Position-based: we move the
// bodies, push overlaps apart, then derive velocity from how far each body really moved.
//
// Coordinates are SVG pixels. The play floor is on the right; the chute is the gap on the
// left, behind a low glass divider. A toy that falls through the chute is "out" (won).

export const BOX = {
  width: 400,
  floor: 500,
  divider: 96, // x of the glass wall between the pile and the chute
  dividerTop: 404, // top of that glass wall
  chuteX: 48, // centre of the chute opening
  gantryY: 26, // the rail the claw hangs from
};

export const GRAVITY = 1500;
const ITERATIONS = 6;
const FLOOR_FRICTION = 0.82;
const AIR = 0.996;
const SLEEP_SPEED = 6;
const SLEEP_STEPS = 24;
const WAKE_OVERLAP = 0.6;

export function makeBody(toy, x, y) {
  return {
    toy: toy.id, r: toy.r, m: toy.mass,
    x, y, px: x, py: y, vx: 0, vy: 0, a: 0,
    held: false, ground: false, out: false, counted: false, carried: false,
    sleep: false, rest: 0,
  };
}

/** Bodies that still take part in the physics (not won yet). */
export function active(bodies) {
  return bodies.filter((b) => !b.out);
}

/** Wake every body, e.g. when the claw takes one away and the pile must re-settle. */
export function wakeAll(bodies) {
  for (const b of bodies) {
    b.sleep = false;
    b.rest = 0;
  }
}

const still = (b) => b.out || b.held || b.sleep;

export function step(bodies, dt) {
  for (const b of bodies) {
    if (still(b)) continue;
    b.px = b.x;
    b.py = b.y;
    b.vy += GRAVITY * dt;
    b.vx *= AIR;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.ground = false;
  }
  for (let k = 0; k < ITERATIONS; k++) {
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) collide(bodies[i], bodies[j]);
    }
    for (const b of bodies) if (!still(b)) walls(b);
  }
  for (const b of bodies) {
    if (still(b)) continue;
    b.vx = (b.x - b.px) / dt;
    b.vy = (b.y - b.py) / dt;
    if (b.ground) b.vx *= FLOOR_FRICTION;
    if (Math.abs(b.vx) < 2 && b.ground) b.vx = 0;
    b.a += (b.vx * dt) / b.r;
    if (b.x < BOX.divider && b.y - b.r > BOX.floor) b.out = true;
    // Static friction: a supported toy that has (almost) stopped goes to sleep, so a
    // leaning stack does not creep forever.
    b.rest = b.ground && Math.hypot(b.vx, b.vy) < SLEEP_SPEED ? b.rest + 1 : 0;
    if (b.rest >= SLEEP_STEPS) {
      b.sleep = true;
      b.vx = 0;
      b.vy = 0;
    }
  }
}

function collide(a, b) {
  if (a.out || b.out) return;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const min = a.r + b.r;
  const d2 = dx * dx + dy * dy;
  if (d2 >= min * min) return;
  const d = Math.sqrt(d2) || 1e-6;
  const nx = d2 ? dx / d : 0;
  const ny = d2 ? dy / d : 1;
  const overlap = min - d;
  // A moving toy (or the claw's held toy) that pushes hard enough wakes a sleeping one.
  if (a.sleep && !b.sleep && overlap > WAKE_OVERLAP) { a.sleep = false; a.rest = 0; }
  if (b.sleep && !a.sleep && overlap > WAKE_OVERLAP) { b.sleep = false; b.rest = 0; }
  const wa = a.held || a.sleep ? 0 : 1 / a.m;
  const wb = b.held || b.sleep ? 0 : 1 / b.m;
  const sum = wa + wb;
  if (!sum) return;
  a.x -= nx * overlap * (wa / sum);
  a.y -= ny * overlap * (wa / sum);
  b.x += nx * overlap * (wb / sum);
  b.y += ny * overlap * (wb / sum);
  if (ny > 0.5) a.ground = true; // b is under a
  if (ny < -0.5) b.ground = true;
}

function walls(b) {
  if (b.x < b.r) b.x = b.r;
  if (b.x > BOX.width - b.r) b.x = BOX.width - b.r;
  // Floor only on the play side; the chute side is an open hole.
  if (b.x >= BOX.divider && b.y > BOX.floor - b.r) {
    b.y = BOX.floor - b.r;
    b.ground = true;
  }
  // The divider is a vertical segment from dividerTop down to the floor.
  const cy = Math.min(Math.max(b.y, BOX.dividerTop), BOX.floor + 200);
  const dx = b.x - BOX.divider;
  const dy = b.y - cy;
  const d2 = dx * dx + dy * dy;
  if (d2 < b.r * b.r) {
    const d = Math.sqrt(d2);
    if (d < 1e-6) {
      b.x = BOX.divider + b.r;
    } else {
      b.x = BOX.divider + (dx / d) * b.r;
      b.y = cy + (dy / d) * b.r;
      if (dy / d < -0.5) b.ground = true;
    }
  }
}

/** True when nothing on the play side is still moving. */
export function settled(bodies, limit = 12) {
  return bodies.every((b) => still(b) || (Math.abs(b.vx) < limit && Math.abs(b.vy) < limit));
}
