// Screens, input and the game loop. The rules live in src/core; this file only wires them
// to the page.

import { CABINETS, cabinetById } from "./core/cabinets.js";
import {
  countdownLabel, dateLabel, dayNumber, eventById, nextEvent, resolveBackdrop, today, upcoming,
} from "./core/events.js";
import { AIM_TIME, DT, canDrop, createGame, drop, restore, setAim, snapshot, step, summary } from "./core/game.js";
import { BOX } from "./core/physics.js";
import {
  cleanName, cleanProgress, collected, isUnlocked, recordRound, titleFor, totalStars,
} from "./core/progress.js";
import { BONUS, multiplier } from "./core/score.js";
import { esc } from "./core/text.js";
import { RARITY, TOYS, toyById } from "./core/toys.js";
import { sharedDefs, themeOf, toyIcon } from "./ui/art.js";
import { isMuted, setMuted, sfx } from "./ui/audio.js";
import { drawStage, machineX, mountStage, popText, sparkle } from "./ui/stage.js";
import { load, loadRaw, remove, save } from "./ui/storage.js";

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);

let progress = cleanProgress(load("progress"));
let game = null;
let view = null;
let raf = 0;
let last = 0;
let acc = 0;
let paused = false;
let keys = { left: false, right: false };
let lastTick = -1;

// Seasonal backdrop: "off", "auto" (whatever event comes next) or one event's id.
// ?today=YYYY-MM-DD pretends it is another day, and ?backdrop=<id|auto> shows a backdrop
// without saving it, to preview a season.
let backdrop = cleanBackdrop(params.get("backdrop") ?? load("backdrop", "off"));
const fakeToday = /^(\d{4})-(\d{2})-(\d{2})$/.exec(params.get("today") ?? "");

function cleanBackdrop(value) {
  return value === "auto" || eventById(value) ? value : "off";
}

function day() {
  return fakeToday ? dayNumber(+fakeToday[1], +fakeToday[2], +fakeToday[3]) : today();
}

function currentSkin() {
  return resolveBackdrop(backdrop, day());
}

setMuted(load("muted", false));
document.body.insertAdjacentHTML("afterbegin", `<svg class="defs" aria-hidden="true" width="0" height="0">${sharedDefs()}</svg>`);

// ----------------------------------------------------------------------------- screens

function show(id) {
  for (const s of document.querySelectorAll(".screen")) s.hidden = s.id !== id;
  window.scrollTo(0, 0);
}

function stars(n, of = 3) {
  return `<span class="stars" aria-label="${n}/${of} sao">${"★".repeat(n)}<span class="off">${"★".repeat(of - n)}</span></span>`;
}

function renderHome() {
  const name = progress.name;
  const saved = restore(loadRaw("round"));
  $("greeting").innerHTML = `Chào <b>${esc(progress.name || "bạn")}</b> · <span class="chip">${esc(titleFor(progress))}</span>
    <span class="chip">⭐ ${totalStars(progress)}/${CABINETS.length * 3}</span>
    <span class="chip">🧸 ${collected(progress)}/${TOYS.length}</span>`;
  $("name-input").value = name;
  $("resume").innerHTML = saved
    ? `<div class="resume"><span>Ván đang dở ở <b>${esc(cabinetById(saved.cabinetId).name)}</b> · 🪙 ${saved.coins} · ⭐ ${saved.score}</span>
        <button class="btn primary" id="resume-btn">▶ Chơi tiếp</button></div>`
    : "";
  if (saved) $("resume-btn").onclick = () => startGame(saved.cabinetId, saved);
  renderEventStrip();

  $("cabinets").innerHTML = CABINETS.map((cab, i) => {
    const open = isUnlocked(progress, i);
    const best = progress.best[cab.id];
    const t = cab.theme;
    const faces = [...new Set(cab.mix.map(([id]) => id))].slice(0, 4);
    return `<button class="cab-card${open ? "" : " locked"}" data-cab="${cab.id}" ${open ? "" : "disabled"}
        style="--neon:${t.neon};--wall:${t.wall};--wall2:${t.wall2}">
      <div class="cab-art">${faces.map((id) => toyIcon(toyById(id), { size: 54 })).join("")}</div>
      <div class="cab-info">
        <h3>${esc(cab.name)}</h3>
        <p>${esc(cab.tagline)}</p>
        <div class="cab-meta">
          <span>🪙 ${cab.coins} xu</span><span>🦾 Càng ${Math.round(cab.power * 100)}%</span>
          ${best ? `<span>${stars(best.stars)} ${best.score} điểm</span>` : `<span class="muted">Chưa chơi</span>`}
        </div>
      </div>
      ${open ? "" : `<div class="lock">🔒 Cần 1 sao ở máy trước</div>`}
    </button>`;
  }).join("");
  for (const b of document.querySelectorAll(".cab-card:not(.locked)")) {
    b.onclick = () => startGame(b.dataset.cab);
  }
  show("home");
}

