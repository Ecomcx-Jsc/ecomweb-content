/**
 * 1.24: ô Kiểu dáng riêng của khối lõi (như tab Style của từng widget Elementor: Icon List › Danh sách / Icon / Chữ…).
 * Khai báo bằng cùng bộ máy với plugin (defineBlockControls / controlsCss) → khung soạn và website sinh CSS y hệt nhau.
 * Giá trị lưu thẳng trong attrs của khối (vd `listMarkerColor`); mặc định = token `--ecx-*` của style.css (ô trống = theo theme).
 * Thứ tự thuộc tính trong một mục = thứ tự ô trên giao diện; `section` = mục, `state` = thẻ Rê chuột / Đang mở (như Normal / Hover).
 */
import { type BlockControls, type ControlSpec } from "./controls.js";
export declare const CORE_CONTROLS: readonly BlockControls[];
/** Ô Kiểu dáng lõi của một loại khối (tên thuộc tính → mô tả), theo thứ tự khai báo. */
export declare function coreControlsFor(type: string): Record<string, ControlSpec>;
