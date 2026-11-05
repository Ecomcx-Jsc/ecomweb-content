import assert from "node:assert/strict";
import { test } from "node:test";
import { motionClasses, normalizeStyle, ruleCss, styleCss } from "../src/index.js";

// 1.16: chuyển động — hiệu ứng khi cuộn tới + hover một chạm.

test("chuẩn hoá chuyển động: giữ mã hợp lệ (cả mã của plugin), bỏ giá trị lạ", () => {
  assert.deepEqual(normalizeStyle({ motion: { in: "slide-up", duration: "slow", delay: "200", repeat: true, stagger: true, hover: "lift" } }),
    { motion: { in: "slide-up", duration: "slow", delay: 200, repeat: true, stagger: true, hover: "lift" } });
  // mã plugin hợp lệ được giữ; "normal" và delay 0 là mặc định nên bỏ
  assert.deepEqual(normalizeStyle({ motion: { in: "acme-bounce-in", duration: "normal", delay: 0 } }), { motion: { in: "acme-bounce-in" } });
  // mã không hợp lệ / chèn CSS, "none", độ trễ ngoài khoảng, hover lạ
  assert.equal(normalizeStyle({ motion: { in: "x;}body{display:none", hover: "spin", delay: 99999 } }), undefined);
  assert.equal(normalizeStyle({ motion: { in: "none" } }), undefined);
  assert.equal(normalizeStyle({ motion: { in: "Fade" } }), undefined);
  assert.equal(normalizeStyle({ motion: "fade" }), undefined);
  // duration / delay / repeat / stagger vô nghĩa khi không có hiệu ứng cuộn
  assert.deepEqual(normalizeStyle({ motion: { duration: "fast", delay: 100, repeat: true, stagger: true, hover: "glow" } }), { motion: { hover: "glow" } });
});

test("CSS hiệu ứng cuộn: ẩn chỉ khi có html.ecx-js và class ecx-in; có tôn trọng giảm chuyển động", () => {
  const css = styleCss(normalizeStyle({ motion: { in: "zoom-in", duration: "fast", delay: 150 } })!, "m");
  assert.match(css, /html\.ecx-js \.m\.m\.ecx-in:not\(\.is-in\)\{opacity:0\}/);
  assert.match(css, /\.m\.m\.is-in\{animation:ecx-in-zoom-in 300ms var\(--ecx-motion-ease, cubic-bezier\(\.2, \.7, \.3, 1\)\) 150ms backwards\}/);
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)\{\.m\.m\.is-in,\.m\.m\.is-in>\*\{animation:none\}\}/);
});

test("hiện lần lượt: hiệu ứng áp cho khối con, khối cha không bị ẩn", () => {
  const css = styleCss(normalizeStyle({ motion: { in: "slide-up", stagger: true, delay: 100 } })!, "s");
  assert.match(css, /html\.ecx-js \.s\.s\.ecx-in:not\(\.is-in\)>\*\{opacity:0\}/);
  assert.match(css, /\.s\.s\.is-in>\*\{animation:ecx-in-slide-up 600ms [^}]* calc\(100ms \+ var\(--ecx-i, 0\) \* var\(--ecx-stagger-step, 80ms\)\) backwards\}/);
  assert.doesNotMatch(css, /\.s\.s:not\(\.is-in\)\{opacity/);
});

test("hover một chạm: chỉ chạy khi có chuột; gộp transition với hover màu cũ", () => {
  const only = styleCss(normalizeStyle({ motion: { hover: "lift" } })!, "h");
  assert.match(only, /@media \(hover:hover\)\{\.h\.h:hover\{transform:translateY\(-4px\)/);
  assert.doesNotMatch(only, /ecx-js/);
  const both = styleCss(normalizeStyle({ hover: { color: { background: "primary" } }, motion: { hover: "grow" } })!, "b");
  const t = /\.b\.b\{transition:(transform \.25s var\(--ecx-motion-ease, cubic-bezier\(\.2, \.7, \.3, 1\)\)),box-shadow[^{]*,color \.25s[^{]*,background \.25s[^{]*,border-color \.25s[^{]*\}/;
  assert.match(both, t);
});

test("class cho script observer; Global Styles (ruleCss) không sinh trạng thái ẩn", () => {
  assert.equal(motionClasses(normalizeStyle({ motion: { in: "fade" } })), "ecx-in");
  assert.equal(motionClasses(normalizeStyle({ motion: { in: "fade", repeat: true } })), "ecx-in ecx-in-repeat");
  assert.equal(motionClasses(normalizeStyle({ motion: { hover: "lift" } })), "");
  assert.equal(motionClasses(undefined), "");
  // ruleCss dùng cho Global Styles theo loại khối: không có class ecx-in để bật lại → không được ẩn khối
  assert.doesNotMatch(ruleCss(".ecx-image", normalizeStyle({ motion: { in: "fade" } })!), /opacity/);
});
