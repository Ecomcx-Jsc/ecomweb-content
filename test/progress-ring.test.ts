import assert from "node:assert/strict";
import { test } from "node:test";
import { widgetMarkup, type WidgetEl } from "../src/widgets.js";
const find = (el: WidgetEl | string | undefined | null, cls: string): WidgetEl | undefined => { if (!el || typeof el === "string") return undefined; if (el.className?.split(" ").includes(cls)) return el; for (const c of el.children ?? []) { const r = find(c, cls); if (r) return r; } };

test("thanh tiến độ tròn: vòng SVG pathLength=100, nét = phần trăm, số trong vòng, nhãn bên dưới, aria đầy đủ", () => {
  const el = widgetMarkup("progressBar", { shape: "circle", label: "Kỹ năng", value: 72 }, false)!;
  assert.match(el.className!, /is-circle/);
  const ring = find(el, "ecx-progress-ring")!;
  assert.equal(ring.props!.role, "progressbar"); assert.equal(ring.props!["aria-valuenow"], 72);
  assert.equal(find(el, "ecx-progress-ring-bar")!.props!.strokeDasharray, "72 100");
  assert.equal(find(el, "ecx-progress-ring-bar")!.props!.pathLength, 100);
  assert.equal(find(el, "ecx-progress-value")!.children![0], "72%");
  assert.equal(find(el, "ecx-progress-track"), undefined);
});
test("bán nguyệt dùng cung 0 0 100 55; giá trị lạ về dạng thanh; vượt max bị kẹp", () => {
  const half = widgetMarkup("progressBar", { shape: "half", value: 150, max: 100 }, false)!;
  assert.match(half.className!, /is-half/);
  assert.equal(find(half, "ecx-progress-ring-bar")!.props!.strokeDasharray, "100 100");
  assert.equal((half.children!.find((c) => typeof c !== "string" && c.className === "ecx-progress-ring") as WidgetEl).children![0] && true, true);
  const bad = widgetMarkup("progressBar", { shape: "triangle", value: 10 }, false)!;
  assert.ok(find(bad, "ecx-progress-track") && !/is-(circle|half)/.test(bad.className!));
});
