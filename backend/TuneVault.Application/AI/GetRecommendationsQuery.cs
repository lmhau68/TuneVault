using MediatR;

using TuneVault.Application.DTOs.AI;

namespace TuneVault.Application.AI;

public class GetRecommendationsQuery : IRequest<RecommendationDto>
{
    public int UserId { get; set; }

    public GetRecommendationsQuery(int userId)
    {
        UserId = userId;
    }
}