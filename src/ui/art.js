// All artwork, drawn as SVG strings from code. No image files.
//
// Toys are <symbol>s in a -60…60 box with the body a circle of radius 40, so a toy of
// physics radius r is drawn with <use> at 3r × 3r. Every id starts with "gt-".

import { BOX } from "../core/physics.js";
import { esc } from "../core/text.js";
import { RARITY, TOYS } from "../core/toys.js";

export const TOY_BOX = 120; // symbol viewBox size
export const TOY_BODY = 40; // body radius inside it
export const TOY_SCALE = TOY_BOX / (2 * TOY_BODY); // 1.5: draw size = 2r × this

const f = (n) => Math.round(n * 10) / 10;

// ----------------------------------------------------------------------------- toys

function face({ eyes = 4.6, y = -4, gap = 13, blush = "#ff8fa8", mouth = "w" } = {}) {
  const m = mouth === "w"
    ? `<path d="M-6 9 Q-3 13 0 9 Q3 13 6 9" fill="none" stroke="#3a2230" stroke-width="2.2" stroke-linecap="round"/>`
    : mouth === "o"
      ? `<ellipse cx="0" cy="11" rx="4" ry="3.4" fill="#7a2a3a"/>`
      : `<path d="M-9 9 Q0 17 9 9" fill="none" stroke="#3a2230" stroke-width="2.4" stroke-linecap="round"/>`;
  return `<g class="face">
    <ellipse cx="${-gap - 9}" cy="${y + 12}" rx="6.5" ry="4" fill="${blush}" opacity=".55"/>
    <ellipse cx="${gap + 9}" cy="${y + 12}" rx="6.5" ry="4" fill="${blush}" opacity=".55"/>
    <circle cx="${-gap}" cy="${y}" r="${eyes}" fill="#2a1a24"/>
    <circle cx="${gap}" cy="${y}" r="${eyes}" fill="#2a1a24"/>
    <circle cx="${-gap + 1.6}" cy="${y - 1.7}" r="${f(eyes * 0.36)}" fill="#fff"/>
    <circle cx="${gap + 1.6}" cy="${y - 1.7}" r="${f(eyes * 0.36)}" fill="#fff"/>
    ${m}
  </g>`;
}

function body(id, look, { belly = true } = {}) {
  return `<circle r="${TOY_BODY}" fill="url(#gt-shade-${id})"/>
    ${belly ? `<ellipse cx="0" cy="16" rx="24" ry="19" fill="${look.belly}" opacity=".9"/>` : ""}
    <circle r="${TOY_BODY - 3}" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="1.4" stroke-dasharray="3 4"/>`;
}

const mirror = (inner) => `${inner}<g transform="scale(-1 1)">${inner}</g>`;

