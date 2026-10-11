# Hợp Việc

MVP website tuyển dụng bằng Next.js 16, React, TypeScript và font Inter được phục vụ từ chính ứng dụng. Giao diện xanh lá nhạt, xanh dương nhạt và trắng, responsive cho điện thoại và máy tính.

## Bản HTML công khai trên GitHub Pages

Thư mục `site/` chứa 17 trang HTML độc lập, CSS, JavaScript và font Inter cục bộ. Nhánh `main` giữ toàn bộ mã nguồn MVP và bản xuất; nhánh `gh-pages` chỉ chứa nội dung `site/` để phục vụ website tĩnh.

Bản HTML là **bản xem trước với dữ liệu minh họa**. Tìm kiếm/bộ lọc, menu mobile, bài khám phá phong cách và hai phần đánh giá chạy trong trình duyệt. Tài khoản, tải CV, đăng tin, lưu hồ sơ và ứng tuyển cần chạy bản MVP có máy chủ; bản HTML không lưu hoặc gửi dữ liệu nhập vào những biểu mẫu này. Thông báo ở đầu mỗi trang giải thích rõ phạm vi này.

Nếu GitHub Pages chưa được bật: vào repo **Settings → Pages**, chọn **Deploy from a branch**, nhánh **gh-pages**, thư mục **/ (root)** rồi **Save**. Địa chỉ dự kiến sau khi GitHub triển khai: `https://thanhlam201.github.io/HR/`. Việc có nhánh HTML không tự chứng minh website đã được xuất bản; kiểm tra trạng thái Pages trước khi chia sẻ.

Để cập nhật bản HTML sau khi sửa giao diện:

```bash
npm ci
npm run export:html
npm run test:html
```

Script xuất tự mở bản production với **database SQLite tạm chỉ có dữ liệu minh họa**, không dùng database phát triển hoặc tài khoản/CV của người dùng. Script yêu cầu Chromium (`CHROMIUM_PATH` nếu không ở `/usr/bin/chromium`). Kiểm thử HTML phục vụ dưới đường dẫn `/HR/` để kiểm tra đúng cấu trúc GitHub Pages. Sau khi commit bản xuất mới, dùng `git subtree split --prefix=site` và đẩy commit trả về lên nhánh `gh-pages` theo cách push thông thường, không force push.

Có thể xem bản tĩnh bằng `python -m http.server --directory site 8080`. Các tương tác JavaScript dùng module nên cần HTTP/HTTPS thay vì mở trực tiếp bằng `file://`.

## Chạy tại máy phát triển

Yêu cầu Node.js **22.13 trở lên** (môi trường này dùng Node 24).

```bash
cd /workspace/HR
npm ci
npm run dev
```

Không cần nhập khóa API để chạy local. SQLite tự tạo tại `.data/hopviec.sqlite`; tài khoản, phiên đăng nhập, tin tuyển dụng, CV và đơn ứng tuyển được lưu qua lần khởi động lại. Không xóa thư mục này nếu muốn giữ dữ liệu. Không đưa `.data` hoặc `.env.local` lên GitHub. Không cần tạo Git worktree cho các task trong môi trường cloud đã được cô lập.

## Những luồng đã xây dựng

- Trang chủ, danh sách việc làm với tìm kiếm không phân biệt dấu, bộ lọc và sắp xếp lương.
- Đăng ký/đăng nhập tài khoản ứng viên hoặc nhà tuyển dụng, đăng xuất; mật khẩu hash bằng scrypt và cookie phiên HttpOnly.
- Nhà tuyển dụng đăng/đóng/mở tin, nhận CV và cập nhật trạng thái đơn; liên hệ ứng viên qua email bằng ứng dụng email của họ.
- Ứng viên lưu việc, cập nhật hồ sơ, tải CV PDF tối đa 2 MB, tạo bản CV để in/lưu PDF, gửi đơn và theo dõi trạng thái.
- CV và thông tin nghề nghiệp được chụp lại lúc ứng tuyển. Thay/xóa CV hiện tại không thay đổi bản đã gửi. Nhà tuyển dụng chỉ được tải CV của đơn gửi cho mình.
- Phù hợp nghề nghiệp: 60 điểm theo tỷ lệ kỹ năng trùng tên, 25 điểm cùng phong cách, 15 điểm cùng địa điểm hoặc tin Remote. Đây là phép đối chiếu minh bạch, không phải mô hình dự đoán hiệu suất. Bốn câu hỏi về sở thích làm việc không phải trắc nghiệm tâm lý chuẩn hóa.
- Phong thủy: mục tự nguyện riêng cho cung hoàng đạo và ngũ hành nạp âm, tính ở trình duyệt; ngày sinh không gửi API, không lưu hồ sơ và không tham gia điểm nghề nghiệp. Người dùng tự nhập năm âm lịch; không tự chuyển lịch hoặc lập lá số tử vi đầy đủ.

Tám tin tuyển dụng **minh họa** xuất hiện khi khởi tạo database local. Tin được đánh dấu rõ và không đại diện doanh nghiệp/vị trí thật. Đơn gửi vào tin mẫu chỉ được lưu để trải nghiệm; không có doanh nghiệp bên ngoài nhận đơn. Bạn có thể tạo hai tài khoản riêng để thử toàn bộ luồng tuyển dụng thật trong hệ thống. Không có tài khoản demo với mật khẩu công khai.

