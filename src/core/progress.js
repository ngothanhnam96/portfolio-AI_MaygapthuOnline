// What the player keeps between rounds: best score and stars per machine, the collection
// book, and the player's name. Pure functions: every change returns a new object.

import { CABINETS } from "./cabinets.js";
import { TOYS } from "./toys.js";

export function emptyProgress() {
  return { best: {}, collection: {}, name: "" };
}

/** Accept whatever storage gave back, keeping only valid fields. */
export function cleanProgress(raw) {
  const p = emptyProgress();
  if (!raw || typeof raw !== "object") return p;
  for (const cab of CABINETS) {
    const b = raw.best?.[cab.id];
    if (b && Number.isFinite(b.score) && Number.isInteger(b.stars)) {
      p.best[cab.id] = { score: Math.max(0, b.score), stars: Math.min(3, Math.max(0, b.stars)) };
    }
  }
  for (const toy of TOYS) {
    const n = raw.collection?.[toy.id];
    if (Number.isInteger(n) && n > 0) p.collection[toy.id] = n;
  }
  p.name = cleanName(raw.name);
  return p;
}

export function cleanName(name) {
  return String(name ?? "").replace(/\s+/g, " ").trim().slice(0, 16);
}

/** Record a finished round. Returns { progress, newToys, newBest }. */
export function recordRound(progress, summary) {
  const best = { ...progress.best };
  const old = best[summary.cabinetId];
  const newBest = !old || summary.score > old.score;
  best[summary.cabinetId] = {
    score: Math.max(old?.score ?? 0, summary.score),
    stars: Math.max(old?.stars ?? 0, summary.stars),
  };
  const collection = { ...progress.collection };
  const newToys = [];
  for (const id of summary.caught) {
    if (!collection[id]) newToys.push(id);
    collection[id] = (collection[id] ?? 0) + 1;
  }
  return { progress: { ...progress, best, collection }, newToys: [...new Set(newToys)], newBest };
}

export function isUnlocked(progress, index) {
  if (index === 0) return true;
  return (progress.best[CABINETS[index - 1].id]?.stars ?? 0) >= 1;
}

export function totalStars(progress) {
  return CABINETS.reduce((s, c) => s + (progress.best[c.id]?.stars ?? 0), 0);
}

export function collected(progress) {
  return TOYS.filter((t) => progress.collection[t.id]).length;
}

const TITLES = [
  [0, "Khách Qua Đường"],
  [3, "Tay Gắp Tập Sự"],
  [6, "Thợ Gắp Phố Đêm"],
  [9, "Bàn Tay Vàng"],
  [12, "Vua Máy Gắp"],
];

export function titleFor(progress) {
  const stars = totalStars(progress);
  return TITLES.filter(([min]) => stars >= min).pop()[1];
}
