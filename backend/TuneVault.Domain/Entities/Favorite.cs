namespace TuneVault.Domain.Entities;

public class Favorite
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int MediaItemId { get; set; }

    public DateTime CreatedAt { get; set; }
}
