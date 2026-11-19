import assert from "node:assert/strict";
import { test } from "node:test";
import { typedConfig } from "../src/typed.js";

test("chữ gõ: tách theo |, bỏ trống, gọn khoảng trắng, giới hạn 8 từ × 40 ký tự; mặc định tốc độ / dừng / lặp", () => {
  assert.equal(typedConfig({}), null);
  assert.equal(typedConfig({ typedWords: " | |  " }), null);
  const c = typedConfig({ typedWords: " website |  ứng   dụng | thương hiệu " })!;
  assert.deepEqual(c, { words: ["website", "ứng dụng", "thương hiệu"], speed: 80, pause: 1800, loop: true });
  const many = typedConfig({ typedWords: Array.from({ length: 12 }, (_, i) => `t${i}`).join("|") + "|" + "x".repeat(99) })!;
  assert.equal(many.words.length, 8);
  assert.equal(typedConfig({ typedWords: "x".repeat(99) })!.words[0].length, 40);
});
test("chữ gõ: tốc độ / dừng bị kẹp; nhận cả mảng; tắt lặp", () => {
  const c = typedConfig({ typedWords: ["a", 5, "b"], typedSpeed: 1, typedPause: 99999, typedLoop: false })!;
  assert.deepEqual(c, { words: ["a", "b"], speed: 30, pause: 6000, loop: false });
});
