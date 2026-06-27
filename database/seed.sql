-- =============================================
-- TuneVault Seed Data
-- Chạy sau khi đã chạy schema.sql
-- =============================================
USE TuneVaultDB;
GO
-- Users mẫu
INSERT INTO Users (Email, PasswordHash, DisplayName)
VALUES
('minh@example.com', 'hashed_password_1', 'Minh'),
('an@example.com', 'hashed_password_2', 'An'),
('bao@example.com', 'hashed_password_3', 'Bao'),
('hau@gmail.com', '$2a$11$azQ3kkkX36.qpfqrEBBWz.gBhAEUvlUWkjFwA.LdPgQeifhviHm96', 'haulai'),
('lai@gmail', '$2a$11$ENix3Q8VA42qrtSV904.MuDIGCigP5z26zaGOeiaNU5abGblZo9A2', 'laihau');
-- UserProfiles mẫu
INSERT INTO UserProfiles (UserId, FullName, Bio, AvatarUrl)
VALUES
(1, N'Lai Minh Hau', N'Người dùng thử nghiệm số 1', NULL),
(2, N'Nguyen Van An', N'Người dùng thử nghiệm số 2', NULL),
(3, N'Tran Quoc Bao', N'Người dùng thử nghiệm số 3', NULL);

-- MediaItems mẫu
INSERT INTO MediaItems (
    OwnerUserId, 
    Title, 
    Artist, 
    Genre,
    Album, 
    Description, 
    MediaType, 
    FilePath, 
    ThumbnailPath, 
    DurationInSeconds, 
    FileSizeInBytes
)
VALUES
-- Thể loại 1: Pop (Audio)
(1, N'Tháng Tư Là Lời Nói Dối Của Em', N'Hà Anh Tuấn', N'Pop', N'Fragile', N'Bản tình ca da diết', 'Audio', 'uploads/audio/dummy.mp3', NULL, 315, 5000000),
(2, N'Chắc Ai Đó Sẽ Về', N'Sơn Tùng M-TP', N'Pop', N'Chàng Trai Năm Ấy (OST)', N'Nhạc pop buồn', 'Audio', 'uploads/audio/dummy.mp3', NULL, 260, 5000000),
(3, N'Chạm Khẽ Tim Anh Một Chút Thôi', N'Noo Phước Thịnh', N'Pop', NULL, N'Ca khúc hit pop', 'Audio', 'uploads/audio/dummy.mp3', NULL, 305, 5000000),
-- Thể loại 2: Chill (Audio)
(1, N'Bước Qua Nhau', N'Vũ.', N'Chill', N'Một Vạn Năm', N'Nhạc buồn nhẹ nhàng', 'Audio', 'uploads/audio/dummy.mp3', NULL, 255, 5000000),
(2, N'Đường Tôi Chở Em Về', N'buitruonglinh', N'Chill', NULL, N'Giai điệu vui tươi', 'Audio', 'uploads/audio/dummy.mp3', NULL, 230, 5000000),
(3, N'Thanh Xuân', N'Da LAB', N'Chill', N'Kết Thúc Bắt Đầu', N'Kỷ niệm tuổi trẻ', 'Audio', 'uploads/audio/dummy.mp3', NULL, 218, 5000000),
-- Thể loại 3: Trữ Tình (Audio)
(1, N'Nơi Đau Muộn Màng', N'Tuấn Ngọc', N'Trữ Tình', NULL, N'Nhạc trữ tình sâu lắng', 'Audio', 'uploads/audio/dummy.mp3', NULL, 280, 5000000),
(2, N'Niệm Khúc Cuối', N'Ngô Thụy Miên', N'Trữ Tình', N'Riêng Một Góc Trời', N'Tình khúc bất hủ', 'Audio', 'uploads/audio/dummy.mp3', NULL, 310, 5000000),
(3, N'Để Nhớ Một Thời Ta Đã Yêu', N'Lệ Quyên', N'Trữ Tình', N'Lệ Quyên Acoustic', N'Nhạc phòng trà', 'Audio', 'uploads/audio/dummy.mp3', NULL, 295, 5000000),
-- Thể loại 4: Lofi (Audio)
(1, N'Bao Tiền Một Mớ Bình Yên', N'14 Casper', N'Lofi', NULL, N'Bản lofi cực chill', 'Audio', 'uploads/audio/dummy.mp3', NULL, 210, 5000000),
(2, N'Có Hẹn Với Thanh Xuân', N'Monstar', N'Lofi', N'Over The Moon', N'Nhạc lofi thư giãn', 'Audio', 'uploads/audio/dummy.mp3', NULL, 190, 5000000),
(3, N'Chìm Sâu', N'RPT MCK', N'Lofi', N'99%', N'Lofi cuốn hút', 'Audio', 'uploads/audio/dummy.mp3', NULL, 175, 5000000),
-- Thể loại 5: Rap (Audio)
(1, N'Trốn Tìm', N'Đen Vâu', N'Rap', N'Trốn Tìm (Single)', N'Rap mộc mạc, ý nghĩa', 'Audio', 'uploads/audio/dummy.mp3', NULL, 212, 5000000),
(2, N'Ngủ Một Mình', N'HIEUTHUHAI', N'Rap', N'Ai Cũng Phải Bắt Đầu Từ Đâu Đó', N'Rap trendy', 'Audio', 'uploads/audio/dummy.mp3', NULL, 185, 5000000),
(3, N'Thu Cuối', N'Yanbi', N'Rap', NULL, N'Bản rap huyền thoại', 'Audio', 'uploads/audio/dummy.mp3', NULL, 245, 5000000),
-- Mix thêm Video để thỏa điều kiện đề bài
(1, N'MV Nơi Đau Muộn Màng', N'Tuấn Ngọc', N'Trữ Tình', NULL, N'Video ca nhạc', 'Video', 'uploads/video/dummy.mp4', NULL, 300, 50000000),
(2, N'Live Concert Truyện Ngắn', N'Hà Anh Tuấn', N'Pop', N'Truyện Ngắn', N'Hòa nhạc trực tiếp', 'Video', 'uploads/video/dummy.mp4', NULL, 3600, 100000000);

