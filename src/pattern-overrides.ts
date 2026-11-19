import { BINDING_URL_ATTRS, CORE_BINDABLE } from "./bindings.js";

/**
 * Mẫu đồng bộ cho sửa riêng vài ô (như pattern overrides của WordPress): trong mẫu, khối nào có `attrs.overrideKey` thì mỗi chỗ dùng mẫu
 * (`syncedPattern.attrs.overrides[overrideKey]`) được đặt chữ / ảnh / liên kết riêng; phần còn lại vẫn đồng bộ theo mẫu.
 * Chỉ các thuộc tính gắn dữ liệu được của khối (CORE_BINDABLE) — chữ thường, đường dẫn qua kiểm tra — không cho ghi đè kiểu dáng hay HTML.
 */
type Raw = Record<string, unknown>;
const isObj = (v: unknown): v is Raw => !!v && typeof v === "object" && !Array.isArray(v);
export const OVERRIDE_KEY = /^[a-z0-9][a-z0-9-]{0,39}$/;
const SAFE_URL = /^(https?:\/\/|\/(?!\/)|#|mailto:|tel:)/i;

export interface Overridable { key: string; type: string; attrs: string[]; values: Record<string, string> }

const nodesOf = (doc: unknown): unknown[] => {
  if (!isObj(doc) || !Array.isArray(doc.blocks)) return [];
  return doc.blocks.flatMap((b) => (isObj(b) && b.type === "richtext" && isObj(b.data) && Array.isArray(b.data.content) ? b.data.content : []));
};

/** Các khối cho phép sửa riêng trong mẫu (theo thứ tự xuất hiện): khoá, loại, thuộc tính sửa được, giá trị hiện có. */
export function patternOverridables(doc: unknown): Overridable[] {
  const out: Overridable[] = [];
  const walk = (list: unknown[]) => {
    for (const n of list) {
      if (!isObj(n)) continue;
      const a = isObj(n.attrs) ? n.attrs : {};
      const key = typeof a.overrideKey === "string" && OVERRIDE_KEY.test(a.overrideKey) ? a.overrideKey : null;
      const allowed = typeof n.type === "string" ? CORE_BINDABLE[n.type] : undefined;
      if (key && allowed && !out.some((o) => o.key === key)) {
        const values: Record<string, string> = {};
        for (const attr of allowed) {
          if (attr === "content") values.content = (Array.isArray(n.content) ? n.content : []).map((c) => (isObj(c) && typeof c.text === "string" ? c.text : "")).join("");
          else if (typeof a[attr] === "string") values[attr] = a[attr] as string;
        }
        out.push({ key, type: String(n.type), attrs: [...allowed], values });
      }
      if (Array.isArray(n.content)) walk(n.content);
    }
  };
  walk(nodesOf(doc));
  return out;
}

/** Áp phần sửa riêng vào bản sao của mẫu (không sửa đầu vào). Khoá lạ / thuộc tính ngoài danh sách / giá trị không phải chữ bị bỏ. */
export function applyPatternOverrides<T>(doc: T, overrides: unknown): T {
  if (!isObj(overrides) || !Object.keys(overrides).length) return doc;
  const apply = (list: unknown[]): unknown[] => list.map((n) => {
    if (!isObj(n)) return n;
    let out: Raw = n;
    const a = isObj(n.attrs) ? n.attrs : null;
    const key = a && typeof a.overrideKey === "string" ? a.overrideKey : null;
    const ov = key ? overrides[key] : undefined;
    const allowed = typeof n.type === "string" ? CORE_BINDABLE[n.type] : undefined;
    if (key && isObj(ov) && allowed) {
      const attrs: Raw = { ...a };
      for (const [attr, v] of Object.entries(ov)) {
        if (!allowed.includes(attr) || typeof v !== "string" || v === "" || v.length > 2000) continue;
        if (attr === "content") out = { ...out, content: [{ type: "text", text: v }] };
        else if (BINDING_URL_ATTRS.has(attr)) { if (SAFE_URL.test(v.trim())) attrs[attr] = v.trim(); }
        else attrs[attr] = v;
      }
      out = { ...out, attrs };
    }
    return Array.isArray(out.content) ? { ...out, content: apply(out.content) } : out;
  });
  if (!isObj(doc) || !Array.isArray((doc as Raw).blocks)) return doc;
  return { ...(doc as Raw), blocks: ((doc as Raw).blocks as unknown[]).map((b) => (isObj(b) && b.type === "richtext" && isObj(b.data) && Array.isArray(b.data.content) ? { ...b, data: { ...b.data, content: apply(b.data.content) } } : b)) } as T;
}