function renderEventStrip() {
  const next = nextEvent(day());
  const skin = currentSkin();
  if (!next) {
    $("event-strip").innerHTML = "";
    return;
  }
  const t = next.event.theme;
  $("event-strip").innerHTML = `<div class="event-strip" style="--ev:${t.neon};--ev-wall:${t.wall};--ev-wall2:${t.wall2}">
      <span class="ev-icon" aria-hidden="true">${next.event.icon}</span>
      <div class="ev-text">
        <b>Sự kiện sắp tới: ${esc(next.event.name)}</b>
        <span>${esc(dateLabel(next))} · ${esc(countdownLabel(next))}</span>
        <small>${skin ? `Phông nền đang bật: ${skin.event.icon} ${esc(skin.event.name)}${backdrop === "auto" ? " (tự động)" : ""}` : "Phông nền sự kiện đang tắt"}</small>
      </div>
      <button class="btn primary" id="event-btn">🎉 ${skin ? "Đổi phông nền" : "Thêm phông sự kiện"}</button>
    </div>`;
  $("event-btn").onclick = pickBackdrop;
}

/** The backdrop picker. During a round the machine freezes until a choice is made. */
function pickBackdrop() {
  const playing = game && game.status === "playing" && !$("play").hidden;
  if (playing) {
    paused = true;
    cancelAnimationFrame(raf);
  }
  const list = upcoming(day());
  const next = list[0];
  const option = (value, icon, title, sub, theme) => `<button class="ev-option${backdrop === value ? " current" : ""}" data-backdrop="${value}"
      aria-pressed="${backdrop === value}"${theme ? ` style="--ev:${theme.neon};--ev-wall:${theme.wall};--ev-wall2:${theme.wall2}"` : ""}>
      <span class="ev-swatch" aria-hidden="true">${icon}</span>
      <span class="ev-label"><b>${esc(title)}</b><small>${esc(sub)}</small></span>
    </button>`;
  openModal(`<h2>🎉 Phông nền sự kiện</h2>
    <p class="muted">Trang trí máy gắp theo ngày lễ. Thú bông và luật chơi vẫn giữ nguyên.</p>
    <div class="ev-list">
      ${option("auto", "✨", "Tự động: sự kiện sắp tới", next ? `Bây giờ là ${next.event.name} · ${dateLabel(next)}` : "", next?.event.theme)}
      ${list.map((o) => option(o.event.id, o.event.icon, o.event.name, `${dateLabel(o)} · ${countdownLabel(o)}`, o.event.theme)).join("")}
      ${option("off", "🚫", "Tắt phông nền", "Dùng trang trí gốc của từng máy")}
    </div>
    <div class="actions"><button class="btn" id="ev-close">Đóng</button></div>`);
  const done = () => {
    closeModal();
    if (playing && game) {
      view = mountStage($("stage"), game, currentSkin());
      document.body.style.setProperty("--neon", themeOf(cabinetById(game.cabinetId), currentSkin()).neon);
      paused = false;
      loop();
    } else {
      renderEventStrip();
    }
  };
  for (const b of document.querySelectorAll("[data-backdrop]")) {
    b.onclick = () => {
      backdrop = cleanBackdrop(b.dataset.backdrop);
      save("backdrop", backdrop);
      const skin = currentSkin();
      done();
      toast(skin ? `Đã treo phông ${skin.event.icon} ${skin.event.name}!` : "Đã tắt phông nền sự kiện.", skin ? "good" : "");
    };
  }
  $("ev-close").onclick = done;
  (document.querySelector(".ev-option.current") ?? $("ev-close")).focus();
}