-- Playlists mẫu
INSERT INTO Playlists (UserId, Name, Description, IsPublic)
VALUES
(1, N'Nhạc học bài', N'Danh sách nhạc dùng để tập trung học', 1),
(2, N'Video yêu thích', N'Danh sách video hay', 0);

-- PlaylistTracks mẫu
INSERT INTO PlaylistTracks (PlaylistId, MediaItemId, Position)
VALUES
(1, 1, 1),
(1, 2, 2),
(2, 3, 1);

-- Favorites mẫu
INSERT INTO Favorites (UserId, MediaItemId)
VALUES
(1, 2),
(2, 1),
(3, 1);

-- PlayHistories mẫu
INSERT INTO PlayHistories (UserId, MediaItemId, ProgressInSeconds)
VALUES
(1, 1, 45),
(1, 2, 80),
(2, 3, 30);

-- MediaShares mẫu
INSERT INTO MediaShares (SenderUserId, ReceiverUserId, MediaItemId, PlaylistId, Message)
VALUES
(1, 2, 1,NULL, N'Nghe thử bài này nè'),
(2, 3, 3,NULL, N'Video này hay á');

-- Notifications mẫu
INSERT INTO Notifications (UserId, Title, Message, NotificationType, RelatedEntityId, IsRead)
VALUES
(2, N'Bạn có media mới được chia sẻ', N'Minh đã chia sẻ một bài hát cho bạn', 'Share', 1, 0),
(3, N'Bạn có media mới được chia sẻ', N'An đã chia sẻ một video cho bạn', 'Share', 2, 0);

-- Follows mẫu
INSERT INTO Follows (FollowerUserId, FollowingUserId)
VALUES
(1, 2),
(2, 1),
(3, 1);