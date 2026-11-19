import assert from "node:assert/strict";
import { test } from "node:test";
import { blockCitation, blockShell, buttonIcon, buttonWrapShell, coverParts, linkRel } from "../src/index.js";

test("paragraph: căn trái không in style, căn khác thì có", () => {
  assert.equal(blockShell("paragraph", { textAlign: "left" })!.style, undefined);
  assert.deepEqual(blockShell("paragraph", { textAlign: "center" })!.style, { textAlign: "center" });
});
test("columns: class theo căn dọc, flex-wrap theo stack; column đọc stack của cha", () => {
  const c = blockShell("columns", { verticalAlign: "center", stack: false })!;
  assert.equal(c.className, "ecx-columns cms-columns ecx-columns-center cms-columns-center");
  assert.equal(c.style!.flexWrap, "nowrap");
  assert.equal(blockShell("column", { width: 30 }, { type: "columns", attrs: { stack: false } })!.style!.minWidth, 0);
  assert.equal(blockShell("column", {}, { type: "columns" })!.style!.minWidth, "min(100%, 14rem)");
});
test("blockquote: trích dẫn; khối lạ → null", () => {
  assert.equal(blockCitation({ citation: "A" }), "A");
  assert.equal(blockCitation({}), undefined);
  assert.equal(blockShell("nope"), null);
});

test("group/button/spacer/cover có vỏ; nút đứng riêng có vỏ bọc", () => {
  assert.equal(blockShell("group", { padding: "small" })!.style!.padding, "0.75rem");
  assert.equal(blockShell("group", { background: "#fff" })!.style!.padding, "1.5rem");
  assert.equal(blockShell("button", { variant: "outline" })!.tag, "a");
  assert.equal(blockShell("spacer", {})!.style!.height !== undefined, true);
  // 2 (v3): callout / mediaText / pullquote đã bỏ — không còn vỏ
  for (const t of ["callout", "mediaText", "pullquote"]) assert.equal(blockShell(t), null);
  assert.equal(buttonWrapShell({ align: "center" }).style!.textAlign, "center");
  assert.equal(coverParts({ src: "/a.jpg", fixed: true }).fixed, true);
});

test("1.24 ảnh bìa: ảnh phủ kín bằng kiểu inline (thắng img { height:auto } của theme), điểm lấy nét, lớp phủ", () => {
  const p = coverParts({ src: "/a.jpg", focal: "20% 80%", overlay: "#000", opacity: 40 });
  assert.equal(p.imgStyle.objectFit, "cover");
  assert.equal(p.imgStyle.height, "100%");
  assert.equal(p.imgStyle.position, "absolute");
  assert.equal(p.imgStyle.objectPosition, "20% 80%");
  assert.deepEqual(p.overlayStyle, { position: "absolute", inset: 0, background: "#000", opacity: 0.4 });
  assert.equal(coverParts({ src: "/a.jpg", focal: "x;}" }).imgStyle.objectPosition, "50% 50%");
  assert.equal(blockShell("cover", { src: "/a.jpg", fixed: true, focal: "0% 100%" })!.style!.backgroundPosition, "0% 100%");
  // Dữ liệu cũ (không focal): như trước, không thêm backgroundPosition
  assert.equal(blockShell("cover", { src: "/a.jpg", fixed: true })!.style!.backgroundPosition, undefined);
});

test("customHtml / embed", () => {
  assert.equal(blockShell("customHtml", {})!.className, "ecx-html");
  assert.equal(blockShell("embed", { url: "https://example.com/x" }), null);
  assert.match(blockShell("embed", { url: "https://vimeo.com/76979871" })!.className!, /ecx-embed-vimeo cms-embed-vimeo/);
});

test("linkRel + gallery", () => {
  assert.equal(linkRel("nofollow", "_blank"), "nofollow noopener noreferrer");
  assert.equal(linkRel(null, null), undefined);
  assert.equal(blockShell("gallery", { columns: 2 })!.className, "ecx-gallery cms-gallery ecx-gallery-columns-2 columns-2");
});

test("nút (1.26): icon → inline-flex + icon hợp lệ, rộng hết khung, nhãn trình đọc màn hình; icon lạ bỏ", () => {
  const s = blockShell("button", { text: "Mua", icon: "arrowRight", width: "full", ariaLabel: "Mua ngay áo thun" })!;
  assert.equal(s.style?.display, "flex");
  assert.equal((s.attrs as Record<string, string>)["aria-label"], "Mua ngay áo thun");
  assert.ok(s.className?.includes("is-full"));
  assert.equal(buttonIcon({ icon: "khong-co" }), null);
  assert.equal(blockShell("button", { text: "x" })!.style?.display, "inline-block");
});

test("icon cạnh chữ 1.29: vỏ có class + biến mặt nạ + chú thích; icon lạ / không có thì giữ vỏ cũ", () => {
  const sh = blockShell("heading", { level: 2, icon: "star", iconPosition: "right", iconTitle: " Nổi bật " })!;
  assert.equal(sh.className, "ecx-has-icon ecx-icon-right");
  assert.match(String(sh.style?.["--ecx-text-icon"]), /^url\("data:image\/svg\+xml,%3Csvg[^"]*stroke='black'[^"]*"\)$/);
  assert.deepEqual(sh.attrs, { title: "Nổi bật" });
  const left = blockShell("paragraph", { icon: "phone" })!;
  assert.equal(left.className, "ecx-has-icon ecx-icon-left");
  assert.equal(left.attrs, undefined);
  assert.equal(blockShell("paragraph", { icon: "rocket" })!.className, undefined);
  assert.equal(blockShell("paragraph", {})!.className, undefined);
});
