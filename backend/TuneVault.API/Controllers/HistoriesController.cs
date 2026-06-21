using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.Services;
using TuneVault.Domain.Entities;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HistoriesController : ControllerBase
{
    private readonly HistoryService _historyService;

    public HistoriesController(HistoryService historyService)
    {
        _historyService = historyService;
    }

    [HttpPost]
    public async Task<IActionResult> AddHistory(PlayHistory history)
    {
        await _historyService.AddHistoryAsync(history);
        return Ok();
    }

    [HttpGet("{userId}")]
    public async Task<IActionResult> GetHistory(int userId)
    {
        var result = await _historyService.GetHistoryByUserAsync(userId);
        return Ok(result);
    }
}