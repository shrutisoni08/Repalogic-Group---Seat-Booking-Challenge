import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateSelection, calculateTotal, formatCents, findStrandedSeats } from "./js/seats.js";

const event = JSON.parse(readFileSync(new URL("./event.json", import.meta.url), "utf8"));
const ok = (sel) => validateSelection(event, sel).length === 0;

const cases = [
  [["C3"], true], [["C7"], false], [["C1", "C2"], false], [["C1", "C2", "C3"], true],
  [["C9"], false], [["C6", "C7", "C8"], true], [["C1", "C2", "C3"], true],
  [["A1", "A2", "A3", "A4", "A5", "A6", "A7"], false],
  [[], false], [["C2"], false], [["A1", "A2", "A3", "A4", "A5", "A6"], true],
  [["C10"], true], [["A5"], true],
];
for (const [sel, expected] of cases) assert.equal(ok(sel), expected, sel.join(","));

assert.deepEqual(findStrandedSeats(event, ["C7"]), ["C6"]);
assert.deepEqual(findStrandedSeats(event, ["C9"]), ["C10"]);

const t = calculateTotal(event, ["B1", "B2", "F5", "F6"]);
assert.deepEqual(t, { subtotal: 4800, discount: 480, total: 4320 });
assert.equal(formatCents(t.total), "43.20 €");
assert.equal(formatCents(calculateTotal(event, ["C3", "C2", "C1"]).total), "36.00 €"); // 3 seats, no discount
console.log("All tests passed");
