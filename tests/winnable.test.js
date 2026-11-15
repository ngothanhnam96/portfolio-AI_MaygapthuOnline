import test from "node:test";
import assert from "node:assert/strict";
import { CABINETS } from "../src/core/cabinets.js";
import { createGame, summary } from "../src/core/game.js";
import { aimAt, autoplay, playDrop } from "./support/bot.js";

// Every toy in every machine it appears in can actually be won: alone on the floor, with a
// centred drop, some seed carries it all the way into the chute.
test("every toy can be won in every machine that holds it", () => {
  for (const cab of CABINETS) {
    for (const [id] of cab.mix) {
      let won = 0;
      for (let seed = 1; seed <= 20; seed++) {
        const g = createGame(cab.id, seed, { layout: [{ toy: id, x: 260 }] });
        aimAt(g, 260);
        playDrop(g);
        if (g.caught.some((c) => c.toy === id)) won++;
      }
      assert.ok(won >= 4, `${cab.id}: ${id} was won only ${won}/20 times with a perfect drop`);
    }
  }
});

// The star targets are reachable: a careful player earns three stars on some rounds, and
// one star on most.
test("every machine's three stars are reachable, and one star is within most players' reach", () => {
  for (const cab of CABINETS) {
    const stars = [];
    for (let seed = 1; seed <= 12; seed++) {
      const g = createGame(cab.id, seed);
      autoplay(g);
      stars.push(summary(g).stars);
    }
    assert.ok(stars.includes(3), `${cab.id}: no three-star round in 12 (${stars})`);
    assert.ok(stars.filter((s) => s >= 1).length >= 9, `${cab.id}: one star is too hard (${stars})`);
  }
});
