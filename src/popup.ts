/**
 * Cấu hình Popup (khối "popup"): nút mở + hộp thoại chứa các khối con. Một nơi đọc thuộc tính cho website (theme-sdk) và trình soạn.
 * Mọi giá trị lạ về mặc định (không bao giờ ra CSS thô).
 */
export interface PopupConfig {
  triggerStyle: "primary" | "outline" | "link" | "play";
  triggerAlign: "left" | "center" | "right";
  size: "sm" | "md" | "lg" | "xl";
  anim: "fade" | "up" | "zoom" | "none";
  /** Độ tối của nền phủ phía sau (0–100). */
  overlay: number;
  vAlign: "top" | "center";
  closeButton: boolean;
  closeOnOverlay: boolean;
  /** Mở bằng liên kết `#popup-<id>` hoặc phần tử `data-popup-open="<id>"` ở bất kỳ đâu trên trang. */
  id: string;
  /** Tự mở: không / sau N giây / khi cuộn tới N% / khi chuột rời khỏi trang (máy tính) / sau N giây không thao tác. */
  auto: "none" | "delay" | "scroll" | "exit" | "idle";
  autoDelay: number;
  autoScroll: number;
  /** Chỉ tự mở một lần trong N ngày trên trình duyệt (0 = mỗi lần tải trang). */
  onceDays: number;
}
const pick = <T extends string>(v: unknown, list: readonly T[], d: T): T => (list.includes(v as T) ? (v as T) : d);
export function popupConfig(a: Record<string, unknown>): PopupConfig {
  const o = Math.round(Number(a.overlayOpacity));
  return {
    triggerStyle: pick(a.triggerStyle, ["primary", "outline", "link", "play"] as const, "primary"),
    triggerAlign: pick(a.triggerAlign, ["left", "center", "right"] as const, "left"),
    size: pick(a.size, ["sm", "md", "lg", "xl"] as const, "md"),
    anim: pick(a.anim, ["fade", "up", "zoom", "none"] as const, "fade"),
    overlay: Number.isFinite(o) ? Math.min(100, Math.max(0, o)) : 60,
    vAlign: pick(a.vAlign, ["top", "center"] as const, "center"),
    closeButton: typeof a.closeButton === "boolean" ? a.closeButton : true,
    closeOnOverlay: typeof a.closeOnOverlay === "boolean" ? a.closeOnOverlay : true,
    id: typeof a.popupId === "string" && /^[a-z][a-z0-9-]{0,40}$/.test(a.popupId.trim()) ? a.popupId.trim() : "",
    auto: pick(a.autoOpen, ["none", "delay", "scroll", "exit", "idle"] as const, "none"),
    autoDelay: Math.min(300, Math.max(0, Math.round(Number(a.autoDelay)) || 5)),
    autoScroll: Math.min(100, Math.max(5, Math.round(Number(a.autoScroll)) || 50)),
    onceDays: Math.min(365, Math.max(0, Math.round(Number(a.onceDays)) || 0)),
  };
}
/** class của `.ecx-popup` (website và khung soạn dùng chung). */
export const popupClass = (c: PopupConfig) => `ecx-popup is-size-${c.size} is-anim-${c.anim} is-valign-${c.vAlign} is-align-${c.triggerAlign}`;
/** Biến CSS của `.ecx-popup` (độ tối nền). */
export const popupVars = (c: PopupConfig): Record<string, string> => ({ "--ecx-popup-dim": String(c.overlay / 100) });

/** Nút mở dạng "play" (Video Popup): khung 16:9 nền là ảnh `triggerImage` (đường dẫn trong site hoặc https) + nút phát tròn ở giữa. */
export function popupPlayStyle(a: Record<string, unknown>): Record<string, string> | undefined {
  const u = typeof a.triggerImage === "string" ? a.triggerImage.trim() : "";
  return /^(\/(?!\/)|https:\/\/)[^\s"'()\\<>]{1,1000}$/.test(u) ? { backgroundImage: `url("${u}")` } : undefined;
}