function renderBook() {
  $("book-count").textContent = `${collected(progress)}/${TOYS.length}`;
  $("book-grid").innerHTML = TOYS.map((toy) => {
    const n = progress.collection[toy.id] ?? 0;
    const r = RARITY[toy.rarity];
    return `<article class="book-card${n ? "" : " unknown"}" style="--rar:${r.color}">
      ${toyIcon(toy, { size: 84, hidden: !n })}
      <h4>${n ? esc(toy.name) : "???"}</h4>
      <span class="rarity">${r.label} · ${r.points} điểm</span>
      ${n ? `<span class="count">×${n}</span><p>${esc(toy.blurb)}</p>` : `<p class="muted">Gắp được để mở khóa.</p>`}
    </article>`;
  }).join("");
  show("book");
}

// ----------------------------------------------------------------------------- round

function startGame(cabinetId, resumed = null) {
  const seed = params.has("seed") ? Number(params.get("seed")) : (Date.now() ^ (Math.random() * 1e9)) >>> 0;
  game = resumed ?? createGame(cabinetId, seed);
  if (resumed) remove("round");
  const skin = currentSkin();
  view = mountStage($("stage"), game, skin);
  $("hud-name").textContent = cabinetById(game.cabinetId).name;
  document.body.style.setProperty("--neon", themeOf(cabinetById(game.cabinetId), skin).neon);
  show("play");
  paused = false;
  keys = { left: false, right: false };
  closeModal();
  updateHud();
  if (!resumed) toast(skin ? `${skin.event.icon} ${skin.event.banner}! Di chuyển càng và bấm THẢ.` : "Bỏ xu rồi! Di chuyển càng và bấm THẢ.");
  else toast("Chào mừng trở lại, ván chơi vẫn còn nguyên.");
  loop();
}

function loop() {
  cancelAnimationFrame(raf);
  last = performance.now();
  acc = 0;
  raf = requestAnimationFrame(frame);
}

function frame(now) {
  if (!game || paused) return;
  acc += Math.min(0.1, (now - last) / 1000);
  last = now;
  while (acc >= DT && game.status === "playing") {
    for (const e of step(game)) onEvent(e);
    acc -= DT;
  }
  drawStage(view, game);
  updateHud();
  if (game.status === "over") {
    setTimeout(finish, 700);
    return;
  }
  raf = requestAnimationFrame(frame);
}

function onEvent(e) {
  switch (e.type) {
    case "autodrop": toast("Hết giờ ngắm, càng tự thả!"); sfx.drop(); break;
    case "land": sfx.land(); break;
    case "grab": sfx.grab(); break;
    case "miss": sfx.miss(); toast("Hụt rồi! Càng không chạm được bé nào."); break;
    case "slip":
      sfx.slip();
      toast(e.why === "swing"
        ? `Càng lắc mạnh quá, ${toyById(e.toy).name} văng mất!`
        : `Ối! ${toyById(e.toy).name} tuột khỏi càng.`);
      break;
    case "win": {
      const toy = toyById(e.toy);
      sfx.win();
      sparkle(view, BOX.chuteX, BOX.floor - 20, RARITY[toy.rarity].color);
      toast(e.lucky ? `${toy.name} tự lăn vào máng! Thưởng may mắn +${BONUS.lucky}` : `Gắp được ${toy.name}!`, "good");
      break;
    }
    case "score":
      if (e.total) popText(view, BOX.chuteX, BOX.floor - 50, `+${e.total}`, "score");
      if (e.combo >= 2) {
        sfx.combo();
        popText(view, 250, 200, `COMBO ×${multiplier(e.combo)}`, "combo");
      }
      if (e.wins.length > 1) popText(view, 250, 240, `GẮP ĐÔI! +${BONUS.double * (e.wins.length - 1)}`, "combo");
      if (game.status === "playing") save("round", snapshot(game));
      break;
    case "over": sfx.over(); break;
  }
}

