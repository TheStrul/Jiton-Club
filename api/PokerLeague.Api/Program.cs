using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using PokerLeague.Api.Data;
using Dapper;

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
    })
    .Build();

host.Run();
