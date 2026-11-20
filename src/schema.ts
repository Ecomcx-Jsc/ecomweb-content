/**
 * Mô tả thuộc tính của khối / định dạng chữ — dùng cho khối lõi dưới đây và cho khối của plugin (defineBlock).
 * Giá trị sai kiểu được ép về đúng kiểu nếu được (số dạng chuỗi → số), không ép được thì bỏ (= giá trị mặc định).
 * `null` và "không có" là một: thuộc tính null không được lưu.
 */
export type AttrType = "string" | "number" | "integer" | "boolean" | "url" | "json";

export interface AttrSpec {
  type: AttrType;
  /** Giá trị khi không có — trình soạn và website dùng chung. */
  default?: unknown;
  /** Chỉ nhận các giá trị này. */
  enum?: readonly unknown[];
  /** Chuỗi: phải khớp biểu thức chính quy này (cú pháp dùng chung với .NET). */
  pattern?: string;
  /** Số: kẹp trong [min, max]. */
  min?: number;
  max?: number;
}

export interface NodeSpec {
  attrs?: Record<string, AttrSpec>;
}


const s = (extra: Partial<AttrSpec> = {}): AttrSpec => ({ type: "string", ...extra });
const n = (extra: Partial<AttrSpec> = {}): AttrSpec => ({ type: "number", ...extra });
const i = (extra: Partial<AttrSpec> = {}): AttrSpec => ({ type: "integer", ...extra });
const b = (extra: Partial<AttrSpec> = {}): AttrSpec => ({ type: "boolean", ...extra });
const url = (): AttrSpec => ({ type: "url" });
const align = s({ enum: ["left", "center", "right", "justify"] });
/** 1.20: độ rộng khối so với cột chữ (như alignwide / alignfull của WP) — khối nào có thì xem WIDE_BLOCKS. */
const wide = s({ enum: ["wide", "full"] });
/** Thẻ HTML cho khối chứa (Nhóm, Bộ cột, Cột) — 1.27. */
export const CONTAINER_TAGS = ["div", "section", "header", "footer", "article", "main", "aside"];
/** 1.26: giá trị autocomplete cho ô của form lõi (khớp ContentFormat.cs). */
export const FORM_AUTOCOMPLETE = ["off", "name", "given-name", "family-name", "email", "tel", "organization", "street-address", "address-level1", "address-level2", "postal-code", "country-name", "bday"];
/** Loại ô của khối formField (form cơ bản của lõi). consent = ô đồng ý (bắt buộc tick khi required). */
export const FORM_FIELD_KINDS = ["text", "email", "tel", "textarea", "select", "radio", "checkbox", "consent", "number", "date"] as const;
const media = { src: url(), name: s(), mime: s(), mediaId: { type: "json" } as AttrSpec, caption: s() };

/**
 * Khối lõi trong nội dung soạn thảo (khối `richtext`). Thuộc tính không có trong danh sách vẫn được giữ nguyên
 * (plugin có thể thêm thuộc tính vào khối lõi) — chỉ thuộc tính có mô tả mới được kiểm kiểu.
 */
