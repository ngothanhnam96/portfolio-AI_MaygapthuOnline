# 04 · Testing

`npm test` runs `node --test`: 46 tests in about a second, no dependencies.

| Suite | What it proves |
|-------|----------------|
| `physics.test.js` | For 7 seeds, every machine's pile starts at rest on the play side, inside the walls, with no toys sinking into each other. A settled pile moves less than 0.5 px in 10 s. The same seed gives the same pile and another seed a different one. Toys fall through the chute, the divider stops a rolling toy, and a toy on the divider's edge tips off. |
| `game.test.js` | Coins per drop, no double drops, the rails clamp the claw, drag-to-aim, swing after a stop and its damping, auto-drop after 15 s, misses, a centred grab. Grip rules: centred, off-centre, covered, weak machine, slippery carp, never certain. Lucky and double bonuses, round over on coins and on clear (with refund), score equals its lines, exact replay from a seed, save and resume mid-carry, bad saves refused. |
| `winnable.test.js` | With a perfect drop, every toy in every machine is won at least 4 times in 20. For a careful bot, every machine has a three-star round and gives one star in most rounds. |
| `score.test.js` | Combo multiplier and cap, rarity points, lucky and double lines, clear bonus, star thresholds |
| `progress.test.js` | Collection counts and new toys, best score only improves, no mutation, unlock order, titles, junk saves cleaned, name trimming |
| `art.test.js` | Every toy symbol and icon is well-formed with prefixed, unique ids; every `url(#…)` and `href="#…"` resolves; every machine draws well-formed with its marquee; the claw has the parts the stage animates; the catalogue and machine mixes are consistent |
| `text.test.js` | `esc()` neutralises markup; the player's name only reaches HTML through `esc()` |

The test bot (`tests/support/bot.js`) glides over the easiest uncovered toy, waits for the
swing to stop, and drops. It plays better than most people, so the star targets are set below
its typical score.

## Browser playthrough

Headless Chrome over the DevTools protocol, with real key presses on the real page:

| Step | Result |
|------|--------|
| Home renders at phone width with no horizontal scroll | ✅ |
| Hold → for 0.6 s, wait, press Space | ✅ the claw moved to x 240, dropped and gripped the bear |
| The claw lifts and carries back; toast "Gắp được Gấu Nâu!" | ✅ |
| Last coin: the round ends and the result card marks new toys MỚI | ✅ progress saved |
| The collection book shows caught toys, and the rest as silhouettes | ✅ |
| Console errors | none |

`?debug&play=<machine>&seed=<n>` opens a machine straight away. `window.__gt` exposes the
`game`, `coins(n)` and `unlockAll()`.
