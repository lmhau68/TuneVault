namespace TuneVault.Application.AI;

public interface IGeminiService
{
    Task<string> CompleteAsync(string prompt);
}