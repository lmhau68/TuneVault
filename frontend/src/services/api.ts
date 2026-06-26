import axios from 'axios';
import { type Song, type NotificationItem, type PlaylistModel, type MediaShareModel, type UserProfile } from '../types/media';

// Dùng dẫn tương đối để Vite Proxy xử lý ngầm qua cổng 5062
const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('tune_vault_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('tune_vault_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const LIBRARY_STORAGE_KEY = 'tune_vault_library';

const readLibraryFromStorage = (): Song[] => {
  const raw = localStorage.getItem(LIBRARY_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveLibraryToStorage = (items: Song[]) => {
  localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(items));
};

export const mediaService = {
  // --- AUTH & USER --
  login: async (credentials: any): Promise<{ isSuccess: boolean, token?: string, message: string, errorCode?: string }> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData: any): Promise<{ isSuccess: boolean, message: string, errorCode?: string }> => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },
  
  getProfile: async (): Promise<UserProfile> => {
    const token = localStorage.getItem('tune_vault_token');
    if (!token) throw new Error("Không tìm thấy token");

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] 
                  || payload['nameid'] 
                  || payload['sub'] 
                  || payload['id'];

      if (!userId) throw new Error("Không thể trích xuất ID từ Token");

      const response = await apiClient.get<UserProfile>(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy Profile:", error);
      throw error;
    }
  },

  updateProfile: async (data: { fullName?: string, bio?: string }): Promise<any> => {
    const response = await apiClient.put('/users/profile', data);
    return response.data;
  },

  getAllUsers: async (): Promise<any[]> => {
    const response = await apiClient.get<any[]>('/users');
    return response.data;
  },

  // --- MEDIA ITEM ---
  getSongs: async (): Promise<Song[]> => {
    const response = await apiClient.get<Song[]>('/media');
    return response.data;
  },
  getMediaById: async (id: number): Promise<Song | null> => {
    try {
      const resp = await apiClient.get(`/media/${id}`);
      return resp.data || null;
    } catch (err) { return null; }
  },
  getUserById: async (id: number): Promise<UserProfile | null> => {
    try {
      const resp = await apiClient.get(`/users/${id}`);
      return resp.data || null;
    } catch (err) { return null; }
  },
  uploadMedia: async (formData: FormData): Promise<any> => {
    const response = await apiClient.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  deleteMedia: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/media/${id}`);
    return response.data;
  },
  searchMedia: async (query: string): Promise<Song[]> => {
    const response = await apiClient.get(`/media/search?keyword=${encodeURIComponent(query)}`);
    return response.data || [];
  },

  // --- PLAYLIST ---
  getPlaylists: async (): Promise<PlaylistModel[]> => {
    const response = await apiClient.get<PlaylistModel[]>('/playlists/my');
    return response.data || [];
  },
  getPublicPlaylists: async (): Promise<PlaylistModel[]> => {
    const response = await apiClient.get<PlaylistModel[]>('/playlists/search?keyword=');
    return response.data || [];
  },
  createPlaylist: async (data: { name: string, description?: string, isPublic?: boolean }): Promise<PlaylistModel> => {
    const response = await apiClient.post('/playlists', { ...data, isPublic: data.isPublic ?? true });
    const respData = response.data || {};
    const playlistId = Number(respData?.playlistId ?? respData?.PlaylistId ?? respData?.id ?? respData?.Id ?? 0);

    return {
      id: playlistId,
      userId: Number(respData?.userId ?? respData?.UserId ?? 0),
      name: respData?.name ?? respData?.Name ?? data.name,
      description: respData?.description ?? respData?.Description ?? data.description,
      isPublic: respData?.isPublic ?? respData?.IsPublic ?? data.isPublic ?? true,
      createdAt: respData?.createdAt ?? respData?.CreatedAt ?? new Date().toISOString(),
      tracksCount: Number(respData?.tracksCount ?? respData?.TracksCount ?? 0)
    };
  },
  deletePlaylist: async (playlistId: number): Promise<any> => {
    const response = await apiClient.delete(`/playlists/${playlistId}`);
    return response.data;
  },
  getPlaylistTracks: async (playlistId: number): Promise<Song[]> => {
    const resp = await apiClient.get(`/playlists/${playlistId}`);
    const playlist = resp.data;
    const trackItems = playlist?.tracks || [];
    if (!Array.isArray(trackItems) || trackItems.length === 0) return [];

    const mediaPromises = trackItems.map((t: any) => {
      const mediaId = t?.mediaItemId ?? t?.MediaItemId ?? t?.MediaItemId;
      return apiClient.get(`/media/${mediaId}`)
        .then((r) => r.data)
        .catch(() => null);
    });

    const resolved = await Promise.all(mediaPromises);
    return resolved.filter((m) => m !== null);
  },
  addTrackToPlaylist: async (playlistId: number, mediaItemId: number): Promise<any> => {
    const payload = { MediaItemId: mediaItemId, Position: 0 };
    const response = await apiClient.post(`/playlists/${playlistId}/tracks`, payload);
    return response.data;
  },
  removeTrackFromPlaylist: async (playlistId: number, mediaItemId: number): Promise<any> => {
    const response = await apiClient.delete(`/playlists/${playlistId}/tracks/${mediaItemId}`);
    return response.data;
  },
  clearPlaylistTracks: async (playlistId: number): Promise<any> => {
    const resp = await apiClient.get(`/playlists/${playlistId}`);
    const playlist = resp.data;
    const trackItems = playlist?.tracks || [];
    const trackIds = trackItems
      .map((item: any) => item.mediaItemId || item.MediaItemId)
      .filter((id: any) => id !== null && id !== undefined);

    if (trackIds.length === 0) return { success: true };
    await Promise.all(trackIds.map((mediaItemId: number) => apiClient.delete(`/playlists/${playlistId}/tracks/${mediaItemId}`)));
    return { success: true };
  },

  // --- SHARING ---
  shareMedia: async (mediaId: number | null, receiverUserId: number, message?: string): Promise<any> => {
    const payload = {
      receiverUserId,
      mediaItemId: mediaId ?? null,
      playlistId: null,
      message: message || null
    };
    const response = await apiClient.post('/shares', payload);
    return response.data;
  },
  getSharedMedia: async (): Promise<MediaShareModel[]> => {
    const response = await apiClient.get<MediaShareModel[]>('/shares/with-me');
    return response.data || [];
  },

  // --- NOTIFICATIONS ---
  getNotifications: async (): Promise<NotificationItem[]> => {
    const response = await apiClient.get<NotificationItem[]>('/notifications');
    return response.data || [];
  },
  markNotificationAsRead: async (id: number): Promise<any> => {
    const response = await apiClient.put(`/notifications/${id}/read`);
    return response.data;
  },

  // --- INTERACTIONS (HISTORY, LIBRARY, FAVORITES, FOLLOWS) ---
  getHistory: async (): Promise<any[]> => {
    const response = await apiClient.get('/histories?limit=10');
    const items = response.data?.data || [];
    if (!Array.isArray(items)) return [];

    const historyPromises = items.map(async (item: any) => {
      if (item.type === 'playlist' || item.playlistId) return item;

      const mediaId = item.mediaItemId ?? item.MediaItemId;
      if (!mediaId) return item;

      try {
        const mediaResp = await apiClient.get(`/media/${mediaId}`);
        const m = mediaResp.data;
        return {
          historyId: item.id ?? item.Id,
          id: mediaId,
          title: m.title || item.title || item.Title || `Bài hát #${mediaId}`,
          artist: m.artist || item.artist || item.Artist || 'Unknown Artist',
          album: m.album || item.album || item.Album,
          genre: m.genre || item.genre || item.Genre,
          mediaType: m.mediaType || item.mediaType || item.MediaType || 'Audio',
          thumbnailPath: m.thumbnailPath || item.thumbnailPath || item.ThumbnailPath,
          durationInSeconds: m.durationInSeconds || item.durationInSeconds || item.DurationInSeconds,
          progressInSeconds: item.progressInSeconds ?? item.ProgressInSeconds,
          playedAt: item.playedAt ?? item.PlayedAt,
          type: 'media',
          original: item
        };
      } catch (err) {
        return {
          historyId: item.id ?? item.Id,
          id: mediaId,
          title: item.title ?? item.Title ?? `Bài hát #${mediaId}`,
          artist: item.artist ?? item.Artist ?? 'Unknown Artist',
          album: item.album ?? item.Album,
          genre: item.genre ?? item.Genre,
          mediaType: item.mediaType ?? item.MediaType ?? 'Audio',
          thumbnailPath: item.thumbnailPath ?? item.ThumbnailPath,
          playedAt: item.playedAt ?? item.PlayedAt,
          type: 'media',
          original: item
        };
      }
    });

    const resolved = await Promise.all(historyPromises);
    return resolved.filter(Boolean);
  },
  addHistoryItem: async (data: { mediaItemId: number, progressInSeconds?: number }): Promise<any> => {
    const response = await apiClient.post('/histories', data);
    try { window.dispatchEvent(new Event('tune_vault_history_updated')); } catch {}
    return response.data;
  },
  clearHistory: async (): Promise<any> => {
    const response = await apiClient.delete('/histories');
    return response.data;
  },
  deleteHistoryItem: async (_historyItemId: number): Promise<any> => {
    return Promise.reject(new Error('Backend hiện chỉ hỗ trợ xóa toàn bộ lịch sử chứ không hỗ trợ xóa từng mục.'));
  },
  getLibrarySongs: async (): Promise<Song[]> => {
    return readLibraryFromStorage();
  },
  toggleLibrary: async (mediaItemId: number): Promise<any> => {
    const currentLibrary = readLibraryFromStorage();
    const itemIndex = currentLibrary.findIndex((item) => item.id === mediaItemId);
    if (itemIndex >= 0) {
      currentLibrary.splice(itemIndex, 1);
    } else {
      try {
        const resp = await apiClient.get(`/media/${mediaItemId}`);
        const m = resp.data;
        currentLibrary.push({
          id: m.id,
          title: m.title || `Bài hát #${mediaItemId}`,
          description: m.description || m.album || m.genre || '',
          filePath: m.filePath || '',
          ownerUserId: m.ownerUserId || 0,
          createdAt: m.createdAt || new Date().toISOString(),
          mediaType: m.mediaType || 'Audio',
          thumbnailPath: m.thumbnailPath || '',
          durationInSeconds: m.durationInSeconds || 0,
          fileSizeInBytes: m.fileSizeInBytes || 0,
          artist: m.artist,
          album: m.album,
          genre: m.genre
        });
      } catch (err) {
        currentLibrary.push({
          id: mediaItemId,
          title: `Bài hát #${mediaItemId}`,
          description: '',
          filePath: '',
          ownerUserId: 0,
          createdAt: new Date().toISOString(),
          mediaType: 'Audio',
          thumbnailPath: '',
          durationInSeconds: 0,
          fileSizeInBytes: 0,
          artist: 'Unknown Artist',
          album: '',
          genre: ''
        });
      }
    }
    saveLibraryToStorage(currentLibrary);
    return { success: true, data: currentLibrary };
  },
  getFavorites: async (): Promise<Song[]> => {
    const response = await apiClient.get('/favorites?page=1&pageSize=50');
    const items = response.data?.data || [];
    if (!Array.isArray(items)) return [];
    return items.map((item: any) => ({
      id: item.mediaItemId,
      title: item.title,
      description: item.album || item.genre || '',
      filePath: '',
      ownerUserId: 0,
      createdAt: item.createdAt || new Date().toISOString(),
      artist: item.artist,
      genre: item.genre,
      album: item.album,
      mediaType: item.mediaType,
      thumbnailPath: item.thumbnailPath,
      durationInSeconds: item.durationInSeconds,
      fileSizeInBytes: undefined
    }));
  },
  toggleFavorite: async (mediaItemId: number): Promise<any> => {
    const response = await apiClient.post(`/favorites/${mediaItemId}`);
    return response.data;
  },
  getFollowedArtists: async (): Promise<number[]> => {
    const response = await apiClient.get('/follows/following');
    const items = response.data?.data || [];
    if (!Array.isArray(items)) return [];
    return items
      .map((item: any) => Number(item.userId || item.UserId))
      .filter((id: number) => !Number.isNaN(id));
  },
  toggleFollow: async (targetUserId: number): Promise<any> => {
    const response = await apiClient.post(`/follows/${targetUserId}`);
    return response.data;
  },
  getFollowers: async (): Promise<number[]> => {
    const response = await apiClient.get('/follows/followers');
    const items = response.data?.data || [];
    if (!Array.isArray(items)) return [];
    return items
      .map((item: any) => Number(item.userId || item.UserId))
      .filter((id: number) => !Number.isNaN(id));
  },

  // --- AI ---
  askAI: async (prompt: string, contextSongTitle?: string): Promise<{ reply: string }> => {
    const response = await apiClient.post('/ai/ask', { prompt, contextSongTitle });
    return response.data;
  }
};