/**
 * Ô điều khiển khai CSS của plugin (như `selectors` của Elementor) — dùng chung cho khung soạn và website:
 * plugin khai một lần (file dùng chung admin + frontend), core kiểm giá trị và sinh CSS theo class băm của khối.
 *
 *   export const tilt = defineBlockControls({ id: "acme/tilt", blocks: "*", attributes: {
 *     acmeRotate: { type: "number", min: -45, max: 45, css: { "{{WRAPPER}}": "rotate: {{VALUE}}deg" } },
 *     acmeShadowColor: { type: "color", css: { "{{WRAPPER}} img": "filter: drop-shadow(0 4px 12px {{VALUE}})" } },
 *   } });
 *
 * Giá trị do người dùng nhập luôn qua kiểm kiểu (số trong khoảng, màu / độ dài / preset như `style`, enum trong danh sách);
 * mẫu CSS do plugin viết bị từ chối nếu có `{ } ; < @ \` hoặc url( / expression( / import. Không hợp lệ → bỏ, không chèn.
 * Kiểu chỉ có ô (không sinh CSS, 1.23): boolean, string, url, textarea, datetime — plugin đọc giá trị qua controlValue.
 */
import { BREAKPOINTS, DEVICES, colorCss, normalizeStyle, ruleCss, spacingValue, type BlockStyle, type Device } from "./style.js";
import { isSafeUrl } from "./url.js";

/** Kiểu được khai `css` (giá trị đã chuẩn hoá thành token CSS an toàn). */
const CSS_TYPES = new Set(["number", "color", "length", "enum"]);

export interface ControlSpec {
  type: "number" | "color" | "length" | "enum" | "boolean" | "string" | "url" | "textarea" | "datetime";
  default?: unknown;
  /** enum: giá trị cho phép ([a-z0-9-]); `{ value, label }` để có nhãn (nhận "%khoá%", 1.23). */
  options?: readonly (string | { value: string; label?: string })[];
  /** string / textarea: độ dài tối đa (mặc định 200 / 5000). */
  maxLength?: number;
  /** number: khoảng cho phép. */
  min?: number;
  max?: number;
  /**
   * "{{WRAPPER}}", "{{WRAPPER}} <bộ chọn con>" hoặc "{{WRAPPER}}:<pseudo>…" (vd `{{WRAPPER}}:hover`, `{{WRAPPER}}:is(img)`, 1.24)
   * → "thuộc-tính: … {{VALUE}} …" (một khai báo / bộ chọn).
   */
  css?: Record<string, string>;
  /** 1.24: giá trị theo khổ màn hình `{ base, tablet, mobile }` (một giá trị trần = base) → media query như `style`. */
  responsive?: boolean;
  /** 1.24 (chỉ giao diện): mục chứa ô trong tab Kiểu dáng; `state` = ô của trạng thái rê chuột / đang mở (thẻ Thường / Rê chuột như Elementor). */
  section?: string;
  state?: "hover" | "active";
  /** 1.24 (chỉ giao diện): bước của ô số. */
  step?: number;
}

/** Nhóm thuộc tính kiểu dáng một phần cho chỉnh (giao diện hiện đúng các nhóm này, theo thứ tự). */
export type PartProp = "typography" | "color" | "background" | "border" | "radius" | "shadow" | "padding" | "margin" | "size" | "iconSize";

/**
 * 1.26: một PHẦN của khối (Khung, Icon, Tiêu đề, Mô tả, Nút…) — mỗi phần có bộ kiểu dáng riêng (BlockStyle), như bộ khối lớn
 * chia tab Kiểu thành mục theo phần. Lưu ở `attrs.parts[tên] = { style, hover, hidden }`; CSS sinh chung class với ô điều khiển (controlsCss).
 */
