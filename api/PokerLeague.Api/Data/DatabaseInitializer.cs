using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging;
using System.Reflection;
using Dapper; // Add Dapper for ExecuteAsync and ExecuteScalarAsync extension methods

namespace PokerLeague.Api.Data;

/// <summary>
/// Database initialization helper - auto-creates database in development mode
/// </summary>
public static class DatabaseInitializer
{
    /// <summary>
    /// Ensures database exists and is initialized with schema and seed data
    /// </summary>
    public static async Task EnsureDatabaseAsync(string connectionString, ILogger logger)
    {
        try
        {
            var builder = new SqlConnectionStringBuilder(connectionString);
            var databaseName = builder.InitialCatalog;
            var masterConnectionString = new SqlConnectionStringBuilder(connectionString)
            {
                InitialCatalog = "master"
            }.ConnectionString;

            // Check if database exists
            using (var conn = new SqlConnection(masterConnectionString))
            {
                await conn.OpenAsync();
                var exists = await conn.ExecuteScalarAsync<int>(
                    "SELECT COUNT(*) FROM sys.databases WHERE name = @dbName",
                    new { dbName = databaseName });

                if (exists == 0)
                {
                    logger.LogWarning("Database '{DatabaseName}' does not exist. Creating...", databaseName);

                    // Create database
                    await conn.ExecuteAsync($"CREATE DATABASE [{databaseName}]");
                    logger.LogInformation("Database '{DatabaseName}' created successfully", databaseName);

                    // Run schema and seed scripts
                    await InitializeDatabaseAsync(connectionString, logger);
                }
                else
                {
                    logger.LogInformation("Database '{DatabaseName}' exists", databaseName);
                    
                    // Verify tables exist
                    using var dbConn = new SqlConnection(connectionString);
                    await dbConn.OpenAsync();
                    var tablesCount = await dbConn.ExecuteScalarAsync<int>(
                        "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'");
                    
                    if (tablesCount == 0)
                    {
                        logger.LogWarning("Database exists but has no tables. Initializing schema...");
                        await InitializeDatabaseAsync(connectionString, logger);
                    }
                    else
                    {
                        logger.LogInformation("Database has {TableCount} tables", tablesCount);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to ensure database exists");
            throw;
        }
    }

    private static async Task InitializeDatabaseAsync(string connectionString, ILogger logger)
    {
        try
        {
            // Get the project root directory (go up from bin/Debug/net8.0)
            var baseDir = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
            var projectRoot = Path.GetFullPath(Path.Combine(baseDir!, "..", "..", "..", "..", ".."));
            
            var schemaPath = Path.Combine(projectRoot, "sql", "001_schema.sql");
            var seedPath = Path.Combine(projectRoot, "sql", "002_seed.sql");

            if (!File.Exists(schemaPath))
            {
                logger.LogError("Schema file not found: {SchemaPath}", schemaPath);
                throw new FileNotFoundException($"Schema file not found: {schemaPath}");
            }

            if (!File.Exists(seedPath))
            {
                logger.LogError("Seed file not found: {SeedPath}", seedPath);
                throw new FileNotFoundException($"Seed file not found: {seedPath}");
            }

            logger.LogInformation("Running schema script: {SchemaPath}", schemaPath);
            await ExecuteSqlFileAsync(connectionString, schemaPath, logger);
            logger.LogInformation("Schema created successfully");

            logger.LogInformation("Running seed script: {SeedPath}", seedPath);
            await ExecuteSqlFileAsync(connectionString, seedPath, logger);
            logger.LogInformation("Seed data loaded successfully");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to initialize database");
            throw;
        }
    }

    private static async Task ExecuteSqlFileAsync(string connectionString, string filePath, ILogger logger)
    {
        var sql = await File.ReadAllTextAsync(filePath);
        
        // Split by GO statements (case-insensitive, handle various line endings)
        var batches = System.Text.RegularExpressions.Regex.Split(
            sql, 
            @"^\s*GO\s*$", 
            System.Text.RegularExpressions.RegexOptions.Multiline | System.Text.RegularExpressions.RegexOptions.IgnoreCase
        );

        using var conn = new SqlConnection(connectionString);
        await conn.OpenAsync();

        int batchNumber = 0;
        foreach (var batch in batches)
        {
            var trimmed = batch.Trim();
            if (string.IsNullOrWhiteSpace(trimmed) || trimmed.StartsWith("--"))
                continue;

            batchNumber++;
            try
            {
                logger.LogDebug("Executing batch {BatchNumber}", batchNumber);
                await conn.ExecuteAsync(trimmed, commandTimeout: 120);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to execute SQL batch {BatchNumber}: {Batch}", 
                    batchNumber,
                    trimmed.Length > 200 ? trimmed.Substring(0, 200) + "..." : trimmed);
                throw;
            }
        }
        
        logger.LogInformation("Executed {BatchCount} SQL batches successfully", batchNumber);
    }
}
