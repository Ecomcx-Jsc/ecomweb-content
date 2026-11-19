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
    // Icon cạnh chữ (đặt ở Cài đặt): màu, cỡ, khoảng cách tới chữ
    textIconColor: color("icon", { [W]: "--ecx-text-icon-color: {{VALUE}}" }),
    textIconSize: length("icon", { [W]: "--ecx-text-icon-size: {{VALUE}}" }),
    textIconGap: length("icon", { [W]: "--ecx-text-icon-gap: {{VALUE}}" }),
    // 1.32 viền chữ (text stroke) + hoà trộn với nền
    textStrokeWidth: length("textFx", { [W]: "--ecx-text-stroke-w: {{VALUE}}" }),
    textStrokeColor: color("textFx", { [W]: "--ecx-text-stroke-c: {{VALUE}}" }),
    textBlend: choice("textFx", ["multiply", "screen", "overlay", "darken", "lighten", "difference", "exclusion"], { [W]: "mix-blend-mode: {{VALUE}}" }),
  } }),
  // Khối Icon: như tab Style của widget Icon (màu, nền, viền, bo, đệm, bóng, xoay, hiệu ứng rê) — mỗi thứ có bản "Rê chuột"
  defineBlockControls({ id: "core/icon", blocks: ["icon"], attributes: {
    iconColor: color("icon", { [`${W} .ecx-icon-shape`]: "color: {{VALUE}}" }),
    iconHoverColor: color("icon", { [`${W} .ecx-icon-shape:hover`]: "color: {{VALUE}}" }, "hover"),
    iconBg: color("icon", { [`${W} .ecx-icon-shape`]: "background: {{VALUE}}" }),
    iconHoverBg: color("icon", { [`${W} .ecx-icon-shape:hover`]: "background: {{VALUE}}" }, "hover"),
    iconBorderWidth: length("icon", { [`${W} .ecx-icon-shape`]: "border: {{VALUE}} solid" }),
    iconBorderColor: color("icon", { [`${W} .ecx-icon-shape`]: "border-color: {{VALUE}}" }),
    iconHoverBorderColor: color("icon", { [`${W} .ecx-icon-shape:hover`]: "border-color: {{VALUE}}" }, "hover"),
    iconRadius: length("icon", { [`${W} .ecx-icon-shape`]: "border-radius: {{VALUE}}" }),
    iconPad: length("icon", { [W]: "--ecx-icon-pad: {{VALUE}}" }),
    iconShadow: choice("icon", SHADOWS, { [`${W} .ecx-icon-shape`]: "box-shadow: var(--ecx-shadow-{{VALUE}})" }),
    iconRotate: choice("icon", ["45", "90", "135", "180", "270"], { [`${W} .ecx-icon-shape > svg`]: "rotate: {{VALUE}}deg" }),
    iconHoverEffect: choice("icon", ["grow", "shrink", "rotate", "lift", "spin"], { [`${W} .ecx-icon-shape:hover`]: "transform: var(--ecx-icon-fx-{{VALUE}})" }, { state: "hover" }),
  } }),
  defineBlockControls({ id: "core/list", blocks: ["bulletList", "orderedList"], attributes: {
    listMarker: choice("listLayout", ["disc", "circle", "square", "decimal", "decimal-leading-zero", "lower-alpha", "upper-alpha", "lower-roman", "upper-roman", "check", "arrow", "dash", "none"],
      { [W]: "list-style-type: var(--ecx-list-{{VALUE}}, {{VALUE}})" }, { tab: "settings" }),
    // 1.32 Cài đặt: chia cột, xếp ngang, căn, thụt đầu dòng
    listColumns: choice("listLayout", ["1", "2", "3", "4"], { [W]: "columns: {{VALUE}}" }, { tab: "settings", responsive: true }),
    listLayout: choice("listLayout", ["flex"], { [W]: "--ecx-list-display: {{VALUE}}" }, { tab: "settings" }),
    listAlign: choice("listLayout", ["start", "center", "end"], { [W]: "text-align: {{VALUE}}" }, { tab: "settings", responsive: true }),
    listIndent: { ...length("listLayout", { [W]: "padding-inline-start: {{VALUE}}" }), tab: "settings" },
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
    // 1.27: rộng cố định (theo khổ); icon của nút: màu, màu khi rê, cỡ
    buttonWidth: length("button", { [W]: "--ecx-button-width: {{VALUE}}" }, true),
    buttonIconColor: color("icon", { [`${W} .ecx-widget-icon`]: "color: {{VALUE}}" }),
    buttonIconHoverColor: color("icon", { [`${W}:is(a):hover .ecx-widget-icon`]: "color: {{VALUE}}", [`${W} a:hover .ecx-widget-icon`]: "color: {{VALUE}}" }, "hover"),
    buttonIconSize: length("icon", { [`${W} .ecx-widget-icon`]: "font-size: {{VALUE}}" }),
    buttonUnderline: choice("button", ["none", "underline"], { [`${W}:is(a)`]: "text-decoration: {{VALUE}}", [`${W} a`]: "text-decoration: {{VALUE}}" }),
    buttonHoverUnderline: choice("button", ["none", "underline"], btnHover("text-decoration: {{VALUE}}"), { state: "hover" }),
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
    imageMask: choice("image", ["circle", "blob", "hexagon", "diamond", "triangle", "heart", "star", "arch"], img("--ecx-img-mask: var(--ecx-mask-{{VALUE}})")),
    imageHoverEffect: choice("image", ["zoom", "lift", "tilt"], img("transform: var(--ecx-hover-{{VALUE}})", true), { state: "hover" }),
    imageHoverOpacity: { type: "number", section: "image", state: "hover", min: 0, max: 1, step: 0.05, css: img("opacity: {{VALUE}}", true) },
    imageHoverFilter: choice("image", FILTERS, img("filter: var(--ecx-filter-{{VALUE}})", true), { state: "hover" }),
  } }),
  defineBlockControls({ id: "core/map", blocks: ["map"], attributes: {
    mapFilter: choice("map", ["grayscale", "sepia", "invert", "saturate", "dim"], { [`${W} iframe`]: "filter: var(--ecx-filter-{{VALUE}})" }),
    mapRadius: length("map", { [`${W} iframe`]: "border-radius: {{VALUE}}" }),
  } }),
  defineBlockControls({ id: "core/table", blocks: ["table"], attributes: {
    tableBorderColor: color("table", { [`${W} :is(th,td)`]: "border-color: {{VALUE}}" }),
    tableBorderWidth: length("table", { [`${W} :is(th,td)`]: "border-width: {{VALUE}}" }),
    tableHeaderBg: color("table", { [`${W} th`]: "background: {{VALUE}}" }),
    tableHeaderColor: color("table", { [`${W} th`]: "color: {{VALUE}}" }),
    tableStripe: color("table", { [`${W} tbody tr:nth-child(even) > td`]: "background: {{VALUE}}" }),
    tableCellPadding: length("table", { [`${W} :is(th,td)`]: "padding: {{VALUE}}" }, true),
    tableAlign: choice("table", ["start", "center", "end"], { [`${W} :is(th,td)`]: "text-align: {{VALUE}}" }, { tab: "settings" }),
    tableHeadAlign: choice("table", ["start", "center", "end"], { [`${W} th`]: "text-align: {{VALUE}}" }, { tab: "settings" }),
    tableVAlign: choice("table", ["top", "middle", "bottom"], { [`${W} :is(th,td)`]: "vertical-align: {{VALUE}}" }, { tab: "settings" }),
    tableCellColor: color("table", { [`${W} td`]: "color: {{VALUE}}" }),
    tableStripeOdd: color("table", { [`${W} tbody tr:nth-child(odd) > td`]: "background: {{VALUE}}" }),
    tableFootBg: color("table", { [`${W} tfoot :is(th,td)`]: "background: {{VALUE}}" }),
    tableFootColor: color("table", { [`${W} tfoot :is(th,td)`]: "color: {{VALUE}}" }),
    tableBorderStyle: choice("tableBorder", ["solid", "dashed", "dotted", "double", "none"], { [`${W} :is(th,td)`]: "border-style: {{VALUE}}" }),
    tableCollapse: choice("tableBorder", ["collapse", "separate"], { [`${W} table`]: "border-collapse: {{VALUE}}" }),
    tableSpacing: length("tableBorder", { [`${W} table`]: "border-spacing: {{VALUE}}" }),
    tableRadius: length("tableBorder", { [W]: "border-radius: {{VALUE}}" }),
    tableHoverRowBg: color("table", { [`${W} tbody tr:hover > :is(td,th)`]: "background: {{VALUE}}" }, "hover"),
    tableHoverRowColor: color("table", { [`${W} tbody tr:hover > :is(td,th)`]: "color: {{VALUE}}" }, "hover"),
    tableMinWidth: { ...length("tableScroll", { [`${W} table`]: "min-width: {{VALUE}}" }, true), tab: "settings" },
    tableMaxHeight: { ...length("tableScroll", { [W]: "max-height: {{VALUE}}" }), tab: "settings" },
    tableFirstColSticky: choice("tableScroll", ["sticky"], { [`${W} :is(th,td):first-child`]: "position: {{VALUE}}" }, { tab: "settings" }),
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
    tabsAlign: choice("tabs", ["flex-start", "center", "flex-end", "space-between"], { [`${W} [role=tablist]`]: "justify-content: {{VALUE}}" }),
    tabsTitleWidth: length("tabs", { [`${W} [role=tab]`]: "flex: 0 0 {{VALUE}}" }, true),
    tabsPanelMinHeight: length("tabs", { [`${W} [role=tabpanel]`]: "min-height: {{VALUE}}" }, true),
    tabsContentPadding: length("tabs", { [`${W} [role=tabpanel]`]: "padding: {{VALUE}}" }, true),
  } }),
  defineBlockControls({ id: "core/accordion", blocks: ["accordion", "details"], attributes: {
    accTitleColor: color("accordion", { [`${W} summary`]: "color: {{VALUE}}" }),
    accTitleBg: color("accordion", { [`${W} summary`]: "background: {{VALUE}}" }),
    accActiveColor: color("accordion", { [`${W} details[open] > summary`]: "color: {{VALUE}}", [`${W}:is([open]) > summary`]: "color: {{VALUE}}" }, "active"),
    accBorderColor: color("accordion", { [`${W} details`]: "border-color: {{VALUE}}", [`${W}:is(details)`]: "border-color: {{VALUE}}" }),
    accGap: length("accordion", { [`${W} > details + details`]: "margin-top: {{VALUE}}" }),
    accContentMinHeight: length("accordion", { [`${W} details[open]`]: "min-height: {{VALUE}}", [`${W}:is(details[open])`]: "min-height: {{VALUE}}" }, true),
    accPadding: length("accordion", { [`${W} details`]: "padding: {{VALUE}}", [`${W}:is(details)`]: "padding: {{VALUE}}" }, true),
  } }),
  defineBlockControls({ id: "core/columns", blocks: ["columns"], attributes: {
    columnsGap: length("columns", { [W]: "--ecx-columns-gap: {{VALUE}}" }, true),
    columnsRowGap: length("columns", { [W]: "--ecx-columns-row-gap: {{VALUE}}" }, true),
    columnsDirection: choice("columns", ["row", "row-reverse", "column", "column-reverse"], { [W]: "flex-direction: {{VALUE}}" }, { responsive: true }),
  } }),
  // 1.32 Cài đặt (bố cục / cách hiển thị) của các khối đơn giản — như tab Content của Elementor
  defineBlockControls({ id: "core/buttons", blocks: ["buttons"], attributes: {
    buttonsGap: { ...length("buttonsLayout", { [W]: "gap: {{VALUE}}" }, true), tab: "settings" },
    buttonsDirection: choice("buttonsLayout", ["row", "column"], { [W]: "flex-direction: {{VALUE}}" }, { tab: "settings", responsive: true }),
    buttonsFill: choice("buttonsLayout", ["1"], { [`${W} > *`]: "flex-grow: {{VALUE}}" }, { tab: "settings", responsive: true }),
    buttonsVAlign: choice("buttonsLayout", ["flex-start", "center", "flex-end"], { [W]: "align-items: {{VALUE}}" }, { tab: "settings" }),
  } }),
  defineBlockControls({ id: "core/text-layout", blocks: ["paragraph", "heading"], attributes: {
    textColumns: choice("textLayout", ["1", "2", "3", "4"], { [W]: "columns: {{VALUE}}" }, { tab: "settings", responsive: true }),
    textColumnGap: { ...length("textLayout", { [W]: "column-gap: {{VALUE}}" }), tab: "settings" },
    dropCap: choice("textLayout", ["2", "3", "4"], { [`${W}::first-letter`]: "initial-letter: {{VALUE}}" }, { tab: "settings" }),
    textMaxWidth: { ...length("textLayout", { [W]: "max-width: {{VALUE}}" }, true), tab: "settings" },
  } }),
  defineBlockControls({ id: "core/quote", blocks: ["blockquote"], attributes: {
    quoteAlign: choice("quoteLayout", ["start", "center", "end"], { [W]: "text-align: {{VALUE}}" }, { tab: "settings", responsive: true }),
    quoteBorderStyle: choice("quoteLayout", ["solid", "dashed", "dotted", "double", "none"], { [W]: "border-inline-start-style: {{VALUE}}" }, { tab: "settings" }),
    quoteBorderWidth: length("quote", { [W]: "border-inline-start-width: {{VALUE}}" }),
    quoteBorderColor: color("quote", { [W]: "border-inline-start-color: {{VALUE}}" }),
    quoteColor: color("quote", { [W]: "color: {{VALUE}}" }),
  } }),
  defineBlockControls({ id: "core/code", blocks: ["codeBlock"], attributes: {
    codeWrap: choice("codeLayout", ["pre-wrap"], { [W]: "white-space: {{VALUE}}" }, { tab: "settings" }),
    codeMaxHeight: { ...length("codeLayout", { [W]: "max-height: {{VALUE}}" }), tab: "settings" },
    codeTabSize: choice("codeLayout", ["2", "4", "8"], { [W]: "tab-size: {{VALUE}}" }, { tab: "settings" }),
    codeBg: color("code", { [W]: "background: {{VALUE}}" }),
    codeColor: color("code", { [W]: "color: {{VALUE}}" }),
  } }),
  defineBlockControls({ id: "core/social", blocks: ["socialLinks"], attributes: {
    socialShape: choice("socialLayout", ["none", "sm", "md", "pill"], { [W]: "--ecx-social-radius: var(--ecx-radius-{{VALUE}}, 0)" }, { tab: "settings" }),
    socialGap: { ...length("socialLayout", { [W]: "gap: {{VALUE}}" }, true), tab: "settings" },
    socialDirection: choice("socialLayout", ["row", "column"], { [W]: "flex-direction: {{VALUE}}" }, { tab: "settings", responsive: true }),
  } }),
  defineBlockControls({ id: "core/navigation", blocks: ["navigation"], attributes: {
    navJustify: choice("navLayout", ["flex-start", "center", "flex-end", "space-between"], { [`${W} .ecx-navigation-menu > ul`]: "justify-content: {{VALUE}}" }, { tab: "settings", responsive: true }),
    navGap: { ...length("navLayout", { [`${W} .ecx-navigation-menu > ul`]: "column-gap: {{VALUE}}" }, true), tab: "settings" },
    navHoverLine: choice("navLayout", ["underline", "overline", "none"], { [`${W} .ecx-navigation-menu a:hover`]: "text-decoration-line: {{VALUE}}" }, { tab: "settings" }),
    navColor: color("nav", { [`${W} .ecx-navigation-menu a`]: "color: {{VALUE}}" }),
    navHoverColor: color("nav", { [`${W} .ecx-navigation-menu a:hover`]: "color: {{VALUE}}" }, "hover"),
  } }),
  defineBlockControls({ id: "core/site-logo", blocks: ["siteLogo"], attributes: {
    logoWidth: { ...length("logoLayout", { [`${W} img`]: "width: {{VALUE}}" }, true), tab: "settings" },
    logoAlign: choice("logoLayout", ["start", "center", "end"], { [W]: "text-align: {{VALUE}}" }, { tab: "settings", responsive: true }),
  } }),
  defineBlockControls({ id: "core/group", blocks: ["group"], attributes: {
    groupMinHeight: { ...length("groupLayout", { [W]: "min-height: {{VALUE}}" }, true), tab: "settings" },
    groupOverflow: choice("groupLayout", ["hidden", "visible", "auto"], { [W]: "overflow: {{VALUE}}" }, { tab: "settings" }),
  } }),
  defineBlockControls({ id: "core/icon-box", blocks: ["iconBox"], attributes: {
    iconBoxIconColor: color("icon", { [`${W} .ecx-icon-box-icon`]: "color: {{VALUE}}" }),
    iconBoxIconSize: length("icon", { [`${W} .ecx-icon-box-icon`]: "font-size: {{VALUE}}" }, true),
    iconBoxIconHoverColor: color("icon", { [`${W}:hover .ecx-icon-box-icon`]: "color: {{VALUE}}" }, "hover"),
    iconBoxIconBg: color("icon", { [`${W} .ecx-icon-box-icon`]: "background: {{VALUE}}" }),
    iconBoxIconHoverBg: color("icon", { [`${W}:hover .ecx-icon-box-icon`]: "background: {{VALUE}}" }, "hover"),
    iconBoxIconBorderWidth: length("icon", { [`${W} .ecx-icon-box-icon`]: "border: {{VALUE}} solid" }),
    iconBoxIconBorderColor: color("icon", { [`${W} .ecx-icon-box-icon`]: "border-color: {{VALUE}}" }),
    iconBoxIconRadius: length("icon", { [`${W} .ecx-icon-box-icon`]: "border-radius: {{VALUE}}" }),
    iconBoxIconPad: length("icon", { [`${W} .ecx-icon-box-icon`]: "padding: {{VALUE}}" }),
    iconBoxTitleHoverColor: color("content", { [`${W}:hover .ecx-icon-box-title`]: "color: {{VALUE}}" }, "hover"),
    iconBoxTextHoverColor: color("content", { [`${W}:hover .ecx-icon-box-text`]: "color: {{VALUE}}" }, "hover"),
    iconBoxHoverBg: color("box", { [`${W}:hover`]: "background: {{VALUE}}" }, "hover"),
    iconBoxHoverBorderColor: color("box", { [`${W}:hover`]: "border-color: {{VALUE}}" }, "hover"),
    iconBoxImageWidth: length("icon", { [`${W} .ecx-icon-box-icon.is-image`]: "width: {{VALUE}}" }, true),
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
    iconListColumnGap: length("list", { [W]: "column-gap: {{VALUE}}" }, true),
    iconListIconGap: length("icon", { [`${W} > li`]: "gap: {{VALUE}}", [`${W} > li > a`]: "gap: {{VALUE}}" }),
    iconListDivider: color("list", { [`${W}:not(.is-inline) > li + li`]: "border-top: 1px solid {{VALUE}}" }),
    iconListIconColor: color("icon", { [`${W} .ecx-widget-icon`]: "color: {{VALUE}}" }),
    iconListIconSize: length("icon", { [`${W} .ecx-widget-icon`]: "font-size: {{VALUE}}" }),
    iconListTextColor: color("content", { [`${W} li`]: "color: {{VALUE}}" }),
    iconListIconHoverColor: color("icon", { [`${W} li:hover .ecx-widget-icon`]: "color: {{VALUE}}" }, "hover"),
    iconListTextHoverColor: color("content", { [`${W} li:hover`]: "color: {{VALUE}}", [`${W} li:hover a`]: "color: {{VALUE}}" }, "hover"),
    iconListIconBg: color("icon", { [`${W} .ecx-widget-icon`]: "background: {{VALUE}}" }),
    iconListIconRadius: length("icon", { [`${W} .ecx-widget-icon`]: "border-radius: {{VALUE}}" }),
    iconListIconPad: length("icon", { [`${W} .ecx-widget-icon`]: "padding: {{VALUE}}" }),
    iconListTextSize: length("content", { [`${W} li`]: "font-size: {{VALUE}}" }, true),
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
    // Nút "Xem thêm" (khi Liên kết đặt ở Nút): kiểu chữ, màu, nền, viền, bo góc, đệm riêng + rê chuột — như Learn More Settings của bộ khối lớn
    more: { label: "%part.more%", selector: `${W} .ecx-icon-box-more > a, ${W} .ecx-icon-box-more > span`, props: ["typography", "color", "background", "border", "radius", "padding", "margin"], hover: "self" },
  } }),
  defineBlockControls({ id: "core/image-box-parts", partsOnly: true, blocks: ["imageBox"], attributes: {}, parts: {
    box: { label: "%part.box%", selector: W, props: BOX, hover: true },
    media: { label: "%part.image%", selector: `${W} .ecx-image-box-media img`, props: ["radius", "border", "shadow"], hover: true, toggle: true },
    title: { label: "%part.title%", selector: `${W} .ecx-image-box-title`, props: TEXT, hover: true, toggle: true },
    text: { label: "%part.text%", selector: `${W} .ecx-image-box-text`, props: TEXT, toggle: true },
  } }),
  defineBlockControls({ id: "core/image-overlay-parts", partsOnly: true, blocks: ["imageOverlay"], attributes: {}, parts: {
    box: { label: "%part.box%", selector: W, props: ["radius", "border", "shadow", "margin"], hover: true },
    media: { label: "%part.image%", selector: `${W} .ecx-image-overlay-media img`, props: ["radius"] },
    frame: { label: "%part.frame%", selector: `${W} .ecx-image-overlay-body::before`, props: ["border", "radius"], toggle: true },
    title: { label: "%part.title%", selector: `${W} .ecx-image-overlay-title`, props: TEXT, hover: true },
    subtitle: { label: "%part.subtitle%", selector: `${W} .ecx-image-overlay-subtitle`, props: TEXT, toggle: true },
  } }),
  defineBlockControls({ id: "core/testimonial-parts", partsOnly: true, blocks: ["testimonial"], attributes: {}, parts: {
    box: { label: "%part.box%", selector: W, props: BOX, hover: true },
    mark: { label: "%part.quoteMark%", selector: `${W} .ecx-testimonial-mark`, props: ["color", "typography"] },
    rating: { label: "%part.rating%", selector: `${W} .ecx-testimonial-rating`, props: ["color", "typography", "margin"] },
    quote: { label: "%part.quote%", selector: `${W} .ecx-testimonial-quote`, props: ["typography", "color", "background", "radius", "padding", "margin"] },
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
    track: { label: "%part.track%", selector: `${W} .ecx-progress-track`, props: ["background", "radius", "border"] },
    bar: { label: "%part.bar%", selector: `${W} .ecx-progress-bar`, props: ["background"] },
  } }),
  // Accordion / Chi tiết: mục (khung từng mục), tiêu đề mục (thường / rê chuột / đang mở), nội dung mục
  defineBlockControls({ id: "core/accordion-parts", partsOnly: true, blocks: ["accordion", "details"], attributes: {}, parts: {
    item: { label: "%part.item%", selector: `${W} details, ${W}:is(details)`, props: ["background", "border", "radius", "shadow", "padding", "margin"] },
    title: { label: "%part.paneTitle%", selector: `${W} details > summary, ${W}:is(details) > summary`, props: ["typography", "color", "background", "border", "radius", "padding"], hover: "self",
      active: `${W} details[open] > summary, ${W}:is([open]) > summary` },
    icon: { label: "%part.icon%", selector: `${W} details > summary::after`, props: ["color", "iconSize"], active: `${W} details[open] > summary::after` },
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
  // Gallery: từng ảnh (thường / rê chuột lên ảnh) và chú thích chung
  defineBlockControls({ id: "core/gallery", blocks: ["gallery"], attributes: {
    galleryGap: length("gallery", { [W]: "--ecx-gallery-gap: {{VALUE}}" }, true),
  } }),
  defineBlockControls({ id: "core/gallery-parts", partsOnly: true, blocks: ["gallery"], attributes: {}, parts: {
    image: { label: "%part.image%", selector: `${W} .ecx-gallery-item img`, props: ["border", "radius", "shadow"], hover: "self" },
    caption: { label: "%part.caption%", selector: `${W} .ecx-gallery-caption`, props: ["typography", "color", "margin"] },
  } }),
  // Bảng: ô tiêu đề, ô thường
  defineBlockControls({ id: "core/table-parts", blocks: ["table"], attributes: {}, parts: {
    head: { label: "%part.tableHead%", selector: `${W} th`, props: ["typography", "color", "background", "padding"] },
    cell: { label: "%part.tableCell%", selector: `${W} td`, props: ["typography", "color", "background", "padding"] },
  } }),
  // Đếm ngược: nhãn, từng ô (ngày / giờ / phút / giây), con số, chữ đơn vị
  defineBlockControls({ id: "core/countdown-parts", partsOnly: true, blocks: ["countdown"], attributes: {}, parts: {
    label: { label: "%part.label%", selector: `${W} .ecx-countdown-label`, props: TEXT },
    unit: { label: "%part.unitBox%", selector: `${W} .ecx-countdown-parts > span`, props: BOX },
    number: { label: "%part.number%", selector: `${W} .ecx-countdown-parts strong`, props: ["typography", "color"] },
    unitLabel: { label: "%part.unitLabel%", selector: `${W} .ecx-countdown-parts small`, props: ["typography", "color"] },
  } }),
  defineBlockControls({ id: "core/map-parts", partsOnly: true, blocks: ["map"], attributes: {}, parts: {
    frame: { label: "%part.map%", selector: `${W} iframe`, props: ["border", "radius", "shadow"], hover: true },
  } }),
  // Form: nhãn, ô nhập (thường / rê chuột), dấu *, gợi ý, báo lỗi, báo thành công, nút gửi
  defineBlockControls({ id: "core/form-parts", partsOnly: true, blocks: ["form"], attributes: {}, parts: {
    label: { label: "%part.label%", selector: `${W} .ecx-field label, ${W} .ecx-field legend`, props: TEXT },
    input: { label: "%part.input%", selector: `${W} .ecx-field input:not([type=checkbox]):not([type=radio]), ${W} .ecx-field textarea, ${W} .ecx-field select`,
      props: ["typography", "color", "background", "border", "radius", "shadow", "padding"], hover: "self" },
    required: { label: "%part.required%", selector: `${W} .ecx-field-required`, props: ["color"] },
    help: { label: "%part.help%", selector: `${W} .ecx-field-help`, props: TEXT, toggle: true },
    error: { label: "%part.error%", selector: `${W} .ecx-field-error, ${W} .ecx-form-status.is-error`, props: ["typography", "color", "background"] },
    success: { label: "%part.success%", selector: `${W} .ecx-form-status.is-success`, props: ["typography", "color", "background"] },
    button: { label: "%part.button%", selector: `${W} .ecx-form-actions .ecx-button`, props: ["typography", "color", "background", "border", "radius", "shadow", "padding"], hover: "self" },
  } }),
  // Mục lục: khung, tiêu đề, liên kết (thường / rê chuột)
  defineBlockControls({ id: "core/toc-parts", partsOnly: true, blocks: ["tableOfContents"], attributes: {}, parts: {
    box: { label: "%part.box%", selector: W, props: BOX },
    title: { label: "%part.title%", selector: `${W} .ecx-toc-title`, props: TEXT },
    link: { label: "%part.link%", selector: `${W} a`, props: ["typography", "color"], hover: "self" },
  } }),
  // Tìm kiếm: ô nhập, nhãn, nút (thường / rê chuột), màu chữ gợi ý, rộng tối đa
  defineBlockControls({ id: "core/search", blocks: ["search"], attributes: {
    searchPlaceholderColor: color("input", { [`${W} input::placeholder`]: "color: {{VALUE}}" }),
    searchMaxWidth: length("input", { [`${W} .search-form`]: "max-width: {{VALUE}}" }, true),
  } }),
  defineBlockControls({ id: "core/search-parts", partsOnly: true, blocks: ["search"], attributes: {}, parts: {
    input: { label: "%part.input%", selector: `${W} input[type="search"]`, props: ["typography", "color", "background", "border", "radius", "shadow", "padding"], hover: "self" },
    button: { label: "%part.button%", selector: `${W} button[type="submit"], ${W} button`, props: ["typography", "color", "background", "border", "radius", "shadow", "padding", "iconSize"], hover: "self" },
    label: { label: "%part.label%", selector: `${W} .search-label`, props: TEXT, toggle: true },
  } }),
  // Mạng xã hội: từng nút (thường / rê chuột)
  defineBlockControls({ id: "core/social-parts", partsOnly: true, blocks: ["socialLinks"], attributes: {}, parts: {
    item: { label: "%part.item%", selector: `${W} a`, props: ["color", "background", "border", "radius", "padding", "iconSize"], hover: "self" },
  } }),
  // Ảnh bìa: vùng nội dung
  defineBlockControls({ id: "core/cover-parts", blocks: ["cover"], attributes: {}, parts: {
    inner: { label: "%part.content%", selector: `${W} .ecx-cover-inner`, props: ["typography", "color", "background", "radius", "padding"] },
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
