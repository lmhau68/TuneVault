import { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { mediaService } from '../services/api';
import { type Song, type PlaylistModel } from '../types/media';
import { PlayerContext } from '../App';

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { handleSelectMedia, setSelectedPlaylist } = useContext(PlayerContext) || {};
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setSongs([]);
      setPlaylists([]);
      return;
    }

    setIsLoading(true);
    Promise.all([
      mediaService.searchMedia(query).catch(() => []),
      mediaService.getPlaylists().catch(() => [])
    ]).then(([searchedSongs, allPlaylists]) => {
      setSongs(searchedSongs || []);
      const lowerQuery = query.toLowerCase();
      const filteredPlaylists = (allPlaylists || []).filter(p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description?.toLowerCase().includes(lowerQuery)
      );
      setPlaylists(filteredPlaylists);
    }).finally(() => {
      setIsLoading(false);
    });
  }, [query]);

  const audioResults = songs.filter(s => s.mediaType === 'Audio');
  const videoResults = songs.filter(s => s.mediaType === 'Video');

  const renderSongCard = (song: Song) => (
    <div
      key={song.id}
      onClick={() => handleSelectMedia && handleSelectMedia(song)}
      className="bg-[#181818] hover:bg-[#282828] p-3 rounded-xl cursor-pointer transition-colors group"
    >
      <div className="relative mb-3 aspect-square bg-zinc-800 rounded-md overflow-hidden shadow-lg">
        {song.mediaType === 'Video' ? (
          <div className="w-full h-full flex items-center justify-center text-3xl">🎬</div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-zinc-700 to-zinc-900">🎵</div>
        )}
      </div>
      <h3 className="text-white font-bold text-[13px] truncate">{song.title}</h3>
      <p className="text-zinc-400 text-[11px] mt-1 truncate">
        {song.mediaType === 'Audio' ? 'Bài hát' : 'Video'}
      </p>
    </div>
  );

  const renderPlaylistCard = (playlist: PlaylistModel) => (
    <div
      key={playlist.id}
      onClick={() => {
        if (setSelectedPlaylist) setSelectedPlaylist(playlist);
        navigate('/playlist');
      }}
      className="bg-[#181818] hover:bg-[#282828] p-3 rounded-xl cursor-pointer transition-colors group"
    >
      <div className="relative mb-3 aspect-square bg-zinc-800 rounded-md overflow-hidden shadow-lg">
        <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-emerald-700 to-emerald-900">🎶</div>
      </div>
      <h3 className="text-white font-bold text-[13px] truncate">{playlist.name}</h3>
      <p className="text-zinc-400 text-[11px] mt-1 truncate">
        Playlist • {playlist.tracksCount ?? 0} bài
      </p>
    </div>
  );

  return (
    <div className="animate-fade-in p-6 min-h-full pb-24">
      {query && (
        <div className="mb-8">
          <h2 className="text-2xl font-black text-white">
            Kết quả tìm kiếm cho "{query}"
          </h2>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 p-12 text-sm text-zinc-400">
          <svg className="animate-spin h-5 w-5 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Đang quét hệ thống...
        </div>
      ) : (!query.trim() || (audioResults.length === 0 && videoResults.length === 0 && playlists.length === 0)) ? (
        <div className="text-center text-zinc-500 text-sm mt-16 flex flex-col items-center">
          <span className="text-6xl mb-4">🔍</span>
          <p>
            {!query.trim() 
              ? "Hãy nhập từ khóa vào thanh tìm kiếm ở Header để bắt đầu."
              : `Không tìm thấy Bài hát, Video hay Playlist nào khớp với "${query}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {audioResults.length > 0 && (
            <section>
              <h3 className="text-xl font-bold text-white mb-4 hover:underline cursor-pointer">Bài hát</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 sm:gap-5">
                {audioResults.map(renderSongCard)}
              </div>
            </section>
          )}

          {videoResults.length > 0 && (
            <section>
              <h3 className="text-xl font-bold text-white mb-4 hover:underline cursor-pointer">Video</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 sm:gap-5">
                {videoResults.map(renderSongCard)}
              </div>
            </section>
          )}

          {playlists.length > 0 && (
            <section>
              <h3 className="text-xl font-bold text-white mb-4 hover:underline cursor-pointer">Danh sách phát</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 sm:gap-5">
                {playlists.map(renderPlaylistCard)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}