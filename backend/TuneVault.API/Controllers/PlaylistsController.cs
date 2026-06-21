using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.Services;
using TuneVault.Domain.Entities;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlaylistsController : ControllerBase
{
    private readonly PlaylistService _playlistService;

    public PlaylistsController(PlaylistService playlistService)
    {
        _playlistService = playlistService;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var playlist = await _playlistService.GetPlaylistByIdAsync(id);

        if (playlist == null)
            return NotFound();

        return Ok(playlist);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Playlist playlist)
    {
        var id = await _playlistService.CreatePlaylistAsync(playlist);

        return Ok(id);
    }

    [HttpPost("{id}/tracks")]
    public async Task<IActionResult> AddTrack(int id, PlaylistTrack track)
    {
        track.PlaylistId = id;

        await _playlistService.AddTrackAsync(track);

        return Ok();
    }

    [HttpDelete("{id}/tracks/{mediaId}")]
    public async Task<IActionResult> RemoveTrack(int id, int mediaId)
    {
        await _playlistService.RemoveTrackAsync(id, mediaId);

        return Ok();
    }
}