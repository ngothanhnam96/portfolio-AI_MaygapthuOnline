// The machines. Each has its own theme, coins, claw power and mix of toys. Cabinets unlock
// in order: one star on a machine opens the next.

export const CABINETS = [
  {
    id: "cho-dem",
    name: "Góc Chợ Đêm",
    tagline: "Máy gắp cạnh xe nước mía, dưới dây bóng đèn vàng.",
    coins: 10,
    power: 1,
    mix: [["meo", 3], ["cun", 3], ["ga", 2], ["heo", 3], ["ech", 2], ["gau", 1]],
    targets: [50, 120, 190],
    theme: { wall: "#241b3f", wall2: "#3b2a5e", neon: "#ffb347", floor: "#4a3470", decor: "bulbs" },
  },
  {
    id: "tiem-game",
    name: "Tiệm Game Phố Cũ",
    tagline: "Tiếng nhạc 8-bit, bảng điểm nhấp nháy, đèn neon hồng.",
    coins: 9,
    power: 0.92,
    mix: [["meo", 2], ["cun", 2], ["ech", 2], ["heo", 2], ["gau", 2], ["trau", 2], ["ca", 1], ["ga", 1]],
    targets: [50, 120, 190],
    theme: { wall: "#0f2a33", wall2: "#14424f", neon: "#ff4fa3", floor: "#1d5a63", decor: "pixels" },
  },
  {
    id: "trung-thu",
    name: "Đêm Trung Thu",
    tagline: "Trăng rằm, đèn ông sao và một chú thỏ ngọc lạc xuống trần.",
    coins: 8,
    power: 0.85,
    mix: [["tho", 2], ["ca", 2], ["lan", 1], ["ga", 2], ["meo", 2], ["gau", 2], ["ech", 1]],
    targets: [60, 140, 220],
    theme: { wall: "#141a46", wall2: "#26307a", neon: "#ffd84a", floor: "#2c2f6e", decor: "lanterns" },
  },
  {
    id: "tet",
    name: "Phiên Chợ Tết",
    tagline: "Hoa mai, bao lì xì và một chú rồng con giấu dưới đống thú.",
    coins: 8,
    power: 0.8,
    mix: [["rong", 1], ["lan", 2], ["voi", 1], ["trau", 2], ["heo", 3], ["ca", 2], ["cun", 1]],
    targets: [70, 160, 240],
    theme: { wall: "#5a0f14", wall2: "#8a1a1f", neon: "#ffd23f", floor: "#6e1a1a", decor: "blossoms" },
  },
];

const BY_ID = new Map(CABINETS.map((c) => [c.id, c]));

export function cabinetById(id) {
  const cabinet = BY_ID.get(id);
  if (!cabinet) throw new Error(`Unknown cabinet: ${id}`);
  return cabinet;
}

/** The toy ids a cabinet holds, one entry per plush. */
export function toyList(cabinet) {
  return cabinet.mix.flatMap(([id, count]) => Array(count).fill(id));
}
