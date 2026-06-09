---------- Tổng quan workflow Clean Architecture của TuneVault --------------

Project mình đi theo luồng:

Frontend / Swagger / Postman
        ↓
Controller
Nhận request, validate cơ bản, gọi Service
        ↓
Service
Xử lý logic nghiệp vụ
        ↓
Repository Interface
Khai báo các thao tác cần với database
        ↓
Repository Implementation
Viết SQL Dapper thật
        ↓
Dapper
Thực thi SQL query
        ↓
SQL Server
Lưu dữ liệu

Controller → Service → Repository → Database

-------------------------------------
1. Các project trong backend chứa gì?
-------------------------------------

TuneVault.Domain

Chứa các class cốt lõi của hệ thống, thường tương ứng với bảng database.

Ví dụ:

Entities/
├── User.cs
├── UserProfile.cs
├── MediaItem.cs
├── Playlist.cs
├── PlaylistTrack.cs
├── MediaShare.cs
├── Notification.cs
├── Favorite.cs
├── PlayHistory.cs
└── Follow.cs

Nhiệm vụ:

- Đại diện dữ liệu lõi
- Không viết SQL
- Không gọi API
- Không phụ thuộc Dapper, SQL Server, Controller

Hiểu đơn giản:

Domain = hệ thống có những “đối tượng” gì.

TuneVault.Application

Chứa logic nghiệp vụ và các “hợp đồng” cần dùng.

Interfaces/
├── IDbConnectionFactory.cs
├── IUserRepository.cs
├── IMediaRepository.cs
├── IPlaylistRepository.cs
├── IShareRepository.cs
├── INotificationRepository.cs
├── IFavoriteRepository.cs
├── IHistoryRepository.cs
└── IFollowRepository.cs

Services/
├── AuthService.cs
├── UserService.cs
├── MediaService.cs
├── PlaylistService.cs
├── ShareService.cs
├── NotificationService.cs
├── FavoriteService.cs
├── HistoryService.cs
└── FollowService.cs

DTOs/
├── Auth/
├── Users/
├── Media/
├── Playlists/
├── Shares/
├── Notifications/
├── Favorites/
└── Histories/

Nhiệm vụ:

- Service xử lý logic chính
- Interface khai báo Repository cần có hàm gì
- DTO định nghĩa dữ liệu request/response cho API
- Không viết SQL trực tiếp

Hiểu đơn giản:

Application = hệ thống làm được những chức năng gì.

Ví dụ Share Media:

ShareService:
- Kiểm tra media có tồn tại không
- Kiểm tra người nhận có tồn tại không
- Tạo share
- Tạo notification
- Trả kết quả

TuneVault.Infrastructure

Chứa code kỹ thuật thật.

Data/
└── SqlConnectionFactory.cs

Repositories/
├── UserRepository.cs
├── MediaRepository.cs
├── PlaylistRepository.cs
├── ShareRepository.cs
├── NotificationRepository.cs
├── FavoriteRepository.cs
├── HistoryRepository.cs
└── FollowRepository.cs

Nhiệm vụ:

- Kết nối SQL Server
- Viết SQL Dapper
- Implement các interface bên Application
- Làm việc trực tiếp với database

Hiểu đơn giản:

Infrastructure = làm bằng công nghệ gì.

Ví dụ:

IMediaRepository nằm ở Application
MediaRepository nằm ở Infrastructure
MediaRepository dùng Dapper để query bảng MediaItems
TuneVault.API

Chứa phần chạy web API.

Controllers/
├── AuthController.cs
├── UsersController.cs
├── MediaController.cs
├── PlaylistsController.cs
├── SharesController.cs
├── NotificationsController.cs
├── FavoritesController.cs
├── HistoriesController.cs
└── FollowsController.cs

Program.cs
appsettings.json

Nhiệm vụ:

- Nhận request từ frontend/Postman/Swagger
- Gọi Service bên Application
- Trả response JSON
- Cấu hình Swagger
- Cấu hình Dependency Injection
- Cấu hình connection string
- Cấu hình JWT/CORS sau này

Hiểu đơn giản:

API = người ngoài gọi vào bằng đường nào.

2. Luồng code chuẩn cho một chức năng

Ví dụ chức năng lấy danh sách media:

GET /api/media
        ↓
MediaController.GetAll()
        ↓
MediaService.GetAllAsync()
        ↓
