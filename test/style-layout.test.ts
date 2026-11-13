import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeGradient, normalizePresets, normalizeStyle, presetCss, ruleCss, styleCss } from "../src/index.js";

// 1.15: bố cục (flex / grid), nền chuyển màu, bóng, tỉ lệ, ghim, hover, Global Styles theo khối / phần tử.

test("bố cục flex: hướng / căn theo khổ, xuống dòng; giá trị lạ bị bỏ", () => {
  const s = normalizeStyle({ layout: { type: "flex", direction: { base: "row", mobile: "column" }, justify: "between", align: "center", wrap: false, columns: 3, x: 1 } });
  assert.deepEqual(s, { layout: { type: "flex", direction: { base: "row", mobile: "column" }, justify: { base: "between" }, align: { base: "center" }, wrap: false } });
  const css = styleCss(s!, "x");
  assert.match(css, /\.x\.x\{display:flex;flex-wrap:nowrap;gap:var\(--ecx-block-gap, 1rem\);flex-direction:row;justify-content:space-between;align-items:center\}/);
  assert.match(css, /@media \(max-width:640px\)\{\.x\.x\{flex-direction:column\}\}/);
  assert.match(css, /\.x\.x > \*\{margin-block:0\}/);
  assert.equal(normalizeStyle({ layout: { type: "table" } }), undefined);
  assert.equal(normalizeStyle({ layout: "flex" }), undefined);
});

