Hướng dẫn Database - TuneVault

1. Vị trí file database
-----------------------
Các file database nằm trong thư mục:

```text
database/
├── schema.sql
└── seed.sql

2. Ý nghĩa từng file
--------------------

schema.sql

File dùng để tạo cấu trúc database, bao gồm:
Bảng
Khóa chính
Khóa ngoại
Ràng buộc dữ liệu
Khi cần tạo lại database từ đầu, chạy file này trước.

seed.sql:

File dùng để thêm dữ liệu mẫu sau khi đã tạo bảng.
Chạy file này sau schema.sql.

3. Thứ tự chạy file
-------------------
Thứ tự đúng:

1. Tạo database TuneVaultDb trong SQL Server
2. Chạy database/schema.sql
3. Chạy database/seed.sql

Không chạy seed.sql trước schema.sql.

4. Danh sách bảng chính
-----------------------
Database hiện có các bảng:

Users
UserProfiles
MediaItems
Playlists
PlaylistTracks
Favorites
PlayHistories
MediaShares
Notifications
Follows

5. Bảng theo từng module
------------------------
Auth/Profile:
Users
UserProfiles

Media:
MediaItems

Playlist/Search/Interaction:
Playlists
PlaylistTracks
Favorites
PlayHistories

Share/Notification:
MediaShares
Notifications

Follow:
Follows

6. Quy định khi sửa database
----------------------------
Không tự ý sửa schema.sql nếu chưa báo leader.

Nếu cần thêm bảng hoặc thêm cột, phải báo trước để tránh ảnh hưởng module khác.

Ví dụ cần báo khi muốn sửa:

- thêm cột vào MediaItems
- đổi tên bảng
- đổi tên cột
- xóa bảng
- thay kiểu dữ liệu
7. Quy định khi code Dapper
---------------------------

Controller không viết SQL trực tiếp.
SQL query đặt trong Repository.
Repository nằm trong TuneVault.Infrastructure.
Interface của Repository nằm trong TuneVault.Application.
Các module dùng chung database schema trong thư mục database/.

8. Lưu ý về dữ liệu mẫu
-----------------------

Các password trong seed.sql hiện chỉ là dữ liệu giữ chỗ.

Ví dụ:

hashed_password_1
hashed_password_2
hashed_password_3

Đây chưa phải mật khẩu hash thật.

Khi làm chức năng Auth, người phụ trách Auth sẽ xử lý hash password thật.

*Lưu ý: tự sửa đường dẫn theo đúng sql trên máy mình
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=TuneVaultDB;Trusted_Connection=True;TrustServerCertificate=True;"
  },
 