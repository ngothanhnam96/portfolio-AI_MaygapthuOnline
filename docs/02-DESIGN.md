# 02 · Design

## Layout

```
index.html, styles.css, favicon.svg
src/
  main.js            screens, input, game loop, saving
  core/              pure rules, no DOM, all seeded
    rng.js           mulberry32; its state is one number, so a round saves as JSON
    toys.js          the 12 toys: size, mass, grip, rarity, look, blurb
    cabinets.js      the 4 machines: coins, claw power, toy mix, star targets, theme
    physics.js       circles, gravity, walls, glass divider, chute, sleeping bodies
    game.js          claw state machine, grip, coins, combos, save and restore
    score.js         points, combo multiplier, bonuses, stars
    progress.js      best scores, collection, unlocks, titles
    text.js          esc() for the player's name
  ui/
    art.js           every toy, machine and the claw as SVG strings
    stage.js         mounts the machine once, then moves transforms each frame
    audio.js         WebAudio sound effects
    storage.js       safe localStorage
```

## Physics

The physics is position-based. Each fixed 1/60 s step:

1. moves every awake toy by its velocity plus gravity;
2. pushes overlapping circles apart six times, weighted by mass, and clamps toys to the walls,
   the floor and the glass divider (a vertical segment);
3. derives each toy's velocity from how far it really moved, with friction on the floor.

A toy that is supported and nearly still for 24 steps goes to **sleep**. It stays put until
something pushes into it, or until the claw grabs or releases a toy, which wakes the whole
pile. This acts as static friction, so leaning stacks do not creep and topple by themselves.

The chute is the area left of the divider and has no floor. A toy whose centre is there and
that falls past the floor line is **out**, which counts as a win.

## The claw

Phases: `aim → drop → close → lift → carry → release → return → settle → aim`.

- **Swing.** The claw head is a damped pendulum driven by the gantry's acceleration:
  `θ'' = −(g/L)·sin θ − (a/L)·cos θ − c·θ'`. Stopping hard while aiming makes it swing, and a
  swinging claw lands off target.
- **Drop** stops on the first toy under the grab point, or on the floor.
- **Grip.** The claw takes the toy nearest its centre within reach. The chance to hold it is
  `power × grip × (0.3 + 0.7 × centred) × weight factor`. It is multiplied by 0.55 if another
  toy lies on top, and never goes above 96%. One seeded roll decides:
  - **firm**: the toy stays unless the swing on the way back passes a limit. The limit is
    higher when the roll was comfortably under the chance.
  - **weak**: the toy slips at a random height while lifting.
- **Carry** is automatic and speeds up and brakes smoothly, so most of the swing (and most
  slips) come from how the player dropped.

## Scoring

| Rule | Points |
|------|--------|
| Toy | Thường 10, Hiếm 25, Quý 60, Huyền thoại 150 |
| Combo | Winning drops in a row multiply toy points: ×1, ×1.5, ×2, ×2.5, up to ×3 |
| Lucky | +15 for a toy that falls into the chute without being carried there |
| Double | +30 for every extra toy won in the same drop |
| Clear | +100, plus 20 per unused coin, for emptying the machine |

Stars come from three score targets per machine. One star unlocks the next machine.

## Saving

A round is plain data, including the RNG state, so `snapshot()` is `JSON.stringify` and
`restore()` checks the version and the machine. The page saves after every drop, on pause, on
`pagehide` and when the tab is hidden. The home screen then offers **Chơi tiếp**.

## Art

Each toy is a `<symbol>` with its body a circle of radius 40 in a 120-unit box, so a toy with
physics radius `r` is drawn at `3r`. Ears, horns, fins and manes sit outside the body circle.
The roll angle from the physics is shown as a wobble of at most ±22°, so toys never lie upside
down. Each machine has its own back wall and decor, a glass sheen, a neon frame and a marquee:

- Góc Chợ Đêm: a string of bulbs;
- Tiệm Game Phố Cũ: pixel neon;
- Đêm Trung Thu: the moon and star lanterns;
- Phiên Chợ Tết: apricot blossoms and red envelopes.
