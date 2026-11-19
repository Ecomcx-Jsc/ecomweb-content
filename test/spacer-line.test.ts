import assert from "node:assert/strict";
import { test } from "node:test";
import { blockShell } from "../src/markup.js";

test("khoảng trống: không có đường kẻ thì vẫn là div rỗng như cũ", () => {
  const s = blockShell("spacer", { height: "lg" })!;
  assert.equal(s.className, "ecx-spacer"); assert.equal(s.style!["--ecx-sp-weight"], undefined);
});
test("khoảng trống kèm đường kẻ: biến CSS theo thuộc tính, giá trị lạ về mặc định / bị kẹp", () => {
  const s = blockShell("spacer", { height: "lg", line: true, lineStyle: "dashed", lineWeight: 99, lineWidth: 2, lineAlign: "left", lineColor: "#1a597b" })!;
  assert.equal(s.className, "ecx-spacer has-line is-line-left");
  assert.deepEqual([s.style!["--ecx-sp-style"], s.style!["--ecx-sp-weight"], s.style!["--ecx-sp-length"]], ["dashed", "12px", "5%"]);
  assert.ok(String(s.style!["--ecx-sp-color"]).includes("1a597b"));
  const bad = blockShell("spacer", { line: true, lineStyle: "evil;x", lineAlign: "up", lineColor: "red;}x{", lineWeight: "x" })!;
  assert.equal(bad.className, "ecx-spacer has-line is-line-center");
  assert.deepEqual([bad.style!["--ecx-sp-style"], bad.style!["--ecx-sp-weight"], bad.style!["--ecx-sp-length"], bad.style!["--ecx-sp-color"]], ["solid", "1px", "100%", undefined]);
});