function updateHud() {
  if (!game) return;
  const c = game.claw;
  $("hud-coins").textContent = game.coins;
  $("hud-score").textContent = game.score;
  $("hud-combo").textContent = game.combo >= 1 ? `×${multiplier(game.combo + 1)}` : "×1";
  const aiming = c.phase === "aim" && game.status === "playing";
  const secs = Math.ceil(c.aimLeft);
  $("hud-time").textContent = aiming ? `${secs}s` : "--";
  $("hud-time").parentElement.classList.toggle("hurry", aiming && secs <= 5);
  if (aiming && secs <= 5 && secs !== lastTick) {
    lastTick = secs;
    sfx.tick();
  }
  if (!aiming) lastTick = -1;
  $("drop-btn").disabled = !canDrop(game);
  $("drop-btn").textContent = aiming ? "THẢ" : phaseLabel(c.phase);
}

function phaseLabel(phase) {
  return { drop: "Đang thả…", close: "Đang gắp…", lift: "Kéo lên…", carry: "Về máng…", release: "Nhả…", return: "…", settle: "…" }[phase] ?? "…";
}

function doDrop() {
  if (!game || paused || !drop(game)) return;
  sfx.coin();
  sfx.drop();
  setAim(game, {});
}

function steer() {
  if (!game || paused) return;
  setAim(game, { dir: (keys.right ? 1 : 0) - (keys.left ? 1 : 0) });
}

function finish() {
  if (!game) return;
  const sum = summary(game);
  const before = progress;
  const result = recordRound(progress, sum);
  progress = result.progress;
  save("progress", progress);
  remove("round");
  const cab = cabinetById(sum.cabinetId);
  const index = CABINETS.indexOf(cab);
  const nextCab = CABINETS[index + 1];
  const unlockedNext = nextCab && !isUnlocked(before, index + 1) && isUnlocked(progress, index + 1);
  const toyPoints = sum.lines.filter((l) => l.kind === "toy").reduce((s, l) => s + l.points, 0);
  const bonus = sum.score - toyPoints;
  if (sum.stars) sfx.fanfare();
  openModal(`
    <h2>${sum.cleared ? "Sạch máy! 🎉" : sum.stars ? "Hết xu rồi!" : "Tiếc quá!"}</h2>
    <p class="muted">${esc(progress.name || "Bạn")} chơi ở ${esc(cab.name)}</p>
    <div class="big-stars">${stars(sum.stars)}</div>
    <div class="final-score">${sum.score} <small>điểm</small>${result.newBest && sum.score ? `<span class="badge">Kỷ lục mới!</span>` : ""}</div>
    <div class="caught">${sum.caught.length
      ? sum.caught.map((id) => `<span class="caught-toy${result.newToys.includes(id) ? " new" : ""}">${toyIcon(toyById(id), { size: 56 })}</span>`).join("")
      : `<p class="muted">Chưa gắp được bé nào. Thử canh càng thật giữa nhé!</p>`}</div>
    <ul class="breakdown">
      <li><span>🧸 Thú gắp được (${sum.caught.length})</span><b>${toyPoints}</b></li>
      <li><span>🎁 Thưởng (may mắn, gắp đôi, sạch máy)</span><b>${bonus}</b></li>
      <li><span>🔥 Combo dài nhất</span><b>${sum.bestCombo}</b></li>
      <li><span>🎯 Mốc sao</span><b>${cab.targets.join(" / ")}</b></li>
    </ul>
    ${result.newToys.length ? `<p class="good">Mở khóa ${result.newToys.length} bé mới trong Bộ sưu tập!</p>` : ""}
    ${unlockedNext ? `<p class="good">🔓 Đã mở máy mới: <b>${esc(nextCab.name)}</b></p>` : ""}
    <div class="actions">
      <button class="btn primary" id="again-btn">🪙 Chơi lại</button>
      ${nextCab && isUnlocked(progress, index + 1) ? `<button class="btn" id="next-btn">Máy tiếp theo →</button>` : ""}
      <button class="btn" id="home-btn2">Trang chủ</button>
    </div>`);
  $("again-btn").onclick = () => startGame(cab.id);
  if ($("next-btn")) $("next-btn").onclick = () => startGame(nextCab.id);
  $("home-btn2").onclick = () => { game = null; closeModal(); renderHome(); };
  $("again-btn").focus();
}

