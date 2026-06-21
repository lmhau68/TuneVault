using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.Services;
using TuneVault.Domain.Entities;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FavoritesController : ControllerBase
{
    private readonly FavoriteService _favoriteService;

    public FavoritesController(FavoriteService favoriteService)
    {
        _favoriteService = favoriteService;
    }

    [HttpPost]
    public async Task<IActionResult> AddFavorite(Favorite favorite)
    {
        await _favoriteService.AddFavoriteAsync(favorite);
        return Ok();
    }

    [HttpDelete]
    public async Task<IActionResult> RemoveFavorite(int userId, int mediaItemId)
    {
        await _favoriteService.RemoveFavoriteAsync(userId, mediaItemId);
        return Ok();
    }

    [HttpGet("{userId}")]
    public async Task<IActionResult> GetFavorites(int userId)
    {
        var result = await _favoriteService.GetFavoritesByUserAsync(userId);
        return Ok(result);
    }
}