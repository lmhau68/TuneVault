using Dapper;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Repositories;

public class ShareRepository : IShareRepository
{
    // TODO: Viet SQL Dapper cho ShareRepository
    // Dùng IDbConnectionFactory de mo ket noi database
    private readonly IDbConnectionFactory _connFactory;
    public ShareRepository(IDbConnectionFactory connFactory)
    {
        _connFactory = connFactory;
    }
    public async Task<int> CreateAsync(MediaShare media)
    {
        string sql = @"
                INSERT INTO MediaShares (SenderUserId, ReceiverUserId, MediaItemId, Message, SharedAt)
                OUTPUT INSERTED.Id
                VALUES (@SenderUserId, @ReceiverUserId, @MediaItemId, @Message, @SharedAt);";

        using (var conn = _connFactory.CreateConnection())
        {
            int newId = await conn.QuerySingleAsync<int>(sql, media);
            return newId;
        }
    }
    public async Task<IEnumerable<SharedWithMeDto>> GetSharedWithMeAsync(int receiverId)
    {
        // Lấy danh sách chia sẻ với TÔI (Tôi là Receiver, Join với bảng User để lấy tên Sender)
        string sql = @"
            SELECT 
                s.Id AS ShareId, 
                s.MediaItemId AS MediaId, 
                m.FilePath AS MediaUrl, 
                s.SharedAt AS SharedAt,
                s.SenderUserId AS SenderId,
                s.Message AS Message,
                u.DisplayName AS SenderName
            FROM MediaShares s
            INNER JOIN Users u ON s.SenderUserId = u.Id
            INNER JOIN MediaItems m ON s.MediaItemId = m.Id
            WHERE s.ReceiverUserId = @ReceiverId
            ORDER BY s.SharedAt DESC;";
        using (var conn = _connFactory.CreateConnection())
        {
            return await conn.QueryAsync<SharedWithMeDto>(sql, new { ReceiverId = receiverId });
        }
        
    }
    public async Task<IEnumerable<SharedByMeDto>> GetSharedByMeAsync(int senderId)
    {
        // Lấy danh sách TÔI đã chia sẻ (Tôi là Sender, Join với bảng User để lấy tên Receiver)
        string sql = @"
            SELECT 
                s.Id AS ShareId, 
                s.MediaItemId AS MediaId, 
                m.FilePath AS MediaUrl, 
                s.SharedAt AS SharedAt,
                s.ReceiverUserId AS ReceiverId,
                s.Message AS Message, 
                u.DisplayName AS ReceiverName
            FROM MediaShares s
            INNER JOIN Users u ON s.ReceiverUserId = u.Id
            INNER JOIN MediaItems m ON s.MediaItemId = m.Id
            WHERE s.SenderUserId = @SenderId
            ORDER BY s.SharedAt DESC;";
        using (var conn = _connFactory.CreateConnection())
        {
            return await conn.QueryAsync<SharedByMeDto>(sql, new { SenderId = senderId });
        }
    }
    

}
