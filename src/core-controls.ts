/**
 * 1.24: ô Kiểu dáng riêng của khối lõi (như tab Style của từng widget Elementor: Icon List › Danh sách / Icon / Chữ…).
 * Khai báo bằng cùng bộ máy với plugin (defineBlockControls / controlsCss) → khung soạn và website sinh CSS y hệt nhau.
 * Giá trị lưu thẳng trong attrs của khối (vd `listMarkerColor`); mặc định = token `--ecx-*` của style.css (ô trống = theo theme).
 * Thứ tự thuộc tính trong một mục = thứ tự ô trên giao diện; `section` = mục, `state` = thẻ Rê chuột / Đang mở (như Normal / Hover).
 */
import { defineBlockControls, type BlockControls, type ControlSpec, type PartProp } from "./controls.js";

const W = "{{WRAPPER}}";
type Css = Record<string, string>;
const color = (section: string, css: Css, state?: ControlSpec["state"]): ControlSpec => ({ type: "color", section, css, ...(state ? { state } : {}) });
const length = (section: string, css: Css, responsive = false): ControlSpec => ({ type: "length", section, css, ...(responsive ? { responsive } : {}) });
const choice = (section: string, options: string[], css: Css, extra: Partial<ControlSpec> = {}): ControlSpec => ({ type: "enum", section, options, css, ...extra });
/** Ảnh: website in `<img>` trần khi không có chú thích / căn lề (class gắn thẳng lên img), còn lại là `<figure><img>`. */
const img = (decl: string, hover = false): Css => hover ? { [`${W}:hover img`]: decl, [`${W}:is(img):hover`]: decl } : { [`${W} img`]: decl, [`${W}:is(img)`]: decl };
/** Nút: khối nút đứng riêng có vỏ `<p>` (class ở p), trong nhóm nút thì class ở chính thẻ `<a>`. */
const btnHover = (decl: string): Css => ({ [`${W}:is(a):hover`]: decl, [`${W} a:hover`]: decl });
const SHADOWS = ["sm", "md", "lg", "xl"];
// Nhóm thuộc tính thường gặp của phần (1.26)
const BOX: PartProp[] = ["background", "border", "radius", "shadow", "padding"];
const TEXT: PartProp[] = ["typography", "color", "margin"];
const ICON: PartProp[] = ["color", "background", "iconSize", "padding", "radius", "border", "margin"];
const FILTERS = ["none", "grayscale", "sepia", "blur", "bright", "dim", "saturate"];

