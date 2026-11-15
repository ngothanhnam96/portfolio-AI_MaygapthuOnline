// Escape anything a player typed (their name) before it goes into markup.

const MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function esc(text) {
  return String(text ?? "").replace(/[&<>"']/g, (ch) => MAP[ch]);
}
