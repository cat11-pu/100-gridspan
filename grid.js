// grid.js：网格化（基线：只铺一行、不判冲突、不校验跨度）
export function buildGrid(cells, columns) {
  const grid = [["~"]];
  return { grid: grid, conflicts: [], rows: grid.length };
}
