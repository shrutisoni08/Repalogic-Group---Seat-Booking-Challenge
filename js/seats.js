// Pure seat & price logic. No DOM access. Prices are integer cents.
export const MAX_SEATS = 6;
export const SEATS_PER_ROW = 10;
export const DISCOUNT_FROM = 4;

export const parseSeat = (id) => {
  const m = /^([A-Z])(\d+)$/.exec(id);
  return m ? { row: m[1], num: Number(m[2]) } : null;
};
export const categoryOf = (event, id) => event.rows[parseSeat(id).row];
export const seatPrice = (event, id) => event.categories[categoryOf(event, id)];

// Sort A1, A2 ... B1 ...
export const sortSeats = (ids) =>
  [...ids].sort((a, b) => {
    const x = parseSeat(a), y = parseSeat(b);
    return x.row.localeCompare(y.row) || x.num - y.num;
  });

// "12.00 €" - Intl.NumberFormat with a fixed locale so output is predictable.
const numberFmt = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const formatCents = (cents) => `${numberFmt.format(cents / 100)} €`;

export function calculateTotal(event, ids) {
  const list = [...ids];
  const subtotal = list.reduce((sum, id) => sum + seatPrice(event, id), 0);
  const discount = list.length >= DISCOUNT_FROM ? Math.round(subtotal / 10) : 0;
  return { subtotal, discount, total: subtotal - discount };
}

// Free seats that would be left alone: next to a selected seat, with
// the seat beyond it sold, selected, or past the end of the row.
export function findStrandedSeats(event, selected, sold = event.sold) {
  const sel = new Set(selected), soldSet = new Set(sold);
  const blocked = (row, n) => n < 1 || n > SEATS_PER_ROW || sel.has(row + n) || soldSet.has(row + n);
  const stranded = [];
  for (const row of Object.keys(event.rows)) {
    for (let n = 1; n <= SEATS_PER_ROW; n++) {
      const id = row + n;
      if (sel.has(id) || soldSet.has(id)) continue;
      const leftSel = sel.has(row + (n - 1)), rightSel = sel.has(row + (n + 1));
      if ((leftSel && blocked(row, n + 1)) || (rightSel && blocked(row, n - 1))) stranded.push(id);
    }
  }
  return stranded;
}

export function validateSelection(event, selected, sold = event.sold) {
  const ids = [...selected], problems = [];
  if (ids.length === 0) problems.push("Select at least one seat.");
  if (ids.length > MAX_SEATS) problems.push(`You can book at most ${MAX_SEATS} seats (you selected ${ids.length}).`);
  for (const id of findStrandedSeats(event, ids, sold)) {
    problems.push(`Seat ${id} would be left alone. Choose it too, or pick different seats.`);
  }
  return problems;
}
