public class SharedWithMeDto
{
    public int ShareId { get; set; }
    public int MediaId { get; set; }
    public int PlaylistId{ get; set; }
    public string? MediaUrl { get; set; } // Ví dụ có kèm thông tin Media
    public DateTime SharedAt { get; set; }

    public string? Message{ get; set; }

    // Cốt lõi ở đây: Trả về tên người GỬI thay vì chỉ có SenderId
    public int SenderId { get; set; }
    public string? SenderName { get; set; }
}