// ----------------------------------------------------------------------------- pause & save

function pause() {
  if (!game || game.status !== "playing" || paused) return;
  paused = true;
  cancelAnimationFrame(raf);
  save("round", snapshot(game));
  openModal(`<h2>Tạm dừng</h2>
    <p class="muted">Ván chơi đã được lưu. Đóng trang rồi quay lại vẫn chơi tiếp được.</p>
    <div class="actions">
      <button class="btn primary" id="unpause-btn">▶ Tiếp tục</button>
      <button class="btn" id="quit-btn">Về trang chủ</button>
    </div>`);
  $("unpause-btn").onclick = resume;
  $("quit-btn").onclick = leave;
  $("unpause-btn").focus();
}

function resume() {
  if (!game) return;
  remove("round");
  paused = false;
  closeModal();
  loop();
}

function leave() {
  if (game && game.status === "playing") save("round", snapshot(game));
  cancelAnimationFrame(raf);
  game = null;
  paused = false;
  closeModal();
  renderHome();
}

window.addEventListener("pagehide", () => {
  if (game && game.status === "playing") save("round", snapshot(game));
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) pause();
});

// ----------------------------------------------------------------------------- modal & toast

function openModal(html) {
  $("modal-body").innerHTML = html;
  $("modal").hidden = false;
}

function closeModal() {
  $("modal").hidden = true;
}