const PARTS = {
  cat: (id, l) => ({
    back: mirror(`<path d="M-36 -14 L-31 -50 L-8 -34Z" fill="${l.body}"/><path d="M-30 -20 L-28 -40 L-15 -31Z" fill="#ffb7c5"/>`),
    front: `<path d="M-6 -36 l3 9 M0 -38 v10 M6 -36 l-3 9" stroke="${l.accent}" stroke-width="3" stroke-linecap="round"/>
      ${mirror(`<path d="M-24 6 h-14 M-24 10 l-13 4" stroke="#6a4a3a" stroke-width="1.4" stroke-linecap="round"/>`)}
      <path d="M-2.5 3 h5 l-2.5 3z" fill="#e0607e"/>${face({ mouth: "w" })}`,
  }),
  dog: (id, l) => ({
    back: "",
    front: `${mirror(`<ellipse cx="-36" cy="-8" rx="11" ry="22" transform="rotate(18 -36 -8)" fill="${l.accent}"/>`)}
      <circle cx="16" cy="-12" r="11" fill="${l.accent}" opacity=".5"/>
      <ellipse cx="0" cy="6" rx="7" ry="5" fill="#3a2230"/>${face({ mouth: "smile" })}
      <path d="M-4 15 q4 8 8 0z" fill="#ff7a8a"/>`,
  }),
  chick: (id, l) => ({
    back: "",
    front: `<path d="M-4 -40 q4 -12 8 0 q6 -10 8 2" fill="none" stroke="${l.accent}" stroke-width="3.4" stroke-linecap="round"/>
      ${mirror(`<path d="M-38 6 q-10 6 -6 18 q6 -2 10 -10z" fill="${l.accent}" opacity=".8"/>`)}
      ${face({ mouth: "none", y: -6 })}<path d="M-6 4 L6 4 L0 13Z" fill="${l.accent}"/>`,
  }),
  pig: (id, l) => ({
    back: mirror(`<path d="M-34 -18 L-34 -46 L-14 -34Z" fill="${l.accent}"/>`),
    front: `<rect x="-9" y="-37" width="18" height="4" rx="2" fill="#7a2a3a" opacity=".6"/>
      <ellipse cx="0" cy="8" rx="13" ry="9" fill="${l.accent}"/>
      <ellipse cx="-4.5" cy="8" rx="2.4" ry="3.4" fill="#7a2a3a"/><ellipse cx="4.5" cy="8" rx="2.4" ry="3.4" fill="#7a2a3a"/>
      ${face({ mouth: "none", y: -10, gap: 15 })}`,
  }),
  frog: (id, l) => ({
    back: "",
    front: `${mirror(`<circle cx="-17" cy="-32" r="13" fill="${l.body}"/><circle cx="-17" cy="-33" r="8" fill="#fff"/><circle cx="-16" cy="-33" r="4.5" fill="#2a1a24"/><circle cx="-14.5" cy="-35" r="1.6" fill="#fff"/>`)}
      <path d="M-18 4 Q0 20 18 4" fill="none" stroke="#2a5a2a" stroke-width="2.6" stroke-linecap="round"/>
      ${mirror(`<ellipse cx="-26" cy="0" rx="6" ry="3.6" fill="#ff8fa8" opacity=".5"/>`)}
      <circle cx="-14" cy="24" r="4" fill="${l.accent}" opacity=".5"/><circle cx="12" cy="28" r="3" fill="${l.accent}" opacity=".5"/>`,
  }),
  buffalo: (id, l) => ({
    back: mirror(`<path d="M-24 -30 C-42 -34 -54 -28 -54 -10 C-48 -22 -40 -24 -28 -20Z" fill="${l.accent}" stroke="#b9a98a" stroke-width="1.2"/>
      <ellipse cx="-38" cy="-12" rx="10" ry="6" transform="rotate(-20 -38 -12)" fill="${l.body}"/>`),
    front: `<ellipse cx="0" cy="12" rx="19" ry="13" fill="${l.belly}"/>
      <circle cx="-6" cy="12" r="2.6" fill="#3a3a48"/><circle cx="6" cy="12" r="2.6" fill="#3a3a48"/>
      <path d="M-4 -36 q4 -6 8 0" fill="none" stroke="#3a3a48" stroke-width="3" stroke-linecap="round"/>
      ${face({ mouth: "none", y: -10, gap: 16, blush: "#ffb0c0" })}`,
  }),
  carp: (id, l) => ({
    back: `<path d="M30 -4 L56 -26 Q50 0 56 26Z" fill="${l.accent}"/>
      <path d="M-14 -36 Q4 -56 22 -34Z" fill="${l.accent}"/>`,
    front: `${[[-6, 18], [8, 22], [20, 10], [-18, 26], [2, 32]].map(([x, y]) => `<path d="M${x - 6} ${y} q6 -7 12 0" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2"/>`).join("")}
      <path d="M-30 4 q-6 -6 -12 -2 q4 6 12 6z" fill="${l.accent}"/>
      ${mirror(`<path d="M-8 2 q-10 6 -18 2" fill="none" stroke="${l.accent}" stroke-width="2" stroke-linecap="round"/>`)}
      ${face({ mouth: "o", y: -10, gap: 13 })}`,
  }),
  bear: (id, l) => ({
    back: mirror(`<circle cx="-28" cy="-30" r="13" fill="${l.body}"/><circle cx="-28" cy="-30" r="7" fill="${l.accent}"/>`),
    front: `<ellipse cx="0" cy="9" rx="15" ry="11" fill="${l.belly}"/>
      <ellipse cx="0" cy="4" rx="6" ry="4.4" fill="#3a2230"/>${face({ mouth: "w", y: -8 })}`,
  }),
  rabbit: (id, l) => ({
    back: mirror(`<ellipse cx="-14" cy="-52" rx="9" ry="24" transform="rotate(-10 -14 -52)" fill="${l.body}"/>
      <ellipse cx="-14" cy="-50" rx="4.5" ry="17" transform="rotate(-10 -14 -50)" fill="${l.belly}"/>`),
    front: `<path d="M-28 -22 a6 6 0 0 1 10 -3" fill="none" stroke="${l.accent}" stroke-width="2"/>
      <circle cx="26" cy="-26" r="5" fill="#ffd84a"/>
      <path d="M-2.5 3 h5 l-2.5 3z" fill="#e0607e"/>${face({ mouth: "w", blush: "#ff9fc8" })}`,
  }),
  elephant: (id, l) => ({
    back: mirror(`<ellipse cx="-40" cy="-4" rx="20" ry="26" fill="${l.body}"/><ellipse cx="-40" cy="-4" rx="12" ry="18" fill="${l.accent}" opacity=".6"/>`),
    front: `<path d="M-7 0 C-8 18 -2 30 10 32 C16 33 18 26 13 25 C6 24 6 16 7 0Z" fill="${l.body}" stroke="#000" stroke-opacity=".1"/>
      ${face({ mouth: "none", y: -12, gap: 15 })}`,
  }),
  lion: (id, l) => ({
    back: Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2;
      return `<circle cx="${f(Math.cos(a) * 42)}" cy="${f(Math.sin(a) * 42)}" r="11" fill="${i % 2 ? l.accent : "#ff7a2e"}"/>`;
    }).join(""),
    front: `<path d="M-8 -34 L0 -48 L8 -34Z" fill="${l.accent}"/>
      ${mirror(`<path d="M-24 -18 q8 -8 16 -2" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`)}
      <ellipse cx="0" cy="12" rx="16" ry="10" fill="#fff"/>
      <path d="M-12 10 Q0 22 12 10" fill="#e8402e"/>
      ${face({ mouth: "none", eyes: 6.4, y: -6, gap: 14 })}`,
  }),
  dragon: (id, l) => ({
    back: `${[-24, -8, 8, 24].map((x) => { const y = -Math.sqrt(1600 - x * x); return `<path d="M${x - 7} ${f(y + 6)} L${x} ${f(y - 10)} L${x + 7} ${f(y + 6)}Z" fill="${l.accent}"/>`; }).join("")}
      ${mirror(`<path d="M-18 -30 L-26 -52 L-20 -46 L-22 -58 L-12 -40Z" fill="#fff4c2" stroke="${l.accent}" stroke-width="1.4"/>`)}`,
    front: `<ellipse cx="0" cy="10" rx="16" ry="11" fill="${l.belly}"/>
      <circle cx="-5" cy="8" r="2" fill="#2a5a3a"/><circle cx="5" cy="8" r="2" fill="#2a5a3a"/>
      ${mirror(`<path d="M-14 12 C-30 10 -40 18 -48 12" fill="none" stroke="${l.accent}" stroke-width="2" stroke-linecap="round"/>`)}
      ${face({ mouth: "none", y: -10, gap: 15, eyes: 5.2 })}`,
  }),
};

