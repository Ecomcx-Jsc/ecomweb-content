import assert from "node:assert/strict";
import { test } from "node:test";
import { widgetMarkup, type WidgetEl } from "../src/widgets.js";
import { CORE_NODES, normalizeAttrs } from "../src/schema.js";

const find = (el: WidgetEl | string | null | undefined, cls: string): WidgetEl | undefined => {
  if (!el || typeof el === "string") return undefined;
  if (el.className?.split(" ").includes(cls)) return el;
  for (const c of el.children ?? []) { const r = find(c, cls); if (r) return r; }
};

test("ảnh phủ chữ: lớp, biến CSS, tiêu đề + phụ đề + liên kết phủ cả khối", () => {
  const el = widgetMarkup("imageOverlay", { src: "https://x.test/a.jpg", alt: "A", title: "Bộ sưu tập", subtitle: "Xem ngay", href: "/shop", linkTarget: "_blank", overlayColor: "#1a597b", overlayOpacity: 70, ratio: "16/9", hAlign: "left", vAlign: "bottom", imageEffect: "grayscale" }, false)!;
  assert.match(el.className!, /is-fx-grayscale/); assert.match(el.className!, /has-ratio/); assert.match(el.className!, /is-h-left/); assert.match(el.className!, /is-v-bottom/); assert.match(el.className!, /has-frame/);
  assert.equal(el.style!["--ecx-ov-hover"], 0.7); assert.equal(el.style!["--ecx-ov-ratio"], "16/9"); assert.ok(String(el.style!["--ecx-ov-color"]).includes("1a597b"));
  assert.equal(find(el, "ecx-image-overlay-title")!.tag, "h3");
  const link = find(el, "ecx-image-overlay-link")!;
  assert.equal(link.props!.href, "/shop"); assert.equal(link.props!.rel, "noopener noreferrer"); assert.equal(link.props!["aria-label"], "Bộ sưu tập");
});
test("ảnh phủ chữ: giá trị lạ về mặc định, liên kết nguy hiểm bị bỏ, đang soạn không có liên kết phủ", () => {
  const el = widgetMarkup("imageOverlay", { title: "T", ratio: "x;y", imageEffect: "boom", hAlign: "evil", href: "javascript:alert(1)", overlayColor: "red;}body{x:1" }, false)!;
  assert.match(el.className!, /is-fx-zoom/); assert.match(el.className!, /is-h-center/); assert.equal(el.style!["--ecx-ov-ratio"], "4/3");
  assert.equal(el.style!["--ecx-ov-color"], undefined); assert.equal(find(el, "ecx-image-overlay-link"), undefined);
  const edit = widgetMarkup("imageOverlay", { title: "T", href: "/x" }, true)!;
  assert.equal(find(edit, "ecx-image-overlay-link"), undefined); assert.ok(find(edit, "ecx-image-overlay-media")!.slot === "media");
});
test("ảnh phủ chữ: thuộc tính được kẹp theo schema", () => {
  assert.ok(CORE_NODES.imageOverlay);
  const a = normalizeAttrs({ overlayOpacity: 999, frameInset: -3, ratio: "bad", subtitleMode: "always" }, CORE_NODES.imageOverlay.attrs)!;
  assert.equal(a.overlayOpacity, 100); assert.equal(a.frameInset, 0); assert.equal(a.ratio, undefined); assert.equal(a.subtitleMode, "always");
});
