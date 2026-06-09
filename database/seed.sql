-- =============================================
-- TuneVault Seed Data
-- Chạy sau khi đã chạy schema.sql
-- =============================================

-- Users mẫu
INSERT INTO Users (Email, PasswordHash, DisplayName)
VALUES
('minh@example.com', 'hashed_password_1', 'Minh'),
('an@example.com', 'hashed_password_2', 'An'),
('bao@example.com', 'hashed_password_3', 'Bao');

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
    Description,
    MediaType,
    FilePath,
    ThumbnailPath,
    DurationInSeconds,
    FileSizeInBytes
)
VALUES
(1, N'Chill Song Demo', N'Bài nhạc mẫu để test audio player', 'Audio', 'uploads/audio/chill-song-demo.mp3', NULL, 180, 5000000),
(1, N'Lo-fi Study Demo', N'Bài nhạc mẫu để test danh sách media', 'Audio', 'uploads/audio/lofi-study-demo.mp3', NULL, 210, 6200000),
(2, N'Travel Video Demo', N'Video mẫu để test video player', 'Video', 'uploads/video/travel-video-demo.mp4', NULL, 120, 15000000);

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
INSERT INTO MediaShares (SenderUserId, ReceiverUserId, MediaItemId, Message)
VALUES
(1, 2, 1, N'Nghe thử bài này nè'),
(2, 3, 3, N'Video này hay á');

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