export function toySymbol(toy) {
  const look = toy.look;
  const parts = PARTS[look.kind](toy.id, look);
  const legend = toy.rarity === "legend"
    ? `<path d="M40 -44 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3z" fill="#fff6c8"/>`
    : "";
  return `<symbol id="gt-toy-${toy.id}" viewBox="-60 -60 120 120">
    <radialGradient id="gt-shade-${toy.id}" cx=".38" cy=".32" r=".75">
      <stop offset="0" stop-color="#fff" stop-opacity=".9"/>
      <stop offset=".18" stop-color="${look.body}"/>
      <stop offset="1" stop-color="${look.accent}"/>
    </radialGradient>
    ${parts.back}
    ${body(toy.id, look, { belly: !["dog", "frog"].includes(look.kind) })}
    ${parts.front}
    ${legend}
  </symbol>`;
}

/** Every toy symbol plus the silhouette filter, for the one shared <defs> of the page. */
export function sharedDefs() {
  return `<defs>
    <filter id="gt-silhouette"><feColorMatrix type="matrix" values="0 0 0 0 .15  0 0 0 0 .13  0 0 0 0 .22  0 0 0 1 0"/></filter>
    ${TOYS.map(toySymbol).join("")}
  </defs>`;
}

/** A standalone toy icon (collection book, results). Hidden toys show as a silhouette. */
export function toyIcon(toy, { size = 72, hidden = false } = {}) {
  const ring = RARITY[toy.rarity].color;
  return `<svg class="toy-icon${hidden ? " hidden" : ""}" viewBox="-60 -60 120 120" width="${size}" height="${size}" role="img" aria-label="${hidden ? "Chưa gắp được" : toy.name}">
    <circle r="56" fill="${ring}" opacity=".18"/>
    <use href="#gt-toy-${toy.id}" x="-60" y="-60" width="120" height="120"${hidden ? ` filter="url(#gt-silhouette)"` : ""}/>
  </svg>`;
}

// ----------------------------------------------------------------------------- cabinet

const BULB_COLORS = ["#ffd84a", "#ff7ab0", "#7fe0ff", "#9dff8a"];

