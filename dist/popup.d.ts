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
export declare function popupConfig(a: Record<string, unknown>): PopupConfig;
/** class của `.ecx-popup` (website và khung soạn dùng chung). */
export declare const popupClass: (c: PopupConfig) => string;
/** Biến CSS của `.ecx-popup` (độ tối nền). */
export declare const popupVars: (c: PopupConfig) => Record<string, string>;
/** Nút mở dạng "play" (Video Popup): khung 16:9 nền là ảnh `triggerImage` (đường dẫn trong site hoặc https) + nút phát tròn ở giữa. */
export declare function popupPlayStyle(a: Record<string, unknown>): Record<string, string> | undefined;
