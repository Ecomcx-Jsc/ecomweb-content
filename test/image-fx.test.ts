import assert from "node:assert/strict";
import { test } from "node:test";
import { imageFx } from "../src/image-fx.js";

test("ảnh: mặc định / auto không thêm class", () => { assert.deepEqual(imageFx({}), { className: "" }); assert.deepEqual(imageFx({ ratio: "auto" }), { className: "" }); });
test("ảnh: tỉ lệ hợp lệ → class + biến CSS; giá trị lạ bị bỏ", () => {
  assert.deepEqual(imageFx({ ratio: "16/9" }), { className: "has-ratio", style: { "--ecx-img-ratio": "16/9" } });
  assert.deepEqual(imageFx({ ratio: "9;x" }), { className: "" });
});
