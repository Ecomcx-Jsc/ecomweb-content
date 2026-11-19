const pick = (v, list, d) => (list.includes(v) ? v : d);
export function popupConfig(a) {
    const o = Math.round(Number(a.overlayOpacity));
    return {
        triggerStyle: pick(a.triggerStyle, ["primary", "outline", "link", "play"], "primary"),
        triggerAlign: pick(a.triggerAlign, ["left", "center", "right"], "left"),
        size: pick(a.size, ["sm", "md", "lg", "xl"], "md"),
        anim: pick(a.anim, ["fade", "up", "zoom", "none"], "fade"),
        overlay: Number.isFinite(o) ? Math.min(100, Math.max(0, o)) : 60,
        vAlign: pick(a.vAlign, ["top", "center"], "center"),
        closeButton: typeof a.closeButton === "boolean" ? a.closeButton : true,
        closeOnOverlay: typeof a.closeOnOverlay === "boolean" ? a.closeOnOverlay : true,
        id: typeof a.popupId === "string" && /^[a-z][a-z0-9-]{0,40}$/.test(a.popupId.trim()) ? a.popupId.trim() : "",
        auto: pick(a.autoOpen, ["none", "delay", "scroll", "exit", "idle"], "none"),
        autoDelay: Math.min(300, Math.max(0, Math.round(Number(a.autoDelay)) || 5)),
        autoScroll: Math.min(100, Math.max(5, Math.round(Number(a.autoScroll)) || 50)),
        onceDays: Math.min(365, Math.max(0, Math.round(Number(a.onceDays)) || 0)),
    };
}
/** class của `.ecx-popup` (website và khung soạn dùng chung). */
export const popupClass = (c) => `ecx-popup is-size-${c.size} is-anim-${c.anim} is-valign-${c.vAlign} is-align-${c.triggerAlign}`;
/** Biến CSS của `.ecx-popup` (độ tối nền). */
export const popupVars = (c) => ({ "--ecx-popup-dim": String(c.overlay / 100) });
/** Nút mở dạng "play" (Video Popup): khung 16:9 nền là ảnh `triggerImage` (đường dẫn trong site hoặc https) + nút phát tròn ở giữa. */
export function popupPlayStyle(a) {
    const u = typeof a.triggerImage === "string" ? a.triggerImage.trim() : "";
    return /^(\/(?!\/)|https:\/\/)[^\s"'()\\<>]{1,1000}$/.test(u) ? { backgroundImage: `url("${u}")` } : undefined;
}