export interface PartSpec {
  /** Nhãn (chữ hoặc "%khoá%" — admin dịch theo plugin). */
  label: string;
  /** Bộ chọn của phần: "{{WRAPPER}}" (cả khối) hoặc "{{WRAPPER}} <con>". */
  selector: string;
  /** Nhóm thuộc tính hiện ở bảng. */
  props: readonly PartProp[];
  /** Có thẻ "Rê chuột": true = rê lên CẢ khối (vd icon đổi màu khi rê thẻ); "self" = rê lên chính phần (vd tiêu đề mục, nút). */
  hover?: boolean | "self";
  /** Có thẻ "Đang mở / đang chọn": bộ chọn của phần ở trạng thái đó (vd "{{WRAPPER}} .ecx-details[open] > summary"). */
  active?: string;
  /** Có công tắc "Hiện": tắt → phần bị ẩn (display: none) trên website và khung soạn. */
  toggle?: boolean;
}

export interface BlockControls {
  /** Mã duy nhất "slug-plugin/tên". */
  id: string;
  /** Loại khối áp dụng; "*" = mọi khối. */
  blocks: readonly string[] | "*";
  attributes: Record<string, ControlSpec>;
  /** 1.26: các phần của khối (xem PartSpec). */
  parts?: Record<string, PartSpec>;
  /** 1.26: các phần thay hẳn Kiểu chữ / Màu chung của cả khối (khối ghép nhiều phần: hộp icon, accordion…); không đặt = phần chỉ là phần phụ (vd chữ tô sáng của tiêu đề). */
  partsOnly?: boolean;
}

/** Giá trị đã lưu của một phần. */
export interface PartValue { style?: BlockStyle; hover?: BlockStyle; active?: BlockStyle; hidden?: true }

const PART_NAME = /^[a-z][a-zA-Z0-9]{0,30}$/;
// Kiểu của một phần: bỏ nhóm chỉ hợp với cả khối (bố cục, chuyển động, ẩn theo khổ, ảnh nền, ghim, hover lồng)
const partStyle = (v: unknown): BlockStyle | undefined => {
  const st = normalizeStyle(v);
  if (!st) return undefined;
  const rest: Record<string, unknown> = { ...st };
  for (const k of ["motion", "layout", "hide", "background", "position", "hover"]) delete rest[k];
  return Object.keys(rest).length ? (rest as BlockStyle) : undefined;
};

