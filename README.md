# TuneVault

TuneVault là bài tập lớn môn C# and .NET Development.

Ứng dụng mô phỏng nền tảng nghe nhạc và xem video trực tuyến, có giao diện tham khảo kiểu Spotify.

## Công nghệ sử dụng

**Frontend**
* React
* TypeScript
* Vite
* React Router
* Axios
* SignalR Client

**Backend**
* ASP.NET Core 8 Web API
* Clean Architecture
* Dapper
* SQL Server
* JWT Authentication
* Swagger/OpenAPI
* SignalR

## Cấu trúc thư mục

```text
TuneVault/
├── backend/
│   ├── TuneVault.API/
│   ├── TuneVault.Application/
│   ├── TuneVault.Domain/
│   ├── TuneVault.Infrastructure/
│   └── TuneVault.slnx
├── database/
│   ├── schema.sql
│   └── seed.sql
├── docs/
│   ├── diagrams/
│   ├── postman/
│   └── Module_Assignment.md
├── frontend/
│   ├── public/
│   ├── src/
│   └── ...
└── README.md
Hướng dẫn chạy LocalĐể chạy dự án TuneVault trên môi trường local, bạn cần thực hiện các bước sau:1. Cài đặt và cấu hình Database (SQL Server)Cài đặt SQL Server: Đảm bảo bạn đã cài đặt SQL Server (ví dụ: SQL Server Express) trên máy tính của mình.Tạo Database: Mở SQL Server Management Studio (SSMS) hoặc Azure Data Studio và tạo một database mới với tên TuneVaultDB.Chạy Schema và Seed Data:Mở file database/schema.sql và thực thi các câu lệnh để tạo cấu trúc bảng cho TuneVaultDB.Sau đó, mở file database/seed.sql và thực thi các câu lệnh để thêm dữ liệu mẫu vào database.Connection String: Connection string mặc định được cấu hình trong backend/TuneVault.API/appsettings.json là:"DefaultConnection": "Your_Database;Trusted_Connection=True;TrustServerCertificate=True;"Nếu SQL Server của bạn có tên instance khác hoặc yêu cầu xác thực bằng tài khoản, hãy cập nhật Server và Trusted_Connection (hoặc thêm User ID và Password) cho phù hợp.2. Chạy Backend (ASP.NET Core Web API)Mở Solution: Mở file TuneVault.slnx trong thư mục backend/ bằng Visual Studio (hoặc Visual Studio Code với các extension cần thiết).Build Dự án: Build toàn bộ solution để đảm bảo không có lỗi biên dịch.Chạy API: Chạy dự án TuneVault.API. Mặc định, API sẽ chạy trên https://localhost:7000 (hoặc một cổng khác được cấu hình trong launchSettings.json).Swagger UI sẽ tự động mở tại https://localhost:7000/swagger để bạn có thể kiểm tra các endpoint API.3. Chạy Frontend (React App)Mở Terminal: Mở một cửa sổ terminal hoặc command prompt và điều hướng đến thư mục frontend/.Cài đặt Dependencies: Chạy lệnh sau để cài đặt các gói thư viện cần thiết:Bashnpm install
# hoặc
yarn install
Chạy Frontend: Chạy lệnh sau để khởi động ứng dụng React:Bashnpm run dev
# hoặc
yarn dev
Ứng dụng frontend sẽ chạy trên http://localhost:5173 (hoặc một cổng khác). Trình duyệt sẽ tự động mở và hiển thị giao diện người dùng.Tài khoản Seed (Tài khoản mẫu)Sau khi chạy database/seed.sql, bạn có thể sử dụng các tài khoản sau để đăng nhập và kiểm tra chức năng:EmailPasswordhau@gmail.com123lai@gmail.com123Lưu ý: PasswordHash là giá trị đã được hash. Trong môi trường thực tế, bạn sẽ cần một cơ chế đăng ký/đăng nhập để tạo mật khẩu mới. Đối với mục đích kiểm thử, bạn có thể tạo tài khoản mới qua API hoặc cập nhật trực tiếp trong database nếu cần.ERD và Sơ đồ PipelineERD (Entity-Relationship Diagram): Xem file erd.png trong thư mục gốc của dự án.Sơ đồ Pipeline Kiến trúc: Xem file pipeline.png trong thư mục gốc của dự án.Postman CollectionPostman Collection cho các API của dự án có thể được tìm thấy trong thư mục docs/postman/. Bạn có thể import file này vào Postman để kiểm tra các endpoint API một cách dễ dàng.
