// Đồng bộ chính xác với MediaResponse.cs từ SSMS/Backend
export interface Song {
  id: number;
  title: string;
  description?: string; 
  filePath: string;
  ownerUserId: number;
  createdAt: string;
  artist?: string;
  genre?: string;
  album?: string; 
  mediaType?: 'Audio' | 'Video'; 
  thumbnailPath?: string;
  durationInSeconds?: number;
  fileSizeInBytes?: number;
}

// Đồng bộ với UserResponseDTO.cs
export interface UserProfile {
  id: number;
  username?: string;
  email?: string;
  fullName?: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  avatarPath?: string;
}

// Đồng bộ với NotificationDTO.cs
export interface NotificationItem {
  id: number;
  userId: number;
  title?: string;
  message?: string;
  notificationType?: string;
  relatedId: number;
  isRead: boolean;
  createdAt: string;
}

// Đồng bộ với Playlist Model
export interface PlaylistModel {
  id: number;
  userId: number;
  name: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  tracksCount?: number; 
}

// Đồng bộ CHÍNH XÁC với ShareWithMeDTO.cs
export interface MediaShareModel {
  shareId: number;
  mediaId: number;
  playlistId: number;
  mediaUrl?: string;
  senderId: number;
  senderName?: string;
  receiverId: number;
  message?: string;
  sharedAt: string;
}