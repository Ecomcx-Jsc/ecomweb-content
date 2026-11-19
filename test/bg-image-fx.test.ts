import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeStyle, styleCss } from "../src/index.js";

test("ảnh nền có độ mờ / làm mờ / hoà trộn: lớp ::before riêng, lớp phủ chuyển sang ::after", () => {
  const s = normalizeStyle({ background: { image: { base: "/a.jpg", mobile: "/m.jpg" }, imageOpacity: 40, imageBlur: 6, imageBlend: "multiply", overlay: "#000" } })!;
  assert.deepEqual([s.background?.imageOpacity, s.background?.imageBlur, s.background?.imageBlend], [40, 6, "multiply"]);
  const css = styleCss(s, "X");
  assert.match(css, /\.X\.X::before\{content:"";position:absolute;inset:-12px;[^}]*background-image:url\("\/a\.jpg"\)[^}]*opacity:0\.4;filter:blur\(6px\);mix-blend-mode:multiply\}/);
  assert.match(css, /@media \(max-width:640px\)\{\.X\.X::before\{background-image:url\("\/m\.jpg"\)\}\}/);
  assert.match(css, /\.X\.X::after\{content:"";[^}]*background:#000/);
  assert.doesNotMatch(css, /\.X\.X\{[^}]*background-image/); // phần tử chính không vẽ ảnh
  assert.match(css, /\.X\.X\{[^}]*isolation:isolate/);
});

test("không hiệu ứng: ảnh nằm trên chính khối như cũ; giá trị rác bị bỏ", () => {
  const css = styleCss(normalizeStyle({ background: { image: { base: "/a.jpg" }, imageOpacity: 100, imageBlur: 0 } })!, "X");
  assert.match(css, /\.X\.X\{[^}]*background-image:url\("\/a\.jpg"\)/);
  assert.doesNotMatch(css, /::before/);
  assert.equal(normalizeStyle({ background: { image: { base: "/a.jpg" }, imageOpacity: 140, imageBlur: 99, imageBlend: "x" } })?.background?.imageOpacity, undefined);
  assert.equal(normalizeStyle({ background: { imageOpacity: 30 } })?.background, undefined); // không ảnh → bỏ
});
