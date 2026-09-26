// apply.js：编辑轮次——按序应用编辑，从受影响行起按预算重排，收尾轮补齐陈旧行
import { buildGrid } from "./grid.js";

function diffRows(a, b) {
  let diff = Math.abs(a.length - b.length);
  for (let i = 0; i < Math.min(a.length, b.length); i += 1) {
    if (JSON.stringify(a[i]) !== JSON.stringify(b[i])) diff += 1;
  }
  return diff;
}

export function applyEdits(cells, columns, edits, applied, budget) {
  const limit = budget == null ? Infinity : budget;
  const done = new Set(applied || []);
  const current = (cells || []).slice();
  const initial = buildGrid(current, columns);
  let grid = initial.grid.map((row) => row.slice());
  let conflicts = initial.conflicts;
  let stale = 0;
  let skipped = 0;
  let firstPlaced = 0;
  let firstStale = 0;
  let firstDiff = 0;
  let closing = 0;
  let rounds = 0;
  let full = initial;

  for (const edit of edits || []) {
    if (done.has(edit.edit_id)) { skipped += 1; continue; }
    const index = current.findIndex((cell) => cell.id === edit.cell);
    const oldRow = index >= 0 ? current[index].row : null;
    const next = {
      id: edit.cell, row: edit.row, col: edit.col,
      rowspan: edit.rowspan, colspan: edit.colspan, text: edit.text
    };
    if (index >= 0) current[index] = next; else current.push(next);

    full = buildGrid(current, columns);
    let start = oldRow == null ? next.row : Math.min(oldRow, next.row);
    if (stale > 0) start = Math.min(start, grid.length - stale);
    const placed = Math.max(0, Math.min(limit, full.rows - start));
    const clean = start + placed;
    const nextGrid = [];
    for (let r = 0; r < full.rows; r += 1) {
      if (r >= start && r < clean) nextGrid.push(full.grid[r].slice());
      else if (r < grid.length) nextGrid.push(grid[r]);
      else nextGrid.push(new Array(width(columns)).fill("~"));
    }
    grid = nextGrid;
    stale = Math.max(0, full.rows - clean);
    if (rounds === 0) {
      firstPlaced = placed;
      firstStale = stale;
      firstDiff = diffRows(grid, full.grid);
    }
    rounds += 1;
    conflicts = full.conflicts;
  }

  if (stale > 0) {
    closing = stale;
    for (let r = full.rows - stale; r < full.rows; r += 1) grid[r] = full.grid[r].slice();
    stale = 0;
  }

  return {
    cells: current, grid: grid, conflicts: conflicts,
    firstPlaced: firstPlaced, firstStale: firstStale, firstDiff: firstDiff,
    closing: closing, stale: stale, skipped: skipped
  };
}

function width(columns) {
  return columns == null ? 0 : columns;
}