const ICON_VALUE = "^(svg:[\\s\\S]{1,8100}|[A-Za-z0-9-]{1,60})$"; // tên icon (bảng lõi hoặc thư viện) hoặc SVG riêng `svg:…`
export const CORE_NODES: Record<string, NodeSpec> = {
  doc: {},
  text: {},
  // 1.29: icon cạnh chữ (icon trong bộ có sẵn, trước / sau chữ), chú thích khi rê chuột; tiêu đề có thể có tên khác trong mục lục
  paragraph: { attrs: { textAlign: align, icon: s({ pattern: ICON_VALUE }), iconPosition: s({ enum: ["left", "right"], default: "left" }), iconTitle: s() } },
  heading: { attrs: { htmlTag: s({ enum: ["p", "span", "div"] }), level: i({ min: 1, max: 6, default: 2 }), textAlign: align, id: s(), icon: s({ pattern: ICON_VALUE }), iconPosition: s({ enum: ["left", "right"], default: "left" }), iconTitle: s(), tocTitle: s(),
    // 1.32: liên kết cả tiêu đề (như Link của widget Heading): địa chỉ, mở tab mới, rel (nofollow / sponsored)
    href: url(), linkTarget: s({ enum: ["_self", "_blank"] }), linkRel: s(),
    // 1.30: chữ gõ ở cuối tiêu đề — nhóm từ cách nhau "|" (tối đa 8 từ × 40 ký tự), tốc độ gõ (ms / ký tự), dừng giữa hai từ (ms), lặp — xem typed.ts
    typedWords: s(), typedSpeed: i({ min: 30, max: 200, default: 80 }), typedPause: i({ min: 600, max: 6000, default: 1800 }), typedLoop: b({ default: true }) } },
  bulletList: {},
  orderedList: { attrs: { start: i({ min: 0, default: 1 }), reversed: b({ default: false }) } },
  listItem: {},
  blockquote: { attrs: { citation: s() } },
  codeBlock: { attrs: { language: s() } },
  hardBreak: {},
  // inlineImage (1.30): ảnh nằm trong dòng chữ của tiêu đề / đoạn (logo giữa câu, biểu tượng cạnh từ). width / height theo em hoặc px (vd "1.2em", "24px"),
  // valign = căn dọc so với chữ, radius = bo góc (vd "50%", "4px"). Là nút inline: không có content.
  inlineImage: { attrs: { src: url(), alt: s(), width: s({ pattern: "^\\d{1,4}(\\.\\d{1,2})?(em|px|rem)$" }), height: s({ pattern: "^\\d{1,4}(\\.\\d{1,2})?(em|px|rem)$" }),
    radius: s({ pattern: "^\\d{1,3}(\\.\\d{1,2})?(%|px|em)$" }), valign: s({ enum: ["baseline", "middle", "top", "bottom", "text-bottom"], default: "middle" }), href: url(), target: s({ enum: ["_self", "_blank"] }) } },
  image: {
    attrs: {
      src: url(), alt: s(), title: s(), width: n({ min: 1 }), height: n({ min: 1 }), srcset: s(), webpSrcset: s(),
      mediaId: { type: "json" }, size: s({ default: "large" }), caption: s(), align: s({ enum: ["left", "right", "center", "wide", "full"] }),
      href: url(), linkTarget: s({ enum: ["_self", "_blank"] }), lightbox: b({ default: false }),
      // 1.28: tỉ lệ khung (cắt ảnh vừa khung) — xem image-fx.ts; bộ lọc / hiệu ứng rê / object-fit là ô của tab Kiểu dáng
      ratio: s({ enum: ["auto", "1/1", "4/3", "3/2", "16/9", "21/9", "3/4", "2/3"], default: "auto" }),
    },
  },
  gallery: { attrs: { align: wide, images: { type: "json", default: [] }, columns: i({ min: 1, max: 6, default: 3 }), caption: s(), linkTo: s({ enum: ["none", "media"], default: "media" }), imageCrop: b({ default: true }), lightbox: b({ default: false }),
    // 1.28: lưới đều | masonry (cột, ảnh giữ tỉ lệ); link riêng từng ảnh nằm trong images[].href
    layout: s({ enum: ["grid", "masonry", "mosaic", "tiles", "thumbs", "slider"], default: "grid" }),
    // chú thích từng ảnh: dưới ảnh | hiện khi rê chuột | phủ lên ảnh
    captionStyle: s({ enum: ["below", "hover", "overlay"], default: "below" }),
    // dạng slider (số ảnh thấy cùng lúc = columns, tối đa 4): nút trước / sau, chấm, tự chuyển — cùng bộ máy với Slider
    arrows: b({ default: true }), dots: b({ default: true }), autoplay: b({ default: false }), interval: i({ min: 2, max: 30, default: 5 }), loop: b({ default: true }) } },
  // next: hành vi phát — autoplay chỉ chạy khi muted (trình duyệt chặn nếu có tiếng); controls / playsInline mặc định bật
  video: { attrs: { align: wide, ...media, poster: url(), width: n({ min: 1 }), height: n({ min: 1 }), autoplay: b(), loop: b(), muted: b(), controls: b({ default: true }), playsInline: b({ default: true }), preload: s({ enum: ["none", "metadata", "auto"], default: "metadata" }) } },
  audio: { attrs: { ...media, autoplay: b(), loop: b(), preload: s({ enum: ["none", "metadata", "auto"], default: "metadata" }) } },
  file: { attrs: { ...media, size: n({ min: 0 }), embed: b({ default: true }), download: b() } },
  table: { attrs: { align: wide, footer: b({ default: false }), fixed: b({ default: false }),
    // 1.32: cài đặt riêng của bảng (như khối Table của Kadence): kẻ sọc, sáng hàng khi rê, kiểu đường kẻ, mật độ, ghim hàng đầu, chú thích
    striped: b({ default: false }), hoverRows: b({ default: false }), lines: s({ enum: ["all", "rows", "columns", "none"], default: "all" }),
    density: s({ enum: ["compact", "normal", "roomy"], default: "normal" }), stickyHead: b({ default: false }), caption: s() } },
  // colwidth: độ rộng cột (px, lưu ở mọi ô của cột); height của hàng (px) — kéo cạnh ô trong trình soạn
  tableRow: { attrs: { height: i({ min: 16, max: 1200 }) } },
  tableHeader: { attrs: { colspan: i({ min: 1, default: 1 }), rowspan: i({ min: 1, default: 1 }), colwidth: { type: "json" } } },
  tableCell: { attrs: { colspan: i({ min: 1, default: 1 }), rowspan: i({ min: 1, default: 1 }), colwidth: { type: "json" } } },
  // Bố cục (1.2): cột, nhóm, hộp lưu ý chứa khối khác; nút; nhúng theo đường dẫn (embedInfo)
  // 1.27: tagName = thẻ HTML của khối chứa (ngữ nghĩa: section, header, article…)
  columns: { attrs: { align: wide, verticalAlign: s({ enum: ["top", "center", "bottom", "stretch"] }), stack: b({ default: true }), tagName: s({ enum: CONTAINER_TAGS }) } },
  // 1.26: href = liên kết phủ cả cột (bấm đâu trong cột cũng mở); linkLabel = tên liên kết cho trình đọc màn hình
  column: { attrs: { width: n({ min: 5, max: 100 }), href: url(), linkTarget: s({ enum: ["_self", "_blank"] }), linkLabel: s(), tagName: s({ enum: CONTAINER_TAGS }) } },
  // 1.28: contentWidth = độ rộng nội dung bên trong tự nhập (vd "900px"); có giá trị thì khối con canh giữa theo độ rộng này (thắng `constrained` = theo độ rộng của website)
  // href = liên kết phủ cả nhóm / Section (bấm đâu trong khối cũng mở); linkLabel = tên liên kết cho trình đọc màn hình
  // collapseHeight: chiều cao thu gọn (vd "12rem") — có thì website cắt khối ở mức đó kèm nút "Xem thêm / Thu gọn" (moreText / lessText); không cần JS
  group: { attrs: { collapseFade: b({ default: true }), collapseOnce: b({ default: false }), collapseHeight: s(), moreText: s(), lessText: s(), href: url(), linkTarget: s({ enum: ["_self", "_blank"] }), linkLabel: s(), tagName: s({ enum: CONTAINER_TAGS }), align: wide, constrained: b({ default: false }), contentWidth: s(), background: s(), textColor: s(), padding: s({ enum: ["none", "small", "medium", "large"], default: "medium" }) } },
  button: {
    attrs: {
      text: s(), href: url(), target: s(), rel: s(), tooltip: s(),
      variant: s({ enum: ["primary", "secondary", "outline"], default: "primary" }), align: s({ enum: ["left", "center", "right"] }),
      // 1.26: icon (tên trong ICON_PATHS) + vị trí, độ rộng (auto | full), nhãn cho trình đọc màn hình
      icon: s({ pattern: ICON_VALUE }), iconPosition: s({ enum: ["left", "right"] }), width: s({ enum: ["auto", "full"] }), ariaLabel: s(),
      // chỉ hiện icon (chữ thành nhãn cho trình đọc màn hình), icon hiện khi rê chuột
      iconOnly: b({ default: false }), iconReveal: b({ default: false }),
    },
  },
  embed: { attrs: { align: wide, url: url(), caption: s() } },
  // Bộ khối cơ bản (1.9)
  // spacer: khoảng trống, có thể kèm đường kẻ ở giữa (line): lineStyle nét, lineWeight độ dày px, lineWidth độ dài %, lineAlign căn, lineColor màu
  spacer: { attrs: { height: s({ default: "lg" }), line: b({ default: false }), lineStyle: s({ enum: ["solid", "dashed", "dotted", "double"], default: "solid" }), lineWeight: i({ min: 1, max: 12, default: 1 }), lineWidth: i({ min: 5, max: 100, default: 100 }),
    lineAlign: s({ enum: ["left", "center", "right"], default: "center" }), lineColor: s() } },
  buttons: { attrs: { align: s({ enum: ["left", "center", "right", "space-between"] }), orientation: s({ enum: ["horizontal", "vertical"], default: "horizontal" }) } },
  cover: {
    attrs: {
      align: wide, constrained: b({ default: false }), src: url(), mediaId: { type: "json" }, alt: s(), overlay: s(), opacity: i({ min: 0, max: 100, default: 50 }), minHeight: s({ default: "400px" }),
      contentAlign: s({ enum: ["top", "center", "bottom"], default: "center" }), fixed: b({ default: false }), focal: s(),
      // 1.30: video nền (mp4 / webm / ogg): tự phát, tắt tiếng, lặp; ảnh `src` làm poster — xem coverVideo
      videoSrc: url(),
    },
  },
  // popup: nút mở + hộp thoại chứa các khối con. size = rộng tối đa (sm 28 / md 40 / lg 56 / xl 72rem); anim = hiệu ứng mở; overlayOpacity = độ tối nền (0–100)
  popup: { attrs: { align: wide, triggerText: s(), triggerStyle: s({ enum: ["primary", "outline", "link", "play"], default: "primary" }), triggerImage: url(), popupId: s({ pattern: "^[a-z][a-z0-9-]{0,40}$" }), autoOpen: s({ enum: ["none", "delay", "scroll", "exit", "idle"], default: "none" }), autoDelay: i({ min: 0, max: 300, default: 5 }), autoScroll: i({ min: 5, max: 100, default: 50 }), onceDays: i({ min: 0, max: 365, default: 0 }), triggerAlign: s({ enum: ["left", "center", "right"], default: "left" }),
    size: s({ enum: ["sm", "md", "lg", "xl"], default: "md" }), anim: s({ enum: ["fade", "up", "zoom", "none"], default: "fade" }), overlayOpacity: i({ min: 0, max: 100, default: 60 }),
    vAlign: s({ enum: ["top", "center"], default: "center" }), closeButton: b({ default: true }), closeOnOverlay: b({ default: true }), label: s() } },
  details: { attrs: { summary: s(), open: b({ default: false }) } },
  // next: accordion = nhiều khối details; multiple=false → mở một mục thì mục khác đóng. countdown là khối nguyên tử.
  // tabs > tab(title) > nội dung; carousel: mỗi con trực tiếp là một slide; shortcode chèn shortcode của plugin/theme
  // 1.26: tab dọc, thành accordion trên điện thoại; mỗi tab có icon (tên trong ICON_PATHS) + phụ đề; neo của tab = `anchor` chung (mở thẳng bằng #neo)
  tabs: { attrs: { align: wide, initial: i({ min: 1 }), orientation: s({ enum: ["horizontal", "vertical"], default: "horizontal" }), mobileAccordion: b({ default: false }),
    // 1.28: vị trí icon của nút tab (trái / phải / trên), chỉ hiện icon (chữ giữ cho trình đọc màn hình)
    iconPosition: s({ enum: ["left", "right", "top"], default: "left" }), iconOnly: b({ default: false }) } },
  tab: { attrs: { title: s(), icon: s({ pattern: ICON_VALUE }), subtitle: s() } },
  // slidesPerView / slidesTablet / slidesMobile = số slide thấy cùng lúc theo khổ; arrows / dots / autoplay / interval (giây) / loop / gap: xem carousel.ts
  carousel: { attrs: { align: wide, slidesPerView: i({ min: 1, max: 4, default: 1 }), slidesTablet: i({ min: 1, max: 4 }), slidesMobile: i({ min: 1, max: 4 }), arrows: b({ default: true }), dots: b({ default: true }), autoplay: b({ default: false }), interval: i({ min: 2, max: 30, default: 5 }), loop: b({ default: true }), gap: s(),
    effect: s({ enum: ["slide", "fade"], default: "slide" }), speed: i({ min: 150, max: 1500, default: 400 }), heightMode: s({ enum: ["auto", "ratio", "min"], default: "auto" }), ratio: s({ enum: ["16/9", "4/3", "3/2", "1/1", "21/9", "3/1"], default: "16/9" }), minHeight: s(),
    arrowStyle: s({ enum: ["circle", "square", "plain", "light"], default: "circle" }), dotStyle: s({ enum: ["dot", "line", "light"], default: "dot" }), arrowPos: s({ enum: ["center", "bottom"], default: "center" }), hoverPause: b({ default: true }) } },
  shortcode: { attrs: { name: s(), args: { type: "json", default: {} } } },
  // 1.26: chia 2 cột, icon mở / đóng (mũi tên | dấu cộng | không) bên trái / phải, thẻ của tiêu đề mục, FAQ Schema (Google)
  accordion: { attrs: { align: wide, multiple: b({ default: false }), columns: i({ min: 1, max: 2, default: 1 }), icon: s({ enum: ["arrow", "plus", "none"], default: "arrow" }), iconSide: s({ enum: ["left", "right"], default: "right" }), titleTag: s({ enum: ["div", "h2", "h3", "h4", "h5", "h6"], default: "div" }), faq: b({ default: false }),
    // 1.28: mục mở sẵn khi tải trang — không | mục đầu | tất cả (nhóm "mở một mục" chỉ mở được mục đầu); mục tự đặt `open` thì giữ nguyên
    startOpen: s({ enum: ["none", "first", "all"], default: "none" }) } },
  // 1.26: bố cục khối | một dòng, dấu ":" giữa các ô, số dạng 00, chữ sau, ẩn ngày / giây, nhãn riêng từng đơn vị
  countdown: { attrs: { target: s(), timezone: s({ enum: ["Asia/Ho_Chi_Minh", "Asia/Bangkok", "Asia/Singapore", "Asia/Shanghai", "Asia/Tokyo", "Asia/Seoul", "Asia/Kolkata", "Asia/Dubai", "Europe/London", "Europe/Paris", "Europe/Moscow", "America/New_York", "America/Chicago", "America/Los_Angeles", "Australia/Sydney", "UTC"] }), label: s(), expiredText: s(),
    // 1.28: hành động khi hết giờ, lặp lại, evergreen (đếm theo từng người xem), nút tạm dừng — xem countdown-rules.ts
    expireAction: s({ enum: ["zero", "message", "hide", "redirect"] }), redirectUrl: url(), repeat: s({ enum: ["none", "daily", "weekly", "monthly", "yearly"], default: "none" }),
    mode: s({ enum: ["date", "evergreen"], default: "date" }), evergreenHours: i({ min: 0, max: 2160 }), evergreenMinutes: i({ min: 0, max: 59 }), evergreenReset: i({ min: 0, max: 365, default: 30 }), pauseButton: b({ default: false }),
    layout: s({ enum: ["block", "inline"], default: "block" }), divider: b({ default: false }), pad: b({ default: true }), postText: s(), showDays: b({ default: true }), showSeconds: b({ default: true }), daysLabel: s(), hoursLabel: s(), minutesLabel: s(), secondsLabel: s() } },
  customHtml: { attrs: { align: wide, html: s() } },
  socialLinks: { attrs: { links: { type: "json", default: [] }, size: s({ enum: ["small", "medium", "large"], default: "medium" }), align: s({ enum: ["left", "center", "right"] }), showLabels: b({ default: false }) } },
  // 1.26: khoảng cấp tiêu đề H2–H6, thu gọn được (+ bắt đầu thu gọn), kiểu danh sách, số cột, cuộn mượt, tô đậm mục đang đọc
  tableOfContents: { attrs: { title: s(), minLevel: i({ min: 2, max: 6, default: 2 }), maxLevel: i({ min: 2, max: 6, default: 3 }), collapsible: b({ default: false }), startCollapsed: b({ default: false }), listStyle: s({ enum: ["numbers", "bullets", "none"], default: "numbers" }), columns: i({ min: 1, max: 3, default: 1 }), smoothScroll: b({ default: false }), highlight: b({ default: false }),
    // 1.28: ẩn tiêu đề (bỏ qua khi thu gọn được — tiêu đề là nút mở / đóng)
    showTitle: b({ default: true }) } },
  // Khối động (1.6): lấy dữ liệu lúc hiển thị theo ngữ cảnh (website, trang đang xem, bài trong vòng lặp) — dùng trong template
  siteTitle: { attrs: { level: i({ min: 0, max: 6, default: 0 }), link: b({ default: true }), textAlign: align } },
  siteLogo: { attrs: { width: n({ min: 16, max: 600, default: 120 }), link: b({ default: true }) } },
  siteTagline: { attrs: { textAlign: align } },
  navigation: { attrs: { location: s({ default: "primary" }), orientation: s({ enum: ["horizontal", "vertical"], default: "horizontal" }), mobile: b({ default: true }), overlayMenu: s({ enum: ["never", "mobile", "tablet", "always"], default: "mobile" }) } },
  search: { attrs: { placeholder: s(), buttonText: s(), postType: s(), showLabel: b({ default: false }), buttonPosition: s({ enum: ["right", "left", "below"], default: "right" }),
    // 1.28: nút là chữ hoặc chỉ icon kính lúp (chữ nút thành aria-label)
    buttonStyle: s({ enum: ["text", "icon"], default: "text" }),
    // 1.27: ô chọn phạm vi tìm kiếm (Tất cả / loại nội dung): scopes = "product:Sản phẩm, post:Tin tức"
    scopeSelect: b({ default: false }), scopes: s(),
    // 1.27: thu thành nút kính lúp (bấm mở ô nhập) trên tablet / điện thoại
    collapse: s({ enum: ["never", "tablet", "mobile"], default: "never" }) } },
  languageSwitcher: { attrs: { display: s({ enum: ["inline", "dropdown"], default: "inline" }) } },
  copyright: { attrs: { text: s(), textAlign: align } },
  postTitle: { attrs: { level: i({ min: 1, max: 6, default: 1 }), link: b({ default: false }), textAlign: align } },
  postContent: {},
  postExcerpt: { attrs: { moreText: s(), length: i({ min: 0, max: 2000, default: 0 }) } },
  featuredImage: { attrs: { size: s({ default: "large" }), link: b({ default: false }), aspect: s({ enum: ["auto", "16/9", "4/3", "1/1", "3/4"], default: "auto" }) } },
  postDate: { attrs: { textAlign: align, displayType: s({ enum: ["published", "modified"], default: "published" }) } },
  postAuthor: { attrs: { avatar: b({ default: false }), showName: b({ default: true }), avatarSize: i({ min: 16, max: 128, default: 32 }), link: b({ default: true }), showBio: b({ default: false }) } },
  postTerms: { attrs: { taxonomy: s({ default: "category" }), separator: s({ default: ", " }) } },
  comments: { attrs: { title: s(), perPage: i({ min: 1, max: 50 }), order: s({ enum: ["asc", "desc"] }), avatarSize: i({ min: 16, max: 128, default: 40 }), showDate: b({ default: true }) } },
  readMore: { attrs: { text: s(), textAlign: align } },
  commentsCount: { attrs: { textAlign: align } },
  avatar: { attrs: { size: i({ min: 16, max: 256, default: 48 }), link: b({ default: true }) } },
  queryTotal: { attrs: { textAlign: align } },
  // 1.18: danh sách chuyên mục/thẻ (list|cloud), cây trang con, lưu trữ theo tháng
  // 1.27: độ dày nét, khung nền (tròn / vuông — nền nhạt theo màu icon), liên kết
  icon: { attrs: { tooltip: s(), name: s({ pattern: ICON_VALUE, default: "star" }), size: i({ min: 12, max: 128, default: 24 }), label: s(), textAlign: align, stroke: n({ min: 0.5, max: 4, default: 2 }), iconStyle: s({ enum: ["plain", "circle", "square"], default: "plain" }), href: url(), linkTarget: s({ enum: ["_self", "_blank"] }) } },
  loginout: { attrs: { loginText: s(), logoutText: s(), textAlign: align } },
  termList: { attrs: { taxonomy: s({ default: "category" }), display: s({ enum: ["list", "cloud"], default: "list" }), showCount: b({ default: false }), hierarchical: b({ default: false }), hideEmpty: b({ default: true }) } },
  pageList: { attrs: { parentId: i({ min: 1 }), depth: i({ min: 1, max: 3, default: 2 }) } },
  archives: { attrs: { showCount: b({ default: true }), limit: i({ min: 1, max: 60, default: 12 }) } },
  // 1.15: khối theme cho SEO / điều hướng — H1 của trang lưu trữ, mô tả chuyên mục, breadcrumb, bài trước / sau
  queryTitle: { attrs: { level: i({ min: 1, max: 6, default: 1 }), prefix: b({ default: false }), textAlign: align } },
  termDescription: { attrs: { textAlign: align } },
  breadcrumbs: { attrs: { separator: s({ default: "›" }), showHome: b({ default: true }), showCurrent: b({ default: true }) } },
  postNavigation: { attrs: { showTitle: b({ default: true }) } },
  query: {
    attrs: {
      align: wide, inherit: b({ default: true }), postType: s({ default: "post" }), perPage: i({ min: 1, max: 50, default: 10 }),
      category: s(), tag: s(),
      // 1.27: lọc theo phân loại bất kỳ (vd product_cat) — taxonomy + term (slug); category / tag vẫn dùng cho bài viết
      taxonomy: s(), term: s(), orderBy: s({ enum: ["date", "title", "modified", "menu_order", "comment_count", "rand"], default: "date" }), order: s({ enum: ["desc", "asc"], default: "desc" }),
      // next: lọc thêm theo tác giả, từ khoá, loại trừ bài, bài ghim, khoá meta (đã khai báo filterable)
      authorId: i({ min: 1 }), search: s(), exclude: s(), sticky: s({ enum: ["any", "only", "exclude"], default: "any" }), orderByMeta: s(), paginate: b({ default: false }),
      // 1.27 bộ lọc: nguồn (mới nhất / chọn tay / liên quan), nhiều mục của phân loại (bất kỳ / tất cả / loại trừ), điều kiện trường tuỳ biến, khoảng ngày,
      // bài con của trang, bỏ N bài đầu, loại bài đang xem, cùng tác giả, và nhận bộ lọc từ thanh lọc trên URL (?fq_…)
      source: s({ enum: ["latest", "manual", "related"], default: "latest" }), include: s(), terms: s(), termMode: s({ enum: ["any", "all", "none"], default: "any" }),
      metaKey: s(), metaCompare: s({ enum: ["=", "!=", ">", ">=", "<", "<=", "LIKE", "EXISTS", "NOT EXISTS"], default: "=" }), metaValue: s(), metaValue2: s(),
      dateRange: s({ enum: ["any", "7", "30", "90", "365"], default: "any" }), after: s(), before: s(), parent: i({ min: 1 }), offset: i({ min: 0, max: 1000 }),
      excludeCurrent: b({ default: true }), authorCurrent: b({ default: false }), urlFilters: b({ default: false }),
    },
  },
  // 1.27: "carousel" = một hàng cuộn ngang có nút trước / sau (columns = số thẻ thấy cùng lúc trên máy tính); gap = khoảng cách thẻ (preset hoặc độ dài)
  postTemplate: { attrs: { layout: s({ enum: ["list", "grid", "carousel"], default: "list" }), columns: i({ min: 1, max: 6, default: 3 }), columnsTablet: i({ min: 1, max: 6 }), columnsMobile: i({ min: 1, max: 4 }), gap: s(), arrows: b({ default: true }) } },
  pagination: { attrs: { type: s({ enum: ["numbers", "prevNext", "both"], default: "both" }), midSize: i({ min: 0, max: 5, default: 2 }) } },
  queryEmpty: {},
  // 1.27: thanh lọc cho khối Query (bật "Nhận bộ lọc từ thanh lọc"): ô tìm, mục phân loại (liên kết / nút lọc / ô chọn), sắp xếp
  queryFilter: { attrs: { align: wide, taxonomy: s(), termStyle: s({ enum: ["none", "links", "chips", "select", "checks"], default: "links" }), showRange: b({ default: false }), rangeParam: s({ pattern: "^[a-z][a-z0-9_]{0,30}$" }), rangeLabel: s(), rangeMax: n({ min: 1, max: 100000000 }), allLabel: s(), showSearch: b({ default: false }), showSort: b({ default: false }), showYear: b({ default: false }), showReset: b({ default: false }), sortOptions: s(), placeholder: s(), submitText: s(), action: s() } },
  templatePart: { attrs: { slug: s(), tagName: s({ enum: ["div", "header", "footer", "aside", "section"], default: "div" }) } },
  /** Mẫu đồng bộ: tham chiếu tới mẫu (id) — sửa mẫu gốc thì mọi chỗ dùng đổi theo. */
  syncedPattern: { attrs: { ref: i({ min: 1 }), overrides: { type: "json" } } },
  // 1.21: form cơ bản của lõi (liên hệ, đăng ký nhận tin, đặt lịch đơn giản): `form` chứa các ô `formField` và khối chữ; máy chủ đọc lại
  // định nghĩa form từ chính trang / template chứa nó để kiểm bài gửi. formId cố định theo form (không đổi khi sửa ô). Form nâng cao: plugin.
  // 1.26: email nhận có thể nhiều địa chỉ (dấu phẩy), đồng gửi (Cc), tiêu đề email riêng, chuyển trang sau khi gửi
  // 1.28: cỡ ô nhập S / M / L
  form: { attrs: { align: wide, formId: s(), submitText: s(), successMessage: s(), notifyEmail: s(), notifyCc: s(), emailSubject: s(), redirect: url(), inputSize: s({ enum: ["sm", "md", "lg"], default: "md" }) } },
  formField: {
    attrs: {
      kind: s({ enum: FORM_FIELD_KINDS, default: "text" }), name: s(), label: s(), placeholder: s(), help: s(),
      required: b({ default: false }), options: { type: "json", default: [] }, width: s({ enum: ["full", "half", "third"], default: "full" }),
      // 1.26: trình duyệt tự điền (autocomplete)
      autocomplete: s({ enum: FORM_AUTOCOMPLETE }),
      // 1.31: chỉ hiện khi điều kiện đúng ("tên=giá trị", "tên!=giá trị" hoặc "tên" = đã điền); step = bước (1–8) của form nhiều bước
      showIf: s(), step: i({ min: 1, max: 8 }),
    },
  },
  // 1.23: widget lõi (markup chung ở widgets.ts). Chữ là chữ thường (không HTML); ảnh như mediaText (src + mediaId + alt).
  // 1.26: icon bên phải; media là icon | số | không; khung icon tròn / vuông; hiệu ứng icon khi rê; link ở tiêu đề | cả hộp | nút "Xem thêm"
  iconBox: { attrs: {
    icon: s({ pattern: ICON_VALUE, default: "star" }), title: s(), text: s(), href: url(), level: i({ min: 2, max: 6, default: 3 }), position: s({ enum: ["top", "left", "right"], default: "top" }), textAlign: align,
    media: s({ enum: ["icon", "image", "number", "none"], default: "icon" }), number: s(), iconStyle: s({ enum: ["plain", "circle", "square"], default: "plain" }), hover: s({ enum: ["none", "grow", "flip"], default: "none" }),
    linkMode: s({ enum: ["title", "box", "button"], default: "title" }), buttonText: s(),
    // 1.28: media là ảnh (gộp Hộp ảnh vào đây), căn dọc media khi nằm bên trái / phải, hộp cao bằng ô chứa
    src: url(), mediaId: { type: "json" }, alt: s(), srcset: s(), webpSrcset: s(), width: n({ min: 1 }), height: n({ min: 1 }),
    verticalAlign: s({ enum: ["top", "center", "bottom"], default: "top" }), fullHeight: b(),
  } },
  // Ảnh phủ chữ: ratio = tỉ lệ khung; overlayOpacity = độ đậm lớp màu khi rê (0–100), restOpacity = khi chưa rê; subtitleMode: hiện khi rê / luôn hiện; frameInset = khoảng viền khung trắng (px)
  imageOverlay: { attrs: { align: wide, src: url(), mediaId: { type: "json" }, alt: s(), srcset: s(), webpSrcset: s(), width: n({ min: 1 }), height: n({ min: 1 }), title: s(), subtitle: s(), href: url(), linkTarget: s({ enum: ["_self", "_blank"] }), level: i({ min: 2, max: 6, default: 3 }),
    ratio: s({ enum: ["auto", "1/1", "4/3", "3/2", "16/9", "3/4", "2/3"], default: "4/3" }), hAlign: s({ enum: ["left", "center", "right"], default: "center" }), vAlign: s({ enum: ["top", "center", "bottom"], default: "center" }),
    imageEffect: s({ enum: ["none", "zoom", "grayscale", "blur", "slide"], default: "zoom" }), overlayColor: s(), overlayOpacity: i({ min: 0, max: 100, default: 60 }), restOpacity: i({ min: 0, max: 100, default: 0 }),
    subtitleMode: s({ enum: ["hover", "always"], default: "hover" }), frame: b({ default: true }), frameInset: i({ min: 0, max: 40, default: 10 }), divider: b({ default: false }) } },
  imageBox: { attrs: { src: url(), mediaId: { type: "json" }, alt: s(), srcset: s(), webpSrcset: s(), width: n({ min: 1 }), height: n({ min: 1 }), title: s(), text: s(), href: url(), level: i({ min: 2, max: 6, default: 3 }), textAlign: align } },
  /** items: [{ text, href?, icon? }] — icon riêng của mục thắng icon chung. */
  // 1.27: số cột (điện thoại về 1), căn icon theo dòng chữ, khung icon, độ dày nét; mục có icon "none" = không vẽ icon
  iconList: { attrs: { items: { type: "json", default: [] }, icon: s({ pattern: ICON_VALUE, default: "check" }), layout: s({ enum: ["list", "inline"], default: "list" }), columns: i({ min: 1, max: 4, default: 1 }), iconAlign: s({ enum: ["top", "center", "bottom"], default: "top" }), iconStyle: s({ enum: ["plain", "circle", "square"], default: "plain" }), stroke: n({ min: 0.5, max: 4, default: 2 }) } },
  // 1.28: Bản đồ — địa chỉ gõ tay → khung Google Maps (địa chỉ chỉ nằm trong tham số q của URL cố định, không nhúng được trang tuỳ ý)
  map: { attrs: { address: s(), zoom: i({ min: 1, max: 20, default: 14 }), height: i({ min: 150, max: 1000, default: 360 }), mapType: s({ enum: ["roadmap", "satellite"], default: "roadmap" }), title: s() } },
  // lottie (1.29): hoạt ảnh .lottie / .json. Website nạp thư viện khi cần; thiếu thư viện hoặc lỗi tệp thì hiện `poster` (không có thì ẩn), trang không hỏng.
  // trigger: auto = tự chạy (theo autoplay), hover = chạy khi rê chuột, click = chạy khi bấm, scroll = chạy khi cuộn tới.
  lottie: { attrs: { src: url(), poster: url(), label: s(), loop: b({ default: true }), autoplay: b({ default: true }), speed: n({ min: 0.1, max: 5, default: 1 }),
    trigger: s({ enum: ["auto", "hover", "click", "scroll"], default: "auto" }), height: i({ min: 40, max: 1200 }), maxWidth: i({ min: 40, max: 2000 }), align: s({ enum: ["left", "center", "right"], default: "center" }) } },
  counter: {
    attrs: {
      start: n({ default: 0 }), end: n({ default: 100 }), prefix: s(), suffix: s(), title: s(), duration: i({ min: 0, max: 10000, default: 2000 }),
      separator: s({ enum: ["none", ",", ".", "space"], default: "none" }), textAlign: align,
      // 1.28: số chữ thập phân tự đặt (không đặt = theo số đầu / cuối), thẻ HTML của tiêu đề
      decimals: i({ min: 0, max: 3 }), titleTag: s({ enum: ["p", "div", "h2", "h3", "h4", "h5", "h6"], default: "p" }),
    },
  },
  // 1.28: kiểu thẻ / trơn / bong bóng, sao đánh giá (0 = không hiện), dấu trích ở đầu
  // testimonials: nhiều khối testimonial con; layout grid | carousel; columns = số thẻ cùng hàng (carousel: số thẻ thấy cùng lúc)
  testimonials: { attrs: { align: wide, layout: s({ enum: ["grid", "carousel"], default: "grid" }), columns: i({ min: 1, max: 4, default: 3 }), columnsTablet: i({ min: 1, max: 4 }), columnsMobile: i({ min: 1, max: 2 }), gap: s(),
    arrows: b({ default: true }), dots: b({ default: true }), autoplay: b({ default: false }), interval: i({ min: 2, max: 30, default: 5 }), loop: b({ default: true }) } },
  testimonial: { attrs: { mediaIcon: s({ pattern: ICON_VALUE }), quote: s(), name: s(), role: s(), src: url(), mediaId: { type: "json" }, alt: s(), textAlign: align,
    variant: s({ enum: ["card", "plain", "bubble"], default: "card" }), rating: i({ min: 0, max: 5, default: 0 }), quoteMark: b() } },
  // 1.26: giá trị / tối đa (không chỉ %), tiền tố / hậu tố của số (mặc định "%"), vị trí chữ (trên | trong thanh | dưới), thời gian chạy (ms)
  progressBar: { attrs: { shape: s({ enum: ["bar", "circle", "half"], default: "bar" }), label: s(), value: n({ min: 0, max: 1000000, default: 50 }), max: i({ min: 1, max: 1000000, default: 100 }), showValue: b({ default: true }), prefix: s(), suffix: s(), textPosition: s({ enum: ["above", "inside", "below"], default: "above" }), duration: i({ min: 0, max: 10000, default: 1200 }),
    // 1.28: số chữ thập phân của số hiện, kiểu chạy, tắt hiệu ứng chạy, nhãn đọc màn hình riêng
    decimals: i({ min: 0, max: 2, default: 0 }), easing: s({ enum: ["ease", "linear", "ease-in", "ease-out", "ease-in-out"] }), animate: b({ default: true }), ariaLabel: s() } },
};

