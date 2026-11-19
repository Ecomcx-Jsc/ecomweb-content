import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeStyle, styleCss } from "../src/index.js";

const css = (s: object) => styleCss(normalizeStyle(s as never)!, "c");

test("biến đổi: xoay / phóng / nghiêng / dịch gộp thành một transform, kẹp giá trị, bỏ giá trị lạ", () => {
  const out = css({ transform: { rotate: { base: 15 }, scale: { base: 1.2 }, skewX: { base: 10 }, x: { base: "20px" }, y: { base: "-1rem" } } });
  assert.match(out, /transform:translate\(20px,-1rem\) rotate\(15deg\) scale\(1\.2\) skew\(10deg,0deg\)/);
  assert.equal(normalizeStyle({ transform: { rotate: { base: 999 }, scale: { base: 9 }, x: { base: "url(x)" } } }), undefined);
  assert.equal(normalizeStyle({ transform: { origin: "top left" } })?.transform?.origin, "top left");
  assert.equal(normalizeStyle({ transform: { origin: "evil" } }), undefined);
});

test("biến đổi theo khổ: khổ nhỏ phát đủ chuỗi kế thừa giá trị khổ lớn (không mất xoay khi chỉ đổi phóng)", () => {
  const out = css({ transform: { rotate: { base: 10 }, scale: { mobile: 0.8 } } });
  assert.match(out, /transform:rotate\(10deg\)/); // desktop
  assert.match(out, /@media \(max-width:640px\)\{[^}]*transform:rotate\(10deg\) scale\(0\.8\)/);
});

test("định vị: absolute có offset theo khổ + z-index mặc định + cha thành điểm neo; relative không đẩy cha; sticky thắng", () => {
  const out = css({ place: { type: "absolute", top: { base: "10px" }, right: { base: "0" }, left: { mobile: "5px" } } });
  assert.match(out, /position:absolute/);
  assert.match(out, /top:10px/);
  assert.match(out, /right:0/);
  assert.match(out, /@media \(max-width:640px\)\{[^}]*left:5px/);
  assert.match(out, /z-index:1/);
  assert.match(out, /:where\(:has\(>\.c\.c\)\)\{position:relative\}/);
  assert.doesNotMatch(css({ place: { type: "relative", top: { base: "4px" } } }), /:has\(/);
  assert.doesNotMatch(css({ place: { type: "absolute" }, position: { type: "sticky" } }), /position:absolute/);
  assert.equal(normalizeStyle({ place: { type: "static" } }), undefined);
});
