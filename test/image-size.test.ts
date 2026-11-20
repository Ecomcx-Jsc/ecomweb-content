import { test } from "node:test";
import assert from "node:assert/strict";
import { sizedImage } from "../src/image-size.js";

const srcset = "/u/a-150x150.webp 150w, /u/a-300x188.webp 300w, /u/a-768x480.webp 768w, /u/a.webp 800w";
const base = { src: "/u/a.webp", srcset, width: 800, height: 500 };

test("sizedImage: Vừa → bản 300px, giữ tỉ lệ", () => {
  assert.deepEqual(sizedImage({ ...base, size: "medium" }), { src: "/u/a-300x188.webp", width: 300, height: 188 });
});
test("sizedImage: Nhỏ → bản cắt vuông 150×150", () => {
  assert.deepEqual(sizedImage({ ...base, size: "thumbnail" }), { src: "/u/a-150x150.webp", width: 150, height: 150 });
});
test("sizedImage: Lớn / Đầy đủ → giữ nguyên ảnh gốc (bài cũ mặc định large không đổi)", () => {
  assert.equal(sizedImage({ ...base, size: "large" }), null);
  assert.equal(sizedImage({ ...base, size: "full" }), null);
});
test("sizedImage: full / không chọn / không srcset → null", () => {
  assert.equal(sizedImage({ ...base }), null);
  assert.equal(sizedImage({ src: "/x.png", size: "medium" }), null);
  assert.equal(sizedImage({ src: "/x.png", srcset: "/x.png 800w", size: "medium" }), null);
});
test("sizedImage: người viết đã kéo tay bề rộng → tôn trọng, không ép cỡ", () => {
  assert.equal(sizedImage({ ...base, size: "medium", width: 420 }), null);
});