export const CORE_CONTROLS: readonly BlockControls[] = [
  defineBlockControls({ id: "core/text", blocks: ["heading", "paragraph"], attributes: {
    textShadow: choice("text", ["sm", "md", "lg"], { [W]: "text-shadow: var(--ecx-text-shadow-{{VALUE}})" }),
  } }),
  defineBlockControls({ id: "core/list", blocks: ["bulletList", "orderedList"], attributes: {
    listMarker: choice("list", ["disc", "circle", "square", "decimal", "decimal-leading-zero", "lower-alpha", "upper-alpha", "lower-roman", "upper-roman", "check", "arrow", "dash", "none"],
      { [W]: "list-style-type: var(--ecx-list-{{VALUE}}, {{VALUE}})" }),
    listMarkerColor: color("list", { [`${W} > li::marker`]: "color: {{VALUE}}" }),
    // Khoảng giữa các mục chia đôi quanh đường kẻ (margin trên + padding trên) — có kẻ thì kẻ nằm giữa
    listGap: length("list", { [`${W} > li + li`]: "margin-top: calc({{VALUE}} / 2)", [`${W} > li:not(:first-child)`]: "padding-top: calc({{VALUE}} / 2)" }, true),
    listDivider: color("list", { [`${W} > li + li`]: "border-top: 1px solid {{VALUE}}" }),
  } }),
  defineBlockControls({ id: "core/button", blocks: ["button"], attributes: {
    buttonColor: color("button", { [W]: "--ecx-btn-color: {{VALUE}}" }),
    buttonBg: color("button", { [W]: "--ecx-btn-bg: {{VALUE}}" }),
    buttonHoverColor: color("button", btnHover("--ecx-btn-color: {{VALUE}}"), "hover"),
    buttonHoverBg: color("button", btnHover("--ecx-btn-bg: {{VALUE}}"), "hover"),
    buttonSize: choice("button", ["xs", "sm", "md", "lg", "xl"], { [W]: "--ecx-button-padding: var(--ecx-button-padding-{{VALUE}})" }),
    buttonRadius: length("button", { [W]: "--ecx-button-radius: {{VALUE}}" }),
    buttonWeight: choice("button", ["400", "500", "600", "700", "800"], { [W]: "--ecx-button-font-weight: {{VALUE}}" }),
    buttonShadow: choice("button", SHADOWS, { [`${W}:is(a)`]: "box-shadow: var(--ecx-shadow-{{VALUE}})", [`${W} a`]: "box-shadow: var(--ecx-shadow-{{VALUE}})" }),
  } }),
  defineBlockControls({ id: "core/image", blocks: ["image"], attributes: {
    imageWidth: length("image", img("width: {{VALUE}}"), true),
    imageHeight: length("image", img("height: {{VALUE}}"), true),
    imageFit: choice("image", ["cover", "contain"], img("object-fit: {{VALUE}}")),
    imageRadius: length("image", img("border-radius: {{VALUE}}")),
    imageBorderWidth: length("image", img("border: {{VALUE}} solid")),
    imageBorderColor: color("image", img("border-color: {{VALUE}}")),
    imageShadow: choice("image", SHADOWS, img("box-shadow: var(--ecx-shadow-{{VALUE}})")),
    imageOpacity: { type: "number", section: "image", min: 0, max: 1, step: 0.05, css: img("opacity: {{VALUE}}") },
    imageFilter: choice("image", FILTERS, img("filter: var(--ecx-filter-{{VALUE}})")),
    imageHoverEffect: choice("image", ["zoom", "lift", "tilt"], img("transform: var(--ecx-hover-{{VALUE}})", true), { state: "hover" }),
    imageHoverOpacity: { type: "number", section: "image", state: "hover", min: 0, max: 1, step: 0.05, css: img("opacity: {{VALUE}}", true) },
    imageHoverFilter: choice("image", FILTERS, img("filter: var(--ecx-filter-{{VALUE}})", true), { state: "hover" }),
  } }),
  defineBlockControls({ id: "core/table", blocks: ["table"], attributes: {
    tableBorderColor: color("table", { [`${W} :is(th,td)`]: "border-color: {{VALUE}}" }),
    tableBorderWidth: length("table", { [`${W} :is(th,td)`]: "border-width: {{VALUE}}" }),
    tableHeaderBg: color("table", { [`${W} th`]: "background: {{VALUE}}" }),
    tableHeaderColor: color("table", { [`${W} th`]: "color: {{VALUE}}" }),
    tableStripe: color("table", { [`${W} tbody tr:nth-child(even) > td`]: "background: {{VALUE}}" }),
    tableCellPadding: length("table", { [`${W} :is(th,td)`]: "padding: {{VALUE}}" }, true),
    tableAlign: choice("table", ["start", "center", "end"], { [`${W} :is(th,td)`]: "text-align: {{VALUE}}" }),
  } }),
  // Website: TabsClient (tablist / tab / tabpanel); khung soạn vẽ cùng vai trò ARIA → một bộ chọn cho cả hai
  defineBlockControls({ id: "core/tabs", blocks: ["tabs"], attributes: {
    tabsTitleColor: color("tabs", { [`${W} [role=tab]`]: "color: {{VALUE}}" }),
    tabsTitleBg: color("tabs", { [`${W} [role=tab]`]: "background: {{VALUE}}" }),
    tabsActiveColor: color("tabs", { [`${W} [role=tab][aria-selected=true]`]: "color: {{VALUE}}" }, "active"),
    tabsActiveBg: color("tabs", { [`${W} [role=tab][aria-selected=true]`]: "background: {{VALUE}}" }, "active"),
    tabsAccent: color("tabs", { [`${W} [role=tab][aria-selected=true]`]: "border-bottom-color: {{VALUE}}" }, "active"),
    tabsBorderColor: color("tabs", { [`${W} [role=tablist]`]: "border-bottom-color: {{VALUE}}" }),
    tabsGap: length("tabs", { [`${W} [role=tablist]`]: "gap: {{VALUE}}" }),
    tabsContentPadding: length("tabs", { [`${W} [role=tabpanel]`]: "padding: {{VALUE}}" }, true),
  } }),
  defineBlockControls({ id: "core/accordion", blocks: ["accordion", "details"], attributes: {
    accTitleColor: color("accordion", { [`${W} summary`]: "color: {{VALUE}}" }),
    accTitleBg: color("accordion", { [`${W} summary`]: "background: {{VALUE}}" }),
    accActiveColor: color("accordion", { [`${W} details[open] > summary`]: "color: {{VALUE}}", [`${W}:is([open]) > summary`]: "color: {{VALUE}}" }, "active"),
    accBorderColor: color("accordion", { [`${W} details`]: "border-color: {{VALUE}}", [`${W}:is(details)`]: "border-color: {{VALUE}}" }),
    accGap: length("accordion", { [`${W} > details + details`]: "margin-top: {{VALUE}}" }),
    accPadding: length("accordion", { [`${W} details`]: "padding: {{VALUE}}", [`${W}:is(details)`]: "padding: {{VALUE}}" }, true),
  } }),
  defineBlockControls({ id: "core/columns", blocks: ["columns"], attributes: {
    columnsGap: length("columns", { [W]: "--ecx-columns-gap: {{VALUE}}" }, true),
    columnsRowGap: length("columns", { [W]: "--ecx-columns-row-gap: {{VALUE}}" }, true),
    columnsDirection: choice("columns", ["row", "row-reverse", "column", "column-reverse"], { [W]: "flex-direction: {{VALUE}}" }, { responsive: true }),
  } }),
  defineBlockControls({ id: "core/separator", blocks: ["horizontalRule"], attributes: {
    hrStyle: choice("separator", ["solid", "dashed", "dotted", "double"], { [W]: "border-top-style: {{VALUE}}" }),
    hrWeight: length("separator", { [W]: "border-top-width: {{VALUE}}" }),
    hrColor: color("separator", { [W]: "border-top-color: {{VALUE}}" }),
    hrWidth: length("separator", { [W]: "width: {{VALUE}}" }, true),
    hrAlign: choice("separator", ["start", "center", "end"], { [W]: "margin-inline: var(--ecx-margin-inline-{{VALUE}})" }),
  } }),
  defineBlockControls({ id: "core/icon-box", blocks: ["iconBox"], attributes: {
    iconBoxIconColor: color("icon", { [`${W} .ecx-icon-box-icon`]: "color: {{VALUE}}" }),
    iconBoxIconSize: length("icon", { [`${W} .ecx-icon-box-icon`]: "font-size: {{VALUE}}" }, true),
    iconBoxTitleColor: color("content", { [`${W} .ecx-icon-box-title`]: "color: {{VALUE}}" }),
    iconBoxTextColor: color("content", { [`${W} .ecx-icon-box-text`]: "color: {{VALUE}}" }),
  } }),
  defineBlockControls({ id: "core/image-box", blocks: ["imageBox"], attributes: {
    imageBoxRadius: length("image", { [`${W} .ecx-image-box-media img`]: "border-radius: {{VALUE}}" }),
    imageBoxTitleColor: color("content", { [`${W} .ecx-image-box-title`]: "color: {{VALUE}}" }),
    imageBoxTextColor: color("content", { [`${W} .ecx-image-box-text`]: "color: {{VALUE}}" }),
  } }),
  defineBlockControls({ id: "core/icon-list", blocks: ["iconList"], attributes: {
    iconListGap: length("list", { [W]: "gap: {{VALUE}}" }, true),
    iconListDivider: color("list", { [`${W}:not(.is-inline) > li + li`]: "border-top: 1px solid {{VALUE}}" }),
    iconListIconColor: color("icon", { [`${W} .ecx-widget-icon`]: "color: {{VALUE}}" }),
    iconListIconSize: length("icon", { [`${W} .ecx-widget-icon`]: "font-size: {{VALUE}}" }),
    iconListTextColor: color("content", { [`${W} li`]: "color: {{VALUE}}" }),
  } }),
  defineBlockControls({ id: "core/counter", blocks: ["counter"], attributes: {
    counterNumberColor: color("number", { [`${W} .ecx-counter-number`]: "color: {{VALUE}}" }),
    counterNumberSize: length("number", { [`${W} .ecx-counter-number`]: "font-size: {{VALUE}}" }, true),
    counterTitleColor: color("content", { [`${W} .ecx-counter-title`]: "color: {{VALUE}}" }),
  } }),
  defineBlockControls({ id: "core/testimonial", blocks: ["testimonial"], attributes: {
    testimonialBg: color("box", { [W]: "background: {{VALUE}}" }),
    testimonialBorderColor: color("box", { [W]: "border-color: {{VALUE}}" }),
    testimonialQuoteColor: color("content", { [`${W} .ecx-testimonial-quote`]: "color: {{VALUE}}" }),
    testimonialNameColor: color("content", { [`${W} .ecx-testimonial-name`]: "color: {{VALUE}}" }),
    testimonialRoleColor: color("content", { [`${W} .ecx-testimonial-role`]: "color: {{VALUE}}" }),
  } }),
  defineBlockControls({ id: "core/progress", blocks: ["progressBar"], attributes: {
    progressBarColor: color("bar", { [`${W} .ecx-progress-bar`]: "background: {{VALUE}}" }),
    progressTrackColor: color("bar", { [`${W} .ecx-progress-track`]: "background: {{VALUE}}" }),
    progressHeight: length("bar", { [`${W} .ecx-progress-track`]: "height: {{VALUE}}" }),
    progressTitleColor: color("content", { [`${W} .ecx-progress-head`]: "color: {{VALUE}}" }),
  } }),
  // 1.26: PHẦN của khối widget — mỗi phần một bộ kiểu dáng đầy đủ (attrs.parts). Ô màu rời ở trên giữ cho nội dung cũ.
  defineBlockControls({ id: "core/icon-box-parts", partsOnly: true, blocks: ["iconBox"], attributes: {}, parts: {
    box: { label: "%part.box%", selector: W, props: BOX, hover: true },
    icon: { label: "%part.icon%", selector: `${W} .ecx-icon-box-icon`, props: ICON, hover: true, toggle: true },
    title: { label: "%part.title%", selector: `${W} .ecx-icon-box-title`, props: TEXT, hover: true, toggle: true },
    text: { label: "%part.text%", selector: `${W} .ecx-icon-box-text`, props: TEXT, toggle: true },
  } }),
  defineBlockControls({ id: "core/image-box-parts", partsOnly: true, blocks: ["imageBox"], attributes: {}, parts: {
    box: { label: "%part.box%", selector: W, props: BOX, hover: true },
    media: { label: "%part.image%", selector: `${W} .ecx-image-box-media img`, props: ["radius", "border", "shadow"], hover: true, toggle: true },
    title: { label: "%part.title%", selector: `${W} .ecx-image-box-title`, props: TEXT, hover: true, toggle: true },
    text: { label: "%part.text%", selector: `${W} .ecx-image-box-text`, props: TEXT, toggle: true },
  } }),
  defineBlockControls({ id: "core/testimonial-parts", partsOnly: true, blocks: ["testimonial"], attributes: {}, parts: {
    box: { label: "%part.box%", selector: W, props: BOX, hover: true },
    quote: { label: "%part.quote%", selector: `${W} .ecx-testimonial-quote`, props: TEXT },
    avatar: { label: "%part.avatar%", selector: `${W} .ecx-testimonial-avatar`, props: ["size", "radius", "border"], toggle: true },
    name: { label: "%part.name%", selector: `${W} .ecx-testimonial-name`, props: ["typography", "color"], toggle: true },
    role: { label: "%part.role%", selector: `${W} .ecx-testimonial-role`, props: ["typography", "color"], toggle: true },
  } }),
  defineBlockControls({ id: "core/counter-parts", partsOnly: true, blocks: ["counter"], attributes: {}, parts: {
    box: { label: "%part.box%", selector: W, props: BOX, hover: true },
    number: { label: "%part.number%", selector: `${W} .ecx-counter-number`, props: ["typography", "color", "margin"] },
    title: { label: "%part.title%", selector: `${W} .ecx-counter-title`, props: TEXT, toggle: true },
  } }),
  defineBlockControls({ id: "core/progress-parts", partsOnly: true, blocks: ["progressBar"], attributes: {}, parts: {
    label: { label: "%part.label%", selector: `${W} .ecx-progress-head`, props: TEXT, toggle: true },
    track: { label: "%part.track%", selector: `${W} .ecx-progress-track`, props: ["background", "radius", "size", "border"] },
    bar: { label: "%part.bar%", selector: `${W} .ecx-progress-bar`, props: ["background"] },
  } }),
  // Accordion / Chi tiết: mục (khung từng mục), tiêu đề mục (thường / rê chuột / đang mở), nội dung mục
  defineBlockControls({ id: "core/accordion-parts", partsOnly: true, blocks: ["accordion", "details"], attributes: {}, parts: {
    item: { label: "%part.item%", selector: `${W} details, ${W}:is(details)`, props: ["background", "border", "radius", "shadow", "padding", "margin"] },
    title: { label: "%part.paneTitle%", selector: `${W} details > summary, ${W}:is(details) > summary`, props: ["typography", "color", "background", "border", "radius", "padding"], hover: "self",
      active: `${W} details[open] > summary, ${W}:is([open]) > summary` },
    content: { label: "%part.paneContent%", selector: `${W} details > :not(summary), ${W}:is(details) > :not(summary)`, props: ["typography", "color", "background", "padding"] },
  } }),
  // Tab: thanh tab, nút tab (thường / rê chuột / đang chọn), vùng nội dung
  defineBlockControls({ id: "core/tabs-parts", partsOnly: true, blocks: ["tabs"], attributes: {}, parts: {
    list: { label: "%part.tabList%", selector: `${W} [role=tablist]`, props: ["background", "border", "padding", "margin"] },
    tab: { label: "%part.tab%", selector: `${W} [role=tab]`, props: ["typography", "color", "background", "border", "radius", "padding"], hover: "self",
      active: `${W} [role=tab][aria-selected=true]` },
    panel: { label: "%part.panel%", selector: `${W} [role=tabpanel]`, props: ["typography", "color", "background", "border", "radius", "padding"] },
  } }),
  // Nút: chính nút (thường / rê chuột lên nút) — khối nút đứng riêng có vỏ <p>, trong nhóm nút class ở chính <a>
  defineBlockControls({ id: "core/button-parts", partsOnly: true, blocks: ["button"], attributes: {}, parts: {
    button: { label: "%part.button%", selector: `${W}:is(a), ${W} a`, props: ["typography", "color", "background", "border", "radius", "shadow", "padding"], hover: "self" },
  } }),
  // Ảnh: chính ảnh (thường / rê chuột lên khối) và chú thích
  defineBlockControls({ id: "core/image-parts", partsOnly: true, blocks: ["image"], attributes: {}, parts: {
    image: { label: "%part.image%", selector: `${W} img, ${W}:is(img)`, props: ["border", "radius", "shadow", "padding", "background"], hover: true },
    caption: { label: "%part.caption%", selector: `${W} figcaption`, props: ["typography", "color", "background", "padding", "margin"], toggle: true },
  } }),
  // Tiêu đề / Đoạn văn: chữ tô sáng (<mark>) và liên kết trong chữ
  defineBlockControls({ id: "core/text-parts", blocks: ["heading", "paragraph"], attributes: {}, parts: {
    highlight: { label: "%part.highlight%", selector: `${W} mark`, props: ["typography", "color", "background", "border", "radius", "padding"] },
    link: { label: "%part.link%", selector: `${W} a`, props: ["typography", "color"], hover: "self" },
  } }),
  defineBlockControls({ id: "core/icon-list-parts", partsOnly: true, blocks: ["iconList"], attributes: {}, parts: {
    item: { label: "%part.item%", selector: `${W} > li`, props: ["typography", "color", "padding"] },
    icon: { label: "%part.icon%", selector: `${W} .ecx-widget-icon`, props: ["color", "iconSize", "margin"], toggle: true },
  } }),
];

/** Ô Kiểu dáng lõi của một loại khối (tên thuộc tính → mô tả), theo thứ tự khai báo. */
export function coreControlsFor(type: string): Record<string, ControlSpec> {
  return Object.assign({}, ...CORE_CONTROLS.filter((c) => c.blocks === "*" || c.blocks.includes(type)).map((c) => c.attributes));
}
