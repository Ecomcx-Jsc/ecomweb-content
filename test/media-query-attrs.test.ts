import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeContent } from "../src/index.js";

// next: thuộc tính hành vi của video / audio / query được ép kiểu; giá trị sai bị bỏ
const run = (node: unknown) => {
  const doc = normalizeContent({ version: 1, blocks: [{ id: "main", type: "richtext", data: { type: "doc", content: [node] } }] } as never).doc as unknown as { blocks: { data: { content: { attrs?: Record<string, unknown> }[] } }[] };
  return doc.blocks[0].data.content[0].attrs ?? {};
};

test("video: boolean ép kiểu, preload ngoài danh sách bị bỏ", () => {
  const a = run({ type: "video", attrs: { src: "/v.mp4", autoplay: "true", loop: 1, muted: true, preload: "bogus" } });
  assert.equal(a.autoplay, true);
  assert.equal(a.muted, true);
  assert.equal(a.preload, undefined);
});

test("query: authorId là số nguyên dương, sticky chỉ nhận any|only|exclude, orderBy mới hợp lệ", () => {
  const a = run({ type: "query", attrs: { inherit: false, authorId: "7", sticky: "only", orderBy: "rand", exclude: "1,2" } });
  assert.equal(a.authorId, 7);
  assert.equal(a.sticky, "only");
  assert.equal(a.orderBy, "rand");
  assert.equal(a.exclude, "1,2");
  const bad = run({ type: "query", attrs: { authorId: -3, sticky: "all", orderBy: "id; drop" } });
  assert.equal(bad.authorId, 1); // số kẹp vào [min, max], không bỏ
  assert.equal(bad.sticky, undefined);
  assert.equal(bad.orderBy, undefined);
});

test("image.href / linkTarget, blockquote.citation, orderedList.reversed, postDate.displayType", () => {
  const img = run({ type: "image", attrs: { src: "/a.jpg", href: "javascript:alert(1)", linkTarget: "_top" } });
  // URL độc không bị bỏ ở bước chuẩn hoá: renderer (safeUrl) và ContentSanitizer phía core chặn
  assert.equal(img.linkTarget, undefined);
  assert.equal(run({ type: "image", attrs: { src: "/a.jpg", href: "/x", linkTarget: "_blank" } }).linkTarget, "_blank");
  assert.equal(run({ type: "blockquote", attrs: { citation: "An" } }).citation, "An");
  assert.equal(run({ type: "orderedList", attrs: { reversed: "true" } }).reversed, true);
  assert.equal(run({ type: "postDate", attrs: { displayType: "modified" } }).displayType, "modified");
  assert.equal(run({ type: "postDate", attrs: { displayType: "x" } }).displayType, undefined);
});

test("block mới: rating kẹp giá trị, countdown/accordion giữ thuộc tính, gallery/navigation enum sai bị bỏ", () => {
  const r = run({ type: "rating", attrs: { value: 99, max: 3, label: "x" } });
  assert.equal(r.value, 10);
  assert.equal(r.max, 3);
  assert.equal(run({ type: "countdown", attrs: { target: "2030-01-01T00:00:00Z", label: "Sale" } }).target, "2030-01-01T00:00:00Z");
  assert.equal(run({ type: "accordion", attrs: { multiple: "true" } }).multiple, true);
  assert.equal(run({ type: "gallery", attrs: { images: [], linkTo: "bogus", imageCrop: false } }).linkTo, undefined);
  assert.equal(run({ type: "navigation", attrs: { overlayMenu: "always" } }).overlayMenu, "always");
  assert.equal(run({ type: "languageSwitcher", attrs: { display: "dropdown" } }).display, "dropdown");
  assert.equal(run({ type: "postAuthor", attrs: { avatarSize: 9999, showName: false } }).avatarSize, 128);
});

