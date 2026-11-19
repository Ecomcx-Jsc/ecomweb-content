import assert from "node:assert/strict";
import { test } from "node:test";
import { blockBgVideo, normalizeStyle, styleCss } from "../src/index.js";

test("video nền: chỉ nhận mp4 / webm trong site hoặc https; khối có video được tạo ngữ cảnh xếp chồng", () => {
  const st = normalizeStyle({ background: { video: "/uploads/hero.mp4" } })!;
  assert.equal(st.background?.video, "/uploads/hero.mp4");
  assert.equal(blockBgVideo({ background: { video: "https://cdn.example.com/a.webm?x=1" } }), "https://cdn.example.com/a.webm?x=1");
  for (const bad of ["javascript:alert(1)", "http://evil.test/a.mp4", "/uploads/a.exe", "//evil.test/a.mp4", "/uploads/a b.mp4"]) assert.equal(blockBgVideo({ background: { video: bad } }), null, bad);
  const css = styleCss(st, "c");
  assert.match(css, /isolation:isolate/);
  assert.match(css, /overflow:hidden/);
});

test("backdrop-filter: làm mờ nền sau khối 0–40px, giá trị lạ bị bỏ", () => {
  assert.match(styleCss(normalizeStyle({ backdropBlur: "12px" })!, "c"), /backdrop-filter:blur\(12px\)/);
  assert.equal(normalizeStyle({ backdropBlur: "99px" }), undefined);
  assert.equal(normalizeStyle({ backdropBlur: "url(x)" }), undefined);
});
