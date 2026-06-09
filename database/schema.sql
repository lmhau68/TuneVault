-- =============================================
-- TuneVault Database Schema
-- =============================================

-- Xóa bảng cũ nếu cần chạy lại script
DROP TABLE IF EXISTS Follows;
DROP TABLE IF EXISTS PlayHistories;
DROP TABLE IF EXISTS Favorites;
DROP TABLE IF EXISTS Notifications;
DROP TABLE IF EXISTS MediaShares;
DROP TABLE IF EXISTS PlaylistTracks;
DROP TABLE IF EXISTS Playlists;
DROP TABLE IF EXISTS MediaItems;
DROP TABLE IF EXISTS UserProfiles;
DROP TABLE IF EXISTS Users;

-- =============================================
-- 1. Users
-- Lưu thông tin tài khoản đăng nhập
-- =============================================
CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,

    Email NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(500) NOT NULL,

    DisplayName NVARCHAR(100) NOT NULL,

    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NULL
);

-- =============================================
-- 2. UserProfiles
-- Lưu thông tin hồ sơ người dùng
-- =============================================
CREATE TABLE UserProfiles (
    Id INT IDENTITY(1,1) PRIMARY KEY,

    UserId INT NOT NULL UNIQUE,
    FullName NVARCHAR(150) NULL,
    Bio NVARCHAR(500) NULL,
    AvatarUrl NVARCHAR(500) NULL,

    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NULL,

    CONSTRAINT FK_UserProfiles_Users
        FOREIGN KEY (UserId) REFERENCES Users(Id)
        ON DELETE CASCADE
);

-- =============================================
-- 3. MediaItems
-- Lưu thông tin bài hát / video
-- =============================================
CREATE TABLE MediaItems (
    Id INT IDENTITY(1,1) PRIMARY KEY,

    OwnerUserId INT NOT NULL,

    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(1000) NULL,

    MediaType NVARCHAR(20) NOT NULL, -- Audio hoặc Video

    FilePath NVARCHAR(500) NOT NULL,
    ThumbnailPath NVARCHAR(500) NULL,

    DurationInSeconds INT NULL,
    FileSizeInBytes BIGINT NULL,

    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NULL,

    CONSTRAINT FK_MediaItems_Users
        FOREIGN KEY (OwnerUserId) REFERENCES Users(Id)
        ON DELETE CASCADE,

    CONSTRAINT CK_MediaItems_MediaType
        CHECK (MediaType IN ('Audio', 'Video'))
);
-- =============================================
-- 4. Playlists
-- Lưu danh sách phát của người dùng
-- =============================================
CREATE TABLE Playlists (
    Id INT IDENTITY(1,1) PRIMARY KEY,

    UserId INT NOT NULL,

    Name NVARCHAR(200) NOT NULL,
    Description NVARCHAR(1000) NULL,
    CoverImagePath NVARCHAR(500) NULL,

    IsPublic BIT NOT NULL DEFAULT 0,

    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NULL,

    CONSTRAINT FK_Playlists_Users
        FOREIGN KEY (UserId) REFERENCES Users(Id)
        ON DELETE CASCADE
);

-- =============================================
-- 5. PlaylistTracks
-- Lưu media nào nằm trong playlist nào
-- =============================================
CREATE TABLE PlaylistTracks (
    Id INT IDENTITY(1,1) PRIMARY KEY,

    PlaylistId INT NOT NULL,
    MediaItemId INT NOT NULL,

    Position INT NOT NULL DEFAULT 0,

    AddedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_PlaylistTracks_Playlists
        FOREIGN KEY (PlaylistId) REFERENCES Playlists(Id)
        ON DELETE CASCADE,

    CONSTRAINT FK_PlaylistTracks_MediaItems
        FOREIGN KEY (MediaItemId) REFERENCES MediaItems(Id)
        ON DELETE NO ACTION,

    CONSTRAINT UQ_PlaylistTracks_Playlist_Media
        UNIQUE (PlaylistId, MediaItemId)
);

