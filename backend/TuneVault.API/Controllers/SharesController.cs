using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.Interfaces;
using TuneVault.Application.Services;
using TuneVault.Domain.Entities;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SharesController : ControllerBase
{
    // TODO: Viet endpoint cho Shares
    private readonly ShareService _shareService;
    public SharesController(ShareService shareService)
    {
        _shareService= shareService;
    }


    [HttpGet("with-me")]
    public async Task<IActionResult> GetSharedWithMeAsync()
    {
        
        int currentUserId = 2;//tam sau nay xoa lay nguoi dung hien tai thong qua service

        var result = await _shareService.GetSharedWithMeAsync(currentUserId);
        return Ok(result);
    }

    [HttpGet("by-me")]
    public async Task<IActionResult> GetSharedByMeAsync()
    {
        
        int currentUserId = 1;//tam sau nay xoa lay nguoi dung hien tai thong qua service

        var result = await _shareService.GetSharedByMeAsync(currentUserId);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateAsync([FromBody] CreateShareRequest request)
    {
        int currentUserId = 1;//tam sau nay xoa lay nguoi dung hien tai thong qua service
        var response = await _shareService.ShareMediaAsync(currentUserId, request);
        return Ok(response);
    }

}