## Kiểm thử

```bash
npm run test        # thuật toán điểm phù hợp, ngày sinh, nạp âm, phong cách
npm run typecheck
npm run build
npm run test:e2e    # Chromium và server kiểm thử riêng ở cổng 3100
```

Playwright mặc định dùng `/usr/bin/chromium` trong môi trường cloud. Ở máy khác, đặt `CHROMIUM_PATH` tới trình duyệt Chromium đã cài. Test tạo SQLite riêng dưới `.data/e2e-*.sqlite`, không thay đổi database phát triển. Test gồm đăng ký hai vai trò, đăng việc, tạo hồ sơ, tải CV, lưu việc, ứng tuyển, nhận đơn, cập nhật trạng thái, quyền tải CV, chống ứng tuyển trùng, kiểm tra đầu vào, tìm kiếm, công cụ và bố cục mobile. Screenshot được ghi vào `test-results` (đã gitignore).

## Triển khai: GitHub + Vercel + Supabase PostgreSQL

GitHub lưu mã nguồn; Vercel chạy Next.js; Supabase cung cấp PostgreSQL. Bản này sử dụng xác thực của ứng dụng và kết nối PostgreSQL qua `pg`, không sử dụng Supabase Auth.

1. Đưa mã nguồn lên repo GitHub và import repo vào Vercel; Framework Preset chọn Next.js, Node.js chọn 24.x, root directory là thư mục có `package.json`.
2. Tạo database Supabase. Trong Vercel Environment Variables, nhập `DATABASE_URL` bằng connection string PostgreSQL dùng transaction pooler nếu triển khai serverless; sử dụng tài khoản database dành cho ứng dụng. **Chỉ nhập giá trị bí mật trong phần cấu hình bảo mật, không gửi trong chat hoặc commit vào repo.**
3. Bật TLS có xác minh chứng chỉ theo hướng dẫn của nhà cung cấp; có thể đặt `PG_TLS=true` và dùng connection string không có tùy chọn ghi đè SSL. Không dùng `sslmode=no-verify` hoặc `rejectUnauthorized=false`. Nếu nhà cung cấp yêu cầu CA riêng, cấu hình trust bằng chứng chỉ CA chính thức.
4. Đặt `SEED_DEMO=false` **trước lần khởi tạo database production đầu tiên**. Cờ này không xóa những tin mẫu đã có. Dùng database production riêng với dữ liệu test.
5. Build command: `npm run build`. Các bảng tự tạo qua câu lệnh `CREATE TABLE IF NOT EXISTS` khi API đầu tiên được gọi; tài khoản kết nối cần quyền tạo bảng cho lần khởi tạo. Nên chuyển sang migration và tách quyền DDL khi phát triển tiếp.
6. Sau khi triển khai, thử bằng hai tài khoản mới: đăng tin → bổ sung hồ sơ/CV → ứng tuyển → nhà tuyển dụng tải CV và đổi trạng thái. Xác minh dữ liệu còn tồn tại sau redeploy.

Không dùng SQLite trên Vercel: filesystem serverless không đảm bảo lưu dữ liệu. Ứng dụng chủ động báo lỗi nếu chạy trong Vercel mà chưa có `DATABASE_URL`. Nếu tự host bằng `npm run build` và `npm start`, SQLite cần ổ đĩa bền vững; production phải dùng HTTPS vì cookie phiên có cờ Secure.

Kết nối Supabase/Vercel và PostgreSQL production cần thông tin cấu hình của chủ sở hữu; chưa được kiểm thử nếu chưa cung cấp kết nối. Luồng SQLite local và bản build được kiểm thử riêng.

## Phạm vi MVP và bước phát triển tiếp

Hiện chưa có xác minh email, quên mật khẩu, đăng nhập mạng xã hội, thông báo email tự động, lịch phỏng vấn, kiểm duyệt tin/doanh nghiệp, thanh toán hoặc trang quản trị. Nhà tuyển dụng cập nhật trạng thái “Mời phỏng vấn” và chủ động liên hệ ứng viên; hệ thống chưa tự gửi thư hay tạo lịch.

Trước khi mở rộng sử dụng công khai, bổ sung xác minh email/khôi phục tài khoản, quy trình kiểm duyệt doanh nghiệp, chính sách lưu/xóa dữ liệu, backup và giám sát. CV được lưu trong database để đơn giản hóa MVP; khi số lượng lớn, chuyển sang kho object riêng tư, kiểm tra file và URL tải có thời hạn. Thêm phân trang/tìm kiếm database khi số lượng tin tăng.

## Cấu trúc

- `src/app`: routes, giao diện toàn cục và API.
- `src/components`: giao diện các trang, hồ sơ/tuyển dụng và công cụ khám phá.
- `src/lib/db.ts`: SQLite local / PostgreSQL theo `DATABASE_URL`, schema và dữ liệu minh họa.
- `src/lib/auth.ts`: mật khẩu và phiên đăng nhập.
- `src/lib/matching.ts`: các phép đối chiếu được kiểm thử.
- `.env.example`: các tùy chọn cấu hình, không chứa bí mật.
