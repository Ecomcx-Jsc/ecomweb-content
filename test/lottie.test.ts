import assert from "node:assert/strict";
import { test } from "node:test";
import { lottieConfig, lottieKind } from "../src/lottie.js";
import { CORE_NODES, normalizeAttrs } from "../src/schema.js";

test("lottie: mặc định — tự chạy, lặp, tốc độ 1, căn giữa", () => {
  const c = lottieConfig({ src: "/uploads/a.lottie" });
  assert.deepEqual([c.loop, c.autoplay, c.speed, c.trigger, c.align, c.kind], [true, true, 1, "auto", "center", "dotlottie"]);
});
test("lottie: loại tệp theo đuôi, bỏ query; đuôi lạ → rỗng (website chỉ hiện poster)", () => {
  assert.equal(lottieKind("/a/b.JSON?v=2"), "json");
  assert.equal(lottieKind("https://x.test/a.lottie#t"), "dotlottie");
  assert.equal(lottieKind("/a/b.gif"), "");
  assert.equal(lottieKind(""), "");
});
test("lottie: giá trị lạ về mặc định, số bị kẹp", () => {
  const c = lottieConfig({ src: "/a.json", trigger: "boom", align: "up", speed: 99, height: 5, maxWidth: 99999, loop: false });
  assert.deepEqual([c.trigger, c.align, c.speed, c.height, c.maxWidth, c.loop], ["auto", "center", 5, 40, 2000, false]);
});
test("lottie: schema kẹp thuộc tính (URL được lọc ở nơi hiển thị bằng safeUrl)", () => {
  const a = normalizeAttrs({ src: "/a.lottie", poster: "/p.png", speed: 50, trigger: "x" }, CORE_NODES.lottie.attrs)!;
  assert.equal(a.src, "/a.lottie"); assert.equal(a.poster, "/p.png"); assert.equal(a.speed, 5); assert.equal(a.trigger, undefined);
});
