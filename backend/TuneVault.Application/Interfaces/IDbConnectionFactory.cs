using System.Data;

namespace TuneVault.Application.Interfaces;

public interface IDbConnectionFactory
{
    IDbConnection CreateConnection();
}