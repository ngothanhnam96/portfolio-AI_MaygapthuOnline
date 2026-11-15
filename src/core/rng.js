// Seeded random numbers (mulberry32). The state is one plain number inside an object, so a
// game that holds an rng can be saved with JSON.stringify and resumed exactly.

/** A new generator. Seed 0 is replaced so it never sticks at zero. */
export function createRng(seed = 1) {
  return { s: (seed >>> 0) || 0x9e3779b9 };
}

/** Next float in [0, 1). Advances the generator in place. */
export function next(rng) {
  rng.s = (rng.s + 0x6d2b79f5) >>> 0;
  let t = rng.s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Float in [min, max). */
export function between(rng, min, max) {
  return min + next(rng) * (max - min);
}

/** Fisher–Yates shuffle into a new array. */
export function shuffle(rng, list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next(rng) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
