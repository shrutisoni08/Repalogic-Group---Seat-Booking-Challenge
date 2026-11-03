import { SEATS_PER_ROW, parseSeat, categoryOf, seatPrice, sortSeats, formatCents, calculateTotal, validateSelection } from "./seats.js";

const $ = (id) => document.getElementById(id);
const state = { event: null, sold: new Set(), selected: new Set(), active: null };
const buttons = new Map();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const seatState = (id) => (state.sold.has(id) ? "sold" : state.selected.has(id) ? "selected" : "available");

function announce(msg) {
  const live = $("live");
  live.textContent = "";
  setTimeout(() => { live.textContent = msg; }, 50);
}

function renderProblems(box, problems) {
  box.replaceChildren();
  if (!problems.length) return;
  const ul = document.createElement("ul");
  for (const p of problems) {
    const li = document.createElement("li");
    li.textContent = p;
    ul.append(li);
  }
  box.append(ul);
}

async function load() {
  $("loading").hidden = false;
  $("error").hidden = true;
  $("booking").hidden = true;
  try {
    const res = await fetch("event.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    state.event = await res.json();
    state.sold = new Set(state.event.sold);
    state.selected.clear();
    $("event-name").textContent = state.event.name; // text only: never parsed as HTML
    document.title = `${state.event.name} - Seat Booking`;
    buildMap();
    renderSummary();
    $("booking").hidden = false;
  } catch (err) {
    console.error(err);
    $("error").hidden = false;
    $("retry").focus();
  } finally {
    $("loading").hidden = true;
  }
}

function buildMap() {
  const map = $("map");
  map.replaceChildren();
  buttons.clear();
  for (const row of Object.keys(state.event.rows)) {
    const label = document.createElement("span");
    label.className = "row-label";
    label.setAttribute("aria-hidden", "true");
    label.textContent = row;
    map.append(label);
    for (let n = 1; n <= SEATS_PER_ROW; n++) {
      const id = row + n;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "seat";
      b.dataset.id = id;
      b.tabIndex = -1;
      const num = document.createElement("span");
      num.setAttribute("aria-hidden", "true");
      num.textContent = n;
      const mark = document.createElement("span");
      mark.className = "mark";
      mark.setAttribute("aria-hidden", "true");
      b.append(num, mark);
      buttons.set(id, b);
      map.append(b);
      updateSeat(id);
    }
  }
  state.active = [...buttons.keys()].find((id) => !state.sold.has(id)) ?? "A1";
  buttons.get(state.active).tabIndex = 0;
}

function updateSeat(id) {
  const b = buttons.get(id), s = seatState(id), { row, num } = parseSeat(id);
  b.dataset.state = s;
  b.setAttribute("aria-pressed", String(s === "selected"));
  if (s === "sold") b.setAttribute("aria-disabled", "true"); else b.removeAttribute("aria-disabled");
  b.querySelector(".mark").textContent = s === "selected" ? "✓" : s === "sold" ? "✕" : "";
  b.setAttribute("aria-label", `Row ${row}, seat ${num}, ${categoryOf(state.event, id)}, ${formatCents(seatPrice(state.event, id))}, ${s}`);
}

function focusSeat(id) {
  buttons.get(state.active).tabIndex = -1;
  state.active = id;
  const b = buttons.get(id);
  b.tabIndex = 0;
  b.focus();
}

function toggleSeat(id) {
  if (state.sold.has(id)) return;
  state.selected.has(id) ? state.selected.delete(id) : state.selected.add(id);
  updateSeat(id);
  renderSummary();
  renderProblems($("problems"), []);
}

function renderSummary() {
  const ids = sortSeats(state.selected);
  const list = $("selected-list");
  list.replaceChildren();
  for (const id of ids) {
    const li = document.createElement("li");
    li.textContent = `${id} (${categoryOf(state.event, id)}): ${formatCents(seatPrice(state.event, id))}`;
    list.append(li);
  }
  if (!ids.length) { list.textContent = "No seats selected."; }
  const { discount, total } = calculateTotal(state.event, ids);
  $("total").textContent = discount
    ? `Total: ${formatCents(total)} (includes 10% discount, -${formatCents(discount)})`
    : `Total: ${formatCents(total)}`;
}

// Roving tabindex + arrow keys
$("map").addEventListener("keydown", (e) => {
  const seat = e.target.closest(".seat");
  if (!seat) return;
  const { row, num } = parseSeat(seat.dataset.id);
  const rows = Object.keys(state.event.rows), r = rows.indexOf(row);
  let nr = r, nn = num;
  switch (e.key) {
    case "ArrowLeft": nn--; break;
    case "ArrowRight": nn++; break;
    case "ArrowUp": nr--; break;
    case "ArrowDown": nr++; break;
    case "Home": nn = 1; break;
    case "End": nn = SEATS_PER_ROW; break;
    default: return;
  }
  e.preventDefault();
  const target = (rows[nr] ?? row) + Math.min(SEATS_PER_ROW, Math.max(1, nn));
  focusSeat(target);
});
$("map").addEventListener("click", (e) => {
  const seat = e.target.closest(".seat");
  if (!seat) return;
  focusSeat(seat.dataset.id);
  toggleSeat(seat.dataset.id);
});

// Checkout
$("continue").addEventListener("click", () => {
  const problems = validateSelection(state.event, state.selected, state.sold);
  renderProblems($("problems"), problems);
  if (problems.length) return;
  $("name").value = "";
  $("email").value = "";
  renderProblems($("form-errors"), []);
  [$("name"), $("email")].forEach((f) => f.removeAttribute("aria-invalid"));
  $("dialog").showModal();
});

$("form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("name"), email = $("email"), problems = [], invalid = [];
  if (!name.value.trim()) { problems.push("Name is required."); invalid.push(name); }
  if (!email.value.trim()) { problems.push("Email is required."); invalid.push(email); }
  else if (!EMAIL_RE.test(email.value.trim())) { problems.push("Enter a valid email address."); invalid.push(email); }
  for (const f of [name, email]) f.setAttribute("aria-invalid", String(invalid.includes(f)));
  renderProblems($("form-errors"), problems);
  if (problems.length) { invalid[0].focus(); return; }

  for (const id of state.selected) { state.sold.add(id); }
  const booked = [...state.selected];
  state.selected.clear();
  booked.forEach(updateSeat);
  renderSummary();
  $("dialog").close();
  $("confirmation").hidden = false;
  $("confirmation").textContent = "Booking confirmed";
  announce("Booking confirmed");
});

$("cancel").addEventListener("click", () => $("dialog").close());
// Fires for Escape, Cancel and successful Book: focus always returns to Continue.
$("dialog").addEventListener("close", () => $("continue").focus());
$("retry").addEventListener("click", load);

load();
