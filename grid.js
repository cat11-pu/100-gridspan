// grid.js：网格化（按顺序铺单元格，占用冲突记清单，非法跨度报 E_BAD_SPAN）
export function buildGrid(cells, columns) {
  const list = cells || [];
  for (const cell of list) {
    if (!(cell.rowspan >= 1) || !(cell.colspan >= 1)) {
      const error = new Error("E_BAD_SPAN: rowspan/colspan must be positive");
      error.code = "E_BAD_SPAN";
      throw error;
    }
  }
  const occupied = [];
  const placed = [];
  const conflicts = [];
  let rows = 0;
  for (const cell of list) {
    let free = true;
    for (let r = cell.row; r < cell.row + cell.rowspan && free; r += 1) {
      for (let c = cell.col; c < cell.col + cell.colspan; c += 1) {
        if (occupied[r] && occupied[r][c]) { free = false; break; }
      }
    }
    if (!free) { conflicts.push(cell.id); continue; }
    for (let r = cell.row; r < cell.row + cell.rowspan; r += 1) {
      if (!occupied[r]) occupied[r] = [];
      for (let c = cell.col; c < cell.col + cell.colspan; c += 1) occupied[r][c] = true;
    }
    placed.push(cell);
    if (cell.row + cell.rowspan > rows) rows = cell.row + cell.rowspan;
  }
  const grid = [];
  for (let r = 0; r < rows; r += 1) grid.push(new Array(columns).fill("~"));
  for (const cell of placed) {
    for (let r = cell.row; r < cell.row + cell.rowspan; r += 1) {
      for (let c = cell.col; c < cell.col + cell.colspan; c += 1) grid[r][c] = cell.text;
    }
  }
  return { grid: grid, conflicts: conflicts, rows: rows };
}
