import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeContent } from "../src/normalize.js";
import { nodeText } from "../src/text.js";

const doc = (inline: unknown[]) => ({ version: 1, blocks: [{ id: "main", type: "richtext", data: { type: "doc", content: [{ type: "heading", attrs: { level: 2 }, content: inline }] } }] });
const first = (r: ReturnType<typeof normalizeContent>) => (r.doc.blocks[0].data as any).content[0].content;

test("inlineImage: ảnh trong dòng chữ tiêu đề giữ nguyên thuộc tính hợp lệ", () => {
  const r = normalizeContent(doc([{ type: "text", text: "Chào " }, { type: "inlineImage", attrs: { src: "/u/logo.png", alt: "Logo", width: "1.4em", radius: "50%", valign: "middle" } }, { type: "text", text: " bạn" }]));
  const [a, img, b] = first(r);
  assert.equal(a.text, "Chào "); assert.equal(b.text, " bạn");
  assert.deepEqual(img, { type: "inlineImage", attrs: { src: "/u/logo.png", alt: "Logo", width: "1.4em", radius: "50%", valign: "middle" } });
});

test("inlineImage: kích thước / bo góc / căn dọc sai bị bỏ (về mặc định), không phá nội dung", () => {
  const r = normalizeContent(doc([{ type: "inlineImage", attrs: { src: "/a.png", width: "calc(100vw)", radius: "url(x)", valign: "sideways" } }]));
  const img = first(r)[0];
  assert.equal(img.type, "inlineImage"); assert.equal(img.attrs.src, "/a.png");
  assert.equal(img.attrs.width, undefined); assert.equal(img.attrs.radius, undefined); assert.equal(img.attrs.valign, undefined);
});

test("inlineImage: nodeText chỉ lấy mô tả (alt)", () => {
  assert.equal(nodeText({ type: "heading", content: [{ type: "text", text: "A " }, { type: "inlineImage", attrs: { src: "/a.png", alt: "logo" } }, { type: "text", text: " B" }] }), "A logo B\n");
});
