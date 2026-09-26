// apply.js：编辑轮次（基线：不应用编辑、不记陈旧）
import { buildGrid } from "./grid.js";

export function applyEdits(cells, columns, edits, applied, budget) {
  const built = buildGrid(cells || [], columns);
  return {
    cells: cells, grid: built.grid, conflicts: built.conflicts,
    firstPlaced: 0, firstStale: 0, firstDiff: 0, closing: 0, stale: 0, skipped: 0
  };
}