function star(cx, cy, r, inner = 0.45) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * inner : r;
    pts.push(`${f(cx + Math.cos(a) * rr)},${f(cy + Math.sin(a) * rr)}`);
  }
  return pts.join(" ");
}

const DECOR = {
  bulbs: (t) => {
    let out = `<path d="M0 64 Q200 120 400 64" fill="none" stroke="#1a1426" stroke-width="2"/>`;
    for (let i = 0; i <= 12; i++) {
      const x = (i / 12) * 400;
      const y = 64 + 56 * (1 - ((x - 200) / 200) ** 2);
      out += `<circle class="bulb" style="animation-delay:${f(i * 0.17)}s" cx="${f(x)}" cy="${f(y + 6)}" r="6" fill="${BULB_COLORS[i % 4]}"/>`;
    }
    out += `<g opacity=".35" fill="#120c22">
      <path d="M150 400 l40 -60 l40 60z"/><rect x="186" y="400" width="8" height="100"/>
      <path d="M270 420 l34 -50 l34 50z"/><rect x="300" y="420" width="7" height="80"/>
    </g>`;
    return out;
  },
  pixels: (t) => {
    let out = "";
    for (let y = 70; y < 420; y += 28) {
      for (let x = 112; x < 400; x += 28) {
        if ((x * 7 + y * 3) % 5 === 0) out += `<rect x="${x}" y="${y}" width="12" height="12" fill="${t.neon}" opacity=".18"/>`;
      }
    }
    out += `<text x="250" y="120" text-anchor="middle" font-family="monospace" font-weight="700" font-size="40" fill="none" stroke="${t.neon}" stroke-width="2" opacity=".8" class="neon-text">GAME</text>
      <text x="250" y="150" text-anchor="middle" font-family="monospace" font-size="14" fill="#7fe0ff" opacity=".7">HI-SCORE 0990</text>`;
    return out;
  },
  lanterns: (t) => {
    let out = `<circle cx="300" cy="120" r="44" fill="#fff4c2" opacity=".9"/><circle cx="300" cy="120" r="60" fill="#fff4c2" opacity=".15"/>
      <circle cx="288" cy="110" r="7" fill="#e8d8a0" opacity=".6"/><circle cx="312" cy="132" r="5" fill="#e8d8a0" opacity=".6"/>`;
    [[150, 110, "#ff4a3a"], [210, 170, "#ffd84a"], [370, 210, "#ff7a2e"]].forEach(([x, y, c], i) => {
      out += `<line x1="${x}" y1="40" x2="${x}" y2="${y - 22}" stroke="#ffd84a" stroke-opacity=".4"/>
        <g class="sway" style="animation-delay:${i * 0.6}s"><polygon points="${star(x, y, 22)}" fill="${c}" stroke="#ffe7a0" stroke-width="1.4"/>
        <circle cx="${x}" cy="${y}" r="5" fill="#fff6c8"/></g>`;
    });
    return out;
  },
  blossoms: (t) => {
    let out = `<path d="M400 60 C340 90 300 80 250 120 M300 82 C290 110 270 120 240 150" fill="none" stroke="#3a1a10" stroke-width="5" stroke-linecap="round"/>`;
    [[350, 74], [300, 86], [262, 114], [248, 146], [322, 104], [380, 90], [280, 132]].forEach(([x, y]) => {
      let petals = "";
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        petals += `<circle cx="${f(x + Math.cos(a) * 6)}" cy="${f(y + Math.sin(a) * 6)}" r="5.2" fill="#ffd23f"/>`;
      }
      out += `${petals}<circle cx="${x}" cy="${y}" r="3" fill="#e8402e"/>`;
    });
    [[150, 180], [190, 230]].forEach(([x, y], i) => {
      out += `<g transform="rotate(${i ? 10 : -8} ${x} ${y})"><rect x="${x - 14}" y="${y - 20}" width="28" height="40" rx="3" fill="#e8202a" stroke="#ffd23f" stroke-width="1.5"/>
        <circle cx="${x}" cy="${y - 4}" r="6" fill="none" stroke="#ffd23f" stroke-width="1.5"/></g>`;
    });
    return out;
  },

  // ------------------------------------------------- seasonal backdrops (src/core/events.js)

  tet: (t) => `${DECOR.blossoms(t)}
    ${[[150, 120], [360, 170]].map(([x, y], i) => `<line x1="${x}" y1="70" x2="${x}" y2="${y - 22}" stroke="#ffd23f" stroke-opacity=".5"/>
      <g class="sway" style="animation-delay:${i * 0.8}s"><ellipse cx="${x}" cy="${y}" rx="20" ry="24" fill="#e8202a" stroke="#ffd23f" stroke-width="1.6"/>
      <rect x="${x - 10}" y="${y - 28}" width="20" height="6" rx="2" fill="#ffd23f"/><rect x="${x - 10}" y="${y + 22}" width="20" height="6" rx="2" fill="#ffd23f"/>
      <path d="M${x} ${y + 28} v14" stroke="#ffd23f" stroke-width="2"/>
      <text x="${x}" y="${y + 7}" text-anchor="middle" font-size="18" font-weight="800" fill="#ffd23f" font-family="serif">福</text></g>`).join("")}`,

  hearts: () => [[140, 110, 1.2, "#ff6fae"], [210, 180, 0.8, "#ff9ac8"], [300, 100, 1.6, "#ff3f8a"], [370, 200, 1], [250, 260, 0.9, "#ffc2e0"],
    [160, 300, 0.7, "#ff6fae"], [340, 300, 1.1, "#ff3f8a"]].map(([x, y, s, c = "#ff8fb8"], i) =>
    `<g class="float" style="animation-delay:${f(i * 0.45)}s"><path transform="translate(${x} ${y}) scale(${s})" d="${HEART}" fill="${c}" opacity=".85"/></g>`).join(""),

  flowers: () => {
    const heads = [[180, 130, "#ff5f8f"], [220, 100, "#ffd84a"], [262, 92, "#ff8ad0"], [302, 108, "#ff5f8f"], [338, 140, "#ffffff"], [240, 150, "#ffb347"], [290, 158, "#ff8ad0"]];
    let out = heads.map(([x, y]) => `<path d="M260 330 Q${f((x + 260) / 2)} ${y + 90} ${x} ${y + 14}" fill="none" stroke="#3a8a3a" stroke-width="3"/>`).join("");
    out += heads.map(([x, y, c]) => `<path d="M${x - 12} ${y} Q${x - 14} ${y + 18} ${x} ${y + 20} Q${x + 14} ${y + 18} ${x + 12} ${y} L${x + 6} ${y + 8} L${x} ${y - 4} L${x - 6} ${y + 8}Z" fill="${c}" stroke="#000" stroke-opacity=".15"/>`).join("");
    out += `<path d="M232 300 L288 300 L272 350 L248 350Z" fill="#f4e0ff" opacity=".85"/>
      <path d="M248 318 q12 10 24 0 M260 318 l-14 22 M260 318 l14 22" fill="none" stroke="#ff5fa8" stroke-width="3" stroke-linecap="round"/>`;
    return out;
  },

  flag: () => `<g transform="translate(0 22)"><line x1="330" y1="56" x2="330" y2="330" stroke="#d8d8e0" stroke-width="5" stroke-linecap="round"/>
    <circle cx="330" cy="54" r="5" fill="#ffd23f"/>
    <g class="wave"><path d="M184 66 Q220 56 257 66 T330 66 L330 160 Q293 150 257 160 T184 160Z" fill="#da251d"/>
    <polygon points="${star(257, 113, 28, 0.38)}" fill="#ffde00"/></g></g>
    ${firework(150, 230, 34, "#ffd23f", 0)}${firework(230, 210, 26, "#ff6a5a", 0.9)}${firework(370, 250, 28, "#fff4c2", 1.7)}`,

  balloons: () => [[150, 150, "#ff5a5a"], [200, 110, "#ffd84a"], [250, 150, "#7fe0ff"], [300, 100, "#9dff8a"], [350, 140, "#ff7ab0"], [225, 200, "#c49aff"]]
    .map(([x, y, c], i) => `<g class="float" style="animation-delay:${f(i * 0.5)}s">
      <path d="M${x} ${y + 34} q-8 30 4 60 q10 30 -2 60" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.4"/>
      <ellipse cx="${x}" cy="${y}" rx="24" ry="30" fill="${c}"/><path d="M${x - 4} ${y + 30} h8 l-4 6z" fill="${c}"/>
      <ellipse cx="${x - 8}" cy="${y - 10}" rx="6" ry="9" fill="#fff" opacity=".35"/></g>`).join(""),

  halloween: () => {
    let out = `<circle cx="300" cy="110" r="48" fill="#ffe9a8"/><circle cx="300" cy="110" r="66" fill="#ffe9a8" opacity=".12"/>`;
    out += [[180, 90, 1], [230, 140, 0.7], [360, 70, 0.8], [260, 70, 0.6]].map(([x, y, s], i) =>
      `<g class="float" style="animation-delay:${i * 0.6}s"><path transform="translate(${x} ${y}) scale(${s})" d="M0 0 C-8 -10 -18 -8 -26 -14 C-22 -4 -24 4 -30 8 C-20 4 -10 6 0 12 C10 6 20 4 30 8 C24 4 22 -4 26 -14 C18 -8 8 -10 0 0Z" fill="#120a18"/></g>`).join("");
    out += [[150, 300, 1], [350, 290, 1.25]].map(([x, y, s]) => `<g transform="translate(${x} ${y}) scale(${s})">
      <ellipse cx="-14" cy="0" rx="16" ry="22" fill="#e86a10"/><ellipse cx="14" cy="0" rx="16" ry="22" fill="#e86a10"/><ellipse cx="0" cy="0" rx="18" ry="24" fill="#ff8a1e"/>
      <path d="M-2 -24 q2 -10 8 -12" fill="none" stroke="#3a6a2a" stroke-width="4" stroke-linecap="round"/>
      <path d="M-14 -6 l6 -8 l6 8z M2 -6 l6 -8 l6 8z M-12 8 l4 4 l4 -4 l4 4 l4 -4 l4 4 l4 -4" fill="#ffe08a" stroke="#ffe08a" stroke-width="1.5"/></g>`).join("");
    return out;
  },

  teacher: () => `<rect x="130" y="72" width="240" height="132" rx="6" fill="#1f4a34" stroke="#8a5a2a" stroke-width="8"/>
    <text x="250" y="124" text-anchor="middle" font-size="28" font-style="italic" font-weight="700" fill="#f4f1e0" font-family="Georgia, serif">Tri ân Thầy Cô</text>
    <text x="250" y="168" text-anchor="middle" font-size="24" fill="#ffe08a" font-family="Georgia, serif">20 · 11</text>
    <path d="M150 190 h40 M300 190 h50" stroke="#f4f1e0" stroke-opacity=".4" stroke-width="2"/>
    <rect x="300" y="196" width="28" height="6" rx="2" fill="#fff"/>
    ${[[160, 262, "#ff4a5a"], [182, 252, "#ff8ad0"], [172, 278, "#ffd84a"]].map(([x, y, c]) => `<path d="M${x} ${y + 10} q-4 30 8 60" fill="none" stroke="#3a8a3a" stroke-width="3"/>
      <circle cx="${x}" cy="${y}" r="11" fill="${c}"/><circle cx="${x}" cy="${y}" r="5" fill="#000" opacity=".15"/>`).join("")}
    <g transform="rotate(-6 340 280)"><rect x="306" y="262" width="70" height="14" rx="2" fill="#3a6aa8"/><rect x="310" y="276" width="64" height="14" rx="2" fill="#c8402e"/><rect x="304" y="290" width="72" height="14" rx="2" fill="#e8b04a"/></g>`,

  culture: () => {
    const cx = 250;
    const cy = 168;
    let out = `<circle cx="${cx}" cy="${cy}" r="96" fill="#6a4a22" opacity=".9"/>`;
    out += [94, 80, 62, 44].map((r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#e0b25a" stroke-width="2" stroke-opacity=".8"/>`).join("");
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const p = (r, da) => `${f(cx + Math.cos(a + da) * r)},${f(cy + Math.sin(a + da) * r)}`;
      out += `<polygon points="${p(40, 0)} ${p(12, 0.16)} ${p(12, -0.16)}" fill="#ffd27a"/>`;
    }
    out += `<circle cx="${cx}" cy="${cy}" r="12" fill="#ffd27a"/>`;
    // Lạc birds flying round the drum face, between the two outer rings.
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const x = f(cx + Math.cos(a) * 71);
      const y = f(cy + Math.sin(a) * 71);
      out += `<path transform="translate(${x} ${y}) rotate(${f((a * 180) / Math.PI + 90)})" d="M-8 2 Q-3 -4 0 0 Q3 -4 8 2 M0 0 v6" fill="none" stroke="#ffe7a8" stroke-width="1.8" stroke-linecap="round"/>`;
    }
    // Two nón lá.
    out += [[140, 300, 1], [365, 290, 0.8]].map(([x, y, s]) => `<g transform="translate(${x} ${y}) scale(${s})">
      <path d="M-34 0 L0 -22 L34 0Z" fill="#f1dca0" stroke="#b8975a"/>
      <path d="M-22 -7 L22 -7 M-12 -14 L12 -14" stroke="#b8975a" stroke-width="1"/></g>`).join("");
    return out;
  },

  noel: () => {
    let out = `<path d="M180 72 a30 30 0 1 0 22 48 a24 24 0 1 1 -22 -48z" fill="#fff4c2" opacity=".9"/>`;
    out += `<rect x="322" y="290" width="16" height="26" fill="#6a3a1a"/>
      <polygon points="330,92 290,170 370,170" fill="#1f6a3a"/><polygon points="330,140 280,230 380,230" fill="#1a5a32"/>
      <polygon points="330,196 270,296 390,296" fill="#164e2c"/>
      <polygon points="${star(330, 88, 14, 0.42)}" fill="#ffd84a" class="bulb"/>`;
    out += [[318, 160, "#ff4a4a"], [344, 205, "#ffd84a"], [304, 222, "#7fe0ff"], [352, 262, "#ff4a4a"], [300, 276, "#ffd84a"], [330, 250, "#ff7ab0"]]
      .map(([x, y, c], i) => `<circle class="bulb" style="animation-delay:${f(i * 0.27)}s" cx="${x}" cy="${y}" r="6" fill="${c}"/>`).join("");
    out += [[150, 270, "#d81f3c", "#ffd84a"], [196, 286, "#2a7ad8", "#fff"]].map(([x, y, c, r]) =>
      `<rect x="${x}" y="${y}" width="36" height="30" rx="3" fill="${c}"/><rect x="${x + 15}" y="${y}" width="6" height="30" fill="${r}"/>
      <path d="M${x + 18} ${y} q-10 -12 -14 0 M${x + 18} ${y} q10 -12 14 0" fill="none" stroke="${r}" stroke-width="2.5"/>`).join("");
    for (let i = 0; i < 18; i++) {
      const x = 104 + ((i * 97) % 290);
      const y = 40 + ((i * 53) % 160);
      out += `<circle class="snow" style="animation-delay:${f(-(i * 0.71) % 6)}s" cx="${x}" cy="${y}" r="${2 + (i % 3)}" fill="#fff" opacity=".8"/>`;
    }
    return out;
  },

  newyear: (t, skin) => {
    const year = (skin?.year ?? 2026) + 1;
    let out = `${firework(170, 110, 40, "#ffd84a", 0)}${firework(320, 90, 34, "#ff7ab0", 0.7)}${firework(250, 190, 30, "#9ad8ff", 1.4)}${firework(360, 220, 24, "#9dff8a", 2)}`;
    out += `<text x="250" y="300" text-anchor="middle" font-size="64" font-weight="900" fill="none" stroke="${t.neon}" stroke-width="2.5" class="neon-text" font-family="system-ui, sans-serif">${year}</text>`;
    out += `<g transform="translate(140 250)"><circle r="26" fill="#fff4c2" stroke="#ffd84a" stroke-width="3"/>
      <path d="M0 0 V-18 M0 0 L-2 -16" stroke="#2a1a24" stroke-width="3" stroke-linecap="round"/><circle r="3" fill="#2a1a24"/></g>`;
    return out;
  },
};

