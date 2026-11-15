# 01 · Spec

## Goal

A claw-machine game for the web that feels like the real machine in the corner of a night
market: a glass cabinet full of plush toys, a claw that swings on its cable, toys that slip,
and a jolt of luck when one drops into the chute. It must look polished with no image files
and run on any phone without an install.

## Game loop

1. On the home screen, pick a machine. Each one has its own theme, coins, claw strength and toys.
2. The claw starts next to the chute. Move it left and right with the buttons, the arrow keys,
   or by dragging on the glass. A dotted guide shows where it will land.
3. Press **THẢ**. One coin is spent. The claw drops, closes and lifts, then carries the toy back
   to the chute on its own.
4. The toy can slip while lifting (weak grip), or fly off if the claw swings too hard on the way
   back (firm grip, but not firm enough). Slipped toys tumble into the pile, and sometimes into
   the chute.
5. When the coins run out or the machine is empty, the result card shows the score, the stars
   and the new toys added to the collection book.

## Requirements

| # | Requirement |
|---|-------------|
| R1 | Four themed machines: Góc Chợ Đêm, Tiệm Game Phố Cũ, Đêm Trung Thu, Phiên Chợ Tết |
| R2 | Twelve original plush toys in four rarities (Thường, Hiếm, Quý, Huyền thoại), all drawn in SVG |
| R3 | 2D physics: toys pile up, roll and settle; a glass divider separates the pile from the chute |
| R4 | The claw hangs on a damped pendulum; grip depends on centring, the toy's weight and fabric, the machine, and whether the toy is buried |
| R5 | Limited coins per round, 15 s to aim per coin, score from rarity, combo streaks and bonuses, 1–3 stars |
| R6 | Collection book and best score per machine are saved; each machine unlocks with one star on the one before |
| R7 | An unfinished round survives a reload or a closed tab exactly as it was |
| R8 | Mouse, touch and keyboard; phone layout; reduced motion respected |
| R9 | All game rules are pure and seeded, so tests can replay any round exactly |

## Out of scope (for now)

- Online leaderboards, real payments or prizes.
- Moving the claw toward the front or back. The machine is a side view, so only left and right.
