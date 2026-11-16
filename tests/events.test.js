import test from "node:test";
import assert from "node:assert/strict";
import { CABINETS } from "../src/core/cabinets.js";
import {
  EVENTS, LUNAR, countdownLabel, dateLabel, dayNumber, eventById, nextEvent, nextOccurrence,
  resolveBackdrop, upcoming,
} from "../src/core/events.js";
import { DECORS, cabinetBack, cabinetFront, clawSvg, themeOf } from "../src/ui/art.js";
import { assertWellFormed, idsIn } from "./support/svg.js";

const on = (y, m, d) => dayNumber(y, m, d);

test("every event is complete, with a unique id, a real decoration and valid dates", () => {
  const ids = EVENTS.map((e) => e.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate event ids");
  for (const e of EVENTS) {
    assert.ok(e.name && e.icon && e.banner, `${e.id}: name, icon and banner`);
    assert.ok(DECORS.includes(e.theme.decor), `${e.id}: unknown decor ${e.theme.decor}`);
    for (const key of ["wall", "wall2", "neon", "floor"]) assert.match(e.theme[key], /^#[0-9a-f]{6}$/i, `${e.id}: ${key}`);
    assert.ok(Boolean(e.date) !== Boolean(e.lunar), `${e.id}: exactly one of date or lunar`);
    const dates = e.lunar ? Object.values(LUNAR[e.lunar]) : [e.date];
    for (const [m, d] of dates) {
      const back = new Date(Date.UTC(2026, m - 1, d));
      assert.equal(back.getUTCMonth() + 1, m, `${e.id}: ${d}/${m} is not a real date`);
      assert.equal(back.getUTCDate(), d, `${e.id}: ${d}/${m} is not a real date`);
    }
  }
  for (const cab of CABINETS) assert.ok(DECORS.includes(cab.theme.decor), `${cab.id}: unknown decor`);
});

test("the lunar table covers this year and the next four", () => {
  for (const [name, table] of Object.entries(LUNAR)) {
    for (let y = 2026; y <= 2030; y++) assert.ok(table[y], `${name} has no date for ${y}`);
  }
});

test("the next event is the right one on known days", () => {
  const cases = [
    [[2026, 11, 16], "nhagiao", 4, false],
    [[2026, 11, 20], "nhagiao", 0, true],
    [[2026, 11, 21], "vanhoa", 3, false],
    [[2026, 11, 25], "noel", 29, false],
    [[2026, 12, 25], "noel", 0, true], // Giáng sinh runs 24 and 25 December
    [[2026, 12, 26], "namoi", 5, false],
    [[2027, 1, 1], "namoi", 0, true], // New Year's Eve runs into 1 January
    [[2027, 1, 2], "tet", 35, false], // Tết 2027 is 6 February
    [[2027, 2, 8], "tet", 0, true], // mùng 3
    [[2027, 2, 9], "valentine", 5, false],
    [[2027, 9, 3], "trungthu", 12, false], // Trung Thu 2027 is 15 September
  ];
  for (const [[y, m, d], id, daysUntil, live] of cases) {
    const next = nextEvent(on(y, m, d));
    assert.equal(next.event.id, id, `${d}/${m}/${y}`);
    assert.equal(next.daysUntil, daysUntil, `${d}/${m}/${y}: days until ${id}`);
    assert.equal(next.live, live, `${d}/${m}/${y}: ${id} live`);
  }
});

test("on every day of 2026–2030 an event is under 100 days away, and the list is sorted", () => {
  for (let day = on(2026, 1, 1); day <= on(2030, 12, 31); day++) {
    const list = upcoming(day);
    assert.ok(list.length >= EVENTS.length - 2, "events missing from the list");
    assert.ok(list[0].daysUntil < 100, `nothing within 100 days of day ${day}`);
    for (let i = 1; i < list.length; i++) assert.ok(list[i - 1].start <= list[i].start, "not sorted");
    for (const o of list) assert.ok(o.end >= day, `${o.event.id} already ended`);
  }
});

test("the New Year backdrop shows the year that is about to start", () => {
  const o = nextOccurrence(eventById("namoi"), on(2026, 12, 1));
  assert.equal(o.year, 2026);
  assert.ok(cabinetBack(CABINETS[0], o).includes(">2027<"));
});

test("saved settings resolve: off, auto, an event id, and junk", () => {
  const day = on(2026, 11, 16);
  assert.equal(resolveBackdrop("off", day), null);
  assert.equal(resolveBackdrop("auto", day).event.id, "nhagiao");
  assert.equal(resolveBackdrop("noel", day).event.id, "noel");
  assert.equal(resolveBackdrop("noel", day).daysUntil, 38);
  assert.equal(resolveBackdrop("<script>", day), null);
  assert.equal(resolveBackdrop(undefined, day), null);
  // Past the end of the lunar table the event still resolves, just without a date.
  const late = resolveBackdrop("tet", on(2031, 3, 1));
  assert.equal(late.event.id, "tet");
  assert.equal(dateLabel(late), "");
  assert.equal(countdownLabel(late), "");
});

test("labels read naturally", () => {
  const o = nextEvent(on(2026, 11, 21));
  assert.equal(dateLabel(o), "24/11");
  assert.equal(countdownLabel(o), "Còn 3 ngày");
  assert.equal(countdownLabel(nextEvent(on(2026, 11, 23))), "Ngày mai");
  assert.equal(countdownLabel(nextEvent(on(2026, 11, 24))), "Đang diễn ra");
});

test("every machine in every seasonal backdrop draws well-formed, with its banner", () => {
  const claw = clawSvg();
  const day = on(2026, 11, 16);
  for (const event of EVENTS) {
    const skin = resolveBackdrop(event.id, day);
    for (const cab of CABINETS) {
      const svg = `${cabinetBack(cab, skin)}${claw}${cabinetFront(cab, skin)}`;
      const what = `${cab.id} + ${event.id}`;
      assertWellFormed(svg, assert, what);
      const ids = idsIn(svg);
      assert.equal(new Set(ids).size, ids.length, `${what}: duplicate ids`);
      for (const ref of [...svg.matchAll(/url\(#([^)]+)\)/g)].map((m) => m[1])) {
        assert.ok(ids.includes(ref), `${what}: missing #${ref}`);
      }
      assert.ok(svg.includes(event.banner.replace(/&/g, "&amp;")), `${what}: banner`);
      assert.ok(svg.includes(cab.name.toUpperCase()), `${what}: the machine keeps its own name`);
      assert.equal(themeOf(cab, skin).neon, event.theme.neon);
    }
  }
  assert.deepEqual(themeOf(CABINETS[0], null), CABINETS[0].theme, "no backdrop leaves the machine as it was");
});
