// The plush toys. Size (r) and mass drive the physics; grip is how well the claw holds the
// fabric (1 = easy, lower = slippery); look drives the SVG artwork in src/ui/art.js.

export const RARITY = {
  common: { label: "Thường", points: 10, color: "#9fb3c8" },
  rare: { label: "Hiếm", points: 25, color: "#5cc8ff" },
  epic: { label: "Quý", points: 60, color: "#c77dff" },
  legend: { label: "Huyền thoại", points: 150, color: "#ffc94d" },
};

export const TOYS = [
  {
    id: "meo", name: "Mèo Mướp", rarity: "common", r: 21, mass: 1, grip: 1,
    look: { kind: "cat", body: "#f3b25c", belly: "#fde8c8", accent: "#c9782b" },
    blurb: "Ngủ trưa trên sạp vải, chỉ thức dậy khi nghe tiếng rao bánh mì.",
  },
  {
    id: "cun", name: "Cún Vàng", rarity: "common", r: 22, mass: 1, grip: 0.96,
    look: { kind: "dog", body: "#e9c27a", belly: "#fff1d6", accent: "#a8743a" },
    blurb: "Gác cổng chợ đêm, vẫy đuôi với mọi vị khách ghé qua.",
  },
  {
    id: "ga", name: "Gà Con", rarity: "common", r: 17, mass: 0.7, grip: 0.92,
    look: { kind: "chick", body: "#ffd84a", belly: "#fff2a8", accent: "#ff9a2e" },
    blurb: "Nhỏ xíu nên hay lọt khỏi càng. Gắp phải thật chuẩn!",
  },
  {
    id: "heo", name: "Heo Đất", rarity: "common", r: 23, mass: 1.2, grip: 1,
    look: { kind: "pig", body: "#ff9fb4", belly: "#ffd3dc", accent: "#e0607e" },
    blurb: "Trên lưng có khe bỏ xu. Nuôi heo để dành tiền gắp thú.",
  },
  {
    id: "ech", name: "Ếch Xanh", rarity: "common", r: 19, mass: 0.9, grip: 0.86,
    look: { kind: "frog", body: "#7fd36b", belly: "#d8f5b8", accent: "#3f9a3a" },
    blurb: "Vải hơi trơn, càng gắp dễ trượt. Thích ngồi cạnh ô cửa kính.",
  },
  {
    id: "trau", name: "Trâu Nước", rarity: "rare", r: 26, mass: 1.6, grip: 0.92,
    look: { kind: "buffalo", body: "#6f7b8c", belly: "#c4ccd8", accent: "#f2e6c8" },
    blurb: "Nặng và chắc nịch. Gắp được trâu là có sức khỏe cả năm.",
  },
  {
    id: "ca", name: "Cá Chép Đỏ", rarity: "rare", r: 21, mass: 0.9, grip: 0.74,
    look: { kind: "carp", body: "#ff6b4a", belly: "#ffd0a8", accent: "#ffb23e" },
    blurb: "Vảy satin bóng loáng, trơn tuột. Bơi ngược dòng để hóa rồng.",
  },
  {
    id: "gau", name: "Gấu Nâu", rarity: "rare", r: 24, mass: 1.3, grip: 0.95,
    look: { kind: "bear", body: "#a8744f", belly: "#e8c9a6", accent: "#6e4a30" },
    blurb: "Ôm rất êm. Gấu nâu là món quà được tặng nhiều nhất ở tiệm game.",
  },
  {
    id: "tho", name: "Thỏ Ngọc", rarity: "epic", r: 20, mass: 0.8, grip: 0.82,
    look: { kind: "rabbit", body: "#f6f3ff", belly: "#ffe1ef", accent: "#b9a8ff" },
    blurb: "Từ cung trăng xuống chơi đêm rằm. Tai dài, dễ móc càng.",
  },
  {
    id: "voi", name: "Voi Con", rarity: "epic", r: 28, mass: 1.8, grip: 0.88,
    look: { kind: "elephant", body: "#9db4d6", belly: "#dbe6f5", accent: "#e88aa8" },
    blurb: "To nhất máy và nặng nhất máy. Cần càng thật chắc.",
  },
  {
    id: "lan", name: "Lân Con", rarity: "epic", r: 25, mass: 1.1, grip: 0.84,
    look: { kind: "lion", body: "#ffcf3f", belly: "#fff4c2", accent: "#e8402e" },
    blurb: "Bờm đỏ rực, mắt to tròn. Múa một vòng là cả phố vui.",
  },
  {
    id: "rong", name: "Rồng Con", rarity: "legend", r: 24, mass: 1.2, grip: 0.72,
    look: { kind: "dragon", body: "#3fc28a", belly: "#ffe28a", accent: "#ffb020" },
    blurb: "Chỉ xuất hiện dịp Tết. Ai gắp được rồng con sẽ may mắn cả năm.",
  },
];

const BY_ID = new Map(TOYS.map((t) => [t.id, t]));

export function toyById(id) {
  const toy = BY_ID.get(id);
  if (!toy) throw new Error(`Unknown toy: ${id}`);
  return toy;
}

export function pointsFor(toy) {
  return RARITY[toy.rarity].points;
}
