import fs from "node:fs";
import { render } from "./app.js";
import { buildGrid } from "./grid.js";

// 验收断言：上面每条值收进 emit，最后与期望值逐项比对，不符就非零退出。
const __lines = [];
function emit(label, value) { __lines.push([String(label).replace(/ =$/, ""), value]); }


const spec = JSON.parse(fs.readFileSync(process.argv[2] || "sample/grid.json", "utf8"));
const view = render(spec);

emit("网格 =", JSON.stringify(view.grid));
emit("空格数 =", view.empties);
emit("冲突单元格 =", JSON.stringify(view.conflicts));
emit("首轮重排行数 =", view.first_placed);
emit("首轮陈旧行数 =", view.first_stale);
emit("首轮后与全量差异行数 =", view.first_diff);
emit("收尾轮重排行数 =", view.closing);
emit("最终陈旧行数 =", view.stale);
emit("收尾后与全量差异行数 =", view.full_diff);
emit("跳过编辑数 =", view.skipped);


// ---- 异常路径探针：真调用实现，看它报出什么码（不是从样例里抄）----
try {
  const bad = buildGrid([{ id: "big", row: 0, col: 0, rowspan: 0, colspan: 1, text: "X" }], 4);
  emit("跨度非法错误码 =", bad && bad.code ? bad.code : "no-error");
} catch (error) {
  emit("跨度非法错误码 =", error.code || error.message);
}


// ---- 期望值（参考模型算出，与题面给的验收数值一致）----
const EXPECTED = {
  "网格": [
    [
      "A",
      "A",
      "C",
      "C"
    ],
    [
      "A",
      "A",
      "~",
      "~"
    ],
    [
      "A",
      "A",
      "D",
      "E"
    ],
    [
      "F",
      "~",
      "~",
      "~"
    ]
  ],
  "空格数": 5,
  "冲突单元格": [
    "c2"
  ],
  "首轮重排行数": 1,
  "首轮陈旧行数": 2,
  "首轮后与全量差异行数": 2,
  "收尾轮重排行数": 2,
  "最终陈旧行数": 0,
  "收尾后与全量差异行数": 0,
  "跳过编辑数": 1,
  "跨度非法错误码": "E_BAD_SPAN"
};
// 有的值在收进来之前已经 stringify 过，比较前先试着解析回来，避免类型错配把正确实现判成不过。
function __same(got, want) {
  if (typeof got === "string") {
    try { const parsed = JSON.parse(got); if (JSON.stringify(parsed) === JSON.stringify(want)) return true; } catch (error) { /* 不是 JSON 就按原文比 */ }
  }
  return JSON.stringify(got) === JSON.stringify(want);
}
let __bad = 0;
for (const [label, want] of Object.entries(EXPECTED)) {
  const found = __lines.find((pair) => pair[0] === label);
  if (!found) { __bad += 1; console.log("缺失验收项 " + label); continue; }
  const got = found[1];
  if (__same(got, want)) { console.log("一致 " + label + " = " + JSON.stringify(got)); }
  else { __bad += 1; console.log("不一致 " + label + " 期望 " + JSON.stringify(want) + " 实际 " + JSON.stringify(got)); }
}
console.log("验收项 " + (Object.keys(EXPECTED).length - __bad) + "/" + Object.keys(EXPECTED).length + " 通过");
process.exit(__bad === 0 ? 0 : 1);
