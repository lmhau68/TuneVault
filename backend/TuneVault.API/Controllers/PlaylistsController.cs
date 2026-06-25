using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.DTOs.Playlists;
using TuneVault.Application.Services;

namespace TuneVault.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PlaylistsController : ControllerBase
{
    private readonly PlaylistService _playlistService;

    public PlaylistsController(PlaylistService playlistService)
    {
        _playlistService = playlistService;
    }

    // Lấy userId từ JWT, dùng chung cho tất cả action
    private int GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(claim) || !int.TryParse(claim, out int id))
            throw new UnauthorizedAccessException("Token không hợp lệ.");
        return id;
    }

    // POST /api/playlists
    [HttpPost]
    public async Task<IActionResult> CreatePlaylist(
        [FromBody] CreatePlaylistRequest request)
    {
        var userId = GetUserId();
        var playlistId = await _playlistService.CreateAsync(userId, request);

        return Ok(new
        {
            Message = "Tạo playlist thành công.",
            PlaylistId = playlistId
        });
    }

    // GET /api/playlists/my
    [HttpGet("my")]
    public async Task<IActionResult> GetMyPlaylists()
    {
        var userId = GetUserId();
        var playlists = await _playlistService.GetByUserIdAsync(userId);
        return Ok(playlists);
    }

    // GET /api/playlists/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var playlist = await _playlistService.GetByIdAsync(id);
        if (playlist == null)
            return NotFound(new { Message = "Không tìm thấy playlist." });

        return Ok(playlist);
    }

    // POST /api/playlists/{id}/tracks
    [HttpPost("{id}/tracks")]
    public async Task<IActionResult> AddTrack(
        int id, [FromBody] AddTrackRequest request)
    {
        var userId = GetUserId();
        var (success, message) = await _playlistService.AddTrackAsync(id, userId, request);

        if (!success)
            return BadRequest(new { Message = message });

        return Ok(new { Message = message });
    }

    // DELETE /api/playlists/{id}/tracks/{mediaItemId}
    [HttpDelete("{id}/tracks/{mediaItemId}")]
    public async Task<IActionResult> RemoveTrack(int id, int mediaItemId)
    {
        var userId = GetUserId();
        var (success, message) = await _playlistService
            .RemoveTrackAsync(id, mediaItemId, userId);

        if (!success)
            return BadRequest(new { Message = message });

        return Ok(new { Message = message });
    }

    // DELETE /api/playlists/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePlaylist(int id)
    {
        var userId = GetUserId();
        var (success, message) = await _playlistService.DeleteAsync(id, userId);

        if (!success)
            return BadRequest(new { Message = message });

        return Ok(new { Message = message });
    }
    // GET /api/playlists/search?keyword=lofi
    [HttpGet("search")]
    [AllowAnonymous] 
    public async Task<IActionResult> Search([FromQuery] string keyword)
    {
        var result = await _playlistService.SearchPlaylistsAsync(keyword);
        return Ok(result);
    }
}