const HEART = "M0 6 C-4 -2 -14 -2 -14 6 C-14 12 -6 16 0 22 C6 16 14 12 14 6 C14 -2 4 -2 0 6Z";

/** A firework: rays round a centre that burst out, fade and repeat. */
function firework(cx, cy, r, color, delay) {
  let rays = "";
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    rays += `<line x1="${f(cx + Math.cos(a) * r * 0.3)}" y1="${f(cy + Math.sin(a) * r * 0.3)}" x2="${f(cx + Math.cos(a) * r)}" y2="${f(cy + Math.sin(a) * r)}" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>`;
  }
  return `<g class="firework" style="animation-delay:${delay}s">${rays}<circle cx="${cx}" cy="${cy}" r="3" fill="#fff"/></g>`;
}

/** Every decoration name, so content tests can check each theme names a real one. */
export const DECORS = Object.keys(DECOR);

/** A machine's colours, with a seasonal backdrop's colours on top when one is on. */
export function themeOf(cab, skin = null) {
  return skin ? { ...cab.theme, ...skin.event.theme } : cab.theme;
}

/** The seasonal banner hung under the rail: "🥁 Ngày Văn hóa Việt Nam · 24/11". */
function eventBanner(skin, t) {
  const text = `${skin.event.banner}${skin.day ? ` · ${skin.day}/${skin.month}` : ""}`;
  const w = Math.min(300, 40 + text.length * 8.6);
  return `<g class="event-banner">
    <rect x="${f(250 - w / 2)}" y="40" width="${f(w)}" height="26" rx="13" fill="#000" fill-opacity=".45" stroke="${t.neon}" stroke-opacity=".7"/>
    <text x="250" y="58" text-anchor="middle" font-size="14" font-weight="700" fill="${t.neon}" font-family="system-ui, sans-serif">${esc(text)}</text>
  </g>`;
}

