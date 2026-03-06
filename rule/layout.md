Bạn là một chuyên gia Frontend Developer. Khi phát triển các tính năng và giao diện cho dự án ReactJS (TypeScript) này, hãy tuân thủ NGHIÊM NGẶT các quy tắc (rules) sau đây dựa trên cấu hình hiện tại của hệ thống:

### 1. Quy tắc về CSS và Theming (Hệ thống màu & component cơ bản):
- **Sử dụng CSS Variables:** Mọi màu sắc, padding, radius, shadow phải ưu tiên sử dụng biến CSS được định nghĩa trong [globals.css](cci:7://file:///e:/MyProjects/MyWallet_FE/src/styles/globals.css:0:0-0:0) (ví dụ: `var(--color-bg)`, `var(--color-primary)`, `var(--radius-md)`) thông qua Tailwind Classes.
- **Tuân thủ cấu hình Tailwind ([tailwind.config.js](cci:7://file:///e:/MyProjects/MyWallet_FE/tailwind.config.js:0:0-0:0)):** 
  - Màu nền: Dùng `bg-bg`, `text-text`, `bg-primary`, `text-primary`.
  - Border radius: Đã cấu hình `DEFAULT` là 8px, dùng các class `rounded`, custom max-width (ví dụ: `max-w-modal-md`).
  - Font chữ: Dùng font `font-primary` (Inter) làm mặc định.
- **Sử dụng Globals CSS Classes:** Dự án CÓ SẴN các class được định nghĩa sẵn, tuyệt đối tái sử dụng chúng thay vì viết lại Tailwind utility dài dòng:
  - Button: Dùng class `.btn` kèm theo `.btn-primary`, `.btn-outline`, `.btn-danger`.
  - Layout wrapper: Dùng class `.page-container` cho trang chính.
  - Vùng chứa nội dung / thẻ: Dùng class `.card`.
  - Input: Dùng class `.input` cho các ô text/nhập liệu.
  - Table: Dùng class `.table` cho danh sách dữ liệu.
  - Modal: Kết hợp `.modal-overlay` và `.modal-content` cùng với các animation (`.fade-in`).

### 2. Quy tắc về Layout & Component:
- **Cấu trúc Layout chính:** Bất kỳ layout nào ([PublicLayout](cci:1://file:///e:/MyProjects/MyWallet_FE/src/layouts/PublicLayout.tsx:10:0-152:2), [AdminLayout](cci:1://file:///e:/MyProjects/MyWallet_FE/src/layouts/AdminLayout.tsx:8:0-133:2), [UserLayout](cci:1://file:///e:/MyProjects/MyWallet_FE/src/layouts/UserLayout.tsx:8:0-131:2)) đều cần phải tuân theo khung sườn Flexbox chiều dọc:
  - Thẻ bao ngoài cùng: `min-h-screen flex flex-col`.
  - `<header>` để chứa thanh điều hướng và thông tin User (Profile menu).
  - `<main>` phải có `flex: 1` hoặc class `flex-1` và chứa `<Outlet />` ở trung tâm.
  - `<footer>` nằm dưới cùng của trang.
- **UI Element:**
  - Nút bấm: Luôn cố gắng sử dụng component custom `<Button />` (nằm ở `../components/UICustoms/Button`) khi có thể.
  - Icon: Sử dụng thư viện `lucide-react` (ví dụ: `Bell`, `ChevronDown`, `LogOut`, `UserIcon`).
  - Thông báo: Sử dụng `toast` từ thư viện `react-toastify` cho các thông báo tĩnh (Success, Error, Info).

### 3. State & Authentication UI (Giao diện người dùng đã đăng nhập):
- Kiểm tra trạng thái Authenticate thông qua Custom Hook (`useAuth` / `useAuthContext`) hoặc Redux (`useAppSelector`).
- Menu người dùng: 
  - Khi có user, hiển thị Avatar (`user.pictureUrl`).
  - Nếu không có avatar, HIỂN THỊ INITIALS (chữ cái đầu của tên), ví dụ: `user.fullName` là "Nguyen Van A" thì hiển thị "NV".
  - Menu Profile xổ xuống (Dropdown) phải bắt sự kiện "Click outside" (nhấn ra ngoài để đóng menu) thông qua `useRef` và `mousedown` event trong `useEffect`.

### 4. Quy định về Code Style:
- **KHÔNG LẠM DỤNG Inline Style:** Hiện tại các layouts (VD: AdmintLayout, UserLayout) đang có một vài chỗ xài `style={{...}}`. TRÁNH làm điều này ở các component tạo mới, hãy ưu tiên chuyển thẳng sang Tailwind block (VD: `min-h-screen flex flex-col justify-between`).
- Viết code sạch, chia nhỏ React Fragment / Region comment (`//#region`) để quản lý logic rõ ràng.
