using TuneVault.Application.Interfaces;

namespace TuneVault.Infrastructure.Repositories;

public class MediaRepository : IMediaRepository
{
    // TODO: Viet SQL Dapper cho MediaRepository
<<<<<<< HEAD
    // D�ng IDbConnectionFactory de mo ket noi database
    private readonly IDbConnectionFactory _connectionFactory;

        // Dùng Dependency Injection để gọi Connection Factory của Leader
        public MediaRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<int> CreateAsync(MediaItem media)
        {
            var query = @"
                INSERT INTO MediaItems
                (
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
                    FileSizeInBytes,
                    CreatedAt
                )
                VALUES
                (
                    @OwnerUserId,
                    @Title,
                    @Artist,
                    @Genre,
                    @Album,
                    @Description,
                    @MediaType,
                    @FilePath,
                    @ThumbnailPath,
                    @DurationInSeconds,
                    @FileSizeInBytes,
                    GETDATE()
                );

                SELECT CAST(SCOPE_IDENTITY() as int);
            ";

            using var connection = _connectionFactory.CreateConnection();

            return await connection.QuerySingleAsync<int>(query, media);
        }

        public async Task<IEnumerable<MediaItem>> GetAllAsync()
        {
            var query = "SELECT * FROM MediaItems ORDER BY CreatedAt DESC";
            using var connection = _connectionFactory.CreateConnection();
            return await connection.QueryAsync<MediaItem>(query);
        }

        public async Task<MediaItem?> GetByIdAsync(int id)
        {
            var query = "SELECT * FROM MediaItems WHERE Id = @Id";
            using var connection = _connectionFactory.CreateConnection();
            return await connection.QuerySingleOrDefaultAsync<MediaItem>(query, new { Id = id });
        }

        public async Task<IEnumerable<MediaItem>> SearchAsync(string keyword)
        {
            var query = "SELECT * FROM MediaItems WHERE Title LIKE @Keyword OR Artist LIKE @Keyword";
            using var connection = _connectionFactory.CreateConnection();
            return await connection.QueryAsync<MediaItem>(query, new { Keyword = $"%{keyword}%" });
        }
}
=======
    // D�ng IDbConnectionFactory de mo ket noi database
}
>>>>>>> main
