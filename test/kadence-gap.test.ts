import assert from "node:assert/strict";
import { test } from "node:test";
import { CORE_CONTROLS, blockShell, controlsCss, normalizeStyle, styleCss } from "../src/index.js";

const css = (type: string, attrs: Record<string, unknown>) => controlsCss(CORE_CONTROLS, type, attrs);

test("heading: thẻ khác (p / span / div) thay h1–h6; giá trị lạ về thẻ theo cấp", () => {
  assert.equal(blockShell("heading", { level: 3, htmlTag: "p" })!.tag, "p");
  assert.equal(blockShell("heading", { level: 3, htmlTag: "span" })!.tag, "span");
  assert.equal(blockShell("heading", { level: 3, htmlTag: "script" })!.tag, "h3");
  assert.equal(blockShell("heading", { level: 2 })!.tag, "h2");
});

test("đường chia: 4 hình mới hợp lệ, hình lạ bị bỏ", () => {
  for (const shape of ["arrow", "stairs", "ripple", "mountains"]) {
    const st = normalizeStyle({ divider: { bottom: { shape, color: "primary" } } });
    assert.equal(st?.divider?.bottom?.shape, shape);
    assert.match(styleCss(st!, "c"), /mask-image/);
  }
  assert.equal(normalizeStyle({ divider: { bottom: { shape: "bogus", color: "primary" } } }), undefined);
});

test("ô mới: gạch chân nút, cao tối thiểu accordion, hình cắt ảnh, bộ lọc bản đồ — đúng bộ chọn, giá trị lạ bị bỏ", () => {
  assert.match(css("button", { buttonUnderline: "underline" })!.css, /text-decoration:\s*underline/);
  assert.match(css("button", { buttonHoverUnderline: "none" })!.css, /:hover[^}]*text-decoration:\s*none/);
  assert.match(css("accordion", { accContentMinHeight: "12rem" })!.css, /details\[open\][^}]*min-height:\s*12rem/);
  assert.match(css("image", { imageMask: "hexagon" })!.css, /--ecx-img-mask:\s*var\(--ecx-mask-hexagon\)/);
  assert.match(css("map", { mapFilter: "grayscale", mapRadius: "12px" })!.css, /iframe[^}]*filter:\s*var\(--ecx-filter-grayscale\)/);
  assert.equal(css("image", { imageMask: "bogus" }), null);
  assert.equal(css("paragraph", { imageMask: "hexagon" }), null);
});
