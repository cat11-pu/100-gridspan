// app.js：渲染结果
import { buildGrid } from "./grid.js";
import { applyEdits } from "./apply.js";

export function render(spec) {
  const result = applyEdits(spec.cells || [], spec.columns, spec.edits || [], spec.applied || [], spec.budget);
  const full = buildGrid(result.cells || [], spec.columns);
  const grid = result.grid || [];
  let fullDiff = Math.abs(full.grid.length - grid.length);
  for (let i = 0; i < Math.min(full.grid.length, grid.length); i += 1) {
    if (JSON.stringify(full.grid[i]) !== JSON.stringify(grid[i])) fullDiff += 1;
  }
  let empties = 0;
  for (const row of grid) for (const value of row) if (value === "~") empties += 1;
  return {
    grid: grid,
    empties: empties,
    conflicts: result.conflicts || [],
    first_placed: result.firstPlaced,
    first_stale: result.firstStale,
    first_diff: result.firstDiff,
    closing: result.closing,
    stale: result.stale,
    full_diff: fullDiff,
    skipped: result.skipped
  };
}