/** Tên ô của form: chữ thường, số, gạch dưới — khoá trong bài gửi. */
export const FORM_FIELD_NAME = /^[a-z][a-z0-9_]{0,39}$/;

/** Khối động: nội dung lấy theo ngữ cảnh lúc hiển thị (website, trang, bài trong vòng lặp). */
export const DYNAMIC_NODES = [
  "siteTitle", "siteLogo", "siteTagline", "navigation", "search", "languageSwitcher", "copyright",
  "postTitle", "postContent", "postExcerpt", "featuredImage", "postDate", "postAuthor", "postTerms", "comments", "readMore", "commentsCount", "avatar", "queryTotal", "termList", "pageList", "archives", "loginout",
  "queryTitle", "termDescription", "breadcrumbs", "postNavigation",
  "query", "postTemplate", "pagination", "queryEmpty", "queryFilter", "templatePart", "syncedPattern",
] as const;

export const CORE_MARKS: Record<string, NodeSpec> = {
  bold: {}, italic: {}, underline: {}, strike: {}, code: {}, kbd: {}, footnote: { attrs: { note: s() } }, subscript: {}, superscript: {},
  highlight: { attrs: { color: s() } },
  textStyle: { attrs: { color: s() } },
  link: { attrs: { href: url(), target: s(), rel: s() } },
};