IMediaRepository.GetAllAsync()
        ↓
MediaRepository dùng Dapper
        ↓
SELECT ... FROM MediaItems
        ↓
SQL Server trả dữ liệu
        ↓
Controller trả JSON cho frontend

Quy tắc:

Controller không viết SQL
Repository không xử lý logic nghiệp vụ phức tạp
Service không biết chi tiết SQL
Domain không phụ thuộc tầng nào

-----------------------
3. Phân công thành viên
-----------------------

Leader + Database + Dapper nền

Phụ trách chính:

- database/schema.sql
- database/seed.sql
- docs/DATABASE_GUIDE.md
- IDbConnectionFactory
- SqlConnectionFactory
- Cấu hình connection string
- Kiểm tra Dapper kết nối được SQL Server
- Tạo skeleton module cho nhóm

Bạn A — Auth/Profile

Phụ trách:

- Đăng ký
- Đăng nhập
- JWT token
- Lấy thông tin user hiện tại
- Cập nhật profile

Files chính:

backend/TuneVault.API/Controllers/AuthController.cs
backend/TuneVault.API/Controllers/UsersController.cs

backend/TuneVault.Application/Services/AuthService.cs
backend/TuneVault.Application/Services/UserService.cs
backend/TuneVault.Application/Interfaces/IUserRepository.cs
backend/TuneVault.Application/DTOs/Auth/
backend/TuneVault.Application/DTOs/Users/

backend/TuneVault.Infrastructure/Repositories/UserRepository.cs

backend/TuneVault.Domain/Entities/User.cs
backend/TuneVault.Domain/Entities/UserProfile.cs

Database dùng:

Users
UserProfiles

API dự kiến:

POST /api/auth/register
POST /api/auth/login
GET  /api/users/me
PUT  /api/users/me

Checklist cho bạn A:

[ ] Tạo DTO RegisterRequest, LoginRequest, LoginResponse
[ ] Hoàn thiện User entity, UserProfile entity
[ ] Khai báo IUserRepository
[ ] Viết UserRepository bằng Dapper
[ ] Viết AuthService/UserService
[ ] Viết AuthController/UsersController
[ ] Đăng ký DI trong Program.cs
[ ] Test Swagger

Bạn B — Media Upload/Streaming

Phụ trách:

- Upload audio/video
- Lưu file local
- Lưu metadata vào database
- Lấy danh sách media
- Lấy chi tiết media
- Stream audio/video

Files chính:

backend/TuneVault.API/Controllers/MediaController.cs

backend/TuneVault.Application/Services/MediaService.cs
backend/TuneVault.Application/Interfaces/IMediaRepository.cs
backend/TuneVault.Application/DTOs/Media/

backend/TuneVault.Infrastructure/Repositories/MediaRepository.cs

backend/TuneVault.Domain/Entities/MediaItem.cs

Database dùng:

MediaItems
Users

API dự kiến:

POST /api/media/upload
GET  /api/media
GET  /api/media/{id}
GET  /api/media/{id}/stream
GET  /api/media/search?keyword=

Checklist cho bạn B:

[ ] Tạo DTO UploadMediaRequest, MediaResponse
[ ] Hoàn thiện MediaItem entity
[ ] Khai báo IMediaRepository
[ ] Viết MediaRepository bằng Dapper
[ ] Viết MediaService
[ ] Viết MediaController
[ ] Test upload/list/stream bằng Swagger

Bạn C — Playlist/Search/Interaction

Phụ trách:

- Playlist
- Thêm/xóa media khỏi playlist
- Favorite/unfavorite
- Lịch sử nghe/xem
- Search nếu nhóm vẫn giữ theo phân công cũ

Files chính:

backend/TuneVault.API/Controllers/PlaylistsController.cs
backend/TuneVault.API/Controllers/FavoritesController.cs
backend/TuneVault.API/Controllers/HistoriesController.cs

backend/TuneVault.Application/Services/PlaylistService.cs
backend/TuneVault.Application/Services/FavoriteService.cs
backend/TuneVault.Application/Services/HistoryService.cs

backend/TuneVault.Application/Interfaces/IPlaylistRepository.cs
backend/TuneVault.Application/Interfaces/IFavoriteRepository.cs
backend/TuneVault.Application/Interfaces/IHistoryRepository.cs

