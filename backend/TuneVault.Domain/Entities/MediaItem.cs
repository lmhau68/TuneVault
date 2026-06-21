using System;

namespace TuneVault.Domain.Entities;

public class MediaItem
{
    // TODO: Map voi bang tuong ung trong database/schema.sql
    public class MediaItem
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string FileUrl { get; set; } // Đường dẫn lưu file local
        public int UploadedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        
        // Thêm 2 trường mới 
        public string? Artist { get; set; }
        public string? Genre { get; set; }
    }
}
