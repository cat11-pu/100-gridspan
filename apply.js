// apply.js：编辑轮次（按序应用编辑，从受影响行起受限重排，收尾清陈旧）
import { buildGrid } from "./grid.js";

function toCell(edit) {
  return {
    id: edit.cell, row: edit.row, col: edit.col,
    rowspan: edit.rowspan, colspan: edit.colspan, text: edit.text
  };
}

function diffRows(a, b) {
  let diff = Math.abs(a.length - b.length);
  for (let i = 0; i < Math.min(a.length, b.length); i += 1) {
    if (JSON.stringify(a[i]) !== JSON.stringify(b[i])) diff += 1;
  }
  return diff;
}

export function applyEdits(cells, columns, edits, applied, budget) {
  const done = new Set(applied || []);
  const current = (cells || []).map((cell) => Object.assign({}, cell));
  const initial = buildGrid(current, columns);
  const grid = initial.grid.map((row) => row.slice());
  let conflicts = initial.conflicts;
  let staleStart = -1;
  let stale = 0;
  let skipped = 0;
  let firstPlaced = 0;
  let firstStale = 0;
  let firstDiff = 0;
  let closing = 0;
  let rounds = 0;

  for (const edit of edits || []) {
    if (done.has(edit.edit_id)) { skipped += 1; continue; }
    const index = current.findIndex((cell) => cell.id === edit.cell);
    let start = edit.row;
    if (index >= 0) {
      start = Math.min(start, current[index].row);
      current[index] = toCell(edit);
    } else {
      current.push(toCell(edit));
    }
    if (staleStart >= 0) start = Math.min(start, staleStart);

    const full = buildGrid(current, columns);
    conflicts = full.conflicts;
    const limit = budget == null ? full.rows : Math.max(0, budget);
    const end = Math.min(full.rows, start + limit);
    for (let r = start; r < end; r += 1) grid[r] = full.grid[r].slice();
    const total = Math.max(grid.length, full.rows);
    stale = Math.max(0, total - end);
    staleStart = stale > 0 ? end : -1;
    if (rounds === 0) {
      firstPlaced = Math.max(0, end - start);
      firstStale = stale;
      firstDiff = diffRows(grid, full.grid);
    }
    rounds += 1;
  }

  if (staleStart >= 0) {
    const full = buildGrid(current, columns);
    conflicts = full.conflicts;
    const total = Math.max(grid.length, full.rows);
    for (let r = staleStart; r < full.rows; r += 1) grid[r] = full.grid[r].slice();
    grid.length = full.rows;
    closing = total - staleStart;
    staleStart = -1;
    stale = 0;
  }

  return {
    cells: current, grid: grid, conflicts: conflicts,
    firstPlaced: firstPlaced, firstStale: firstStale, firstDiff: firstDiff,
    closing: closing, stale: stale, skipped: skipped
  };
}
