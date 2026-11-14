import assert from "node:assert/strict";
import { test } from "node:test";
import { CORE_NODES, ICON_NAMES, WIDGET_BLOCKS, formatCounter, widgetMarkup, type WidgetEl } from "../src/index.js";

const find = (el: WidgetEl | string | null, cls: string): WidgetEl | undefined => {
  if (!el || typeof el === "string") return undefined;
  if (el.className?.split(" ").includes(cls)) return el;
  for (const c of el.children ?? []) { const f = find(c, cls); if (f) return f; }
  return undefined;
};
const texts = (el: WidgetEl | string | undefined): string => (!el ? "" : typeof el === "string" ? el : (el.children ?? []).map(texts).join(""));

test("widget: mỗi khối có schema và icon dùng chung tập ICON_NAMES", () => {
  for (const t of WIDGET_BLOCKS) assert.ok(CORE_NODES[t], t);
  assert.deepEqual(CORE_NODES.iconBox.attrs!.icon.enum, ICON_NAMES);
  assert.deepEqual(CORE_NODES.icon.attrs!.name.enum, ICON_NAMES);
});

test("formatCounter: nhóm nghìn và dấu thập phân", () => {
  assert.equal(formatCounter(12500, 0, "none"), "12500");
  assert.equal(formatCounter(12500, 0, ","), "12,500");
  assert.equal(formatCounter(1234567.5, 1, "."), "1.234.567,5");
  assert.equal(formatCounter(9876, 0, "space"), "9 876");
  assert.equal(formatCounter(-1500, 0, ","), "-1,500");
});

test("counter: HTML có sẵn số cuối (không JS vẫn đúng), dữ liệu đếm trên phần tử số", () => {
  const el = widgetMarkup("counter", { start: 0, end: 98.6, prefix: "~", suffix: "%", separator: ",", title: "Hài lòng" });
  const v = find(el, "ecx-counter-value")!;
  assert.equal(v.client, "counter");
  assert.equal(texts(v), "98.6");
  assert.equal(v.props!["data-decimals"], 1);
  assert.equal(texts(find(el, "ecx-counter-number")), "~98.6%");
});

test("progressBar: role progressbar, giá trị kẹp 0–100, có ecx-in cho hiệu ứng cuộn", () => {
  const el = widgetMarkup("progressBar", { label: "Thiết kế", value: 140 })!;
  assert.match(el.className!, /\becx-in\b/);
  const track = find(el, "ecx-progress-track")!;
  assert.equal(track.props!.role, "progressbar");
  assert.equal(track.props!["aria-valuenow"], 100);
  assert.equal(track.props!["aria-label"], "Thiết kế");
  assert.equal(find(el, "ecx-progress-bar")!.style!.width, "100%");
});

test("URL không an toàn bị bỏ; chữ rỗng không vẽ (trừ khi đang soạn)", () => {
  const box = widgetMarkup("iconBox", { title: "A", href: "javascript:alert(1)" })!;
  assert.ok(!JSON.stringify(box).includes("javascript"));
  assert.equal(find(box, "ecx-icon-box-text"), undefined);
  assert.ok(find(widgetMarkup("iconBox", { title: "A" }, true), "ecx-icon-box-text"));
  const img = widgetMarkup("imageBox", { src: "javascript:x", title: "B" })!;
  assert.equal(find(img, "ecx-image-box-media"), undefined);
  assert.equal(find(widgetMarkup("imageBox", {}, true), "ecx-image-box-media")!.slot, "media");
  const list = widgetMarkup("iconList", { items: [{ text: "x", href: "javascript:x" }, { text: "" }, { text: "y", href: "/a" }] })!;
  assert.equal(list.children!.length, 2);
  assert.equal(JSON.stringify(list).includes("javascript"), false);
  assert.equal(widgetMarkup("iconList", { items: [] }), null);
});
