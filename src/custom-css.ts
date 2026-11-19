/**
 * CSS riêng của khối (tab Nâng cao): người dùng viết quy tắc với từ khoá `selector` (= chính khối), ví dụ
 *   selector { box-shadow: 0 4px 12px #0002 }   selector:hover { opacity: .8 }   selector img { border-radius: 8px }
 * hoặc chỉ các khai báo trần (`color: red; margin: 0`). Mỗi quy tắc bị buộc nằm trong khối (bộ chọn phải bắt đầu bằng `selector`),
 * chỉ nhận @media; khai báo / giá trị nguy hiểm bị bỏ từng cái một (không bỏ cả đoạn) và được báo lại cho người soạn.
 * Mục tiêu bảo mật: tác giả quyền thấp không dùng CSS riêng để: tải tài nguyên ngoài lạ (@import, url() lạ), chạy mã (expression,
 * javascript:, behavior, -moz-binding), thoát khỏi thẻ <style> (`<`), phủ kín trang (position: fixed) hoặc tác động ngoài khối.
 */
export const CUSTOM_CSS_MAX = 4000;

export interface CustomCssResult {
  /** CSS đã lọc, bộ chọn đã thay `selector` bằng `scope`. Rỗng nếu không còn gì dùng được. */
  css: string;
  /** Lý do từng phần bị bỏ (cho người soạn) — mỗi lý do một lần. */
  dropped: string[];
}

const BAD_PROP = /^(behavior|-moz-binding|-ms-behavior|-webkit-binding)$/i;
const BAD_VALUE = /expression\s*\(|javascript\s*:|vbscript\s*:|data\s*:\s*text|-moz-binding|behavior\s*:|@import|<|\\|\{|\}/i;
const SAFE_URL = /^\s*(?:["']?)(?:\/(?!\/)[^"')\s]*|https:\/\/[^"')\s]+|data:image\/(?:png|jpe?g|gif|webp|svg\+xml);base64,[A-Za-z0-9+/=]+)(?:["']?)\s*$/i;

/** Tách theo ký tự ngoài ngoặc đơn / nháy (để `url(data:…;base64,…)` không bị cắt ở dấu `;`). */
function splitTop(s: string, sep: string): string[] {
  const out: string[] = []; let depth = 0, quote = "", cur = "";
  for (const ch of s) {
    if (quote) { cur += ch; if (ch === quote) quote = ""; continue; }
    if (ch === '"' || ch === "'") { quote = ch; cur += ch; continue; }
    if (ch === "(") depth++; else if (ch === ")") depth = Math.max(0, depth - 1);
    if (ch === sep && depth === 0) { out.push(cur); cur = ""; } else cur += ch;
  }
  out.push(cur);
  return out;
}

function cleanDecls(body: string, drop: (why: string) => void): string[] {
  const out: string[] = [];
  for (const raw of splitTop(body, ";")) {
    const d = raw.trim();
    if (!d) continue;
    const i = d.indexOf(":");
    if (i < 1) { drop("khai báo thiếu dấu hai chấm"); continue; }
    const prop = d.slice(0, i).trim(), value = d.slice(i + 1).trim();
    if (!/^-{0,2}[a-z][a-z0-9-]*$/i.test(prop) || BAD_PROP.test(prop)) { drop(`thuộc tính không được phép: ${prop.slice(0, 30)}`); continue; }
    if (!value || value.length > 500 || BAD_VALUE.test(value)) { drop(`giá trị không an toàn ở "${prop}"`); continue; }
    // mọi url(...) phải là địa chỉ trong site, https hoặc ảnh nhúng — không nhận http:, //host, javascript:
    const urls = [...value.matchAll(/url\(\s*([^)]*)\)/gi)];
    if (/url\s*\(/i.test(value) && (urls.length === 0 || urls.some((m) => !SAFE_URL.test(m[1])))) { drop(`địa chỉ url() không an toàn ở "${prop}"`); continue; }
    if (/^position$/i.test(prop) && /fixed/i.test(value)) { drop("position: fixed không được dùng (phủ kín trang)"); continue; }
    out.push(`${prop}:${value}`);
  }
  return out;
}

/** Lọc và gắn phạm vi. `scope` là bộ chọn của khối do mã gọi đưa vào (vd `.ecx-s-abc.ecx-s-abc`). */
export function scopeCustomCss(raw: unknown, scope: string): CustomCssResult {
  const dropped = new Set<string>();
  const drop = (w: string) => dropped.add(w);
  if (typeof raw !== "string" || !raw.trim()) return { css: "", dropped: [] };
  let src = raw.slice(0, CUSTOM_CSS_MAX).replace(/\/\*[\s\S]*?\*\//g, "").trim();
  if (src.includes("<")) { drop("ký tự < không được dùng"); return { css: "", dropped: [...dropped] }; }
  // khai báo trần (không có ngoặc nhọn) → bọc vào selector { … }
  if (!src.includes("{")) src = `selector{${src}}`;
  let css = "";
  const rule = (selectors: string, body: string): string => {
    const list = splitTop(selectors, ",").map((s) => s.trim()).filter(Boolean);
    const ok: string[] = [];
    for (const s of list) {
      if (!/^selector(?![\w-])/.test(s)) { drop("bộ chọn phải bắt đầu bằng selector (chỉ tác động trong khối)"); continue; }
      if (/[{};@\\]|\/\*/.test(s) || s.length > 200) { drop("bộ chọn chứa ký tự không được dùng"); continue; }
      ok.push(scope + s.slice("selector".length));
    }
    const decls = cleanDecls(body, drop);
    return ok.length && decls.length ? `${ok.join(",")}{${decls.join(";")}}` : "";
  };
  // đọc tuần tự: [@media (…) {] bộ chọn { khai báo } … [}]
  let i = 0, guard = 0;
  while (i < src.length && guard++ < 400) {
    const open = src.indexOf("{", i);
    if (open < 0) break;
    const head = src.slice(i, open).trim();
    if (head.startsWith("@")) {
      if (!/^@media\s+[\w\s:(),.\-<>=\d/]+$/i.test(head)) { drop(`chỉ nhận @media (đã bỏ ${head.slice(0, 20)})`); // bỏ cả khối: tìm } khớp
        let depth = 1, j = open + 1; while (j < src.length && depth) { depth += src[j] === "{" ? 1 : src[j] === "}" ? -1 : 0; j++; } i = j; continue; }
      let depth = 1, j = open + 1; while (j < src.length && depth) { depth += src[j] === "{" ? 1 : src[j] === "}" ? -1 : 0; j++; }
      const inner = src.slice(open + 1, j - 1);
      let k = 0, innerCss = "";
      while (k < inner.length) { const o2 = inner.indexOf("{", k); if (o2 < 0) break; const c2 = inner.indexOf("}", o2); if (c2 < 0) break; innerCss += rule(inner.slice(k, o2), inner.slice(o2 + 1, c2)); k = c2 + 1; }
      if (innerCss) css += `${head}{${innerCss}}`;
      i = j; continue;
    }
    const close = src.indexOf("}", open);
    if (close < 0) { drop("thiếu dấu }"); break; }
    css += rule(head, src.slice(open + 1, close));
    i = close + 1;
  }
  return { css, dropped: [...dropped] };
}

/** Chuỗi hợp lệ để lưu: cắt dài, bỏ khoảng trắng thừa; rỗng → undefined. (Việc lọc nguy hiểm làm lúc sinh CSS và báo ở trình soạn.) */
export function normalizeCustomCss(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.replace(/\r/g, "").trim().slice(0, CUSTOM_CSS_MAX);
  return t ? t : undefined;
}
