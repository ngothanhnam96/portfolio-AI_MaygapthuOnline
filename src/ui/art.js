// All artwork, drawn as SVG strings from code. No image files.
//
// Toys are <symbol>s in a -60…60 box with the body a circle of radius 40, so a toy of
// physics radius r is drawn with <use> at 3r × 3r. Every id starts with "gt-".

import { BOX } from "../core/physics.js";
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
};

/** The back of the machine: wall, decoration, floor. */
export function cabinetBack(cab) {
  const t = cab.theme;
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
    ${DECOR[t.decor](t)}
    <rect x="${BOX.divider}" y="${BOX.floor - 6}" width="${BOX.width - BOX.divider}" height="10" fill="${t.floor}"/>
    <rect x="0" y="${BOX.floor - 2}" width="${BOX.divider}" height="8" fill="#05040a"/>`;
}

/** The glass, the chute, the rail and the front panel, drawn over the toys. */
export function cabinetFront(cab) {
  const t = cab.theme;
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