test("bố cục lưới: số cột 1–12 theo khổ, tự chia cột theo độ rộng tối thiểu", () => {
  assert.deepEqual(normalizeStyle({ layout: { type: "grid", columns: { base: 3, tablet: "2", mobile: 13 } } }), { layout: { type: "grid", columns: { base: 3, tablet: 2 } } });
  const css = styleCss(normalizeStyle({ layout: { type: "grid", columns: { base: 4, mobile: 1 } }, gap: "lg" })!, "g");
  assert.match(css, /display:grid/);
  assert.match(css, /grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(css, /@media \(max-width:640px\)\{\.g\.g\{grid-template-columns:repeat\(1,minmax\(0,1fr\)\)\}\}/);
  assert.doesNotMatch(css, /--ecx-block-gap/);
  const auto = styleCss(normalizeStyle({ layout: { type: "grid", minColumnWidth: "15rem" } })!, "a");
  assert.match(auto, /repeat\(auto-fill,minmax\(min\(15rem,100%\),1fr\)\)/);
});

test("nền chuyển màu: linear / radial với 2–6 điểm màu đã kiểm; chèn CSS bị chặn", () => {
  assert.equal(normalizeGradient("linear-gradient(135deg,#1a597b 0%,  rgb(242, 98, 81) 100%)"), "linear-gradient(135deg, #1a597b 0%, rgb(242, 98, 81) 100%)");
  assert.equal(normalizeGradient("radial-gradient(circle, #fff, #000)"), "radial-gradient(circle, #fff, #000)");
  assert.equal(normalizeGradient("brand"), "brand");
  for (const bad of [
    "linear-gradient(90deg, #fff)", "linear-gradient(90deg, red, blue)", "url(javascript:alert(1))", "linear-gradient(90deg, #fff, #000); color: red",
    "linear-gradient(90deg, #fff, #000)) ; background:url(x)", "expression(alert(1))", "linear-gradient(90deg, #fff, url(x))", `linear-gradient(${"#fff, ".repeat(7)}#000)`,
  ]) assert.equal(normalizeGradient(bad), undefined, bad);
  assert.match(styleCss(normalizeStyle({ gradient: "brand" })!, "b"), /background:var\(--ecx-gradient-brand\)/);
});

test("bóng (preset / none), tỉ lệ khung, ghim khi cuộn", () => {
  const s = normalizeStyle({ shadow: "md", aspectRatio: "16/9", position: { type: "sticky", top: "md" } });
  assert.deepEqual(s, { shadow: "md", aspectRatio: "16/9", position: { type: "sticky", top: "md" } });
  const css = styleCss(s!, "s");
  assert.match(css, /box-shadow:var\(--ecx-shadow-md, 0 4px 12px rgb\(0 0 0 \/ \.1\)\)/);
  assert.match(css, /aspect-ratio:16\/9/);
  assert.match(css, /position:sticky;top:var\(--ecx-spacing-md\);z-index:10/);
  assert.equal(normalizeStyle({ shadow: "0 0 5px red", aspectRatio: "7/3", position: { type: "fixed" } }), undefined);
  assert.match(styleCss(normalizeStyle({ shadow: "none" })!, "n"), /box-shadow:none/);
});

test("hover: màu, viền, bóng, nhấc lên → :hover + chuyển động", () => {
  const s = normalizeStyle({ hover: { color: { text: "#fff", background: "primary" }, border: { color: "accent" }, shadow: "lg", lift: true, bad: 1 } });
  assert.deepEqual(s, { hover: { color: { text: "#fff", background: "primary" }, border: { color: "accent" }, shadow: "lg", lift: true } });
  const css = styleCss(s!, "h");
  assert.match(css, /\.h\.h\{transition:/);
  assert.match(css, /\.h\.h:hover\{color:#fff;background:var\(--ecx-color-primary, primary\);border-color:var\(--ecx-color-accent, accent\);box-shadow:var\(--ecx-shadow-lg[^}]*\);transform:translateY\(-2px\)\}/);
  assert.equal(normalizeStyle({ hover: { color: { text: "red;}" } } }), undefined);
});

test("Global Styles: preset gradient / bóng; kiểu theo khối và phần tử, độ ưu tiên thấp (:where)", () => {
  const p = normalizePresets({
    gradients: { brand: "linear-gradient(90deg, #1a597b, #f26251)", bad: "url(x)" },
    shadows: { soft: "0 2px 8px rgb(0 0 0 / .1), 0 1px 2px #0003", bad: "0 0 red; x" },
    blocks: { paragraph: { fontSize: "lg" }, button: { radius: "999px", hover: { lift: true } }, unknownBlock: { radius: "1px" } },
    elements: { link: { color: { text: "primary" }, hover: { color: { text: "accent" } } }, h2: { fontWeight: 800 }, footer: { radius: "1px" } },
  });
  assert.deepEqual(p.gradients, { brand: "linear-gradient(90deg, #1a597b, #f26251)" });
  assert.deepEqual(p.shadows, { soft: "0 2px 8px rgb(0 0 0 / .1), 0 1px 2px #0003" });
  assert.deepEqual(Object.keys(p.blocks!), ["paragraph", "button"]);
  assert.deepEqual(Object.keys(p.elements!), ["link", "h2"]);
  const css = presetCss(p);
  assert.match(css, /--ecx-gradient-brand:linear-gradient\(90deg, #1a597b, #f26251\)/);
  assert.match(css, /--ecx-shadow-soft:0 2px 8px/);
  assert.match(css, /:where\(\.ecx-content\) p:where\(:not\(\.ecx-doc-title\)\)\{font-size:var\(--ecx-font-size-lg\)\}/);
  assert.match(css, /:where\(\.ecx-content\) a:where\(:not\(\.ecx-doc-title\)\):hover\{color:var\(--ecx-color-accent, accent\)\}/);
  assert.match(css, /:where\(\.ecx-content\) \.ecx-button:where\(:not\(\.ecx-doc-title\)\):hover\{transform:translateY\(-2px\)\}/);
  assert.match(css, /:where\(\.ecx-content\) h2:where\(:not\(\.ecx-doc-title\)\)\{font-weight:800\}/);
  assert.match(ruleCss("a, b", { hover: { lift: true } }), /a:hover,b:hover\{/);
});

test("ảnh nền (1.22): ảnh theo khổ, chuyển màu phủ trên ảnh, mặc định cover / giữa / không lặp, lớp phủ ::before", () => {
  const style = normalizeStyle({
    gradient: "linear-gradient(180deg, #00000000, #000000cc)",
    background: { image: { base: "/uploads/a.jpg", mobile: "/uploads/a-m.jpg" }, position: { mobile: "50% 0%" }, fixed: true, overlay: "#000", overlayOpacity: 40 },
  })!;
  const css = styleCss(style, "x");
  assert.match(css, /\.x\.x\{[^}]*background-image:linear-gradient\(180deg, #00000000, #000000cc\),url\("\/uploads\/a\.jpg"\)/);
  assert.match(css, /background-size:cover;background-position:50% 50%;background-repeat:no-repeat;background-attachment:fixed/);
  assert.match(css, /isolation:isolate;position:relative/);
  assert.match(css, /@media \(max-width:1024px\)\{\.x\.x\{background-attachment:scroll\}\}/);
  assert.match(css, /@media \(max-width:640px\)\{\.x\.x\{background-image:[^}]*url\("\/uploads\/a-m\.jpg"\);background-position:50% 0%\}\}/);
  assert.match(css, /\.x\.x::before\{content:"";position:absolute;inset:0;background:#000;opacity:0\.4;pointer-events:none;z-index:-1;border-radius:inherit\}/);
  // Ghim khi cuộn đã là phần tử định vị → không đổi sang relative
  assert.doesNotMatch(styleCss(normalizeStyle({ position: { type: "sticky" }, background: { overlay: "#000" } })!, "y"), /position:relative/);
});
