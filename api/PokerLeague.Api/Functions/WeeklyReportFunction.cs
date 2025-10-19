using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Azure.Storage.Blobs;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using PokerLeague.Api.Data;
using System.Text;

namespace PokerLeague.Api.Functions;

public class WeeklyReportFunction
{
    private readonly SqlRepository _repo;
    private readonly ILogger<WeeklyReportFunction> _logger;
    private readonly BlobServiceClient? _blobService;
    
    public WeeklyReportFunction(SqlRepository repo, ILogger<WeeklyReportFunction> logger)
    {
        _repo = repo;
        _logger = logger;
        
        try
        {
            var conn = Environment.GetEnvironmentVariable("AzureWebJobsStorage");
            if (!string.IsNullOrEmpty(conn) && conn != "UseDevelopmentStorage=true")
            {
                _blobService = new BlobServiceClient(conn);
            }
            else
            {
                _logger.LogWarning("Azure Storage not configured. Weekly report function will not store PDFs.");
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to initialize BlobServiceClient. Weekly report function will not store PDFs.");
        }
    }

    // Runs every Friday 06:00 UTC (~09:00 Israel when on IDT)
    [Function("WeeklyReportTimer")]
    public async Task RunTimer([TimerTrigger("0 0 6 * * 5")] TimerInfo timer)
    {
        // Default season 1 for MVP; can be configured via env later
        int seasonId = int.TryParse(Environment.GetEnvironmentVariable("DefaultSeasonId"), out var s) ? s : 1;
        await GenerateAndUploadPdf(seasonId);
    }

    [Function("WeeklyReportHttp")]
    public async Task<HttpResponseData> RunOnDemand([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "league/{seasonId:int}/report")] HttpRequestData req, int seasonId)
    {
        await GenerateAndUploadPdf(seasonId);
        var resp = req.CreateResponse(System.Net.HttpStatusCode.OK);
        await resp.WriteStringAsync("Report generated");
        return resp;
    }

    private async Task GenerateAndUploadPdf(int seasonId)
    {
        var standings = (await _repo.GetStandingsAsync(seasonId)).ToList();
        var bytes = BuildPdf(standings, seasonId);
        
        if (_blobService != null)
        {
            var container = _blobService.GetBlobContainerClient("reports");
            await container.CreateIfNotExistsAsync();
            var name = $"league_{seasonId}_weekly_{DateTime.UtcNow:yyyyMMdd}.pdf";
            await container.UploadBlobAsync(name, new BinaryData(bytes));
            _logger.LogInformation("Uploaded weekly report {Name}", name);
        }
        else
        {
            _logger.LogWarning("BlobServiceClient not available. PDF generated but not stored.");
        }
    }

    private byte[] BuildPdf(IEnumerable<dynamic> standings, int seasonId)
    {
        QuestPDF.Settings.License = LicenseType.Community;
        var now = DateTime.UtcNow;
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Margin(36);
                page.Header().Text($"דוח ליגה שבועי — Season #{seasonId}").SemiBold().FontSize(18);
                page.Content().Table(table =>
                {
                    table.ColumnsDefinition(cols =>
                    {
                        cols.RelativeColumn(1); // #
                        cols.RelativeColumn(6); // Name
                        cols.RelativeColumn(3); // Points
                    });
                    // header
                    table.Header(h =>
                    {
                        h.Cell().Element(CellHeader).Text("#");
                        h.Cell().Element(CellHeader).Text("שם");
                        h.Cell().Element(CellHeader).Text("נקודות");
                    });
                    int i = 1;
                    foreach (var row in standings)
                    {
                        string name = (string)(row.FullName ?? row.fullName);
                        int pts = (int)(row.TotalPoints ?? row.totalPoints);
                        table.Cell().Element(CellBody).Text(i.ToString());
                        table.Cell().Element(CellBody).Text(name);
                        table.Cell().Element(CellBody).Text(pts.ToString());
                        i++;
                    }

                    static IContainer CellHeader(IContainer c) => c.PaddingVertical(4).DefaultTextStyle(x => x.SemiBold());
                    static IContainer CellBody(IContainer c) => c.PaddingVertical(2).BorderBottom(1).BorderColor(Colors.Grey.Lighten2);
                });
                page.Footer().AlignRight().Text($"נוצר בתאריך {now:yyyy-MM-dd HH:mm} UTC");
            });
        }).GeneratePdf();
    }
}