/** Ép giá trị theo mô tả. Trả về undefined = bỏ thuộc tính (dùng mặc định). */
export function coerceAttr(spec: AttrSpec, value: unknown): unknown {
  if (value === null || value === undefined) return undefined;
  let v: unknown = value;
  switch (spec.type) {
    case "string":
    case "url":
      if (typeof v === "number" || typeof v === "boolean") v = String(v);
      if (typeof v !== "string") return undefined;
      break;
    case "number":
    case "integer": {
      const num = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN;
      if (!Number.isFinite(num)) return undefined;
      let x = spec.type === "integer" ? Math.round(num) : num;
      if (spec.min !== undefined) x = Math.max(spec.min, x);
      if (spec.max !== undefined) x = Math.min(spec.max, x);
      v = x;
      break;
    }
    case "boolean":
      if (v === "true") v = true; else if (v === "false") v = false;
      if (typeof v !== "boolean") return undefined;
      break;
    case "json":
      break;
  }
  if (spec.enum && !spec.enum.includes(v)) return undefined;
  if (spec.pattern && (typeof v !== "string" || !new RegExp(spec.pattern).test(v))) return undefined;
  return v;
}

/** Chuẩn hoá bộ thuộc tính: ép kiểu thuộc tính có mô tả, giữ nguyên thuộc tính khác, bỏ null. Rỗng → undefined. */
export function normalizeAttrs(attrs: unknown, spec?: Record<string, AttrSpec>): Record<string, unknown> | undefined {
  if (!attrs || typeof attrs !== "object" || Array.isArray(attrs)) return undefined;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(attrs as Record<string, unknown>)) {
    const v = spec?.[key] ? coerceAttr(spec[key], value) : value === null ? undefined : value;
    if (v !== undefined) out[key] = v;
  }
  return Object.keys(out).length ? out : undefined;
}

/** 1.20: khối có `align: "wide" | "full"` (ảnh có sẵn từ trước, cùng class). Trình soạn hiện nút "Độ rộng" cho các khối này. */
export const WIDE_BLOCKS: readonly string[] = Object.entries(CORE_NODES).filter(([, n]) => n.attrs?.align?.enum?.includes("full")).map(([k]) => k);