/** The back of the machine: wall, decoration, floor. `skin` is an optional seasonal backdrop. */
export function cabinetBack(cab, skin = null) {
  const t = themeOf(cab, skin);
  return `<defs>
      <linearGradient id="gt-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${t.wall2}"/><stop offset="1" stop-color="${t.wall}"/>
      </linearGradient>
      <linearGradient id="gt-glass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/>
        <stop offset=".7" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="gt-metal" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f4f6fb"/><stop offset=".5" stop-color="#a9b2c4"/><stop offset="1" stop-color="#6b7488"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="${BOX.width}" height="${BOX.floor}" fill="url(#gt-wall)"/>
    ${DECOR[t.decor](t, skin)}
    ${skin ? eventBanner(skin, t) : ""}
    <rect x="${BOX.divider}" y="${BOX.floor - 6}" width="${BOX.width - BOX.divider}" height="10" fill="${t.floor}"/>
    <rect x="0" y="${BOX.floor - 2}" width="${BOX.divider}" height="8" fill="#05040a"/>`;
}

/** The glass, the chute, the rail and the front panel, drawn over the toys. */
export function cabinetFront(cab, skin = null) {
  const t = themeOf(cab, skin);
  return `<rect x="${BOX.divider - 3}" y="${BOX.dividerTop}" width="6" height="${BOX.floor - BOX.dividerTop}" fill="#bfe8ff" opacity=".35"/>
    <rect x="${BOX.divider - 3}" y="${BOX.dividerTop}" width="6" height="3" fill="#e8f8ff" opacity=".8"/>
    <rect x="0" y="0" width="${BOX.width}" height="${BOX.floor}" fill="url(#gt-glass)" pointer-events="none"/>
    <rect x="0" y="${BOX.gantryY - 5}" width="${BOX.width}" height="10" rx="3" fill="url(#gt-metal)"/>
    <g class="front-panel">
      <rect x="-12" y="${BOX.floor + 4}" width="${BOX.width + 24}" height="60" rx="10" fill="#14101e"/>
      <rect x="10" y="${BOX.floor + 12}" width="76" height="44" rx="8" fill="#05040a" stroke="${t.neon}" stroke-width="2"/>
      <text x="48" y="${BOX.floor + 39}" text-anchor="middle" font-size="11" font-weight="700" fill="${t.neon}" font-family="system-ui, sans-serif">LẤY QUÀ</text>
      <path d="M${BOX.divider + 22} ${BOX.floor + 34} h${BOX.width - BOX.divider - 44}" stroke="${t.neon}" stroke-opacity=".35" stroke-width="2" stroke-dasharray="2 8" stroke-linecap="round"/>
    </g>
    <rect x="-12" y="-44" width="${BOX.width + 24}" height="${BOX.floor + 112}" rx="18" fill="none" stroke="${t.neon}" stroke-width="5" class="neon-frame"/>
    <text x="${BOX.width / 2}" y="-12" text-anchor="middle" font-size="22" font-weight="800" fill="${t.neon}" class="neon-text" font-family="system-ui, sans-serif">${cab.name.toUpperCase()}</text>`;
}

