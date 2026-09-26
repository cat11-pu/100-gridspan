// grid.js：网格化——按顺序铺单元格，被占格子记冲突，未占格子填 ~
export function buildGrid(cells, columns) {
  const list = cells || [];
  const width = columns == null ? 0 : columns;
  const occupied = new Set();
  const placed = [];
  const conflicts = [];
  let rows = 0;
  for (const cell of list) {
    const rowspan = cell.rowspan == null ? 1 : cell.rowspan;
    const colspan = cell.colspan == null ? 1 : cell.colspan;
    if (!(rowspan > 0) || !(colspan > 0)) {
      const error = new Error("bad span for cell " + cell.id);
      error.code = "E_BAD_SPAN";
      throw error;
    }
    let blocked = false;
    for (let r = cell.row; r < cell.row + rowspan && !blocked; r += 1) {
      for (let c = cell.col; c < cell.col + colspan; c += 1) {
        if (occupied.has(r + ":" + c)) { blocked = true; break; }
      }
    }
    if (blocked) { conflicts.push(cell.id); continue; }
    for (let r = cell.row; r < cell.row + rowspan; r += 1) {
      for (let c = cell.col; c < cell.col + colspan; c += 1) occupied.add(r + ":" + c);
    }
    placed.push({ cell: cell, rowspan: rowspan, colspan: colspan });
    if (cell.row + rowspan > rows) rows = cell.row + rowspan;
  }
  const grid = [];
  for (let r = 0; r < rows; r += 1) {
    const line = [];
    for (let c = 0; c < width; c += 1) line.push("~");
    grid.push(line);
  }
  for (const item of placed) {
    const cell = item.cell;
    for (let r = cell.row; r < cell.row + item.rowspan; r += 1) {
      for (let c = cell.col; c < cell.col + item.colspan; c += 1) {
        if (r < rows && c >= 0 && c < width) grid[r][c] = cell.text;
      }
    }
  }
  return { grid: grid, conflicts: conflicts, rows: rows };
}
