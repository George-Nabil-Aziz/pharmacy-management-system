var builder = WebApplication.CreateBuilder(args);
builder.Services.AddProblemDetails();
builder.Services.AddHealthChecks();

var app = builder.Build();

// Unhandled exceptions become RFC 9457 problem responses without stack traces (API-DESIGN §5).
app.UseExceptionHandler();

app.MapHealthChecks("/health/live");

// Test-only endpoints exist solely in the "Testing" environment used by integration tests.
if (app.Environment.IsEnvironment("Testing"))
{
    app.MapGet("/test/throw", (Func<IResult>)(() => throw new InvalidOperationException("secret-internal-detail")));
}

app.Run();

// Required so WebApplicationFactory<Program> can reference the entry point from the integration tests.
public partial class Program;
