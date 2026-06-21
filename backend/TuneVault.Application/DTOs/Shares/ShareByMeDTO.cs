public class SharedByMeDto
{
    public int ShareId { get; set; }
    public int MediaId { get; set; }
    public int PlaylistId{ get; set; }
    public string? MediaUrl { get; set; }
    public DateTime SharedAt { get; set; }

    public string? Message{ get; set; }
    // Cốt lõi ở đây: Trả về tên người NHẬN
    public int ReceiverId { get; set; }
    public string? ReceiverName { get; set; }
}