import assert from "node:assert";
import { buildGrid } from "../grid.js";
import { applyEdits } from "../apply.js";
import { render } from "../app.js";

let failed = 0;
function check(name, fn) {
  try { fn(); console.log("ok " + name); } catch (e) { failed += 1; console.log("FAIL " + name + " :: " + e.message); }
}

const cells = [
  { id: "c1", row: 0, col: 0, rowspan: 1, colspan: 2, text: "A" },
  { id: "c2", row: 1, col: 0, rowspan: 1, colspan: 1, text: "B" }
];
const edits = [{ edit_id: "g1", cell: "c2", row: 1, col: 1, rowspan: 1, colspan: 1, text: "B" }];

check("buildGrid returns a grid", () => {
  assert.ok(Array.isArray(buildGrid(cells, 4).grid));
});

check("buildGrid reports conflicts", () => {
  assert.ok(Array.isArray(buildGrid(cells, 4).conflicts));
});

check("buildGrid reports rows", () => {
  assert.strictEqual(typeof buildGrid(cells, 4).rows, "number");
});

check("applyEdits returns cells", () => {
  assert.ok(Array.isArray(applyEdits(cells, 4, edits, [], 2).cells));
});

check("applyEdits reports stale", () => {
  assert.strictEqual(typeof applyEdits(cells, 4, edits, [], 2).stale, "number");
});

check("render exposes full_diff", () => {
  const spec = { cells: cells, columns: 4, edits: edits, applied: [], budget: 2 };
  assert.strictEqual(typeof render(spec).full_diff, "number");
});

console.log("6 cases, " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);