test("tabs / tab / carousel / shortcode / readMore / pagination / lightbox giữ thuộc tính hợp lệ", () => {
  assert.equal(run({ type: "tab", attrs: { title: "Giới thiệu" } }).title, "Giới thiệu");
  assert.equal(run({ type: "carousel", attrs: { slidesPerView: 9 } }).slidesPerView, 4);
  assert.equal(run({ type: "shortcode", attrs: { name: "hello", args: { a: "1" } } }).name, "hello");
  assert.equal(run({ type: "readMore", attrs: { text: "Xem thêm" } }).text, "Xem thêm");
  assert.equal(run({ type: "avatar", attrs: { size: 9999 } }).size, 256);
  assert.equal(run({ type: "pagination", attrs: { type: "prevNext", midSize: 99 } }).type, "prevNext");
  assert.equal(run({ type: "pagination", attrs: { type: "bogus" } }).type, undefined);
  assert.equal(run({ type: "image", attrs: { src: "/a.jpg", lightbox: true } }).lightbox, true);
  assert.equal(run({ type: "gallery", attrs: { images: [], lightbox: "true" } }).lightbox, true);
});

test("termList / pageList / archives: ép kiểu, enum sai bị bỏ, số kẹp vào khoảng", () => {
  const t = run({ type: "termList", attrs: { taxonomy: "post_tag", display: "cloud", showCount: "true", style2: 1 } });
  assert.equal(t.display, "cloud");
  assert.equal(t.showCount, true);
  assert.equal(run({ type: "termList", attrs: { display: "bogus" } }).display, undefined);
  assert.equal(run({ type: "pageList", attrs: { parentId: "5", depth: 9 } }).depth, 3);
  assert.equal(run({ type: "pageList", attrs: { parentId: "5" } }).parentId, 5);
  assert.equal(run({ type: "archives", attrs: { limit: 999 } }).limit, 60);
});

test("mark kbd được giữ", () => {
  const doc = normalizeContent({ version: 1, blocks: [{ id: "main", type: "richtext", data: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Ctrl", marks: [{ type: "kbd" }] }] }] } }] } as never).doc as never as { blocks: { data: { content: { content: { marks?: { type: string }[] }[] }[] } }[] };
  assert.equal(doc.blocks[0].data.content[0].content[0].marks?.[0].type, "kbd");
});

test("icon: tên ngoài danh sách bị bỏ, cỡ kẹp; loginout / footnotes / pageBreak / mark footnote", () => {
  assert.equal(run({ type: "icon", attrs: { name: "<script>", size: 999 } }).name, undefined);
  assert.equal(run({ type: "icon", attrs: { name: "mail", size: 999 } }).size, 128);
  assert.equal(run({ type: "loginout", attrs: { loginText: "Vào" } }).loginText, "Vào");
  assert.equal(run({ type: "footnotes", attrs: { title: "Chú thích" } }).title, "Chú thích");
  const doc = normalizeContent({ version: 1, blocks: [{ id: "main", type: "richtext", data: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "a", marks: [{ type: "footnote", attrs: { note: "ghi chú" } }] }] }, { type: "pageBreak" }] } }] } as never).doc as never as { blocks: { data: { content: { type: string; content?: { marks?: { attrs?: { note: string } }[] }[] }[] } }[] };
  assert.equal(doc.blocks[0].data.content[0].content?.[0].marks?.[0].attrs?.note, "ghi chú");
  assert.equal(doc.blocks[0].data.content[1].type, "pageBreak");
});

test("comments: perPage kẹp 1–50, order chỉ asc|desc, avatarSize kẹp, showDate ép bool", () => {
  const a = run({ type: "comments", attrs: { perPage: 999, order: "asc", avatarSize: 5, showDate: "false" } });
  assert.equal(a.perPage, 50);
  assert.equal(a.order, "asc");
  assert.equal(a.avatarSize, 16);
  assert.equal(a.showDate, false);
  assert.equal(run({ type: "comments", attrs: { order: "random" } }).order, undefined);
});

test("search: postType chuỗi, showLabel bool, buttonPosition chỉ right|left|below", () => {
  const a = run({ type: "search", attrs: { postType: "page", showLabel: "true", buttonPosition: "below" } });
  assert.equal(a.postType, "page"); assert.equal(a.showLabel, true); assert.equal(a.buttonPosition, "below");
  assert.equal(run({ type: "search", attrs: { buttonPosition: "top" } }).buttonPosition, undefined);
});
