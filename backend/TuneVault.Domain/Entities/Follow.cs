namespace TuneVault.Domain.Entities;

public class Follow
{
    public int Id { get; set; }

    public int FollowerUserId { get; set; }

    public int FollowingUserId { get; set; }

    public DateTime CreatedAt { get; set; }
}