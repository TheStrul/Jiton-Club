using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using PokerLeague.Api.Data;
using Dapper;
using System.Threading.Tasks;

// Register Dapper type handler for DateOnly
SqlMapper.AddTypeHandler(new DateOnlyTypeHandler());

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureServices((ctx, services) =>
    {
        var conn = Environment.GetEnvironmentVariable("SqlConnection") ?? 
                   ctx.Configuration.GetConnectionString("SqlConnection") ??
                   "Server=(localdb)\\MSSQLLocalDB;Database=PokerLeague;Trusted_Connection=True;TrustServerCertificate=True;";
        
        services.AddSingleton(new SqlRepository(conn));
        services.AddSingleton<LeagueService>();
        services.AddSingleton(new AuthService(conn));
        
        // Store connection string for database initialization
        services.AddSingleton(conn);
    })
    .Build();

// Auto-create database BEFORE starting the host
var logger = host.Services.GetRequiredService<ILoggerFactory>().CreateLogger("Startup");
var connectionString = host.Services.GetRequiredService<string>();

logger.LogInformation("===========================================");
logger.LogInformation("Poker League API - Development Mode");
logger.LogInformation("===========================================");
logger.LogInformation("Checking database...");

try
{
    await DatabaseInitializer.EnsureDatabaseAsync(connectionString, logger);
    logger.LogInformation("Database ready");
    logger.LogInformation("===========================================");
}
catch (Exception ex)
{
    logger.LogError(ex, "CRITICAL: Failed to initialize database. Application will start but API calls will fail.");
    logger.LogError("Please check:");
    logger.LogError("  1. SQL Server LocalDB is running");
    logger.LogError("  2. Files sql/001_schema.sql and sql/002_seed.sql exist");
    logger.LogError("  3. Connection string is correct");
    logger.LogInformation("===========================================");
}

logger.LogInformation("Starting Azure Functions host...");
await host.RunAsync();
