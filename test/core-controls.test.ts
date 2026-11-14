import assert from "node:assert/strict";
import { test } from "node:test";
import { CORE_CONTROLS, controlsCss, coreControlsFor } from "../src/index.js";

const css = (type: string, attrs: Record<string, unknown>) => {
  const r = controlsCss(CORE_CONTROLS, type, attrs);
  return r ? r.css.replaceAll(r.cls, "X") : "";
};

test("ô Kiểu dáng lõi: danh sách (kiểu dấu, màu dấu, khoảng cách theo khổ, đường kẻ)", () => {
  assert.equal(css("bulletList", { listMarker: "check", listMarkerColor: "primary", listGap: { base: "md", mobile: "8px" }, listDivider: "#eee" }),
    ".X.X{list-style-type: var(--ecx-list-check, check)}.X.X > li::marker{color: var(--ecx-color-primary, primary)}"
    + ".X.X > li + li{margin-top: calc(var(--ecx-spacing-md) / 2);border-top: 1px solid #eee}.X.X > li:not(:first-child){padding-top: calc(var(--ecx-spacing-md) / 2)}"
    + "@media (max-width:640px){.X.X > li + li{margin-top: calc(8px / 2)}.X.X > li:not(:first-child){padding-top: calc(8px / 2)}}");
});

test("nút: màu Thường / Rê chuột qua biến của vỏ nút; ảnh: cả <img> trần lẫn <figure>", () => {
  assert.equal(css("button", { buttonBg: "#111", buttonHoverBg: "#222", buttonSize: "lg" }),
    ".X.X{--ecx-btn-bg: #111;--ecx-button-padding: var(--ecx-button-padding-lg)}.X.X:is(a):hover{--ecx-btn-bg: #222}.X.X a:hover{--ecx-btn-bg: #222}");
  assert.equal(css("image", { imageRadius: "12px", imageHoverEffect: "zoom" }),
    ".X.X img{border-radius: 12px}.X.X:is(img){border-radius: 12px}.X.X:hover img{transform: var(--ecx-hover-zoom)}.X.X:is(img):hover{transform: var(--ecx-hover-zoom)}");
});

test("bảng, tabs, đường kẻ, widget: bộ chọn theo markup chung", () => {
  assert.equal(css("table", { tableHeaderBg: "#000", tableStripe: "#fafafa" }), ".X.X th{background: #000}.X.X tbody tr:nth-child(even) > td{background: #fafafa}");
  assert.equal(css("tabs", { tabsActiveColor: "#f00" }), ".X.X [role=tab][aria-selected=true]{color: #f00}");
  assert.equal(css("horizontalRule", { hrStyle: "dashed", hrColor: "#ccc" }), ".X.X{border-top-style: dashed;border-top-color: #ccc}");
  assert.equal(css("progressBar", { progressBarColor: "accent" }), ".X.X .ecx-progress-bar{background: var(--ecx-color-accent, accent)}");
  assert.equal(css("columns", { columnsDirection: { mobile: "column-reverse" } }), "@media (max-width:640px){.X.X{flex-direction: column-reverse}}");
});

test("giá trị sai bị bỏ; ô chỉ áp cho đúng loại khối; nội dung cũ (không có ô) không sinh CSS", () => {
  assert.equal(css("bulletList", { listMarker: "url(x)", listMarkerColor: "red;}" }), "");
  assert.equal(css("paragraph", { listMarker: "disc" }), "");
  assert.equal(controlsCss(CORE_CONTROLS, "group", { background: "#fff", padding: "large" }), null);
  assert.deepEqual(Object.keys(coreControlsFor("heading")), ["textShadow"]);
  assert.ok(Object.keys(coreControlsFor("iconList")).includes("iconListIconColor"));
});
