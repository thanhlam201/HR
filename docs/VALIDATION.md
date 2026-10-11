# Kiểm chứng MVP

Đã chạy trong môi trường cloud với Node 24, SQLite và Chromium:

- `npm ci`: cài lại từ lockfile thành công.
- `npm run build`: build production thành công.
- `npm run typecheck`: không có lỗi TypeScript.
- `npm run test`: 5/5 kiểm thử thuật toán thành công.
- `npm run test:e2e`: 3/3 kịch bản trình duyệt thành công; không có test bị bỏ qua.
- `npm audit --omit=dev`: không phát hiện lỗ hổng ở các dependency runtime theo cơ sở dữ liệu npm tại thời điểm kiểm tra.

Kịch bản xuyên suốt tạo tài khoản tuyển dụng và ứng viên, đăng việc, tạo hồ sơ, tải PDF, lưu việc, ứng tuyển, tải CV từ tài khoản nhà tuyển dụng, đổi trạng thái và kiểm tra phân quyền. Kịch bản bổ sung kiểm tra dữ liệu không hợp lệ, chống yêu cầu khác nguồn, đăng xuất, tìm kiếm, công cụ khám phá và menu/bố cục ở chiều rộng 390px.

Đã tắt server test và mở bản production bằng `npm start` với cùng file SQLite: đăng nhập vẫn hoạt động, đơn và trạng thái “Mời phỏng vấn” được giữ lại, CV đã gửi tải được sau khi CV hiện tại bị xóa. Trang tạo CV in được thành PDF bằng Chromium. Bản production không phát sinh lỗi JavaScript trong luồng kiểm tra này.

Kết nối PostgreSQL/Supabase và triển khai công khai Vercel chưa được kiểm chứng vì chưa có cấu hình của chủ sở hữu. Không có dữ liệu hay thư ứng tuyển nào được gửi tới doanh nghiệp thật trong các bài kiểm tra.
