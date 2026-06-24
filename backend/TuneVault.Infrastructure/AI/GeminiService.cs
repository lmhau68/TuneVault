using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using TuneVault.Application.AI;

namespace TuneVault.Infrastructure.AI;

public class GeminiService : IGeminiService

{
    private readonly HttpClient _httpClient;
    private readonly GeminiOptions _options;
    public GeminiService(

        HttpClient httpClient,

        IOptions<GeminiOptions> options)

    {
        _httpClient = httpClient;

        _options = options.Value;
    }

    public async Task<string>
    CompleteAsync(
        string prompt)
    {
        var body = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new
                        {
                            text = prompt
                        }
                    }
                }
            }
        };
        var json = JsonSerializer.Serialize(body);

        var content = new StringContent(
            json,
            Encoding.UTF8,
            "application/json"
        );
        var url =
        $"{_options.BaseUrl}" +
        $"{_options.Model}" +
        ":generateContent" +
        $"?key={_options.ApiKey}";


        var response = await _httpClient.PostAsync(url, content);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            return error;
        }

        var result = await response.Content.ReadAsStringAsync();

        using JsonDocument doc = JsonDocument.Parse(result);

        return 
        doc.RootElement
        .GetProperty("candidates")[0]
        .GetProperty("content")
        .GetProperty("parts")[0]
        .GetProperty("text")
        .GetString()
        ?? "";
    }
}