backend/TuneVault.Application/DTOs/Playlists/
backend/TuneVault.Application/DTOs/Favorites/
backend/TuneVault.Application/DTOs/Histories/

backend/TuneVault.Infrastructure/Repositories/PlaylistRepository.cs
backend/TuneVault.Infrastructure/Repositories/FavoriteRepository.cs
backend/TuneVault.Infrastructure/Repositories/HistoryRepository.cs

backend/TuneVault.Domain/Entities/Playlist.cs
backend/TuneVault.Domain/Entities/PlaylistTrack.cs
backend/TuneVault.Domain/Entities/Favorite.cs
backend/TuneVault.Domain/Entities/PlayHistory.cs

Database dùng:

Playlists
PlaylistTracks
Favorites
PlayHistories
MediaItems
Users

API dự kiến:

POST   /api/playlists
GET    /api/playlists/{id}
POST   /api/playlists/{id}/tracks
DELETE /api/playlists/{id}/tracks/{mediaId}

POST   /api/favorites/{mediaId}
DELETE /api/favorites/{mediaId}

POST   /api/histories/{mediaId}
GET    /api/histories/recent

Checklist cho bạn C:

[ ] Làm playlist trước
[ ] Sau đó làm favorite
[ ] Sau đó làm history
[ ] Test Swagger từng API

Bạn D — Share/Notification/SignalR

Phụ trách:

- Share media cho user khác
- Xem media được chia sẻ với mình
- Xem media mình đã chia sẻ
- Tạo notification khi share
- Xem danh sách notification
- Đánh dấu đã đọc
- SignalR realtime nếu kịp

Files chính:

backend/TuneVault.API/Controllers/SharesController.cs
backend/TuneVault.API/Controllers/NotificationsController.cs

backend/TuneVault.Application/Services/ShareService.cs
backend/TuneVault.Application/Services/NotificationService.cs

backend/TuneVault.Application/Interfaces/IShareRepository.cs
backend/TuneVault.Application/Interfaces/INotificationRepository.cs

backend/TuneVault.Application/DTOs/Shares/
backend/TuneVault.Application/DTOs/Notifications/

backend/TuneVault.Infrastructure/Repositories/ShareRepository.cs
backend/TuneVault.Infrastructure/Repositories/NotificationRepository.cs

backend/TuneVault.Domain/Entities/MediaShare.cs
backend/TuneVault.Domain/Entities/Notification.cs

Database dùng:

MediaShares
Notifications
Users
MediaItems

API dự kiến:

POST /api/shares
GET  /api/shares/with-me
GET  /api/shares/by-me

GET  /api/notifications
PUT  /api/notifications/{id}/read

Phụ trách:

- React + TypeScript
- Layout kiểu Spotify
- Routing
- Axios/fetch service
- Login/Register UI
- Home/Library/Search UI
- Player bar
- Gọi API backend

Routes dự kiến:

/login
/register
/home
/library
/search
/playlists/:id
/share
/notifications
/profile

Checklist cho bạn E:

[ ] Setup React + TypeScript
[ ] Tạo layout sidebar/main/player
[ ] Tạo routing
[ ] Tạo API service
[ ] Làm login/register UI
[ ] Làm home/library/media list
[ ] Làm player audio/video
[ ] Tích hợp API từ backend

Frontend không cần chờ backend 100%. Có thể dùng dữ liệu giả trước, sau đó thay bằng API thật.

---------------------------
4. Quy tắc code cho cả nhóm
---------------------------

1. Không viết SQL trong Controller.
2. Không xử lý logic dài trong Controller.
3. Controller chỉ nhận request và trả response.
4. Service xử lý logic nghiệp vụ.
5. Repository chỉ query database bằng Dapper.
6. Interface Repository đặt trong Application.
7. Repository thật đặt trong Infrastructure.
8. DTO đặt trong Application/DTOs.
9. Entity đặt trong Domain/Entities.
10. Muốn sửa database/schema.sql phải báo leader trước.

-----------------------
5. Cách dùng Git hợp lý
-----------------------

Nguyên tắc chính
1. Không push trực tiếp lên main.
2. Mỗi người làm trên branch riêng.
3. Một module hoặc một task = một branch.
4. Làm xong thì push branch lên GitHub.
5. Tạo Pull Request.
6. Leader review rồi mới merge vào main.
7. Merge xong thì xóa branch cũ.