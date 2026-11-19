/** Khối Lottie (1.29): cấu hình dùng chung cho website và trình soạn. Thuộc tính đã qua normalizeAttrs; hàm này chỉ chốt mặc định và loại tệp. */
export interface LottieConfig {
  src: string; poster: string; label: string; loop: boolean; autoplay: boolean; speed: number;
  trigger: "auto" | "hover" | "click" | "scroll"; height?: number; maxWidth?: number; align: "left" | "center" | "right";
  /** ".lottie" (dotLottie) hoặc ".json" (Lottie JSON); không nhận ra → "" (website chỉ hiện poster). */
  kind: "dotlottie" | "json" | "";
}

const TRIGGERS = ["auto", "hover", "click", "scroll"] as const;
const ALIGNS = ["left", "center", "right"] as const;

export function lottieKind(src: string): LottieConfig["kind"] {
  const path = src.split(/[?#]/)[0].toLowerCase();
  return path.endsWith(".lottie") ? "dotlottie" : path.endsWith(".json") ? "json" : "";
}

const clamp = (v: unknown, lo: number, hi: number, d?: number) => (typeof v === "number" && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d);

export function lottieConfig(a: Record<string, unknown>): LottieConfig {
  const src = typeof a.src === "string" ? a.src : "";
  return {
    src, poster: typeof a.poster === "string" ? a.poster : "", label: typeof a.label === "string" ? a.label : "",
    loop: a.loop !== false, autoplay: a.autoplay !== false, speed: clamp(a.speed, 0.1, 5, 1)!,
    trigger: (TRIGGERS as readonly unknown[]).includes(a.trigger) ? (a.trigger as LottieConfig["trigger"]) : "auto",
    height: clamp(a.height, 40, 1200), maxWidth: clamp(a.maxWidth, 40, 2000),
    align: (ALIGNS as readonly unknown[]).includes(a.align) ? (a.align as LottieConfig["align"]) : "center",
    kind: lottieKind(src),
  };
}