/** Kiểm giá trị `attrs.parts` (dữ liệu người dùng): chỉ phần có tên hợp lệ, kiểu qua normalizeStyle. */
export function normalizeParts(v: unknown): Record<string, PartValue> | undefined {
  if (!v || typeof v !== "object" || Array.isArray(v)) return undefined;
  const out: Record<string, PartValue> = {};
  for (const [k, raw] of Object.entries(v as Record<string, unknown>)) {
    if (!PART_NAME.test(k) || !raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    const pv: PartValue = {};
    const st = partStyle(r.style); if (st) pv.style = st;
    const hv = partStyle(r.hover); if (hv) pv.hover = hv;
    const ac = partStyle(r.active); if (ac) pv.active = ac;
    if (r.hidden === true) pv.hidden = true;
    if (Object.keys(pv).length) out[k] = pv;
  }
  return Object.keys(out).length ? out : undefined;
}

/** Bộ chọn của phần: một hoặc nhiều "{{WRAPPER}}…" cách nhau dấu phẩy → các hậu tố; sai một nhánh → null. */
function selectorList(sel: string): string[] | null {
  const parts = sel.split(",").map((x) => x.trim()).filter(Boolean);
  return parts.length && parts.every(okSel) ? parts.map((x) => x.slice(11)) : null;
}

/** Các phần của loại khối (lõi + plugin), theo thứ tự khai. */
export function partsFor(list: readonly BlockControls[], type: string): Array<[string, PartSpec]> {
  return list.filter((c) => c.parts && (c.blocks === "*" || c.blocks.includes(type))).flatMap((c) => Object.entries(c.parts!));
}

/** CSS của các phần cho class `cls` (rỗng nếu không có giá trị). */
function partsCss(list: readonly BlockControls[], type: string, vals: Record<string, PartValue>, cls: string): string {
  let css = "";
  for (const [name, spec] of partsFor(list, type)) {
    const v = vals[name];
    const suffixes = selectorList(spec.selector);
    if (!v || !suffixes) continue;
    const base = `.${cls}.${cls}`;
    const sel = suffixes.map((x) => base + x).join(",");
    if (v.hidden && spec.toggle) { css += `${sel}{display:none!important}`; continue; }
    if (v.style) css += ruleCss(sel, v.style);
    // Rê chuột: lên cả khối (`.cls:hover <phần>`) hoặc lên chính phần (`.cls <phần>:hover`)
    if (v.hover && spec.hover) css += ruleCss(suffixes.map((x) => (spec.hover === "self" ? `${base}${x}:hover` : `${base}:hover${x}`)).join(","), v.hover);
    const act = spec.active ? selectorList(spec.active) : null;
    if (v.active && act) css += ruleCss(act.map((x) => base + x).join(","), v.active);
  }
  return css;
}

const ATTR = /^[a-zA-Z][a-zA-Z0-9_]{0,40}$/;
// Hậu tố bộ chọn: con cháu (bắt đầu bằng khoảng trắng) hoặc pseudo-class gắn liền (`:hover`, `:is(img)`, 1.24)
const SUFFIX = /^((\s+|:)[\w\s.#>:+~*()\-\[\]="',]{1,120})?$/;
// Thuộc tính CSS thường hoặc biến tuỳ biến (`--x: {{VALUE}}`, 1.23) — giá trị vẫn qua kiểm kiểu như mọi khai báo
const DECL = /^([a-z][a-z-]{1,40}|--[a-z0-9][a-z0-9-]{0,40})\s*:\s*(.{1,200})$/;
const BAD = /[{};<@\\]|url\(|expression\(|import/i;
const okSel = (sel: string) => sel.startsWith("{{WRAPPER}}") && SUFFIX.test(sel.slice(11)) && !BAD.test(sel.slice(11));
const okDecl = (d: string) => DECL.test(d) && !BAD.test(d.replaceAll("{{VALUE}}", "")) && d.includes("{{VALUE}}");

/** Kiểm khai báo của plugin (lỗi lập trình → ném lỗi sớm, lúc đăng ký). */
export function defineBlockControls<T extends BlockControls>(c: T): T {
  for (const [name, s] of Object.entries(c.attributes)) {
    if (!ATTR.test(name)) throw new Error(`[controls] ${c.id}: tên thuộc tính không hợp lệ "${name}"`);
    if (s.css && Object.keys(s.css).length && !CSS_TYPES.has(s.type)) throw new Error(`[controls] ${c.id}.${name}: kiểu "${s.type}" không sinh CSS`);
    for (const [sel, decl] of Object.entries(s.css ?? {})) {
      if (!okSel(sel)) throw new Error(`[controls] ${c.id}.${name}: bộ chọn không hợp lệ "${sel}"`);
      if (!okDecl(decl)) throw new Error(`[controls] ${c.id}.${name}: khai báo CSS không hợp lệ "${decl}"`);
    }
  }
  for (const [name, part] of Object.entries(c.parts ?? {})) {
    if (!PART_NAME.test(name)) throw new Error(`[controls] ${c.id}: tên phần không hợp lệ "${name}"`);
    if (!selectorList(part.selector)) throw new Error(`[controls] ${c.id}.parts.${name}: bộ chọn không hợp lệ "${part.selector}"`);
    if (part.active && !selectorList(part.active)) throw new Error(`[controls] ${c.id}.parts.${name}: bộ chọn trạng thái không hợp lệ "${part.active}"`);
  }
  return c;
}

/** Giá trị người dùng → chuỗi CSS an toàn (number/color/length/enum) hoặc giá trị đã kiểm của kiểu chỉ có ô (không an toàn cho CSS/HTML thô), undefined = bỏ. */
export function controlValue(s: ControlSpec, v: unknown): string | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  switch (s.type) {
    case "number": {
      const n = typeof v === "number" ? v : typeof v === "string" && /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : NaN;
      if (!Number.isFinite(n) || (s.min !== undefined && n < s.min) || (s.max !== undefined && n > s.max)) return undefined;
      return String(Math.round(n * 1000) / 1000);
    }
    case "color": return colorCss(v);
    case "length": return spacingValue(v);
    case "enum": return typeof v === "string" && /^[a-z0-9-]{1,40}$/.test(v) && s.options?.some((o) => optionValue(o) === v) ? v : undefined;
    case "boolean": return v === true || v === "true" ? "true" : undefined;
    case "string":
    case "textarea": {
      // Có ký tự điều khiển → bỏ (textarea vẫn nhận xuống dòng / tab)
      if (typeof v !== "string" || v.length > (s.maxLength ?? (s.type === "string" ? 200 : 5000))) return undefined;
      const bad = s.type === "string" ? /[\u0000-\u001f\u007f]/ : /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;
      return bad.test(v) ? undefined : v;
    }
    case "url": return typeof v === "string" && v.length <= 2048 && !/[\s"'<>`\\]/.test(v) && isSafeUrl(v) ? v : undefined;
    case "datetime": {
      // ISO 8601 có ngày + giờ (vd 2026-11-20T09:00, …Z, …+07:00) → chuỗi gốc
      if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})?$/.test(v)) return undefined;
      return Number.isNaN(Date.parse(v)) ? undefined : v;
    }
  }
}

/** Giá trị của một mục enum (chuỗi hoặc { value, label }). */
export const optionValue = (o: string | { value: string }) => (typeof o === "string" ? o : o.value);

const applies = (c: BlockControls, type: string) => c.blocks === "*" || c.blocks.includes(type);

/** Giá trị theo khổ: ô `responsive` nhận `{ base, tablet, mobile }` hoặc một giá trị trần (= base). */
function perDevice(s: ControlSpec, v: unknown): Array<[Device, unknown]> {
  if (s.responsive && v && typeof v === "object" && !Array.isArray(v)) return DEVICES.filter((d) => d in v).map((d) => [d, (v as Record<string, unknown>)[d]]);
  return [["base", v]];
}

/** Các khai báo CSS (khổ, bộ chọn hậu tố, khai báo) của một khối; rỗng = khối không có giá trị nào hợp lệ. */
function declarations(list: readonly BlockControls[], type: string, attrs: Record<string, unknown>): Array<[Device, string, string]> {
  const out: Array<[Device, string, string]> = [];
  for (const c of list) {
    if (!applies(c, type)) continue;
    for (const [name, s] of Object.entries(c.attributes)) {
      if (!CSS_TYPES.has(s.type) || attrs[name] === undefined) continue;
      for (const [d, raw] of perDevice(s, attrs[name])) {
        const v = controlValue(s, raw);
        if (v === undefined) continue;
        for (const [sel, decl] of Object.entries(s.css ?? {})) {
          if (!okSel(sel) || !okDecl(decl)) continue;
          out.push([d, sel.slice(11), decl.replaceAll("{{VALUE}}", v)]);
        }
      }
    }
  }
  return out;
}

/** Class (`ecx-c-…`, băm theo CSS → cùng giá trị = cùng class) + CSS của khối; null khi không có gì để vẽ. */
export function controlsCss(list: readonly BlockControls[], type: string, attrs: Record<string, unknown>): { cls: string; css: string } | null {
  const decls = declarations(list, type, attrs);
  const parts = normalizeParts(attrs.parts);
  const hasParts = !!parts && partsFor(list, type).some(([n]) => parts[n]);
  if (!decls.length && !hasParts) return null;
  // Khổ base băm như trước 1.24 → class của nội dung cũ không đổi; phần (1.26) chỉ vào khoá khi có
  const base = decls.map(([d, sel, decl]) => (d === "base" ? [sel, decl] : [d, sel, decl]));
  const key = JSON.stringify(hasParts ? [base, parts] : base);
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  const cls = `ecx-c-${h.toString(36)}`;
  const media: Record<Device, string> = { base: "", tablet: `@media (max-width:${BREAKPOINTS.tablet}px)`, mobile: `@media (max-width:${BREAKPOINTS.mobile}px)` };
  let css = "";
  for (const d of DEVICES) {
    const bySel = new Map<string, string[]>();
    for (const [dd, sel, decl] of decls) if (dd === d) bySel.set(sel, [...(bySel.get(sel) ?? []), decl]);
    const rules = [...bySel].map(([sel, ds]) => `.${cls}.${cls}${sel}{${ds.join(";")}}`).join("");
    if (rules) css += d === "base" ? rules : `${media[d]}{${rules}}`;
  }
  if (hasParts) css += partsCss(list, type, parts!, cls);
  return { cls, css };
}
