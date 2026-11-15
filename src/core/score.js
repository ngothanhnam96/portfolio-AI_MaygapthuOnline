// Scoring rules. Points come from rarity; a streak of winning drops multiplies them; catching
// two toys in one drop, a toy that tumbles into the chute on its own, and clearing the whole
// machine all pay bonuses.

import { RARITY, toyById } from "./toys.js";

export const BONUS = {
  lucky: 15, // a toy fell into the chute without being carried there
  double: 30, // each extra toy won in the same drop
  clear: 100, // the machine is empty
  coin: 20, // per unused coin when the machine is cleared
};

/** Combo multiplier for the nth winning drop in a row: ×1, ×1.5, ×2, ×2.5, capped at ×3. */
export function multiplier(combo) {
  if (combo <= 1) return 1;
  return Math.min(3, 1 + 0.5 * (combo - 1));
}

/**
 * Score one drop. wins = [{ toy, lucky }]. combo is the streak *including* this drop.
 * Returns { total, lines } where lines explain every point.
 */
export function scoreDrop(wins, combo) {
  const mult = multiplier(combo);
  const lines = [];
  for (const w of wins) {
    const base = RARITY[toyById(w.toy).rarity].points;
    lines.push({ kind: "toy", toy: w.toy, points: Math.round(base * mult), mult });
    if (w.lucky) lines.push({ kind: "lucky", toy: w.toy, points: BONUS.lucky });
  }
  if (wins.length > 1) lines.push({ kind: "double", points: BONUS.double * (wins.length - 1) });
  return { total: lines.reduce((s, l) => s + l.points, 0), lines };
}

export function clearBonus(coinsLeft) {
  return BONUS.clear + BONUS.coin * coinsLeft;
}

export function starsFor(score, targets) {
  return targets.filter((t) => score >= t).length;
}
