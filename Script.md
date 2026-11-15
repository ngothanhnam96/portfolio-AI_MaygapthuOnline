# 🎬 Gắp Thú: Presentation Script

A script for showing the claw-machine game to a customer, in a live demo or a screen-recorded
video. It runs about **3 minutes**. Shorter versions for a quick pitch or a social post are at
the end.

> **Live link:** https://ngothanhnam96.github.io/portfolio-AI_MaygapthuOnline/
> (check before presenting)

---

## Before you start

- [ ] Open the live link in a fresh browser window, full screen, sound **on**.
- [ ] Clear saved progress (DevTools → Application → Local Storage, keys starting `gapthu:`)
      so the collection book is empty and only the first machine is open.
- [ ] Have a phone ready with the same link, to show the touch controls.
- [ ] Optional: open `?debug&play=cho-dem&seed=11` for a pile you have practised on. In that
      pile, holding ▶ for about half a second puts the claw over the brown bear. Rehearse it,
      because the result still depends on your exact aim.
- [ ] Optional: in the console, `__gt.unlockAll()` opens every machine if you want to show the
      Tết machine without earning stars first.

---

## Main script (≈ 3 min)

### Scene 1: The hook (0:00 – 0:20)

**On screen:** the home screen, the neon "Gắp Thú" title flickering, the four machine cards.

**Say (EN):**
> "Everyone has stood in front of a claw machine, sure that this time the bear will hold on.
> This is *Gắp Thú*, that same feeling in the browser, set in the arcade corners of a
> Vietnamese night market."

**Say (VI):**
> "Ai cũng từng đứng trước máy gắp thú và tin rằng lần này chú gấu sẽ không tuột. Đây là
> *Gắp Thú*, cảm giác đó ngay trên trình duyệt, trong góc chợ đêm quen thuộc."

---

### Scene 2: Choose a machine (0:20 – 0:40)

**On screen:** hover the machine cards. Point to the coins, the claw strength and the locked
machines.

**Say:**
> "There are four machines: a night-market corner, an old arcade, a Mid-Autumn night and a Tết
> fair. Each has its own coins, its own claw strength and its own toys. One star opens the
> next machine, so players always have something to chase."

**Action:** click **Góc Chợ Đêm**.

---

### Scene 3: Inside the machine (0:40 – 1:10)

**On screen:** the cabinet with bulbs, the pile of plush toys, the claw beside the chute.

**Say:**
> "Everything here is drawn in code: the toys, the machine and the claw. There are no image
> files. The toys are a real physics pile. They fall, roll and settle, and a glass wall keeps
> them away from the prize chute."

**Action:** hold ▶ and let go sharply so the claw swings.

> "The claw hangs on a cable. Stop hard and it swings, just like the real one. Drop while it
> is swinging and it lands off target. Good players wait for it to steady."

---

### Scene 4: The grab (1:10 – 2:00)

**Action 1:** line the dotted guide up with the middle of a toy and press **THẢ**.

> "Every coin is one try. The claw drops, closes and lifts. How well it holds depends on how
> centred you are, how heavy the toy is, how slippery its fabric is, and whether something is
> lying on top of it."

If it wins: point to the sparkles at the chute and the toast *"Gắp được …!"*.
If it slips: *"Ối! … tuột khỏi càng."*

> "And sometimes it slips, right at the top. That is the moment that makes people put in one
> more coin."

**Action 2:** win a second toy in a row and point to the **COMBO ×1.5** pop-up.

> "Wins in a row build a combo, up to triple points. A toy that tumbles into the chute on its
> own pays a lucky bonus, and two toys in one drop pay a double bonus."

---

### Scene 5: Result and collection (2:00 – 2:30)

**On screen:** finish the coins (or run `__gt.coins(1)` and drop once). The result card shows
stars, score, the toys won marked **MỚI**, and the breakdown.

> "At the end you get stars, your score and every toy you took home."

**Action:** go to **Bộ sưu tập**.