/** The claw, drawn around its grab point (0, 0). The fingers turn with `open`. */
export function clawSvg() {
  const finger = `<path d="M0 0 C-3 8 -12 14 -12 24 C-12 30 -6 34 -2 31 C-6 28 -7 22 -3 14 C0 9 3 5 2 0Z" fill="url(#gt-metal)" stroke="#4a5266" stroke-width="1"/>`;
  return `<g id="gt-claw">
    <line id="gt-rope" x1="0" y1="0" x2="0" y2="0" stroke="#d8dde8" stroke-width="2.4"/>
    <rect id="gt-carriage" x="-16" y="${BOX.gantryY - 9}" width="32" height="18" rx="5" fill="#3a4258" stroke="#a9b2c4"/>
    <g id="gt-head">
      <g id="gt-finger-l" transform="translate(0 -22)">${finger}</g>
      <g id="gt-finger-r" transform="translate(0 -22) scale(-1 1)">${finger}</g>
      <rect x="-15" y="-44" width="30" height="20" rx="6" fill="url(#gt-metal)" stroke="#4a5266"/>
      <circle cx="0" cy="-22" r="6" fill="#4a5266"/>
      <circle cx="0" cy="-36" r="3" fill="#ff5a5a" class="claw-led"/>
    </g>
  </g>`;
}
