import assert from "node:assert/strict";
import { test } from "node:test";
import { applyPatternOverrides, normalizeContent, patternOverridables } from "../src/index.js";

const T = (t: string) => [{ type: "text", text: t }];
const pattern = { version: 2, blocks: [{ id: "main", type: "richtext", data: { type: "doc", content: [
  { type: "heading", attrs: { level: 2, overrideKey: "tieu-de" }, content: T("Tiêu đề mẫu") },
  { type: "paragraph", content: T("Đoạn cố định") },
  { type: "iconBox", attrs: { icon: "star", title: "Hộp", text: "Mô tả", href: "/mau", overrideKey: "hop", style: { padding: "lg" } } },
  { type: "group", content: [{ type: "button", attrs: { text: "Mua", href: "/mua", overrideKey: "nut" } }] },
] } }] };

test("patternOverridables: liệt kê khối có overrideKey kèm thuộc tính sửa được + giá trị hiện có", () => {
  const list = patternOverridables(pattern);
  assert.deepEqual(list.map((o) => o.key), ["tieu-de", "hop", "nut"]);
  assert.equal(list[0].values.content, "Tiêu đề mẫu");
  assert.deepEqual(list[1].attrs, ["title", "text", "href"]);
  assert.equal(list[2].values.href, "/mua");
});

test("applyPatternOverrides: đổi chữ / liên kết theo khoá, bỏ giá trị độc và thuộc tính ngoài danh sách, không sửa bản gốc", () => {
  const before = JSON.stringify(pattern);
  const out = applyPatternOverrides(pattern, {
    "tieu-de": { content: "Tiêu đề riêng" },
    hop: { title: "Hộp riêng", href: "javascript:alert(1)", style: "x", icon: "evil" },
    nut: { text: "Đặt hàng", href: "https://shop.vn/dat" },
    lạ: { content: "bỏ" },
  }) as typeof pattern;
  assert.equal(JSON.stringify(pattern), before);
  const c = out.blocks[0].data.content as any[];
  assert.equal(c[0].content[0].text, "Tiêu đề riêng");
  assert.equal(c[1].content[0].text, "Đoạn cố định");
  assert.equal(c[2].attrs.title, "Hộp riêng");
  assert.equal(c[2].attrs.href, "/mau"); // href độc → giữ của mẫu
  assert.deepEqual(c[2].attrs.style, { padding: "lg" }); // kiểu dáng không ghi đè được
  assert.equal(c[2].attrs.icon, "star");
  assert.equal(c[3].content[0].attrs.text, "Đặt hàng");
  assert.equal(c[3].content[0].attrs.href, "https://shop.vn/dat");
});

test("syncedPattern giữ overrides khi chuẩn hoá", () => {
  const { doc } = normalizeContent({ version: 2, blocks: [{ id: "main", type: "richtext", data: { type: "doc", content: [{ type: "syncedPattern", attrs: { ref: 5, overrides: { hop: { title: "A" } } } }] } }] });
  assert.deepEqual((doc.blocks[0].data as any).content[0].attrs.overrides, { hop: { title: "A" } });
});