let toastTimer = 0;
function toast(text, cls = "") {
  const el = $("toast");
  el.textContent = text;
  el.className = `toast show ${cls}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = "toast"; }, 2400);
}

function howTo() {
  openModal(`<h2>Cách chơi</h2>
    <ol class="howto">
      <li><b>Ngắm.</b> Di chuyển càng bằng ◀ ▶, phím ← →, hoặc kéo/chạm lên kính máy. Vạch chấm cho biết càng sẽ rơi ở đâu.</li>
      <li><b>Thả.</b> Bấm THẢ (hoặc Space). Mỗi lần thả tốn 1 xu. Có ${AIM_TIME} giây để ngắm, hết giờ càng tự thả.</li>
      <li><b>Canh giữa.</b> Càng gắp chắc nhất khi rơi đúng giữa thú bông. Thú bị đè bên dưới, thú nặng và vải trơn khó gắp hơn.</li>
      <li><b>Đừng để càng lắc.</b> Thả khi càng đang đung đưa sẽ lệch, và càng lắc mạnh khi về máng có thể làm thú văng ra.</li>
      <li><b>Điểm.</b> Thường 10 · Hiếm 25 · Quý 60 · Huyền thoại 150. Gắp trúng liên tiếp nhân combo tới ×3. Gắp đôi +${BONUS.double}, thú tự lăn vào máng +${BONUS.lucky}, sạch máy +${BONUS.clear} và +${BONUS.coin} mỗi xu còn lại.</li>
      <li><b>Sao.</b> Mỗi máy có ba mốc điểm. Một sao sẽ mở máy tiếp theo.</li>
    </ol>
    <div class="actions"><button class="btn primary" id="ok-btn">Đã hiểu!</button></div>`);
  $("ok-btn").onclick = closeModal;
  $("ok-btn").focus();
}

// ----------------------------------------------------------------------------- wiring

$("name-input").addEventListener("change", (e) => {
  progress = { ...progress, name: cleanName(e.target.value) };
  save("progress", progress);
  renderHome();
});
$("book-btn").onclick = renderBook;
$("book-back").onclick = renderHome;
$("howto-btn").onclick = howTo;
$("back-btn").onclick = leave;
$("pause-btn").onclick = pause;
$("event-hud-btn").onclick = pickBackdrop;
$("drop-btn").onclick = doDrop;

function syncSound() {
  $("sound-btn").textContent = isMuted() ? "🔇" : "🔊";
  $("sound-btn").setAttribute("aria-pressed", String(!isMuted()));
}
$("sound-btn").onclick = () => {
  setMuted(!isMuted());
  save("muted", isMuted());
  syncSound();
};
syncSound();

for (const [id, side] of [["left-btn", "left"], ["right-btn", "right"]]) {
  const b = $(id);
  const on = (e) => { e.preventDefault(); keys[side] = true; steer(); sfx.move(); };
  const off = () => { keys[side] = false; steer(); };
  b.addEventListener("pointerdown", on);
  for (const ev of ["pointerup", "pointerleave", "pointercancel"]) b.addEventListener(ev, off);
  b.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") on(e); });
  b.addEventListener("keyup", (e) => { if (e.key === "Enter" || e.key === " ") off(); });
}

// Drag (or tap) on the machine glass to glide the claw there.
let dragging = false;
$("stage").addEventListener("pointerdown", (e) => {
  if (!game || paused || game.claw.phase !== "aim") return;
  dragging = true;
  $("stage").setPointerCapture(e.pointerId);
  const x = machineX(view, e.clientX, e.clientY);
  if (x != null) setAim(game, { target: x });
});
$("stage").addEventListener("pointermove", (e) => {
  if (!dragging || !game || game.claw.phase !== "aim") return;
  const x = machineX(view, e.clientX, e.clientY);
  if (x != null) setAim(game, { target: x });
});
for (const ev of ["pointerup", "pointercancel"]) {
  $("stage").addEventListener(ev, () => { dragging = false; });
}

document.addEventListener("keydown", (e) => {
  if ($("play").hidden || !game) return;
  if (e.target.tagName === "INPUT") return;
  if (!$("modal").hidden) return;
  const k = e.key;
  if (k === "ArrowLeft" || k === "a" || k === "A") { keys.left = true; steer(); e.preventDefault(); }
  else if (k === "ArrowRight" || k === "d" || k === "D") { keys.right = true; steer(); e.preventDefault(); }
  else if ((k === " " || k === "ArrowDown" || k === "Enter") && !e.target.closest?.("button:not(#drop-btn)")) { doDrop(); e.preventDefault(); }
  else if (k === "p" || k === "P" || k === "Escape") { pause(); e.preventDefault(); }
});
document.addEventListener("keyup", (e) => {
  if (!game) return;
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") { keys.left = false; steer(); }
  if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") { keys.right = false; steer(); }
});

if (params.has("debug")) {
  window.__gt = {
    get game() { return game; },
    progress: () => progress,
    skin: () => currentSkin(),
    coins: (n) => { if (game) game.coins = n; },
    unlockAll: () => {
      for (const c of CABINETS) progress.best[c.id] ??= { score: 0, stars: 1 };
      save("progress", progress);
      renderHome();
    },
  };
}

renderHome();
if (params.has("debug") && params.get("play")) {
  // Demo / screenshot shortcut: ?debug&play=<cabinet id>&seed=<n>
  startGame(cabinetById(params.get("play")).id);
} else if (!load("seen-howto", false)) {
  save("seen-howto", true);
  howTo();
}