> "Every toy goes into the collection book. Twelve original plush animals, from the common
> cat to the legendary baby dragon that only lives in the Tết machine. The ones you have not
> won yet are silhouettes, which keeps people playing."

---

### Scene 6: Phone and close (2:30 – 3:00)

**On screen:** the phone. Drag a finger across the glass to move the claw, then tap THẢ.

> "On a phone you just drag across the glass and tap. If you close the tab in the middle of a
> grab, the round is saved exactly, swing and all, and continues when you come back."

**Closing line:**
> "Gắp Thú turns a two-minute arcade moment into something people come back to. It loads
> instantly, needs no install, and the machines, toys and prizes can be themed for your brand,
> your event or your shop. Let's talk about the machine you want to build."

---

## Selling points to have ready

Use these when the customer asks questions.

| They ask | You answer |
|----------|-----------|
| "Who is it for?" | Shops and malls (online lucky draws), brand campaigns, events and festivals, cafés and game corners, kids' learning sites. |
| "Can it use our characters or products?" | Yes. Each toy is one entry (size, weight, grip, rarity) plus one SVG drawing, and each machine is one entry with its coins, claw strength, toy mix and theme. |
| "Can it give real prizes or vouchers?" | The rules are already separate from the screen, so a prize table or voucher codes can be attached to rarities. Real prizes would need a server check, which is the next step. |
| "Does it need an app?" | No. It runs in any modern browser, on desktop or phone. No install, no login. |
| "Is it heavy?" | No dependencies, no build step, no image files. The art is SVG and the sound is synthesised. |
| "Is it fair? Can we tune it?" | Every machine has a claw-strength setting, and every toy has weight and grip. The game is seeded, so any round can be replayed exactly to check it. |
| "How do we know it works?" | 46 automated tests check that every toy can be won, that three stars are reachable on every machine, that the physics stays stable, and that saved rounds resume exactly. |
| "Can people play with a keyboard?" | Yes: arrow keys to move, Space to drop, P to pause. Every button can be reached with Tab. |

---

## Short versions

### 30-second pitch

> "Gắp Thú is a claw-machine game you play in the browser, set in a Vietnamese night market.
> Plush toys pile up with real physics, the claw swings on its cable, and a loose grip slips
> right at the top, just like the real thing. Win toys for your collection book, chain combos
> and unlock four themed machines. It runs on any phone or laptop with nothing to install, and
> we can theme the machines and toys around your own brand or event."

### Social post / message to a client

> 🧸 **Gắp Thú**: a claw machine you can play in your browser.
>
> Four machines, from a night-market corner to a Tết fair, full of plush cats, buffalo, carp,
> lion dancers and one very rare baby dragon. Line up the claw, drop it, and hope the toy holds
> on all the way to the chute.
>
> 🎯 Real physics: toys pile, roll and slip
> 🪝 A claw that swings, so timing matters
> 🔥 Combos, lucky drops and double catches
> 📒 A collection book with 12 original plush toys
> 📱 Works on phone and desktop, nothing to install
>
> Play it here: https://ngothanhnam96.github.io/portfolio-AI_MaygapthuOnline/
> Want a machine with your own characters or prizes? Message me.

### Bài đăng tiếng Việt

> 🧸 **Gắp Thú**: máy gắp thú bông ngay trên trình duyệt.
>
> Bốn máy gắp từ góc chợ đêm, tiệm game phố cũ, đêm Trung Thu đến phiên chợ Tết. Bên trong là
> mèo mướp, trâu nước, cá chép, lân con và một chú rồng con cực hiếm. Canh càng thật giữa, bấm
> THẢ và cầu cho thú đừng tuột trước khi tới máng!
>
> 🎯 Thú bông chồng lên nhau, lăn và trượt như thật
> 🪝 Càng gắp đung đưa, phải canh thời điểm
> 🔥 Combo, gắp đôi, thú tự lăn vào máng
> 📒 Bộ sưu tập 12 bé thú bông
>
> Chơi ngay: https://ngothanhnam96.github.io/portfolio-AI_MaygapthuOnline/
