// Draws a round into the machine <svg>: built once, then each frame only moves transforms.

import { cabinetById } from "../core/cabinets.js";
import { tipOf } from "../core/game.js";
import { BOX } from "../core/physics.js";
import { toyById } from "../core/toys.js";
import { TOY_SCALE, cabinetBack, cabinetFront, clawSvg } from "./art.js";

const NS = "http://www.w3.org/2000/svg";
const deg = (rad) => (rad * 180) / Math.PI;
const f = (n) => Math.round(n * 100) / 100;

/** `skin` is an optional seasonal backdrop (see src/core/events.js); it only changes the art. */
export function mountStage(svg, game, skin = null) {
  const cab = cabinetById(game.cabinetId);
  const toys = game.bodies.map((b, i) => {
    const s = b.r * TOY_SCALE;
    return `<g class="toy" data-i="${i}"><use href="#gt-toy-${b.toy}" x="${-s}" y="${-s}" width="${2 * s}" height="${2 * s}"/></g>`;
  }).join("");
  svg.setAttribute("viewBox", `-16 -48 ${BOX.width + 32} ${BOX.floor + 120}`);
  svg.innerHTML = `${cabinetBack(cab, skin)}
    <line id="gt-guide" x1="0" y1="0" x2="0" y2="${BOX.floor}" stroke="#fff" stroke-opacity=".28" stroke-width="2" stroke-dasharray="4 7"/>
    <g id="gt-toys">${toys}</g>
    ${clawSvg()}
    ${cabinetFront(cab, skin)}
    <g id="gt-fx"></g>`;
  const view = {
    svg,
    toys: [...svg.querySelectorAll(".toy")],
    rope: svg.querySelector("#gt-rope"),
    carriage: svg.querySelector("#gt-carriage"),
    head: svg.querySelector("#gt-head"),
    left: svg.querySelector("#gt-finger-l"),
    right: svg.querySelector("#gt-finger-r"),
    guide: svg.querySelector("#gt-guide"),
    fx: svg.querySelector("#gt-fx"),
  };
  drawStage(view, game);
  return view;
}

// Toys roll as they move, but a plush lying upside down is not cute, so the roll is shown
// as a wobble of at most ±22°.
export function drawStage(view, game) {
  game.bodies.forEach((b, i) => {
    const el = view.toys[i];
    const gone = b.out && b.y - b.r > BOX.floor + 70;
    el.style.display = gone ? "none" : "";
    if (!gone) el.setAttribute("transform", `translate(${f(b.x)} ${f(b.y)}) rotate(${f(22 * Math.sin(b.a))})`);
    el.classList.toggle("held", b.held);
  });
  const c = game.claw;
  const tip = tipOf(c);
  const s = Math.sin(c.theta);
  const co = Math.cos(c.theta);
  view.head.setAttribute("transform", `translate(${f(tip.x)} ${f(tip.y)}) rotate(${f(-deg(c.theta))})`);
  view.carriage.setAttribute("transform", `translate(${f(c.x)} 0)`);
  view.rope.setAttribute("x1", f(c.x));
  view.rope.setAttribute("y1", BOX.gantryY);
  view.rope.setAttribute("x2", f(tip.x - 44 * s));
  view.rope.setAttribute("y2", f(tip.y - 44 * co));
  const a = f(8 - c.open * 36);
  view.left.setAttribute("transform", `translate(0 -22) rotate(${a})`);
  view.right.setAttribute("transform", `translate(0 -22) scale(-1 1) rotate(${a})`);
  const aiming = c.phase === "aim";
  view.guide.style.display = aiming ? "" : "none";
  if (aiming) {
    view.guide.setAttribute("x1", f(tip.x));
    view.guide.setAttribute("x2", f(tip.x));
    view.guide.setAttribute("y1", f(tip.y + 14));
  }
}

/** A floating label (and sparkles) that rises and fades. */
export function popText(view, x, y, text, cls = "") {
  const g = document.createElementNS(NS, "g");
  g.setAttribute("class", `pop ${cls}`);
  g.setAttribute("transform", `translate(${f(x)} ${f(y)})`);
  const t = document.createElementNS(NS, "text");
  t.setAttribute("text-anchor", "middle");
  t.textContent = text;
  g.appendChild(t);
  view.fx.appendChild(g);
  setTimeout(() => g.remove(), 1400);
}

export function sparkle(view, x, y, color = "#ffd84a") {
  for (let i = 0; i < 10; i++) {
    const c = document.createElementNS(NS, "circle");
    const a = (i / 10) * Math.PI * 2;
    c.setAttribute("cx", f(x));
    c.setAttribute("cy", f(y));
    c.setAttribute("r", "3.5");
    c.setAttribute("fill", color);
    c.setAttribute("class", "spark");
    c.style.setProperty("--dx", `${f(Math.cos(a) * 46)}px`);
    c.style.setProperty("--dy", `${f(Math.sin(a) * 46)}px`);
    view.fx.appendChild(c);
    setTimeout(() => c.remove(), 900);
  }
}

/** Convert a pointer's clientX to machine x. */
export function machineX(view, clientX, clientY) {
  const pt = view.svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const m = view.svg.getScreenCTM();
  return m ? pt.matrixTransform(m.inverse()).x : null;
}

export function toyName(id) {
  return toyById(id).name;
}