-- =============================================
-- 6. Favorites
-- Lưu media yêu thích của người dùng
-- =============================================
CREATE TABLE Favorites (
    Id INT IDENTITY(1,1) PRIMARY KEY,

    UserId INT NOT NULL,
    MediaItemId INT NOT NULL,

    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_Favorites_Users
        FOREIGN KEY (UserId) REFERENCES Users(Id)
        ON DELETE CASCADE,

    CONSTRAINT FK_Favorites_MediaItems
        FOREIGN KEY (MediaItemId) REFERENCES MediaItems(Id)
        ON DELETE NO ACTION,

    CONSTRAINT UQ_Favorites_User_Media
        UNIQUE (UserId, MediaItemId)
);

-- =============================================
-- 7. PlayHistories
-- Lưu lịch sử nghe / xem media
-- =============================================
CREATE TABLE PlayHistories (
    Id INT IDENTITY(1,1) PRIMARY KEY,

    UserId INT NOT NULL,
    MediaItemId INT NOT NULL,

    PlayedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    ProgressInSeconds INT NULL,

    CONSTRAINT FK_PlayHistories_Users
        FOREIGN KEY (UserId) REFERENCES Users(Id)
        ON DELETE CASCADE,

    CONSTRAINT FK_PlayHistories_MediaItems
        FOREIGN KEY (MediaItemId) REFERENCES MediaItems(Id)
        ON DELETE NO ACTION
);
-- =============================================
-- 8. MediaShares
-- Lưu việc người dùng chia sẻ media cho nhau
-- =============================================
CREATE TABLE MediaShares (
    Id INT IDENTITY(1,1) PRIMARY KEY,

    SenderUserId INT NOT NULL,
    ReceiverUserId INT NOT NULL,
    MediaItemId INT NOT NULL,

    Message NVARCHAR(500) NULL,

    SharedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_MediaShares_Sender
        FOREIGN KEY (SenderUserId) REFERENCES Users(Id)
        ON DELETE NO ACTION,

    CONSTRAINT FK_MediaShares_Receiver
        FOREIGN KEY (ReceiverUserId) REFERENCES Users(Id)
        ON DELETE NO ACTION,

    CONSTRAINT FK_MediaShares_MediaItems
        FOREIGN KEY (MediaItemId) REFERENCES MediaItems(Id)
        ON DELETE NO ACTION
);

-- =============================================
-- 9. Notifications
-- Lưu thông báo của người dùng
-- =============================================
CREATE TABLE Notifications (
    Id INT IDENTITY(1,1) PRIMARY KEY,

    UserId INT NOT NULL,

    Title NVARCHAR(200) NOT NULL,
    Message NVARCHAR(1000) NOT NULL,

    NotificationType NVARCHAR(50) NOT NULL, -- Share, System, Follow...
    RelatedEntityId INT NULL,               -- Id liên quan, ví dụ MediaShareId hoặc MediaItemId

    IsRead BIT NOT NULL DEFAULT 0,

    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_Notifications_Users
        FOREIGN KEY (UserId) REFERENCES Users(Id)
        ON DELETE CASCADE
);

-- =============================================
-- 10. Follows
-- Lưu quan hệ theo dõi giữa người dùng với nhau
-- =============================================
CREATE TABLE Follows (
    Id INT IDENTITY(1,1) PRIMARY KEY,

    FollowerUserId INT NOT NULL,
    FollowingUserId INT NOT NULL,

    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_Follows_Follower
        FOREIGN KEY (FollowerUserId) REFERENCES Users(Id)
        ON DELETE NO ACTION,

    CONSTRAINT FK_Follows_Following
        FOREIGN KEY (FollowingUserId) REFERENCES Users(Id)
        ON DELETE NO ACTION,

    CONSTRAINT UQ_Follows_Follower_Following
        UNIQUE (FollowerUserId, FollowingUserId),

    CONSTRAINT CK_Follows_NotSelf
        CHECK (FollowerUserId <> FollowingUserId)
);