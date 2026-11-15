# 🧸 Gắp Thú — Claw Machine

A claw-machine game for the browser, set in the arcade corners of a Vietnamese night market.
Move the claw, drop it, and hope the plush holds on all the way to the chute. Toys pile up and
roll with real 2D physics, the claw swings on its cable, and a loose grip lets go halfway up.

Zero dependencies, no build step, no image files. Every toy, machine and the claw are drawn in
SVG from code, and the sound is synthesised with WebAudio.

## The machines

| Machine | Theme | Coins | Claw | Star targets | Rarest toy |
|---------|-------|-------|------|--------------|------------|
| 🏮 Góc Chợ Đêm | A string of coloured bulbs over a night-market stall | 10 | 100% | 50 / 120 / 190 | Gấu Nâu (Hiếm) |
| 👾 Tiệm Game Phố Cũ | Pixel neon and a flickering hi-score | 9 | 92% | 50 / 120 / 190 | Trâu Nước, Cá Chép Đỏ (Hiếm) |
| 🌕 Đêm Trung Thu | Full moon and swaying star lanterns | 8 | 85% | 60 / 140 / 220 | Thỏ Ngọc, Lân Con (Quý) |
| 🧧 Phiên Chợ Tết | Apricot blossoms and red envelopes | 8 | 80% | 70 / 160 / 240 | Rồng Con (Huyền thoại) |

One star on a machine unlocks the next.

## The toys

Twelve original plush animals in four rarities: Mèo Mướp, Cún Vàng, Gà Con, Heo Đất, Ếch
Xanh (Thường, 10 points), Trâu Nước, Cá Chép Đỏ, Gấu Nâu (Hiếm, 25), Thỏ Ngọc, Voi Con, Lân
Con (Quý, 60) and Rồng Con (Huyền thoại, 150). Each has its own size, weight and fabric grip:
the chick is tiny, the elephant is heavy, and the satin carp slips.

## Features

- **Real claw feel:**
  - The claw hangs on a damped pendulum. Stop hard and it swings, and a swinging claw lands
    off target.
  - Grip depends on how centred the drop is, the toy's weight and fabric, the machine's claw
    strength, and whether another toy is lying on top.
  - A weak grip slips while lifting. A firm grip can still fly off if the claw swings too hard
    on the way back.
- **Physics:** toys fall, pile, roll and settle. A glass divider guards the chute, and a toy
  that tumbles over it still counts.
- **Scoring:**
  - Points by rarity.
  - A combo multiplier for winning drops in a row (up to ×3).
  - +15 for a lucky tumble into the chute, +30 for each extra toy in one drop.
  - +100 for emptying the machine, plus 20 for every coin left.
- **Collection book (Bộ sưu tập):** every toy you win is kept with a count and a short blurb.
  Toys you have not won show as silhouettes.
- **Controls:** on-screen ◀ THẢ ▶ buttons, the arrow keys and Space, or drag on the glass. A
  dotted guide shows where the claw will land, and you have 15 s to aim each coin.
- **Saving:** best score and stars per machine, the collection and your name are saved.
  Leaving mid-round saves the exact state, mid-swing included, and the home screen offers
  **Chơi tiếp**.
- **Phones:** the machine scales to the screen, with big touch buttons under it.
  Reduced-motion settings are respected.

## Run it

```bash
npm start    # http://127.0.0.1:5173
npm test     # 46 tests, about a second, no dependencies
```

## What the tests prove

- **Every toy can be won** in every machine that holds it: with a perfect drop, each is won at
  least 4 times in 20 seeds.
- **Every machine's three stars are reachable**, and one star is within reach in most rounds.
- **Physics:**
  - Piles start at rest, inside the walls, with no overlaps.
  - A settled pile does not creep (less than 0.5 px in 10 s).
  - The divider holds, and the chute takes toys.
- **Determinism:**
  - The same seed and inputs replay the same round byte for byte.
  - A round saved mid-carry resumes exactly.
- **Rules:**
  - Coins, the aim timer and auto-drop.
  - Misses and the grip rules.
  - Lucky and double bonuses, clear bonus and refund.
  - The score always equals the sum of its explained lines.
- **Artwork:** every toy, machine and the claw is well-formed SVG with unique, prefixed ids,
  and every `url(#…)` and `href="#…"` points to something real.
- **Safety:** the player's name is escaped wherever it reaches the markup.

## Docs

| | |
|---|---|
| [01-SPEC](docs/01-SPEC.md) | Goal, game loop, requirements |
| [02-DESIGN](docs/02-DESIGN.md) | Architecture, physics, claw, scoring, art |
| [03-TASKS](docs/03-TASKS.md) | What was built, what comes next |
| [04-TESTING](docs/04-TESTING.md) | Test suites and the browser playthrough |
| [05-DEPLOY](docs/05-DEPLOY.md) | GitHub Pages, debug hooks, storage |
| [Script](Script.md) | Presentation script for demos |

## Licence

MIT — see [LICENSE](LICENSE).
