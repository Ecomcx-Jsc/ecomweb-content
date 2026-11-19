import assert from "node:assert/strict";
import { test } from "node:test";
import { coverVideo } from "../src/markup.js";

test("video nền: chỉ nhận video trong site / https với đuôi video", () => {
  assert.equal(coverVideo({ videoSrc: "/uploads/hero.mp4" }), "/uploads/hero.mp4");
  assert.equal(coverVideo({ videoSrc: "https://cdn.test/a.webm?x=1" }), "https://cdn.test/a.webm?x=1");
  assert.equal(coverVideo({ videoSrc: "/uploads/hero.MOV" }), "/uploads/hero.MOV");
});
test("video nền: địa chỉ lạ / không phải video / mã chạy được bị bỏ", () => {
  for (const bad of ["javascript:alert(1)", "http://a.test/a.mp4", "//a.test/a.mp4", "/uploads/a.png", "/uploads/a.mp4.exe", "data:video/mp4;base64,AAA", ""]) assert.equal(coverVideo({ videoSrc: bad }), null, bad);
  assert.equal(coverVideo({}), null); assert.equal(coverVideo({ videoSrc: 5 }), null);
});
